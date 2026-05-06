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
      <p><a href="https://fractera-easy-starter.vercel.app">Manage subscription →</a></p>
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
      <p>If this was a mistake, you can resubscribe at any time from <a href="https://fractera-easy-starter.vercel.app">fractera.ai</a>.</p>
    `,
  })
}
