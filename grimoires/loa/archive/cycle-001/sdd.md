# Software Design Document: Mibera Codex — Structural Audit & Agent Navigation

**Version**: 1.0.0
**Date**: 2026-02-15
**Cycle**: 001 — Codex Foundation
**Status**: Draft
**PRD Reference**: `grimoires/loa/prd.md`

---

## 1. System Overview

The Mibera Codex is a **pure-Markdown knowledge base** with no application code, no build step, and no runtime dependencies. The "system" consists of:

- **11,526 Markdown files** organized in a directory hierarchy
- **Navigation files** (SUMMARY.md, index.md per directory, browse/ pages)
- **Validation scripts** (new — shell scripts for structural audit)
- **Generation scripts** (new — shell scripts for browse page generation)
- **Agent manifest** (new — llms.txt + manifest.json for programmatic access)

All outputs are Markdown or JSON. All scripts are Bash. The codex must render in GitHub, Gitbook, and Obsidian without modification.

---

## 2. Content Type Schemas

### 2.1 Mibera Entry (`miberas/NNNN.md`)

**Format**: Markdown heading + Markdown table + cross-links
**Count**: 10,001 files (index + 10,000 entries)
**Naming**: Zero-padded 4-digit ID (`0001.md` through `10000.md`)

| Field | Type | Required | Example |
|-------|------|----------|---------|
| Archetype | Link | Yes | `[Freetekno](../core-lore/archetypes.md#freetekno)` |
| Ancestor | Link | Yes | `[Greek](../core-lore/ancestors/greek.md)` |
| Time Period | Text | Yes | `Modern` |
| Birthday | Link | Yes | `[07/21/1352 Ce 19:47](../birthdays/medieval.md#...)` |
| Birth Coordinates | Text | Yes | `72.866033, -40.860343` |
| Sun Sign | Link | Yes | `[Cancer](../traits/overlays/astrology/cancer.md)` |
| Moon Sign | Link | Yes | Link to astrology page |
| Ascending Sign | Link | Yes | Link to astrology page |
| Element | Link | Yes | `[Earth](../traits/overlays/elements/earth.md)` |
| Swag Rank | Link | Yes | `[B](../traits/overlays/ranking/b.md)` |
| Swag Score | Number | Yes | `41` |
| Background | Link | Yes | Link to backgrounds trait |
| Body | Link | Yes | Link to body trait |
| Hair | Link | Yes | Link to hair trait |
| Eyes | Link | Yes | Link to eyes trait |
| Eyebrows | Link | Yes | Link to eyebrows trait |
| Mouth | Link | Yes | Link to mouth trait |
| Shirt | Link/None | Yes | Link or `None` |
| Hat | Link/None | Yes | Link or `None` |
| Glasses | Link/None | Yes | Link or `None` |
| Mask | Link/None | Yes | Link or `None` |
| Earrings | Link/None | Yes | Link or `None` |
| Face Accessory | Link/None | Yes | Link or `None` |
| Tattoo | Link/None | Yes | Link or `None` |
| Item | Link/None | Yes | Link or `None` |
| Drug | Link | Yes | `[St. John'S Wort](../traits/overlays/molecules/st-johns-wort.md)` |

### 2.2 Trait File (`traits/**/*.md`)

**Format**: YAML frontmatter + Markdown sections
**Count**: ~1,277 files across subcategories

**YAML Schema**:

```yaml
name: string        # Required — Display name
image: string       # Required — Filename (not full URL in some, full URL in others)
archetype: string   # Required — Archetype name or alignment description
swag_score: number  # Required — 1-5 rarity tier
date_added: string  # Required — Human-readable date
```

**Markdown Sections** (expected):
- Visual Properties
- Cultural Context
- Mibera Integration
- Connections
- Attribution

### 2.3 Drug Entry (`traits/overlays/molecules/*.md`)

**Format**: YAML frontmatter + Markdown sections
**Count**: 81 files (index + 80 drugs)

**YAML Schema**:

```yaml
name: string        # Required — Drug name
molecule: string    # Required — Chemical formula
era: string         # Required — "Ancient" or "Modern"
origin: string      # Required — Geographic origin
archetype: string   # Required — Freetekno/Milady/Acidhouse/Chicago Detroit
ancestor: string    # Required — Linked ancestor name
swag_score: string  # Required — Number as string (inconsistency to audit)
image: string       # Required — Filename
date_added: string  # Required — Human-readable date
```

### 2.4 Ancestor Entry (`core-lore/ancestors/*.md`)

**Format**: YAML frontmatter + Markdown sections
**Count**: 33 files (index + 32 ancestors)

**YAML Schema**:

```yaml
name: string            # Required — Ancestor culture name
period_ancient: string  # Required — Date range (e.g., "-480 - -323")
period_modern: string   # Required — Date range (e.g., "330 - 1453")
locations: string       # Required — Comma-separated geographic regions
```

### 2.5 Tarot Card (`core-lore/tarot-cards/*.md`)

**Format**: YAML frontmatter + Markdown sections
**Count**: 79 files (index + 78 cards)

**YAML Schema**:

```yaml
name: string       # Required — Card name
suit: string       # Required — "Major Arcana" or suit name
element: string    # Required — Air/Fire/Water/Earth
meaning: string    # Required — Brief meaning
drug: string       # Required — Linked drug name
drug_type: string  # Required — "Ancient" or "Modern"
molecule: string   # Required — Chemical formula
```

### 2.6 Special Collection (`special-collections/*.md`)

**Format**: YAML frontmatter + Markdown sections
**Count**: 33 files (index + 32 collections)

**YAML Schema**:

```yaml
name: string  # Required — Collection name
type: string  # Required — Category (e.g., "DeFi, Community")
```

### 2.7 Birthday Era (`birthdays/*.md`)

**Format**: Plain Markdown with structured headings
**Count**: 12 files (index + 11 era files)

**Structure per entry**:
```
## MM/DD/YYYY Ce HH:MM
[#NNNN](../miberas/NNNN.md)
Era: [period name] (YYYY CE)
Sun Sign | Element | Modality | Ruler | Traits | Time of Birth
```

---

## 3. Directory Architecture

```
mibera-codex/
├── README.md                    # Landing page
├── SUMMARY.md                   # GitBook TOC
├── IDENTITY.md                  # Agent embodiment constraints
├── glossary.md                  # Terminology
├── llms.txt                     # NEW — Agent entry point
├── manifest.json                # NEW — Programmatic directory index
├── _schema/                     # NEW — Schema reference
│   └── README.md                # Content type schemas
├── _scripts/                    # NEW — Validation & generation
│   ├── audit-structure.sh       # Structural validation
│   ├── audit-links.sh           # Link integrity check
│   └── generate-browse.sh       # Browse page generation
├── core-lore/
│   ├── philosophy.md
│   ├── official-lore.md
│   ├── archetypes.md
│   ├── drug-tarot-system.md
│   ├── ancestors/
│   │   ├── index.md
│   │   └── {ancestor}.md        # 32 files
│   └── tarot-cards/
│       ├── index.md
│       └── {card}.md            # 78 files
├── traits/
│   ├── index.md
│   ├── overview.md
│   ├── accessories/             # earrings/, face-accessories/, glasses/, hats/, masks/
│   ├── backgrounds/
│   ├── character-traits/        # body/, eyebrows/, eyes/, hair/, mouth/, tattoos/
│   ├── clothing/                # long-sleeves/, short-sleeves/, simple-shirts/
│   ├── items/                   # bong-bears/, general-items/
│   └── overlays/                # astrology/, elements/, ranking/
├── miberas/
│   ├── index.md
│   └── {NNNN}.md                # 10,000 files
├── birthdays/
│   ├── index.md
│   └── {era}.md                 # 11 era files
├── traits/overlays/molecules/
│   ├── index.md
│   └── {drug}.md                # 80 files
├── special-collections/
│   ├── index.md
│   └── {collection}.md          # 32 files
├── browse/
│   ├── index.md                 # Hub — links to all dimensions
│   ├── by-archetype.md          # Existing
│   ├── by-ancestor.md           # Existing
│   ├── by-swag-rank.md          # Existing
│   ├── by-drug.md               # NEW
│   ├── by-era.md                # NEW
│   ├── by-element.md            # NEW
│   └── by-tarot.md              # NEW
├── behind-the-scenes/
└── mireveals/
```

