# Sprint Plan: CDN URL Migration — assets.0xhoneyjar.xyz

**Cycle:** 023
**Created:** 2026-04-29
**Sprints:** 1
**Estimated effort:** Medium (1 script + mechanical rewrite across ~50K refs)

---

## Sprint 1: URL Migration

**Goal:** Rewrite all image URLs in the codex from legacy hosts to `assets.0xhoneyjar.xyz`. Verify byte-parity before and after.

### T-1.1: Verify CDN coverage per host pattern

**Description:** Spot-check each host pattern against `assets.0xhoneyjar.xyz` to confirm which patterns are flippable. Census found 3 host patterns; CDN testing confirmed 2 of 3 are served.

**Results:**
- `thj-assets.s3.us-west-2.amazonaws.com` → CDN: **200** (~40K refs, flippable)
- `gateway.irys.xyz` → CDN via `reveal_phase8/images/`: **200** (~10K refs, flippable)
- `mibera.s3.amazonaws.com` → CDN: **403** (different bucket, **excluded** — 2.6K refs stay as-is)

**Acceptance criteria:**
- [x] All 3 patterns tested via HTTP HEAD
- [x] 2 confirmed patterns proceed to migration
- [x] `mibera.s3.amazonaws.com` excluded, logged for future cycle

---

### T-1.2: Write migration script

**Description:** Write `_codex/scripts/migrate-cdn-urls.py` (stdlib-only Python) that:
1. Walks all `.md`, `.json`, `.jsonl`, `.py` files (excluding `.claude/`, `.git/`)
2. Applies rewrite rules per SDD
3. Supports `--dry-run` (print stats, don't write)
4. Supports `--verify N` (spot-check N random URLs via HTTP HEAD, compare status + content-length between old and new)

**Acceptance criteria:**
- Script runs with `--dry-run` and reports expected counts matching census (~40K S3-direct, ~10K Irys)
- `--verify 10` passes for each pattern (10 URLs per pattern, all return HTTP 200 with matching content-length)
- Script handles URL-encoded paths (e.g. `%20` in trait filenames)

---

### T-1.3: Execute migration

**Description:** Run the script for real on a feature branch. Commit the result.

**Acceptance criteria:**
- All confirmed patterns rewritten
- `git diff --stat` shows expected file count
- No files outside codex content modified (no `.claude/` changes)
- Commit message references issue #54

---

### T-1.4: Post-migration audit

**Description:** Validate the rewrite didn't break anything.

**Acceptance criteria:**
- `_codex/scripts/audit-links.sh` passes (internal markdown links still valid)
- Spot-check 5 files visually: mibera, miparcel, trait, grail, special-collection — images render at new URLs
- Zero remaining refs to old hosts (grep confirms 0 matches for each migrated pattern)
- PR opened, referencing issue #54

---
