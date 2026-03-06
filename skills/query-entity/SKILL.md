# Query Entity

Look up any entity in the Mibera Codex by ID or name.

## Lookup patterns

### Mibera by ID
Read `miberas/{NNNN}.md` (zero-padded 4 digits: #42 -> `miberas/0042.md`)

### Trait by name
1. Read `manifest.json` -> find the subcategory path under `entity_types.trait.subcategories`
2. Slugify the name: "Golden Hoop" -> `golden-hoop`
3. Read `traits/{subcategory}/{slug}.md`

### Drug by name
Read `drugs-detailed/{slug}.md` (e.g. "MDMA" -> `drugs-detailed/mdma.md`)

### Ancestor by name
Read `core-lore/ancestors/{slug}.md` (e.g. "Greek" -> `core-lore/ancestors/greek.md`)

### Tarot card by name
Read `core-lore/tarot-cards/{slug}.md` (e.g. "The Fool" -> `core-lore/tarot-cards/the-fool.md`)

### Grail by name
Read `grails/{slug}.md` (e.g. "Saturn" -> `grails/saturn.md`)

### Mibera Set by name
Read `mibera-sets/{slug}.md`

### Special collection by name
Read `special-collections/{slug}.md`

## Entity formats

All entities use YAML frontmatter between `---` delimiters. Mibera files also have a markdown table with trait key-value pairs.

## Completeness check

Before searching exhaustively, check `manifest.json` -> `entity_types.{type}.completeness`. If marked `COMPLETE` and the entity isn't found, it doesn't exist in this codex.

## Data exports

For bulk queries, use the structured data exports:
- `_codex/data/miberas.jsonl` — all 10,000 Miberas as JSONL
- `_codex/data/graph.json` — full knowledge graph (5.9 MB)
- `_codex/data/grails.jsonl` — all 42 Grails as JSONL