**New paths** (marked NEW) will be created by this cycle.

---

## 4. Agent Navigation Layer

### 4.1 `llms.txt` (Root)

A plain-text file following the llms.txt convention. Provides a concise orientation for AI agents:

```
# Mibera Codex

> 10,000 time-travelling Beras. Mythology, traits, drugs, astrology, 15,000 years of lore.

## Reading This Codex

- Start with IDENTITY.md for embodiment constraints
- Use manifest.json for programmatic file lookup
- Schema definitions in _schema/README.md

## Content Types

- Mibera entries: miberas/0001.md through miberas/10000.md (Markdown tables)
- Traits: traits/**/*.md (YAML frontmatter)
- Drugs: traits/overlays/molecules/*.md (YAML frontmatter)
- Ancestors: core-lore/ancestors/*.md (YAML frontmatter)
- Tarot cards: core-lore/tarot-cards/*.md (YAML frontmatter)
- Birthday eras: birthdays/*.md (structured headings)

## Key Files

- IDENTITY.md — How to embody a Mibera (signal hierarchy, temporal constraints)
- core-lore/archetypes.md — The 4 archetypes (Freetekno, Milady, Acidhouse, Chicago Detroit)
- core-lore/ancestors/index.md — 32 cultural lineages
- glossary.md — Terminology reference

## Lookup Pattern

1. Read manifest.json for directory structure
2. Navigate to entity directory
3. Read specific file by ID or name
```

### 4.2 `manifest.json` (Root)

Directory-level index. Maps entity types to paths with counts and metadata:

```json
{
  "version": "1.0.0",
  "generated": "2026-02-15",
  "entity_types": {
    "mibera": {
      "directory": "miberas/",
      "index": "miberas/index.md",
      "count": 10000,
      "format": "markdown_table",
      "naming": "{NNNN}.md (zero-padded 4-digit)",
      "id_range": [1, 10000]
    },
    "trait": {
      "directory": "traits/",
      "index": "traits/index.md",
      "count": 1277,
      "format": "yaml_frontmatter",
      "subcategories": [
        "accessories/earrings",
        "accessories/face-accessories",
        "accessories/glasses",
        "accessories/hats",
        "accessories/masks",
        "backgrounds",
        "character-traits/body",
        "character-traits/eyebrows",
        "character-traits/eyes",
        "character-traits/hair",
        "character-traits/mouth",
        "character-traits/tattoos",
        "clothing/long-sleeves",
        "clothing/short-sleeves",
        "clothing/simple-shirts",
        "items/bong-bears",
        "items/general-items",
        "overlays/astrology",
        "overlays/elements",
        "overlays/ranking"
      ]
    },
    "drug": {
      "directory": "traits/overlays/molecules/",
      "index": "traits/overlays/molecules/index.md",
      "count": 80,
      "format": "yaml_frontmatter"
    },
    "ancestor": {
      "directory": "core-lore/ancestors/",
      "index": "core-lore/ancestors/index.md",
      "count": 32,
      "format": "yaml_frontmatter"
    },
    "tarot_card": {
      "directory": "core-lore/tarot-cards/",
      "index": "core-lore/tarot-cards/index.md",
      "count": 78,
      "format": "yaml_frontmatter"
    },
    "birthday_era": {
      "directory": "birthdays/",
      "index": "birthdays/index.md",
      "count": 11,
      "format": "structured_markdown"
    },
    "special_collection": {
      "directory": "special-collections/",
      "index": "special-collections/index.md",
      "count": 32,
      "format": "yaml_frontmatter"
    }
  },
  "navigation": {
    "identity": "IDENTITY.md",
    "glossary": "glossary.md",
    "summary": "SUMMARY.md",
    "browse": "browse/index.md",
    "schema": "_schema/README.md"
  }
}
```

---

## 5. Validation Scripts

