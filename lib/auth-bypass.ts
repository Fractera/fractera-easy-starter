// Mirrors the ai-workspace pattern: a single env var (or NODE_ENV=development)
// disables auth gates project-wide. On the Vercel side this is the escape
// hatch that lets the project owner inspect /debug, /admin, etc. without
// being signed in as a specific email.
//
// Turn on in Vercel dashboard → Settings → Environment Variables:
//   FRACTERA_IP_NODOMAIN_MODE=true
// then redeploy (or wait for the next push). Turn off (unset / set to false)
// to restore strict auth.
export function shouldBypassAuth(): boolean {
  return process.env.NODE_ENV === 'development'
      || process.env.FRACTERA_IP_NODOMAIN_MODE === 'true'
}
