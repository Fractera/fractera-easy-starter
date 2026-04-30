'use client'

const CLAUDE_URL = 'https://claude.ai'

export function OpenClaudeButton() {
  function handleClick() {
    if (window.screen.width >= 1536) {
      const w = Math.floor(window.screen.width / 2)
      const h = window.screen.height
      const left = window.screen.width - w
      window.open(
        CLAUDE_URL,
        'claude-window',
        `width=${w},height=${h},left=${left},top=0,resizable=yes`
      )
    } else {
      window.open(CLAUDE_URL, '_blank')
    }
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 bg-white text-black font-semibold px-8 py-4 rounded-xl text-base hover:bg-gray-100 transition-colors"
    >
      Open Claude
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 7h10v10"/><path d="M7 17 17 7"/>
      </svg>
    </button>
  )
}
