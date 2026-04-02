# SDD: Cycle 004 — Discovery & Browse

**Version**: 1.0.0
**Date**: 2026-02-15
**Cycle**: 004
**PRD**: `grimoires/loa/prd.md`

---

## 1. Overview

This cycle makes the codex explorable. Cluster MOCs reveal identity intersections across dimensions, a stats dashboard surfaces distributions and patterns, a graph export captures all entity relationships, and an ontology file documents the complete data model. Two long-standing data issues are also resolved.

All scripts go in `_scripts/`. All scripts are standalone python3. All scripts are idempotent. All outputs are Markdown or JSON — no build steps, no external dependencies.

---

## 2. Change Manifest

| ID | Feature | Operation | Estimated Files |
|----|---------|-----------|-----------------|
| F1 | Fix Data Issues | EDIT + RENAME | ~170 files (bufotenin rename across Miberas, tarot, browse, backlinks) + 1 line removal |
| F2 | Cluster MOCs | CREATE | 1 script + ~200 Markdown files |
| F3 | Stats Dashboard | CREATE | 1 script + 1 output file |
| F4 | Graph Export | CREATE | 1 script + 1 output file |
| F5 | Ontology File | CREATE | 1 YAML file |

---

## 3. Detailed Specifications

### 3.1 F1: Fix Remaining Data Issues

No script needed — these are targeted manual fixes followed by re-running existing scripts.

#### 3.1.1 Bufotenin Rename

The drug file `traits/overlays/molecules/bufotenine.md` needs to become `traits/overlays/molecules/bufotenin.md`. The tarot card `the-tower.md` already links to `bufotenin.md` — that's the canonical spelling.

**Steps**:

1. **Rename the file**: `traits/overlays/molecules/bufotenine.md` → `traits/overlays/molecules/bufotenin.md`
2. **Update the file's own frontmatter**: `name: Bufotenine` → `name: Bufotenin`
3. **Update the file's heading**: `# Bufotenine` → `# Bufotenin`
4. **Update Mibera frontmatter**: All ~155 Mibera files with `drug: Bufotenine` → `drug: Bufotenin`
5. **Update Mibera markdown tables**: The drug link text and href in each Mibera's table row: `[Bufotenine](../traits/overlays/molecules/bufotenine.md)` → `[Bufotenin](../traits/overlays/molecules/bufotenin.md)`
6. **Update browse pages**: Re-run `_scripts/generate-browse.sh` to pick up the new name
7. **Update backlinks**: Re-run `_scripts/generate-backlinks.py` to regenerate with correct slug
8. **Update other references**: `traits/overlays/molecules/index.md`, `traits/overlays/molecules/drug-pairings.md`, `core-lore/ancestors/native-american.md`, `traits/overlays/molecules.md`
9. **Re-run `_data/miberas.jsonl`**: Re-run `_scripts/generate-exports.py`
10. **Re-run `llms-full.txt`**: Re-run `_scripts/generate-llms-full.py`
11. **Re-run semantic audit**: `_scripts/audit-semantic.py` should now show 8/8 passes

**Search pattern**: `grep -r "bufotenine\|Bufotenine\|bufotenine.md" --include="*.md"` plus YAML frontmatter with `drug: Bufotenine`.

**Exclusions**: Do NOT rename in `grimoires/loa/` (reviewer docs, NOTES.md — these are historical records). Do NOT rename in `_scripts/reports/` (audit output). Do NOT rename in `mireveals/` (external metadata CSVs).

#### 3.1.2 Hiberanation Eye Mask Duplicate

The `traits/accessories/masks/index.md` file has a duplicate entry at line 76:

```markdown
- [Hiberanation Eye Mask](hiberanation-eye-mask-2.md)
```

The correct entry already exists at line 47 pointing to `hiberanation-eye-mask.md` (which exists). The `-2` variant does not exist and is not referenced by any Mibera.

**Fix**: Remove line 76 from `traits/accessories/masks/index.md`.

**Verification**: Re-run `_scripts/audit-links.sh`. Expect broken links to drop by 1.

---

### 3.2 F2: Cluster MOCs — Cross-Dimensional Browse Pages

**Script**: `_scripts/generate-clusters.py`

