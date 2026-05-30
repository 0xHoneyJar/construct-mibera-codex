# Sprint 2 Implementation Report — Provenance, Reconciliation, Orphans + E2E

**Cycle:** 025 — Codex Reality Reconciliation & Hygiene
**Global Sprint ID:** 42 (final)
**Date:** 2026-05-30
**Implementer:** /implement (Claude Opus 4.8)
**Status:** Complete — ready for review

---

## Executive Summary

Sprint 2 establishes a script-derived count-provenance artifact, reconciles every
canonical doc to computed reality driven by it, documents the 20 orphan traits,
and runs the end-to-end goal-validation gate. The cycle's chronic bug —
conflating "files on disk" with "conceptual entity count" — is now killed at the
source: `count-entities.sh` emits both `files` and `concept`, and every doc that
diverges now states which it means.

The most valuable discovery: **15 of the 20 "orphan" traits are actually minted**
(assigned to 1–103 Miberas each); they only looked orphaned because the orphan
check counts markdown-*links* while Mibera tables assign traits by *name*. Full
analysis in `orphan-trait-findings.md`.

| Goal | Result |
|------|--------|
| Count provenance artifact | `count-entities.sh` → `entity-counts.json`, valid JSON, matches §0 table |
| 6 canonical docs reconciled | 0 count contradictions; file-vs-concept stated where they diverge |
| Orphan investigation | 20 documented with mint counts + keep/prune rec; no deletions |
| Audit trio | structure 0 / semantic 8-pass-0-fail / links 0 codex-content broken |
| No regression | protected counts unchanged; no `@generated` edits; all JSON valid |

---

## AC Verification

Acceptance criteria quoted verbatim from `grimoires/loa/sprint.md` (Sprint 2 §Acceptance Criteria).

1. > `bash _codex/scripts/count-entities.sh | python3 -m json.tool` → valid JSON matching the SDD §0 computed-reality table (grails 44, fractures 10, birthdays 12 files/10 eras, traits 1326 files / 1337 concept, special collections 53 files / 5 subdirs, drugs 78).

   **✓ Met.** Script emits valid JSON; every value asserted against the §0 table
   (grail 44/44, fracture 10/10, birthday 12 files/10 eras, trait 1326 files/1337
   concept, special 53 files/5 subdirs/33 concept, drug 78/78, tarot 78, ancestor 33,
   mibera/miparcel 10000, set 12). Evidence: `_codex/scripts/count-entities.sh:24-37`
   (find/wc/ls from §0), `:48-66` (JSON shape from §3.1); output at
   `_codex/data/entity-counts.json`.

2. > FR-1 counts reconciled with the `files` vs `concept` distinction stated explicitly wherever they diverge: [Fractures 10 everywhere; Grails 44 everywhere; Birthdays 10 eras/12 files; Traits 1,337 unique (1,323 imaged + 14 metadata-only)/1,326 files; Special collections 53 files/5 sub-collections + 33 concept; Drugs 78.]

   **✓ Met, each sub-item:**
   - **Fractures 10 everywhere** — `CLAUDE.md:52` ("10 Fractures"), `CLAUDE.md:88`
     (dir-table 11→10), `llms.txt:27` + `:87` (11→10). README already 10. scope.json
     already 10.
   - **Grails 44 everywhere** — `CLAUDE.md:85` (dir-table 43→44). Scope §52/scope.json/
     manifest/README/llms already 44.
   - **Birthdays 10 eras / 12 files** — `CLAUDE.md:83` ("10 eras (12 files)").
   - **Traits 1,337 unique / 1,326 files** — `CLAUDE.md:52` ("1,326 files"),
     `CLAUDE.md:80` ("1,326 files (1,337 unique)"), `scope.json:19-21` (`files:1326` +
     note). Did **not** hardcode the 1,245 audit-subset.
   - **Special collections 53 files / 5 sub-collections + 33 concept** —
     `scope.json:42-46` (`count:33`, `files:53`, `subcollections:5`, note keeps both),
     `manifest.json:93` (5 subdirs + 53 files), `CLAUDE.md:52` + `:90`.
   - **Drugs 78** — verify-only; unchanged everywhere.

3. > No count contradiction remains across the 6 canonical docs (manual diff vs `entity-counts.json`).

   **✓ Met.** Cross-doc grep confirms a single value per entity: fractures = "10"
   everywhere, grails = "44" everywhere. No stale "11 fractures" / "43 grails" /
   "4 sub-collections" / "32 special" remain (grep returned none).

4. > All 20 orphan traits listed (paths in sdd.md §11 Appendix A) with path + likely reason + keep/prune rec; orphan check remains `status: "info"`.

   **✓ Met.** `grimoires/loa/a2a/sprint-2/orphan-trait-findings.md` lists all 20 with
   path, mint count, reason, and keep/prune recommendation. Orphan check confirmed
   `status: "info"` (`audit-semantic.py` output: `ℹ orphan_traits: 20 orphans found`).

5. > No count edit falls inside a `@generated:backlinks` section; 10K Miberas / 10K MiParcels / 44 grails / 12 sets / 78 drugs / 78 tarot counts unchanged (G5).

   **✓ Met.** `git diff -- . ':(exclude)grimoires/**' | grep @generated` → empty (zero
   marker lines in any content file). Live recompute: miberas 10000, miparcels 10000,
   grails 44, sets 12, drugs 78, tarot 78 — all unchanged.

6. > Full audit trio passes: `audit-structure.sh` 0 errors, `audit-semantic.py` 8 pass / 0 fail, `audit-links.sh` 0 codex-content broken links.

   **✓ Met.** structure exit 0 (0 errors); semantic `8 pass, 0 fail`; links 0
   codex-content broken (3 framework links out-of-scope, exit 1).

