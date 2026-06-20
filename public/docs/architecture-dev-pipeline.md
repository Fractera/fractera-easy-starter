# Code Development Pipeline via `/architecture` — living standard

> **This is a living META-document for one case.** It describes the end-to-end intent — the **ordinary
> code development cycle** that starts with a record on the `/architecture` service page and converges on
> `/development-steps` — and keeps the goal in focus while we slice it into sub-steps. The document **grows
> with development**: every closed sub-step moves a link of the cycle from `todo` to `done` and appends to
> the growth log (Appendix A). Authored in Russian (the language of the authoritative intent); this is the
> English port.
>
> **This is a DIFFERENT cycle, not skill evolution.** The twin document
> [`skill-evolution-pipeline.md`](./skill-evolution-pipeline.md) describes the **skill/MCP evolution**
> cycle (`/ai-draft-settings → development-steps`). This one is the **product code development** cycle
> (`/architecture → development-steps`). Both converge on the steps journal and share one decomposition
> discipline, but they are **different** pipelines: there you perfect a skill, here you build the project's
> pages and endpoints. Do not confuse or merge them.
>
> **Builds on** (folder `CRUD-DOCS/workspace-standards/`):
> [`development-methodology.md`](./development-methodology.md) — the master methodology (§5 flow B — this
> doc = its concrete application) · [`architecture.md`](./architecture.md) — the `/architecture` service
> page (declared→built→live, README+`_meta.ts`) · [`development-steps.md`](./development-steps.md)
> — the steps journal · [`development-loop.md`](./development-loop.md).
> The agent's operational pipeline — `app/CLAUDE.md §6` (`flow-B`: trigger 3 = architecture state → step).

---

## §0. Goal and vision

**Goal.** Give the ordinary code development cycle the same **materialized end-to-end surface** the skill
evolution cycle already has: a task → **a record on `/architecture`** → **bundling records into one step** →
execution (building the route) → test → deploy → recording the result → the next decomposition turn.
Before this step, flow B was **described** in the methodology but **not materialized**: `/architecture` had
no bundle-to-step buttons, no bundling route, no skill and no MCP — the link to `/development-steps` was
absent (0 references). This pipeline closes the gap.

**What a record on `/architecture` is (three types, FS-sourced, no DB, step 108).** An agent or architect
leaves a **code task** on the service page that later turns into a step:
- **declared page/endpoint** — a `README.md` on disk with no real file (`POST …/architecture/requested`);
- **to-do** on a live route — a task inside the route's `README.md` (`kind:'todo'`);
- **danger / deletion** — a delete-and-refactor request for a route (`kind:'delete'`).

**A "pending" record** = a declared route **or** a route with open tasks (`tasksByPath.count > 0`) — exactly
the records that Launch collects (link 2).

**The process lead is any agent (a §0 self-sufficiency given).** It is **unknown in advance** who runs the
cycle: Hermes, a single Codex, any of the five coders — or a single agent with no Hermes and no memory.
The pipeline must work under **any** subset of entities. Therefore the record skill (link 1) and the bundle
skill (link 2) are self-sufficient (pure HTTP, duplicated to every agent), and MCP is only a Hermes
convenience path, not the only one.

**Layer.** product / FNS (`CRUD-DOCS/…`) — ships to the customer with the clone; describes the agent's work
**inside the deployed workspace**.

---

## §1. Reference case — "a Facebook clone"

The end-to-end example we run the pipeline on. The task "build a Facebook clone" is non-trivial precisely
because it **cannot be built in one step** — it must go through decomposition via `/architecture`, and all
the links of the cycle are visible on it:

1. **Research.** The agent studies the task and decides which surfaces the product consists of: feed,
   profile, friends, messages, groups, notifications, settings — say, **10 pages**.
2. **Record on `/architecture` (link 1).** The agent **does not build code right away** — it opens
   `/architecture` and **declares one page per surface** (`requested`, a `README.md` with no file), and for
   already-live routes it leaves **to-dos** to refine sections. For each page it FIRST decides the access
   shape (`public`/`private`/`public+guest` per `HOW-USE-AUTH.md`) — which becomes the `--access` argument
   at scaffold time.
3. **Closing the decomposition step.** The goal of this step is to build the **full chain**, not to do
   everything: the `/architecture` tree now carries 10 declared pages + to-dos.
