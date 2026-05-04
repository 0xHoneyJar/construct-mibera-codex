# Session 02 — Mibera Codex Docs FEEL Refinement
# (REFRESHED 2026-05-04 · session was queued 2026-04-30, never executed · operator resumes as session-03 with blotter foundation folded in)

> **Mode**: ARCH (Ostrom — invariants/blast radius) + craft lens (Alexander — measurable visual specs) + /smol register
> **Date**: 2026-04-30 (original kickoff) · **2026-05-04 refresh** (this revision)
> **Resumed as**: session-03 (`grimoires/loa/tracks/session-03-codex-feel-resumption-with-blotter-foundation-kickoff.md`)
> **Target repo**: `0xHoneyJar/construct-mibera-codex` (the docs/ subdir)
> **Prior session**: Session 01 (2026-04-30) shipped codex-mcp v1 (PR #56 squash-merged as `be6c08721`) + Path B HTTP transport on Railway + initial vocs docs site
> **Live state at refresh time** (2026-05-04):
> - 🌐 docs live at **https://codex.0xhoneyjar.xyz** (custom domain — V2 shipped)
> - 🤖 MCP v1.4.0 live at **https://mcp.0xhoneyjar.xyz/codex/mcp** (moved from Railway URL · server self-reports `micodex-mcp v1.4.0`)
> - 📦 PR #74 MERGED: grail webp variants (5MB GitHub Camo fix · 44 grails compressed 39× · sibling-name `.webp` at canonical S3 path)
> - 📦 PR #75 MERGED: 43 grail .mdx pages wired into vocs · sidebar regrouped into 9 categories under "Mibera Maker · Vol I" · per-page OG cards point at grail-specific webp (Discord/Twitter unfurl shows the artwork)
> - 📈 vocs.config.ts: 142 → 295 lines (sidebar + ogImageUrl path-map growth)
> - 📚 Operator wants this FEEL session to refine the docs site until it unmistakably reads as **Mibera** AND lay the foundation for blotter integration (folded in from preplan · was Session B, now Pass 7 of this session)

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

## Persona (composed · 5 expert constructs · 2026-05-04 PM enhancement)

The session loads multiple constructs and embodies them simultaneously per pass · operator's reframe: "ensure we are calling on our expert constructs" — the navigation-layer work is multi-construct by design.

**Primary**:
- **ALEXANDER** (artisan/craft) — `.claude/constructs/packs/artisan/identity/ALEXANDER.md` · visual specification (oklch · spacing · weight · motion · color-as-information). Primary for all 7 passes.

**For Pass 7 specifically (graph + navigation layer)**:
- **the-easel** (design system) — token vocabulary + component composition · ensures Pass 7 graph composes with existing parchment + Imperial + nier-rule material vocabulary
- **KANSEI** (interactivity feel) — graph hover/click motion · spring constants · easing for navigation transitions · what "spatial" feels like in the parchment palette
- **the-weaver** (path composition) — `.claude/constructs/packs/observer/identity/WEAVER.md` · maps composition across rails (book-shelf + interactive-graph + outline) · catches redundancy or fragmentation

**For all passes**:
- **MIBERA CODEX voice** — read `IDENTITY.md` in the codex repo root. Apply when copy is touched.
- **/smol register** — apply for any operator-facing comms (status updates, AskUserQuestion shape).
- **KEEPER** (listener) — `.claude/constructs/packs/observer/identity/KEEPER.md` · review pass at end of session: walk the rendered site as a first-time visitor · Mom-Test the navigation grammar · would Gumi (the lorekeeper who designed blotter) recognize her own work surfacing here?

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

## NEW gaps surfaced 2026-05-04 (operator's resumption brief)

| Gap | Evidence | Diagnosis lead |
| --- | --- | --- |
| **Page overflow** | "some parts that are just kind of overflowing the page" (operator) | Audit at 1024/1280/1708/2400 widths — likely culprits: long `<pre>` blocks in install snippets, JSON examples in tool pages, grail body MDX (cancer / past have long Cultural Context). `overflow-wrap: break-word` may need tightening at code blocks. Check `max-width` on docs/dist outputs. |
| **Scrollbar white-bg on hover** | "scroll bar sometimes, on hover, shows a white background" (operator) | global.css has only 3 overflow refs (lines 928, 1022, 1023) — NO `::-webkit-scrollbar*` rules. The hover-white is vocs's default browser-style scrollbar. Fix: add custom `::-webkit-scrollbar`, `::-webkit-scrollbar-thumb`, `::-webkit-scrollbar-track` rules using nier-bg-panel-dark and nier-rule-soft tokens. |
| **OG image defaults** | per-grail OG cards landed in PR #75 (cancer.webp etc) but tool pages, index, install, quickstart, anti-hallucination still serve generic codex.0xhoneyjar.xyz/og.png | Audit `vocs.config.ts` ogImageUrl path-map — add per-tool OG variants OR generate richer per-page Mibera-branded OG cards for the 8 tool pages + 5 frontmatter pages. Composes with `[[asset-pipeline-as-mutable-cdn-substrate]]` doctrine — variants are operator-mutable. |
| **MCP tool sync** | docs/pages/tools/ has 8 mdx · MCP server claims v1.4.0 with up-to-9 tools (per memory `search_codex` lookup may exist) | Live probe `tools/list` against `mcp.0xhoneyjar.xyz/codex/mcp` (proper MCP initialize handshake required) → diff against `docs/pages/tools/*.mdx` filenames. If `search_codex` (or any other tool) present on server but missing in docs, generate the mdx scaffold (same shape as `lookup_grail.mdx` template). Operator named: "ideally we don't have to constantly maintain this but if we do that's okay for now." |

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

### Pass 5 — Copy register pass (/smol + MIBERA CODEX voice)

- **Voice rules**: lowercase declarative · ≤10 lines per section · kaironic phrasing where natural ("the dance returns") · no marketing register · no "as the codex, I…" persona-narration
- **Vocabulary bank**: cross-check against `glossary.md` — Kaironic Time, Ravepill, Clearpill, TAZ, time-travelling
- **Cuts**: redundant "what it isn't" lists, hedge words ("might be"), padded preambles
- **Per page**: at least one specimen line that nails the codex voice (what operator points to as "this is the line")

### Pass 6 — Bug-fixes + admin sweep (NEW · operator's 2026-05-04 brief)

Surgical fixes outside the FEEL passes — small, reversible, ship in same /agentation rounds:

- **Scrollbar styling** — add to `docs/public/global.css`:
  ```css
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-track { background: var(--nier-bg-panel-dark); }
  ::-webkit-scrollbar-thumb { background: var(--nier-rule-medium); border-radius: 0; border: 2px solid var(--nier-bg-panel-dark); }
  ::-webkit-scrollbar-thumb:hover { background: var(--nier-text-muted); }
  ```
  Replaces vocs's default white-on-hover with parchment-themed track + ink-toned thumb.
- **Overflow audit** — at 4 viewport widths (1024/1280/1708/2400) walk every page; flag elements with horizontal overflow. Likely fixes: `overflow-wrap: break-word` on `<code>` and `<pre>`, `max-width: 100%` on `<img>` and `<video>`, `min-width: 0` on flex children that contain text.
- **Per-page OG card audit** — extend `vocs.config.ts ogImageUrl` path-map. Per-tool: generate 8 tool-specific OG cards (tool name + tier + miberasets-row excerpt) OR re-use codex.og.png with overlay text via canvas (build-time generated). Frontmatter pages (index, install, quickstart, anti-hallucination, discovery, coverage-gaps) get a single shared "MiCodex" OG variant.
- **MCP tool list sync** — live-probe with proper MCP initialize handshake:
  ```bash
  # Step 1: initialize (seek session header from response)
  curl -s -X POST https://mcp.0xhoneyjar.xyz/codex/mcp \
    -H "Content-Type: application/json" \
    -H "Accept: application/json,text/event-stream" \
    -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"sync-probe","version":"0.1"}}}'
  # Step 2: notifications/initialized + tools/list with the mcp-session-id header
  ```
  Diff result against `docs/pages/tools/*.mdx`. If new tools (e.g., `search_codex`), scaffold mdx pages from `lookup_grail.mdx` shape.
- **Pre-existing TS error from PR #8 review** — `packages/storage-client/src/client.ts:126` has TS2322 (Effect<unknown,...> not assignable to Effect<MetadataDocument,...>). Surfaced during cycle-B sprint-1a bridgebuilder review. Fix is small (`as Effect<MetadataDocument, …>` cast OR proper Schema decode). Out-of-scope for FEEL but operator may want to fold in if context is open.

### Pass 7 — Blotter as navigation layer (REFRAMED 2026-05-04 PM · operator's enhancement)

> **Intention reframe (operator 2026-05-04 PM)**: blotter is **NOT a viewer · it's a NAVIGATION LAYER**. Lorekeeper @gumibera designed blotter for "vaults with 10,000+ notes." The Mibera Codex IS that vault (~1500+ markdown · 120 core-lore + 1,349 traits + 44 grails + 13 mibera-sets). Pass 7 isn't building a separate browser — it's exposing the codex's navigation grammar as Gumi designed it. The codex docs site IS the codex's public-facing surface; the navigation layer should make the vault topology visible.

#### Visual precedent: Obsidian Help right-rail pattern

```
┌─────────────────────────────────────────────────────────────┐
│  ┌─ left rail ─┐ ┌──── main content ────┐ ┌─ right rail ─┐ │
│  │ nav tree    │ │  page heading        │ │ INTERACTIVE  │ │
│  │ (hierarchy) │ │                       │ │ GRAPH        │ │
│  │             │ │  body markdown        │ │ ↳ force-dir  │ │
│  │ Home        │ │  with wikilinks +     │ │ ↳ ~15 nodes  │ │
│  │ Get started │ │  cross-refs           │ │ ↳ centered   │ │
│  │ ...         │ │                       │ │   on page    │ │
│  │             │ │                       │ │              │ │
│  │             │ │                       │ │ ON THIS PAGE │ │
│  │             │ │                       │ │ ↳ outline    │ │
│  └─────────────┘ └───────────────────────┘ └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
       ↑                                          ↑
  hierarchical nav                        SPATIAL nav (graph)
   (matches today)                        (NEW · is what blotter
                                           contributes)
```

Reference: https://help.obsidian.md/Home (right-rail pattern · "INTERACTIVE GRAPH" + "ON THIS PAGE"). The codex docs already has the left rail (book-shelf hierarchy) and `ON THIS PAGE` outline; what's missing is the **spatial-topology layer** — the interactive graph that makes wikilink relationships navigable.

#### Expert constructs (composed)

| Construct | Identity file | Role in Pass 7 |
| --- | --- | --- |
| **ALEXANDER** | `.claude/constructs/packs/artisan/identity/ALEXANDER.md` | primary · visual specification (oklch · spacing · weight · motion · color-as-information) for graph + outline |
| **the-easel** | `.claude/constructs/packs/the-easel/...` | design system layer · ensures graph component composes with parchment + Imperial + nier-rule tokens · doesn't break the codex's existing material vocabulary |
| **KANSEI** | (interactivity feel) | graph hover/click motion · spring constants for node nudge · easing for camera pan when navigating into a node · what "spatial" feels like in the parchment palette |
| **KEEPER** | `.claude/constructs/packs/observer/identity/KEEPER.md` | listener pass · walks the rendered site as first-time visitor · Mom-Test the navigation: "would Gumi's lorekeeper-intended grammar surface here?" · catches if the graph reads as decoration rather than navigation |
| **the-weaver** | `.claude/constructs/packs/observer/identity/WEAVER.md` | path composition · how does the spatial nav (graph) COMPOSE with the existing book-shelf hierarchy (left rail) and outline (right-rail bottom) · weaver checks for redundancy or fragmentation across rails |

All five embody simultaneously. ALEXANDER specifies; KANSEI tunes feel; the-easel keeps system coherent; KEEPER tests reception; the-weaver maps composition across rails.

#### V1 cut (refreshed)

Three deliverables, BARTH-bounded — interactive-graph is now the **lead** borrowed pattern (was one of 4 options · operator's reframe promotes it):

1. **Vault index at build time** — vocs prebuild script that walks `core-lore/` + `traits/` + `grails/` + `mibera-sets/` + `_codex/data/grails.jsonl`, produces `docs/public/vault-index.json` with `{ id, type, title, slug, path, tags, frontmatter, body_excerpt, backlinks, edges }`. Edges = wikilink graph derived from markdown body parsing. ~1500 entries · ~500-2000 KB JSON. Static · no server.

2. **Right-rail INTERACTIVE GRAPH component** (`docs/components/blotter-borrowed/interactive-graph.tsx`) — force-directed mini-graph in the right rail · centered on current page's node · shows 1-2 hops out · click = navigate to that node · hover = highlight edges · uses parchment + ink palette + nier-rule borders · pure-React + d3-force OR vanilla canvas (no graph library if footprint matters). Width matches existing right-rail outline. Lives ABOVE `ON THIS PAGE`. Position: right-rail TOP. Reference: Obsidian Help screenshots.

3. **`/codex/browse` route** as secondary surface — page at `docs/pages/codex/browse.mdx` with full-graph view + faceted filter sidebar + card grid (uses `consumer-card.tsx` aesthetic). For when readers want the full vault topology, not the per-page neighborhood. Click-through to source markdown.

NOT in V1: search, live editor, command palette, graph filtering by tag (just per-type for V1), backlink panel inline (TOC outline already covers most cases · wikilink hover-preview is the bridge).

#### Q1-Q5 leans (refreshed for navigation-layer framing)

| Q | Lean | Note |
| --- | --- | --- |
| Q1 data architecture | (a) build-time bundle — pure static JSON · vault-index.json + edges | static is fine for ~1500 entries · graph compute is per-page per-render (small) |
| Q2 repo structure | V1 lifts patterns into `docs/components/blotter-borrowed/*.tsx` · Q5 monorepo deferred to V2 | confirmed |
| Q3 embed shape | (a) subroute INSIDE docs site — right-rail graph on every page + `/codex/browse` as full-graph route | confirmed (was AMENDED in 2026-05-04 morning · this PM reframe locks it) |
| Q4 V1 cut | vault-index + right-rail interactive graph + /codex/browse full-graph | promoted graph from "one of four options" to lead deliverable |
| Q5 Gumi coord | DEFERRED to V2 | V1 honors her intent (lorekeeper-designed-navigation) by adopting blotter's grammar · doesn't require her hands today |

#### Pre-flight (operator does once before session-03 fires)

```bash
gh repo clone 0xHoneyJar/blotter ~/Documents/GitHub/blotter
cd ~/Documents/GitHub/blotter && pnpm install
# Inspect blotter's graph view component as the reference shape
ls ~/Documents/GitHub/blotter/src/components/ | grep -i graph
```

Need blotter source locally to lift graph-view patterns. Gumi's existing graph-view code in blotter is the strongest reference — look there before reinventing.

#### Doctrine alignment

This Pass composes with `[[chathead-in-cache-pattern]]` (per-token rich data belongs in canonical metadata · here: per-md edges/backlinks belong in vault-index, not composed at every consumer) AND with `[[asset-pipeline-as-mutable-cdn-substrate]]` (vault-index is metadata-shaped substrate · downstream readers read variants · here: graph component reads edges, not composes them). Lorekeeper's intent matches the substrate doctrine — declared, not derived.

#### Pre-flight (operator does once before session-03 fires)

```bash
gh repo clone 0xHoneyJar/blotter ~/Documents/GitHub/blotter
cd ~/Documents/GitHub/blotter && pnpm install
```

Need blotter source locally to lift patterns. Check the build session's load-order before starting.

#### V1 cut for blotter foundation in this session

Three deliverables, BARTH-bounded:

1. **Vault index at build time** — vocs prebuild script that walks `core-lore/` + `traits/` + `grails/` + `mibera-sets/` + `_codex/data/grails.jsonl`, produces `docs/public/vault-index.json` with `{ id, type, title, slug, path, tags, frontmatter, body_excerpt, backlinks }`. ~1500 entries · ~500-2000 KB JSON. Static · no server.
2. **`/codex/browse` route** — single new vocs page at `docs/pages/codex/browse.mdx` that imports a `<VaultBrowser>` React component. Component: faceted filter sidebar (type · category · era) + grid view of cards (uses `consumer-card.tsx` aesthetic) + click-through to source markdown via raw.githubusercontent.com URL OR vocs route if mappable. **NO** live editor, **NO** graph view, **NO** infinite canvas, **NO** command palette in V1.
3. **ONE blotter-borrowed visual pattern** — operator's pick in /agentation round 1: (a) gallery view with image previews (great for grails) · (b) backlink panel under each grail/trait page · (c) link-hover preview popovers · (d) outline/TOC density. ONE only. Scope discipline.

#### Q1-Q5 leans (preplan said these · operator confirms or amends in /agentation round 0)

| Q | Lean | Operator amend? |
| --- | --- | --- |
| Q1 data architecture | (a) build-time bundle — pure static JSON | confirm |
| Q2 repo structure | **AMENDED for V1**: components live in `construct-mibera-codex/docs/components/blotter-borrowed/*.tsx` (NOT a monorepo move yet) — Gumi coord deferred to V2 | confirm |
| Q3 embed shape | **AMENDED**: subroute `/codex/browse` INSIDE docs site (was preplan's (b) subdomain — operator's "look into blotter HERE" reframes to (a) subroute) | confirm |
| Q4 V1 cut | browse + faceted filter + ONE borrowed pattern. Search/graph/editor are V2. | confirm |
| Q5 Gumi coord | **DEFERRED to V2** — V1 lifts patterns, doesn't import from blotter package. V2 is the proper monorepo move with Gumi alignment. | confirm |

#### Blotter pattern lift — visual pseudocode

Reference shape (operator picks during /agentation round 1):

```tsx
// docs/components/blotter-borrowed/vault-browser.tsx
import vaultIndex from '/vault-index.json' with { type: 'json' };

export function VaultBrowser() {
  const [filter, setFilter] = useState({ type: 'all', category: null });
  const filtered = useMemo(() => filterEntries(vaultIndex, filter), [filter]);
  return (
    <div className="vault-browser">
      <FacetSidebar {...} />
      <CardGrid entries={filtered} />
    </div>
  );
}
```

Visual material: parchment panels · Imperial section titles · Switzer body · soft hairline rules · 9rem grid columns (matches grimoire-shelf cadence) · ink-notch active state on facet selections.

#### Out of scope for V1 (deferred to Session B / V2)

- ❌ Full search (would need lunr/flexsearch · adds deps · scope creep for one session)
- ❌ Graph view (force-directed layout · separate complexity beast)
- ❌ Live editor (read-only is fine for v1)
- ❌ Command palette (vocs has its own search ⌘K — don't duplicate)
- ❌ Tab management / split view
- ❌ Monorepo move with Gumi (its own architectural cycle · proper coordination required)
- ❌ Incremental indexing / hot-reload of vault during dev (build-time is fine)

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

### Cut from V1 (refreshed 2026-05-04)

- ~~❌ Blotter integration (separate kickoff)~~ — **operator-folded-in 2026-05-04 as Pass 7 (foundation only · NOT full integration)**
- ❌ Full search (lunr/flexsearch deps · separate cycle)
- ❌ Graph view (force-directed layout · own complexity)
- ❌ Live editor in vault browser (read-only V1)
- ❌ Command palette (vocs has ⌘K already)
- ❌ Adding 100s of new MDX pages — vault browser exposes existing markdown via card grid + raw URLs · doesn't duplicate as docs pages
- ❌ Backend / dynamic features (vocs is static; keep it that way · vault index is build-time JSON)
- ❌ Re-architecting the build / vocs version bump
- ❌ Monorepo move with Gumi for blotter package — V2 cycle
- ❌ "While I'm here" cleanups outside FEEL/bug-fix/foundation scope

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

## Verify (session exit gate · refreshed 2026-05-04)

| Check | How |
| --- | --- |
| Build clean | `cd docs && pnpm build` returns exit 0 in <15s (was <10s · vault index build adds ~3-5s) |
| Stylesheets serve | `/global.css` 200 with all `--nier-rule-*` tokens present + custom `::-webkit-scrollbar*` rules (Pass 6) |
| Scrollbar themed | Hover-test scrollbar in dev tools — no white-bg flash on hover; thumb uses `--nier-rule-medium` |
| Overflow-clean | Audit at 1024/1280/1708/2400 widths — zero horizontal overflow on any page |
| Sidebar slide works | Navigating between tool pages shifts brand-mark icon position |
| /llms.txt clean | Markdown layer reads structurally; codex voice present in headings |
| Mobile tested | At 720px breakpoint, grimoire shelf collapses to single column; sidebar opens cleanly |
| Per-page OG cards | Discord/Twitter unfurl test: paste `https://codex.0xhoneyjar.xyz/grails/cancer` → cancer.webp shows · paste `https://codex.0xhoneyjar.xyz/tools/lookup_grail` → tool-specific OG card OR shared MiCodex variant (per Pass 6 decision) |
| MCP tool sync | `docs/pages/tools/*.mdx` filenames match tools/list output from MCP server (or operator-acknowledged drift documented) |
| Vault index renders | `/codex/browse` 200 · faceted filter + card grid · 1500 entries pageable without UI lag |
| Right-rail INTERACTIVE GRAPH | renders on every page · centered on current page's node · 1-2 hops out · click navigates · matches Obsidian Help right-rail pattern · reads as Mibera (parchment + ink + nier-rule borders, NOT default d3 grey) |
| Spatial-vs-hierarchical compose | the-weaver Mom-Test: book-shelf (left) + interactive-graph (right) + ON THIS PAGE outline (right) read as 3 complementary nav modes, not redundant or fragmented |
| Lorekeeper voice preserved | KEEPER walk-through: would Gumi recognize the navigation grammar she designed? graph nodes use codex titles (not slugs) · edges respect wikilinks she authored |
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
