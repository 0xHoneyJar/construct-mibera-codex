# API Surface — Ground Truth

The codex has no HTTP API. Its "API surface" consists of file lookup patterns, data exports, and schema definitions.

## Lookup Patterns

Defined in `llms.txt:Lookup Patterns`:

| Pattern | Path Template | Example |
|---------|--------------|---------|
| Mibera by ID | `miberas/{NNNN}.md` | `miberas/0042.md` for Mibera #42 [`llms.txt:Lookup Patterns`] |
| Trait by name | `traits/{subcategory}/{slug}.md` | `traits/accessories/hats/cowboy-hat.md` |
| Drug by name | `traits/overlays/molecules/{slug}.md` | `traits/overlays/molecules/psilocybin.md` |
| Ancestor by name | `core-lore/ancestors/{slug}.md` | `core-lore/ancestors/greek.md` |
| Tarot card | `core-lore/tarot-cards/{slug}.md` | `core-lore/tarot-cards/the-fool.md` |
| Grail by name | `grails/{slug}.md` | `grails/the-last-supper.md` |
| Browse by dimension | `browse/by-{dimension}.md` | `browse/by-drug.md` [`llms.txt:Lookup Patterns`] |

Mibera IDs are zero-padded to 4 digits. Range: 1–10,000. [`manifest.json:entity_types.mibera.naming`]

## Browse Dimensions

8 faceted indices in `browse/` [`manifest.json:browse.dimensions`]:

| Dimension | File | Groups Miberas By |
|-----------|------|-------------------|
| Archetype | `browse/by-archetype.md` | 4 archetypes |
| Ancestor | `browse/by-ancestor.md` | 33 ancestor cultures |
| Drug | `browse/by-drug.md` | 78 drugs |
| Era | `browse/by-era.md` | 11 birthday eras |
| Element | `browse/by-element.md` | 4 elements |
| Swag Rank | `browse/by-swag-rank.md` | 8 ranks (Sss–F) |
| Tarot | `browse/by-tarot.md` | 78 tarot cards |
| Grails | `browse/grails.md` | 42 hand-drawn 1/1s |

## Data Exports

Machine-readable exports in `_codex/data/` [`manifest.json:data_exports`]:

| File | Format | Size | Content |
|------|--------|------|---------|
| `miberas.jsonl` | JSONL | 6.4 MB | All 10,000 Miberas, one JSON object per line |
| `grails.jsonl` | JSONL | 6.9 KB | All 42 Grails |
| `graph.json` | JSON | 5.9 MB | Knowledge graph: 10,279 nodes, 70,344 edges |
| `scope.json` | JSON | 2.8 KB | Entity tracking scope and boundaries |
| `gaps.json` | JSON | 3.0 KB | Known unknowns with resolution paths (7 gaps, 6 closed) |
| `contracts.json` | JSON | 3.8 KB | Canonical smart contract addresses |
| `timeline.json` | JSON | 1.2 KB | Birth era distribution |
| `stats.md` | Markdown | 7.2 KB | Codex-wide statistics |

## Schema Files

JSON Schema definitions in `_codex/schema/` [`manifest.json:schemas`]:

| Schema | Entity | Fields |
|--------|--------|--------|
| `mibera.schema.json` | Mibera | 27 fields including Archetype, Ancestor, Drug, all astrology [`manifest.json:entity_types.mibera.fields`] |
| `drug.schema.json` | Drug | name, slug, archetype, ancestor, tarot, element |
| `tarot-card.schema.json` | Tarot Card | name, number, suit, element, drug |
| `ancestor.schema.json` | Ancestor | name, slug, region, era |
| `trait-full.schema.json` | Trait (full) | name, subcategory, rarity, count |
| `trait-minimal.schema.json` | Trait (minimal) | name, subcategory |
| `grail.schema.json` | Grail | name, slug, artist, id |
| `special-collection.schema.json` | Special Collection | name, type, partner |
| `ontology.yaml` | Cross-entity | 11 entity types, 11 relationships, signal hierarchy [`_codex/schema/ontology.yaml`] |

## Key Files

Hub documents for agent orientation [`manifest.json:key_files`]:

| File | Purpose | Size |
|------|---------|------|
| `IDENTITY.md` | Signal hierarchy and embodiment constraints | 6.8 KB |
| `manifest.json` | Programmatic file index | 6.2 KB |
| `llms.txt` | Condensed LLM context | 3.3 KB |
| `llms-full.txt` | Complete conceptual framework | 547 KB |
| `SUMMARY.md` | Table of contents (10 sections) | 5.0 KB |
