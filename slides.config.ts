export type Slide = {
  number: number
  title: string
  description: string
  image: string
}

export const SLIDES: Slide[] = [
  {
    number: 1,
    title: 'Open claude.ai Settings',
    description: 'Go to Settings → Integrations → Add custom connector',
    image: '/screenshots/step-1.png',
  },
  {
    number: 2,
    title: 'Paste the MCP URL',
    description: 'Name it "Fractera" and paste: https://fractera.ai/api/mcp',
    image: '/screenshots/step-2.png',
  },
  {
    number: 3,
    title: 'Type "install fractera"',
    description: 'Start a new chat and Claude will guide you through the whole process',
    image: '/screenshots/step-3.png',
  },
]
