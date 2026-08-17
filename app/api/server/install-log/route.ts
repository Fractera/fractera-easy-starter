import { NextResponse } from 'next/server'

// Milestone relay from bootstrap.sh (`log_email` at 30/40/65/75/85/100%).
//
// 🪦 IT NO LONGER SENDS AN EMAIL (2026-08-17, owner's decision). It used to fire
// sendInstallProgressEmail at ~30% ("5–10 more minutes"), which was the third of
// four emails per deploy. The flow is deliberately TWO emails now — start and
// result — because each extra send eats the Resend allowance while telling the
// customer nothing they cannot already see live on the page they started from.
//
// The endpoint is KEPT as a no-op on purpose: bootstrap.sh on every server
// already deployed still calls it, and those servers are not redeployed when we
// change this repo. Deleting the route would turn each milestone into a 404 in
// the customer's ping log for the rest of that server's life.
export async function POST() {
  return NextResponse.json({ ok: true })
}
