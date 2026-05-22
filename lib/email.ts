import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.AUTH_RESEND_FROM ?? 'noreply@fractera.ai'

const PIPELINE_SERVICES = [
  { name: 'Shell',  description: 'Your main application',       portHint: 'fractera-app' },
  { name: 'Auth',   description: 'Login & user management',     portHint: 'fractera-auth' },
  { name: 'Admin',  description: 'AI coding workspace',         portHint: 'fractera-admin' },
  { name: 'Bridge', description: 'AI platform terminals (×5)', portHint: 'fractera-bridge' },
  { name: 'Data',   description: 'File & media storage',        portHint: 'fractera-data' },
]

const AI_PLATFORMS = [
  'Claude Code',
  'Codex',
  'Gemini CLI',
  'Qwen Code',
  'Kimi Code',
]

function serviceListHtml(services: typeof PIPELINE_SERVICES) {
  return services
    .map(s => `<li style="margin:4px 0"><strong>${s.name}</strong> — ${s.description} <span style="color:#888;font-size:11px">(${s.portHint})</span></li>`)
    .join('\n')
}

export async function sendServerProvisionedEmail(to: string, ip: string, password: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Your Fractera server is created — IP and access details',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 12px">Your server is ready</h2>
        <p style="margin:0 0 16px">Your dedicated VPS has been created. Fractera is now being installed automatically — you'll receive a second email with your workspace URL when it's done (~15 min).</p>

        <p style="margin:0 0 6px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px">Server credentials</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">
          <tr><td style="padding:6px 0;color:#666;width:100px">IP address</td><td style="padding:6px 8px;font-weight:600">${ip}</td></tr>
          <tr><td style="padding:6px 0;color:#666">User</td><td style="padding:6px 8px;font-weight:600">root</td></tr>
          <tr><td style="padding:6px 0;color:#666">Password</td><td style="padding:6px 8px;font-weight:600;font-family:monospace">${password}</td></tr>
        </table>

        <p style="margin:0 0 8px;font-size:13px;color:#666">SSH access: <code style="background:#f4f4f4;padding:2px 6px;border-radius:3px">ssh root@${ip}</code></p>
        <p style="margin:0;font-size:12px;color:#999">You can use these credentials to upgrade your server plan directly on Contabo if needed.</p>
      </div>
    `,
  })
}

export async function sendWelcomeEmail(
  to: string,
  subdomain: string,
  credentials?: { ip: string; password: string }
) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Your Fractera server is ready',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 12px">Your server is live!</h2>
        <p style="margin:0 0 16px">Your Fractera coding environment is fully deployed. All 7 services are running.</p>

        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px;margin:0 0 20px">
          <p style="margin:0 0 6px;font-size:11px;color:#1e40af;text-transform:uppercase;letter-spacing:1px;font-weight:600">Your account & server history</p>
          <p style="margin:0;font-size:13px;color:#444;line-height:1.5">
            All your servers are listed in your dashboard at
            <a href="https://fractera.ai" style="color:#6c47ff;font-weight:600">fractera.ai</a>
            — sign in with <strong>${to}</strong>.
          </p>
        </div>

        <p style="margin:0 0 6px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px">AI Platforms (5 tools)</p>
        <ul style="margin:0 0 16px;padding-left:20px;line-height:1.8">
          ${AI_PLATFORMS.map(p => `<li style="margin:4px 0">${p}</li>`).join('\n')}
        </ul>

        <p style="margin:0 0 6px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px">Your URLs</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:8px">
          <tr><td style="padding:5px 0;color:#666;width:120px">App</td><td><a href="https://${subdomain}" style="color:#6c47ff;font-weight:600">https://${subdomain}</a></td></tr>
          <tr><td style="padding:5px 0;color:#666">Workspace</td><td><a href="https://admin.${subdomain}" style="color:#6c47ff;font-weight:600">https://admin.${subdomain}</a></td></tr>
          <tr><td style="padding:5px 0;color:#666">File storage</td><td style="font-size:13px;color:#555;font-family:monospace">data.${subdomain}</td></tr>
        </table>

        <div style="background:#f7f4ff;border:1px solid #e0d5ff;border-radius:10px;padding:16px;margin:20px 0">
          <p style="margin:0 0 6px;font-size:11px;color:#7c5cd1;text-transform:uppercase;letter-spacing:1px;font-weight:600">Company Brain</p>
          <p style="margin:0 0 10px;font-size:13px;color:#444;line-height:1.5">Your AI knowledge base is running. Feed it documentation, query it from the workspace.</p>
          <a href="https://lightrag.${subdomain}/webui/" style="color:#6c47ff;font-weight:600;font-size:13px">https://lightrag.${subdomain}/webui/</a>
        </div>

        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin:20px 0">
          <p style="margin:0 0 6px;font-size:11px;color:#16a34a;text-transform:uppercase;letter-spacing:1px;font-weight:600">Hermes Orchestration Agent</p>
          <p style="margin:0 0 10px;font-size:13px;color:#444;line-height:1.5">Your AI orchestration layer is running. Delegate complex multi-step tasks across all 5 platforms from one place.</p>
          <a href="https://hermes.${subdomain}" style="color:#16a34a;font-weight:600;font-size:13px">https://hermes.${subdomain}</a>
        </div>

        ${credentials ? `
        <p style="margin:0 0 6px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px">SSH credentials</p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:12px">
          <tr><td style="padding:5px 0;color:#666;width:80px">IP</td><td style="font-weight:600;font-family:monospace">${credentials.ip}</td></tr>
          <tr><td style="padding:5px 0;color:#666">Login</td><td style="font-weight:600;font-family:monospace">root</td></tr>
          <tr><td style="padding:5px 0;color:#666">Password</td><td style="font-weight:600;font-family:monospace">${credentials.password}</td></tr>
        </table>
        <p style="margin:0;font-size:12px;color:#888;line-height:1.6">
          You have full root access to your VPS. Use these credentials to connect via SSH,
          install additional software, or integrate third-party services — entirely at your
          own discretion and responsibility. Fractera manages only its own pipeline services
          and does not control anything else on the server.
        </p>
        ` : ''}
      </div>
    `,
  })
}