**Purpose**: Generate Markdown browse pages for every non-empty intersection of high-value dimension pairs.

#### 3.2.1 Data Loading

Read all 10,000 Mibera frontmatter files using the proven `yaml.safe_load()` pattern. Build an in-memory dict:

```python
miberas = []  # list of {id: int, archetype: str, ancestor: str, element: str, ...}
```

Extract three fields for clustering: `archetype`, `ancestor`, `element`.

#### 3.2.2 Dimension Pairs

| Pair ID | Dim A | Dim B | Max Combos |
|---------|-------|-------|------------|
| archetype_ancestor | archetype (4) | ancestor (33) | 132 |
| archetype_element | archetype (4) | element (4) | 16 |
| ancestor_element | ancestor (33) | element (4) | 132 |

Total theoretical max: 280 pages. Actual will be lower (some combos may have 0 Miberas — skip those).

#### 3.2.3 Slugification

Reuse the same `slugify()` pattern from `generate-backlinks.py`:
- Lowercase
- Remove apostrophes, dots
- Replace spaces and slashes with hyphens
- Handle Unicode right quote (`\u2019`)

Filename format: `{pair_id}/{slugA}-x-{slugB}.md`

Examples:
- `browse/clusters/archetype-ancestor/freetekno-x-greek.md`
- `browse/clusters/archetype-element/milady-x-fire.md`
- `browse/clusters/ancestor-element/japanese-x-water.md`

#### 3.2.4 Page Format

Each cluster page follows the existing browse page conventions:

```markdown
<!-- generated: {timestamp} by _scripts/generate-clusters.py -->

# {Value A} × {Value B}

*{Dimension A}: {Value A} | {Dimension B}: {Value B}*

**{count} Miberas** in this cluster.

[Learn about {Value A} →]({link_to_A}) | [Learn about {Value B} →]({link_to_B})

[#0001](../../miberas/0001.md) • [#0042](../../miberas/0042.md) • [#0103](../../miberas/0103.md) • ... • *...and N more*

---

*Generated by `_scripts/generate-clusters.py`*
```

**Link format**: `[#NNNN](../../miberas/NNNN.md)` — two levels up because cluster files are in `browse/clusters/{pair}/`.

**Truncation**: Show first 50 Mibera links inline. If count > 50, append `*...and {count - 50} more*`.

**"Learn about" links**: Link to the relevant entity page:
- Archetype: `../../../core-lore/archetypes.md#{slug}`
- Ancestor: `../../../core-lore/ancestors/{slug}.md`
- Element: `../../../browse/by-element.md` (no individual element pages exist)

#### 3.2.5 Index Page

Generate `browse/clusters/index.md`:

```markdown
<!-- generated: {timestamp} by _scripts/generate-clusters.py -->

# Cluster Browse

*Cross-dimensional views of the 10,000 Miberas. Each cluster page shows all Miberas matching a specific combination of traits.*

---

## Archetype × Ancestor

{count} clusters | Largest: {name} ({n} Miberas) | Smallest: {name} ({n} Miberas)

| Cluster | Miberas |
|---------|---------|
| [Freetekno × Greek](archetype-ancestor/freetekno-x-greek.md) | 247 |
| [Milady × Japanese](archetype-ancestor/milady-x-japanese.md) | 189 |
| ... | ... |

## Archetype × Element

...

## Ancestor × Element

...

---

*Generated by `_scripts/generate-clusters.py`*
```

Sort each table by Mibera count descending.

#### 3.2.6 SUMMARY.md Update

Add a `Clusters` section to `SUMMARY.md` under the existing Browse section, linking to `browse/clusters/index.md`.

#### 3.2.7 Idempotency

Full file regeneration — the script writes every file from scratch on each run. The `<!-- generated: -->` comment timestamp changes, but content is deterministic for the same input data.

---

### 3.3 F3: Stats Dashboard

**Script**: `_scripts/generate-stats.py`

**Purpose**: Compute aggregate statistics from all 10,000 Mibera frontmatter entries and output a single Markdown file.

#### 3.3.1 Data Loading

Same frontmatter loading pattern as F2. Read all `miberas/*.md`, parse YAML, collect into list of dicts.

#### 3.3.2 Statistics to Compute

