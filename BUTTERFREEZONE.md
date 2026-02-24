<!-- AGENT-CONTEXT
name: mibera-codex
type: codex
purpose: Comprehensive lore documentation and machine-readable knowledge base for 10,000 time-travelling Beras — mythology, traits, drugs, astrology, spanning 15,000 years.
version: 1.0.0
key_files: [IDENTITY.md, manifest.json, llms.txt, _codex/schema/README.md, SUMMARY.md]
interfaces: [browse/README.md, _codex/data/miberas.jsonl, _codex/data/graph.json, llms-full.txt]
dependencies: []
ecosystem:
  - repo: 0xHoneyJar/loa
    role: framework
    interface: butterfreezone-mesh
    protocol: butterfreezone@1.0
  - repo: 0xHoneyJar/midi-interface
    role: consumer
    interface: badge-validation
capability_requirements:
  - filesystem: read
trust_level: L1-self-declared
-->

# Mibera Codex

<!-- provenance: DERIVED -->

A markdown knowledge base for the Mibera Maker NFT collection on Berachain — 10,000 generative time-travelling Beras with mythology, traits, drugs, astrology, and lore spanning 15,000 years. This is not a code repository; it is a structured content archive designed for both human browsing on GitHub and programmatic consumption by LLMs and AI agents.

The codex contains 11,500+ markdown files across 20+ directories, 8 JSON Schema definitions, a 5.9 MB knowledge graph (10,279 nodes, 70,344 edges), and a 14-script audit/generation pipeline. All entity types except special collections are marked COMPLETE.

## Key Capabilities

<!-- provenance: DERIVED -->

The codex provides structured access to 9 entity types:

- **10,000 Miberas** — individual identity files with 27 metadata fields in YAML frontmatter (`miberas/`)
- **1,337 Visual Traits** — across 18 subcategories under 7 parent categories (`traits/` and `drugs-detailed/`)
- **78 Drugs** — molecules mapped 1:1 to tarot cards, each with archetype and ancestor associations (`drugs-detailed/`)
- **78 Tarot Cards** — divination archetypes paired bijectively with drugs (`core-lore/tarot-cards/`)
- **33 Ancestors** — cultural lineages from Aboriginal to Turkey spanning ancient and modern civilizations (`core-lore/ancestors/`)
- **42 Grails** — canonical hand-drawn 1/1 art pieces (`grails/`)
- **11 Birthday Eras** — temporal epochs from Prehistoric to 21st Century (`birthdays/`)
- **32 Special Collections** — partner and special event collections, PARTIAL completeness (`special-collections/`)
- **10 Fractures** — reveal phase documentation from sealed envelope to final form (`fractures/`)

Entity counts and completeness markers are maintained in `manifest.json`.

## Architecture

<!-- provenance: DERIVED -->

The codex is organized around a **signal hierarchy** that determines how entity dimensions are weighted for Mibera identity synthesis. This hierarchy is the architectural backbone, defined in `IDENTITY.md` and formalized in `_codex/schema/ontology.yaml`.

**Signal Tiers:**

```
Load-bearing (define worldview):
  Archetype → Ancestor → Birthday/Era

Textural (color expression):
  Drug/Molecule → Tarot → Element

Modifiers:
  Swag Rank → Astrology (Sun/Moon/Ascending)
```

**Entity Relationship Model** (`_codex/schema/ontology.yaml`):

11 relationship types connect entity dimensions. Key relationships:
- Every Mibera has exactly one archetype, ancestor, drug, element, and set of astrology signs (many-to-one)
- Every drug maps to exactly one tarot card and vice versa (one-to-one, bijective)
- Drugs also carry their own archetype and ancestor associations

**Directory Layout:**

Content follows a GitHub-first navigation pattern — `README.md` files in directories for auto-rendering, `_` prefix directories sort first. All internal links are relative markdown paths validated by `audit-links.sh`.

```
miberas/           10,000 identity files
traits/            1,337 visual traits (18 subcategories; 78 drugs in drugs-detailed/)
drugs-detailed/    78 drug documentation files
core-lore/         ~120 files (archetypes, ancestors, tarot, philosophy)
browse/            8 faceted dimension indices
grails/            42 hand-drawn 1/1 pieces
fractures/         10 reveal phase files
birthdays/         11 birthday era files
_codex/data/       Machine-readable exports (JSONL, JSON, ABI)
_codex/schema/     8 JSON Schemas + ontology.yaml
_codex/scripts/    14 audit/generation/maintenance scripts
```

## Interfaces

<!-- provenance: CODE-FACTUAL -->

### Lookup Patterns

| Pattern | Template | Example |
|---------|----------|---------|
| Mibera by ID | `miberas/{NNNN}.md` | `miberas/0042.md` |
| Trait by name | `traits/{subcategory}/{slug}.md` | `traits/accessories/hats/cowboy-hat.md` |
| Drug by name | `drugs-detailed/{slug}.md` | `drugs-detailed/psilocybin.md` |
| Ancestor | `core-lore/ancestors/{slug}.md` | `core-lore/ancestors/greek.md` |
| Tarot card | `core-lore/tarot-cards/{slug}.md` | `core-lore/tarot-cards/the-fool.md` |
| Browse dimension | `browse/by-{dimension}.md` | `browse/by-drug.md` |

### Data Exports

