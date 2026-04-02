# PRD: Cycle 003 — Data Architecture & Machine Readability

**Version**: 1.0.0
**Date**: 2026-02-15
**Cycle**: 003
**Status**: Draft

> Sources: `grimoires/loa/context/codex-improvement-research.md`, Cycle 001-002 learnings

---

## 1. Problem Statement

The Mibera Codex's 10,000 Mibera entry files store all data in markdown tables — opaque to Obsidian Dataview, static site generators, embedding pipelines, and machine validation. This is the single biggest architectural limitation. Additionally, data types are inconsistent (dates in 3+ formats, swag_score as string vs number), there are no machine-executable schemas, no bulk data export, and entity files lack backlinks to their Miberas.

This cycle transforms the codex from a human-readable documentation site into **lore as infrastructure** — structured, machine-readable, queryable, and composable.

---

## 2. Goals & Success Metrics

| Goal | Metric | Target |
|------|--------|--------|
| All Miberas have YAML frontmatter | Files with valid frontmatter | 10,000/10,000 |
| Machine-readable bulk export | `_data/miberas.jsonl` exists and is valid | 10,000 lines |
| Data consistency | Date format violations | 0 |
| Schema enforcement | JSON Schema validation passes | All entity types |
| Semantic integrity | `audit-semantic.sh` errors | 0 |
| Backlinks on entity files | Entity files with Mibera backlink sections | All drugs, ancestors, tarot cards |
| Community readiness | `CONTRIBUTING.md` exists | Yes |
| LLM full context | `llms-full.txt` exists | Yes |

---

## 3. Scope

### In Scope (8 features from research doc)

| ID | Research # | Feature | Files Affected |
|----|-----------|---------|----------------|
| F1 | #1 | Add YAML frontmatter to 10K Mibera files | 10,000 |
| F2 | #5 | Normalize data inconsistencies (dates, types) | ~1,400 (traits, drugs) |
| F3 | #2 | Generate `_data/miberas.jsonl` bulk export | 1 new script + 1 output |
| F4 | #3 | Formal JSON Schema files | ~6 new files |
| F5 | #6 | Semantic validation script (`audit-semantic.sh`) | 1 new script |
| F6 | #11 | Reverse-link sections (backlinks) on entity files | ~190 entity files |
| F7 | #15 | Create `llms-full.txt` (full LLM context file) | 1 new script + 1 output |
| F8 | #25 | `CONTRIBUTING.md` + `CODEOWNERS` | 2 new files |

### Out of Scope

- Static site generation (Astro/Starlight) — Tier 3
- D3.js visualization — Tier 3
- MCP server — Tier 3
- RAG corpus generation — Tier 3
- Canon tiers and holder lore sections — Tier 4
- Ontology file — deferred until schemas stabilize
- Tags system — deferred until frontmatter is stable
- CI pipeline (GitHub Actions) — separate concern
- Obsidian plugin configuration — user-side, not codex changes
- Graph.json adjacency export — deferred to future cycle

---

## 4. Functional Requirements

### F1: Add YAML Frontmatter to 10,000 Mibera Files (P0)

Create `_scripts/add-frontmatter.sh` that parses each Mibera's markdown table and inserts YAML frontmatter above the existing content. The markdown table is preserved for human readability.

**Frontmatter fields** (extracted from existing table):
```yaml
---
id: 1
type: mibera
archetype: Freetekno
ancestor: Greek
time_period: Modern
birthday: "1352-07-21"
sun_sign: Cancer
moon_sign: Leo
ascending_sign: Scorpio
element: Earth
swag_rank: B
swag_score: 41
drug: St. John's Wort
background: Fyre Festival
---
```

**Rules**:
- Extract values from existing markdown table rows
- Preserve link display text as values (e.g., `[Freetekno](...) ` → `Freetekno`)
- `id` is the numeric ID (integer, not zero-padded)
- `type: mibera` discriminator on every file
- `swag_score` as integer
- `birthday` as ISO date string where parseable
- Existing markdown table and all content below it is unchanged
- Script is idempotent (skip files that already have frontmatter)

**Acceptance**: `audit-structure.sh` validates all 10,000 files have frontmatter; all fields non-empty

### F2: Normalize Data Inconsistencies (P1)

Create `_scripts/normalize-data.sh` to standardize across all YAML-frontmatter files:

**Date normalization**:
- `"December 9, 2024"` → `"2024-12-09"`
- `"August 2024"` → `"2024-08"` (month-only preserved)
- `"January 12, 2025"` → `"2025-01-12"`
- Apply to `date_added` field in traits, drugs, and Mibera frontmatter

**Type normalization**:
- `swag_score: '4'` → `swag_score: 4` (string to integer)
- Apply across all files with `swag_score`

**Acceptance**: No mixed date formats; all `swag_score` values are integers; script is idempotent

