const ADJECTIVES = ['happy', 'swift', 'bright', 'calm', 'bold', 'cool', 'free', 'keen', 'neat', 'pure']
const NOUNS = ['fox', 'owl', 'elk', 'wolf', 'bear', 'hawk', 'lion', 'deer', 'lynx', 'crow']

export function generateSubdomain(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  const num = Math.floor(Math.random() * 99) + 1
  return `${adj}-${noun}-${num}`
}
