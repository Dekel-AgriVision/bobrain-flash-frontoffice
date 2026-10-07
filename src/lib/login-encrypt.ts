import { rsaOaepEncrypt } from './rsa-oaep'

/**
 * Chiffre l'identifiant ET le mot de passe (RSA-OAEP SHA-256) avec la clé publique du serveur Next.
 * Web Crypto si disponible (HTTPS / localhost), sinon implémentation JavaScript (HTTP sur une IP).
 */
const b64ToBytes = (b64: string) => Uint8Array.from(atob(b64), c => c.charCodeAt(0))
const bytesToB64 = (bytes: Uint8Array) => {
  let s = ''
  bytes.forEach(b => (s += String.fromCharCode(b)))

  return btoa(s)
}

const randomNonce = () => {
  const a = new Uint8Array(16)
  crypto.getRandomValues(a)

  return Array.from(a, b => b.toString(16).padStart(2, '0')).join('')
}

export async function encryptCredentials(username: string, password: string): Promise<string> {
  const res = await fetch('/api/auth/login-key', { cache: 'no-store' })
  if (!res.ok) throw new Error('Impossible de sécuriser la connexion')
  const { key } = (await res.json()) as { key: string }
  const message = new TextEncoder().encode(JSON.stringify({ u: username, p: password, t: Date.now(), n: randomNonce() }))
  const der = b64ToBytes(key)

  if (globalThis.crypto?.subtle) {
    const publicKey = await crypto.subtle.importKey('spki', der, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt'])

    return bytesToB64(new Uint8Array(await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, message)))
  }

  return bytesToB64(rsaOaepEncrypt(der, message))
}
