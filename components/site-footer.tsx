'use client'

export function SiteFooter() {
  function openCookieSettings() {
    window.dispatchEvent(new Event('open-cookie-settings'))
  }

  return (
    <footer className="border-t border-white/10 bg-black text-white mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-8">

        <div className="flex flex-col gap-2">
          <span className="text-base font-bold tracking-tight">Fractera</span>
          <p className="text-sm text-white/50">
            Production AI coding platform on your own server.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/50">
          <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="/cookies" className="hover:text-white transition-colors">Cookie Policy</a>
          <button
            type="button"
            onClick={openCookieSettings}
            className="hover:text-white transition-colors text-left"
          >
            Cookie Settings
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-white/30 border-t border-white/10 pt-6">
          <span>© {new Date().getFullYear()} Fractera. All rights reserved.</span>
          <span>fractera.ai</span>
        </div>
      </div>
    </footer>
  )
}
