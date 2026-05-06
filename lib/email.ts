import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.AUTH_RESEND_FROM ?? 'noreply@fractera.ai'

export async function sendWelcomeEmail(to: string, subdomain: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Your Fractera server is ready',
    html: `
      <h2>Your server is live! 🚀</h2>
      <p>Your Fractera coding environment is deployed and ready:</p>
      <ul>
        <li><a href="https://${subdomain}">https://${subdomain}</a> — your app</li>
        <li><a href="https://admin.${subdomain}">https://admin.${subdomain}</a> — AI coding workspace</li>
        <li><a href="https://auth.${subdomain}">https://auth.${subdomain}</a> — login / register</li>
      </ul>
      <p>You have full access to Claude Code, Codex, Gemini CLI, Qwen Code, and Kimi Code.</p>
    `,
  })
}

export async function sendExpiryWarningEmail(to: string, daysLeft: number, subdomain: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your Fractera subscription expires in ${daysLeft} days`,
    html: `
      <h2>Subscription expiring soon</h2>
      <p>Your Fractera server <strong>${subdomain}</strong> subscription expires in <strong>${daysLeft} days</strong>.</p>
      <p>To keep your server running, please renew your subscription.</p>
      <p><a href="https://fractera.ai">Manage subscription →</a></p>
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
      <h2>Subscription cancelled</h2>
      <p>Your Fractera subscription has been cancelled. Your server will be deactivated at the end of the current billing period.</p>
      <p>If this was a mistake, you can resubscribe at any time from <a href="https://fractera.ai">fractera.ai</a>.</p>
    `,
  })
}
