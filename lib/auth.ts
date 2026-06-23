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
    // Allow post-auth redirects to any fractera.ai host (main domain + www).
    // The default NextAuth redirect callback only permits same-origin, which
    // would drop a cross-host callbackUrl back to baseUrl.
    async redirect({ url, baseUrl }) {
      try {
        const target = new URL(url, baseUrl)
        if (target.hostname === 'fractera.ai' || target.hostname.endsWith('.fractera.ai')) {
          return target.toString()
        }
      } catch {
        // fall through
      }
      return baseUrl
    },
    async session({ session, user }) {
      session.user.id = user.id
      // Surface partner.slug on the session so the user dropdown can show
      // the "Partner cabinet" entry without an extra round-trip per page.
      try {
        const partner = await db.partner.findUnique({
          where: { userId: user.id },
          select: { slug: true },
        })
        session.user.partnerSlug = partner?.slug ?? null
      } catch (err) {
        console.error('[auth][session] partner lookup failed', err)
        session.user.partnerSlug = null
      }
      return session
    },
  },
  events: {
    // Link any pending EmbedSession with this email to the user that just
    // verified the magic link. If the EmbedSession was created with a
    // partnerId, also stamp the user's referredByPartnerId — this is the
    // attribution moment for the widget flow.
    async signIn({ user }) {
      if (!user?.id || !user.email) return
      try {
        const email = user.email.toLowerCase()
        const pending = await db.embedSession.findMany({
          where: { email, status: 'pending' },
          select: { id: true, partnerId: true },
        })
        if (pending.length === 0) return

        await db.embedSession.updateMany({
          where: { email, status: 'pending' },
          data: { status: 'activated', userId: user.id },
        })

        const partnerId = pending.find(p => p.partnerId)?.partnerId
        if (partnerId) {
          const u = await db.user.findUnique({
            where: { id: user.id },
            select: { referredByPartnerId: true },
          })
          if (u && !u.referredByPartnerId) {
            await db.user.update({
              where: { id: user.id },
              data: { referredByPartnerId: partnerId },
            })
          }
        }
      } catch (err) {
        console.error('[auth][events.signIn] embed-session linking failed', err)
      }
    },
  },
})
