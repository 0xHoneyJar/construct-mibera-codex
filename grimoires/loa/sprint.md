# Sprint Plan: MiParcels — 10K Parcel Entries & Trait Documentation

**Cycle:** 022
**Created:** 2026-04-16
**Sprints:** 3
**Estimated effort:** Large (3 scripts + 10K generated files + 10K patched files + 13 trait pages + meta updates)

---

## Sprint 1: Scrawl Mapping & Generator Foundation

**Goal:** Build the scrawl-theme mapping, write the JSON schema, and create the generator script with validated sample output. Everything needed to prove the pipeline works before the full 10K run.

### T-1.1: Build scrawl-theme mapping

**Description:** Write `_codex/scripts/build-scrawl-theme-map.py` that parses `fractures/miparcels/scrawl.md` to extract the 10 thematic clusters and their scrawl texts, cross-references against the 189 unique values from the source trait report, and outputs `_codex/data/scrawl-theme-map.json`.

**Approach:** Parse scrawl.md line-by-line: `## {Theme}` headings set the current cluster, `| {Text} | ...` table rows extract scrawl values. Match against trait report values using exact → case-insensitive → flag unmapped. Output JSON dict mapping text → theme.

**Acceptance criteria:**
- `_codex/data/scrawl-theme-map.json` exists with 189 entries
- Every key in the map corresponds to a scrawl value in the source trait report
- Every value is one of the 10 documented theme names
- Coverage report printed: ideally 189/189 mapped (any gaps manually resolved)

---

### T-1.2: Write miparcel JSON schema

**Description:** Create `_codex/schema/miparcel.schema.json` following the existing schema conventions (x-codex-meta, x-codex-confidence annotations). Defines required and optional fields per SDD §3.3.

**Acceptance criteria:**
- Schema validates against a sample parcel's frontmatter
- Follows same structure as mibera.schema.json (same meta annotations pattern)
- `scrawl_theme` enum lists all 10 theme names
- Optional sparse traits use patternProperties

---

### T-1.3: Write generate-parcels.py with sample validation

**Description:** Write the main generator script at `_codex/scripts/generate-parcels.py`. It should:
1. Load scrawl-theme-map.json and source JSON files
2. Generate parcel .md files (YAML frontmatter + markdown body per SDD §3.1)
3. Generate trait pages with cultural context (per SDD §6 + PRD §5)
4. Generate README with Honey Road lore (per SDD §7)
5. Generate `_codex/data/parcels.jsonl`
6. Generate `_codex/data/parcels-graph.json` (per SDD §5)
7. Copy trait report to `_codex/data/parcels-trait-report.json`

Support `--source`, `--output`, `--sample N`, and `--dry-run` flags.

Run with `--sample 10` and validate output.

**Acceptance criteria:**
- `generate-parcels.py --source ... --sample 10` produces 10 parcel files
- Each sample file has correct YAML frontmatter (type: miparcel, all present traits, scrawl_theme populated)
- Each sample file has markdown body with image, trait table, scrawl theme link, mibera cross-link
- Trait pages generated with cultural context sections (not empty placeholders)
- README.md generated with Honey Road lore section
- parcels.jsonl has 10 lines (in sample mode)
- parcels-graph.json has correct node/edge structure
- Sample parcel frontmatter matches source JSON exactly (spot-check 3 parcels)

---

## Sprint 2: Full Generation Run

**Goal:** Run the generator at full scale (10,000 parcels), validate output, and ensure everything is correct before touching existing mibera files.

### T-2.1: Full 10K parcel generation

**Description:** Run `generate-parcels.py --source /Users/mandy/Downloads/parcelsMetadataFinal` to generate all 10,000 parcel files, trait pages, README, data exports, and graph.

**Acceptance criteria:**
- `ls miparcels/*.md | wc -l` = 10,000
- `ls miparcels/traits/*.md | wc -l` = 13 (12 trait pages + README)
- `miparcels/README.md` exists with Honey Road lore + trait index
- `_codex/data/parcels.jsonl` has 10,000 lines
- `_codex/data/parcels-graph.json` exists with ~10,500 nodes and ~120,000 edges
- `_codex/data/parcels-trait-report.json` exists

---

### T-2.2: Validate parcel files against source data