4. **Bundle into a step (link 2).** The "launch" command / the **🚀 Launch** hover button collects all
   pending records into **one** `/development-steps` step (a brief with a section per record: path + what to
   build/change/remove) and **removes** the source records from the tab.
5. **Execution (link 3+).** In the following cycles the agent pulls a record, scaffolds the route with the
   skeleton-building skill, writes domain code, tests, deploys, records the result — until the
   `/architecture` tree is **empty** again.

As the document grows, case specifics are added here (which exact pages, which intersections with parallel
routing, which patterns were reused).

---

## §2. The 7-link cycle (canonical map)

State is updated as sub-steps close. **Links 1–2** are materialized by this step (mirror of flow-A); **links
3–7** are the already-existing operational code development pipeline (`app/CLAUDE.md §6.4–6.11`), which we
merely **connect** to the bundled step rather than rebuild.

| # | Link | What happens | Where it lives | Status |
|---|---|---|---|---|
| 1 | **Record on `/architecture`** | declared page / endpoint · to-do on a route · danger-deletion; any agent leads | `/architecture`, skill `declare-architecture-page-or-task`, MCP `owner_arch_create_record` | ✅ done (A1–A3) |
| 2 | **Bundle into a step** | hover **🚀 Launch** → collect all pending records into one step + remove them (**🗑 Delete** — single) | `/development-steps`, `bundleArchitecture`, MCP `owner_arch_send_to_steps`, `CLAUDE.md §6 flow-B` | ✅ done (B1–B3) |
| 3 | **Execute the step** | the agent takes the step, scaffolds the route (`scaffold-declared-route-into-component-skeleton`), writes domain code | operational pipeline `CLAUDE.md §6.4` | ✅ exists |
| 4 | **Test (pre-deploy)** | reproduce the new behavior locally / on the current server | `CLAUDE.md §6.5–6.6` (2 proofs) | ✅ exists |
| 5 | **Deploy** | build 2–4 min (only `app/`) + reload + health; deploy — the architect (rule 18) | deploy-loop `POST /api/deploy`, `CLAUDE.md §6.7–6.8` | ✅ exists |
| 6 | **Record the result** | a Deployments row + saved patterns + report; declared→built→live, README removed | `CLAUDE.md §6.8–6.11`, `/patterns` | ✅ exists |
| 7 | **Iteration / decomposition** | new records back onto `/architecture`; repeat until the tree is empty | `/architecture`, methodology §5 | ✅ exists (recursion) |

**The first link of this step** = "the `/architecture` ↔ development-steps tools" (links 1–2). Unlike
`skill-evolution-pipeline.md`, where links 3–7 are yet to be invented, here the lower links **already exist**
in the operational pipeline — our work closes the top (record → bundle) onto that existing bottom.

---

## §3. Current sub-step slicing (A1–B3) — links 1–2

What we actually build/verify in this step. The artifact type determines where it is visible in `/ai-core`.

| Sub-step | Artifact | Type | Where in `/ai-core` |
|---|---|---|---|
| **A1** | UI to create a record on `/architecture` (declare page/endpoint · to-do · order deletion) | UI | page (not the tree) |
| **A2** | skill `declare-architecture-page-or-task` (self-sufficient, HTTP API) | skill | under each agent → Skills |
| **A3** | MCP `owner_arch_create_record` | MCP | Hermes → arch-bridge :3222 (in the description) |
| **B1** | hover buttons 🚀 Launch / 🗑 Delete on pending tree nodes | UI | page (the `/architecture` tree) |
| **B2** | `bundleArchitecture`: collect all pending → one step + removal (routes `development-steps`, `architecture/{requested/[id],tasks}`) | UI+API | page |
| **B3** | MCP `owner_arch_send_to_steps` (B2 automation) | MCP | Hermes → arch-bridge :3222 (in the description) |

**Mirror of flow-A.** The map repeats the slicing of `skill-evolution-pipeline.md §3` (A1–B3) 1:1 — the same
split "create a record (A) / bundle into a step (B)", the same triad "UI · self-sufficient skill · MCP". The
only difference is the domain: there it is a skill/MCP draft, here it is a code record on `/architecture`.

