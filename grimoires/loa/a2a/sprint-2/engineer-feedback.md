All good (with noted concerns)

# Senior Tech Lead Review — Sprint 2 (Provenance, Reconciliation, Orphans + E2E)

**Verdict:** APPROVED — concerns below are non-blocking.
**Reviewer:** Senior Tech Lead (/review-sprint)
**Date:** 2026-05-30
**Scope reviewed:** `count-entities.sh` (full), the 4 reconciled docs + 2 untouched, `entity-counts.json`, `orphan-trait-findings.md` — independently re-verified, not trusted from the report.

## Acceptance Criteria — all 6 met (independently verified)

| AC | Verdict | Evidence |
|----|---------|----------|
| `count-entities.sh` valid JSON, matches §0 table | ✓ | re-ran + `python3 -m json.tool` valid; asserted equal to §0 |
| FR-1 counts reconciled, files-vs-concept stated | ✓ | per-item checked; fractures 10, grails 44, traits 1326/1337, special 53/5/33, birthdays 12/10 |
| 0 contradictions across 6 docs | ✓ | cross-doc grep for stale 11/43/32/"4 sub" → empty |
| 20 orphans documented + check stays info | ✓ | 20 table rows; orphan `status: "info"` confirmed |
| no `@generated` edits; protected counts unchanged | ✓ | `grep @generated` (non-grimoires) empty; 10000/10000/44/12/78/78 live-recomputed |
| full audit trio passes | ✓ | structure 0, semantic 8/0, links 0 codex-content |

The AC Verification section in `reviewer.md` is complete, walks every AC verbatim, and cites specific file:line evidence (not vague). Gate satisfied.

## Code Quality
`count-entities.sh` is 59 lines, single linear flow, stdlib only, well-commented, find/ls commands lifted verbatim from the SDD §0 provenance block. No complexity-threshold violations. Doc edits are surgical per-context (+14/−11 across 4 files), no repo-wide `sed`, JSON re-validates. `README.md`/`SUMMARY.md` correctly left untouched (already accurate). No security surface (local file reads only).

## Adversarial Analysis

### Concerns Identified (non-blocking)
1. **`ls <dir>/*.md` under `set -euo pipefail`** (`count-entities.sh:22-24`): if any of `grails/`, `fractures/`, `birthdays/` ever contained zero `.md` files, the glob wouldn't expand, `ls` would error, and pipefail would abort the whole script. Harmless on the populated repo, but a `find … -name '*.md'` form (as used for the other entities) would be more robust. Defensive-coding nit.
2. **Concept constants duplicated** (`count-entities.sh:51-65` and `scope.json`): canonical counts (1337, 44, 33, …) are hardcoded in the provenance script *and* in scope.json. The script is the cited source, so this is acceptable, but the two could drift independently. The script also does not *assert* that its computed `files` matches a `concept` where they should be equal (e.g. `grail_files` vs hardcoded 44) — it would silently emit a divergence rather than fail loud.
3. **`entity-counts.json.generated` timestamp** (`count-entities.sh:39`): every regeneration rewrites the timestamp, so committing the artifact produces a one-line churn diff each run. Consistent with the existing audit-report JSONs, so acceptable, but worth knowing before wiring into CI (SDD Q5 follow-up).

### Assumption Challenged
- **Assumption:** the conceptual counts (1,337 traits / 44 grails / 33 collaborations) are stable constants safe to bake into the script.
- **Risk if wrong:** the script would emit a stale `concept` while `files` drifts, re-introducing exactly the files-vs-concept confusion the cycle exists to kill.
- **Recommendation:** acceptable as-is because `files` IS computed (so disk drift is still caught), and the concept values are genuine project lore. Validated — no change required this cycle.

### Alternative Not Considered
- **Alternative:** emit only computed `files` from the script and source `concept` values from `scope.json` (one home for concepts).
- **Tradeoff:** removes the duplication in concern #2, but adds a parse dependency and a circularity (scope.json is itself reconciled *to* the script's output).
- **Verdict:** current approach is justified — the provenance script should stand alone as the source of truth; scope.json cites it, not the reverse.

## Notable Positive — the orphan investigation
The findings doc goes beyond the AC: it identified the **root cause** that 15/20 "orphans" are false positives of a link-based check (traits are name-assigned, not linked), grounded with per-trait mint counts (1–103 Miberas each). That's a real measurement-bug discovery, correctly scoped as a documented future enhancement rather than a content change (FR-6 is investigation-only). Exactly the right call.

## Documentation Verification: PASS
- No root `CHANGELOG.md` convention (markdown KB). NOTES.md Decision Log carries the cycle's editorial decisions.
- `count-entities.sh` is a new provenance artifact, not a user command/skill — no CLAUDE.md command entry required. (Optional: mention it under Script Conventions in a future pass.)
- Script is self-documenting with a clear header comment.

## Next Steps
Proceed to `/audit-sprint sprint-2`. Concern #1 (ls-glob robustness) is the only item I'd want addressed eventually, and it's non-blocking — the repo dirs are always populated.