**Section 1: Archetype Distribution**

| Archetype | Count | % |
|-----------|-------|---|
| Freetekno | X,XXX | XX.XX% |
| ... | ... | ... |

Plus validation: sum must equal 10,000.

**Section 2: Ancestor Distribution**

Table of 33 ancestors sorted by count descending. Include percentage.

**Section 3: Drug Distribution**

Table of 78 drugs sorted by count descending. Include percentage.

**Section 4: Element Distribution**

Table of 4 elements. Include percentage. Validation: sum = 10,000.

**Section 5: Swag Rank Distribution**

Table of ranks in order: Sss, Ss, S, A, B, C, D, F. Include percentage.

**Section 6: Swag Score Histogram**

Buckets: 0-10, 11-20, 21-30, ..., 91-100. Show count and a text bar chart:

```
 0-10  | ████████████████████ 1,234
11-20  | ████████████ 890
```

Use `█` characters. Scale to max 40 chars wide.

**Section 7: Time Period Distribution**

Ancient vs Modern. Count and percentage.

**Section 8: Sun Sign Distribution**

Table of 12 zodiac signs sorted by count. Include percentage.

**Section 9: Top 20 Identity Combinations**

Most common `archetype + ancestor + element` triples. Show count.

**Section 10: Drug × Element Cross-Tab**

Matrix table: rows = drugs (top 20 by frequency), columns = 4 elements, cells = count.

#### 3.3.3 Output

File: `_data/stats.md`

Header:
```markdown
<!-- generated: {timestamp} by _scripts/generate-stats.py -->

# Mibera Codex — Statistics

*Generated from 10,000 Mibera YAML frontmatter entries.*
*Last generated: {date}*

---
```

Format all numbers with commas (e.g., `2,500`). Format percentages to 2 decimal places.

#### 3.3.4 Idempotency

Full file regeneration. Deterministic output for same input data (except timestamp).

---

### 3.4 F4: Graph Export

**Script**: `_scripts/generate-graph.py`

**Purpose**: Generate a JSON adjacency list capturing all entity relationships in the codex.

#### 3.4.1 Data Sources

1. **Mibera frontmatter** (10,000 files): `archetype`, `ancestor`, `drug`, `element`, `time_period`, `sun_sign`
2. **Tarot card frontmatter** (78 files): `drug`, `element`, `suit`
3. **Drug frontmatter** (78 files): `archetype`, `ancestor`

#### 3.4.2 Node Schema

```json
{
  "id": "mibera:1",
  "type": "mibera",
  "label": "Mibera #1"
}
```

Node types and expected counts:

| Type | ID format | Expected count |
|------|-----------|---------------|
| `mibera` | `mibera:{id}` | 10,000 |
| `archetype` | `archetype:{slug}` | 4 |
| `ancestor` | `ancestor:{slug}` | 33 |
| `drug` | `drug:{slug}` | 78 |
| `tarot_card` | `tarot:{slug}` | 78 |
| `element` | `element:{slug}` | 4 |
| `era` | `era:{slug}` | 2 |
| `zodiac` | `zodiac:{slug}` | 12 |
| `swag_rank` | `swag_rank:{value}` | 8 |

#### 3.4.3 Edge Schema

```json
{
  "source": "mibera:1",
  "target": "archetype:freetekno",
  "type": "has_archetype"
}
```

Edge types:

| Type | Source → Target | Expected edges |
|------|----------------|---------------|
| `has_archetype` | mibera → archetype | 10,000 |
| `has_ancestor` | mibera → ancestor | 10,000 |
| `has_drug` | mibera → drug | 10,000 |
| `has_element` | mibera → element | 10,000 |
| `born_in_era` | mibera → era | 10,000 |
| `has_sun_sign` | mibera → zodiac | 10,000 |
| `has_swag_rank` | mibera → swag_rank | 10,000 |
| `maps_to_tarot` | drug → tarot_card | 78 |
| `has_suit_element` | tarot_card → element | 78 |
| `drug_archetype` | drug → archetype | 78 |
| `drug_ancestor` | drug → ancestor | 78 |

Total expected edges: ~70,312

#### 3.4.4 Output Format

File: `_data/graph.json`

