import { withAuth } from 'next-auth/middleware'
import { AUTH_SECRET } from '@/lib/auth-secret'

/** Toutes les pages sont protégées, sauf /login et les ressources techniques */
export default withAuth({ secret: AUTH_SECRET, pages: { signIn: '/login' } })

export const config = {
  matcher: ['/((?!login|api/auth|flash-backend|_next/static|_next/image|favicon.ico|icon.png|logo.png).*)']
}
