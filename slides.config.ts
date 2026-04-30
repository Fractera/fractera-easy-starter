export type Slide = {
  number: number
  title: string
  description: string
  image: string
}

export const SLIDES: Slide[] = [
  {
    number: 1,
    title: 'Open the Customize panel',
    description: 'Tap the briefcase icon (Customize) in the project tab. This option is only available on desktop — the mobile version of claude.ai does not support adding new MCP connectors.',
    image: '/step1.png',
  },
  {
    number: 2,
    title: 'Go to Connectors',
    description: 'In the panel that opens, choose between Skills and Connectors. Select Connectors.',
    image: '/step2.png',
  },
  {
    number: 3,
    title: 'Add a new connector',
    description: 'Next to "Connectors", tap the + button. A small menu appears — select "Add new connector".',
    image: '/step3.png',
  },
  {
    number: 4,
    title: 'Enter name and URL',
    description: 'A dialog opens asking for a name and server URL. Enter the name (e.g. "Fractera") and paste the MCP URL from above. The Add button activates once the name is filled in.',
    image: '/step4.png',
  },
  {
    number: 5,
    title: 'Confirm the connected tools',
    description: 'After adding, you\'ll see a screen listing three tools from our server. This confirms the connector is working correctly.',
    image: '/step5.png',
  },
  {
    number: 6,
    title: 'Start a new chat',
    description: 'Tap the + button to open a new chat. Make sure the Fractera connector is active in this chat.',
    image: '/step6.png',
  },
  {
    number: 7,
    title: 'Copy the start phrase',
    description: 'Go back to fractera.ai and copy the start phrase — it\'s already prepared in your language with a request to continue the conversation in that language.',
    image: '/step7.png',
  },
  {
    number: 8,
    title: 'Paste and send',
    description: 'Paste the phrase into the chat and press Send.',
    image: '/step8.png',
  },
  {
    number: 9,
    title: 'Allow tool access',
    description: 'Claude will ask for permission to use the Fractera tools. A dropdown appears — select "Once" to confirm. The conversation will then continue automatically.',
    image: '/step9.png',
  },
  {
    number: 10,
    title: 'Choose your server',
    description: 'Fractera will suggest hosting providers that match your needs. Pick one and follow the guided steps — the rest is automatic.',
    image: '/step10.png',
  },
]
