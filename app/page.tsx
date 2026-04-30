export default function Home() {
  const mcpUrl = 'https://fractera.ai/api/mcp'

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-12">

        {/* Hero */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">
            Fractera
          </h1>
          <p className="text-xl text-gray-400">
            Your own AI workspace. On your own server. No coding required.
          </p>
        </div>

        {/* CTA */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
          <h2 className="text-2xl font-semibold">
            Launch your workspace in 15 minutes
          </h2>
          <p className="text-gray-400">
            Install this MCP in claude.ai, then type <span className="text-white font-mono bg-white/10 px-2 py-1 rounded">&quot;install fractera&quot;</span> to start.
          </p>

          {/* Install steps */}
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold shrink-0">1</span>
              <div>
                <p className="font-medium">Open claude.ai Settings</p>
                <p className="text-sm text-gray-400">Go to Settings → Integrations → Add MCP</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold shrink-0">2</span>
              <div>
                <p className="font-medium">Paste this URL</p>
                <div className="mt-2 flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                  <code className="text-sm text-green-400 flex-1 break-all">{mcpUrl}</code>
                </div>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold shrink-0">3</span>
              <div>
                <p className="font-medium">Start a new chat</p>
                <p className="text-sm text-gray-400">Type <span className="text-white font-mono">&quot;install fractera&quot;</span> and Claude will guide you</p>
              </div>
            </div>
          </div>
        </div>

        {/* What you get */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-300">What you get</h3>
          <ul className="space-y-2 text-gray-400">
            <li className="flex gap-2"><span className="text-green-400">✓</span> Your own subdomain: <span className="text-white">name.fractera.ai</span></li>
            <li className="flex gap-2"><span className="text-green-400">✓</span> Claude Code, Gemini, Codex — all in one place</li>
            <li className="flex gap-2"><span className="text-green-400">✓</span> Your data stays on your server</li>
            <li className="flex gap-2"><span className="text-green-400">✓</span> Server costs ~€3/month (you pay your host directly)</li>
          </ul>
        </div>

        <p className="text-sm text-gray-600 text-center">
          Fractera is open source. fractera.ai handles subdomain registration only.
        </p>
      </div>
    </main>
  )
}
