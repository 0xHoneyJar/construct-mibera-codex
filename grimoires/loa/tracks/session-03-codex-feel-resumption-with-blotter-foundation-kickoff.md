---
session: 03
date: 2026-05-04
type: kickoff
status: planned
operator: zksoju
prior_session: 2026-04-30 — session 02 was queued but never ran; operator returns 2026-05-04 to fire it with refresh + blotter foundation folded in
resumes: session 02 (`tracks/session-02-codex-feel-refinement-kickoff.md`)
---

# Session 03 — Mibera Codex FEEL Resumption + Blotter Foundation (kickoff)

## Scope

- **Resume session-02 plan** with refresh applied — the FEEL refinement passes 1-5 (typography · cadence · sidebar · wallpaper · copy) hold, anchored in canonical Mibera taste tokens. /agentation feedback loop with operator.
- **Add Pass 6: bug-fixes + admin sweep** — scrollbar white-bg-on-hover, page overflow at multiple widths, per-page OG card audit, MCP tool list sync (docs/pages/tools/*.mdx vs live `tools/list`), and the pre-existing TS error from cycle-B sprint-1a bridgebuilder review (storage-client/src/client.ts:126).
- **Add Pass 7: blotter foundation** (operator-folded-in 2026-05-04) — vault index at build time + `/codex/browse` route + ONE operator-picked blotter-borrowed visual pattern. Pattern lifts only · NOT a monorepo move with Gumi · proper integration deferred to V2.
- **Per-page OG card expansion** — extend the path-map vocs.config landed in PR #75 (per-grail OG cards) to cover tool pages + frontmatter pages.
- **Ship gate** — operator's "ship it" approval after walking the live deploy.

## Artifacts

- Build doc: `grimoires/loa/specs/enhance-codex-feel-refinement.md` (REFRESHED 2026-05-04 with new gaps + Pass 6 + Pass 7 + amended Cuts + amended Verify gates)
- V2 reference: `grimoires/loa/specs/preplan-codex-viewer-blotter.md` (V1-amendments noted at top · body retained as V2 reference for monorepo move)
- Track (this file): `grimoires/loa/tracks/session-03-codex-feel-resumption-with-blotter-foundation-kickoff.md`

## Prior session

Session 02 (2026-04-30) was queued — full enhance doc + persona + invariants + 5 passes + verify gates · BUT was never executed. Between then and 2026-05-04 the following shipped on the docs site (no FEEL session needed):

- 🌐 Custom domain: `codex.0xhoneyjar.xyz` live (V2 from session-02's plan completed)
- 🤖 MCP v1.4.0: live at `mcp.0xhoneyjar.xyz/codex/mcp` (moved from Railway URL)
- 📦 PR #74 MERGED: 44 grail webp variants + 88 .md updates (5MB GitHub Camo fix · 39× compression)
- 📦 PR #75 MERGED: 43 grail .mdx pages wired into vocs · sidebar regrouped into 9 categories · per-page OG cards point at grail-specific webp (Discord/Twitter unfurls show artwork)
- 📈 vocs.config.ts: 142 → 295 lines (sidebar + ogImageUrl path-map growth)

So session-03 enters with MORE content live than session-02 anticipated. The FEEL passes apply to a richer surface (43 grail pages added to scope).

## Decisions made (2026-05-04 refresh)

- **Resume session-02's structure** — the 5-pass Alexander menu (typography, cadence, sidebar, wallpaper, copy) is sound; refresh adds Pass 6 (bug-fixes) and Pass 7 (blotter foundation) without restructuring the original.
- **Blotter folded in as foundation, NOT full integration** — operator's "look into blotter HERE" + chose to fold into THIS session. V1 cut is vault-index build-time JSON + `/codex/browse` route + ONE borrowed pattern. Search · graph · editor · monorepo move all deferred.
- **Q3 embed shape AMENDED** — preplan's lean was `(b) subdomain` (codex.0xhoneyjar.xyz standalone web-blotter). Refresh changes to `(a) subroute on docs site` because codex.0xhoneyjar.xyz IS the docs site and operator wants it integrated, not bifurcated.
- **Q5 Gumi coord DEFERRED** — V1 lifts visual patterns into `docs/components/blotter-borrowed/*` directly. No import from blotter package · no monorepo refactor. V2 (proper integration) is a separate cycle when Gumi has bandwidth.
- **MCP scope STAYS LOCKED at 8 tools (visual presentation only)** for the FEEL passes — but Pass 6 includes a sync check with the LIVE server (which advertises v1.4.0). If new tools have landed (e.g. `search_codex` per memory), Pass 6 scaffolds the missing mdx · operator may opt in or defer.

## Pre-flight (operator does once before session-03 fires)

- [ ] **Clone blotter locally** — `gh repo clone 0xHoneyJar/blotter ~/Documents/GitHub/blotter && cd ~/Documents/GitHub/blotter && pnpm install`. Required for Pass 7 pattern-lift (build session needs blotter source on disk).
- [ ] **Verify codex docs build clean** — `cd ~/Documents/GitHub/construct-mibera-codex/docs && pnpm install && pnpm build`. Should be clean post-PR #75 merge. If not, fix before session-03 starts.
- [ ] **Open localhost preview** — `pnpm dev` → http://localhost:5173/. /agentation toolbar attaches here.

## Open for the build session

- /agentation feedback loop on the live local site · operator drops annotations · session lead applies surgical fixes
- Each /agentation round = 1-3 polish commits, build verification, deploy
- Pass 6 bug fixes can run in early rounds (low cognitive cost)
- Pass 7 blotter foundation is the heaviest single work item — likely 1-2 dedicated rounds late in the session
- End-of-session: Vercel auto-deploys from main; verify on https://codex.0xhoneyjar.xyz; operator "ship it"

## Blast radius (refreshed 2026-05-04)

- **Touched files** (per round, surgical):
  - `docs/public/global.css` — typography, scrollbar, overflow rules
  - `docs/vocs.config.ts` — sidebar tweaks, OG path-map expansion
  - `docs/components/*.tsx` — existing components (cadence)
  - `docs/components/blotter-borrowed/*.tsx` — NEW directory for Pass 7 (1-2 components)
  - `docs/pages/codex/browse.mdx` — NEW page for Pass 7 (vault browser)
  - `docs/pages/tools/*.mdx` — sync sweep if MCP added tools
  - `docs/scripts/build-vault-index.ts` — NEW (build-time vault index generator) for Pass 7
  - `docs/public/vault-index.json` — NEW (build artifact · gitignored OR committed; kickoff defers to operator)
- **NOT touched**: server code (`bin/`, `src/`), MCP transport, tool definitions, `beacon.yaml`, blotter repo (it's the source · we copy patterns, not modify)
- **DEPENDENCY changes**: probably zero new packages for Pass 7 V1 (vanilla React + vocs is enough · no lunr/flexsearch · no graph lib)
- **Risk**: low-medium — Pass 1-6 reversible in seconds (CSS/copy edits) · Pass 7 introduces a new route + build step (recoverable but more surface area · circuit-breakerable via /run-halt if /agentation surfaces issues)

## Reversibility

- Every iteration ends with `pnpm build` clean
- HMR picks up CSS + component changes live; rollback = git checkout the file
- Pass 7 vault-index build step is idempotent · can be removed in one commit if scope creeps
- Worst case: revert this session's PR to the merge commit, redeploy

## What was specifically NOT done in this kickoff

- No code written (this is a planning artifact)
- No Gumi outreach (Pass 7 V1 lifts patterns from public blotter source · doesn't require coord · V2 monorepo move is its own cycle)
- No deploy (deploy is the build session's exit gate)
- No /agentation round started (the /agentation feedback loop kicks in when build session fires)
- No live MCP tools/list probe with proper init handshake (left for build session Pass 6 · the kickoff's curl probe was just shape-validation)

## Gotchas + meta-notes for next session

- **vocs.config.ts ogImageUrl path-map LAST-match-wins semantics** — already documented in the file's comments (per PR #75 · cancer.mdx work). When adding tool/index OG overrides in Pass 6, put `**` catch-all FIRST, more-specific routes LAST.
- **YAML frontmatter `#` parsing** — caught in PR #75 work (mdx description with `Grail #8620` truncated to `"Grail"`). Always quote descriptions with `#`.
- **Pre-existing TS error not in Pass 6 critical path** — `packages/storage-client/src/client.ts:126` is in freeside-storage repo, not construct-mibera-codex. Operator-bounded fix · separate PR if folded in.
- **Asset substrate doctrine alignment** — the per-page OG card expansion in Pass 6 composes with `[[asset-pipeline-as-mutable-cdn-substrate]]` (operator-validated 0.80 in vault). Per-page OG variants are the kind of thing the asset-pipeline serverless transform endpoint will eventually generate · for now they're statically referenced URLs in vocs.config.ts.
- **MCP tool list sync is operator-paced** — the brief said "ideally we don't have to constantly maintain it but if we do that's okay for now." Pass 6 surfaces drift; doesn't force a rebuild unless drift is large.