export async function sendExpiryWarningEmail(to: string, daysLeft: number, subdomain: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your Fractera subscription expires in ${daysLeft} days`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 12px">Subscription expiring soon</h2>
        <p style="margin:0 0 16px">Your Fractera server <strong>${subdomain}</strong> subscription expires in <strong>${daysLeft} day${daysLeft === 1 ? '' : 's'}</strong>.</p>

        <p style="margin:0 0 6px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px">Services at risk (5 pipeline services)</p>
        <ul style="margin:0 0 16px;padding-left:20px;line-height:1.8">
          ${serviceListHtml(PIPELINE_SERVICES)}
        </ul>

        <p style="margin:0 0 16px">To keep all services running, please renew your subscription before the expiry date.</p>
        <p><a href="https://fractera.ai">Manage subscription →</a></p>
      </div>
    `,
  })
}


export async function sendQueuedEmail(to: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Fractera — your workspace is being prepared',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 12px">Purchase confirmed</h2>
        <p style="margin:0 0 16px">Thank you! Your Fractera workspace is being prepared. You will receive a second email with your server IP, login, and password within <strong>60 minutes</strong>.</p>
        <p style="margin:0;font-size:12px;color:#999">If you have any questions, reply to this email.</p>
      </div>
    `,
  })
}

export async function sendAdminAlertEmail(userEmail: string, subscriptionId: string) {
  const adminUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? 'https://fractera.ai'
  await resend.emails.send({
    from: FROM,
    to: 'admin@fractera.ai',
    subject: '🚨 Fractera — user purchased with empty pool',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 12px;color:#e53e3e">Action required: no servers in pool</h2>
        <p style="margin:0 0 16px">A user completed payment but no server was available in the reserve pool.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">
          <tr><td style="padding:6px 0;color:#666;width:140px">User email</td><td style="padding:6px 8px;font-weight:600">${userEmail}</td></tr>
          <tr><td style="padding:6px 0;color:#666">Subscription ID</td><td style="padding:6px 8px;font-family:monospace;font-size:12px">${subscriptionId}</td></tr>
        </table>
        <p style="margin:0 0 16px">Add a server to the pool and assign it to this user:</p>
        <a href="${adminUrl}/admin" style="display:inline-block;background:#fff;color:#000;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">Open Admin Panel →</a>
      </div>
    `,
  })
}


