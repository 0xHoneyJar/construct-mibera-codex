# Sprint Plan: Surface Codex README Structure on Docs Site

**Cycle:** 024
**Created:** 2026-05-06
**Sprints:** 4 (Sprint 0 → Sprint 3)
**Source PRD:** `grimoires/loa/prd.md`
**Source SDD:** `grimoires/loa/sdd.md`
**Working directory:** `docs/` (vocs subfolder)
**Total estimated effort:** 1–2 days for a focused operator pass; longer if Flatline reviews and full QA per sprint

---

## Sprint Sequencing

```
Sprint 0 (foundation) ─→ Sprint 1 (story) ─→ Sprint 2 (ancestors) ─→ Sprint 3 (on-chain + data)
        │                                                                       │
        └─ unblocks all subsequent sprints ──────────────────────────────────────┘
```

**Sequential, not parallel.** Sprint 0's sidebar restructure is a prerequisite for the others; Sprints 1–3 can technically run independently after Sprint 0, but operator decree (Phase 6 batch) is to ship Story first as the lowest-risk validation of the new sidebar shape.

---

## Sprint 0: Sidebar Group Restructure (no dead-link leaves)

**Goal:** Sidebar after Sprint 0 = **3 groups: Front Matter, II. The Framework, V. The Collection**. §I, §IX, §X are NOT yet present (they appear in their owning sprints alongside the leaves that populate them). Existing live routes fold under §II + §V.

**Effort estimate:** ~45 minutes (including check-routes safeguards)
**Blocks:** Sprints 1, 2, 3

**Updated per Flatline SKP-001a (severity 720):** Sprint 0 originally added all leaves including ones for unbuilt pages, which would have left the sidebar full of dead links between Sprint 0 ship and Sprint 3 ship. Restructured so each sprint owns its leaf addition AND its group header (Sprints 1/3 add §I/§IX/§X groups when they ship those routes).

**Updated per Flatline IMP-012 (gpt+gemini consensus 920):** Original wording said "4 groups" but listed 3 and contradicted itself with "groups don't render yet." Resolved: Sprint 0 ships exactly 3 sidebar groups (Front Matter, §II, §V). Subsequent sprints introduce §I/§IX/§X.

### Tasks

