import { NextResponse } from 'next/server'
import { getLoginPublicKey } from '@/lib/login-crypto'

export const dynamic = 'force-dynamic'

/** Clé publique RSA utilisée par le formulaire de connexion pour chiffrer le mot de passe */
export function GET() {
  return NextResponse.json({ key: getLoginPublicKey(), alg: 'RSA-OAEP-256' }, { headers: { 'Cache-Control': 'no-store' } })
}