| File | Format | Content |
|------|--------|---------|
| `_codex/data/miberas.jsonl` | JSONL (6.4 MB) | All 10,000 Miberas |
| `_codex/data/graph.json` | JSON (5.9 MB) | Knowledge graph: 10,279 nodes, 70,344 edges |
| `_codex/data/grails.jsonl` | JSONL (6.9 KB) | All 42 Grails |
| `_codex/data/scope.json` | JSON (2.8 KB) | Entity tracking scope and boundaries |
| `_codex/data/gaps.json` | JSON (3.0 KB) | Known unknowns with resolution paths |
| `_codex/data/contracts.json` | JSON (3.8 KB) | Canonical smart contract addresses |
| `llms-full.txt` | Text (547 KB) | Complete conceptual framework for LLM ingestion |

## Module Map

<!-- provenance: CODE-FACTUAL -->

| Module | Files | Purpose | Documentation |
|--------|-------|---------|---------------|
| `miberas/` | 10,000 | Individual Mibera identity files | [manifest.json](manifest.json) |
| `traits/` | 1,337 | Visual trait documentation (18 subcategories) | [traits/README.md](traits/README.md) |
| `drugs-detailed/` | 78 | Drug/molecule lore and tarot mapping | — |
| `core-lore/` | ~120 | Archetypes, ancestors, tarot cards, philosophy | [core-lore/README.md](core-lore/README.md) |
| `browse/` | 8 | Faceted dimension indices | [browse/README.md](browse/README.md) |
| `grails/` | 42 | Hand-drawn 1/1 art pieces | [grails/README.md](grails/README.md) |
| `fractures/` | 10 | Reveal phase documentation | [fractures/README.md](fractures/README.md) |
| `birthdays/` | 11 | Birthday era classifications | — |
| `special-collections/` | 32 | Partner/special collections | — |
| `_codex/data/` | ~16 | Machine-readable exports | [_codex/data/README.md](_codex/data/README.md) |
| `_codex/schema/` | 9 | JSON Schemas + ontology | [_codex/schema/README.md](_codex/schema/README.md) |
| `_codex/scripts/` | 14 | Audit, generation, maintenance | [_codex/scripts/README.md](_codex/scripts/README.md) |

## Verification

<!-- provenance: CODE-FACTUAL -->

- Trust Level: **L1 — Self-Declared**
- 3 audit scripts: `audit-links.sh` (link validation), `audit-structure.sh` (schema compliance), `audit-semantic.py` (semantic consistency)
- JSON reports in `_codex/scripts/reports/`
- 8 JSON Schema files validating all entity types
- `manifest.json` completeness markers: 7 of 9 entity types COMPLETE, 1 PARTIAL, 1 COMPLETE (fractures)
- `_codex/data/scope.json` defines machine-readable scope boundaries
- `_codex/data/gaps.json` tracks 7 known unknowns (6 resolved, 1 open)
- All scripts stdlib-only Python + Bash (no external dependencies)

## Agents

<!-- provenance: DERIVED -->

| Agent | Identity | Voice |
|-------|----------|-------|
| Mibera Embodiment | A time-travelling Rebased Retard Bera whose identity is synthesized from the signal hierarchy — traits are signals, not scripts. | The archetype, ancestor, and birthday define worldview; drug, tarot, and element color expression; swag rank and astrology modify. Synthesis, not recitation. |

Embodiment constraints defined in `IDENTITY.md`. Core principle: "Traits are signals, not scripts." A Mibera born in 1352 CE with a Greek ancestor doesn't recite Greek history — it shapes how they see the world.

## Culture

<!-- provenance: OPERATIONAL -->

**Naming**: Mibera — "mi" (me/self) + "bera" (bear). Time-travelling Rebased Retard Beras. The name captures the self-referential, irreverent spirit of the collection.

**Principles**: Traits are signals, not scripts. Load-bearing signals define worldview; textural signals color expression. Every entity is a synthesis, not a checklist.

**Methodology**: Generative mythology — 10,000 unique identities synthesized from archetypes, ancestors, drugs, tarot, astrology, and time periods spanning 15,000 years. The Ravepill philosophy connects rave culture's communal transcendence to ancient spiritual practices. Four archetypes (Freetekno, Milady, Acidhouse, Chicago/Detroit) form the load-bearing identity layer.

## Quick Start

<!-- provenance: OPERATIONAL -->

**For humans**: Start with `SUMMARY.md` for a table of contents, or `browse/README.md` for faceted navigation across 8 dimensions.

**For LLMs/AI agents**: Read `llms.txt` (3.3 KB) for condensed orientation, or ingest `llms-full.txt` (547 KB) for complete conceptual context. Use `manifest.json` for programmatic file lookup.

**To embody a Mibera**:
1. Read `IDENTITY.md` for synthesis constraints and signal hierarchy
2. Read `miberas/{ID}.md` for the specific Mibera's traits (zero-padded 4-digit ID)
3. Follow links to archetype, ancestor, drug for deeper context
4. Synthesize — don't recite

**Scope boundaries**: Reference `_codex/data/scope.json`. The codex does not track ownership, wallets, on-chain state, community identities, or price data.

<!-- ground-truth-meta
head_sha: 73d059be031095f9c57a6464ca77fdca6610b0a2
generated_at: 2026-02-18T22:42:00Z
generator: manual v1.0.0
sections:
  agent_context: 10fe201dd4a952dd
  header: d337a7ba0b98e519
  key_capabilities: 603971aa8adfd6fb
  architecture: 7a3438cb67aa66ee
  interfaces: 1e4773a0eda03af3
  module_map: dae0f01fe3260a97
  verification: 4ba2287823ad0e13
  agents: ec56cf1482939569
  culture: 8939703ae309ec01
  quick_start: 9e585b0b452c6adc
-->
