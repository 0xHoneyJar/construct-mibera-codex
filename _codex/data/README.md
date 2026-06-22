# Data Exports

Machine-readable data and documentation for the Mibera ecosystem. Use `manifest.json` (root) for programmatic lookup of all paths.

## Core Data

| File | Format | Description |
|------|--------|-------------|
| [miberas.jsonl](miberas.jsonl) | JSONL | All 10,000 Miberas — one JSON object per line with full metadata |
| [grails.jsonl](grails.jsonl) | JSONL | All 44 hand-drawn Grails — id, name, slug, category |
| [graph.json](graph.json) | JSON | Knowledge graph — 11,476 nodes (24 types), 191,882 edges (28 types) |
| [stats.md](stats.md) | Markdown | Statistical overview — trait distributions, archetype breakdowns |

## Parcel & Derived Datasets

| File | Format | Description | Regeneration |
|------|--------|-------------|--------------|
| [parcels.jsonl](parcels.jsonl) | JSONL | All 10,000 MiParcels — structured export | `generate-parcels.py` (corpus generator; also rewrites parcel `.md`) |
| [parcels-graph.json](parcels-graph.json) | JSON | MiParcel knowledge graph | derived from parcel content |
| [parcels-trait-report.json](parcels-trait-report.json) | JSON | MiParcel trait distribution report | derived from parcel content |
| [scrawl-theme-map.json](scrawl-theme-map.json) | JSON | Parcel scrawl text → thematic cluster (source of `miparcel.schema.json` `scrawl_theme`) | `build-scrawl-theme-map.py --source <external parcelsMetadataFinal/>` |
| [mibera-image-urls.json](mibera-image-urls.json) | JSON | Mibera ID → CDN image URL | derived from contract metadata |
| [entity-counts.json](entity-counts.json) | JSON | Per-entity-type counts | `count-entities.sh` |
| [trait-swag-scores.csv](trait-swag-scores.csv) | CSV | Per-trait swag scores — **hand-maintained working export, no in-repo generator** | manual |
| [trait-swag-scores-categorized.csv](trait-swag-scores-categorized.csv) | CSV | Swag scores grouped by category — **hand-maintained** | manual |

## On-Chain Documentation

| File | Format | Description |
|------|--------|-------------|
| [fractured-mibera.md](fractured-mibera.md) | Markdown | 10 soulbound companion collections — addresses, mechanics, eligibility |
| [shadow-traits.md](shadow-traits.md) | Markdown | VendingMachine trait uniqueness — keccak256 hashing, UUPS proxy |
| [candies-mechanics.md](candies-mechanics.md) | Markdown | Candies marketplace — 0.1% seizure mechanic, 42% holder discounts |
| [mibera-sets.md](mibera-sets.md) | Markdown | 12-tier ERC-1155 tokens on Optimism — Arweave metadata |
| [tarot-quiz.md](tarot-quiz.md) | Markdown | MiberaArchetypeAlignment (MIRA) — soulbound quiz minting |
| [42-motif.md](42-motif.md) | Markdown | Numerological "42" easter eggs across all contracts |
| [abis/](abis/README.md) | JSON | 10 contract ABIs — see [abis/README.md](abis/README.md) for index |

## Metadata

| File | Format | Description |
|------|--------|-------------|
| [scope.json](scope.json) | JSON | What the codex tracks (9 entity types) and doesn't track |
| [gaps.json](gaps.json) | JSON | 7 known unknowns — severity, resolution path, status |
| [contracts.json](contracts.json) | JSON | 11 ecosystem contracts — addresses, chains, standards |
| [timeline.json](timeline.json) | JSON | 6 key ecosystem events with dates |

## Schema Definitions

JSON Schema files for entity validation are in [`_codex/schema/`](../schema/README.md).
