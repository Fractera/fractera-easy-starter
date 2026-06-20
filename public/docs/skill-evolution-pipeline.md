# Skill Evolution Pipeline — living standard

> **This is a living META-document for one case.** It describes the end-to-end intent — a **continuous
> skill/MCP evolution pipeline** — and keeps the goal in focus while we slice it into sub-steps. The
> document **grows with development**: every closed sub-step moves a link of the cycle from `todo` to `done`
> and appends to the growth log (Appendix A). Authored in Russian (the language of the authoritative
> intent); this is the English port.
>
> **The twin document — a DIFFERENT cycle.** [`architecture-dev-pipeline.md`](./architecture-dev-pipeline.md)
> describes the **code development** cycle (`/architecture → development-steps`, flow-B). This document is
> about the **skill/MCP evolution** cycle (`/ai-draft-settings → development-steps`, flow-A). Both converge
> on the steps journal and share the decomposition discipline, but they are **different** pipelines — do not
> confuse or merge them.
>
> **Builds on** (folder `CRUD-DOCS/workspace-standards/`):
> [`development-methodology.md`](./development-methodology.md) — the master methodology (this doc = its
> concrete application) · [`ai-draft-settings.md`](./ai-draft-settings.md) — the draft layer ·
> [`development-steps.md`](./development-steps.md) — the steps journal · [`development-loop.md`](./development-loop.md).
> The agent's operational pipeline — `app/CLAUDE.md §6` (`flow-A`: trigger 4 = agent drafts → step).

---

## §0. Goal and vision

**Goal.** Build a **continuous agent evolution pipeline**: a mechanism that takes one skill (and its
associated MCP) and drives it to fully solve its task through repeating cycles of
"task → execution → test → analysis → instruction rewrite", however many cycles it takes.

**Focus — one skill at a time.** We evolve not everything at once, but a **single** skill until it starts
solving its task fully. The reference complex example is the skill **"reaching out to YouTube bloggers"**
(see §1): a non-trivial goal on which all links of the cycle are visible.

**The process lead is any agent (a §0 self-sufficiency given).** It is **unknown in advance** who will run
the cycle: Hermes, a single Codex, any of the five coders — or a single agent with no Hermes and no memory.
The pipeline must work under **any** subset of entities. Therefore each link is made self-sufficient (skill +
MCP duplicated to every agent), not tied to Hermes.

**Surface — the "Skill Evolution" page (future, §5):** an AI chat on the **left**, a result-tracking
artifact on the **right**. In the chat I give tasks; sometimes in the UI I add tasks to a **draft**. I say
"run the skill" — the chat calls a process/MCP that bundles the drafts into a step, launches execution, runs
the test, draws the result in the artifact, analyzes it and rewrites the skill/MCP instructions. Repeat — 1
cycle or 500, until the completeness criterion.

**Where we are now.** At the **first, early stage**: the mechanism for working with a **draft** of
instructions / skills / MCP and bundling drafts into a step is built (links 1–2). The evolution cycle itself
(execution → test → visualization → rewrite → repeat) does not exist yet.

**Layer.** product / FNS (`CRUD-DOCS/…`) — ships to the customer with the clone; describes the agent's work
**inside the deployed workspace**.

---

## §1. Reference case — the "reaching out to YouTube bloggers" skill

The end-to-end example we run the pipeline on. The skill is complex enough to require many cycles: find
relevant bloggers, compose a personal outreach, hold the tone, handle the reply, bring it to an agreement. It
has both a **skill** (how the agent thinks about outreach), an **MCP** (how it actually sends/reads
messages), and a **measurable result** (replies, agreements) — that is, all three axes the cycle must
evolve. As the document grows, case specifics are added here.

---

## §2. The 7-link cycle (canonical map)

State is updated as sub-steps close.

| # | Link | What happens | Where it lives | Status |
|---|---|---|---|---|
| 1 | **Task draft** | in chat/UI I add wishes to a draft; any agent leads | `/ai-draft-settings`, skill `propose-new-agent-skill-or-mcp`, MCP `owner_draft_create_record` | ✅ done (A1–A3) |
| 2 | **Bundle into a step** | "run the skill" → bundle pending drafts into one step + remove them | `/development-steps`, 🚀/🗑 buttons, MCP `owner_draft_send_to_steps`, `CLAUDE.md §6.1 flow-A` | ✅ done (B1–B3) |
| 3 | **Execute the step from chat** | the chat launches execution of the open step (the agent takes it on) | — | ⏳ todo |
| 4 | **Test the result** | fake data OR real actions; running the skill/MCP | — | ⏳ todo |
| 5 | **Visualization** | the live artifact on the right shows the run result | — | ⏳ todo |
| 6 | **Analysis → rewrite** | the agent analyzes the result, forms updated skill/MCP instructions | — | ⏳ todo |
| 7 | **Iteration** | repeat 1–500 cycles until the "skill/MCP solves the task fully" criterion | — | ⏳ todo |

