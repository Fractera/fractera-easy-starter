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
    passwordHint: 'For security, change your server\'s password after deployment.',
    security: {
      note: 'Fractera never stores your server password and has no technical way to reach your server once installation completes. For complete peace of mind, deploy onto a fresh, clean server that holds no existing data of yours. Changing the password afterwards is your responsibility — see our Terms of Service and Privacy Policy.',
      passwordAck: 'I understand I must change my server password immediately after deployment.',
    },
    checking: 'Checking server...',
    alreadyInstalled: 'Fractera is already installed on this server',
    yourDomains: 'Your domains',
    removeWhiteLabel: 'Remove Fractera branding — $100',
    renewingSsl: 'Renewing SSL…',
    renewSsl: 'Renew SSL certificates',
    removing: 'Removing…',
    deleteReinstall: 'Delete and reinstall fresh',
    wipe: {
      clearButton: 'Clear the server',
      clearing: 'Clearing the server…',
      clearedToast: 'Server cleared — you can deploy now.',
      errorHint: 'Carefully check the details you entered — the IP address, login and password — then try again.',
    },
    cantReach: 'Could not reach server. You can still try installing.',
    updatesTo: 'Installation updates will be sent to',
    emailConfirmCheck: 'I understand and have access to this email address',
    emailConfirmNote: "If you don't have access to this email, sign out and sign in with an account you can access, then try again.",
    launchButton: 'Launch my server →',
    credentials: 'Your credentials are used only for installation and are never stored on our servers.',
    installFailed: 'Installation failed',
    preparing: 'Preparing...',
    tryAgain: 'Try again',
    silentWarning: 'Server has been silent for {secs}s. The installation may still be running, or the server may be unreachable.',
    errorDetails: 'Error details:',
    errorMcpPrefix: 'or ',
    errorMcpLink: 'launch deployment via an AI agent (MCP)',
    errorMcpSuffix: ' — it can fix the error itself.',
    progressToast: {
      title: 'Deployment in progress…',
      dashboardNote: 'You can track the deployment progress at any time in your Dashboard — available in the top-right corner of the page after signing in.',
      checkboxLabel: 'I understand',
      hideButton: 'Hide',
      domainTipTitle: 'How to make good use of the time while we install the software on your server?',
      domainTipBody: 'If you have not bought a domain for your project yet, now is the perfect moment. The project works fine without a personal domain, but a personal domain unlocks the full set of capabilities.',
      domainButton: 'Buy a domain',
      dnsButton: 'Set up DNS',
      dnsIntro: 'Point your domain at the server: in your registrar\'s DNS, add these A records — each pointing to your server IP. Then activate the domain inside the workspace.',
      dnsCovers: 'Tip: a single wildcard record (Host *) instead of the list works too.',
    },
    successToast: {
      title: 'Your server has been successfully deployed',
      siteLabel: 'Your site',
      adminLabel: 'Admin panel',
      dashboardNote: 'All your servers are available in your Dashboard — accessible from the top-right corner of the page after signing in.',
      envNote: 'First step after this: open the Control panel → Environment variables and move .env.local to your machine. Git never carries that file, and without it your local copy will not start.',
      checkboxLabel: 'I understand',
      closeButton: 'Close',
    },
    addresses: {
      pendingTitle: 'Your addresses',
      pendingNote: 'These are already yours and will not change — save them now. They start answering the moment the installation finishes.',
      liveTitle: 'Your addresses — live',
      siteLabel: 'Your site',
      authLabel: 'Login / register',
      adminLabel: 'Control panel',
    },
  },
}
