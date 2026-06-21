# Runbook — Add a Vending Machine Trait

End-to-end procedure for adding a single Shadow Trait (Vending Machine exclusive) to the codex: render the composite image, upload it to the CDN-backed S3 bucket, write the codex entry, and bump the indexes.

This runbook is the **single-trait companion** to the bulk pipeline documented in [`_codex/scripts/README.md` → Image Pipeline](../scripts/README.md#image-pipeline--end-to-end).

---

## Prerequisites

- `uv` (or Python 3.11+ with `Pillow` and `tqdm`) — assembler dependencies are declared inline via PEP 723, so `uv run` resolves them automatically.
- `aws` CLI configured with credentials that have `s3:PutObject` on `s3://thj-assets/Mibera/traits/`.
- The raw trait-layer PNG at exactly **1848×2500** (RGBA). This is the same canvas size as `_codex/assets/templates/{background,body,arms}.PNG`. If the source is a different size, the assembler will scale it but registration with `body`/`arms` will be off.
- The category the trait belongs to. The 12 VM categories: `body`, `earrings`, `eyes`, `face-accessories`, `glasses`, `hats`, `items`, `masks`, `mouth`, `necklaces`, `shirts`, `tattoos`. Each maps to a default z-index in [`micodex-assembler.py`](../scripts/micodex-assembler.py) (`ZIndexParser.DEFAULT_Z_INDICES`) — e.g. items=170, hats=160, glasses=140, shirts=50. (`body` is a special case — see below.)

---

## Stage 1 — Render the composite

The trait layer must be composited onto the templates (`background → body → trait → arms`) before upload. The CDN serves the **composite**, not the raw trait layer.

```bash
# Stage the raw layer in a category-named folder. The assembler reads the
# z-index from the folder name suffix __z{N}, falling back to the default
# for the category if no suffix is present.
mkdir -p /tmp/trait-stage/items__z170 /tmp/trait-out
cp ~/Downloads/bff.PNG /tmp/trait-stage/items__z170/bff.PNG

# Render — produces /tmp/trait-out/bff.webp (1848x2500, ~65 KB)
uv run _codex/scripts/micodex-assembler.py \
  --traits /tmp/trait-stage \
  --output /tmp/trait-out
```

The output filename is the source PNG's basename with `.webp`. Keep the basename lowercase, no spaces (`bff`, not `BFF` or `bff wand`) — it becomes part of the canonical CDN URL.

**Verify**: open `/tmp/trait-out/<name>.webp`. The trait should sit between the Mibera's body and arms — hands should wrap around held items, glasses should sit on the face, shirts should be covered by the arms. If the composite looks wrong, the z-index folder name is most likely the issue.

### Body-color traits (special case)

A body color (e.g. `pepe`) is not a single overlay — it *replaces* the body. The assembler always composites the default gray `body.PNG` (z=20) and `arms.PNG` (z=200) templates, so a body color needs **two** layers to cover both: the recolored body (head + torso) just above the body template, and the recolored arms above the arms template. Stage both into one `body__z30/` folder so they group into a single trait, and give the arms layer a `_z80` file suffix — the assembler's body-folder special case bumps `_z80` arms to z=210 (above the template arms):

```bash
mkdir -p /tmp/trait-stage/body__z30
cp ~/Downloads/pepe.PNG          /tmp/trait-stage/body__z30/pepe.PNG      # body -> z=30
cp ~/Downloads/pepe_overlay.PNG  /tmp/trait-stage/body__z30/pepe_z80.PNG  # arms -> z=210
```

Both files share the base name `pepe`, so they render into a single `pepe.webp`. File the entry under `vending-machine/body/`.

---

## Stage 2 — Upload to CDN-backed S3

```bash
aws s3 cp /tmp/trait-out/<name>.webp \
  s3://thj-assets/Mibera/traits/<name>.webp \
  --content-type "image/webp"
```

### Important — bucket gotcha

The CDN (`assets.0xhoneyjar.xyz`) origin is **`s3://thj-assets/Mibera/traits/`** (capital `M`, in the `thj-assets` bucket — *not* the legacy `s3://mibera/traits/` bucket). The `mibera` bucket still holds older renders for back-compat but is no longer the live origin; new uploads there will succeed but will not be served by the CDN.

If you ever see a 403 from `assets.0xhoneyjar.xyz/Mibera/traits/<name>.webp` after a successful S3 upload, double-check you uploaded to **`thj-assets/Mibera/`**, not `mibera/`.

### Verify the upload

```bash
# Cache-buster forces CDN to fetch from origin
curl -sI "https://assets.0xhoneyjar.xyz/Mibera/traits/<name>.webp?cb=$(date +%s)" | head -5
```

Expect `HTTP/2 200` with `content-type: image/webp`. `x-cache: Miss from cloudfront` on the first hit is expected (and proves the origin served it).

---

## Stage 3 — Write the codex entry

File path: `vending-machine/<category>/<slug>.md` where `<slug>` is the kebab-case form of the trait name (`bff`, `swishers-green`, `ancient-mibera`).

Template (matches the pattern established in PR #81):

```markdown
---
name: "<Display Name>"
category: <category>
from: "<Attribution>"
image: "https://assets.0xhoneyjar.xyz/Mibera/traits/<name>.webp"
---

<div align="center">
  <img src="https://assets.0xhoneyjar.xyz/Mibera/traits/<name>.webp" alt="<Display Name>" width="320" />
</div>


# <Display Name>

## Description

<One- to two-paragraph description. Cultural context, in-world function, or visual gag — match the tone of neighbouring entries in the same category.>

## From

<Gumi | community member name | *Community attribution TBD*>

---

*VM-exclusive trait · [All VM Traits](../README.md) · [<Category>](README.md)*
```

The URL in the frontmatter `image:` field and in the inline `<img>` tag use the **un-encoded** filename. If the slug contains spaces (it shouldn't — prefer kebab-case), URL-encode them as `%20` per the convention in existing files.

---

## Stage 4 — Bump the indexes

Two files need updating each time a trait is added:

1. **`vending-machine/<category>/README.md`** — bump the `## All Entries (N)` count and append a `- [Display Name](slug.md)` link at the end of the list (chronological order, mirrors how PR #81 appended new entries).
2. **`vending-machine/README.md`** — bump the **total exclusive trait count** in the overview paragraph (`"108 exclusive traits"`) and the per-category count in the table row for `<category>`.

Both numbers must stay in sync. If you've added more than one trait at once, increment by the full delta.

---

## Stage 5 — Commit on a feature branch

Per project convention, never commit directly to `main`. Use a feature branch and open a PR.

```bash
git checkout -b feat/vm-<slug>-trait
git add vending-machine/<category>/<slug>.md \
        vending-machine/<category>/README.md \
        vending-machine/README.md
git commit -m "feat(vm): add <Display Name> trait"
git push -u origin feat/vm-<slug>-trait
```

The PR pattern from #81 supports bundling multiple traits per PR — fine to batch if a drop adds several at once.

---

## Quick checklist

- [ ] PNG is 1848×2500 RGBA, named `<slug>.PNG` (lowercase, kebab-case)
- [ ] Staged at `<staging-dir>/<category>__z<N>/<slug>.PNG` with the correct z-index folder
- [ ] Assembler rendered cleanly (1 succeeded, 0 failed; composite looks visually right)
- [ ] Uploaded to **`s3://thj-assets/Mibera/traits/<slug>.webp`** (not `s3://mibera/`)
- [ ] `curl -sI` against the CDN URL returns `200`
- [ ] `vending-machine/<category>/<slug>.md` created with frontmatter + description
- [ ] Category `README.md` count incremented and entry appended
- [ ] Top-level `vending-machine/README.md` total count and category row both bumped
- [ ] Committed on a feature branch (not `main`)