---

## §3. Current sub-step slicing (A1–B3) — links 1–2

What is actually built at the early stage (step 123). The artifact type determines where it is visible in
`/ai-core`.

| Sub-step | Artifact | Type | Where in `/ai-core` |
|---|---|---|---|
| **A1** | UI to create a draft on `/ai-draft-settings` | UI | page (not the tree) |
| **A2** | skill `propose-new-agent-skill-or-mcp` (self-sufficient, HTTP API) | skill | under each agent → Skills |
| **A3** | MCP `owner_draft_create_record` | MCP | Hermes → ai-draft-bridge :3221 (in the description) |
| **B1** | hover buttons 🚀 Launch / 🗑 Delete on the `req` row | UI | page (not the tree) |
| **B2** | bundle all pending → one step + per-draft delete (routes `development-steps`, `ai-draft-settings/[id]`) | UI+API | page (not the tree) |
| **B3** | MCP `owner_draft_send_to_steps` (B2 automation) | MCP | Hermes → ai-draft-bridge :3221 (in the description) |

**Slicing lesson (for a future re-slice):** A1–B3 closed the **creation and bundling** of drafts, but link 2
is currently "bundling", not an "**execution queue**". When planning link 3, the Steps tab should be extended
into a queue from which the chat launches execution — this removes the seam between links 2 and 3.

---

## §4. Further automation — ~50 words per link (3–7)

**Link 3 — execute the step from chat.** The chat should be able not only to move drafts into a step, but
also to **launch** its execution: a "run step N" command → the process/MCP opens the step, delegates to a
suitable agent (`choose-agent` + `delegate-task`), the agent follows `CLAUDE.md §6.4–6.8`. Connect the Steps
tab to an executor; step statuses (open→running→done) visible in real time.

**Link 4 — test the result.** After execution — run the skill/MCP in a controlled environment: either **fake
data** (seeding inputs without external effects) or **real actions** with permission. A test harness is
needed: fixtures, stand-ins for external services, isolation from prod effects. The run result is structured
(success/failure/metrics) so link 6 can analyze it and link 5 can show it.

**Link 5 — visualize the result.** The artifact on the right of the "Skill Evolution" page draws the **live**
outcome of the run: what the skill did, what the MCP returned, where it failed. An event stream from link 4 →
a panel (table/log/diagram). The goal — to see in seconds and few tokens whether the skill advanced, without
reading raw logs. Updates as the run proceeds, not on request.

**Link 6 — analysis → instruction rewrite.** The agent compares the result with the goal, finds gaps, and
**forms updated instructions** for the skill (how to think) and the MCP (what to call / which parameters).
The edits go through the draft layer (`ai-draft-settings`) → a new step, not by blindly editing live files.
This way every cycle leaves an auditable trail of the skill's evolution.

**Link 7 — iteration.** Links 3–6 repeat automatically: 1 cycle or 500. A **stopping criterion** is needed
(the skill/MCP solves the task fully: a metric threshold from link 4) plus safeguards — a cycle limit, a
token budget, mandatory checkpoints with the architect. Between cycles — do not idle: extract patterns, keep
<50% context (`CLAUDE.md §6.4`).

---

## §5. The "Skill Evolution" page (future surface)

A dedicated product page: **AI chat on the left, the result artifact on the right** (the ai-elements
pattern). On the left I give tasks and "run the skill / execute the step" commands; on the right — a live
visualization of the run (link 5). Access — owner/architect (managing the evolution). It is a UI shell over
links 3–7; designed when those links appear, so as not to build an empty frame ahead of the logic.

---

## §6. Relations

- **`development-methodology.md`** — the general discipline; this document = its living case.
- **`ai-draft-settings.md`** + **`CLAUDE.md §6.1 flow-A`** — the draft layer and the "draft → step" rule.
- **`development-steps.md`** — the steps journal (where the bundled step lands; the future execution queue).
- **`/ai-core`** — the tree where the skill (under agents) and the MCP (under Hermes → ai-draft-bridge :3221)
  are visible.