All scripts live in `_scripts/` at the repo root. Bash only, no external dependencies beyond `jq` and standard Unix tools.

### 5.1 `audit-structure.sh`

Validates every content file against its expected schema.

**What it checks**:
- Mibera files: All 25 table fields present, no empty values, valid link syntax
- Trait files: YAML frontmatter has required fields (`name`, `image`, `archetype`, `swag_score`, `date_added`)
- Drug files: YAML frontmatter has required fields
- Ancestor files: YAML frontmatter has required fields
- Tarot card files: YAML frontmatter has required fields

**Output**: JSON report at `_scripts/reports/audit-structure.json`

```json
{
  "timestamp": "2026-02-15T...",
  "total_files": 11526,
  "passed": 11400,
  "warnings": 100,
  "errors": 26,
  "by_type": {
    "mibera": {"total": 10000, "passed": 9990, "issues": [...]},
    "trait": {"total": 1277, "passed": 1270, "issues": [...]}
  }
}
```

### 5.2 `audit-links.sh`

Validates every relative Markdown link resolves to an existing file.

**What it checks**:
- `[text](path)` links — target file exists
- `[text](path#anchor)` links — target file exists (anchor validation is best-effort)
- No external HTTP links used for internal navigation

**Output**: JSON report at `_scripts/reports/audit-links.json`

### 5.3 `generate-browse.sh`

Generates browse pages from source data.

**What it generates**:
- `browse/by-drug.md` — Miberas grouped by drug
- `browse/by-era.md` — Miberas grouped by birthday era
- `browse/by-element.md` — Miberas grouped by element
- `browse/by-tarot.md` — Miberas grouped by tarot card

**How it works**:
1. Parse all 10,000 Mibera files, extracting the relevant field from each table row
2. Group entries by extracted value
3. Output Markdown with consistent formatting matching existing browse pages
4. Include counts per group and back-navigation links

**Idempotent**: Running the script overwrites existing generated files. The script header includes a `<!-- generated: {timestamp} -->` comment.

---

## 6. Schema Documentation

### 6.1 `_schema/README.md`

Single reference file documenting all content type schemas. Contains:

- Field-by-field definitions for each content type (from Section 2 above)
- Required vs optional fields
- Value formats and conventions (date formats, link syntax, coordinate format)
- Examples of correctly-formatted entries
- Common mistakes to avoid

This file serves both human contributors and AI agents.

---

## 7. Design Decisions

| Decision | Rationale |
|----------|-----------|
| Keep Markdown tables for Miberas | 10,001 files already use this format. Migration risk outweighs benefit. |
| Directory-level manifest (not per-entity) | Keeps manifest small (~2KB vs ~2MB). Agents can navigate with 2 reads. |
| Scripts in `_scripts/` not `.github/` | Keeps them visible and runnable locally. Not CI-specific. |
| JSON audit reports | Machine-readable for tracking improvements across cycles. |
| Script-generated browse pages | Reproducible, stays in sync with source data. No manual drift. |
| `_schema/` with underscore prefix | Convention for meta/infrastructure dirs. Sorts first in listings. |

---

## 8. Compatibility Constraints

| Platform | Constraint |
|----------|-----------|
| **GitHub** | GFM rendering. YAML frontmatter rendered as table. Relative links work. Max file size for rendering ~1MB. |
| **Gitbook** | Requires SUMMARY.md for navigation. Supports YAML frontmatter. |
| **Obsidian** | Renders YAML frontmatter as properties. Relative links work. Wikilinks not used (good). |
| **AI Agents** | Must be able to locate any entity in ≤2 file reads via llms.txt → manifest.json → target. |

---

## 9. Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Audit script too slow on 11,526 files | Use grep/awk for parsing, not line-by-line shell reads. Target <60s runtime. |
| Browse generation produces broken links | Validate generated files against audit-links.sh before accepting. |
| Schema doc drifts from reality | Schema is derived from audit output — regenerate when audit runs. |
| `_scripts/` confuses content readers | Underscore prefix convention + README explaining purpose. |

---

*SDD generated by /simstim Phase 3 — Cycle 001*
*No commits made. All changes local.*
