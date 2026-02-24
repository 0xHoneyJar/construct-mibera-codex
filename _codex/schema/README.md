# Mibera Codex — Content Type Schemas

Reference for all content types in the codex. Use this when creating new entries or validating existing ones.

---

## 1. Mibera Entry

**Path**: `miberas/{NNNN}.md` (zero-padded 4-digit ID)
**Format**: Markdown heading + table + back link
**Count**: 10,000

### Structure

```markdown
# Mibera #{ID}

## Traits

| Trait | Value |
|-------|-------|
| Archetype | [Name](../core-lore/archetypes.md#slug) |
| Ancestor | [Name](../core-lore/ancestors/slug.md) |
| ... | ... |

---

[← Back to Index](README.md)
```

### Fields

| Field | Required | Value Format | Example |
|-------|----------|-------------|---------|
| Archetype | Yes | Link to archetypes.md#anchor | `[Freetekno](../core-lore/archetypes.md#freetekno)` |
| Ancestor | Yes | Link to ancestor file | `[Greek](../core-lore/ancestors/greek.md)` |
| Time Period | Yes | Plain text | `Modern` |
| Birthday | Yes | Link to era file#anchor | `[07/21/1352 Ce 19:47](../birthdays/medieval.md#...)` |
| Birth Coordinates | Yes | lat, lon | `72.866033, -40.860343` |
| Sun Sign | Yes | Link to astrology file | `[Cancer](../traits/overlays/astrology/cancer.md)` |
| Moon Sign | Yes | Link to astrology file | Same format |
| Ascending Sign | Yes | Link to astrology file | Same format |
| Element | Yes | Link to element file | `[Earth](../traits/overlays/elements/earth.md)` |
| Swag Rank | Yes | Link to ranking file | `[B](../traits/overlays/ranking/b.md)` |
| Swag Score | Yes | Number (plain text) | `41` |
| Background | Yes | Link to background trait | Link |
| Body | Yes | Link to body trait | Link |
| Hair | Yes | Link to hair trait | Link |
| Eyes | Yes | Link to eyes trait | Link |
| Eyebrows | Yes | Link to eyebrows trait | Link |
| Mouth | Yes | Link to mouth trait | Link |
| Shirt | Yes | Link or `None` | Link or `None` |
| Hat | Yes | Link or `None` | Link or `None` |
| Glasses | Yes | Link or `None` | Link or `None` |
| Mask | Yes | Link or `None` | Link or `None` |
| Earrings | Yes | Link or `None` | Link or `None` |
| Face Accessory | Yes | Link or `None` | Link or `None` |
| Tattoo | Yes | Link or `None` | Link or `None` |
| Item | Yes | Link or `None` | Link or `None` |
| Drug | Yes | Link to drug file | `[Mdma](../drugs-detailed/mdma.md)` |

**Notes**:
- All 26 fields must be present in every file
- Optional traits use `None` (not blank, not `N/A`)
- All links are relative paths using `../` from `miberas/`

---

## 2. Trait Files

Traits are split into subcategories with different schemas.

### 2a. Accessories, Clothing, Items (Full Schema)

**Paths**: `traits/accessories/**/*.md`, `traits/clothing/long-sleeves/*.md`, `traits/clothing/short-sleeves/*.md`, `traits/items/general-items/*.md`
**Format**: YAML frontmatter + Markdown

```yaml
---
name: Golden Hoop
image: "https://mibera.fsn1.your-objectstorage.com/..."
archetype: "Aligned culture, related to the 90s rave"
swag_score: 3
date_added: "December 9, 2024"
---
```

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| name | Yes | string | Display name |
| image | No | string | URL or filename |
| archetype | Yes | string | Archetype alignment description |
| swag_score | Yes | number | 1-5 rarity tier |
| date_added | Yes | string | Human-readable date |

### 2b. Character Traits, Backgrounds, Bong Bears, Simple Shirts (Minimal Schema)

**Paths**: `traits/character-traits/**/*.md`, `traits/backgrounds/*.md`, `traits/items/bong-bears/*.md`, `traits/clothing/simple-shirts/*.md`
**Format**: YAML frontmatter + Markdown