---

## Tasks Completed

### Task 2.1 — `count-entities.sh` + `entity-counts.json` [G-1, G-2]
- **Files:** `_codex/scripts/count-entities.sh` (NEW, +66), `_codex/data/entity-counts.json` (NEW, generated)
- **Approach:** bash stdlib only (find/wc/ls/printf), commands lifted verbatim from
  sdd.md §0. Emits the §3.1 JSON shape with `files` (computed) and `concept`/`eras`/
  `subcollections` (canonical) + a `note` wherever they diverge. Writes to disk and
  stdout.
- **Verify:** `bash count-entities.sh | python3 -m json.tool` → valid; asserted equal to §0 table.

### Task 2.2 — Reconcile 6 canonical docs [G-1, G-5]
- **Files:** `CLAUDE.md` (scope §52 + 5 dir-table rows), `_codex/data/scope.json`
  (trait + special_collection entries), `manifest.json` (special_collection note),
  `llms.txt` (2 fracture lines). `README.md` + `SUMMARY.md` already correct — untouched.
- **Approach:** surgical per-context Edit-tool replacements only — never repo-wide `sed`
  (SDD §6.1). Each divergence states files-vs-concept (e.g. dir-table traits
  "1,326 files (1,337 unique)"; special-collections "53 files (5 sub-collections)").
  scope.json keeps `count:33` AND adds `files:53`/`subcollections:5` (SDD §362).
- **Verify:** all three JSON files re-validate; cross-doc grep shows 0 contradictions.

### Task 2.3 — Orphan-trait findings doc [G-4]
- **File:** `grimoires/loa/a2a/sprint-2/orphan-trait-findings.md` (NEW)
- **Approach:** investigated each orphan's mint count via the canonical frontmatter
  trait assignment (`grep -ril '<field>: <Name>' miberas/`). **Root cause found:**
  `check_orphan_traits` counts only markdown-link references, so 15 minted-but-name-
  referenced traits are flagged falsely. No deletions (FR-6).
- **Verify:** 20 rows with path + reason + keep/prune; orphan check stays `info`.

### Task 2.4 + 2.E2E — No-regression sweep + goal validation [G-5, all]
- Audit trio green; no `@generated` edits in content files; protected counts unchanged;
  all JSON valid; `entity-counts.json` regenerates identically. E2E table below.

---

## Task 2.E2E — End-to-End Goal Validation

| Goal | Validation Action | Expected | Result |
|------|-------------------|----------|--------|
| **G-1** Docs match repo reality | diff 6 docs vs `entity-counts.json` | no contradiction; file-vs-concept stated | ✓ 0 contradictions; divergences annotated |
| **G-2** Audit tooling truthful | structure + semantic + count provenance | structure 0; enums PASS; counts script-derived | ✓ structure 0, semantic 8/0, `entity-counts.json` live |
| **G-3** Genuine content fixed | ancestor + links (Sprint 1) | ancestor 2→0; codex-content links 0 | ✓ (Sprint 1, re-verified green) |
| **G-4** Orphan status understood | findings doc | 20 listed + reason + rec; no silent deletion | ✓ + root-cause (link-coverage artifact) |
| **G-5** No regression | git diff; `@generated` grep; count check | protected counts unchanged; no backlink edits | ✓ all unchanged |

Integration points verified end-to-end: `entity-counts.json` → reconciled docs
(counts now trace to the script, not eyeballing); grail exemption flows from
`grails.jsonl` into both audit scripts (Sprint 1). No goal marked "not achieved."

---

## Technical Highlights

- **The files-vs-concept split is now enforced, not just documented.** `count-entities.sh`
  is the single source; every divergent doc count states which number it means. This is
  the anti-recurrence lever — future drift is a one-command diff away from detection.
- **Orphan investigation surfaced a real measurement bug.** The orphan metric over-reports
  by ~15 because it's link-based while traits are name-assigned. Documented as a future
  enhancement (not changed this cycle — FR-6 is investigation-only).
- **Surgical:** 4 docs edited (+14/−11), 3 new files. No `@generated` edits, no entity
  files touched, no repo-wide substitution.

---

## Testing Summary

```bash
bash    _codex/scripts/count-entities.sh | python3 -m json.tool   # valid JSON, matches §0
bash    _codex/scripts/audit-structure.sh ; echo $?               # 0 errors, exit 0
python3 _codex/scripts/audit-semantic.py ; echo $?                # 8 pass / 0 fail, exit 0
bash    _codex/scripts/audit-links.sh                             # 0 codex-content broken
git diff -- . ':(exclude)grimoires/**' | grep @generated          # empty (no backlink edits)
```

---

## Known Limitations

- **Orphan check link-coverage (documented, not fixed).** `check_orphan_traits` counts only
  markdown-link references; extending it to count frontmatter/plain-text assignments would
  drop the false-orphan count from 20 to ~5. Out of FR-6 scope (investigation-only).
- **`count-entities.sh` is standalone** (SDD Q5 default) — not yet wired into CI. Proposed as
  a follow-up in the cycle retrospective so counts re-check automatically.
- **`audit-links.sh` exit 1** from 3 out-of-scope framework links (carried from Sprint 1; SDD Q3).

## Verification Steps for Reviewer

1. Run the four commands above; confirm provenance valid, audit trio green, no `@generated` edits.
2. `python3 -m json.tool _codex/data/scope.json` / `manifest.json` — confirm valid + `files`/`subcollections` present on special_collection.
3. Cross-doc grep: `grep -rniE '11 fracture|43 grail|4 sub-collection' CLAUDE.md llms.txt manifest.json scope.json README.md` → empty.
4. Read `orphan-trait-findings.md` — confirm 20 rows, mint counts, keep/prune recs, no deletions.
