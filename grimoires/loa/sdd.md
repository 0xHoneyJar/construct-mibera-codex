# SDD: Reveal Timeline — Per-Mibera Fracture Images

**Cycle**: 017
**Created**: 2026-02-24

---

## 1. Architecture

Single Python script (`_codex/scripts/add-reveal-timeline.py`) reads a mapping file, then modifies 10,000 markdown files in-place. No new dependencies, no new data structures, no infrastructure changes.

```
_codex/data/mibera-image-urls.json  ──→  Script  ──→  miberas/*.md (modified in-place)
```

## 2. Data Flow

1. **Load** `mibera-image-urls.json` → build `{tokenId: hash}` mapping (extract hash from Irys URL)
2. **For each** `miberas/NNNN.md`:
   - Parse token ID from filename
   - Look up hash from mapping
   - Construct 9 S3 URLs (2 token-ID-based + 7 hash-based)
   - Find insertion point: after hero image line, before `## Traits`
   - Insert or replace `## Reveal Timeline` section
3. **Report** summary: processed, skipped, errors

## 3. URL Construction

**S3 Base**: `https://thj-assets.s3.us-west-2.amazonaws.com`

```python
PHASES = [
    ("MiParcels",    "parcels/parcelsImages/{token_id}.png"),
    ("Miladies",     "fractures/miladies/images/{token_id}.png"),
    ("#1.1",         "reveal_phase1_images/{hash}.png"),
    ("#2.2",         "reveal_phase2/reveal_phase2_images/{hash}.png"),
    ("#3.3",         "reveal_phase3/reveal_phase3_images/{hash}.png"),
    ("#4.20",        "reveal_phase4/images/{hash}.png"),
    ("#5.5",         "reveal_phase5/images/{hash}.png"),
    ("#6.9",         "reveal_phase6/images/{hash}.png"),
    ("#7.7",         "reveal_phase7/images/{hash}.png"),
]
```

## 4. Markdown Insertion

**Target pattern**: Insert between the hero image (`![Mibera #N]...`) and `## Traits`.

**Idempotency**: If `## Reveal Timeline` already exists, replace everything from that heading to the next `##` heading.

**Output format**:
```markdown

## Reveal Timeline

| MiParcels | Miladies | #1.1 | #2.2 | #3.3 | #4.20 | #5.5 | #6.9 | #7.7 |
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| ![MiParcels](url) | ![Miladies](url) | ![#1.1](url) | ![#2.2](url) | ![#3.3](url) | ![#4.20](url) | ![#5.5](url) | ![#6.9](url) | ![#7.7](url) |
```

## 5. Edge Cases

| Case | Handling |
|------|----------|
| Missing Miladies image (1 of 10,000) | Still generate the cell — broken image is acceptable, will render once uploaded |
| File already has timeline | Replace existing section (idempotent) |
| Malformed Mibera file (no `## Traits`) | Skip, log warning |
| Token ID not in image-urls.json | Skip, log error |

## 6. Cleanup

- `rm -rf mireveals/mireveal3.3/` — old CSV metadata
- Check `manifest.json` for mireveals references → remove if present