```yaml
---
name: Beige
image: "https://mibera.fsn1.your-objectstorage.com/..."
date_added: "August 13, 2024"
---
```

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| name | Yes | string | Display name |
| image | No | string | URL or filename |
| date_added | No | string | Human-readable date |

### 2x. Trait Body Template (Culture-Heavy Subcategories)

**Applies to**: accessories, backgrounds, clothing, items/general-items, character-traits/tattoos

Trait files in culture-heavy subcategories use a standardized body template below the YAML frontmatter. This mirrors the grail entry template (Section 7) adapted for visual traits.

```markdown
# {Name}

## Visual Elements

**Image:**
![{Name}]({image-url})

{What is depicted — visual description, dominant colors, notable details.}

## Cultural Context

{Real-world history, cultural origin, or subculture significance.
Sourced claims. Why this object/style/reference matters.}

## Justification

{Why this trait exists in the Mibera collection. How it connects
to the archetype, ancestor, or scene it represents.}

---

## Attribution

**Archetype:** [{archetype}](link)
**Swag Score:** {score}
**Ancestor:** [{ancestor}](link) (if applicable)
**Date Added:** {date}
**Introduced By:** {name} (if known)
**Team Notes:** {preserved from existing files}
**Sources:** {preserved from existing files}
```

**Notes**:
- YAML frontmatter is preserved as-is (not duplicated in body)
- Empty Attribution fields are dropped, not preserved as blanks
- Team notes and Discord sources are always preserved verbatim
- All cultural claims should be Wikipedia-sourceable
- Justification is simple and dry — why it's in the collection, not analysis
- Files without meaningful cultural context may omit the Cultural Context section

---

### 2c. Astrology Overlays

**Path**: `traits/overlays/astrology/*.md`

```yaml
---
name: Cancer
date_range: June 22 - July 22
glyph: ♋
element: Water
---
```

| Field | Required | Type |
|-------|----------|------|
| name | Yes | string |
| date_range | Yes | string |
| glyph | Yes | string (unicode) |
| element | Yes | string |

### 2d. Element Overlays

**Path**: `traits/overlays/elements/*.md`

```yaml
---
name: Earth
image: "https://..."
quadrant: Northern (lat ≥ 0) and Western (lon < 0)
---
```

| Field | Required | Type |
|-------|----------|------|
| name | Yes | string |
| image | No | string |
| quadrant | Yes | string |

### 2e. Ranking Overlays

**Path**: `traits/overlays/ranking/*.md`

```yaml
---
name: B
rank: B
image: "https://..."
shape: Circle
color: a darker shade of yellow
---
```

| Field | Required | Type |
|-------|----------|------|
| name | Yes | string |
| rank | Yes | string (SSS, SS, S, A, B, C, D, F) |
| image | No | string |
| shape | No | string |
| color | No | string |

---

## 3. Drug Entry

**Path**: `drugs-detailed/{slug}.md`
**Format**: YAML frontmatter + Markdown
**Count**: 79

```yaml
---
name: MDMA
molecule: C11H15NO2
era: Modern
origin: Germany
archetype: Milady
ancestor: Native American
swag_score: 4
image: milady_nativeAmerican_MDMA.PNG
date_added: January 12, 2025
---
```

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| name | Yes | string | Drug name |
| molecule | Yes | string | Chemical formula |
| era | Yes | string | `Ancient` or `Modern` |
| origin | Yes | string | Geographic origin |
| archetype | Yes | string | Freetekno/Milady/Acidhouse/Chicago Detroit |
| ancestor | Yes | string | Linked ancestor name |
| swag_score | Yes | number | 1-5 rarity tier |
| image | Yes | string | Filename |
| date_added | Yes | string | Human-readable date |

**Special file**: `drug-pairings.md` is a reference page, not a drug entry (no YAML frontmatter).

---

## 4. Ancestor Entry

**Path**: `core-lore/ancestors/{slug}.md`
**Format**: YAML frontmatter + Markdown
**Count**: 32

