# Sprint Plan: Mibera Sets — Individual Token Entries

> **Cycle**: cycle-015
> **Created**: 2026-02-20
> **PRD**: `grimoires/loa/prd.md`
> **SDD**: `grimoires/loa/sdd.md`

---

## Sprint 1: Fetch Metadata & Generate Token Entries (Global #23)

**Goal**: Fetch on-chain metadata for all 12 Mibera Set tokens and create individual codex entries.

### Task 1: Write fetch-mibera-sets.py script

**Description**: Create `_codex/scripts/fetch-mibera-sets.py` — stdlib-only Python script that:
1. Makes `eth_call` to `uri(uint256)` on Optimism for token IDs 1-12
2. Decodes ABI-encoded string response
3. Resolves URI (handles `ar://`, `{id}` template, HTTPS)
4. Fetches Arweave metadata JSON for each token
5. Generates 12 individual markdown files in `mibera-sets/`
6. Generates `mibera-sets/README.md` index
7. Saves raw metadata cache to `_codex/data/mibera-sets-meta.json`

**Acceptance Criteria**:
- [x] Script runs with `python3 _codex/scripts/fetch-mibera-sets.py`
- [x] Stdlib-only (no pip dependencies)
- [x] ABI string decoding works for `uri()` return values
- [x] Handles ERC-1155 template URIs with `{id}` substitution
- [x] Retry logic (3x with backoff) on RPC/Arweave failures
- [x] Stub entries with `<!-- GAP -->` for any tokens where metadata fetch fails
- [x] Rate limiting: 0.5s between RPC calls, 1.0s between Arweave fetches

### Task 2: Run script and verify output

**Description**: Execute the script against live Optimism RPC and Arweave gateway. Verify all 12 token files are generated correctly. Review metadata content for accuracy against known token names from `_codex/data/mibera-sets.md`.

**Acceptance Criteria**:
- [x] All 12 token files created in `mibera-sets/`
- [x] `mibera-sets/README.md` index lists all 12 tokens grouped by category
- [x] `_codex/data/mibera-sets-meta.json` contains raw metadata for all tokens
- [x] YAML frontmatter matches SDD schema (token_id, name, type, category, supply, image, metadata_uri)
- [x] Backlink markers present in all files
- [x] Token names from metadata match (or documented discrepancy with) existing names in mibera-sets.md

### Task 3: Update _codex/data/mibera-sets.md

**Description**: Update the collection-level reference with resolved metadata information:
- Replace Metadata section GAP comments with actual URI pattern and links
- Add links from token tier table to individual entry files
- Resolve GAP comments that are now answered by metadata

**Acceptance Criteria**:
- [x] Metadata section updated with resolved URI pattern
- [x] Link to `mibera-sets-meta.json` for full metadata
- [x] Token tier table rows link to individual entries
- [x] Resolved GAP comments removed; any remaining GAPs still valid

### Task 4: Update navigation indices

**Description**: Integrate `mibera-sets/` into codex navigation:
- `manifest.json`: Add `mibera_set` entity type + `mibera_sets_meta` data export
- `SUMMARY.md`: Add mibera-sets section
- `CLAUDE.md`: Add to directory layout table and lookup patterns
- `_codex/data/scope.json`: Add mibera-sets count
- `llms.txt`: Add lookup pattern if space permits

**Acceptance Criteria**:
- [x] `manifest.json` has `mibera_set` entity type with count 12, COMPLETE status
- [x] `SUMMARY.md` lists mibera-sets directory with individual token links
- [x] `CLAUDE.md` directory layout table includes `mibera-sets/`
- [x] `_codex/data/scope.json` includes mibera-sets in tracked entities

### Task 5: Validate

**Description**: Run codex validation scripts to ensure new files are structurally correct and all links resolve.

**Acceptance Criteria**:
- [x] `_codex/scripts/audit-links.sh` passes (0 broken links)
- [x] Internal links from README to individual files resolve
- [x] Links from mibera-sets.md to individual files resolve
- [x] YAML frontmatter parseable in all 12 files

---

## Summary

| Sprint | Global ID | Tasks | Goal |
|--------|-----------|-------|------|
| 1 | 23 | 5 | Fetch metadata & generate token entries |
