# Scripts

Maintenance and generation scripts for the Mibera Codex. All scripts require **Python 3** and **Bash** (stdlib-only, except `micodex-assembler.py` which requires Pillow).

Run from the repo root:

```bash
./_codex/scripts/<script-name>
```

## Auditing

| Script | Description |
|--------|-------------|
| `audit-links.sh` | Validate all relative Markdown links. Reports broken links to `reports/audit-links.json` |
| `audit-structure.sh` | Validate structural integrity of content files against schemas. Reports to `reports/audit-structure.json` |
| `audit-semantic.py` | Check semantic consistency (naming, cross-references, data alignment) |

## Generation

| Script | Description |
|--------|-------------|
| `generate-browse.sh` | Generate faceted browse pages (`by-drug.md`, `by-era.md`, `by-tarot.md`) |
| `generate-backlinks.py` | Generate backlink sections for content files |
| `generate-clusters.py` | Generate enriched dimension browse pages (`by-ancestor.md`, `by-archetype.md`, `by-element.md`) with cross-dimensional breakdown tables |
| `generate-exports.py` | Export codex data in structured formats |
| `generate-grails.py` | Generate Grails browse page (`browse/grails.md`) and data export (`_codex/data/grails.jsonl`) from `grails/*.md` frontmatter |
| `generate-graph.py` | Generate relationship graph data |
| `generate-llms-full.py` | Generate `llms-full.txt` — complete codex content for LLM ingestion |
| `generate-stats.py` | Generate codex statistics |

## Images

| Script | Description |
|--------|-------------|
| `micodex-assembler.py` | Composite trait layer PNGs onto bundled template images (background, body, arms) to produce final character portraits as WebP. Requires **Pillow** and **tqdm** (`pip install Pillow tqdm`). Originally from [micodex-images](https://github.com/0xHoneyJar/micodex-images). |
| `embed-images.py` | Map assembled `.webp` trait images to codex entries, update `image:` frontmatter and insert inline `<img>` HTML pointing at `s3://mibera/traits/`. Outputs report to `reports/image-embed-report.json`. |

### Image Pipeline — End to End

The codex uses a three-stage pipeline: **assemble → upload → embed**.

**Stage 0 — Inputs (what you need locally)**

- **Templates** (bundled): `_codex/assets/templates/` holds `background.PNG`, `body.PNG`, `arms.PNG` (1848×2500). You do not need to supply these.
- **Trait layers** (external — not in this repo): a directory of trait PNGs organized in z-indexed subfolders, e.g. `eyes__z69/`, `hair__z85/`. File naming drives slug matching in `embed-images.py`. Ask a maintainer for the current layer archive if you don't already have it.

**Stage 1 — Assemble**

```bash
python3 _codex/scripts/micodex-assembler.py \
  --traits /path/to/trait-layers \
  --output /path/to/output-dir
```

Produces one `.webp` per trait in `--output`.

**Stage 2 — Upload to S3**

```bash
aws s3 sync /path/to/output-dir s3://mibera/traits/ --content-type "image/webp"
```

Bucket is public-read; canonical URL is `https://mibera.s3.amazonaws.com/traits/{url_encoded_filename}.webp`.

**Stage 3 — Embed into codex**

```bash
python3 _codex/scripts/embed-images.py --images /path/to/output-dir
# or: MICODEX_IMAGE_DIR=/path/to/output-dir python3 _codex/scripts/embed-images.py
# use --dry-run to preview without writing
```

Updates `image:` frontmatter and inline `<img>` tags across matching trait/ancestor/element/etc. entries. Report written to `_codex/scripts/reports/image-embed-report.json`.

## Data Maintenance

| Script | Description |
|--------|-------------|
| `normalize-data.py` | Normalize inconsistencies in data fields across content files |
| `fetch-mibera-images.py` | Fetch and map Mibera images from external sources |
| `fetch-mibera-sets.py` | Fetch Mibera Set ERC-1155 metadata from Optimism/Arweave |

## Archived (Migration Scripts)

One-shot scripts that have completed their purpose. Preserved in `archive/` for reference.

| Script | Description |
|--------|-------------|
| `archive/add-frontmatter.py` | Added YAML frontmatter to 10,000 Mibera files (Cycle 003) |
| `archive/add-reveal-timeline.py` | Added reveal timeline sections to Mibera files (Cycle 017) |
| `archive/apply-enrichment.py` | Applied cultural context from mapping files (Cycle 016) |
| `archive/apply-justifications.py` | Applied justification comments from mapping files |
| `archive/migrate-trait-template.py` | Migrated trait files from old to new template format |
