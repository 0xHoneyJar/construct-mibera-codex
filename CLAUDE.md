@.claude/loa/CLAUDE.loa.md

# Mibera Codex — Project Instructions

This is a **markdown knowledge base** for 10,000 generative NFTs on Berachain, not a code repo.
Primary consumption is **GitHub** (for humans and LLMs/AI).

## Start Here

- `IDENTITY.md` — AI embodiment constraints and signal hierarchy
- `manifest.json` — programmatic file index with entity counts and paths
- `llms.txt` — condensed LLM context (3.3 KB) with lookup patterns
- `_codex/schema/README.md` — JSON Schema definitions for all entity types
- `SUMMARY.md` or `browse/README.md` — human navigation

## Signal Hierarchy

From `IDENTITY.md` — this is load-bearing for any Mibera embodiment:

- **Load-bearing** (define worldview): Archetype → Ancestor → Birthday/Era
- **Textural** (color expression): Drug/Molecule → Tarot → Element
- **Modifiers**: Swag Rank → Astrology

Traits are signals, not scripts. A Mibera born in 1352 CE with a Greek ancestor doesn't recite Greek history — it shapes how they see the world.

## Lookup Patterns

- **Mibera by ID**: `miberas/{NNNN}.md` (zero-padded 4 digits: #42 → `miberas/0042.md`)
- **Trait by name**: slugify the name, find subcategory in `manifest.json`, read `traits/{subcategory}/{slug}.md`
- **Browse by dimension**: `browse/by-{archetype|ancestor|drug|era|element|swag-rank|tarot}.md`
- **Drug by name**: `drugs-detailed/{slug}.md`
- **Ancestor by name**: `core-lore/ancestors/{slug}.md`
- **Tarot card**: `core-lore/tarot-cards/{slug}.md`
- **Grail by name**: `grails/{slug}.md`
- **Mibera Set by name**: `mibera-sets/{slug}.md`
- **Data exports**: `_codex/data/miberas.jsonl` (10K), `_codex/data/graph.json` (5.9 MB knowledge graph)

## Entity Conventions

- All entity files use **YAML frontmatter** between `---` delimiters
- Mibera files also have a **markdown table** with trait key-value pairs
- **Backlinks** are auto-generated between `<!-- @generated:backlinks-start -->` and `<!-- @generated:backlinks-end -->` markers — never edit these manually
- Internal links use **relative markdown paths**, validated by `_codex/scripts/audit-links.sh`

## Scope Boundaries

Reference `_codex/data/scope.json` for programmatic scope.

**What the codex tracks**: 10,000 Miberas, 42 canonical Grails + community Grails, 1,337 visual traits (incl. 78 drugs), 78 tarot cards, 33 ancestors, 11 birthday eras, 32 special collections, 10 Fractures

**What the codex does NOT track**: ownership/wallets, on-chain state (transfers, marketplace), community member identities, price/market data

**When to stop searching**: if an entity's type is marked COMPLETE in `manifest.json` and the name isn't found — it doesn't exist here.

## Safety Rules

- **NEVER** hallucinate trait values — always read the source file
- **NEVER** invent entities that don't exist in the codex
- **NEVER** edit backlink sections (between `@generated` markers)
- **NEVER** assume a Mibera's traits without reading `miberas/{ID}.md`
- When embodying a Mibera, follow `IDENTITY.md` synthesis constraints exactly

## Script Conventions

- All scripts are **stdlib-only Python** (no PyYAML) with regex YAML parsing
- Shell scripts use bash, targeting macOS (BSD tools)
- Scripts live in `_codex/scripts/`
- `_` prefix directories sort first on GitHub (before alphabetic)

## Directory Layout

| Directory | Content | Count |
|-----------|---------|-------|
| `miberas/` | Individual Mibera files | 10,000 |
| `traits/` | Visual trait files (18 subcategories) | 1,337 |
| `drugs-detailed/` | Drug/molecule documentation | 78 |
| `core-lore/` | Archetypes, ancestors, tarot, philosophy | ~120 |
| `birthdays/` | Birthday era classifications | 11 |
| `browse/` | Dimensional browse indices | 8 |
| `grails/` | Hand-drawn 1/1 art pieces | 42 |
| `mibera-sets/` | Honey Road ERC-1155 tokens (Optimism) | 12 |
| `swag-scoring/` | Scoring formula, methods, and all trait scores | — |
| `fractures/` | Reveal phase documentation | 10 |
| `special-collections/` | Partner/special collections | 32 |
| `_codex/` | Schemas, scripts, data exports | — |
