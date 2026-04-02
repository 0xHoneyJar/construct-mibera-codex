# SDD: Cycle 003 — Data Architecture & Machine Readability

**Version**: 1.0.0
**Date**: 2026-02-15
**Cycle**: 003
**PRD**: `grimoires/loa/prd.md`

---

## 1. Overview

This cycle transforms 10,000 Mibera entry files from opaque markdown tables into structured, machine-readable documents with YAML frontmatter. It also normalizes data inconsistencies across the codex, adds bulk export, formal schemas, semantic validation, backlinks, and community infrastructure.

All scripts go in `_scripts/`. All scripts are python3 (invoked via bash wrappers where needed). All scripts are idempotent.

---

## 2. Change Manifest

| ID | Feature | Operation | Estimated Files |
|----|---------|-----------|-----------------|
| F1 | YAML Frontmatter | EDIT | 10,000 Mibera files |
| F2 | Data Normalization | EDIT | ~1,400 (drugs, traits with dates) |
| F3 | JSONL Export | CREATE | 1 script + 1 output file |
| F4 | JSON Schemas | CREATE | 7 schema files |
| F5 | Semantic Validation | CREATE | 1 script |
| F6 | Backlinks | EDIT | ~190 entity files |
| F7 | llms-full.txt | CREATE | 1 script + 1 output file |
| F8 | Community Infrastructure | CREATE | 2 files |

---

## 3. Detailed Specifications

### 3.1 F1: Add YAML Frontmatter to 10,000 Mibera Files

**Script**: `_scripts/add-frontmatter.py`

**Approach**: Read each `miberas/NNNN.md` file, parse the markdown table, extract field values, insert YAML frontmatter block above the existing content. The markdown table and all content below it remains unchanged.

#### 3.1.1 Table Parsing

The Mibera markdown table has a consistent structure:

```markdown
| Trait | Value |
|-------|-------|
| Archetype | [Freetekno](../core-lore/archetypes.md#freetekno) |
| Drug | [St. John'S Wort](../traits/overlays/molecules/st-johns-wort.md) |
| Swag Score | 41 |
| Hat | None |
```

**Parser rules**:
1. Find the table by locating `| Trait | Value |`
2. Skip the separator line `|-------|-------|`
3. For each row, split on `|` to get field name and value
4. Strip whitespace from both field name and value

#### 3.1.2 Value Extraction

| Value Pattern | Extraction Rule | Example Input | Output |
|--------------|-----------------|---------------|--------|
| Markdown link | Extract display text only | `[Freetekno](../path)` | `Freetekno` |
| `None` literal | Store as YAML null | `None` | `null` |
| Plain number | Store as integer | `41` | `41` |
| Plain text | Store as string | `Modern` | `Modern` |
| Coordinates | Store as string | `72.866033, -40.860343` | `"72.866033, -40.860343"` |

**Link text extraction regex**: `\[([^\]]+)\]\([^)]+\)` → capture group 1

#### 3.1.3 Field Mapping

| Table Field | Frontmatter Key | Type | Notes |
|-------------|----------------|------|-------|
| (from filename) | `id` | integer | `0001.md` → `1` |
| (hardcoded) | `type` | string | Always `"mibera"` |
| Archetype | `archetype` | string | Link text. Values: Freetekno, Milady, Acidhouse, Chicago/Detroit |
| Ancestor | `ancestor` | string | Link text |
| Time Period | `time_period` | string | Plain text: Modern, Ancient, etc. |
| Birthday | `birthday` | string | Link text as-is: `"07/21/1352 Ce 19:47"` |
| Birth Coordinates | `birth_coordinates` | string | Quoted string |
| Sun Sign | `sun_sign` | string | Link text |
| Moon Sign | `moon_sign` | string | Link text |
| Ascending Sign | `ascending_sign` | string | Link text |
| Element | `element` | string | Link text |
| Swag Rank | `swag_rank` | string | Link text (A, B, C, D, S) |
| Swag Score | `swag_score` | integer | Parse as int |
| Background | `background` | string | Link text |
| Body | `body` | string | Link text |
| Hair | `hair` | string or null | Link text or null if None |
| Eyes | `eyes` | string | Link text |
| Eyebrows | `eyebrows` | string | Link text |
| Mouth | `mouth` | string | Link text |
| Shirt | `shirt` | string or null | Link text or null if None |
| Hat | `hat` | string or null | Link text or null if None |
| Glasses | `glasses` | string or null | Link text or null if None |
| Mask | `mask` | string or null | Link text or null if None |
| Earrings | `earrings` | string or null | Link text or null if None |
| Face Accessory | `face_accessory` | string or null | Link text or null if None |
| Tattoo | `tattoo` | string or null | Link text or null if None |
| Item | `item` | string or null | Link text or null if None |
| Drug | `drug` | string | Link text |