**Deletion semantics on bundling.** As in flow-A: after bundling into a step the source records are
**removed** (declared README dropped, tasks cleared) — the build spec lives in the bundled step, not
duplicated on the tab. For a declared route this is agreed as the default; other behavior is a separate
decision.

---

## §4. Further automation — ~50 words per link (3–7)

Links 3–7 already work as a manual operational pipeline; below is where to **further automate** them so the
whole code development cycle is driven from a single surface (mirror of the future flow-A §5 page).

**Link 3 — execute the step from chat.** Today the agent takes the bundled step by hand. The goal — a "run
step N" chat command → the process/MCP opens the step, delegates to a suitable coder (`choose-agent` +
`delegate-task`), the agent follows `CLAUDE.md §6.4`: scaffold the skeleton → domain code. Step statuses
(open→running→done) are visible in real time on `/development-steps`.

**Link 4 — test the result.** After building the route — reproduce its behavior in a controlled environment:
locally/on the current server, before deploy. A light test harness for pages is needed (render + route API
contract), with a structured result (success/failure/2 proofs from different planes, §6.6) so link 6 can
record it and a future visualization can show it.

**Link 5 — deploy.** build 2–4 min (only `app/`) + reload + health via the deploy-loop. **The real deploy —
the architect (rule 18).** Automation: chat shows live job progress (`/api/deploy/status`), the fifth proof
is the live URL `200` after COMPLETED.

**Link 6 — record the result → patterns.** The agent writes a Deployments row
(`owner_product_loop_record_deployment`), saves extracted patterns into `/patterns`, closes the step in
COMPLETED-STEPS/, ingests it into memory. declared→built→live: the declared node's README is removed, a real
file appears. Every cycle leaves an auditable trail.

