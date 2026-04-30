# SDD: MiParcels — 10K Parcel Entries & Trait Documentation

**Cycle:** 022
**Status:** Draft
**Created:** 2026-04-16
**PRD:** [prd.md](prd.md)

---

## 1. Executive Summary

This cycle adds 10,000 MiParcel entries to the codex, with culturally-annotated trait documentation, scrawl-theme tagging, bidirectional Mibera cross-links, and a dedicated knowledge graph. The implementation is a data pipeline: a Python generator script reads source JSON metadata, applies scrawl-theme mappings, and produces markdown files, trait pages, data exports, and graph JSON. A separate script injects parcel backlinks into existing Mibera files.

**Scale:** 10,000 parcel files + 13 trait pages + 10,000 mibera patches + 1 graph + data exports.
**Risk profile:** Low — generative file creation from known-good source data, following established codex conventions.

## 2. System Architecture

### Pipeline Overview

```
Source Data                    Generator Script                  Output
─────────────                  ────────────────                  ──────
parcelsMetadataFinal/          generate-parcels.py               miparcels/
  ├── 1..10000 (JSON)    ──►     ├── load & validate       ──►    ├── 0001.md..10000.md
  └── _final_trait_report.json   ├── scrawl theme mapping         ├── README.md
                                 ├── render parcel .md            ├── traits/
scrawl-theme-map.json   ──►     ├── render trait pages              ├── README.md
                                 ├── render README                   ├── normal-addys.md
PRD §5 cultural context ──►     ├── generate JSONL                   ├── stamps.md
                                 └── generate graph                  └── ...
                                                              _codex/data/
                                                                ├── parcels.jsonl
                                                                ├── parcels-graph.json
                                                                └── parcels-trait-report.json

Mibera Files                   Backlink Script                   Mibera Files (patched)
────────────                   ──────────────                    ──────────────────────
miberas/0001.md..10000.md ──►  add-parcel-backlinks.py     ──►  miberas/0001.md..10000.md
                                 ├── inject frontmatter               + parcel: N
                                 └── inject table row                  + | Parcel | link |
```

### Two-Script Design

Scripts are kept separate for safety and rerunnability:

