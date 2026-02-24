# PRD: Reveal Timeline — Per-Mibera Fracture Images

**Cycle**: 017
**Created**: 2026-02-24
**Status**: Draft

---

## 1. Problem Statement

Each Mibera file currently displays only the final reveal image (MiReveal #8.8). The 10-phase reveal journey — from sealed MiParcel envelope through progressive unveiling — is documented in `fractures/` as a collection-wide narrative, but individual Miberas have no visual record of *their* specific reveal progression.

Holders participated in each reveal wave. The fracture images exist per-token on S3. They should be visible per-Mibera.

## 2. Goal

Add a **Reveal Timeline** section to all 10,000 Mibera files that displays the first 9 fracture phases as a horizontal image row. The final reveal (MiReveal #8.8) remains as the primary hero image at the top of the file — the timeline shows the journey that led to it.

## 3. Scope

### In Scope

- Add a "Reveal Timeline" section with a 9-column horizontal image table to all 10,000 Mibera files
- Phases shown (in order): MiParcels → Miladies → #1.1 → #2.2 → #3.3 → #4.20 → #5.5 → #6.9 → #7.7
- MiReveal #8.8 is **excluded** from the table (it's already the primary image)
- Images served from public S3: `https://thj-assets.s3.us-west-2.amazonaws.com/`
- Build a Python script (`_codex/scripts/add-reveal-timeline.py`) to process all 10,000 files
- Remove existing `mireveals/mireveal3.3/` directory (old CSV data, superseded by S3)

### Out of Scope

- MiShadows (separate feature, incomplete data — only ~3,240 of 10,000)
- Any changes to the `fractures/` documentation itself
- Image resizing or optimization (S3 serves originals, GitHub camo proxies)

## 4. Technical Design

### 4.1 Image URL Patterns

**S3 Base**: `https://thj-assets.s3.us-west-2.amazonaws.com`

| Phase | S3 Path | Filename |
|-------|---------|----------|
| MiParcels | `/parcels/parcelsImages/` | `{tokenId}.png` |
| Miladies | `/fractures/miladies/images/` | `{tokenId}.png` |
| MiReveal #1.1 | `/reveal_phase1_images/` | `{hash}.png` |
| MiReveal #2.2 | `/reveal_phase2/reveal_phase2_images/` | `{hash}.png` |
| MiReveal #3.3 | `/reveal_phase3/reveal_phase3_images/` | `{hash}.png` |
| MiReveal #4.20 | `/reveal_phase4/images/` | `{hash}.png` |
| MiReveal #5.5 | `/reveal_phase5/images/` | `{hash}.png` |
| MiReveal #6.9 | `/reveal_phase6/images/` | `{hash}.png` |
| MiReveal #7.7 | `/reveal_phase7/images/` | `{hash}.png` |

- **Token-ID filenames**: MiParcels and Miladies (e.g., `42.png`)
- **Hash filenames**: All 8 MiReveal phases use the same per-token SHA hash from `_codex/data/mibera-image-urls.json`

### 4.2 Hash Mapping

The existing `_codex/data/mibera-image-urls.json` maps every token ID to its Irys URL:
```
"1": "https://gateway.irys.xyz/.../8a7e39404ebf86073fab1d068d7037930298d121.png"
```

The filename hash (`8a7e39404ebf86073fab1d068d7037930298d121`) is the **same** across all 8 MiReveal phases on S3. Extract the hash from the URL, use it for all phase paths.

### 4.3 Mibera File Layout (After)

```markdown
---
(frontmatter unchanged)
---

# Mibera #N

![Mibera #N](https://gateway.irys.xyz/.../{hash}.png)

## Reveal Timeline

| MiParcels | Miladies | #1.1 | #2.2 | #3.3 | #4.20 | #5.5 | #6.9 | #7.7 |
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| ![MiParcels](s3url) | ![Miladies](s3url) | ![#1.1](s3url) | ![#2.2](s3url) | ![#3.3](s3url) | ![#4.20](s3url) | ![#5.5](s3url) | ![#6.9](s3url) | ![#7.7](s3url) |

## Traits
(unchanged)
```

**Placement**: Between the hero image and the Traits table. Users see the final form first, then scroll to discover the reveal journey.

### 4.4 Edge Cases

- **Miladies**: Has 9,999 files (1 missing token). Script must handle missing images gracefully — either skip the cell or show a placeholder alt text.
- **Image sizes**: Reveal images are ~700KB–1.6MB. GitHub's camo proxy has a 5MB limit — all well under.
- **9-column width**: On GitHub, each thumbnail will be ~100px wide. Small but recognizable. Users click to see full size.

### 4.5 S3 Access

**Already configured** (done during this session):
- Bucket: `thj-assets` (us-west-2)
- `BlockPublicPolicy` and `RestrictPublicBuckets` disabled
- Scoped bucket policy grants `s3:GetObject` on all image prefixes listed above
- Verified: both token-ID and hash-based URLs return HTTP 200

### 4.6 Cleanup

- Delete `mireveals/mireveal3.3/` directory and all contents (old CSV metadata, now superseded by S3 image URLs)
- Update `manifest.json` if it references the mireveals directory

## 5. Script Requirements

**File**: `_codex/scripts/add-reveal-timeline.py`

- Stdlib-only Python (project convention — no PyYAML, no external deps)
- Reads `_codex/data/mibera-image-urls.json` for hash mapping
- Processes all 10,000 files in `miberas/`
- Inserts `## Reveal Timeline` section between hero image and `## Traits`
- Idempotent: if `## Reveal Timeline` already exists, replaces it
- Reports: files processed, files skipped, errors

## 6. Acceptance Criteria

1. All 10,000 Mibera files contain a `## Reveal Timeline` section with 9 phase images
2. Images use correct S3 URLs (token-ID for parcels/miladies, hash for reveals)
3. Phase order is: MiParcels → Miladies → #1.1 → #2.2 → #3.3 → #4.20 → #5.5 → #6.9 → #7.7
4. MiReveal #8.8 is NOT in the table (remains as primary image)
5. Primary hero image (Irys URL) is unchanged
6. Traits table and all content below is unchanged
7. `mireveals/mireveal3.3/` directory is deleted
8. Script is idempotent — running twice produces the same result
9. Spot-check: 5 random Mibera files render correctly on GitHub with visible images
