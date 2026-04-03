# Sprint 10 Review — Obsidian Config & Sharding Assessment

**Cycle**: 006
**Date**: 2026-02-15
**Sprint**: Global Sprint 10 (Cycle-006, Sprint-1)

---

## Implementation Summary

### Task 1: graph.json — Color Groups + Force Tuning ✓

Wrote `.obsidian/graph.json` with:
- 8 color groups ordered by specificity (sub-paths before parent paths)
- Packed RGB integer format confirmed from Obsidian source examples
- Force settings tuned for 10K+ node vault
- All existing user preferences preserved

### Task 2: app.json — Excluded Directories ✓

Wrote `.obsidian/app.json` with `userIgnoreFilters` for 9 non-content directories.

### Task 3: core-plugins.json — Random Note ✓

Set `"random-note": true`. All other plugin states preserved.

### Task 4: Sharding Feasibility Assessment ✓

See below.

### Task 5: User Verification

Pending — user needs to restart Obsidian and verify.

---

## Sharding Feasibility Assessment

### Question

Should `miberas/` (10,001 files in a flat directory) be split into subdirectories (e.g., `miberas/0001-1000/`, `miberas/1001-2000/`, etc.) to improve Obsidian performance?

### Data

#### Outbound Links (from mibera files)

Each mibera file contains ~24 relative links using the `../` prefix:

```markdown
| Archetype | [Freetekno](../core-lore/archetypes.md#freetekno) |
| Drug | [St. John'S Wort](../traits/overlays/molecules/st-johns-wort.md) |
```

- **10,001 files × ~24 links = ~240,024 outbound links**
- All use `../` (one parent directory traversal)
- Sharding would require changing every `../` to `../../` (two levels up)

#### Inbound Links (to mibera files)

| Source Directory | Files | Link Count | % of Total |
|-----------------|-------|------------|------------|
| `birthdays/` | 10 | 9,995 | 91.97% |
| `browse/` | 282 | 682 | 6.27% |
| `core-lore/` | 111 | 111 | 1.02% |
| `traits/overlays/molecules/` | 78 | 78 | 0.72% |
| `traits/` | 0 | 0 | 0% |
| **Total** | **481** | **10,866** | **100%** |

All inbound links use `../miberas/XXXX.md` format. Sharding would change these to `../miberas/RANGE/XXXX.md`.

#### Internal Cross-Links

`miberas/index.md` links to all 10,001 files using relative format `(0001.md)`. Sharding would change these to `(0001-1000/0001.md)`.

### Total Link Rewriting Scope

| Category | Links Affected |
|----------|---------------|
| Outbound from miberas (10,001 files × ~24) | ~240,024 |
| Inbound to miberas (481 files) | 10,866 |
| miberas/index.md internal | ~10,001 |
| **Total** | **~260,891** |

### Script Requirements

A migration script would need to:

1. **Create subdirectories**: 10 dirs for ranges of 1,000 (or 20 dirs for 500)
2. **Move files**: `mv miberas/0001.md miberas/0001-1000/0001.md` × 10,001
3. **Rewrite outbound links in mibera files**: `../` → `../../` in all 10,001 files
4. **Rewrite inbound links in 481 external files**: `../miberas/XXXX.md` → `../miberas/RANGE/XXXX.md`
5. **Rewrite miberas/index.md**: `(XXXX.md)` → `(RANGE/XXXX.md)`
6. **Run link audit**: Verify 0 broken links after migration

Estimated complexity: **Medium** — the link rewriting is mechanical (regex-based) but the scale (260K links) means any edge case in the regex becomes a mass breakage event.

### Risk Analysis

| Risk | Probability | Impact | Notes |
|------|------------|--------|-------|
| Regex misses an edge case in link format | Medium | **Critical** — could break thousands of links | Birthday files have complex anchor links like `medieval.md#07211352-ce-1947` |
| Obsidian wiki-link cache stale after move | Low | Medium | Restart Obsidian to clear cache |
| Git diff is enormous (10K file moves + 260K link changes) | Certain | Low | Manageable with `git mv` and reviewable with `--stat` |
| External tools/bookmarks break | Low | Low | Only affects people with direct file links |
| Reverting is painful | Medium | Medium | 10K file moves in reverse |

### Performance Impact Assessment

Obsidian's performance bottleneck with large flat directories is primarily in:
1. **File explorer rendering** — listing 10K items in a single tree node
2. **File watcher** — OS-level inotify/FSEvents on a single directory
3. **Search indexing** — scanning a flat directory

However, the `userIgnoreFilters` we've already configured in Task 2 does **not** affect miberas/ (those are content files). The primary mitigation for mibera-specific lag would be:
- Obsidian's built-in file explorer collapse (already available)
- Using search/quick-switcher instead of browsing the file tree
- Local graph view instead of global graph

### Recommendation: **DEFER** (No-Go for now)

**Rationale:**
1. **The config changes in Tasks 1-3 address the immediate pain** — graph view colors, excluded non-content dirs, and force tuning provide the biggest UX wins without touching any content files
2. **Risk/reward is unfavorable** — 260K link rewrites with a non-trivial chance of regex edge cases causing mass breakage, for a performance improvement that's incremental (not transformative)
3. **Obsidian handles 10K files in a directory** — it's slow but not broken. The performance issues are more about indexing non-content files (now excluded) and graph rendering (now tuned)
4. **Better alternatives exist** — if miberas/ directory browsing is still slow after these changes, consider:
   - Using Obsidian's quick-switcher (Cmd+O) instead of file explorer
   - Collapsing the miberas/ folder in the explorer by default
   - Using search with `path:miberas` prefix for navigation

**If sharding is ever pursued**, do it as a dedicated cycle with:
- A dry-run mode that reports all link changes without applying them
- A comprehensive link audit before and after
- A rollback script
- Git commit before migration so it's easily revertable

---

## Verification Checklist

- [x] T1: graph.json written with 8 color groups + force tuning
- [x] T2: app.json written with 9 excluded directories
- [x] T3: core-plugins.json updated (random-note: true)
- [x] T4: Sharding assessment complete (recommendation: DEFER)
- [ ] T5: User verification in Obsidian (pending restart)
