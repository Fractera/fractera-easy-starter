import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  sendWelcomeEmail,
  sendDomainActivatedEmail,
  sendInstallStartedEmail,
  sendInstallProgressEmail,
  sendDeployFailedEmail,
  sendRecoveryTokenEmail,
  sendQueuedEmail,
  sendExpiryWarningEmail,
  sendCertExpiryWarningEmail,
  sendCompanyBrainInquiryEmail,
  sendPartnerWelcomeEmail,
} from '@/lib/email'

const SAMPLE_SUBDOMAIN = 'happy-elk-42.fractera.ai'
const SAMPLE_DOMAIN = 'aifa.dev'
const SAMPLE_TOKEN = 'cmphj5xtp0004l8049ut8i4j4-demo'
const SAMPLE_IP = '109.199.105.213'
const SAMPLE_PASSWORD = 'demo-pass-Julia711'
const SAMPLE_SLUG = 'happy-elk-42'

type TemplateKey =
  | 'welcome'
  | 'welcome_ip'
  | 'domain_activated'
  | 'install_started'
  | 'install_progress'
  | 'recovery_token'
  | 'deploy_failed'
  | 'queued'
  | 'expiry_warning'
  | 'cert_expiry'
  | 'company_brain_inquiry'
  | 'partner_welcome'

async function dispatch(template: TemplateKey, to: string) {
  switch (template) {
    case 'welcome':
      return sendWelcomeEmail(to, SAMPLE_SUBDOMAIN, { ip: SAMPLE_IP, password: SAMPLE_PASSWORD })
    case 'welcome_ip':
      // IP-mode rendering: subdomain="ip-<IP>" triggers the autonomy block,
      // HTTP browser note, and IP:port links.
      return sendWelcomeEmail(to, `ip-${SAMPLE_IP}`, { ip: SAMPLE_IP, password: SAMPLE_PASSWORD })
    case 'domain_activated':
      // Sent after the Personal Domain wizard step 4 succeeds — same look as
      // welcome_ip but URLs are https://<host>.<domain>.
      return sendDomainActivatedEmail(to, SAMPLE_DOMAIN)
    case 'install_started':
      return sendInstallStartedEmail(to)
    case 'install_progress':
      return sendInstallProgressEmail(to)
    case 'recovery_token':
      return sendRecoveryTokenEmail(to, SAMPLE_TOKEN)
    case 'deploy_failed':
      return sendDeployFailedEmail(to, 'SSH connect failed: timeout connecting to 109.199.105.213:22', SAMPLE_TOKEN)
    case 'queued':
      return sendQueuedEmail(to)
    case 'expiry_warning':
      return sendExpiryWarningEmail(to, 7, SAMPLE_SUBDOMAIN)
    case 'cert_expiry':
      // TLS cert about to lapse (Secure mode). Sent by the daily cert-relay
      // when daysLeft <= 14. Same look as domain_activated + Sponsor/Star CTAs.
      return sendCertExpiryWarningEmail(to, 7, SAMPLE_DOMAIN)
    case 'partner_welcome':
      // Sent when a user registers as a partner — partner ID/slug, partner page
      // URL, widget iframe snippet, and affiliate-program guidance.
      return sendPartnerWelcomeEmail(to, SAMPLE_SLUG)
    case 'company_brain_inquiry':
      return sendCompanyBrainInquiryEmail({
        email: to,
        name: 'Sample Customer',
        company: 'Acme Inc.',
        area: 'Manufacturing',
        country: 'Germany',
        companyDoes: 'B2B precision tooling for the automotive industry.',
        aiTask: 'Automate quote drafts for enquiries that come in via email.',
        telegram: '@acme_ceo',
        lang: 'en',
      })
    default:
      throw new Error('unknown template')
  }
}

async function adminGuard() {
  const session = await auth()
  if (session?.user?.email !== 'admin@fractera.ai') {
    return null
  }
  return session
}

// GET — keep the original one-shot URL for quick browser preview.
export async function GET(req: NextRequest) {
  if (!await adminGuard()) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const to = req.nextUrl.searchParams.get('email')?.trim()
  const template = (req.nextUrl.searchParams.get('template') ?? 'welcome') as TemplateKey
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 })
  }
  try {
    await dispatch(template, to)
    return NextResponse.json({ ok: true, sent: to, template })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}

// POST — used by the admin /admin/tools Email-preview buttons.
export async function POST(req: NextRequest) {
  if (!await adminGuard()) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const body = await req.json().catch(() => ({})) as { email?: string; template?: TemplateKey }
  const to = (body.email ?? '').trim()
  const template = (body.template ?? 'welcome') as TemplateKey
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 })
  }
  try {
    await dispatch(template, to)
    return NextResponse.json({ ok: true, sent: to, template })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