**Description:** Spot-check 20 random parcels across the ID range (including edge cases: #1, #10000, a minimal 7-trait parcel, a maximal 17-trait parcel) to confirm trait fidelity. Verify that every `scrawl_theme` in generated files matches the scrawl-theme-map.

**Acceptance criteria:**
- 20 spot-checked parcels have exact trait match vs source JSON
- No parcel has a null or empty `scrawl_theme`
- Minimal parcel (e.g., #166 with 7 traits) correctly omits sparse traits from frontmatter
- Maximal parcel (17 traits) includes all traits in frontmatter
- All internal links (mibera cross-link, scrawl theme links, back-to-index) are syntactically correct

---

### T-2.3: Validate trait pages and cultural context

**Description:** Review all 12 trait documentation pages for completeness:
- `normal-addys.md` has provenance for all 5 real locations
- `stamps.md` has context for all 7 stamp series
- `stickers.md` identifies all 8 characters and their pairings
- `confetti.md` documents the 4 sub-families (elemental Jani, Tsuheji, Henlo animals, boarding passes)
- `airmail.md` covers all 10 postal systems
- `big-labels.md` covers Shulgin Foundation, General Wade, USPS labels
- `scrawl.md` has all 189 texts tagged by theme with links to deep docs
- All trait pages have value tables with counts

**Acceptance criteria:**
- Every trait page has Overview, Cultural Context (where applicable), and Values sections
- No empty cultural context sections (at minimum, the content from PRD §5)
- Scrawl page explains the 189 vs 206 count distinction
- All links to `../fractures/miparcels/scrawl.md` sections are correct
- Flag any items needing user verification (Big Nig's House context, Puruhani/Tsuheji lore)

---

## Sprint 3: Mibera Backlinks & Meta Integration

**Goal:** Patch all 10,000 mibera files with parcel cross-links, update every meta file in the codex, and pass a full audit.

### T-3.1: Write and run add-parcel-backlinks.py

**Description:** Write `_codex/scripts/add-parcel-backlinks.py` that patches each `miberas/{NNNN}.md` to:
1. Add `parcel: {id}` to YAML frontmatter (after `drug:` line)
2. Add `| Parcel | [MiParcel #{id}](../miparcels/{NNNN}.md) |` as last row in `## Traits` table

Support `--codex-root`, `--sample N`, and `--dry-run` flags. Run dry-run first, then full.

**Acceptance criteria:**
- `--dry-run` on 10 sample files shows correct diff output
- Full run patches all 10,000 mibera files
- `grep -c "^parcel:" miberas/*.md` = 10,000
- `grep -c "MiParcel #" miberas/*.md` = 10,000
- Spot-check 5 mibera files: frontmatter `parcel:` field is correct, table row links to correct parcel
- No files have duplicate `parcel:` entries (idempotent)
- `<!-- @generated:backlinks -->` sections untouched

---

### T-3.2: Update mibera schema

**Description:** Add optional `parcel` field to `_codex/schema/mibera.schema.json` per SDD §9.3.

**Acceptance criteria:**
- Schema includes `parcel` property (integer, 1–10000, optional)
- Existing mibera validation still passes

---

### T-3.3: Update manifest.json, scope.json, and navigation files

**Description:** Update all meta files to register the new miparcel entity type and parcel lookup patterns:
- `manifest.json` — add `miparcel` entity type (per SDD §9.1)
- `_codex/data/scope.json` — add `miparcel` to tracks array (per SDD §9.2)
- `CLAUDE.md` — add lookup patterns and directory layout entry
- `SUMMARY.md` — add MiParcels section
- `llms.txt` / `llms-full.txt` — add parcel lookup pattern
- `fractures/miparcels.md` — replace "coming soon" with links to trait pages, add link to full section

**Acceptance criteria:**
- `manifest.json` has `miparcel` entity type with count 10,000
- `scope.json` tracks `miparcel` as COMPLETE
- CLAUDE.md has `miparcels/{NNNN}.md` lookup pattern and directory layout row
- SUMMARY.md links to `miparcels/README.md`
- No "coming soon" entries remain in `fractures/miparcels.md`
- `_codex/scripts/audit-links.sh` passes (0 broken links)

---

### T-3.4: Final audit and validation

**Description:** Run the full codex audit suite to confirm everything is consistent:
- Link audit (audit-links.sh)
- Structure audit (audit-structure.sh)
- Count reconciliation (manifest counts match disk reality)
- Graph integrity (parcels-graph.json has expected node/edge counts)

**Acceptance criteria:**
- Link audit: 0 broken links
- Structure audit: 0 errors for miparcel files
- manifest.json miparcel count matches `find miparcels -name "*.md" ! -name "README.md" | wc -l`
- parcels-graph.json metadata counts match actual node/edge arrays
- Health report (`_codex/reports/health.md`) updated with MiParcels status

---

## Summary

| Sprint | Tasks | Focus |
|--------|-------|-------|
| 1 | T-1.1, T-1.2, T-1.3 | Scrawl mapping + schema + generator with sample validation |
| 2 | T-2.1, T-2.2, T-2.3 | Full 10K generation + validation |
| 3 | T-3.1, T-3.2, T-3.3, T-3.4 | Mibera backlinks + meta integration + final audit |

**Critical path:** Sprint 1 (scrawl map) → Sprint 2 (generation) → Sprint 3 (backlinks). Strictly sequential — each sprint depends on the previous.

**Items flagged for user review:**
- Big Nig's House cultural context in `normal-addys.md` (T-2.3)
- Puruhani and Tsuheji character lore — may need user input (T-2.3)
