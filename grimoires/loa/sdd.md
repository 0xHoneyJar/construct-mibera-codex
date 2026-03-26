# SDD: Trait Image Embedding — S3 Visual Layer

**Cycle:** 019
**Created:** 2026-03-25

## Architecture

Single stdlib-only Python script (`_codex/scripts/embed-images.py`) that:

1. Walks `/Users/gumi/micodex-images/output/` to collect all `.webp` filenames
2. Builds a lookup table: image filename → codex `.md` file path
3. For each matched pair: updates `image:` frontmatter and inserts inline `<img>` HTML
4. Reports: matched, skipped, orphaned, errors

No external dependencies. No database. No API calls. One script, one pass.

## Image-to-File Resolution

The script builds a **slug index** by walking the codex directories and mapping `slug → file_path`:

```
traits/**/*.md      → slug from filename (e.g., traits/character-traits/hair/funky.md → "funky")
drugs-detailed/*.md → slug from filename (e.g., drugs-detailed/acacia.md → "acacia")
vending-machine/**/*.md → slug from filename
```

Then for each image, applies mapping rules in priority order:

### Priority 1: Special prefixes (most specific)
- `SS5_bongbear_{name}.webp` → lookup `bong-bear-{slugify(name)}` in bong-bears/
- `SS5_cypherpunk_{name}.webp` → lookup `{slugify(name)}` in general-items/
- `{era}_{ancestor}_{tattoo}.webp` (era ∈ {ancient, modern}) → lookup `{slugify(tattoo)}` in tattoos/

### Priority 2: Archetype combos (no SS prefix)
- `{arch}_{ancestor}_{drug}.webp` → lookup `{slugify(drug)}` in drugs-detailed/ (molecule overlay)
- `{arch}_{glasses}.webp` (2 components, arch known) → lookup `{slugify(glasses)}` in glasses/

### Priority 3: SS-prefixed traits
- `SS{N}_{arch}_{era}_{ancestor}_{name}.webp` → lookup `{slugify(name)}` in slug index
- `SS{N}_{arch}_{name}.webp` → lookup `{slugify(name)}` in slug index
- `SS{N}_{name}.webp` → lookup `{slugify(name)}` in slug index

### Priority 4: Astrology / Overlays / Elements
- `Sun|Moon|Rising {sign}.webp` → `traits/overlays/astrology/{slugify(sign)}.md`
- `Air|Earth|Fire|Water.webp` → `traits/overlays/elements/{lower}.md`
- `A|B|C|D|F|S|SS|SSS.webp` → `traits/overlays/ranking/{lower}.md`

### Priority 5: Direct name match (broadest)
- `{Name}.webp` → lookup `{slugify(Name)}` in slug index

### Skip rules
- `*_overlay.webp` → skip (deferred)
- `IMG_*.webp` → skip (now renamed, but guard remains)
- No match found → log to orphan report

### Known archetypes list
`acidhouse`, `chicagodetroit`, `freetekno`, `milady`

### Known ancestors list
Loaded from `core-lore/ancestors/` directory listing.

### Known eras
`ancient`, `modern`

## File Modification Strategy

### Frontmatter update

Replace the `image:` field value (whether bare filename, old object storage URL, or absent) with the canonical S3 URL:

```yaml
image: "https://mibera.s3.amazonaws.com/traits/{url_encoded_filename}.webp"
```

If no `image:` field exists, insert it after the last existing frontmatter field (before closing `---`).

### Inline image insertion

Insert a centered `<img>` tag immediately after the closing `---` of frontmatter, before any existing content:

```html

<div align="center">
  <img src="https://mibera.s3.amazonaws.com/traits/{url_encoded_filename}.webp" alt="{name}" width="320" />
</div>
```

For astrology files (3 images per file):

```html

<div align="center">
  <img src="...Sun%20{Sign}.webp" alt="Sun {Sign}" width="200" />
  <img src="...Moon%20{Sign}.webp" alt="Moon {Sign}" width="200" />
  <img src="...Rising%20{Sign}.webp" alt="Rising {Sign}" width="200" />
</div>
```

### Idempotency

- If file already contains `<div align="center">` with an `<img>` tag pointing to `mibera.s3.amazonaws.com`, skip the inline insertion
- If file already contains an `<img>` pointing to old object storage, replace it
- Frontmatter `image:` is always overwritten to canonical URL

### Safety

- Never modify content between `<!-- @generated:backlinks-start -->` and `<!-- @generated:backlinks-end -->`
- Parse frontmatter with regex (stdlib-only, no PyYAML) — same pattern as all codex scripts
- Write to a temp file, then atomic rename

## URL Encoding

```python
from urllib.parse import quote
url = f"https://mibera.s3.amazonaws.com/traits/{quote(filename, safe='')}"
```

Spaces → `%20`, special chars encoded. `urllib.parse` is stdlib.

## Output

The script prints a summary:

```
Matched:  1,160
Skipped:  105 (orphans + deferred)
Updated:  1,160
Errors:   0

Orphan images (no codex match):
  - Bright Forest.webp
  - ...
```

And writes `_codex/scripts/reports/image-embed-report.json` with full details.

## Sprint Plan Recommendation

Single sprint, 3 tasks:
1. Write `embed-images.py` script
2. Run script, review output in Obsidian
3. Validate (spot-check URLs, audit-links.sh)