```yaml
---
name: Greek
period_ancient: "-480 - -323"
period_modern: "330 - 1453"
locations: Greece, Mediterranean
---
```

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| name | Yes | string | Culture name |
| period_ancient | Yes | string | Date range (negative = BCE) |
| period_modern | Yes | string | Date range |
| locations | Yes | string | Comma-separated regions |

---

## 5. Tarot Card

**Path**: `core-lore/tarot-cards/{slug}.md`
**Format**: YAML frontmatter + Markdown
**Count**: 78

```yaml
---
name: The Lovers
suit: Major Arcana
element: Air
meaning: "Inner harmony, balance through love."
drug: MDMA
drug_type: Modern
molecule: C11H15NO2
---
```

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| name | Yes | string | Card name |
| suit | Yes | string | `Major Arcana` or suit name |
| element | Yes | string | Air/Fire/Water/Earth |
| meaning | Yes | string | Brief meaning |
| drug | Yes | string | Linked drug name |
| drug_type | Yes | string | `Ancient` or `Modern` |
| molecule | Yes | string | Chemical formula |

---

## 6. Special Collection

**Path**: `special-collections/{slug}.md`
**Format**: YAML frontmatter + Markdown
**Count**: 32

```yaml
---
name: The Honey Jar
type: "DeFi, Community"
---
```

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| name | Yes | string | Collection name |
| type | Yes | string | Category description |


---

## 7. Grail Entry

**Path**: `grails/{slug}.md`
**Format**: YAML frontmatter + Markdown
**Count**: 42 canonical + community grails

### Frontmatter

```yaml
---
id: 1630
name: "Greek"
type: grail
category: ancestor
description: "Greek amphora aesthetics with Bacchus and Apollo"
---
```

See `grail.schema.json` for field definitions.

### Body Template

```markdown
# {Name}

![{Name}]({image-url})

> **Grail #{ID}** · {Category} · [Browse all Grails →](../browse/grails.md)

## Cultural Context

The real-world history, mythology, or traditions the piece references.
Sourced claims with links where possible.

## Visual Elements

What is depicted — imagery, symbols, objects, colors — and how each
element connects to the cultural context above.

## Justification

Why this subject was chosen for the collection. How it fits the
Mibera universe, connects to the ancestor/element/zodiac system,
or resonates with the project's themes.
```

**Notes**:
- Grails have no trait table — these three sections serve as the metadata
- All sourced claims should link to references (Wikipedia preferred)
- Existing special notes (e.g. "Combined piece" for Gaia/Uranus) go above the sections
- Entries should be written so an agent could build a persona from the content alone

---

## 8. Birthday Era

**Path**: `birthdays/{era-slug}.md`
**Format**: Structured Markdown headings (no YAML frontmatter)
**Count**: 11 era files

### Structure per entry

```markdown
## MM/DD/YYYY Ce HH:MM

[#NNNN](../miberas/NNNN.md)

**Era:** Period Name (YYYY CE)

| Sun Sign | Element | Modality | Ruler | Traits | Time of Birth |
|----------|---------|----------|-------|--------|---------------|
| Sign | Element | Modality | Planet | Description | HH:MM |
```

---

## Conventions

### File Naming
- Slugified lowercase with hyphens: `golden-hoop.md`, `native-american.md`
- Miberas use zero-padded 4-digit IDs: `0001.md` through `10000.md`

### Date Formats
- YAML `date_added`: Human-readable (`"December 9, 2024"`, `"August 2024"`, `"January 12, 2025"`)
- Birthday dates: `MM/DD/YYYY Ce HH:MM` format

### Link Syntax
- Always relative paths: `../core-lore/ancestors/greek.md`
- Anchor links for subsections: `../birthdays/medieval.md#07211352-ce-1947`
- No external HTTP links for internal navigation

### Index Files
- Every directory has a `README.md`
- README files list all entries with links
- Back-navigation: `[← Back to Index](README.md)`

---

## Validation

Run `_codex/scripts/audit-structure.sh` to validate all files against these schemas.
Run `_codex/scripts/audit-links.sh` to check all internal links.
