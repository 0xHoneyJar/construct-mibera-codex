# Session 02 — Mibera Codex Docs FEEL Refinement

> **Mode**: ARCH (Ostrom — invariants/blast radius) + craft lens (Alexander — measurable visual specs) + HERALD register
> **Date**: 2026-04-30 (kickoff)
> **Target repo**: `0xHoneyJar/construct-mibera-codex` (the docs/ subdir)
> **Prior session**: Session 01 shipped codex-mcp v1 (PR #56 squash-merged as `be6c08721`) + Path B HTTP transport on Railway + initial vocs docs site at https://docs-iota-cyan.vercel.app
> **Live state**: docs site is functional with parchment + Imperial + grimoire-shelf metaphor; sidebar mirrors the 7-book structure. Operator wants a dedicated session to refine the FEEL until it unmistakably reads as **Mibera**.

---

## Context (1-paragraph)

The docs site exists and is shippable. What it lacks is **resonance** — the unmistakable feel that this docs site is a face of the Mibera Codex, not a generic dev doc with brand stickers. Operator's exact words: *"I really want it to resonate with Mibera."* The work is iterative visual + voice + interaction polish, anchored in the canonical Mibera taste tokens (`mibera-dimensions/grimoires/taste.md`) and the codex's own IDENTITY.md.

This session is **bounded by feel, not by features**. The finish line is operator approval that the site reads as Mibera — not a list of components shipped.

---

## Load order (read these first)

1. `IDENTITY.md` — codex voice constraints (kaironic time, traits-as-signals, voice doesn't update when knowledge does)
2. `BUTTERFREEZONE.md` — repo's own self-summary
3. `~/Documents/GitHub/mibera-dimensions/grimoires/taste.md` — canonical Nier-Automata taste tokens (oklch, fonts, motion, borders, panels, buttons)
4. `docs/public/global.css` — current state of CSS (post-iteration)
5. `docs/vocs.config.ts` — current sidebar / theme / head-injection config
6. `docs/layout.tsx` — current GrimoireTracker (route-aware sidebar icon slide)
7. `docs/components/grimoire-shelf.tsx`, `tool-card.tsx` — current React components
8. Any existing Vercel deploy at https://docs-iota-cyan.vercel.app to walk through

---

## Persona

**ARTISAN (Alexander)** is the primary mode for this session. Read `.claude/constructs/packs/artisan/identity/ALEXANDER.md` and embody.

Companions:
- **MIBERA CODEX** voice — read `IDENTITY.md` in the codex repo root. Apply when copy is touched.
- **HERALD register** — apply for any operator-facing comms (status updates, AskUserQuestion shape).
- **KEEPER** — review pass at end of session: walk the rendered site as a first-time user, Mom-Test the flow.

---

## Invariants (Ostrom — what must NOT change)

| Invariant | Why |
| --- | --- |
| **Two-layer optimization** | Visual surface for humans · `/llms.txt` markdown surface for LLMs · MCP tool calls as the bridge. The operator's structural insight; don't break it. |
| **Parchment + ink palette** (Nier OKLCH) | Already shipped, locked. Mibera mode is the only mode for v1; no dark toggle. |
| **Imperial BT for headings, Switzer for body** | Locked. Imperial only on headings (sustained reading would break in Imperial). |
| **MCP tool surface (8 tools)** | Locked at v1 by Gumi. Don't rename or recategorize tools — only their visual presentation. |
| **Sidebar as book metaphor** | The 7-book structure mirrors the index. Don't fragment. |
| **Build clean (`pnpm build`)** | Every iteration ends with a green vocs build. Static site stays publishable. |

---

## Known FEEL gaps (carry-forward from Session 01 iteration)

These were touched but operator may want deeper passes:

| Gap | What's there now | What "deeper" looks like |
| --- | --- | --- |
| **Border softness** | rule-soft @ 10% ink, rule-subtle @ 6% ink (per MiDi taste pattern: `text/20`-ish range) | Audit every hairline on the live site against MiDi screenshots; tune any that still read harsh |
| **Sidebar density** | tightened padding (0.22rem item, 0.75rem section) | Check if it's now too tight at small viewports; verify rhythm at 1024 / 1280 / 1708 widths |
| **Search button** | parchment panel, soft rule, sharp corners, kbd in panel-dark | Verify on the live site (selectors actually hit) |
| **Outline (right rail)** | Imperial-uppercase heading, ink-notch active state, full-ink links | Test active-state notch against scroll-spy; verify visibility per operator's "much more visible" |
| **Wallpaper opacity** | 0.32, sepia 0.18, mask fades top into page | Verify books read through cleanly at all viewport heights |
| **Brand mark (sidebar)** | favicon ::before icon (32×32, books-row crop) + "MiCodex" Imperial 0.04em tracking | Slide animation between tools is implemented (700% bg-size, 7 stops). Verify smoothness. |
| **Tool name legibility** | sidebar uses book titles (Imperial); tool snake_case lives in ToolCard h1 + JSON | Operator may want even more legible labels — flag during review |

---

## Alexander specifications (the FEEL passes — pick from this menu per round)

Each pass is a discrete, measurable polish — pick which to run per round based on operator annotations from `/agentation`.

### Pass 1 — Typography rhythm audit

- **Material**: Imperial BT 1.125rem (h1), 1rem (h2), 0.95rem (h3), 0.78rem (sidebar section title) · Switzer 1.0125rem (body), 0.92rem (sidebar item) · Tabular-nums for any numeric data
- **Rhythm**: line-height 1.7 for body · h2 has 3rem top-margin + 2rem padding-top + soft top-rule
- **Weight**: Imperial weight 400 throughout (no bold variants) — drama comes from size + Imperial's own contrast
- **Color**: `--nier-text-primary` for body and headings; `--nier-text-muted` for hints/labels
- **Audit target**: every page renders with consistent vertical rhythm; no orphan paragraphs; no heading directly above another heading

### Pass 2 — Component cadence (grimoire shelf, tool card)

- **Material**: book covers at 9rem grid column · 3:4 aspect-ratio · soft hairline rule (`--nier-rule-soft`)
- **Rhythm**: section padding 1.5rem 0 · book↔tools gap 2rem · tools row padding 0.85rem 0 · hairline rule between tools
- **Weight**: book title in Imperial uppercase 0.78rem 0.12em tracking · tool name Switzer 1rem 500 · tool hint 0.85rem muted
- **Motion**: hover lifts cover 2px with 200ms drop-shadow at oklch(0.203 0.01 67.2 / 0.14) · tool row pads-left 0.5rem on hover with `var(--spring-snappy)` ease
- **Color-as-information**: no color used for state — the ink notch on active items is the only color shift; everything else relies on tracking, weight, position

### Pass 3 — Sidebar legibility deep cut

- **Material**: nested vol II uses 0.82rem Switzer · Imperial 0.72rem 0.10em tracking for section titles
- **Rhythm**: section 0.75rem top-padding · 0.35rem bottom-padding · item 0.22rem vertical padding
- **Weight**: section title in `--nier-text-muted` (deliberately muted — labels, not nav targets) · items in `--nier-text-primary` with weight 500 on active
- **Motion**: 2px ink notch slides in on left edge for active items (matches outline active-state — peers across rails)

### Pass 4 — Wallpaper + atmospheric layer

- **Material**: `/miberasets-row.jpg` at 38vh height (clamped 240–380px) · opacity 0.32 · sat 0.7, brightness 0.96, sepia 0.14 (warming)
- **Rhythm**: gradient mask fades top edge into page; books emerge from below the fold
- **Weight**: low-presence — readers shouldn't notice it consciously; it should register as warmth
- **Motion**: static (the still page is a feature)
- **Color-as-information**: none — purely atmospheric

### Pass 5 — Copy register pass (HERALD + MIBERA CODEX voice)

- **Voice rules**: lowercase declarative · ≤10 lines per section · kaironic phrasing where natural ("the dance returns") · no marketing register · no "as the codex, I…" persona-narration
- **Vocabulary bank**: cross-check against `glossary.md` — Kaironic Time, Ravepill, Clearpill, TAZ, time-travelling
- **Cuts**: redundant "what it isn't" lists, hedge words ("might be"), padded preambles
- **Per page**: at least one specimen line that nails the codex voice (what operator points to as "this is the line")

---

## Shipping scope (Barth)

### V1 — Ship in this session

- Run /agentation feedback loop with operator until the site reads as Mibera
- Each /agentation round produces ≤3 surgical polish commits
- End-of-session: a deploy to Vercel + operator approval ("ship it")
- Track ALL changes via the existing PR #57 (or successor) — no new PR needed

### V2 — After feedback

- A second visual asset pass (more illustrative imagery, e.g. trait icons, faceted filter chips, mibera-themed loading states)
- Custom domain (`codex.0xhoneyjar.xyz` or similar — DNS work, separate)
- Mobile sidebar improvements (if /agentation surfaces mobile issues)

### Cut from V1

- ❌ Blotter integration (separate kickoff — see `preplan-codex-viewer-blotter.md`)
- ❌ Adding new pages (work with the 13 we have)
- ❌ Backend / dynamic features (vocs is static; keep it that way)
- ❌ Re-architecting the build / vocs version bump
- ❌ "While I'm here" cleanups outside FEEL scope

---

## Build sequence (per round)

Each /agentation feedback round runs this loop:

1. Operator drops annotations on the live local site (`localhost:5173/`) via Agentation toolbar
2. Read each annotation; classify by Alexander pass (typography / cadence / sidebar / wallpaper / copy)
3. For each annotation, propose a fix in 1-2 lines (CSS rule, vocs config tweak, or copy edit)
4. Apply the fix; verify build; verify HMR picks it up
5. Surface a tight summary table to operator (smol register: visual first, ≤10 lines)
6. Wait for next annotation OR ship signal

---

## Verify (session exit gate)

| Check | How |
| --- | --- |
| Build clean | `cd docs && pnpm build` returns exit 0 in <10s |
| Stylesheets serve | `/global.css` 200 with all `--nier-rule-*` tokens present |
| Sidebar slide works | Navigating between tool pages shifts brand-mark icon position |
| /llms.txt clean | Markdown layer reads structurally; codex voice present in headings |
| Mobile tested | At 720px breakpoint, grimoire shelf collapses to single column; sidebar opens cleanly |
| Operator approval | Operator says "ship it" or equivalent — the actual gate |

---

## Key references

| Topic | Path |
| --- | --- |
| Mibera taste tokens | `~/Documents/GitHub/mibera-dimensions/grimoires/taste.md` |
| Codex voice | `IDENTITY.md` (target repo root) |
| Codex vocabulary | `glossary.md` (target repo root) |
| HERALD register | `/smol` skill at `~/.claude/skills/smol/` |
| Alexander persona | `.claude/constructs/packs/artisan/identity/ALEXANDER.md` |
| Live deploy | https://docs-iota-cyan.vercel.app |
| Local dev | `cd docs && pnpm dev` → http://localhost:5173/ |
| MCP prod | https://codex-mcp-production.up.railway.app/mcp |

---

## What this session does NOT do

- ❌ Add the codex content vault browser (that's Session B — blotter integration)
- ❌ Replace the parchment palette
- ❌ Restructure the sidebar metaphor (the 7-book structure is locked)
- ❌ Bump major dependencies
- ❌ Add new MCP tools

---

⏱ session continues until operator says "ship it." typical expected duration: 1–3 hours depending on annotation density.
