# PRD: Trait Image Embedding — S3 Visual Layer

**Cycle:** 019
**Created:** 2026-03-25
**Status:** Draft

## 1. Problem Statement

The Mibera Codex has 1,487 trait/overlay/drug images available as `.webp` files, now hosted at `s3://mibera/traits/`. Currently:

- 635 trait files reference an old object storage URL (`mibera.fsn1.your-objectstorage.com`)
- 532 trait files have bare filenames (no URL) in their `image:` frontmatter
- 78 trait files have no `image:` field at all
- Drug files use bare filenames referencing `.PNG` extensions
- **No images are visually displayed** in the markdown body — they're metadata-only in frontmatter

The images exist. The hosting exists. But the codex doesn't show them.

## 2. Goal

Embed S3-hosted images into every matching codex entry so that trait/drug/overlay pages display their art visually when viewed on GitHub or in Obsidian.

### Success Criteria

- Every image in `s3://mibera/traits/` is linked from its corresponding codex entry
- Images render inline below the frontmatter on GitHub and in Obsidian
- `image:` frontmatter field updated to the canonical S3 URL
- No broken links, no orphaned references

## 3. Scope

### In Scope

| Category | Image Count | Destination |
|----------|-------------|-------------|
| Direct trait matches | 466 | `traits/` subdirectories |
| SS-prefixed trait variants | 813 | `traits/` subdirectories (map to base trait) |
| Archetype+ancestor+drug combos | 79 | `drugs-detailed/` |
| Astrology layers (Sun/Moon/Rising) | 36 | `traits/overlays/astrology/` |
| Ranking letters (A-SSS) | 8 | `traits/overlays/ranking/` |
| Element overlays | 4 | `traits/overlays/elements/` |
| Era+ancestor tattoo images | 35 | `traits/character-traits/tattoos/` |
| Archetype+glasses combos | 34 | `traits/accessories/glasses/` |
| Overlay variants (`_overlay`) | 4 | **Deferred** — need compositing with body template |
| Misc identifiable | 4 | Various |
| **Total mapped** | **~1,483** | |

### Out of Scope

- 3 `IMG_` files (unidentified camera photos — need manual ID from artist)
- Creating new `.md` files for the ~57 images with no codex entry (separate cycle)
- Migrating away from S3 (this establishes S3 as the canonical image host)

### Key Decision: Image Semantics (from artist clarification)

The naming convention encodes distinct semantic roles:

- **No-SS prefix combos** (`archetype_ancestor_drug.webp`) = **molecule overlay** — the drug's visual effect layer. Maps to `drugs-detailed/{drug}.md`.
- **SS-prefixed combos** (`SS{N}_archetype_era_ancestor_name.webp`) = **held items / accessories / clothing** — physical objects the Mibera carries or wears. Maps to `traits/` entries.
- **`_overlay` suffix images** = overlay layers that need compositing with a body template. **Deferred** to a future cycle.
- **Astrology images** (`Sun/Moon/Rising {Sign}.webp`) = three **separate trait categories** (Sun Sign, Moon Sign, Rising Sign), NOT variants of one trait. Each maps to its own file.

### Key Decision: One Image Per Entry

Each codex entry gets exactly one primary image displayed. No "variants" sections — the SS-prefixed and non-SS images map to *different* codex entries (held item vs molecule overlay). Astrology layers map to separate files.

### Key Decision: URL Format

All `image:` frontmatter fields and inline markdown images will use the full S3 URL:
```
https://mibera.s3.amazonaws.com/traits/{filename}.webp
```

This replaces both the old object storage URLs and bare filenames.

### Key Decision: Filename Encoding

S3 URLs with spaces need URL encoding (spaces → `%20`). The embed script must handle this for filenames like `Keith Haring Shirt.webp`.

## 4. Image Display Format

Below the frontmatter (after the closing `---`), before any existing content:

```markdown
---
name: Funky
image: "https://mibera.s3.amazonaws.com/traits/Funky.webp"
...
---

<div align="center">
  <img src="https://mibera.s3.amazonaws.com/traits/Funky.webp" alt="Funky" width="320" />
</div>

# Funky
...
```

For multi-image entries (e.g., astrology with 3 layers):

```markdown
<div align="center">
  <img src=".../Sun%20Aries.webp" alt="Sun Aries" width="200" />
  <img src=".../Moon%20Aries.webp" alt="Moon Aries" width="200" />
  <img src=".../Rising%20Aries.webp" alt="Rising Aries" width="200" />
</div>
```

## 5. Image-to-File Mapping Rules

| Image Pattern | Maps To | Rule |
|---------------|---------|------|
| `{Name}.webp` | `traits/{subcat}/{slug}.md` | Slugify name, find in manifest |
| `SS{N}_{archetype}_{Name}.webp` | `traits/{subcat}/{slug}.md` | Strip SS prefix + archetype, slugify remainder |
| `SS{N}_{Name}.webp` | `traits/{subcat}/{slug}.md` | Strip SS prefix, slugify remainder |
| `{arch}_{ancestor}_{drug}.webp` | `drugs-detailed/{drug-slug}.md` | Molecule overlay — last component is drug name |
| `SS{N}_{arch}_{era}_{ancestor}_{Name}.webp` | `traits/{subcat}/{slug}.md` | Held item/accessory — last component is trait name |
| `SS5_bongbear_{Name}.webp` | `traits/items/bong-bears/{slug}.md` | Strip prefix |
| `SS5_cypherpunk_{Name}.webp` | `traits/items/general-items/{slug}.md` | Strip prefix |
| `{era}_{ancestor}_{Tattoo}.webp` | `traits/character-traits/tattoos/{slug}.md` | Last component is tattoo name |
| `{arch}_{Glasses}.webp` | `traits/accessories/glasses/{slug}.md` | Last component is glasses name |
| `Sun/Moon/Rising {Sign}.webp` | `traits/overlays/astrology/{sign}.md` | All 3 layers displayed on same sign file (current structure: 12 files, not split by layer) |
| `{Letter}.webp` (A-SSS) | `traits/overlays/ranking/{letter}.md` | Direct match |
| `Air/Earth/Fire/Water.webp` | `traits/overlays/elements/{el}.md` | Direct match |
| `{name}_overlay.webp` | **Deferred** | Needs compositing with body template |

## 6. Risks

| Risk | Mitigation |
|------|------------|
| GitHub camo proxy 5MB limit | WebP files are small (~50-200KB each) — no risk |
| Broken S3 URLs | Validate all URLs return 200 before embedding |
| Filename encoding issues | URL-encode spaces and special chars |
| Backlink markers disrupted | Insert image ABOVE any existing content, BELOW frontmatter |
| Wrong trait matched | Use manifest.json for authoritative slug→file mapping |

## 7. Non-Goals

- Resizing or optimizing images (they're already webp)
- Creating a CDN/CloudFront layer (direct S3 is fine for now)
- Building an image pipeline or automation (one-time batch operation)
- Updating the graph.json or miberas.jsonl exports (no schema change needed)
