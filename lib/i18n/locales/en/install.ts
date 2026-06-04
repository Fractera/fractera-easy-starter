import type { SiteContent } from '../../types'

type InstallPart = Pick<SiteContent, 'mcpSection' | 'domainSection' | 'installForm'>

export const install: InstallPart = {
  mcpSection: {
    label: 'MCP · AI Agents',
    h2: 'Complete Server Management via Claude Code MCP Server',
    description:
      'Building and managing a production server through an AI agent inside your chat has never been this seamless. Connect Claude, Codex, or Gemini to the Fractera MCP server — deploy infrastructure, monitor installation, and launch new environments without leaving your conversation. You can also use the MCP server to diagnose and resolve any deployment issues directly from your AI chat.',
    serverUrlLabel: 'Fractera MCP server URL',
    serverUrl: 'https://www.fractera.ai/api/mcp',
    copy: 'Copy',
    copied: 'Copied',
    helpHint:
      '* Never used MCP before? Just copy the URL above and ask your AI agent (Claude, Codex, Gemini): "please connect the MCP server at this URL." The AI will walk you through what to click inside its own interface — setup takes no more than 15 seconds. Once connected, tell the agent: "deploy Fractera for me" or "my deploy failed, here is the server_token" — it takes over from there.',
    sliderH3: 'Step-by-step: deploying via the MCP connector',
    sliderCaption: 'A custom implementation for deploying a server that runs Claude Code only.',
    docLink: 'Full technical reference & security FAQ →',
  },

  domainSection: {
    label: 'Your current access',
    h2: 'Your personal workspace',
    description:
      'Use these links to open your project. Remember that you can always find all your active servers in your Dashboard — available from the top-right corner after signing in.',
  },

  installForm: {
    title: 'Install Fractera on your server',
    ipPlaceholder: 'Server IP address (e.g. 109.199.105.213)',
    loginPlaceholder: 'Login (usually: root)',
    passwordPlaceholder: 'Password',
    passwordHint: 'Change this password after deployment.',
    checking: 'Checking server...',
    alreadyInstalled: 'Fractera is already installed on this server',
    yourDomains: 'Your domains',
    removeWhiteLabel: 'Remove Fractera branding — $100',
    renewingSsl: 'Renewing SSL…',
    renewSsl: 'Renew SSL certificates',
    removing: 'Removing…',
    deleteReinstall: 'Delete and reinstall fresh',
    cantReach: 'Could not reach server. You can still try installing.',
    updatesTo: 'Installation updates will be sent to',
    emailConfirmCheck: 'I understand and have access to this email address',
    emailConfirmNote: "If you don't have access to this email, sign out and sign in with an account you can access, then try again.",
    componentSelect: {
      fullLabel: 'Full install (recommended)',
      customLabel: 'Choose components manually',
      customHint: 'Uncheck what you don\'t need — a lighter, cheaper server. You can always add any tool later from the terminal built into your admin panel.',
      agentsTitle: 'Coding agents',
      servicesTitle: 'AI services',
      coreNote: 'Always included: the server, database, object storage, authentication, and the admin panel with its own terminal — even with everything below unchecked.',
      items: {
        'claude-code': { name: 'Claude Code', desc: 'Anthropic Claude coding agent' },
        'codex': { name: 'Codex', desc: 'OpenAI Codex CLI' },
        'gemini-cli': { name: 'Gemini CLI', desc: 'Google Gemini coding agent' },
        'qwen-code': { name: 'Qwen Code', desc: 'Alibaba Qwen coding agent' },
        'kimi-code': { name: 'Kimi Code', desc: 'Moonshot Kimi coding agent' },
        'memory': { name: 'Memory', desc: 'LightRAG vector knowledge base' },
        'brain': { name: 'Brain', desc: 'Hermes orchestration agent' },
      },
    },
    launchButton: 'Launch my server →',
    credentials: 'Your credentials are used only for installation and are never stored on our servers.',
    installFailed: 'Installation failed',
    preparing: 'Preparing...',
    tryAgain: 'Try again',
    silentWarning: 'Server has been silent for {secs}s. The installation may still be running, or the server may be unreachable.',
    errorDetails: 'Error details:',
    progressToast: {
      title: 'Deployment in progress…',
      dashboardNote: 'You can track the deployment progress at any time in your Dashboard — available in the top-right corner of the page after signing in.',
      checkboxLabel: 'I understand',
      hideButton: 'Hide',
    },
    successToast: {
      title: 'Your server has been successfully deployed',
      siteLabel: 'Your site',
      adminLabel: 'Admin panel',
      dashboardNote: 'All your servers are available in your Dashboard — accessible from the top-right corner of the page after signing in.',
      checkboxLabel: 'I understand',
      closeButton: 'Close',
    },
  },
}
