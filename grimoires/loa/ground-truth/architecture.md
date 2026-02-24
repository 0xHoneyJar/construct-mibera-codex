# Architecture — Ground Truth

## Directory Structure

The codex follows a content-first layout optimized for GitHub rendering. Directories with `_` prefix sort before alphabetic directories on GitHub. [`README.md:directory-listing`]

| Directory | Purpose | Files | Completeness |
|-----------|---------|-------|--------------|
| `miberas/` | Individual Mibera identity files | 10,000 | COMPLETE [`manifest.json:entity_types.mibera.completeness`] |
| `traits/` | Visual trait documentation (18 subcategories) | 1,337 | COMPLETE [`manifest.json:entity_types.trait.completeness`] |
| `drugs-detailed/` | Drug/molecule lore and tarot mapping | 78 | COMPLETE [`manifest.json:entity_types.drug.completeness`] |
| `core-lore/` | Archetypes, ancestors, tarot cards, philosophy | ~120 | COMPLETE |
| `birthdays/` | Birthday era classifications (11 eras) | 11 | COMPLETE [`manifest.json:entity_types.birthday_era.completeness`] |
| `browse/` | Faceted dimension indices | 8 | COMPLETE |
| `grails/` | Hand-drawn 1/1 art pieces | 42 | COMPLETE [`manifest.json:entity_types.grail.completeness`] |
| `fractures/` | 10 reveal phase documentation | 10 | COMPLETE |
| `special-collections/` | Partner/special collections | 32 | PARTIAL [`manifest.json:entity_types.special_collection.completeness`] |
| `_codex/data/` | Machine-readable exports (JSONL, JSON, ABI) | ~16 | COMPLETE |
| `_codex/schema/` | JSON Schema files + ontology | 9 | COMPLETE |
| `_codex/scripts/` | Audit, generation, and maintenance scripts | 14 | COMPLETE |

## Signal Hierarchy

The codex's architectural backbone is the **signal hierarchy** from `IDENTITY.md`. This determines how entity dimensions are weighted for Mibera identity synthesis. [`IDENTITY.md:Signal Hierarchy`]

```
Load-bearing (define worldview):
  Archetype → Ancestor → Birthday/Era

Textural (color expression):
  Drug/Molecule → Tarot → Element

Modifiers:
  Swag Rank → Astrology (Sun/Moon/Ascending)
```

Formalized in `_codex/schema/ontology.yaml:signal_hierarchy` with three tiers:
- `load_bearing.dimensions`: `[archetype, ancestor, era]` [`_codex/schema/ontology.yaml:239-242`]
- `textural.dimensions`: `[drug, tarot_card, element]` [`_codex/schema/ontology.yaml:244-246`]
- `modifiers.dimensions`: `[swag_rank, zodiac_sign]` [`_codex/schema/ontology.yaml:248-250`]

## Entity Relationship Model

Defined in `_codex/schema/ontology.yaml:relationships` (lines 150-234), the codex tracks 11 relationship types:

| Relationship | Source → Target | Cardinality | Signal Tier |
|-------------|-----------------|-------------|-------------|
| `has_archetype` | mibera → archetype | many-to-one | load_bearing [`ontology.yaml:156`] |
| `has_ancestor` | mibera → ancestor | many-to-one | load_bearing [`ontology.yaml:163`] |
| `born_in_era` | mibera → era | many-to-one | load_bearing [`ontology.yaml:170`] |
| `has_drug` | mibera → drug | many-to-one | textural [`ontology.yaml:177`] |
| `maps_to_tarot` | drug → tarot_card | one-to-one | textural [`ontology.yaml:184`] |
| `has_element` | mibera → element | many-to-one | textural [`ontology.yaml:191`] |
| `has_suit_element` | tarot_card → element | many-to-one | — [`ontology.yaml:198`] |
| `has_sun_sign` | mibera → zodiac_sign | many-to-one | modifier [`ontology.yaml:205`] |
| `has_swag_rank` | mibera → swag_rank | many-to-one | modifier [`ontology.yaml:212`] |
| `drug_archetype` | drug → archetype | many-to-one | — [`ontology.yaml:219`] |
| `drug_ancestor` | drug → ancestor | many-to-one | — [`ontology.yaml:226`] |

The drug→tarot mapping is the only one-to-one relationship — 78 drugs map exactly to 78 tarot cards. [`_codex/schema/ontology.yaml:184-189`]

## Key Architectural Decisions

1. **GitHub-first navigation**: `README.md` in directories (GitHub renders these), `_` prefix for machine directories [`README.md`]
2. **YAML frontmatter without PyYAML**: all scripts use stdlib-only Python with regex parsing [`_codex/scripts/README.md`]
3. **Backlinks are auto-generated**: between `<!-- @generated:backlinks-start -->` and `<!-- @generated:backlinks-end -->` markers by `generate-backlinks.py` [`_codex/scripts/README.md:Generation`]
4. **Relative markdown links**: all internal links are relative paths, validated by `audit-links.sh` [`_codex/scripts/README.md:Auditing`]
