# SDD: Codex Quality, Maintenance & Future-Proofing

**Cycle:** 021
**Status:** Draft
**Created:** 2026-04-05

---

## 1. Executive Summary

This is a maintenance cycle operating entirely on a markdown knowledge base — no application code, APIs, or deployment infrastructure. The "architecture" is file operations, script fixes, and content edits. The SDD defines: what to fix, in what order, with what approach, and how to validate each fix.

## 2. Work Categories

### Category A: Audit Script Fix (prerequisite — everything else depends on clean audits)

**Problem:** `audit-structure.sh` reports 50 false positive errors for Miberas #0002 and #0219. Both files have complete frontmatter and markdown tables. The script checks for `^| $field |` (single-space padding) via `grep -rL`, but these two files likely have a formatting edge case (different column width, invisible characters, or encoding).

**Approach:**
1. Diff the raw bytes of `miberas/0002.md` vs a known-passing file (e.g., `miberas/0001.md`) to identify the table formatting difference
2. Fix the 2 mibera files if they have genuinely different formatting, OR fix the grep pattern if the regex is too strict
3. Goal: audit reports 0 mibera errors

### Category B: Structural Fixes (real errors remaining after audit fix)

| Fix | Approach |
|-----|----------|
| 5 molecule files missing `origin` | These are conceptual drugs (Ancestral Trance, Euphoria, Sober) and plants (St. John's Wort, Weed) where `origin` doesn't cleanly apply. Remove `origin` from these 5 files' schema expectation, OR add `origin: null` to silence the audit. Recommend: add `origin: null` since the field exists on all other molecules. |
| Buddhist ancestor missing `locations` | Read the file, add appropriate `locations` array based on Buddhist cultural geography (India, Southeast Asia, East Asia, Tibet). |

### Category C: Meta File Reconciliation

All count/description fixes in one pass. Sources of truth: actual file counts on disk.

| File | Fixes Needed |
|------|-------------|
| `manifest.json` | birthday_eras: 11→10; special_collections: 32→33; earrings: 62→63; trait total: recalculate from subcategory sum; oracle description: remove "three internal voices" reference; update all `last_verified` dates |
| `scope.json` | birthday_eras: 11→10; special_collections: 32→33 |
| `llms.txt` | grails: 42→43; add graph.json to data exports; add mibera-sets, vending-machine, fractures mentions; general refresh |
| `SUMMARY.md` | grails.jsonl: 42→43; graph.json stats: update node/edge counts to current (11,475/192,707) |
| `_codex/schema/README.md` | drug count: 79→78; ancestor count: 32→33 |
| `_codex/schema/mibera.schema.json` | Add `F` to swag_rank enum; verify if `Ss`/`Sss` should be in enum (check frontmatter values) |
| `browse/README.md` | Verify era count matches (should say 10) |

**Validation:** After all edits, every numeric claim across meta files matches `find | wc -l` on disk.

### Category D: AI Writing Fixes

| File | Issue | Fix Approach |
|------|-------|-------------|
| `traits/accessories/hats/russian.md` | Broken sentence ("The hat was") + incoherent body | Rewrite Cultural Context using the justification comment (which has the good explanation) |
| `traits/character-traits/tattoos/enso.md` | Empty Cultural Context | Write Cultural Context for Enso circle (Buddhist/Zen symbol) |
| `traits/accessories/glasses/red-sunglasses.md` | "The article explores..." | Rewrite as direct cultural context, not source summary |
| `traits/character-traits/tattoos/straight-edge.md` | "The article explores..." | Rewrite as cultural context |
| `traits/accessories/hats/sudan-sufi.md` | "The article showcases..." | Rewrite as cultural context |
| `traits/character-traits/tattoos/reindeer.md` | Travel blog language | Rewrite to focus on Sami cultural significance |
| `traits/clothing/long-sleeves/cool.md` | WIP placeholder | Write Cultural Context |

**Style guide for rewrites:** Match the codex's best voice (direct, knowledgeable, opinionated, grounded in specific references). No "tapestry of", "testament to", "intersection of", "rich heritage". The justification comments across the codex are the gold standard for tone.

### Category E: Housekeeping

| Task | Approach |
|------|----------|
| `PROCESS.md` broken links | Remove/fix the 4 dead references to Loa framework docs |
| `CONTRIBUTING.md` + `CODEOWNERS` | NOTES.md claims these exist but they were never committed. Create minimal versions. CONTRIBUTING.md: how to add cultural context, submit holder lore, run audits. CODEOWNERS: protect `core-lore/`, `IDENTITY.md`, `oracle/`. |
| CLAUDE.md PyYAML convention | 5 scripts use `import yaml`. Update CLAUDE.md to say "stdlib-only where possible; PyYAML permitted for complex parsing in generator scripts." |
| Script README update | Add `fetch-mibera-images.py` and `fetch-mibera-sets.py` to the scripts README |
| Archive migration scripts | Move 5 one-shot scripts (`add-frontmatter.py`, `add-reveal-timeline.py`, `apply-enrichment.py`, `apply-justifications.py`, `migrate-trait-template.py`) to `_codex/scripts/archive/` |
| Regenerate `stats.md` | Run `generate-stats.py` to refresh the 47-day-stale stats |

### Category F: 20% Creative — Codex Health Report Generator

**Purpose:** A single script that runs all audits and meta-file checks, producing a unified `_codex/reports/health.md` readable at a glance.

**Design:**
- Python, stdlib-only (no PyYAML — this script doesn't need it)
- Runs `audit-structure.sh`, `audit-links.sh`, `audit-semantic.py` and captures their JSON reports
- Performs meta-count reconciliation: for each entity type, compares actual file count vs claims in manifest.json, scope.json, llms.txt, SUMMARY.md
- Checks `last_verified` freshness (flags anything >30 days)
- Outputs a markdown report with: overall health score (% checks passing), breakdown by category, specific discrepancies with file:line references
- Exit code: 0 if healthy, 1 if any errors

**Report structure:**
```markdown
# Codex Health Report
Generated: 2026-04-05

## Overall: 94% healthy (47/50 checks passing)

### Structure Audit: PASS (0 errors)
### Link Audit: WARN (4 broken in PROCESS.md)
### Semantic Audit: PASS (8/8)
### Meta Reconciliation: FAIL (3 mismatches)
  - manifest.json: birthday_eras claims 11, actual 10
  - ...
### Freshness: WARN
  - stats.md: 47 days stale
  - ...
```

## 3. Dependency Order

```
A (audit fix) → B (structural) → C (meta reconciliation) → E (housekeeping)
                                                          → D (writing fixes, parallel with C/E)
                                                          → F (health report, after C since it validates C)
```

Sprint 1 should do A+B+C (get the numbers right). Sprint 2 should do D+E+F (content + tooling).

## 4. Validation Strategy

After all work:
1. `bash _codex/scripts/audit-structure.sh` → 0 errors, 0 warnings
2. `bash _codex/scripts/audit-links.sh` → 0 broken links
3. `python3 _codex/scripts/audit-semantic.py` → 8/8 pass
4. `python3 _codex/scripts/health-report.py` (new) → 100% healthy
5. Manual spot-check: every count in manifest.json matches disk reality

## 5. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Mibera #0002/#0219 audit issue is deeper than formatting | Worst case: fix the audit script's grep pattern to be more flexible |
| Cultural context rewrites might not match codex voice | Use justification comments as tone reference; keep rewrites short and specific |
| Changing CLAUDE.md PyYAML convention might confuse future agents | Be explicit about when PyYAML is OK vs when stdlib regex is preferred |
| Meta count reconciliation touches many files | Do all count fixes in one atomic commit so they're reviewable together |

## 6. Non-Goals

- No new entity types or content categories
- No vending-machine WIP content (needs art/community input)
- No `timeline.json` date verification (needs external research)
- No static site, CI pipeline, or MCP server
- No schema changes beyond fixing the swag_rank enum
