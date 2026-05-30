# PRD: Surface Codex README Structure on Docs Site

**Cycle:** 024
**Created:** 2026-05-06
**Stakeholder:** soju (zkSoju) — codex docs operator
**Source artifacts:** README.md (top-level codex repo), SUMMARY.md, IDENTITY.md, grimoires/loa/context/codex-improvement-research.md
**Discovery method:** /discovering-requirements skill, 3 question batches, 7-phase coverage

---

## 1. Problem

The codex docs site (codex.0xhoneyjar.xyz) currently surfaces only a **subset** of what the Mibera Codex contains — five grimoire pages mapped 1:1 to MCP tools (`lookup_mibera`, `lookup_archetype`, `lookup_grail`, `lookup_factor`, `lookup_zone`). Visitors who want to read the codex front-to-back must currently navigate to GitHub.

> From README.md:33–93, the codex defines a **10-section reading structure**:
> *"I. The Story · II. The Framework · III. The Mysticism · IV. The Art · V. The Collection · VI. The Mechanics · VII. The Ecosystem · VIII. Behind the Scenes · IX. On-Chain · X. Data & Research"*

> From README.md:7: *"Documentation for Mibera Maker — 10,000 time-travelling Rebased Retard Beras carrying the eternal flame of the Rave."*

The docs site does not yet communicate this framing. A reader landing on `codex.0xhoneyjar.xyz` sees an MCP-tool-shaped sidebar, not a **book-shaped** reading guide.

**The gap:** the docs site is shaped around the agent surface (8 MCP tools). The codex itself is shaped around the human reading surface (10 numbered sections, hundreds of canonical entries, philosophical foundations). The first surfaces the second only partially.

> **Sources:** README.md:33–93, SUMMARY.md:1–60, current `docs/vocs.config.ts` sidebar, Phase 1 confirmation (operator: "Full 10-section mirror")

---

## 2. Vision

The docs site becomes the **canonical reading surface** for the Mibera Codex — a visitor can walk the codex front-to-back without leaving the site. The MCP tool grimoires we've already built fold into the larger structure; agents continue to read via MCP, humans read via docs, both consume the same canon.

**Quote-shaped vision:** *"Read the codex without GitHub. Every section in the README is a page; every page is browseable; the docs site is the codex's living embodiment, not a deployment artifact."*

> **Sources:** Phase 1 confirmation, codex-improvement-research.md:413–422 (Key Insight section)

---

## 3. Goals & Success Metrics

