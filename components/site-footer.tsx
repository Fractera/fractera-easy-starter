'use client'

export function SiteFooter() {
  function openCookieSettings() {
    window.dispatchEvent(new Event('open-cookie-settings'))
  }

  return (
    <footer className="border-t border-white/20 bg-black text-white mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-6">

        <div className="flex flex-col gap-1.5">
          <span className="text-lg font-bold tracking-tight">Fractera</span>
          <p className="text-sm text-white">
            Production AI development workspace — open source, your own server.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white font-medium">
          <a href="/privacy" className="hover:text-orange-400 transition-colors">Privacy Policy</a>
          <a href="/terms" className="hover:text-orange-400 transition-colors">Terms of Service</a>
          <a href="/cookies" className="hover:text-orange-400 transition-colors">Cookie Policy</a>
          <button
            type="button"
            onClick={openCookieSettings}
            className="hover:text-orange-400 transition-colors text-left"
          >
            Cookie Settings
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-white border-t border-white/20 pt-6">
          <span>© {new Date().getFullYear()} Fractera. All rights reserved.</span>
          <span className="font-mono font-semibold">fractera.ai</span>
        </div>

      </div>
    </footer>
  )
}