**Link 7 — iteration / decomposition.** If the step did not solve the task fully (normal) — the agent
returns new records onto `/architecture` (new declared pages / to-dos) and repeats the cycle until the tree
is empty (methodology §5). Safeguards — a depth limit (≤5/≤100 at the agent's discretion), a token budget,
checkpoints with the architect, <50% context.

---

## §5. Control surface (future) and relations

**Surface (future).** The same "AI chat on the left, artifact on the right" model as the "Skill Evolution"
page: on the left, tasks and "run / execute step" commands; on the right, the live state of the
`/architecture` tree and the deploy run (links 3–5). Designed when the automation of links 3–7 needs a
shell, so as not to build an empty frame ahead of the logic. Access — owner/architect.

**Relations.**
- **`development-methodology.md §5` (flow B)** — the general decomposition discipline; this document = its
  living case (flow B now has UI+skill+MCP parity with flow A).
- **`architecture.md`** — the `/architecture` service page: declared→built→live, README+`_meta.ts`, tasks
  API.
- **`development-steps.md`** — the steps journal (where the bundled step lands).
- **`skill-evolution-pipeline.md`** — the twin document, a **different** cycle (skill evolution). The
  cross-reference is so the two pipelines read as different, not as a duplicate.
- **`/ai-core`** — the tree where the skill (under agents → Skills) and the MCP (under Hermes → arch-bridge
  :3222) are visible.
- **MCP-REGISTRY** — `owner_arch_create_record`, `owner_arch_send_to_steps` (owner tier, §8.2 confirm-first).

---

## §6. Skill and MCP naming standard (do NOT forget)

A skill/MCP name is **4–6 words, aim closer to 6**, and **a human must immediately understand what it does**
(names are read by people, not just agents). Do not bloat beyond six, but do not under-name either.

- **MCP** — snake_case, `<tier>_<area>_<action>_<object>`; the tier (public/user/owner) is the first word;
  6 is the ceiling.
- **Skill** — kebab-case, no tier prefix, the same 4–6-word ceiling.
- The full standard — `ai-draft-settings.md §"Naming convention"` + `development-methodology.md`.

**Applied in this case:**
- The record skill — **`declare-architecture-page-or-task`** (5 words, reads at a glance).
- MCP — **`owner_arch_create_record`** / **`owner_arch_send_to_steps`** (owner tier first).
- **`scaffold-route` → `scaffold-declared-route-into-component-skeleton`** — the only grandfathered skill,
  brought into the standard in this step (link 3 references the new name).

---

## Appendix A. Growth log

Appended as progress is made (date · what was closed · which link moved to done · re-slicing, if any).

- **2026-06-19** — document created (sub-step S1). Links **1–2 = in progress** (sub-steps A1–B3 of this
  step); links **3–7 = exist** (the operational pipeline `CLAUDE.md §6.4–6.11`), connected to the bundled
  step. Principle fixed: this cycle (code development) ≠ the skill evolution cycle
  (`skill-evolution-pipeline.md`).
- **2026-06-19** — links **1–2 built** (step 126, S2b–S9): skill `declare-architecture-page-or-task`
  (in all 5 coders + Hermes), MCP `owner_arch_create_record` / `owner_arch_send_to_steps`
  (`arch-bridge :3222`), hover 🚀Launch/🗑Delete on the tree, route `{bundleArchitecture}`, node in `/ai-core`.
  `scaffold-route` → `scaffold-declared-route-into-component-skeleton` (link 3). Verification — Appendix B
  (average 89/100, local; live E2E — the architect). Links 3–7 = the existing pipeline, unchanged.

---

## Appendix B. Readiness verification (S9, 2026-06-19)

**Boundary (rule 18):** the real run on the server + deploy — the architect. This FNS clone is a flat
contract clone **with no `node_modules`**, so `tsc`/`next build` do not run here; verification is local
syntax/contract proofs + manual type checks; the live E2E across three planes below is prepared for the
architect.

**Local proofs (green):**
- `node --check arch-mcp-server.js` + `server.js` → OK.
- `mcp-access-manifest.json` is valid; `arch-bridge :3222` + both tools (owner/mutating/server).
- `bash -n bootstrap.sh` → OK; the `arch-bridge:` block is present in the Hermes-config heredoc.
- The `declare-architecture-page-or-task` skill — 5 byte-identical copies (4 coders + Hermes); §0 covered.
- Contracts verified against the real routes: the skill/MCP hit `…/architecture/{requested,tasks}` and
  `/api/development-steps {bundleArchitecture|path}` — the same signatures as in `requested/route.ts`,
  `tasks/route.ts`, `development-steps/route.ts`.
- Foreign-character scan (rule 4b) of all edits — clean.

**Live E2E template for the architect (three planes, mirror of step 125):**
1. **HTTP API** (the A2 skill path, as a coding agent calls it):
   `POST :3000/api/project/default/architecture/requested {title,kind,base,todo}` → `201`, README on disk;
   `POST …/architecture/tasks {path,kind:"todo",body}` → `201`;
   `POST :3000/api/development-steps {bundleArchitecture:true}` → `201 {architected:N}`, one step in `NEW-STEPS/`.
2. **File system**: the declared README is created, after Launch — removed (`removeRouteReadme`); a live
   route — tasks cleared (`clearTasks`); the `fractera:step` block of the step contains a section per record.
3. **MCP `:3222`** (`Authorization: Bearer $MCP_SECRET`): `tools/list` → `[owner_arch_create_record,
   owner_arch_send_to_steps]`; `owner_arch_create_record` with `dry_run:true` → preview → real;
   `owner_arch_send_to_steps {bundle_all:true, dry_run:true}` → `{pendingRecords}` → real `{architected}`.

**Readiness score 1–100** (code-complete + local proofs; "remainder" = what only the live server adds):

| Sub-step | What | Score | Remainder to 100 |
|---|---|---:|---|
| A1 | UI to create a record (declare/todo/danger) | 90 | exists (steps 103/105/108); a manual click in the browser |
| A2 | skill `declare-architecture-page-or-task` (HTTP, self-sufficient) | 92 | a real HTTP call on the server |
| A3 | MCP `owner_arch_create_record` | 88 | running the MCP protocol (`tools/call`) on the server |
| B1 | hover 🚀Launch / 🗑Delete + modal | 85 | a manual hover/click in the browser |
| B2 | `bundleArchitecture` (collect → one step + removal) | 90 | a real FS run on the server |
| B3 | MCP `owner_arch_send_to_steps` | 88 | running the MCP protocol on the server |

**Average ≈ 89/100.** Below step 125's 95 on purpose: there a live server was available for E2E, here the
entire live run is delegated to the architect (rule 18). **Conclusion:** links 1–2 of the pipeline are built
and agreed across all three planes (UI · self-sufficient skill · MCP), proven locally; live-server
confirmation remains.