### F3: Generate `_data/miberas.jsonl` (P1)

Create `_scripts/generate-exports.sh` that reads all 10,000 Mibera YAML frontmatter and outputs one JSON object per line:

```jsonl
{"id":1,"archetype":"Freetekno","ancestor":"Greek","drug":"St. John's Wort","element":"Earth","swag_rank":"B","swag_score":41,"birthday":"1352-07-21","time_period":"Modern","sun_sign":"Cancer","moon_sign":"Leo","ascending_sign":"Scorpio","background":"Fyre Festival"}
```

**Acceptance**: 10,000 lines; valid JSON per line; all fields present; file size reasonable (~5-10MB)

### F4: Formal JSON Schema Files (P2)

Create machine-executable JSON Schema files in `_schema/`:
- `_schema/mibera.schema.json`
- `_schema/drug.schema.json`
- `_schema/ancestor.schema.json`
- `_schema/tarot-card.schema.json`
- `_schema/trait-full.schema.json`
- `_schema/trait-minimal.schema.json`
- `_schema/special-collection.schema.json`

Each schema defines required fields, types, and enum constraints where applicable.

**Acceptance**: Schemas validate against their respective file types with 0 errors

### F5: Semantic Validation Script (P1)

Create `_scripts/audit-semantic.sh` checking:
- **Enum validation**: archetype values match {Freetekno, Milady, Chicago Detroit, Acidhouse}
- **Bidirectional references**: Drug X says Tarot Card Y ↔ Tarot Card Y says Drug X
- **Count reconciliation**: Element totals sum to 10,000
- **Birthday-era consistency**: Birthday dates fall within listed era ranges
- **Orphan detection**: Trait files referenced by 0 Miberas

**Acceptance**: Script runs in <60s; output is JSON report; 0 errors on clean codex

### F6: Reverse-Link Sections (Backlinks) (P1)

Create `_scripts/generate-backlinks.sh` that auto-generates `## Miberas with this [trait/drug/ancestor]` sections on entity files:
- All 78 drug files: list Miberas by drug
- All 33 ancestor files: list Miberas by ancestor
- All 78 tarot card files: list Miberas by drug→tarot mapping

Use marker comments (`<!-- @generated:backlinks-start -->` / `<!-- @generated:backlinks-end -->`) so regeneration is safe.

**Format**: Same inline link style as browse pages (`[#0001](../miberas/0001.md) • [#0002](...) • ...`)

**Acceptance**: All entity files have backlink sections; links are valid; script is idempotent

### F7: Create `llms-full.txt` (P2)

Create `_scripts/generate-llms-full.sh` that concatenates core lore into a single file:
- `IDENTITY.md`
- `core-lore/philosophy.md`
- `core-lore/archetypes.md`
- `core-lore/drug-tarot-system.md`
- `glossary.md`
- All 33 ancestor files (content only, no frontmatter)
- All 78 drug files (content only, no frontmatter)

Output: `llms-full.txt` (~200KB). Gives an LLM the complete conceptual framework in one context load.

**Acceptance**: File exists; contains all listed sections; <300KB; readable as plain text

### F8: Community Infrastructure (P2)

Create:
- `CONTRIBUTING.md` with PR template, review process, quality checklist, and content type guides
- `CODEOWNERS` with protection zones:
  - `core-lore/` and `IDENTITY.md` → core team review required
  - `traits/` and `traits/overlays/molecules/` → lighter review
  - `miberas/` → open for holder lore contributions

**Acceptance**: Both files exist; CODEOWNERS syntax is valid; CONTRIBUTING.md covers all content types

---

## 5. Technical Approach

- All scripts go in `_scripts/` following existing conventions (bash wrapper + python3 for speed)
- Frontmatter migration reads existing markdown tables using the proven `extract_field()` pattern from `generate-browse.sh`
- Data normalization uses python3 `dateutil` or manual parsing for date formats
- JSON Schemas follow Draft 2020-12
- Backlink generation follows the same inline link format as browse pages (max 50, "...and N more")
- `llms-full.txt` is a simple concatenation with section headers
- All generated content uses marker comments for idempotent regeneration

---

## 6. Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Frontmatter breaks existing table parsing | Medium | High | Run `audit-structure.sh` + `audit-links.sh` after migration |
| Date parsing edge cases | Medium | Low | Handle gracefully; log unparseable dates |
| Backlinks make entity files very long | Low | Low | Cap at 50 inline links with "...and N more" |
| `llms-full.txt` too large for context windows | Low | Low | Target <300KB; provide section markers for selective loading |

---

## 7. Dependencies

- F1 (frontmatter) must complete before F2 (normalize) and F3 (JSONL export)
- F4 (schemas) can be parallel with F1
- F5 (semantic validation) benefits from F1 but core checks work without it
- F6 (backlinks) and F7 (llms-full) are independent
- F8 (CONTRIBUTING) is independent
