import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fractera — sign up',
  description: 'Deploy your private AI infrastructure',
  robots: { index: false, follow: false },
}

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-black text-white">
      {children}
    </div>
  )
}
