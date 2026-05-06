import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Resend from 'next-auth/providers/resend'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { Resend as ResendClient } from 'resend'
import { db } from '@/lib/db'

const FROM = process.env.AUTH_RESEND_FROM ?? 'noreply@fractera.ai'

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
      from: FROM,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        const client = new ResendClient(process.env.RESEND_API_KEY!)
        await client.emails.send({
          from: FROM,
          to: email,
          subject: 'Sign in to Fractera',
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
              <h2 style="margin:0 0 16px;font-size:20px">Sign in to Fractera</h2>
              <p style="margin:0 0 24px;color:#555">Click the button below to sign in. This link expires in 24 hours.</p>
              <a href="${url}" style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px">Sign in →</a>
              <p style="margin:24px 0 0;color:#999;font-size:12px">If you did not request this email you can safely ignore it.</p>
            </div>
          `,
        })
      },
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
