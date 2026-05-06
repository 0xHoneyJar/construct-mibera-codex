# SDD: Surface Codex README Structure on Docs Site

**Cycle:** 024
**Created:** 2026-05-06
**Source PRD:** `grimoires/loa/prd.md`
**Discovery method:** /simstim Phase 3 (Flatline review skipped — cheval adapter too old; operator may run /flatline-review manually post-SDD)

---

## 1. System Architecture Overview

### What's being built

A **structural reorientation** of the Mibera Codex docs site (`docs/` subfolder, vocs-based) so its sidebar and page structure mirror the canonical `README.md` reading order (§I–X). The MCP-tool-shaped current sidebar collapses into a book-shaped one. Existing tool routes stay live; only navigation shape changes.

### What's NOT being built

- New URL routes for existing tool pages (sidebar `link:` updates only)
- New build infrastructure beyond the existing `pnpm build-indexes` pattern
- Per-mibera, per-tarot-card, per-trait detail routes (deferred; see Section 7 of PRD)
- Modifications to MCP server, skill.md, or AgentDrawer surfaces

### High-level flow

```
README.md §I-X reading structure
            ↓
docs/vocs.config.ts sidebar (Sprint 0: groups + existing route folds only)
            ↓
[ Sprint 1: Story pages          → /story/philosophy + /story/official-lore
                                   AND adds I. The Story leaves to sidebar     ]
[ Sprint 2: Ancestors browse     → /framework/ancestors + AncestorBrowse
                                   AND adds II. Ancestors leaf to sidebar      ]
[ Sprint 3: On-Chain + Data refs → /on-chain + /data
                                   AND adds IX + X leaves to sidebar           ]
            ↓
Existing tool routes (/tools/lookup_*) reachable via new sidebar groupings:
  - II. The Framework  → Archetypes (= /tools/lookup_archetype)
                       → Ancestors (NEW: /framework/ancestors, Sprint 2)
  - V. The Collection  → Miberas (= /tools/lookup_mibera)
                       → Grails  (= /tools/lookup_grail)
  - III. Mysticism (cycle-025) — entirely hidden from sidebar in cycle-024
```

**Sprint 0 dead-link prevention** (per Flatline SKP-001a, severity 720):
Sprint 0 does NOT add sidebar leaves pointing at unbuilt routes. Each sprint
that creates a route (1, 2, 3) is responsible for ALSO adding its sidebar
leaf in the SAME sprint. Sprint 0 is exclusively: (a) the new group
headers for §I, §II, §V, §IX, §X, and (b) folding existing live routes
under their canonical groups. No leaf in the sidebar may point to a 404.

> **Source:** PRD §1 Problem, PRD §5 FR-0.x, README.md:33–93

---

## 2. Tech Stack

| Concern | Choice | Justification |
|---------|--------|---------------|
| Static site generator | **vocs** (existing) | Already in production. No reason to migrate. |
| Page format | **MDX** with React components | Existing pattern. Story pages are pure MDX; browse pages embed components. |
| Data extraction | **Build-time scripts in `docs/scripts/`** | Established pattern: `build-vault-index.mjs`, `build-miberas-browse.mjs`. New: `build-ancestors-index.mjs`. |
| Component library | **Existing parchment-vocabulary CSS** in `docs/public/global.css` | New components extend established class registers; no new design tokens. |
| Sidebar config | **`docs/vocs.config.ts`** | Single source of truth for sidebar shape. |
| Source data | **Codex repo markdown** in `core-lore/`, `_codex/data/*.json` | Read-only consumption; codex repo is the source of truth. |

> **Source:** PRD §6 Technical & Non-Functional, existing `docs/package.json` + `docs/scripts/`

---

## 3. Data Models

### 3.1 Ancestor (new — Sprint 2)

Source: `core-lore/ancestors/{slug}.md` frontmatter (33 files).

```typescript
type Ancestor = {
  slug: string;            // REQUIRED — e.g. "greek", "hindu", "mongolian"
  name: string;            // REQUIRED — display name
  period_ancient?: string; // OPTIONAL — e.g. "1200 BCE — 600 CE"
  period_modern?: string;  // OPTIONAL — e.g. "Modern revival, 1970s—"
  locations: string[];     // OPTIONAL — defaults to []
  archetype_affinities?: string[]; // OPTIONAL — archetypes this ancestor anchors
};

type AncestorIndex = {
  generatedAt: string;
  count: number;           // 33
  ancestors: Ancestor[];   // sorted by name
};
```

