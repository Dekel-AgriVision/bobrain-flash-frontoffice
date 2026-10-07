import { constants, generateKeyPairSync, privateDecrypt, randomUUID, type KeyObject } from 'node:crypto'

/**
 * Chiffrement du mot de passe de connexion (RSA-OAEP SHA-256).
 *
 * - Une paire de clés est générée au démarrage du serveur Next (jamais exposée côté navigateur).
 * - Le navigateur récupère la clé publique (GET /api/auth/login-key) et chiffre
 *   { u: identifiant, p: motDePasse, t: horodatage, n: nonce } avant l'envoi à next-auth.
 * - Seul le serveur Next peut déchiffrer ; ni l'identifiant ni le mot de passe n'apparaissent
 *   en clair dans la requête (onglet Réseau, proxy, journaux).
 * - Un message n'est valable que 2 minutes et une seule fois (anti-rejeu).
 *
 * ⚠ Ne remplace pas HTTPS en production.
 */

type KeyStore = { publicKeyB64: string; privateKey: KeyObject; used: Map<string, number> }

const g = globalThis as unknown as { __loginKeyStore?: KeyStore }

const store = (): KeyStore => {
  if (!g.__loginKeyStore) {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
    g.__loginKeyStore = {
      publicKeyB64: publicKey.export({ type: 'spki', format: 'der' }).toString('base64'),
      privateKey,
      used: new Map()
    }
  }

  return g.__loginKeyStore
}

const MAX_AGE_MS = 2 * 60 * 1000

export const getLoginPublicKey = () => store().publicKeyB64

/** Déchiffre l'identifiant et le mot de passe envoyés par le formulaire de connexion */
export function decryptLoginSecret(cipherB64: string): { username: string; password: string } {
  const s = store()
  let payload: { u?: string; p?: string; t?: number; n?: string }
  try {
    const plain = privateDecrypt({ key: s.privateKey, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }, Buffer.from(cipherB64, 'base64'))
    payload = JSON.parse(plain.toString('utf8'))
  } catch {
    throw new Error('Session de connexion expirée, rechargez la page et réessayez')
  }

  const now = Date.now()
  if (!payload?.u || !payload?.p || !payload.t || !payload.n || Math.abs(now - payload.t) > MAX_AGE_MS) {
    throw new Error('Session de connexion expirée, rechargez la page et réessayez')
  }

  // Anti-rejeu : un nonce ne sert qu'une fois
  for (const [n, exp] of s.used) if (exp < now) s.used.delete(n)
  if (s.used.has(payload.n)) throw new Error('Requête de connexion déjà utilisée')
  s.used.set(payload.n, now + MAX_AGE_MS)

  return { username: payload.u, password: payload.p }
}

export const newNonce = () => randomUUID()