export async function sendInstallStartedEmail(to: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Your Fractera installation has started',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111">
        <h2 style="margin:0 0 8px;font-size:22px;font-weight:700">Installation started</h2>
        <p style="margin:0 0 20px;color:#444;line-height:1.6">
          We're setting up Fractera on your server right now.
          This usually takes <strong>15–20 minutes</strong>.
        </p>

        <p style="margin:0 0 6px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px">What happens next</p>
        <ol style="margin:0 0 20px;padding-left:20px;color:#444;line-height:2">
          <li>You'll receive a short update when dependencies are installed</li>
          <li>The final email will contain your workspace URLs and SSH credentials</li>
        </ol>

        <div style="background:#f7f7f7;border-radius:8px;padding:16px;margin-bottom:20px">
          <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#333">You can also check status anytime</p>
          <p style="margin:0;font-size:13px;color:#555;line-height:1.6">
            Visit <a href="https://fractera.ai" style="color:#6c47ff">fractera.ai</a>, sign in, and open the
            <strong>Servers</strong> tab — your domain will appear there once installation is complete.
          </p>
        </div>

        <p style="margin:0;font-size:12px;color:#888;line-height:1.6">
          If you re-enter your server IP and password on fractera.ai, the dashboard will detect the current state
          and offer options like removing Fractera branding or deleting the server.
        </p>
      </div>
    `,
  })
}

export async function sendInstallProgressEmail(to: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Fractera: dependencies installed — building services',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111">
        <h2 style="margin:0 0 8px;font-size:22px;font-weight:700">Good progress</h2>
        <p style="margin:0 0 20px;color:#444;line-height:1.6">
          All dependencies have been installed on your server.
          We're now building the Fractera services and configuring your domain.
        </p>
        <p style="margin:0 0 20px;color:#444;line-height:1.6">
          You'll receive the final email with your workspace URLs in <strong>5–10 more minutes</strong>.
        </p>
        <p style="margin:0;font-size:12px;color:#888">
          Check status anytime at <a href="https://fractera.ai" style="color:#6c47ff">fractera.ai</a> → Servers tab.
        </p>
      </div>
    `,
  })
}

export async function sendSponsorThankYouEmail(to: string, tier: 's1' | 's5' | 's20') {
  const tierLabel = tier === 's1' ? '$1/month' : tier === 's5' ? '$5/month' : '$20/month'
  await resend.emails.send({
    from: FROM,
    to,
    replyTo: 'admin@fractera.ai',
    subject: 'Thank you for sponsoring Fractera 💛',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#111">
        <div style="text-align:center;font-size:56px;line-height:1;margin-bottom:16px">💛</div>
        <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;text-align:center;color:#111">
          Thank you for becoming a sponsor!
        </h1>

        <p style="margin:0 0 20px;color:#333;line-height:1.7;font-size:16px;text-align:center">
          Your <strong>${tierLabel}</strong> support means the world to me — Fractera is built by one person, and every sponsor is a real boost.
        </p>

        <div style="background:linear-gradient(135deg,#fef9c3 0%,#fef3c7 100%);border:1px solid #fcd34d;border-radius:14px;padding:20px;margin:24px 0">
          <p style="margin:0 0 8px;font-size:11px;color:#92400e;text-transform:uppercase;letter-spacing:1.5px;font-weight:700">What happens next</p>
          <ul style="margin:0;padding-left:18px;color:#1f2937;line-height:1.8;font-size:14px">
            <li>Your email will be listed on the <strong>Sponsors</strong> page here on fractera.ai</li>
            <li>You'll be added to the public Sponsors section in our GitHub repository</li>
            <li>You can manage or cancel your subscription anytime from the Dashboard</li>
          </ul>
        </div>

        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:14px;padding:20px;margin:24px 0;text-align:center">
          <p style="margin:0 0 8px;font-size:11px;color:#1e40af;text-transform:uppercase;letter-spacing:1.5px;font-weight:700">Join the private Telegram group</p>
          <p style="margin:0 0 14px;color:#1e3a8a;line-height:1.6;font-size:14px">
            A closed group for Fractera sponsors — roadmap previews, early features, and direct chat with the team.
          </p>
          <a href="https://t.me/+7TABWdWliKBiYmI8" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 22px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">
            Join Telegram →
          </a>
        </div>

        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:20px;margin:24px 0">
          <p style="margin:0 0 8px;font-size:11px;color:#374151;text-transform:uppercase;letter-spacing:1.5px;font-weight:700">We're in touch</p>
          <p style="margin:0;color:#374151;line-height:1.7;font-size:14px">
            If you have ideas, feature requests, or wishes for the project —
            <strong>just reply to this email</strong>. Your message lands directly with me, and I read every one personally.
          </p>
        </div>

        <p style="margin:32px 0 0;color:#6b7280;line-height:1.6;font-size:13px;text-align:center">
          With sincere gratitude,<br>
          <strong style="color:#111">The Fractera team</strong>
        </p>
      </div>
    `,
  })
}

export async function sendCancellationEmail(to: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Fractera subscription cancelled',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 12px">Subscription cancelled</h2>
        <p style="margin:0 0 16px">Your Fractera subscription has been cancelled. The following pipeline services will be deactivated at the end of the current billing period:</p>

        <p style="margin:0 0 6px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px">Services being deactivated (5 pipeline services)</p>
        <ul style="margin:0 0 16px;padding-left:20px;line-height:1.8">
          ${serviceListHtml(PIPELINE_SERVICES)}
        </ul>

        <p style="margin:0 0 16px">If this was a mistake, you can resubscribe at any time from <a href="https://fractera.ai">fractera.ai</a>.</p>
      </div>
    `,
  })
}

