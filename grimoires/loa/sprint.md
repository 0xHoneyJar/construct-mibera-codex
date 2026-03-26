# Sprint Plan: Trait Image Embedding — S3 Visual Layer

**Cycle:** 019
**Created:** 2026-03-25

## Sprint 1: Embed Images (Global ID: 32)

### Task 1: Write embed-images.py
- Build slug index from codex directory walk
- Implement all mapping rules from SDD (priority 1-5)
- Handle frontmatter update + inline image insertion
- Generate report JSON

**Acceptance:** Script runs without errors, produces report with match counts.

### Task 2: Run script and review in Obsidian
- Execute against the live codex
- Open in Obsidian for visual review
- Fix any mapping errors found during review

**Acceptance:** Images display correctly in Obsidian for spot-checked entries across all categories.

### Task 3: Validate
- Spot-check S3 URLs return 200
- Run audit-links.sh to catch any broken internal links
- Verify backlink sections untouched

**Acceptance:** Zero broken links, zero corrupted backlinks.

## Sprint 2: Vending Machine Gap Fill (Global ID: 33)

### Task 1: Generate missing VM images from layers
- Add `necklaces` z-index (45) to micodex_assembler.py
- Run assembler against `new stuff for da vm` layers folder
- Generate 24 images (19 necklaces + great, beras-jersey, carpenters-plane, MBGA, magyar-tetovalas)

**Acceptance:** 24 new webp images generated, all rendering correctly.

### Task 2: Upload and embed
- Copy to micodex-images/output, sync to S3
- Re-run embed-images.py + manually embed MBGA and magyar-tetovalas (slug mismatch)
- Verify all S3 URLs return 200

**Acceptance:** 98/102 VM entries have images (4 remaining need source art: propeller, cancer-crab, closed, waleswoosh-pink-face-mask).

### Task 3: Archive assembler to codex
- Copy micodex_assembler.py into the codex for future session access
- Note template and layer file locations

**Acceptance:** Future sessions can generate images without external dependencies.
