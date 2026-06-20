<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Static-first canon
**Creating a dynamic page is FORBIDDEN** unless absolutely necessary and only after the architect's double
confirmation — better nothing than a needless dynamic page. The product must work with JavaScript off; a
root `force-dynamic` is never allowed on the public surface (use ISR `revalidate`). Architect-only pages
may be dynamic. Full canon → [`STATIC-FIRST.md`](STATIC-FIRST.md); dev source → `/code/CLAUDE.md`.
