import type { DeploymentBase } from '@/lib/deployments/post'

// Base English document for /[lang]/deployments/mcp (Claude Code MCP target).
// IP-first reality: the deploy comes up on plain HTTP at http://<ip>:3002 — never
// promise HTTPS/a domain as the result of the deploy.
export const en: DeploymentBase = {
  title: 'Claude Code MCP: Deploy From the Chat',
  seoTitle: 'Deploy a Self-Hosted AI Workspace From Claude Code (MCP)',
  subtitle:
    'Stand up and orchestrate the whole Agentic Engineering Infrastructure straight from Claude Code over the Model Context Protocol. Answer a few questions, one tool call does the rest — zero server management.',
  description:
    'Deploy a private Fractera Agentic Engineering Infrastructure to your own VPS directly from Claude Code over the Model Context Protocol. One tool call provisions, installs and streams progress. IP-first: live on plain HTTP in about ten minutes.',
  keywords:
    'claude code mcp, model context protocol deploy, deploy ai workspace from chat, fractera mcp connector, agentic engineering infrastructure, self-hosted ai over mcp, one command vps deploy, mcp server fractera, deploy ai agents from claude',
  listTitle: 'Claude Code MCP',
  listDescription:
    'Stand up and orchestrate the whole infrastructure straight from Claude Code over the Model Context Protocol — zero server management.',
  founderQuote:
    'Experience is what you are left with when you do not get what you wanted… I am a very experienced man.',
  blocks: [
    {
      kind: 'callout',
      title: 'Zero server management — deploy from the conversation',
      text:
        'Connect the Fractera MCP connector to your code agent, answer a few short questions, and a single tool call wipes the target, runs the install and streams real-time progress. When it finishes, your workspace is live on plain HTTP at http://<your-ip>:3002.',
    },
    {
      kind: 'p',
      text:
        'The Model Context Protocol lets an AI assistant call real tools, and the Fractera connector is not tied to one vendor: it works with any MCP-capable code generator — Claude Code, OpenAI Codex, Gemini CLI, Qwen Code and Kimi Code, each on your own subscription. Point any of them at a private [platform for agentic engineering](/en): you describe what you want in plain language, and the agent provisions the same production stack you would get from the install form — without you touching a server console.',
    },

    { kind: 'h2', text: 'Deploy without leaving the chat' },
    { kind: 'h3', text: 'One tool call does the whole install' },
    {
      kind: 'p',
      text:
        'Add the connector and the agent asks for the essentials — your email, the VPS address and its password — then calls one tool that registers you, wipes the target machine and launches the IP-first install. You watch the steps stream back into the conversation in real time; there is no terminal, no manual setup, and nothing to copy and paste.',
    },
    { kind: 'h3', text: 'IP-first result: http://<your-ip>:3002' },
    {
      kind: 'p',
      text:
        'The deploy is IP-first, exactly like the server deploy. When it completes — typically in about ten minutes — your Admin workspace is reachable on plain HTTP at your server’s IP on port 3002. There is no domain and no HTTPS yet, and that is by design. Attaching your own domain with HTTPS is a separate, optional step you do later from inside the workspace.',
    },

    { kind: 'h2', text: 'Why the connector is more than a deploy button' },
    { kind: 'h3', text: 'The site is a knowledge base the agent can read' },
    {
      kind: 'p',
      text:
        'The connector exposes the project’s own knowledge base, so Claude can answer questions about Fractera while it deploys — what it is, what comes up on the server, how the pieces fit together. Read the same material on the [project knowledge base](/mcp-info) page or explore the [architecture](/ai-workspace-architect) visually.',
    },
    { kind: 'h3', text: 'Recovery and status are built in' },
    {
      kind: 'p',
      text:
        'A deploy is never a dead end. The connector can check the status of an in-flight install, return the finished address, and recover a failed run from a server token — so a transient hiccup is something Claude can pick back up instead of forcing you to start over.',
    },

    {
      kind: 'quote',
      text:
        'A private engineering stack on a server you own, stood up by an assistant that talks to you in plain language and never asks you to open a terminal.',
      cite: 'Fractera Engineering Core · June 2026',
    },

    {
      kind: 'p',
      text:
        'Prefer to deploy from the chat? Add the Fractera MCP connector and ask your agent — Claude Code, Codex, Gemini CLI, Qwen Code or Kimi Code — to deploy. Prefer a form? [Use the install form](/en/deployments/vps#pricing) instead — both reach the same place.',
    },
  ],
  faq: [
    {
      q: 'What is the Fractera MCP connector used for?',
      a: 'It lets Claude (and any MCP-compatible assistant) deploy a private Fractera Agentic Engineering Infrastructure directly from the chat. It asks a few questions and calls a single tool that provisions a VPS, runs the install and streams real-time progress — no manual setup required.',
    },
    {
      q: 'Does deploying over MCP need a custom domain or HTTPS?',
      a: 'No. The deploy is IP-first: your workspace goes live on plain HTTP at http://<your-ip>:3002 in about ten minutes, with no DNS or certificate wait. Attaching your own domain with HTTPS is an optional later step done from inside the workspace.',
    },
    {
      q: 'Is the deployed stack open-source and self-hosted?',
      a: 'Yes. The layer that runs on your VPS is open-source and runs entirely on your own server — no data leaves it. You own the code, the database and the AI memory, whether you deploy over MCP or from the install form.',
    },
  ],
}
