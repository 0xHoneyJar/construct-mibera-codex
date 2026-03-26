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
| `embed-images.py` | Map S3-hosted trait images to codex entries, update `image:` frontmatter and insert inline `<img>` HTML. Reads from `s3://mibera/traits/`, outputs report to `reports/image-embed-report.json` |
| `micodex-assembler.py` | Composite trait layer PNGs onto template images (background, body, arms) to produce final character portraits as WebP. Requires **Pillow** and **tqdm** (`pip install Pillow tqdm`). See script header for template/layer file locations. Originally from [micodex-images](https://github.com/0xHoneyJar/micodex-images) |

## Data Maintenance

| Script | Description |
|--------|-------------|
| `add-frontmatter.py` | Add or update YAML frontmatter on content files |
| `normalize-data.py` | Normalize inconsistencies in data fields across content files |