| Script | Input | Output | Idempotent? |
|--------|-------|--------|-------------|
| `generate-parcels.py` | Source JSON + scrawl-theme-map.json | miparcels/, exports, graph | Yes (overwrites) |
| `add-parcel-backlinks.py` | miberas/*.md | miberas/*.md (patched) | Yes (skips if already present) |

**Rationale:** Parcel generation is safe (creates new files). Mibera patching modifies 10,000 existing files — it must be separately runnable with dry-run mode, and must not re-run accidentally as part of generation.

## 3. File Schemas

### 3.1 MiParcel Entry (`miparcels/{NNNN}.md`)

**Filename:** Zero-padded 4-digit ID. `#1` → `0001.md`, `#42` → `0042.md`, `#10000` → `10000.md`.

**YAML Frontmatter:**

```yaml
---
id: 1                           # integer, 1-10000 (required)
type: miparcel                  # const discriminator (required)
base: "Parcel 9"               # string (required, always present)
normal_addys: "USP Terre Haute Smudged 2"   # string (required)
mibera_return_addy: "Childish"              # string (required)
stamps: "Canada Polar Bear..."              # string (required)
scrawl: "Let's get off..."                  # string (required)
scrawl_theme: "Love Letters"                # string, derived (required)
confetti: "Tsuheji Fire Element 4"          # string (required)
confetti_second: "Yellow Boarding Pass 6"   # string (optional, omitted if absent)
confetti_third: "Wood Elemental Jani 3"     # string (optional)
confetti_fourth: "Henlo Brown Bera 1"       # string (optional)
sticker1: "jani aww 1"                      # string (optional)
sticker1_second: "jani aww 2"              # string (optional)
sticker2: "Nemu"                            # string (optional)
airmail: "FRAGILE Handle With Care 6"       # string (optional)
uk_orange: "Royal Mail Return To Sender 3"  # string (optional)
big_labels: "Big Label Grateful Dead House 1"  # string (optional)
bigger_misc: "Fragile 2"                    # string (optional)
image: "https://assets.0xhoneyjar.xyz/parcels/parcelsImages/1.png"
ipfs_image: "ipfs://bafybeiexd3lj53j4gpm7rcvnvprlfaa5kqj7bi4zlh4tlj5og23j6fyese/1.png"
---
```

**Key normalization rules:**
- Trait type `"normal addys"` → frontmatter key `normal_addys`
- Trait type `"mibera return addy"` → `mibera_return_addy`
- Trait type `"bigger misc"` → `bigger_misc`
- Trait type `"big labels"` → `big_labels`
- Trait type `"uk orange"` → `uk_orange`
- All other trait types: spaces → underscores
- Values preserved exactly as-is (no normalization)
- Optional traits: **omit key entirely** when absent (do not set to null)

**Always-present traits** (verified across all 10K parcels): `base`, `normal_addys`, `mibera_return_addy`, `stamps`, `scrawl`, `confetti`.

**Markdown Body:**

```markdown
# MiParcel #1

![MiParcel #1]({s3_image_url})

## Traits

| Trait | Value |
|-------|-------|
| Base | Parcel 9 |
| Normal Addys | USP Terre Haute Smudged 2 |
| Mibera Return Addy | Childish |
| Stamps | Canada Polar Bear Ursus Maritimus 1953 Two Stamps |
| Scrawl | Let's get off because it's the end of the world |
| Confetti | Tsuheji Fire Element 4 |
| Confetti (2nd) | Yellow Boarding Pass 6 |
| Confetti (3rd) | Wood Elemental Jani 3 |
| Confetti (4th) | Henlo Brown Bera 1 |
| Sticker 2 | Nemu |
| Airmail | FRAGILE Handle With Care 6 |
| UK Orange | Royal Mail Return To Sender 3 |
| Bigger Misc | Fragile 2 |

**Scrawl Theme:** [Love Letters](traits/scrawl.md#love-letters) · [Full analysis →](../fractures/miparcels/scrawl.md#love-letters)

**Mibera:** [Mibera #1](../miberas/0001.md)

---

[← Back to Index](README.md)
```

**Trait table rules:**
- Only traits that are present are shown (no rows for absent sparse traits)
- Trait order is fixed: base, normal_addys, mibera_return_addy, stamps, scrawl, confetti (×4), sticker1 (×2), sticker2, airmail, uk_orange, big_labels, bigger_misc
- Display names use readable labels (e.g., "Confetti (2nd)" not "confetti_second")

### 3.2 Mibera Patch Format

**Frontmatter addition:**
```yaml
parcel: 1  # integer, added after drug field
```

**Trait table addition** (inserted as last row before the `---` separator):
```markdown
| Parcel | [MiParcel #1](../miparcels/0001.md) |
```

**Insertion logic:**
1. Parse file line-by-line; find `drug:` line in frontmatter, insert `parcel: {id}` on next line
2. Find the `## Traits` section; find last `| ... |` row; insert parcel row after it
3. Skip if `parcel:` already exists in frontmatter (idempotent)

### 3.3 JSON Schema (`_codex/schema/miparcel.schema.json`)

Follows the existing schema conventions with `x-codex-meta` and `x-codex-confidence` annotations:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "miparcel.schema.json",
  "title": "MiParcel Entry",
  "description": "Schema for MiParcel YAML frontmatter (miparcels/NNNN.md)",
  "x-codex-meta": {
    "entity_type": "miparcel",
    "confidence_profile": "16/17 canonical, 1 derived (scrawl_theme)",
    "primary_source": "parcelsMetadataFinal",
    "last_verified": "2026-04-16"
  },
  "type": "object",
  "required": ["id", "type", "base", "normal_addys", "mibera_return_addy",
               "stamps", "scrawl", "scrawl_theme", "confetti",
               "image", "ipfs_image"],
  "properties": {
    "id": { "type": "integer", "minimum": 1, "maximum": 10000 },
    "type": { "const": "miparcel" },
    "scrawl_theme": {
      "type": "string",
      "enum": ["Rave & K-Hole", "Milady-Mibera Duality", "Cosmology",
               "Lore Figures", "The Choose Manifesto", "Refusal",
               "Kaironic Time", "Love Letters", "True Names & Identity",
               "Mission & Rescue"]
    }
  },
  "patternProperties": {
    "^(confetti_second|confetti_third|confetti_fourth|sticker1|sticker1_second|sticker2|airmail|uk_orange|big_labels|bigger_misc)$": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```

## 4. Scrawl-Theme Mapping

### 4.1 Strategy

Static lookup table stored as `_codex/data/scrawl-theme-map.json`:

```json
{
  "Online to get offline": "Rave & K-Hole",
  "I am the refusal": "Refusal",
  "Milady's Identity Crisis": "True Names & Identity",
  "There is no Random I Love You": "Love Letters",
  ...
}
```

### 4.2 Construction

A one-time helper script `_codex/scripts/build-scrawl-theme-map.py`:

1. Parse `fractures/miparcels/scrawl.md` — each `## {Theme}` heading is a cluster; each `| {Text} |` in the table within that section is a scrawl text
2. Build dict: `{text.strip(): theme}` for each entry
3. Load trait report's 189 scrawl values
4. Match each value: exact → case-insensitive → flag unmapped
5. Write JSON output + coverage report

**Expected coverage:** Near 100%. The 206 entries in scrawl.md represent visual variants of ~189 unique texts. Some texts appear multiple times with different style/placement/weight — all map to the same theme.

### 4.3 Handling the 189 vs 206 Count

- **189:** Unique text strings in the metadata (what `trait_type: "scrawl"` returns)
- **206:** Visual variants in scrawl.md (same text, different style/placement/weight/color)
- **Mapping uses text content only.** Multiple visual variants of the same text all map to the same theme.
- The scrawl trait page documents this distinction explicitly.

## 5. Knowledge Graph Schema

### 5.1 Graph Structure (`_codex/data/parcels-graph.json`)

Same top-level schema as `graph.json`:

```json
{
  "metadata": {
    "generated": "2026-04-16",
    "description": "MiParcel trait knowledge graph",
    "node_count": 10541,
    "edge_count": 120000
  },
  "nodes": [...],
  "edges": [...]
}
```

### 5.2 Node Types

| Type | ID Pattern | Count | Has Context? |
|------|-----------|-------|-------------|
| `miparcel` | `miparcel:1` | 10,000 | No |
| `parcel_base` | `parcel_base:parcel-9` | 24 | No |
| `address` | `address:usp-terre-haute` | 5 | Yes (location provenance) |
| `address_variant` | `address_variant:usp-terre-haute-smudged-2` | 14 | No |
| `return_addy` | `return_addy:childish` | 17 | No |
| `stamp_series` | `stamp_series:grateful-dead-montserrat` | 7 | Yes (series history) |
| `stamp` | `stamp:canada-polar-bear-1953-two-stamps` | 41 | No |
| `scrawl_theme` | `scrawl_theme:love-letters` | 10 | Yes (theme description) |
| `scrawl` | `scrawl:{slug}` | 189 | No |
| `character` | `character:jani` | 8 | Yes (character name) |
| `confetti_family` | `confetti_family:elemental-jani` | 4 | Yes (sub-family desc) |
| `confetti` | `confetti:{slug}` | 71 | No |
| `sticker` | `sticker:{slug}` | 78 | No |
| `airmail_system` | `airmail_system:welsh-post` | 10 | Yes (postal system) |
| `airmail` | `airmail:{slug}` | 42 | No |

**Estimated total:** ~10,541 nodes

### 5.3 Edge Types

| Type | Source → Target | Weight |
|------|----------------|--------|
| `has_base` | miparcel → parcel_base | 1 |
| `has_address` | miparcel → address_variant | 1 |
| `has_return_addy` | miparcel → return_addy | 1 |
| `has_stamp` | miparcel → stamp | 1 |
| `has_scrawl` | miparcel → scrawl | 1 |
| `has_confetti` | miparcel → confetti | 1 (up to 4 per parcel) |
| `has_sticker` | miparcel → sticker | 1 (up to 3 per parcel) |
| `has_airmail` | miparcel → airmail | 1 |
| `has_uk_orange` | miparcel → sticker | 1 |
| `has_big_label` | miparcel → sticker | 1 |
| `has_bigger_misc` | miparcel → sticker | 1 |
| `scrawl_in_theme` | scrawl → scrawl_theme | 2 |
| `address_at` | address_variant → address | 2 |
| `stamp_in_series` | stamp → stamp_series | 2 |
| `confetti_in_family` | confetti → confetti_family | 2 |
| `features_character` | sticker → character | 2 |
| `airmail_from_system` | airmail → airmail_system | 2 |
| `corresponds_to` | miparcel → mibera:{N} | 3 |

**Weight convention:** 1 = direct trait, 2 = hierarchy, 3 = cross-entity reference (matches graph.json pattern).

**Estimated total:** ~120,000 edges

### 5.4 Hierarchy Nodes

Grouping nodes that don't exist in flat metadata but enable richer queries:

- **5 address locations** grouping 14 variants
- **7 stamp series** grouping 41 stamps
- **4 confetti families** grouping 71 designs (Elemental Jani, Tsuheji Elements, Henlo Animals, Boarding Passes)
- **10 postal systems** grouping 42 airmail labels
- **8 characters** referenced across stickers + confetti (Jani, Akane, Nemu, Ruan, Kaori, Eun, Puruhani, Tsuheji)

Character detection in sticker/confetti values uses substring matching against known character names.

## 6. Trait Page Architecture

### 6.1 Template

```markdown
# {Category Name}

> {One-line description}

## Overview

{Count} unique values across 10,000 MiParcels. {Sparsity note.}

## Cultural Context

{From PRD §5 — the "why" behind these values.}

## Values

| Value | Count | Notes |
|-------|-------|-------|
| ... | ... | ... |

---

[← Back to Trait Index](README.md)
```

### 6.2 Cultural Context Requirements

| Page | Cultural Context | User Review? |
|------|-----------------|-------------|
| `normal-addys.md` | 5 real locations with full provenance (PRD §5.1) | Yes |
| `stamps.md` | 7 stamp series with historical context (PRD §5.2) | No |
| `stickers.md` | Character roster + pairings (PRD §5.3) | Maybe (Puruhani, Tsuheji) |
| `confetti.md` | Elemental sub-families + character families (PRD §5.4) | No |
| `airmail.md` | 10 postal systems by nation (PRD §5.5) | No |
| `big-labels.md` | Shulgin Foundation, General Wade, USPS (PRD §5.6) | No |
| `scrawl.md` | 189 texts tagged by theme cluster, links to deep docs | No |
| `base.md` | 24 envelope designs with counts | No |
| `return-addys.md` | 17 handwriting styles with counts | No |
| `bigger-misc.md` | 18 elements with counts | No |
| `uk-orange.md` | 4 Royal Mail variants with counts | No |

### 6.3 Scrawl Page (Special Case)

Does NOT duplicate `fractures/miparcels/scrawl.md`. Instead:

1. Lists all 189 text values with theme tag and count
2. Groups by theme cluster with anchor headings
3. Each heading links to corresponding section in `../fractures/miparcels/scrawl.md`
4. Explains the 189 vs 206 distinction (text vs visual variant)
5. Cross-links enable navigation: parcel → scrawl trait page → deep analysis

## 7. README / Honey Road Lore

`miparcels/README.md` serves dual purpose — lore documentation and index:

### Structure

1. **Title + epigraph** from the shared collection description
2. **Honey Road lore section:**
   - "Honey Road" = Silk Road + Honey (Berachain)
   - "High Council 任侠団体" = ninkyō dantai / chivalrous organization
   - "101 Bears" = founding community reference
   - Shared description analysis ("Kaironic time viscous like Honey")
3. **Collection identity table** (contract, IPFS CID, counts)
4. **Trait category table** with links to trait pages
5. **Lookup instructions**
6. **Cross-links** to fracture entry and scrawl deep docs

## 8. Script Design

### 8.1 `generate-parcels.py`

**Location:** `_codex/scripts/generate-parcels.py`
**Dependencies:** stdlib only (json, os, pathlib, re)

```
usage: generate-parcels.py [-h] --source DIR [--output DIR] [--sample N] [--dry-run]

  --source DIR    Path to parcelsMetadataFinal/ (required)
  --output DIR    Codex root directory (default: .)
  --sample N      Generate only first N parcels (for testing)
  --dry-run       Print stats without writing files
```

**Pipeline:**

1. **Load** `_codex/data/scrawl-theme-map.json`
2. **Load** `_final_trait_report.json` from source dir
3. **Scan + validate** source JSON files (check required fields exist)
4. **Generate parcel files** (10K iterations):
   - Normalize trait keys (spaces → underscores)
   - Look up `scrawl_theme` from mapping
   - Render YAML frontmatter (required fields first, then optional in fixed order)
   - Render markdown body (heading, image, trait table, scrawl theme link, mibera link, back link)
   - Write to `miparcels/{NNNN}.md`
5. **Generate trait pages** (13 files):
   - Load cultural context strings (embedded in script from PRD §5)
   - For each category: header, overview, cultural context, values table sorted by count desc
6. **Generate README** with lore + index
7. **Generate JSONL** (`_codex/data/parcels.jsonl`)
8. **Generate graph** (`_codex/data/parcels-graph.json`)
9. **Copy trait report** to `_codex/data/parcels-trait-report.json`
10. **Print summary** (files created, unmapped scrawls, warnings)

**Performance:** 10K JSON reads + 10K markdown writes ≈ 20–30 seconds. No parallelism needed.

### 8.2 `add-parcel-backlinks.py`

**Location:** `_codex/scripts/add-parcel-backlinks.py`
**Dependencies:** stdlib only

```
usage: add-parcel-backlinks.py [-h] [--codex-root DIR] [--sample N] [--dry-run]

  --codex-root DIR   Codex root directory (default: .)
  --sample N         Patch only first N mibera files (for testing)
  --dry-run          Show what would change without writing
```

**Algorithm per file:**

```python
content = read(f"miberas/{nnnn}.md")

# 1. Skip if already patched
if "parcel:" in frontmatter_section(content):
    skip()

# 2. Inject frontmatter field after drug: line
content = re.sub(
    r'^(drug: .+)$',
    rf'\1\nparcel: {id}',
    content, count=1, flags=re.MULTILINE
)

# 3. Find last trait table row, inject parcel row after it
# Pattern: last line matching "| ... | ... |" before "---" or "["
content = inject_row_before_separator(
    content,
    f'| Parcel | [MiParcel #{id}](../miparcels/{nnnn}.md) |'
)

write(f"miberas/{nnnn}.md", content)
```

**Safety guarantees:**
- `--dry-run` prints diff without writing (default for first run)
- Frontmatter check prevents double-injection
- Does NOT touch `<!-- @generated:backlinks -->` sections
- Regex-based (no YAML re-serialization that could reorder fields)

### 8.3 `build-scrawl-theme-map.py`

**Location:** `_codex/scripts/build-scrawl-theme-map.py`
**Purpose:** One-time helper — generates `_codex/data/scrawl-theme-map.json`
**Input:** `fractures/miparcels/scrawl.md` + source trait report

**Algorithm:**
1. Parse scrawl.md line-by-line:
   - `## {Theme}` → current_theme
   - `| {Text} | {Style} | ...` → map text.strip() to current_theme
2. Deduplicate (same text in same theme = keep one)
3. Load 189 unique scrawl values from trait report
4. Match: exact → case-insensitive → fuzzy (strip punctuation) → flag unmapped
5. Write JSON + print coverage

## 9. Meta File Updates

### 9.1 manifest.json — Add `miparcel` entity type

```json
"miparcel": {
  "directory": "miparcels/",
  "index": "miparcels/README.md",
  "count": 10000,
  "format": "yaml_frontmatter",
  "naming": "{NNNN}.md (zero-padded 4-digit ID)",
  "id_range": [1, 10000],
  "fields": ["base", "normal_addys", "mibera_return_addy", "stamps", "scrawl",
             "scrawl_theme", "confetti", "confetti_second", "confetti_third",
             "confetti_fourth", "sticker1", "sticker1_second", "sticker2",
             "airmail", "uk_orange", "big_labels", "bigger_misc"],
  "completeness": "COMPLETE",
  "completeness_note": "All 10,000 MiParcels from Phase 1 reveal",
  "last_verified": "2026-04-16"
}
```

### 9.2 scope.json — Add to tracks array

```json
{
  "entity_type": "miparcel",
  "count": 10000,
  "completeness": "COMPLETE",
  "note": "All 10,000 MiParcels (Phase 1 reveal) with 16 trait categories + derived scrawl_theme"
}
```

### 9.3 mibera.schema.json — Add optional parcel field

```json
"parcel": {
  "type": "integer",
  "minimum": 1,
  "maximum": 10000,
  "description": "Corresponding MiParcel ID (1:1 mapping)",
  "x-codex-confidence": "canonical",
  "x-codex-source": "id-mapping"
}
```

### 9.4 CLAUDE.md Updates

**Lookup Patterns** — add:
```
- **MiParcel by ID**: `miparcels/{NNNN}.md` (zero-padded 4 digits: #42 → `miparcels/0042.md`)
- **Parcel trait**: `miparcels/traits/{category-slug}.md`
```

**Directory Layout** — add:
```
| `miparcels/` | Individual MiParcel files | 10,000 |
| `miparcels/traits/` | Parcel trait documentation (with cultural context) | 13 |
```

**Scope Boundaries** — update "What the codex tracks" to include 10,000 MiParcels.

### 9.5 fractures/miparcels.md — Update placeholders

Replace `*(coming soon)*` sticker and label entries with links to new trait pages. Add link to full `miparcels/` section.

## 10. Execution Order

```
Phase 1: Preparation
  1. build-scrawl-theme-map.py → _codex/data/scrawl-theme-map.json
  2. Review unmapped scrawls (if any), manually resolve
  3. Write _codex/schema/miparcel.schema.json

Phase 2: Generation
  4. generate-parcels.py --source ... --sample 10  (validate output)
  5. Review sample: frontmatter, trait table, scrawl theme, links
  6. generate-parcels.py --source ...  (full 10K run)
  7. Validate: file count, spot-check traits, link audit

Phase 3: Backlinks
  8. add-parcel-backlinks.py --dry-run  (review changes)
  9. add-parcel-backlinks.py  (full 10K run)
  10. Validate: spot-check mibera files, structure audit

Phase 4: Meta Integration
  11. Update manifest.json, scope.json, mibera.schema.json
  12. Update CLAUDE.md, SUMMARY.md, llms.txt, llms-full.txt
  13. Update fractures/miparcels.md
  14. Run full audit suite
```

## 11. Validation Checklist

- [ ] `ls miparcels/*.md | wc -l` = 10,000
- [ ] `ls miparcels/traits/*.md | wc -l` = 14 (13 pages + README)
- [ ] Every parcel has `scrawl_theme` in frontmatter
- [ ] Spot-check 10 random parcels against source JSON (trait fidelity)
- [ ] `grep -c "^parcel:" miberas/*.md` = 10,000
- [ ] `grep -c "MiParcel #" miberas/*.md` = 10,000
- [ ] `_codex/scripts/audit-links.sh` passes
- [ ] `parcels-graph.json` node count ≈ 10,541
- [ ] `parcels-graph.json` edge count ≈ 120,000
- [ ] `parcels.jsonl` line count = 10,000
- [ ] manifest.json includes `miparcel` entity type with count 10,000
- [ ] scope.json includes `miparcel` in tracks
- [ ] No "coming soon" entries remain in fractures/miparcels.md

---

> **Next:** `/sprint-plan` to break this into implementation sprints.
