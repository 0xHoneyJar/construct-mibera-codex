# Sprint Plan: Index Completeness Markers

**Cycle**: 011
**PRD**: `grimoires/loa/prd.md`
**SDD**: `grimoires/loa/sdd.md`

---

## Overview

Single sprint. Add machine-readable completeness comments to 8 entity index files.

---

## Sprint 1: Completeness Comments

**Goal**: Add `<!-- codex-status: ... -->` HTML comments to all entity index READMEs.

### Task 1.1: Add completeness comments to 8 index files

**Description**: Insert a machine-readable HTML comment as the first line of each entity index README. Values sourced from `manifest.json`.

**Format**: `<!-- codex-status: {COMPLETE|PARTIAL} | entities: {count} | last-verified: 2026-02-18 -->`

**Files**:
1. `miberas/README.md` — COMPLETE, 10000
2. `traits/README.md` — COMPLETE, 1257
3. `traits/overlays/molecules/README.md` — COMPLETE, 78
4. `core-lore/ancestors/README.md` — COMPLETE, 33
5. `core-lore/tarot-cards/README.md` — COMPLETE, 78
6. `birthdays/README.md` — COMPLETE, 11
7. `special-collections/README.md` — PARTIAL, 32
8. `grails/README.md` — COMPLETE, 42

**Acceptance criteria**:
- [x] All 8 files have `<!-- codex-status: ... -->` as first line
- [x] Values match manifest.json entity_types (status + count)
- [x] Comment format matches regex `^<!-- codex-status: (COMPLETE|PARTIAL) \| entities: \d+ \| last-verified: \d{4}-\d{2}-\d{2} -->$`
- [x] Existing file content is unchanged (comment is prepended)

**Dependencies**: None

### Task 1.2: Validate

**Description**: Verify all comments are correct and files are undamaged.

**Acceptance criteria**:
- [x] All 8 comments parseable by regex
- [x] Entity counts match manifest.json
- [x] No other content in files was modified

**Dependencies**: Task 1.1