| ID | Task | File | AC |
|----|------|------|-----|
| S0-T1 | Rewrite sidebar to exactly 3 groups | `docs/vocs.config.ts` | Sidebar groups: **(1) Front Matter** (existing — What Is the Codex?, For Agents) · **(2) II. The Framework** (one leaf: Archetypes → /tools/lookup_archetype, LIVE) · **(3) V. The Collection** (two leaves: Introducing Mibera → /tools/lookup_mibera LIVE, Mibera Maker · Vol I → /tools/lookup_grail LIVE). NO §I, §IX, §X groups, NO leaves to /story/*, /framework/*, /on-chain, /data. |
| S0-T2 | Build sidebar-link verifier (per Flatline IMP-001 score 885 + SKP-001 760 manifest-drift) | `docs/scripts/check-routes.mjs` | Node script that imports `docs/vocs.config.ts`, walks every `link:` property in the sidebar tree, and asserts the corresponding page file exists at `docs/pages/{path}.mdx` (or has a known external/canonical mapping). NOT a hand-maintained manifest — derived from the config itself. Exits 1 if any sidebar leaf points to a non-existent page. |
| S0-T3 | Add `check-routes` to package.json AND run it as part of `pnpm dev` prebuild + `pnpm build` (per Flatline SKP-001 manifest-drift mitigation) | `docs/package.json` | `prebuild` chain runs `check-routes.mjs` before vocs build; build fails if drift exists. `pnpm dev` chain runs it before `vocs dev`. |
| S0-T4 | (Smoke runtime check, optional) live route HTTP probe with wait-on | `docs/scripts/probe-live-routes.sh` (optional) | If chosen, uses `wait-on -t 30000 http://localhost:5173/` before issuing curl. Run manually post-Sprint-0 if operator wants HTTP-level confirmation. NOT in the build pipeline. **Resolves Flatline SKP-001 CRITICAL 820.** |
| S0-T5 | Verify AgentDrawer + Mibera tab still toggle on a representative route | (manual / agent-browser) | Open /tools/lookup_grail, click Mibera tab, drawer slides in showing tool spec — no regression |

### Acceptance criteria

- [ ] Sidebar shows exactly 3 groups: Front Matter, II. The Framework, V. The Collection
- [ ] `pnpm build` runs `check-routes.mjs` and exits 0 — every sidebar leaf resolves to an existing page file
- [ ] `pnpm dev` runs `check-routes.mjs` and exits 0
- [ ] Adding a stale leaf to `vocs.config.ts` (test case: a `link: "/nonexistent"`) makes both `pnpm build` and `pnpm dev` fail with a clear error message — verifies the safeguard actually works
- [ ] AgentDrawer + Mibera tab unchanged in behavior
- [ ] Front Matter section intact: "What Is the Codex?" + "For Agents"
- [ ] No §III/IV/VI/VII/VIII sidebar entries
- [ ] `pnpm dev` server boots clean
- [ ] **Zero leaves point to 404s** in the post-Sprint-0 sidebar (enforced by S0-T2/T3 in CI)

### Out of scope for Sprint 0

- Any new page content (Sprints 1–3 own that)
- URL redirects (no URL changes happen)
- New components

---

## Sprint 1: Section I — The Story

**Goal:** Surface Philosophy & Genesis + Official Lore as readable docs pages.

**Effort estimate:** ~1.5 hours
**Blocked by:** Sprint 0
**Blocks:** Sprint 2 only via the operator's chosen sequencing (technically independent)

### Tasks

| ID | Task | File | AC |
|----|------|------|-----|
| S1-T1 | Create `docs/pages/story/` directory | (filesystem) | Directory exists |
| S1-T2 | Author Philosophy & Genesis page with full markdown→MDX normalization (per Flatline SKP-002 + SKP-004) | `docs/pages/story/philosophy.mdx` | H1 "I. Philosophy & Genesis" + 1-line intro + content from `core-lore/philosophy.md`. **Normalization checklist applied:** (a) source frontmatter stripped (only docs MDX frontmatter remains), (b) all relative asset paths rewritten to absolute (e.g., `./images/foo.webp` → `https://assets.0xhoneyjar.xyz/...` OR copied into `docs/public/story/`), (c) all relative internal links rewritten to docs-site routes or GitHub URLs, (d) JSX-reserved chars (`{`, `<`) escaped as `\{`, `\<` outside fenced code blocks per SDD §7.1, (e) any HTML tags (e.g., `<details>`) reviewed for MDX compatibility, (f) `pnpm build` exits 0 — no parse errors. |
| S1-T3 | Author Official Lore page with same normalization checklist | `docs/pages/story/official-lore.mdx` | Same checklist as S1-T2 applied to `core-lore/official-lore.md` content. |
| S1-T4 | Update sidebar config: ADD §I. The Story group + 2 leaves pointing at the new live routes | `docs/vocs.config.ts` | "I. The Story" group inserted between Front Matter and §II in the sidebar. Both leaves resolve to live pages. `check-routes.mjs` exits 0 after this change. |
| S1-T5 | Verify both pages render with parchment styling, headings hierarchy intact | (manual / agent-browser) | Pages have Imperial headings, Switzer body, hairline section dividers — visual register matches existing pages |
| S1-T6 | Verify all asset references in Story pages resolve (no 404s) | (smoke) | Open both pages in dev; check browser DevTools Network tab for any 404 image/asset request. Zero 404s. |

### Acceptance criteria

- [ ] Both `/story/philosophy` and `/story/official-lore` return 200
- [ ] Page H1s match sidebar entries exactly (numeral prefix + title)
- [ ] Page content is sentence-case prose (not all-lowercase)
- [ ] vocs prev/next nav works (philosophy ↔ official-lore)
- [ ] No broken internal links inside the prose
- [ ] **Zero broken asset references** (per Flatline SKP-002, score 750 — Network tab clean of 404s on both pages)
- [ ] **`pnpm build` exits 0** — markdown→MDX normalization caught all parse hazards
- [ ] Sidebar's "I. The Story" group is now functional (not a placeholder)
- [ ] `check-routes.mjs` exits 0

### Out of scope for Sprint 1

- Build-time sync from source `core-lore/*.md` (deferred per SDD §7.1)
- Per-section landing component (deferred per SDD §12 Q2)
- Any UI beyond MDX prose

---

## Sprint 2: Section II.2 — Ancestors

**Goal:** Add 33 ancestor cultures as a browseable surface under II. The Framework.

**Effort estimate:** ~3 hours
**Blocked by:** Sprint 0 (Sprint 1 not strictly required but operator-ordered first)

### Tasks

| ID | Task | File | AC |
|----|------|------|-----|
| S2-T1 | Author build script with strict required-field handling (per Flatline SKP-005, score 760) | `docs/scripts/build-ancestors-index.mjs` | Reads `core-lore/ancestors/*.md` frontmatter, parses fields per SDD §3.1 schema, writes `docs/public/ancestors-browse.json`. **Failure semantics:** missing required field (slug/name) is a HARD FAIL — script exits 1 with `ERROR: ancestor {path} missing required {field}`. Build does not pass with fewer than 33 entries. Missing optional fields (period_*, locations, archetype_affinities) emit `WARN` but do not fail. Path resolution: source paths are resolved via `path.resolve(__dirname, "..", "..")` (per Flatline SKP-001 cwd-portability). |
| S2-T2 | Wire builder into package.json | `docs/package.json` | `build-indexes` script chains the new builder; `pnpm dev` runs it before vocs starts |
| S2-T3 | Author AncestorBrowse component | `docs/components/ancestor-browse.tsx` | Fetches `/ancestors-browse.json`, renders grid of cards: name + period + locations + archetype affinities. Mirrors ArchetypeBrowse structure. |
| S2-T4 | Author CSS for ancestor cards | `docs/public/global.css` | New classes: `.ancestor-browse`, `.ancestor-card`, `.ancestor-card__name`, `.ancestor-card__period`, `.ancestor-card__locations`, `.ancestor-card__affinities`. Match parchment vocabulary. |
| S2-T5 | Author MDX page | `docs/pages/framework/ancestors.mdx` | H1 "II. The Framework / Ancestors" + 1-line intro + `<AncestorBrowse />` |
| S2-T6 | Update sidebar to point Ancestors leaf at /framework/ancestors | `docs/vocs.config.ts` | Sidebar leaf is live; clicking it lands on the new page |
| S2-T7 | Verify all 33 ancestor cards render with their data | (manual / agent-browser) | Card count = 33; each card has name; cards with missing optional fields render gracefully |

### Acceptance criteria

- [ ] `pnpm dev` runs `build-ancestors-index.mjs` successfully and emits `ancestors-browse.json` (~17KB)
- [ ] **`ancestors-browse.json` count === 33 exactly** (per Flatline SKP-005 — partial coverage from missing-required-field skips is now a HARD FAIL, not a silent warn)
- [ ] `/framework/ancestors` returns 200, renders 33 ancestor cards
- [ ] Test case: temporarily remove a required field from one ancestor MD file → build script exits 1 with a clear error → restore the field → build passes (verifies the safeguard)
- [ ] Card visual register matches existing ArchetypeBrowse / ZoneBrowse cards
- [ ] Right-rail BlotterGrid still works on this route (shows Discover fallback since ancestor pages aren't grail-typed)
- [ ] Each ancestor card carries `aria-label` per SDD §7.2 (a11y for non-clickable cards)

### Out of scope for Sprint 2

- Per-ancestor detail pages (deferred to cycle-028)
- Ancestor → Mibera filtering (deferred)
- Ancestor archetype affinity heatmap or visualization (out of scope)

---

## Sprint 3: Section IX–X — On-Chain + Data & Research

**Goal:** Reference pages surfacing contract registry + knowledge graph + JSONL exports + stats.

**Effort estimate:** ~2 hours
**Blocked by:** Sprint 0

### Tasks

| ID | Task | File | AC |
|----|------|------|-----|
| S3-T1 | Author OnChainReference component with explicit address validation (per Flatline SKP-007, score 740) | `docs/components/onchain-reference.tsx` | Reads `_codex/data/contracts.json` (or inline data), renders contract address table with name + address + **chain (required field)** + per-row copy button. **Validation step:** at build time (or component init), each address is regex-checked for `^0x[a-fA-F0-9]{40}$` form, EIP-55 checksum is verified, duplicates across the table are detected and flagged, every row carries explicit chain metadata. Source-of-truth: `_codex/data/contracts.json` — schema includes `{name, address, chain, deployed_block?, source}`. Build fails if any contract row fails validation. |
| S3-T2 | Author DataIndex component | `docs/components/data-index.tsx` | Static layout: knowledge graph link, JSONL exports table (file · format · count · GitHub link), stats summary (top 5 numbers from `_codex/data/stats.md`), scope/gaps/timeline links |
| S3-T3 | Author /on-chain page | `docs/pages/on-chain.mdx` | H1 "IX. On-Chain" + intro + `<OnChainReference />` + sections per SDD §7.3 (Fractured, Shadow Traits, Candies, Sets, Tarot Quiz, 42 Motif, ABIs) |
| S3-T4 | Author /data page | `docs/pages/data.mdx` | H1 "X. Data & Research" + intro + `<DataIndex />` |
| S3-T5 | Author CSS for on-chain table + data index | `docs/public/global.css` | New classes for table rows, copy buttons, data-index sections. Match parchment register. |
| S3-T6 | Update sidebar to point IX + X leaves at the new routes | `docs/vocs.config.ts` | Both routes are live in sidebar |
| S3-T7 | Verify copy-button on contract addresses works in browser | (manual / agent-browser) | Click a copy button → clipboard contains the address |
| S3-T8 | Verify external GitHub links resolve | (manual / agent-browser) | Each link to `_codex/data/*.json` opens GitHub source |
| S3-T9 | Test address validation safeguard end-to-end (per Flatline SKP-007) | (smoke) | Insert a malformed address into a test fixture → build fails with `ERROR: invalid contract address {addr}`. Restore → build passes. Verifies the validation actually fires, not just exists. |

### Acceptance criteria

- [ ] `/on-chain` and `/data` both return 200
- [ ] Contract registry table renders with all addresses from `_codex/data/contracts.json`
- [ ] Copy buttons work (copy to clipboard verified in 2+ rows)
- [ ] Data index shows knowledge graph stats (node + edge counts)
- [ ] All external links resolve
- [ ] Reference pages render lighter than narrative sections (acceptable visual weight: tables + bullet sections, no large hero)

### Out of scope for Sprint 3

- ABI inline rendering (just link to GitHub)
- Knowledge graph visualization (link only — full graph is 5.4MB, not in MVP)
- Live stats dashboard (static numbers from stats.md snapshot)

---

## Cross-cutting Concerns

### Verification across all sprints

After each sprint:
- `pnpm dev` boots clean
- No console errors in browser
- AgentDrawer + Mibera tab toggle on at least one new route
- Sidebar shape matches SDD §5
- All existing /tools/* and /grails/* routes still return 200

### Definition of Done (whole cycle)

- [ ] All 4 sprints' acceptance criteria met
- [ ] No regression in existing 5 grimoire routes
- [ ] No regression in agent surface (skill.md fetch returns 200, AgentDrawer functional)
- [ ] vocs build (`pnpm build`) completes without errors
- [ ] Sidebar reads as a book (§I–X order), not as a tool list
- [ ] Visitor can walk from / through the 6 sidebar groups and find every cycle-024 page

### Out of scope across the whole cycle

(Mirroring PRD §7 deferrals)

- Section III. Mysticism (cycle-025, gated on asset audit)
- Section IV. The Art (1,337 visual traits — cycle-026)
- Section V remainders (MiParcels, Birthdays, Fractures)
- Section VI. The Mechanics (Swag Score)
- Section VII. The Ecosystem (Special Collections, VM)
- Section VIII. Behind the Scenes (Creative Process, Team)
- IDENTITY.md doctrine page
- Per-mibera, per-tarot-card, per-trait detail pages
- Migration of /tools/* URLs

---

## Risk Watchlist (per-sprint)

(Augmented with Flatline-derived findings.)

| Sprint | Risk | Detection | Mitigation |
|--------|------|-----------|------------|
| 0 | Sidebar config syntax error → vocs fails to build | `pnpm dev` exit code | YAML/TS lint before commit; revert via git if exit fails |
| 0 | **Sidebar leaf added without page → 404 in production** (Flatline SKP-001 manifest-drift) | `check-routes.mjs` build hook | Script derives leaf list from vocs.config.ts itself, asserts every leaf has a page file. Runs in `pnpm build` — broken sidebar fails CI. |
| 1 | **Asset paths in copied markdown 404** (Flatline SKP-002) | DevTools Network tab; S1-T6 task | Normalization checklist (S1-T2 AC) rewrites relative paths or copies assets to docs/public/story/ |
| 1 | **MDX parse failure on copied markdown** (Flatline SKP-004 + SDD §7.1) | `pnpm build` fails with parse error | S1-T2 AC normalization checklist: strip frontmatter, escape `{` and `<`, review HTML for MDX compat |
| 2 | **Silent partial-coverage when ancestor required fields missing** (Flatline SKP-005) | Build exit code | S2-T1 builder is HARD FAIL on missing slug/name; output count must === 33 |
| 2 | Ancestor frontmatter inconsistency on optional fields | Build script warns; visual QA in dev | Soft warn + render placeholder; AncestorBrowse tolerates null/empty optional fields |
| 3 | **Bad contract address ships to docs** (Flatline SKP-007) | S3-T9 build-time validation | Each address regex+checksum validated; chain metadata required; duplicates flagged. Build fails on invalid. |
| 3 | Copy-button browser API quirks | Manual test in 2+ browsers | Use `navigator.clipboard.writeText` with fallback to `document.execCommand('copy')` |
| All | **Path resolution drift between dev/build/CI** (Flatline SKP-001 cwd-portability) | Cross-context test | All scripts in docs/scripts/ resolve repo-root via `path.resolve(__dirname, "..", "..")` and log resolved absolute paths at script start for traceability |

---

## Sources & Traceability

| Sprint Plan section | Sources |
|---------------------|---------|
| Sprint 0 | SDD §5 (sidebar structure) + §13 (sprint breakdown) |
| Sprint 1 | SDD §7.1, PRD FR-1.x |
| Sprint 2 | SDD §3.1 (Ancestor schema) + §4.2 (component spec) + PRD FR-2.x |
| Sprint 3 | SDD §7.3 + §4.2 + PRD FR-3.x |
| Cross-cutting | SDD §11 risk mitigation, PRD §6 NFRs |
| Risk watchlist | SDD §11, PRD §8 |

---

*Authoring: /simstim Phase 5 (Planning). Phases 2, 4, 6 (Flatline reviews) skipped — older cheval adapter in this repo. Operator may /flatline-review the SDD or this Sprint Plan post-authoring if desired.*
