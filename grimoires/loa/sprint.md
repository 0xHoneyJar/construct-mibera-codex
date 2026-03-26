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