```json
{
  "metadata": {
    "generated": "2026-02-15",
    "generator": "_scripts/generate-graph.py",
    "node_count": 10219,
    "edge_count": 70312,
    "node_types": {"mibera": 10000, "archetype": 4, ...},
    "edge_types": {"has_archetype": 10000, "maps_to_tarot": 78, ...}
  },
  "nodes": [...],
  "edges": [...]
}
```

Nodes sorted by type then ID. Edges sorted by type then source.

#### 3.4.5 Self-Validation

After generation, validate:
- Every node has at least one edge
- Every edge references existing nodes
- Node counts match expected values per type
- No duplicate edges
- Total Mibera→dimension edges = 10,000 per dimension

Print validation results to stdout.

#### 3.4.6 File Size

Estimated ~15-25 MB for 10K nodes + 70K edges. Not meant for GitHub web rendering — this is a data file for downstream tools (D3.js, NetworkX, etc.).

---

### 3.5 F5: Ontology File

**No script needed** — this is a hand-authored YAML document.

File: `_schema/ontology.yaml`

#### 3.5.1 Structure

```yaml
# Mibera Codex Ontology
# Formal data model documenting entity types, relationships, and cardinality.
# Sits above individual JSON schemas to capture the relational structure.

version: "1.0.0"
generated_from: "Cycle 004 — Discovery & Browse"

entities:
  mibera:
    description: "A time-travelling Rebased Retard Bera"
    count: 10000
    schema: "_schema/mibera.schema.json"
    directory: "miberas/"
    file_pattern: "{id}.md"
    frontmatter: true

  archetype:
    description: "One of four cultural identities that define a Mibera's worldview"
    count: 4
    values: [Freetekno, Milady, Acidhouse, "Chicago/Detroit"]
    directory: null
    file: "core-lore/archetypes.md"

  ancestor:
    description: "Cultural lineage spanning ancient and modern civilizations"
    count: 33
    schema: "_schema/ancestor.schema.json"
    directory: "core-lore/ancestors/"
    file_pattern: "{slug}.md"
    frontmatter: true

  drug:
    description: "A molecule that shapes Mibera consciousness and maps to a tarot card"
    count: 78
    schema: "_schema/drug.schema.json"
    directory: "traits/overlays/molecules/"
    file_pattern: "{slug}.md"
    frontmatter: true

  tarot_card:
    description: "Divination archetype paired 1:1 with a drug"
    count: 78
    schema: "_schema/tarot-card.schema.json"
    directory: "core-lore/tarot-cards/"
    file_pattern: "{slug}.md"
    frontmatter: true

  element:
    description: "Classical element assigned to each Mibera"
    count: 4
    values: [Earth, Fire, Water, Air]
    directory: null

  era:
    description: "Temporal epoch of a Mibera's birth"
    count: 2
    values: [Ancient, Modern]
    directory: "birthdays/"

  zodiac_sign:
    description: "Astrological sun sign"
    count: 12
    values: [Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces]
    directory: null

  swag_rank:
    description: "Quality tier based on swag_score"
    count: 8
    values: [Sss, Ss, S, A, B, C, D, F]
    directory: null

  trait:
    description: "Visual characteristic of a Mibera (clothing, accessories, body features)"
    count: 1257
    schema: ["_schema/trait-full.schema.json", "_schema/trait-minimal.schema.json"]
    directory: "traits/"
    subcategories: [accessories, backgrounds, body, character, clothing, items, overlays]
    frontmatter: true

  birthday_era:
    description: "Historical period containing Mibera birth dates"
    count: 10
    directory: "birthdays/"
    file_pattern: "{slug}.md"

  special_collection:
    description: "Partner or special event collection"
    count: 32
    schema: "_schema/special-collection.schema.json"
    directory: "special-collections/"
    frontmatter: true

relationships:
  - type: has_archetype
    source: mibera
    target: archetype
    cardinality: many-to-one
    field: archetype
    signal_tier: load_bearing

  - type: has_ancestor
    source: mibera
    target: ancestor
    cardinality: many-to-one
    field: ancestor
    signal_tier: load_bearing

  - type: born_in_era
    source: mibera
    target: era
    cardinality: many-to-one
    field: time_period
    signal_tier: load_bearing

  - type: has_drug
    source: mibera
    target: drug
    cardinality: many-to-one
    field: drug
    signal_tier: textural

  - type: maps_to_tarot
    source: drug
    target: tarot_card
    cardinality: one-to-one
    signal_tier: textural

  - type: has_element
    source: mibera
    target: element
    cardinality: many-to-one
    field: element
    signal_tier: textural

  - type: has_suit_element
    source: tarot_card
    target: element
    cardinality: many-to-one
    field: element

  - type: has_sun_sign
    source: mibera
    target: zodiac_sign
    cardinality: many-to-one
    field: sun_sign
    signal_tier: modifier

  - type: has_swag_rank
    source: mibera
    target: swag_rank
    cardinality: many-to-one
    field: swag_rank
    signal_tier: modifier

  - type: drug_archetype
    source: drug
    target: archetype
    cardinality: many-to-one
    field: archetype

  - type: drug_ancestor
    source: drug
    target: ancestor
    cardinality: many-to-one
    field: ancestor

signal_hierarchy:
  description: "From IDENTITY.md — the weight each dimension carries in defining a Mibera"
  tiers:
    load_bearing:
      description: "Define worldview"
      dimensions: [archetype, ancestor, birthday_era]
    textural:
      description: "Color expression"
      dimensions: [drug, tarot_card, element]
    modifiers:
      description: "Modify and refine"
      dimensions: [swag_rank, zodiac_sign]
```