**Build target:** `docs/public/ancestors-browse.json` (~17KB).

**Validation behavior** (per Flatline IMP-002, score 865):

| Field | Missing/empty behavior |
|-------|------------------------|
| `slug` | **Hard fail**: log `ERROR: ancestor file {path} missing required slug — skipping`, exclude from output. Build script exits 0 (warnings don't break build). |
| `name` | **Hard fail**: same as `slug`. |
| `period_ancient`, `period_modern`, `locations`, `archetype_affinities` | **Soft warn**: log `WARN: ancestor {slug} missing optional field {field}`, default to empty/null in output. Card renders with "—" placeholder for missing fields. |

The component (`AncestorBrowse`) tolerates null/empty optional fields by
omitting that section of the card entirely (no empty rows).

> **Source:** PRD FR-2.1, codex-improvement-research.md:53–104 (existing ancestor file inventory)

### 3.2 Section landing config (new — Sprint 0)

The sidebar describes sections; each section's landing page (when content exists) needs a header + intro. Codified as TS data in component or MDX frontmatter.

```typescript
type Section = {
  numeral: "I" | "II" | "III" | "IV" | "V" | "VI" | "VII" | "VIII" | "IX" | "X";
  title: string;          // "The Story", "The Framework", etc.
  intro: string;          // Quoted from README.md per section
  children: SidebarItem[]; // Pages within this section
};
```

Used to generate sidebar entries + per-section intro pages.

> **Source:** PRD FR-0.1, README.md:33–93

### 3.3 No new data models for Sprint 1 (Story) or Sprint 3 (On-Chain/Data)

Sprint 1: prose-only MDX pages. Sprint 3: surfaces existing JSON (`_codex/data/contracts.json`) inline.

---

## 4. Component Architecture

### 4.1 Existing components (reused, not modified)

- `GrimoireShelf` — current root index uses 5 of these; SDD preserves them in the sidebar's V. The Collection grouping
- `GrimoireBrowse` — used in `/tools/lookup_grail` (Vol I cathedral); preserved
- `MiberaBrowse` — used in `/tools/lookup_mibera`; preserved
- `ArchetypeBrowse` — used in `/tools/lookup_archetype`; preserved
- `ZoneBrowse` — used in `/tools/lookup_zone`; preserved
- `FactorBrowse` — used in `/tools/lookup_factor`; preserved
- `AgentDrawer` + `MiberaTab` + `ToolReference` — global, route-aware; **no changes**
- `BlotterGrid` — global right-rail browse on non-tool routes; **no changes**

### 4.2 New components

| Component | File | Purpose | Sprint |
|-----------|------|---------|--------|
| `AncestorBrowse` | `docs/components/ancestor-browse.tsx` | Grid of 33 ancestor cards. Mirror ArchetypeBrowse's structure. Reads `/ancestors-browse.json`. | 2 |
| `OnChainReference` | `docs/components/onchain-reference.tsx` | Renders contract registry from `_codex/data/contracts.json` as a copy-pasteable address table. | 3 |
| `DataIndex` | `docs/components/data-index.tsx` | Surfaces JSONL exports + knowledge graph + scope/gaps/timeline as a reference index. | 3 |

### 4.3 New scripts

| Script | File | Purpose | Sprint |
|--------|------|---------|--------|
| `build-ancestors-index` | `docs/scripts/build-ancestors-index.mjs` | Parses `core-lore/ancestors/*.md` frontmatter → emits `docs/public/ancestors-browse.json`. Pattern from `build-miberas-browse.mjs`. | 2 |

### 4.4 Updated files

| File | What changes | Sprint |
|------|--------------|--------|
| `docs/vocs.config.ts` | Sidebar restructure: 10 README-section groups; existing 5 grimoire entries fold under their canonical sections; `Front Matter` and `For Agents` preserved at top | 0 |
| `docs/package.json` | `build-indexes` script chains the new ancestor builder | 2 |
| `docs/public/global.css` | New CSS classes: `.ancestor-browse`, `.ancestor-card*`, `.onchain-reference`, `.data-index*`. Match parchment vocabulary. | 2, 3 |

> **Source:** PRD §5 Functional Requirements

---

## 5. Sidebar Structure (Sprint 0 deliverable)

The reshape. This is the load-bearing change of cycle-024.

```typescript
sidebar: [
  // ─── Stays at top: orientation + agent surface ───────────────
  { text: "Front Matter",
    items: [
      { text: "What Is the Codex?", link: "/" },
      { text: "For Agents",         link: "/for-agents" },
    ],
  },

  // ─── README §I — The Story ──────────────────────────────────
  { text: "I. The Story",
    items: [
      { text: "Philosophy & Genesis",  link: "/story/philosophy" },     // Sprint 1
      { text: "Official Lore",         link: "/story/official-lore" },  // Sprint 1
    ],
  },

  // ─── README §II — The Framework ─────────────────────────────
  { text: "II. The Framework",
    items: [
      { text: "Archetypes",  link: "/tools/lookup_archetype" },          // existing
      { text: "Ancestors",   link: "/framework/ancestors" },             // Sprint 2
    ],
  },

  // ─── README §III — The Mysticism (placeholder for cycle-025) ─
  // Decision (Open Question 5 from PRD): hide entirely OR render
  // disabled "Coming soon" entries. Resolution in Sprint 0:
  // RECOMMENDED → hide entirely until cycle-025 ships content.
  // (No empty sidebar group.)

  // ─── README §V — The Collection ─────────────────────────────
  { text: "V. The Collection",
    items: [
      { text: "Introducing Mibera",  link: "/tools/lookup_mibera" },     // existing
      { text: "Mibera Maker · Vol I (Grails)", link: "/tools/lookup_grail" }, // existing
    ],
  },

  // ─── README §IX — On-Chain ──────────────────────────────────
  { text: "IX. On-Chain",
    items: [
      { text: "Contracts & Mechanics", link: "/on-chain" },              // Sprint 3
    ],
  },

  // ─── README §X — Data & Research ────────────────────────────
  { text: "X. Data & Research",
    items: [
      { text: "Knowledge Graph & Exports", link: "/data" },              // Sprint 3
    ],
  },

  // ─── Existing agent-only / meta routes ──────────────────────
  // Network Mysticism (factors) is NOT in README §I-X structure —
  // it's score-mibera derived. Surface as a leaf at the bottom under
  // an "Agent Tools" group, OR drop from sidebar entirely.
  // Initiation Ritual (zones) — same: not in README §I-X. Same call.
  // RECOMMENDED → drop from sidebar, keep routes accessible via direct URL.
  // (Operator decision in Sprint 0.)
],
```

**Sections deferred to future cycles** (NOT in cycle-024 sidebar):
- IV. The Art (1,337 visual traits — cycle-026)
- VI. The Mechanics (Swag Score — future)
- VII. The Ecosystem (Special Collections, VM — cycle-027)
- VIII. Behind the Scenes (Creative Process, Team — cycle-027)

> **Source:** PRD FR-0.1, FR-0.2, README.md:33–93

---

## 6. Routes

### 6.1 New routes

| Route | File | Sprint |
|-------|------|--------|
| `/story/philosophy` | `docs/pages/story/philosophy.mdx` | 1 |
| `/story/official-lore` | `docs/pages/story/official-lore.mdx` | 1 |
| `/framework/ancestors` | `docs/pages/framework/ancestors.mdx` | 2 |
| `/on-chain` | `docs/pages/on-chain.mdx` | 3 |
| `/data` | `docs/pages/data.mdx` | 3 |

**Total: 5 new routes.**

### 6.2 Existing routes preserved

All `/tools/lookup_*`, `/grails/*`, `/codex`, `/for-agents`, `/discovery`, `/coverage-gaps` URLs stay live with no content changes (Sprint 0 only re-groups them in the sidebar).

### 6.3 Frontmatter convention for new pages

```yaml
---
title: "I. Philosophy & Genesis"   # Numeral prefix matches sidebar
description: "[1-line README quote]"
---
```

> **Source:** PRD FR-1.1–1.5, FR-2.3, FR-3.1–3.4

---

## 7. Page Layouts

### 7.1 Sprint 1: Story pages

Pure MDX. Render content from `core-lore/philosophy.md` + `core-lore/official-lore.md`. Two implementation strategies:

**Option A (Recommended): inline copy.** Copy markdown content directly into MDX, paragraph by paragraph. Keeps source-of-truth in the codex repo's `core-lore/` MD files; docs MDX is a presentation copy. Drift risk: if codex updates philosophy.md, docs go stale.

**Option B: build-time fetch.** A script reads `core-lore/philosophy.md` at build time and injects content into a generated MDX. Eliminates drift but adds build complexity for two files.

**Decision: Option A.** The story pages are stable canon — philosophical foundations don't churn. Drift risk is low; benefit (fast ship, no new build pipeline) outweighs cost. If codex updates the source, a manual sync re-paste is a 5-minute operation. Surface this in Sprint 1's acceptance criteria.

#### MDX-escaping for raw markdown copy (per Flatline SKP-001b, severity 750)

MDX parses `{` as JSX expression delimiter and `<` as element opener. Raw markdown copied from `core-lore/*.md` MAY contain those characters in prose, code blocks, or notation — and the build will crash on the first occurrence.

**Mandatory pre-commit step for Sprint 1:**

1. After copying source markdown into the MDX page, scan for unescaped `{` and `<` outside of fenced code blocks.
2. Apply one of two strategies per paragraph:
   - **Strategy A (preferred for short occurrences)**: Escape inline as `\{` and `\<`.
   - **Strategy B (preferred for long source-mostly prose)**: Wrap the prose in a `<Markdown>` component (or vocs equivalent) that doesn't parse JSX inside its body. Confirm the available wrapper in vocs's component API before committing.
3. Run `pnpm dev` locally — if the page loads cleanly, escaping is sufficient. If it still crashes with "Could not parse expression" or similar, escape more aggressively.

This is mechanical — Sprint 1 task S1-T2 / S1-T3 must include the scan + escape pass. Acceptance gate: page renders without console errors AND `pnpm build` exits 0.

> **Source:** PRD FR-1.5, codex-improvement-research.md:130–168, Flatline SKP-001b (MDX JSX parsing hazard)

### 7.2 Sprint 2: Ancestors page

Layout: H1 "II. The Framework / Ancestors" + 1-line intro + `<AncestorBrowse />` rendered full-width (via `:has(.ancestor-browse)` CSS releasing the article column max-width — same trick GrimoireBrowse uses).

`AncestorBrowse` mirrors `ArchetypeBrowse`'s structural register:
- Card per ancestor: name, period, locations, archetype affinities
- Grid: `repeat(auto-fill, minmax(16rem, 1fr))`
- Sort: alphabetical (A–Z)
- No detail click-through in MVP; cards are informational

#### Accessibility for non-clickable cards (per Flatline IMP-008, score 790)

Since cards are informational and not navigable in MVP, the markup must communicate that explicitly:

- Each card uses `<article role="listitem">` (the wrapping `<ul>` carries `role="list"`).
- Cards are NOT wrapped in `<a>` or `<button>`. Hover affordance is purely visual (subtle border tone).
- The card's `aria-label` repeats the ancestor name + period for screen-reader clarity.
- No `tabindex` on cards — they're not interactive, so keyboard focus skips them.
- Future detail-view cycle (cycle-028) will swap article for `<a>` and add focus styling; the markup change will be additive, not breaking.

### 7.3 Sprint 3: On-Chain + Data pages

Layout: H1 "IX. On-Chain" / "X. Data & Research" + intro + tables/sections.

**On-Chain page sections:**
- Contract Registry (table from `_codex/data/contracts.json`)
- Fractured Mibera mechanic
- Shadow Traits, Candies, Mibera Sets, Tarot Quiz, 42 Motif (1-paragraph each, link to `_codex/data/*.md` source)
- ABIs (link to GitHub source)

**Data & Research page sections:**
- Knowledge Graph (link + node/edge counts from `_codex/data/graph.json`)
- JSONL exports (table: file, format, count, link)
- Stats summary (top numbers from `_codex/data/stats.md`)
- Scope · Gaps · Timeline (link to `_codex/data/{scope,gaps,timeline}.json`)

Both pages are reference-style: tables + external links, lighter than the narrative sections.

> **Source:** PRD FR-3.1–3.4, README.md:64–93

---

## 8. Build Pipeline

### Existing
```
pnpm dev
  → pnpm build-indexes
      → node scripts/build-vault-index.mjs       (43 grail entries)
      → node scripts/build-miberas-browse.mjs    (10k miberas, 1.75MB)
  → vocs dev
```

### After cycle-024
```
pnpm dev
  → pnpm build-indexes
      → node scripts/build-vault-index.mjs       (existing)
      → node scripts/build-miberas-browse.mjs    (existing)
      → node scripts/build-ancestors-index.mjs   (NEW: 33 ancestors, ~17KB)
  → vocs dev
```

Total new build time: <1s additional.

> **Source:** PRD §6 Technical, existing `docs/package.json:4–11`

---

## 9. Security Architecture

The codex docs site is **public, read-only**. No authentication, no user data, no sensitive endpoints.

> **Correction per Flatline SKP-002 (severity 760):** A previous draft of this section claimed "MDX sanitizes by default." That is incorrect. MDX (and vocs's MDX rendering) executes embedded JSX expressions and renders raw HTML according to its parser configuration — it is NOT a sanitization boundary.

### Real security posture

| Concern | Mitigation |
|---------|------------|
| **JSX/HTML injection via copied lore** | Source markdown in `core-lore/*.md` is operator-curated, low-risk content. The actual hazard is build crashes (see §7.1 escaping rules), not XSS — the codex site has no untrusted content paths. To stay ahead of future risk: PR review must reject any copied source containing `<script>`, raw `<iframe>`, or unfamiliar JSX components before merge. |
| **Untrusted-import surface in MDX** | All MDX `import` statements are reviewed in PR. The `imports` line at the top of each new page is part of the diff; reviewer flags any unfamiliar source. |
| **Build-time data injection** | `build-ancestors-index.mjs` reads from local repo files only. No external network calls. Frontmatter parser is regex-based (no `eval`, no JSON.parse on untrusted input — only on schema-validated tokens). |
| **Asset URL exposure** | All asset references go to `assets.0xhoneyjar.xyz` (cycle-023's CDN). No direct S3 / Irys URLs introduced. |
| **Static asset integrity** | vocs builds static HTML/JS/CSS. No runtime server-side rendering. Output is hashed and immutable post-build. |
| **Future risk if community contributes lore** | If at any point lore content becomes user-submitted (vs operator-curated), this security model REQUIRES revision. Add explicit sanitization step (e.g., `rehype-sanitize`) to the MDX build pipeline before that boundary changes. |

### What is NOT relied on

- MDX runtime sanitization (it doesn't exist in the way the previous SDD draft assumed)
- Build-time auto-rejection of unsafe markup (none configured in current vocs setup)

The site's security model is **trust-the-source-repo + PR-review-discipline**, not in-flight sanitization. This is acceptable while content is operator-curated; document the assumption so it's reviewed if the trust boundary changes.

> **Source:** PRD §6 NFR-4, cycle-023 outcomes, Flatline SKP-002 (corrected MDX sanitization claim)

---

## 10. Performance & Scalability

| Metric | Current | After cycle-024 | Notes |
|--------|---------|------------------|-------|
| Total routes | ~55 (5 tool + 43 grail + 7 misc) | **~60** (+5 new) | Trivial increase |
| Largest single payload | `miberas-browse.json` 1.75MB | unchanged | New ancestors-browse.json is ~17KB |
| Build time | ~3s | ~3.5s | +500ms for ancestor builder |
| New components rendered per page | 0 | 1 (per new page) | Lightweight cards, no virtualization |
| Right-rail BlotterGrid impact | unaffected | unaffected | New routes are non-grail; rail shows Discover fallback |

No performance risks identified for cycle-024 scope.

> **Source:** PRD §6 NFR-1, NFR-2, NFR-3

---

## 11. Risk Mitigation Strategy

(Maps PRD §8 risks to architectural responses.)

| PRD Risk | Architectural Response |
|----------|------------------------|
| Sidebar restructure breaks /tools/* deep links | **Sprint 0 only edits `link:` properties grouping; URL strings unchanged.** Sprint 0 acceptance test: all existing /tools/lookup_* + /grails/* + /codex routes return 200. |
| Source markdown drifts from MDX wrappers | **Decision documented in §7.1: accept drift risk for stable canon (philosophy, official lore). Surface in cycle-024 retrospective; if drift surfaces, cycle-025 adds a sync script.** |
| Mysticism deferral leaves "Coming soon" gap | **Decision documented in §5: hide §III entirely from sidebar until cycle-025 ships content.** |
| Ancestor frontmatter inconsistency | **`build-ancestors-index.mjs` validates required fields (slug, name) and logs warnings for missing optional fields (period, locations). Build does not fail; it logs.** |
| AgentDrawer interactions break | **AgentDrawer reads `pathname`, not sidebar config — orthogonal change. Sprint 0 smoke test verifies drawer opens/closes on a representative new route.** |
| Cycle-023 CDN intersection | **All new pages reference `assets.0xhoneyjar.xyz` directly. Sprint 3 pages link to `_codex/data/contracts.json` etc. via GitHub URL (canonical), not via local imports.** |

> **Source:** PRD §8

---

## 12. Open Questions Resolved

(From PRD §9 Open Questions)

| PRD Q | SDD Resolution |
|-------|----------------|
| Q1: Default expanded/collapsed for II. The Framework? | **Collapsed by default.** Operator's repeated "minimal sidebar" feedback throughout the cycle's docs work argues against eager expansion. |
| Q2: Per-section landing component? | **No new component for Sprint 0.** Section landings render via standard MDX page conventions. Revisit if visual inconsistency surfaces post-Sprint 1. |
| Q3: Contract addresses table format? | **Plain HTML table with copy-button per row.** Implementation in `OnChainReference` component (Sprint 3). |
| Q4: /discovery + /coverage-gaps placement? | **Drop from sidebar entirely** (already done in earlier sidebar trim). Routes remain reachable via direct URL. |
| Q5: Mysticism placeholder behavior? | **Hide entirely.** No "Coming soon" entry. Empty sidebar groups read as scaffolding waste. |

---

## 13. Sprint-Level Breakdown (handoff to /sprint-plan)

| Sprint | Goal | New artifacts | Updated artifacts | Smoke test |
|--------|------|---------------|-------------------|------------|
| **Sprint 0** | Sidebar groups + existing-route folding only | — | `vocs.config.ts` | **Automated route-200 check** (per Flatline IMP-001): script curls every existing route and asserts 200. New sidebar shows §I/II/V/IX/X group headers + existing live leaves only — NO leaves to unbuilt routes. |
| **Sprint 1** | Section I — Story (incl. sidebar leaves) | `pages/story/philosophy.mdx`, `pages/story/official-lore.mdx` | `vocs.config.ts` (adds Story leaves), source md content | Pages render; prev/next nav works; **MDX-escape pass** (per §7.1) verified — no build crashes from `{` or `<` |
| **Sprint 2** | Section II.2 — Ancestors (incl. sidebar leaf) | `components/ancestor-browse.tsx`, `scripts/build-ancestors-index.mjs`, `pages/framework/ancestors.mdx`, `public/ancestors-browse.json` (build output) | `package.json`, `global.css`, `vocs.config.ts` (adds Ancestors leaf) | 33 cards render; build script completes <1s; missing-required-field warnings logged but don't break build (per §3.1); a11y: each card carries `aria-label` |
| **Sprint 3** | Section IX–X — Reference (incl. sidebar leaves) | `components/onchain-reference.tsx`, `components/data-index.tsx`, `pages/on-chain.mdx`, `pages/data.mdx` | `global.css`, `vocs.config.ts` (adds IX + X leaves) | Contract table renders; copy-buttons work; external JSON links resolve |

---

## 14. Sources & Traceability

| SDD Section | Sources |
|-------------|---------|
| Architecture overview | PRD §1, §5, README.md:33–93 |
| Tech stack | PRD §6, existing docs/package.json |
| Data models | PRD FR-2.1, codex-improvement-research.md:53–104 |
| Component architecture | PRD §5 FR sequencing, existing components in docs/components/ |
| Sidebar structure | PRD FR-0.1, README.md:33–93 |
| Routes | PRD FR-1.x, FR-2.x, FR-3.x |
| Page layouts | PRD §5 sprint specs |
| Build pipeline | docs/package.json:4–11, docs/scripts/* |
| Security | PRD NFR-4, cycle-023 outcomes |
| Performance | PRD NFR-1–3 |
| Risk mitigation | PRD §8 |
| Open question resolutions | PRD §9, operator's prior feedback in current docs cycle |
| Sprint breakdown | PRD §7 MVP + Phase 6 sprint sequencing |

---

*Authoring: /simstim Phase 3 (Architecture). Phase 2 Flatline PRD review skipped due to construct-mibera-codex's older cheval adapter — operator may run /flatline-review on this SDD post-authoring if desired.*