#### 3.1.4 Birthday Handling

The birthday field in Mibera tables is a link: `[07/21/1352 Ce 19:47](../birthdays/medieval.md#...)`.

**Extracted value** is the link display text: `07/21/1352 Ce 19:47`.

We do NOT attempt to convert birthday to ISO 8601 in this cycle for these reasons:
- The `MM/DD/YYYY Ce/Bce HH:MM` format is the codex's native temporal representation
- Birthday era links depend on this exact format
- Converting `Bce` dates to ISO negative years introduces complexity with no current consumer
- The raw format preserves all information (date, era designation, time)

Future cycles can add a `birthday_iso` computed field if needed.

#### 3.1.5 Idempotency

The script checks if a file already starts with `---\n`. If so, it skips the file.

#### 3.1.6 Output Example

```yaml
---
id: 1
type: mibera
archetype: Freetekno
ancestor: Greek
time_period: Modern
birthday: "07/21/1352 Ce 19:47"
birth_coordinates: "72.866033, -40.860343"
sun_sign: Cancer
moon_sign: Leo
ascending_sign: Scorpio
element: Earth
swag_rank: B
swag_score: 41
background: Fyre Festival
body: Umber
hair: Afro
eyes: Normal Grey
eyebrows: Anxious Thick
mouth: Cig
shirt: Htrk Night Faces
hat: null
glasses: Red Sunglasses
mask: null
earrings: null
face_accessory: Fluoro Pink
tattoo: null
item: Beads
drug: St. John'S Wort
---

# Mibera #1
[... existing content unchanged ...]
```

---

### 3.2 F2: Normalize Data Inconsistencies

**Script**: `_scripts/normalize-data.py`