---

## 4. Script Conventions

All Cycle 004 scripts follow the same conventions established in Cycle 003:

| Convention | Detail |
|-----------|--------|
| Language | Python 3 (stdlib only — no pip dependencies) |
| Location | `_scripts/` |
| Frontmatter parsing | `yaml.safe_load()` between `---` markers |
| Slugification | Reuse pattern from `generate-backlinks.py` |
| Output timestamps | ISO 8601 UTC |
| Idempotency | Full file regeneration (overwrite) |
| Validation | Self-check after generation, print results to stdout |
| Error handling | Collect errors, print summary, exit non-zero if critical |

---

## 5. Testing Strategy

### F1 Testing
- Run `_scripts/audit-links.sh` — expect ≤8 broken links (down from 10)
- Run `_scripts/audit-semantic.py` — expect 8/8 checks pass
- Verify `traits/overlays/molecules/bufotenin.md` exists and `bufotenine.md` does not
- Spot-check 3 Mibera files for correct drug frontmatter

### F2 Testing
- Count cluster pages: expect 150-280
- Verify `browse/clusters/index.md` exists
- Spot-check 3 cluster pages for correct Mibera listings
- Run `_scripts/audit-links.sh` — no new broken links
- Verify every archetype×ancestor combo with >0 Miberas has a page

### F3 Testing
- Verify `_data/stats.md` exists
- Check archetype counts sum to 10,000
- Check element counts sum to 10,000
- Check ancestor count = 33 entries
- Cross-reference 2-3 values against `_data/miberas.jsonl`

### F4 Testing
- Verify `_data/graph.json` is valid JSON
- Check node count (10,000 miberas + ~219 other entities)
- Check edge count (~70K)
- Verify no orphan nodes
- Verify no duplicate edges
- Cross-reference 3 random Miberas: edges match their frontmatter

### F5 Testing
- Verify `_schema/ontology.yaml` is valid YAML
- Check entity counts match actual file counts
- Check all relationship types are represented

---

## 6. Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Cluster subdirectories by pair type | Yes — `archetype-ancestor/`, `archetype-element/`, `ancestor-element/` | Avoids 200+ files in one flat directory |
| Graph JSON vs JSONL | JSON (single file) | Graph is relational, not row-based. Single file enables full graph loading. |
| Stats as Markdown vs JSON | Markdown | GitHub-native, renders without tooling, matches project philosophy |
| Ontology as YAML vs JSON | YAML | More readable, matches frontmatter convention, allows comments |
| Bufotenin: which files to update | Only content files | Historical records in `grimoires/loa/` and `_scripts/reports/` left unchanged |
| Cluster page link depth | `../../miberas/NNNN.md` | Cluster pages are 2 levels deep in `browse/clusters/{pair}/` |
