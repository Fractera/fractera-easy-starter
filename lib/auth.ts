import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Resend from 'next-auth/providers/resend'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from '@/lib/db'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  debug: true,
  trustHost: true,
  logger: {
    error(error) {
      console.error('[auth][logger][error]', error.name, error.message, JSON.stringify(error, null, 2))
    },
    warn(code) {
      console.warn('[auth][logger][warn]', code)
    },
    debug(message, metadata) {
      console.log('[auth][logger][debug]', message, JSON.stringify(metadata, null, 2))
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: process.env.AUTH_RESEND_FROM ?? 'noreply@fractera.ai',
    }),
  ],
  pages: {
    signIn: '/',
    error: '/',
  },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id
      return session
    },
  },
})