- **MCP-REGISTRY** — `owner_draft_create_record`, `owner_draft_send_to_steps` (owner tier, §8.2
  confirm-first).

---

## §7. Skill and MCP naming standard (do NOT forget)

A skill/MCP name is **4–6 words, aim closer to 6**, and **a human must immediately understand what it does**
(names are read by people, not just agents). Do not bloat beyond six, but do not under-name either: two terse
words a human cannot decode is a bad name.

- **MCP** — snake_case, `<tier>_<area>_<action>_<object>`; the tier (public/user/owner) is the first word;
  6 is the ceiling.
- **Skill** — kebab-case, no tier prefix, the same 4–6-word ceiling.
- The full standard — `ai-draft-settings.md §"Naming convention"` + `development-methodology.md`.

**Applied in this case:** the skill `create-draft` (2 words, unclear to a human what it does) was **renamed
to `propose-new-agent-skill-or-mcp`** (6 words, reads at a glance). The MCP tools
`owner_draft_create_record` / `owner_draft_send_to_steps` already conform. `scaffold-route` was brought into
the standard — renamed to `scaffold-declared-route-into-component-skeleton`.

**For the future (link 6):** when a draft turns into a real skill/MCP, the name generator MUST output a
4–6-word human-readable name — this will become part of link 6's automation.

---

## Appendix A. Growth log

Appended as progress is made (date · what was closed · which link moved to done · re-slicing, if any).

- **2026-06-19** — document created. Links **1–2 = done** (sub-steps A1–B3, step 123). Links 3–7 = todo.
  A slicing lesson fixed: link 2 = "bundling", needs to be extended to an "execution queue" when planning
  link 3.
- **2026-06-19** — readiness verification of A1–B3 (Appendix B); the skill `create-draft` renamed to
  `propose-new-agent-skill-or-mcp` per §7; §7 added (naming standard).

---

## Appendix B. Readiness verification (E2E, 2026-06-19)

**Environment.** aifa.dev (secure), slot `/opt/fractera/app` = FNS main `6b4df60`, a fresh build
(`fractera-app` restarted 10:24 UTC), MCP `:3221` alive. **Method:** (1) the self-sufficient HTTP path
`:3000/api/...` with `X-Agent-Identity` — as a coding agent calls it; (2) the MCP `:3221` itself (JSON-RPC
`tools/list` / `tools/call`, §8.2 `dry_run`). All test drafts and steps were removed after the test.

**Results (raw):**
- The tree API (authorized GET) → `200`, 6 agents (Hermes + 5 coders).
- Creating `claude-code/skill` → `201`, the file `CLAUDE-CODE/SKILLS/01-…md` appeared on disk.
- PATCH (source + tasks) → `200`.
- **Launch `bundleAll`** → `201`, `drafted=2`, the step "Apply 2 AI-draft wishes" created with both wishes in
  the body; drafts removed (FS + authorized GET = 0).
- **Delete (per-draft)** → `{"ok":true}`, gone from the tree.
- **MCP `tools/list`** → `['owner_draft_create_record','owner_draft_send_to_steps']`.
- **MCP `owner_draft_create_record`**: `dry_run` → preview (no write) → real `{"created":true}`, file on disk.
- **MCP `owner_draft_send_to_steps`**: `dry_run` → `{"pendingDrafts":1, confirm_prompt}` → real
  `{"created":true,"step":"Apply 1 AI-draft wish","drafted":1}`, the draft removed.
- **§0 self-sufficiency:** the skill is in `.claude`/`.gemini`/`.qwen` (their own folders) + `.agents`
  (read by codex/kimi) + Hermes — all 6 agents covered.

**Readiness score 1–100:**

| Sub-step | What | Score | Remainder to 100 |
|---|---|---:|---|
| A1 | UI to create a draft | 90 | a manual click in the browser |
| A2 | skill (HTTP, self-sufficient) | 95 | — |
| A3 | MCP `owner_draft_create_record` | **100** | proven via the MCP protocol + §8.2 |
| B1 | hover buttons 🚀/🗑 | 88 | a manual hover in the browser |
| B2 | Launch (bundle) + Delete | 97 | — |
| B3 | MCP `owner_draft_send_to_steps` | **100** | proven via the MCP protocol + §8.2 |

**Average ≈ 95/100. Conclusion:** links 1–2 of the pipeline are functionally complete and deployed; the path
"draft → bundle → step" is proven across three planes (API · file system · MCP protocol).