Operates on YAML frontmatter of drugs and traits files. Does NOT modify Mibera frontmatter (those are already clean from F1's extraction logic).

#### 3.2.1 Date Normalization

**Target field**: `date_added` in drug and trait files.

| Input Pattern | Regex | Output | Count |
|--------------|-------|--------|-------|
| `January 12, 2025` | `^(\w+) (\d{1,2}), (\d{4})$` | `2025-01-12` | ~1,300 |
| `August 1st, 2024` | `^(\w+) (\d{1,2})(st\|nd\|rd\|th), (\d{4})$` | `2024-08-01` | ~3 |
| `December 10 , 2024` | `^(\w+) (\d{1,2}) ?, (\d{4})$` | `2024-12-10` | ~1 |
| `August 2024` | `^(\w+) (\d{4})$` | `2024-08` | ~5 |
| `2026-02-15` | Already ISO | No change | ~2 |
| `**Introduced By:**` | Malformed — not a date | Set to `null` | ~56 |
| Empty / `""` | No value | Set to `null` | varies |

**Month mapping**: Standard English month names → two-digit numbers. Case-insensitive.

**Malformed handling**: If `date_added` does not match any known date pattern, set to `null` and log a warning. This prevents silent data corruption.

#### 3.2.2 Swag Score Normalization

**Target field**: `swag_score` in drug and trait files.

| Input Pattern | Rule | Output |
|--------------|------|--------|
| `'4'` (quoted string) | Parse to int | `4` |
| `4` (already int) | No change | `4` |
| `"2,3,4"` or `"1, 2, 3"` (multi-value) | Take first value, parse to int | `2` or `1` |
| `---` (null marker) | Set to null | `null` |
| Empty / `""` | Set to null | `null` |
| URL or garbage | Set to null, log warning | `null` |

**Rationale for multi-value**: ~9 drug files have comma-separated swag_scores. These appear to be per-archetype scores. For now, take the first value. A `swag_scores` array field can be added in a future cycle if needed.

#### 3.2.3 Processing Order

1. Load file's YAML frontmatter
2. Normalize `date_added` if present
3. Normalize `swag_score` if present
4. Write back with normalized values, preserving all other fields and markdown body unchanged

**Idempotency**: Running twice produces identical output. Already-normalized values pass through unchanged.

---

### 3.3 F3: Generate `_data/miberas.jsonl`

**Script**: `_scripts/generate-exports.py`

Reads all 10,000 Mibera files' YAML frontmatter (requires F1 complete) and outputs one JSON object per line.

#### 3.3.1 Output Schema

```json
{
  "id": 1,
  "type": "mibera",
  "archetype": "Freetekno",
  "ancestor": "Greek",
  "time_period": "Modern",
  "birthday": "07/21/1352 Ce 19:47",
  "birth_coordinates": "72.866033, -40.860343",
  "sun_sign": "Cancer",
  "moon_sign": "Leo",
  "ascending_sign": "Scorpio",
  "element": "Earth",
  "swag_rank": "B",
  "swag_score": 41,
  "background": "Fyre Festival",
  "body": "Umber",
  "hair": "Afro",
  "eyes": "Normal Grey",
  "eyebrows": "Anxious Thick",
  "mouth": "Cig",
  "shirt": "Htrk Night Faces",
  "hat": null,
  "glasses": "Red Sunglasses",
  "mask": null,
  "earrings": null,
  "face_accessory": "Fluoro Pink",
  "tattoo": null,
  "item": "Beads",
  "drug": "St. John'S Wort"
}
```

#### 3.3.2 Rules

- Sort by `id` ascending (1–10000)
- One JSON object per line, no trailing comma, no array wrapper
- `null` for None values (not `"None"`, not omitted)
- `swag_score` as integer (not string)
- All string values preserve original casing from markdown link text
- Output to `_data/miberas.jsonl`
- Create `_data/` directory if it doesn't exist

#### 3.3.3 Validation

After generation, the script self-validates:
- Exactly 10,000 lines
- Each line is valid JSON
- All required fields present per line
- `id` values are 1–10000 with no gaps

---

### 3.4 F4: Formal JSON Schema Files

**Location**: `_schema/`

All schemas use JSON Schema Draft 2020-12 (`$schema: "https://json-schema.org/draft/2020-12/schema"`).

#### 3.4.1 `mibera.schema.json`

Validates Mibera YAML frontmatter:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Mibera Entry",
  "type": "object",
  "required": ["id", "type", "archetype", "ancestor", "time_period", "birthday",
               "birth_coordinates", "sun_sign", "moon_sign", "ascending_sign",
               "element", "swag_rank", "swag_score", "background", "body",
               "eyes", "eyebrows", "mouth", "drug"],
  "properties": {
    "id": { "type": "integer", "minimum": 1, "maximum": 10000 },
    "type": { "const": "mibera" },
    "archetype": { "type": "string", "enum": ["Freetekno", "Milady", "Acidhouse", "Chicago/Detroit"] },
    "ancestor": { "type": "string" },
    "time_period": { "type": "string" },
    "birthday": { "type": "string" },
    "birth_coordinates": { "type": "string" },
    "sun_sign": { "type": "string" },
    "moon_sign": { "type": "string" },
    "ascending_sign": { "type": "string" },
    "element": { "type": "string", "enum": ["Earth", "Fire", "Water", "Air"] },
    "swag_rank": { "type": "string", "enum": ["S", "A", "B", "C", "D"] },
    "swag_score": { "type": "integer", "minimum": 0, "maximum": 100 },
    "background": { "type": "string" },
    "body": { "type": "string" },
    "hair": { "type": ["string", "null"] },
    "eyes": { "type": "string" },
    "eyebrows": { "type": "string" },
    "mouth": { "type": "string" },
    "shirt": { "type": ["string", "null"] },
    "hat": { "type": ["string", "null"] },
    "glasses": { "type": ["string", "null"] },
    "mask": { "type": ["string", "null"] },
    "earrings": { "type": ["string", "null"] },
    "face_accessory": { "type": ["string", "null"] },
    "tattoo": { "type": ["string", "null"] },
    "item": { "type": ["string", "null"] },
    "drug": { "type": "string" }
  }
}
```

**Note**: `hair` is nullable because ~3.2% of Miberas have `None` for hair.

#### 3.4.2 `drug.schema.json`

```json
{
  "required": ["name", "molecule", "era", "origin", "archetype", "ancestor",
               "swag_score", "image", "date_added"],
  "properties": {
    "name": { "type": "string" },
    "molecule": { "type": "string" },
    "era": { "type": "string", "enum": ["Ancient", "Modern"] },
    "origin": { "type": "string" },
    "archetype": { "type": "string", "enum": ["Freetekno", "Milady", "Acidhouse", "Chicago Detroit"] },
    "ancestor": { "type": "string" },
    "swag_score": { "type": ["integer", "null"] },
    "image": { "type": "string" },
    "date_added": { "type": ["string", "null"] }
  }
}
```

**Note**: After F2 normalization, `swag_score` will be integer (or null for edge cases) and `date_added` will be ISO format (or null for unparseable).

#### 3.4.3 `ancestor.schema.json`

```json
{
  "required": ["name", "period_ancient", "period_modern", "locations"],
  "properties": {
    "name": { "type": "string" },
    "period_ancient": { "type": "string" },
    "period_modern": { "type": "string" },
    "locations": { "type": "string" }
  }
}
```

#### 3.4.4 `tarot-card.schema.json`

```json
{
  "required": ["name", "suit", "element", "meaning", "drug", "drug_type", "molecule"],
  "properties": {
    "name": { "type": "string" },
    "suit": { "type": "string" },
    "element": { "type": "string", "enum": ["Air", "Fire", "Water", "Earth"] },
    "meaning": { "type": "string" },
    "drug": { "type": "string" },
    "drug_type": { "type": "string", "enum": ["Ancient", "Modern"] },
    "molecule": { "type": "string" }
  }
}
```

#### 3.4.5 `trait-full.schema.json`

For traits with all metadata fields (accessories, clothing, items, backgrounds):

```json
{
  "required": ["name", "image"],
  "properties": {
    "name": { "type": "string" },
    "image": { "type": "string" },
    "archetype": { "type": "string" },
    "swag_score": { "type": ["integer", "null"] },
    "date_added": { "type": ["string", "null"] }
  }
}
```

#### 3.4.6 `trait-minimal.schema.json`

For traits with minimal metadata (character-traits body/eyebrows/eyes/hair/mouth/tattoos, overlays):

```json
{
  "required": ["name"],
  "properties": {
    "name": { "type": "string" },
    "image": { "type": "string" },
    "date_added": { "type": ["string", "null"] }
  }
}
```

#### 3.4.7 `special-collection.schema.json`

```json
{
  "required": ["name", "type"],
  "properties": {
    "name": { "type": "string" },
    "type": { "type": "string" }
  }
}
```

---

### 3.5 F5: Semantic Validation Script

**Script**: `_scripts/audit-semantic.py`

Cross-references data across entity types to find logical inconsistencies that structural validation misses.

#### 3.5.1 Checks

| Check | Description | Input |
|-------|-------------|-------|
| Archetype enum | All Mibera `archetype` values are in {Freetekno, Milady, Acidhouse, Chicago/Detroit} | Mibera frontmatter |
| Element enum | All Mibera `element` values are in {Earth, Fire, Water, Air} | Mibera frontmatter |
| Element totals | Sum of element counts = 10,000 | Mibera frontmatter |
| Drug references | Every `drug` value in Mibera frontmatter matches a file in `traits/overlays/molecules/` | Mibera frontmatter + drug files |
| Ancestor references | Every `ancestor` value matches a file in `core-lore/ancestors/` | Mibera frontmatter + ancestor files |
| Drug↔Tarot bidir | Drug file's tarot card reference ↔ Tarot card's drug reference | Drug + Tarot frontmatter |
| Orphan traits | Trait files referenced by 0 Miberas | Mibera table links vs trait files |
| Swag rank distribution | Swag ranks {S, A, B, C, D} have reasonable distributions | Mibera frontmatter |

#### 3.5.2 Output

JSON report at `_scripts/reports/audit-semantic.json`:

```json
{
  "timestamp": "2026-02-15T...",
  "checks": {
    "archetype_enum": { "status": "pass", "violations": [] },
    "element_totals": { "status": "pass", "total": 10000, "breakdown": {"Earth": 2500, ...} },
    "drug_references": { "status": "fail", "violations": ["Mibera #42 references 'Foo' but no traits/overlays/molecules/foo.md"] }
  },
  "summary": { "pass": 7, "fail": 1, "total": 8 }
}
```

#### 3.5.3 Performance

Target: <30s. Strategy: load all frontmatter into memory first (python dict), then run checks in-memory.

---

### 3.6 F6: Reverse-Link Sections (Backlinks)

**Script**: `_scripts/generate-backlinks.py`

#### 3.6.1 Target Files

| Entity Type | Directory | Count | Backlink Source |
|-------------|-----------|-------|-----------------|
| Drug | `traits/overlays/molecules/*.md` | 78 | Mibera `drug` field |
| Ancestor | `core-lore/ancestors/*.md` | 33 | Mibera `ancestor` field |
| Tarot Card | `core-lore/tarot-cards/*.md` | 78 | Drug→Tarot mapping |

#### 3.6.2 Approach

1. Parse all 10,000 Mibera files to build lookup maps:
   - `drug_name → [list of Mibera IDs]`
   - `ancestor_name → [list of Mibera IDs]`
2. For drugs, map through tarot cards: `tarot_card → drug → [Mibera IDs]`
3. For each entity file, insert/replace a backlink section

#### 3.6.3 Backlink Section Format

```markdown
<!-- @generated:backlinks-start -->
## Miberas with this Drug

[#0001](../miberas/0001.md) • [#0042](../miberas/0042.md) • [#0123](../miberas/0123.md) • ... and 125 more

*128 Miberas total*
<!-- @generated:backlinks-end -->
```

**Rules**:
- Use marker comments for idempotent regeneration
- Show up to 50 inline links, then "... and N more"
- Links sorted by Mibera ID ascending
- Format: `[#NNNN](../miberas/NNNN.md)` with dot separator `•`
- Total count in italics below
- Insert before the last `---` footer or at end of file if no footer

#### 3.6.4 Name-to-File Resolution

Drug names from Mibera frontmatter need to map to filenames. The mapping uses slugification:
- Lowercase
- Replace spaces with hyphens
- Remove apostrophes
- Handle known exceptions (same map as `generate-browse.sh` DRUG_NORMALIZE)

Example: `St. John'S Wort` → `st-johns-wort.md`

---

### 3.7 F7: Create `llms-full.txt`

**Script**: `_scripts/generate-llms-full.py`

Concatenates core lore into a single plain-text file for LLM context loading.

#### 3.7.1 Concatenation Order

```
1. IDENTITY.md (full)
2. core-lore/philosophy.md (full)
3. core-lore/archetypes.md (full)
4. core-lore/drug-tarot-system.md (full)
5. glossary.md (full)
6. core-lore/ancestors/*.md (all 33, content only — strip YAML frontmatter)
7. traits/overlays/molecules/*.md (all 78, content only — strip YAML frontmatter)
```

#### 3.7.2 Section Format

Each file is wrapped with section markers:

```
═══════════════════════════════════════════════════════════
SECTION: IDENTITY
Source: IDENTITY.md
═══════════════════════════════════════════════════════════

[file content without frontmatter]

```

#### 3.7.3 Rules

- Strip YAML frontmatter (between `---` delimiters) from all files
- Ancestor and drug files sorted alphabetically by filename
- Plain text only — no binary, no images
- Target: <300KB total
- Output: `llms-full.txt` in repo root

---

### 3.8 F8: Community Infrastructure

#### 3.8.1 `CONTRIBUTING.md`

Location: repo root

**Sections**:
1. **Welcome** — Brief intro to the Mibera Codex project
2. **Content Types** — Overview of the 7 content types with links to schema docs
3. **How to Contribute** — PR template, branch naming, commit format
4. **Content Guidelines** — Quality checklist per content type
5. **Review Process** — Who reviews what, SLA expectations
6. **Mibera Holder Lore** — How holders can add lore to their Mibera entries
7. **Tooling** — How to run audit scripts locally

#### 3.8.2 `CODEOWNERS`

Location: repo root

```
# Core lore — requires core team review
/core-lore/ @0xHoneyJar/mibera-core
/IDENTITY.md @0xHoneyJar/mibera-core

# Traits and drugs — lighter review
/traits/ @0xHoneyJar/mibera-contributors
/traits/overlays/molecules/ @0xHoneyJar/mibera-contributors

# Mibera entries — open for holder lore
/miberas/ @0xHoneyJar/mibera-contributors

# Infrastructure — core team only
/_scripts/ @0xHoneyJar/mibera-core
/_schema/ @0xHoneyJar/mibera-core
/_data/ @0xHoneyJar/mibera-core
```

---

## 4. Script Architecture

All scripts follow this pattern:

```python
#!/usr/bin/env python3
"""Script description."""

import sys
import os
import json
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

def main():
    # 1. Parse arguments
    # 2. Discover files
    # 3. Process files
    # 4. Report results
    pass

if __name__ == "__main__":
    main()
```

**Shared utilities**: Common functions (YAML parsing, frontmatter extraction, slugification) are defined inline in each script rather than as a shared module. This keeps each script self-contained and avoids import path issues.

**YAML handling**: Use python3's `yaml` module if available, otherwise parse frontmatter manually with regex (the frontmatter in this codex is simple enough for regex parsing: `^---\n(.*?)\n---` with key-value lines).

**Performance**: Scripts operate on the filesystem directly. For 10,000 files, python3 with `pathlib` processes in ~5-15 seconds.

---

## 5. Dependency Graph

```
F1 (Frontmatter) ──→ F2 (Normalize)
         │                │
         ├────────────────┤
         ↓                ↓
     F3 (JSONL)    F5 (Semantic)

F4 (Schemas) ─── parallel with all
F6 (Backlinks) ─── requires F1 for name resolution
F7 (llms-full) ─── independent
F8 (Community) ─── independent
```

**Critical path**: F1 → F2 → F3

---

## 6. Impact on Existing Tools

### 6.1 `audit-structure.sh`

After F1, Mibera files will have YAML frontmatter. The existing audit script already handles files with frontmatter (it checks for table fields). The script should continue to work, but the python3 section that validates Mibera files should be tested to ensure it doesn't double-count frontmatter fields as table fields.

**Action**: Test after F1. Fix if needed.

### 6.2 `generate-browse.sh`

The browse page generator parses markdown tables to extract field values. After F1, Mibera files will have frontmatter above the table. The parser needs to still locate the table correctly.

**Action**: Test after F1. The existing `extract_field()` function scans for `| Field | Value |` pattern, so it should work regardless of content above the table. Verify.

### 6.3 `audit-links.sh`

No impact. YAML frontmatter does not contain links.

---

## 7. Validation Strategy

After each feature:

| Feature | Validation |
|---------|-----------|
| F1 | `audit-structure.sh` passes (0 errors). Spot-check 5 files. |
| F2 | Grep for old date patterns returns 0 hits. All `swag_score` values are int or null. |
| F3 | `wc -l _data/miberas.jsonl` = 10,000. `python3 -c "import json; [json.loads(l) for l in open('_data/miberas.jsonl')]"` succeeds. |
| F4 | Schemas are syntactically valid JSON. |
| F5 | Script runs in <30s. JSON report output. |
| F6 | All entity files have `@generated:backlinks` markers. Links resolve (audit-links.sh). |
| F7 | `llms-full.txt` exists, <300KB, contains expected section markers. |
| F8 | Both files exist. CODEOWNERS syntax valid. |

Final validation: `audit-structure.sh` + `audit-links.sh` pass with 0 errors / 0 regressions.

---

## 8. Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Frontmatter breaks existing table parsing | Test `audit-structure.sh` and `generate-browse.sh` immediately after F1 |
| YAML special characters in values | Quote strings containing `: ' " # [ ] { }`. Birthday and coordinates always quoted. |
| Date parsing edge cases | Exhaustive pattern list in SDD 3.2.1. Unknown patterns → null + warning. |
| Multi-value swag_score data loss | First value preserved. Original markdown body unchanged for audit. |
| Backlink name resolution failures | Use same normalization as generate-browse.sh. Log unresolved names. |
| 56 trait files with malformed date_added | Normalized to null. Original body text unchanged. |

---

*SDD generated by /simstim Phase 3 — Cycle 003*
*No commits made. All changes local.*
