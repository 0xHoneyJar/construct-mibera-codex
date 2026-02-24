# Sprint Plan: Reveal Timeline — Per-Mibera Fracture Images

**Cycle**: 017
**Created**: 2026-02-24

---

## Sprint 1: Reveal Timeline Integration

**Goal**: Add reveal timeline images to all 10,000 Mibera files and clean up legacy data.

### Task 1: Build the reveal timeline script

**Description**: Create `_codex/scripts/add-reveal-timeline.py` that:
- Loads `_codex/data/mibera-image-urls.json` and builds tokenId→hash mapping
- Iterates all 10,000 `miberas/NNNN.md` files
- Inserts a `## Reveal Timeline` section with a 9-column markdown image table
- Phases in order: MiParcels, Miladies, #1.1, #2.2, #3.3, #4.20, #5.5, #6.9, #7.7
- URL patterns: token-ID-based for parcels/miladies, hash-based for reveals
- S3 base: `https://thj-assets.s3.us-west-2.amazonaws.com`
- Idempotent: replaces existing `## Reveal Timeline` if present
- Stdlib-only Python (project convention)

**Acceptance Criteria**:
- [ ] Script runs without errors on all 10,000 files
- [ ] Produces correct S3 URLs for both token-ID and hash-based phases
- [ ] Inserts between hero image and `## Traits` heading
- [ ] Running twice produces identical output (idempotent)
- [ ] Logs summary: files processed, skipped, errors

### Task 2: Run script on all 10,000 Mibera files

**Description**: Execute the script across the full `miberas/` directory. Verify output on a sample before committing.

**Acceptance Criteria**:
- [ ] All 10,000 files modified with `## Reveal Timeline` section
- [ ] Spot-check 5 files (IDs 1, 42, 100, 5000, 9999) — correct URLs, correct phase order
- [ ] Hero image (Irys URL) unchanged in all files
- [ ] `## Traits` table and all content below unchanged
- [ ] No regressions in frontmatter

### Task 3: Cleanup legacy mireveal data

**Description**: Remove `mireveals/mireveal3.3/` directory (old CSV metadata, superseded by S3 URLs).

**Acceptance Criteria**:
- [ ] `mireveals/` directory deleted
- [ ] No broken references from other files (grep for `mireveals/`)
- [ ] No manifest.json references (already confirmed: none exist)

### Task 4: Validation and spot-check

**Description**: Push a test branch, verify GitHub renders the images correctly on at least 3 Mibera files. Confirm S3 public access is working end-to-end.

**Acceptance Criteria**:
- [ ] Images render on GitHub (not broken)
- [ ] Table layout is visually acceptable (9 thumbnails in a row)
- [ ] Clicking an image opens the full-size S3 version
