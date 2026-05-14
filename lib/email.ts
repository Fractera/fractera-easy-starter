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
        <p style="margin:0 0 16px">Your Fractera coding environment is fully deployed. All pipeline services are running:</p>

        <p style="margin:0 0 6px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px">Infrastructure (5 services)</p>
        <ul style="margin:0 0 16px;padding-left:20px;line-height:1.8">
          ${serviceListHtml(PIPELINE_SERVICES)}
        </ul>

        <p style="margin:0 0 6px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px">AI Platforms (5 tools)</p>
        <ul style="margin:0 0 16px;padding-left:20px;line-height:1.8">
          ${AI_PLATFORMS.map(p => `<li style="margin:4px 0">${p}</li>`).join('\n')}
        </ul>

        <p style="margin:0 0 6px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px">Your URLs</p>
        <ul style="margin:0 0 24px;padding-left:20px;line-height:1.8">
          <li><a href="https://${subdomain}">https://${subdomain}</a> — app (Shell)</li>
          <li><a href="https://auth.${subdomain}">https://auth.${subdomain}</a> — login (Auth)</li>
          <li><a href="https://admin.${subdomain}">https://admin.${subdomain}</a> — workspace (Admin + Bridge)</li>
        </ul>

        <p style="margin:0 0 24px;font-size:12px;color:#666">data.${subdomain} — file storage (Data service)</p>

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
