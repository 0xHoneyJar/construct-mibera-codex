# Contracts — Ground Truth

Entity contracts define the structure each content file must follow. Enforced by JSON Schemas in `_codex/schema/` and validated by `audit-structure.sh`.

## Mibera Contract

Schema: `_codex/schema/mibera.schema.json` [`manifest.json:schemas.mibera`]

Every `miberas/{NNNN}.md` file contains:

**YAML Frontmatter** (between `---` delimiters):
- `id` (integer, 1–10000) — unique Mibera identifier [`_codex/schema/ontology.yaml:17`]
- `name` (string) — display name
- `archetype` (enum: Freetekno, Milady, Acidhouse, Chicago/Detroit) [`_codex/schema/ontology.yaml:22`]
- `ancestor` (enum: 33 values) [`_codex/schema/ontology.yaml:34-67`]
- `time_period` (enum: Ancient, Modern) [`_codex/schema/ontology.yaml:93-94`]
- `birthday` (string, ISO date or historical) — exact birth date
- `drug` (string) — one of 78 drugs
- `tarot_card` (string) — mapped 1:1 from drug
- `element` (enum: Earth, Fire, Water, Air) [`_codex/schema/ontology.yaml:88`]
- `sun_sign`, `moon_sign`, `ascending_sign` (enum: 12 zodiac signs) [`_codex/schema/ontology.yaml:117`]
- `swag_score` (integer) — numeric score
- `swag_rank` (enum: Sss, Ss, S, A, B, C, D, F) [`_codex/schema/ontology.yaml:123`]

Total: 27 metadata fields per Mibera [`manifest.json:entity_types.mibera.fields`]

**Markdown Body**: table with trait key-value pairs (visual characteristics).

## Drug Contract

Schema: `_codex/schema/drug.schema.json` [`manifest.json:schemas.drug`]

Every `traits/overlays/molecules/{slug}.md` file contains:

**YAML Frontmatter**:
- `name` (string) — drug display name
- `slug` (string) — URL-safe identifier
- `archetype` (enum) — associated archetype [`_codex/schema/ontology.yaml:219-227`]
- `ancestor` (enum) — associated ancestor culture [`_codex/schema/ontology.yaml:226-234`]
- `tarot_card` (string) — 1:1 mapping to tarot [`_codex/schema/ontology.yaml:184-189`]
- `element` (enum) — classical element

78 drugs map exactly to 78 tarot cards — this is a bijective relationship. [`_codex/schema/ontology.yaml:188`]

## Tarot Card Contract

Schema: `_codex/schema/tarot-card.schema.json` [`manifest.json:schemas.tarot_card`]

Every `core-lore/tarot-cards/{slug}.md`:

**YAML Frontmatter**: name, number, suit, element, drug (reverse mapping)

## Ancestor Contract

Schema: `_codex/schema/ancestor.schema.json` [`manifest.json:schemas.ancestor`]

Every `core-lore/ancestors/{slug}.md`:

**YAML Frontmatter**: name, slug, region, era, cultural context

33 ancestor cultures spanning Aboriginal to Turkey. [`_codex/schema/ontology.yaml:34-67`]

## Trait Contract

Two schemas [`_codex/schema/ontology.yaml:129-131`]:
- `trait-full.schema.json` — full metadata (name, subcategory, rarity, count, image)
- `trait-minimal.schema.json` — minimal (name, subcategory)

18 subcategories organized under 7 parent categories [`_codex/schema/ontology.yaml:133-141`]:
`accessories`, `backgrounds`, `body`, `character`, `clothing`, `items`, `overlays`

## Grail Contract

Schema: `_codex/schema/grail.schema.json` [`manifest.json:schemas.grail`]

Every `grails/{slug}.md`:

**YAML Frontmatter**: name, slug, artist, id, description

42 canonical hand-drawn 1/1 art pieces. [`manifest.json:entity_types.grail`]

## Cross-Entity References

Entity files link to each other via relative markdown paths:

- Mibera → Archetype: `[Freetekno](../core-lore/archetypes.md#freetekno)`
- Mibera → Ancestor: `[Greek](../core-lore/ancestors/greek.md)`
- Mibera → Drug: `[Psilocybin](../traits/overlays/molecules/psilocybin.md)`
- Drug → Tarot: `[The Fool](../core-lore/tarot-cards/the-fool.md)`

All links validated by `_codex/scripts/audit-links.sh` [`_codex/scripts/README.md:line 15`]

## Schema Meta Blocks (Cycle 012)

JSON Schema files include `x-codex-confidence` and `x-codex-source` extensions per field [`grimoires/loa/archive/cycle-012/sdd.md`]:

- **Confidence levels**: `canonical` (77%), `derived` (1.5%), `community` (21.5%)
- **Source types**: contract-metadata, project-lore, project-asset, editorial, research, artist, classification

Applied across 8 schema files, covering 65 total fields.