export async function sendPartnerWelcomeEmail(to: string, slug: string) {
  await resend.emails.send({
    from: FROM,
    to,
    replyTo: 'admin@fractera.ai',
    subject: 'Your Fractera Partner cabinet is active',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#111">
        <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#111">
          Welcome to the Fractera Partner Program
        </h1>

        <p style="margin:0 0 20px;color:#333;line-height:1.7;font-size:15px">
          Your partner cabinet is now active. Below is your personal partner identifier — keep it safe; you will use it when configuring your affiliate links and (later) when configuring the embeddable widget and MCP activation.
        </p>

        <div style="background:linear-gradient(135deg,#f3f0ff 0%,#ede4ff 100%);border:1px solid #c4b5fd;border-radius:14px;padding:20px;margin:24px 0">
          <p style="margin:0 0 8px;font-size:11px;color:#6d28d9;text-transform:uppercase;letter-spacing:1.5px;font-weight:700">Your partner ID</p>
          <p style="margin:0;font-family:monospace;font-size:20px;font-weight:700;color:#1f2937;letter-spacing:0.5px">${slug}</p>
        </div>

        <h2 style="margin:24px 0 12px;font-size:18px;font-weight:700;color:#111">Widget snippet</h2>
        <p style="margin:0 0 16px;color:#333;line-height:1.7;font-size:14px">
          The embeddable signup widget is under active development. Once it ships, you will be able to copy a ready-to-paste snippet from your partner cabinet at <a href="https://fractera.ai" style="color:#6c47ff;font-weight:600">fractera.ai</a> → Dashboard → Partner cabinet. The snippet will look approximately like this:
        </p>

        <pre style="background:#0b0b0d;color:#a7f3d0;font-family:monospace;font-size:12px;border-radius:10px;padding:16px;overflow:auto;line-height:1.5;margin:0 0 16px"><code>&lt;iframe
  src="https://embed.fractera.ai/signup?ref=${slug}"
  width="100%" height="640"
  style="border:0; border-radius:16px"
&gt;&lt;/iframe&gt;</code></pre>

        <p style="margin:0 0 24px;color:#666;line-height:1.6;font-size:13px">
          The widget will surface a call-to-action button labelled with your hosting provider name and linking to your affiliate URL — both you configure in the cabinet once it ships.
        </p>

        <h2 style="margin:24px 0 12px;font-size:18px;font-weight:700;color:#111">What to do next</h2>
        <ul style="margin:0 0 16px;padding-left:20px;line-height:1.8;color:#1f2937;font-size:14px">
          <li>Open <a href="https://fractera.ai" style="color:#6c47ff;font-weight:600">fractera.ai</a> → Dashboard (top-right corner of the page after signing in) → tab <strong>«Partner cabinet»</strong>.</li>
          <li>Apply for an affiliate program with any VPS provider you want to recommend (Contabo's program is documented at <a href="https://contabo.com/en/affiliate-program/" style="color:#6c47ff;font-weight:600">contabo.com/en/affiliate-program/</a> — but any host with an affiliate program works).</li>
          <li>Once approved by the provider, connect your affiliate link in the cabinet — that will happen as soon as link management ships (next development step).</li>
        </ul>

        <p style="margin:24px 0 0;color:#666;font-size:13px;line-height:1.6">
          Questions? Reply directly to this email — it goes to admin@fractera.ai.
        </p>
      </div>
    `,
  })
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c))
}

type BlackBoxInquiry = {
  email: string
  name?: string
  company?: string
  area?: string
  country?: string
  companyDoes?: string
  aiTask?: string
  telegram?: string
  lang?: string
}

export async function sendBlackBoxInquiryEmail(inquiry: BlackBoxInquiry) {
  const rows: [string, string | undefined][] = [
    ['Email', inquiry.email],
    ['Name', inquiry.name],
    ['Company', inquiry.company],
    ['Area of activity', inquiry.area],
    ['Country', inquiry.country],
    ['What the company does', inquiry.companyDoes],
    ['AI task they want to solve', inquiry.aiTask],
    ['Telegram', inquiry.telegram],
    ['UI language at submission', inquiry.lang],
  ]
  const rowsHtml = rows
    .filter(([, v]) => v && v.trim())
    .map(([label, v]) => `
      <tr>
        <td style="padding:8px 12px;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #eee;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td>
        <td style="padding:8px 12px;font-size:14px;color:#111;border-bottom:1px solid #eee;white-space:pre-wrap;line-height:1.5">${escapeHtml((v ?? '').trim())}</td>
      </tr>
    `).join('\n')

  await resend.emails.send({
    from: FROM,
    to: 'admin@fractera.ai',
    replyTo: inquiry.email,
    subject: `Black Box inquiry — ${inquiry.company?.trim() || inquiry.email}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111">
        <h2 style="margin:0 0 6px">Fractera Black Box — new consultation inquiry</h2>
        <p style="margin:0 0 16px;color:#666;font-size:13px">Reply directly to this email — it goes to the inquirer (${escapeHtml(inquiry.email)}).</p>
        <table style="width:100%;border-collapse:collapse;border:1px solid #eee">
          ${rowsHtml}
        </table>
      </div>
    `,
  })
}

export async function sendDeployFailedEmail(to: string, errorMessage?: string, serverToken?: string) {
  await resend.emails.send({
    from: FROM,
    to,
    replyTo: 'admin@fractera.ai',
    subject: 'Your Fractera deployment did not complete',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111">
        <h2 style="margin:0 0 12px">Deployment did not complete</h2>
        <p style="margin:0 0 16px;color:#333;line-height:1.6">
          We started setting up your Fractera server, but the deployment ran
          into a problem and could not finish. Your server is <strong>not
          ready</strong> — the URL we mentioned in the previous email will not
          work.
        </p>

        ${errorMessage ? `
        <p style="margin:0 0 6px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px">What went wrong</p>
        <p style="margin:0 0 20px;font-size:13px;color:#b91c1c;font-family:monospace;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px;line-height:1.5;word-break:break-word">${errorMessage}</p>
        ` : ''}

        <p style="margin:0 0 6px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px">How to recover</p>
        <ol style="margin:0 0 20px;padding-left:20px;line-height:1.8;color:#1f2937;font-size:14px">
          <li>
            Open your dashboard at
            <a href="https://fractera.ai" style="color:#6c47ff;font-weight:600">fractera.ai</a>
            (sign in with <strong>${to}</strong>) &rarr; <strong>Servers</strong>,
            delete the failed deployment, and start a new one from the home page.
          </li>
          <li>
            Or use the <strong>MCP-assisted recovery</strong>: paste the
            server_token below into an AI agent that has the
            <a href="https://fractera.ai/en/partners#mcp" style="color:#6c47ff;font-weight:600">Fractera MCP</a>
            enabled (Claude Code, Codex, Gemini CLI). The agent will call
            <code>retry_deploy</code> and finish the setup of the server you
            already started.
          </li>
        </ol>

        ${serverToken ? `
        <p style="margin:0 0 6px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px">Your server_token</p>
        <p style="margin:0 0 20px;font-size:13px;color:#1f2937;font-family:monospace;background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:12px;line-height:1.5;word-break:break-all;user-select:all">${serverToken}</p>
        ` : ''}

        <p style="margin:0;color:#666;font-size:13px;line-height:1.6">
          Need help? Reply directly to this email — it goes to admin@fractera.ai.
        </p>
      </div>
    `,
  })
}
