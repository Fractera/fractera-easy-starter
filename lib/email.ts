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

export async function sendWelcomeEmail(to: string, subdomain: string) {
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

        <p style="margin:0;font-size:12px;color:#666">data.${subdomain} — file storage (Data service)</p>
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

// DEBUG — remove before launch
export async function sendInstallLogEmail(to: string, step: string, label: string, percent: number, elapsed: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `[${percent}%] Fractera install: ${label}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <p style="margin:0 0 8px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px">Debug · Install Log</p>
        <h2 style="margin:0 0 16px;font-size:18px">${percent}% — ${label}</h2>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <tr><td style="padding:4px 0;color:#999">Step ID</td><td style="padding:4px 8px;color:#fff">${step}</td></tr>
          <tr><td style="padding:4px 0;color:#999">Progress</td><td style="padding:4px 8px;color:#fff">${percent}%</td></tr>
          <tr><td style="padding:4px 0;color:#999">Elapsed</td><td style="padding:4px 8px;color:#fff">${elapsed}</td></tr>
        </table>
        <p style="margin:16px 0 0;font-size:11px;color:#555">This is a debug email — will be removed before launch.</p>
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