| # | Goal | Metric |
|---|------|--------|
| G1 | Sidebar mirrors README's I–X structure | Visual diff: codex.0xhoneyjar.xyz sidebar matches README §33–93 section order; verified by snapshot |
| G2 | Existing 5 grimoires fold into new structure | Each `/tools/lookup_*` route appears under its README section in the sidebar (e.g., grails under V. The Collection) |
| G3 | 4 new MVP sections shipped with rich pages | Section I (Story), II.2 (Ancestors), IX–X (On-Chain + Data) ship with browse components or rich MDX. Section III (Mysticism) deferred. |
| G4 | Reading-flow continuity | Every section page has a "what this section covers" intro that mirrors the README's section header text |
| G5 | No regression in agent surface | Existing /tools/* routes still serve the same content; AgentDrawer still works; skill.md still resolves |

> **Sources:** Phase 2 inferred from scope choice + Phase 4 question batch responses

---

## 4. Users & Stakeholders

| Persona | Need | Current state | Future state |
|---------|------|---------------|--------------|
| **Cold visitor (curious newcomer)** | Wants to understand what Mibera is from scratch | Sees 5 MCP grimoires; no philosophical framing | Lands on /, sees the 10-section guided reading order; clicks "I. The Story" → philosophy + genesis |
| **Lore-deep reader** | Wants to walk every codex section in order | Must use GitHub README + click into MD files | Walks the sidebar I–X; every section is a page |
| **AI agent operator** | Wants to wire an agent to the canon | Pastes /skill.md URL — works today | Unchanged. Agent surface preserved. |
| **Curator (Gumi, contributors)** | Wants the docs to reflect canonical updates | Manual edits per page | Sidebar mirrors README structure → updates flow predictably |

> **Sources:** README.md:1–10 (audience signaling), Phase 3 inferred (operator's repeated user-first emphasis in earlier iterations)

---

## 5. Functional Requirements

### Cycle-024 MVP — 4 Sprints

#### Sprint 0: Sidebar Restructure (foundation)

**Goal:** Reshape `vocs.config.ts` sidebar to mirror README §I–X structure. Existing 5 grimoires fold under their canonical sections.

| Item | Source |
|------|--------|
| FR-0.1 New top-level sidebar groups: I. The Story · II. The Framework · III. The Mysticism · IV. The Art · V. The Collection · VI. The Mechanics · VII. The Ecosystem · VIII. Behind the Scenes · IX. On-Chain · X. Data & Research | README.md:33–93 |
| FR-0.2 Existing tool routes fold under sections: `/tools/lookup_grail` → V. Grails · `/tools/lookup_archetype` → II. Archetypes · `/tools/lookup_mibera` → V. Miberas · `/tools/lookup_zone` → III. or stay as-is (zones aren't in README §I–X explicitly) · `/tools/lookup_factor` → flagged as "Network Mysticism (agent-only)", not a section heading | Phase 4 batch (operator: "Fold under their README sections") |
| FR-0.3 Sections without MVP content show as collapsed dropdowns with "Coming soon" placeholder OR are hidden from sidebar until their content ships | Phase 6 (MVP scope), Phase 4 (rich pages strategy) |
| FR-0.4 Front Matter section trimmed: "What Is the Codex?" + "For Agents" only (current state preserved) | Existing state |
| FR-0.5 Active routes don't break — vocs route URLs stay stable; only sidebar nav shape changes | [ASSUMPTION] confirmed in pre-generation gate |

#### Sprint 1: Section I — The Story

**Goal:** Surface Philosophy & Genesis + Official Lore as readable pages. Lowest-risk sprint per operator sequencing.

| Item | Source |
|------|--------|
| FR-1.1 New page `/story/philosophy` rendering `core-lore/philosophy.md` content as MDX with parchment vocabulary | core-lore/philosophy.md (exists) |
| FR-1.2 New page `/story/official-lore` rendering `core-lore/official-lore.md` as MDX | core-lore/official-lore.md (exists) |
| FR-1.3 Section I sidebar entry expanded by default (operator's first encounter on landing) | Phase 4 (rich pages) |
| FR-1.4 Each story page has prev/next nav within Section I and to Section II | vocs default prev/next |
| FR-1.5 No new browse components — prose pages with section-heading hierarchy | Phase 5 (lighter for prose) |

#### Sprint 2: Section II.2 — Ancestors (33 cultures)

**Goal:** Add the 33 ancestor cultures as a browseable surface.

| Item | Source |
|------|--------|
| FR-2.1 New build script `docs/scripts/build-ancestors-index.mjs` — parses `core-lore/ancestors/*.md` frontmatter, emits `docs/public/ancestors-browse.json` | Pattern from build-vault-index.mjs + build-miberas-browse.mjs |
| FR-2.2 New `<AncestorBrowse />` component — grid of 33 ancestor cards with name, period, locations, archetype affinities | Pattern from ArchetypeBrowse |
| FR-2.3 New page `/framework/ancestors` rendering AncestorBrowse | New |
| FR-2.4 Per-ancestor pages NOT in MVP — index-level browse only; clicking a card scrolls to detail or opens GitHub source for now | Phase 4 (rich at index, defer per-page) |
| FR-2.5 Sidebar entry "II. The Framework" expanded with Archetypes (existing) + Ancestors (new) | FR-0.2 |

#### Sprint 3: Section IX–X — On-Chain + Data & Research

**Goal:** Reference page surfacing contract registry, knowledge graph, JSONL exports, stats.

| Item | Source |
|------|--------|
| FR-3.1 New page `/on-chain` rendering Contract Registry + Mechanics references (Fractured Mibera, Shadow Traits, Candies, Mibera Sets, Tarot Quiz, 42 Motif, ABIs) — table format with copy-paste contract addresses | README.md:64–76 |
| FR-3.2 New page `/data` rendering Data & Research surface: knowledge graph link, JSONL exports list, stats summary, scope/gaps/timeline | README.md:78–93 |
| FR-3.3 Reference pages — lighter than narrative sections; tables + external links to GitHub-hosted JSON files | Phase 4 (hybrid depth) |
| FR-3.4 Stats dashboard page surfaces top numbers from `_codex/data/stats.md` (Mibera count, archetype distribution, swag distribution) | _codex/data/stats.md |

### Deferred (cycle-025+)

- **Section III. The Mysticism** — Astrology, Elements, Drug-Tarot System, 78 tarot cards, 78 molecules. **Gated on asset audit** (Phase 5 question — operator chose deferral). Separate cycle.
- **Section IV. The Art** — 1,337 visual traits across 18 categories. Out of MVP scope per Phase 4.
- **Section V remainders** — MiParcels (10k), Birthdays (11 eras), Fractures (11 phases). Not in MVP.
- **Section VI. The Mechanics** — Swag Score deep-dive. Not in MVP.
- **Section VII. The Ecosystem** — Special Collections, Vending Machine. Not in MVP.
- **Section VIII. Behind the Scenes** — Creative process, team history. Not in MVP.
- **Per-ancestor detail pages** — only index-level browse ships in cycle-024.
- **IDENTITY.md doctrine page** — surfacing the signal hierarchy as a docs page. Future.

> **Sources:** Phase 4 + Phase 6 batched responses, Phase 7 (Mysticism asset audit deferral)

---

## 6. Technical & Non-Functional

### Build pipeline

> From `docs/package.json`: existing scripts `build-vault-index` + `build-miberas-browse` run in `pnpm dev` via `pnpm build-indexes`.

**Pattern to extend:**
```
pnpm dev → build-indexes (vault-index + miberas-browse + NEW: ancestors-index) → vocs dev
```

| Item | Notes |
|------|-------|
| TR-1 Add `build-ancestors-index.mjs` to `docs/scripts/`. Parses `core-lore/ancestors/*.md` frontmatter (name, period_ancient, period_modern, locations, archetype affinities) → emits `public/ancestors-browse.json` | Mirrors miberas-browse builder |
| TR-2 Update `docs/package.json` `build-indexes` script to chain the new builder | One-line change |
| TR-3 Story pages (Sprint 1) are static MDX — no build pipeline change | Just import content as MDX |
| TR-4 On-Chain + Data pages (Sprint 3) read static JSON from `_codex/data/contracts.json` + `_codex/data/stats.md` — may need a small builder to surface stats summary, OR inline the values in MDX | Implementation decision in SDD |

### Performance

| Item | Notes |
|------|-------|
| NFR-1 Total new pages in MVP: 2 story + 1 ancestor index + 2 ref ≈ **5 new pages**. No virtualization needed. | |
| NFR-2 New JSON payload: `ancestors-browse.json` ≈ 33 entries × ~500 bytes ≈ ~17KB. Trivial. | vs miberas-browse 1.75MB |
| NFR-3 Build time impact: <1s additional for ancestor builder | |

### Stability

| Item | Notes |
|------|-------|
| NFR-4 No URL changes for existing routes — sidebar restructure is nav-shape only | Phase 7 risk mitigation |
| NFR-5 AgentDrawer + skill.md surface preserved without modification | G5 |
| NFR-6 vault-index.json unchanged in Sprint 0–3; only sidebar config edits | |

> **Sources:** docs/package.json, docs/scripts/*, codex-improvement-research.md:53–104 (architectural inventory)

---

## 7. Scope & Prioritization

### MVP — Cycle-024 (this cycle)

1. **Sprint 0** Sidebar restructure
2. **Sprint 1** Section I (Story — Philosophy + Official Lore)
3. **Sprint 2** Section II.2 (Ancestors — 33 cards index)
4. **Sprint 3** Section IX–X (On-Chain + Data & Research reference)

**Estimated cycle effort:** 4 sprints, sequential. Sprint 0 unblocks all others.

### Post-MVP (future cycles)

- Cycle-025 — Mysticism (gated on asset audit: tarot card art? molecule images?)
- Cycle-026 — Visual Traits (Section IV — 1,337 entries, requires significant data extraction)
- Cycle-027 — Behind the Scenes + Ecosystem (Sections VII + VIII)
- Cycle-028 — Per-ancestor detail pages + IDENTITY.md doctrine page

### Explicitly out of scope for cycle-024

- Per-mibera detail pages (10k routes — too many)
- Per-tarot-card detail pages (78 routes — gated on Mysticism cycle)
- Migration of /tools/* URLs to new paths (sidebar only, URLs stable)
- New component patterns beyond the existing parchment vocabulary

> **Sources:** Phase 6 batch (operator picked all 4 sections + sequencing: Story first), Phase 7 (Mysticism deferred)

---

## 8. Risks & Dependencies

| Risk | Impact | Mitigation |
|------|--------|------------|
| Sidebar restructure breaks active /tools/* deep links cached by users or agents | Medium — broken links from external sources | Sprint 0 explicitly preserves URLs; only sidebar `link:` properties update for nav grouping. Any URL change requires a redirect strategy. |
| Source markdown files (philosophy.md, official-lore.md, ancestors/*.md) drift from docs MDX wrappers | Low-Medium — docs goes stale | Sprint 1 + Sprint 2 wrap source MD via vocs MDX import (when available) OR generated wrappers via build script. Decision in SDD. |
| Mysticism deferral leaves Section III as a "Coming soon" gap in the sidebar | Low — visitor sees an incomplete section | FR-0.3: hide sections without MVP content from sidebar OR show as disabled placeholder. Operator decision in Sprint 0. |
| Ancestor frontmatter inconsistent across 33 files | Low | build-ancestors-index.mjs validates required fields, logs missing-data warnings. Codex-improvement-research.md:130–168 already validates frontmatter consistency. |
| AgentDrawer / Mibera tab interactions break under new section nesting | Low — drawer is route-aware not sidebar-shape-aware | Verify in Sprint 0 smoke test. Drawer reads `pathname`, not sidebar config. |
| Cycle-023 (CDN migration) work intersects with new pages adding image references | Medium — new pages may use old URLs | This cycle's pages should reference `assets.0xhoneyjar.xyz` directly per cycle-023's contract. |

### Dependencies

- **Cycle-023 CDN migration:** archived but its outcomes (assets.0xhoneyjar.xyz endpoint) inform new pages' asset URLs.
- **No external blockers** — all source data exists in the codex repo.

> **Sources:** Phase 7 inferred from current docs architecture, codex-improvement-research.md:355–381

---

## 9. Open Questions for SDD

These don't block PRD approval but should be answered in `/architect`:

1. Should "II. The Framework" sidebar group be expanded by default, or collapsed? (UX call)
2. Do per-section landing pages get their own component (e.g., `<SectionLanding heading="I. The Story">`), or do they reuse the GrimoireBrowse-style pattern?
3. Sprint 3 reference pages — how to handle the contract addresses table (copy-button per row? plain table? linked to ABI files?)
4. Do we re-add `/discovery` and `/coverage-gaps` to a sidebar section (e.g., "X. Data & Research"), or keep them as orphan routes?
5. Mysticism placeholder behavior in sidebar (FR-0.3) — hide entirely or "Coming soon" disabled state?

---

## 10. Sources & Traceability

| PRD Section | Sources |
|-------------|---------|
| Problem | README.md:33–93, README.md:7, current sidebar at docs/vocs.config.ts:147–181 |
| Vision | README.md:33–93, codex-improvement-research.md:413–422, Phase 1 confirmation |
| Goals | Phase 2 inferred + Phase 4 batch |
| Users | README.md:1–10, Phase 3 inferred |
| Functional Reqs | Phase 4 batch (scope choice + absorb strategy + depth strategy), Phase 6 batch (sprint sequencing + Mysticism deferral) |
| Technical | docs/package.json, docs/scripts/build-vault-index.mjs, docs/scripts/build-miberas-browse.mjs, codex-improvement-research.md:53–104 |
| Scope | Phase 6 batch responses, Phase 7 (asset audit deferral) |
| Risks | Phase 7 inferred + cycle-023 archive context |

---

## 11. Confirmation Trail

**Phase 1** (Problem & Vision) — confirmed: Full 10-section README mirror.
**Phase 4** (Functional Reqs) — confirmed: MVP = Story + Ancestors + Mysticism + On-Chain/Data; existing grimoires fold; rich pages with browse components.
**Phase 6** (Sprint cut) — confirmed: Story first; Mysticism deferred to next cycle.
**Pre-generation gate** — confirmed: write to grimoires/loa/prd.md (this file) with cycle-023 archived to grimoires/loa/archive/cycle-023/.

---

*Discovery method: `/discovering-requirements` skill, thorough mode, 3 question batches, 2026-05-06.*
