# Sprint 1 Implementation Report — Audit Truth + Genuine Content Fixes

**Cycle:** 025 — Codex Reality Reconciliation & Hygiene
**Global Sprint ID:** 41
**Date:** 2026-05-30
**Implementer:** /implement (Claude Opus 4.8)
**Status:** Complete — ready for review

---

## Executive Summary

Sprint 1 makes the codex audit tooling report only genuine issues and closes the
two real content gaps it was masking. The 44 grail token IDs are hand-drawn 1/1s
with no generative trait table by design; the structure and semantic audits were
flagging every one of them, producing **1,146 structure errors** (1,144 false) and
**4 failing semantic checks** (all 4 false). After this sprint:

| Audit | Before | After |
|-------|--------|-------|
| `audit-structure.sh` | 1,146 errors (exit 1) | **0 errors (exit 0)** |
| `audit-semantic.py` | 4 pass / 4 fail (exit 1) | **8 pass / 0 fail (exit 0)** |
| `audit-links.sh` codex-content broken | 8 | **0** (3 framework links remain, out-of-scope) |

The grail exemption is sourced from the canonical `_codex/data/grails.jsonl` (not a
hardcoded list) and **fails loud** (exit 2 + clear message) if that source is missing —
verified by removing the file and confirming both scripts abort rather than silently
re-masking real errors. No grail file was given a fabricated trait table.

---

## AC Verification

Acceptance criteria quoted verbatim from `grimoires/loa/sprint.md` (Sprint 1 §Acceptance Criteria).

1. > `bash _codex/scripts/audit-structure.sh; echo $?` → errors drop to **2** after FR-3 patch, then **0** after FR-4 fixes; exit 0 at 0 errors.

   **✓ Met.** FR-3 patch (grail exemption) brought errors 1,146 → 2; FR-4 (ancestor
   `period_modern`) brought 2 → 0. Final run: `errors: 0, warnings: 0`, exit 0.
   Evidence: `_codex/scripts/audit-structure.sh:25` (`declare -A GRAIL_FILE`),
   `:46-50` (skip in field loop via `${GRAIL_FILE[$(basename "$f")]+x}`),
   `core-lore/ancestors/irish-druids.md:4` + `pythia.md:4`.

2. > `python3 _codex/scripts/audit-semantic.py` → `archetype_enum`, `element_enum`, `drug_references`, `ancestor_references` all report **PASS** (each was a 44-violation FAIL).

   **✓ Met.** All four now PASS; summary `8 pass, 0 fail, 8 total`, exit 0.
   Evidence: `_codex/scripts/audit-semantic.py:137,155,190,215` (`if mid in grail_ids: continue`
   in each of the four checks); wired at `:325,332-336`.

3. > Grail exemption is sourced from `grails.jsonl` (not a hardcoded list); script exits non-zero with a clear message if the jsonl is absent/unreadable.

   **✓ Met.** Both scripts read IDs from `_codex/data/grails.jsonl`.
   Structure: `audit-structure.sh:19-40` (readability guard exit 2 at `:20-24`;
   empty-set guard exit 2 at `:36-40`). Semantic: `audit-semantic.py:94-118`
   (`load_grail_ids()`, `sys.exit(2)` at `:104` and `:117`). Verified by temporarily
   removing the jsonl: structure exit=2, semantic exit=2, both with the abort message;
   file restored and byte-identical afterward.

4. > **No** fake trait tables added to any grail file.

   **✓ Met.** No file under `miberas/` was modified. `git diff --stat` touches only
   the two audit scripts, two ancestor files, `festival-zones-vocabulary.md`, and
   `grails/README.md` — zero grail/mibera entity files.

5. > `bash _codex/scripts/audit-links.sh` → **0** codex-content broken links (3 framework links in `PROCESS.md`/`INSTALLATION.md` remain, documented out-of-scope).

   **✓ Met.** Codex-content broken links: 0. Remaining 3 are framework references
   (`PROCESS.md → docs/architecture/capability-schema.md` ×2,
   `INSTALLATION.md → grimoires/loa/context/CLI-INSTALLATION.md`), out-of-scope per
   PRD §7. The 7 absolute-path links in `festival-zones-vocabulary.md` are now
   relative (`:66,95,124,153,191,192,193`); the `grails/README.md` ellipsis
   placeholder is reworded (`:27-29`).

   *Note:* `audit-links.sh` still exits 1 because of the 3 out-of-scope framework
   links (SDD Open Question Q3). The sprint AC defines success as "0 **codex-content**
   broken," which is met. Whether to add a framework-link allowlist so CI goes green
   is a documented Q3 follow-up, not Sprint 1 scope.

6. > The 4 archetype anchors (`#freetekno`, `#milady`, `#acidhouse`, `#chicagodetroit`) in `archetypes.md` resolve before and after the link edits.

   **✓ Met.** Headings present in `core-lore/archetypes.md`: `## Freetekno` (:22),
   `## Milady` (:65), `## Chicago/Detroit` (:106 → GitHub slug `#chicagodetroit`),
   `## Acidhouse` (:155). Edits changed only the path prefix (`/core-lore/…` →
   `…`), leaving each `#anchor` fragment intact. The link checker strips anchors
   before file resolution (`audit-links.sh:53`), so anchor integrity is unaffected.

---

## Tasks Completed

### Task 1.1 — Grail-exempt `audit-structure.sh` [G-2]
- **File:** `_codex/scripts/audit-structure.sh` (+31 lines)
- **Approach:** Load grail IDs from `grails.jsonl` via `python3` into an associative
  array `GRAIL_FILE` keyed by zero-padded basename (e.g. `0876.md`). Two fail-loud
  guards: unreadable source (`:20-24`, exit 2) and empty ID set (`:36-40`, exit 2).
  In the per-field check loop, skip any file whose basename is a grail
  (`:46-50`, `${GRAIL_FILE[…]+x}` — safe under `set -u`).
- **Why basename, not the existing `grail:` frontmatter key:** AC #3 mandates the
  exemption be *sourced from `grails.jsonl`*, so the set comes from the data file,
  not from inspecting each mibera file.
- **Result:** 26 trait-field checks × 44 grails = 1,144 false errors removed; structure
  errors 1,146 → 2.

### Task 1.2 — Grail-exempt `audit-semantic.py` [G-2]
- **File:** `_codex/scripts/audit-semantic.py` (+78/−26)
- **Approach:** Added `load_grail_ids()` (`:94`) with the same fail-loud contract
  (`sys.exit(2)`). Threaded `grail_ids` into the four enum/reference checks; each skips
  `if mid in grail_ids` and reports an accurate `checked` count (now excludes exempted
  grails rather than overstating `len(miberas)`). `check_element_totals` was **not**
  exempted — it is a 10,000-sum count, not an enum, and grails still belong to the set.
- **Result:** `archetype_enum`, `element_enum`, `drug_references`, `ancestor_references`
  FAIL → PASS; `orphan_traits` stays `status: "info"`; summary 8 pass / 0 fail.

### Task 1.3 — `period_modern` for 2 ancestors [G-3]
- **Files:** `core-lore/ancestors/irish-druids.md:4`, `core-lore/ancestors/pythia.md:4`
- **Approach:** The schema requires a non-null `period_modern` string (`ancestor.schema.json:27`).
  Per SDD Q4 default ("best-fit string from each entry's existing prose") I authored
  editorial values grounded in each file's modern content:
  - **Irish Druids → `2017 - 2024`** — prose cites "The Blindboy Podcast … Launched in
    2017" as the living modern continuation.
  - **Pythia → `2001 - 2024`** — prose cites "modern research suggests the Oracle's
    visions may have been induced by ethylene gas," i.e. the modern geological
    re-examination of Delphi.
  - These are **editorial judgments** (flagged below for reviewer attention) and logged
    in NOTES.md Decision Log.
- **Result:** structure ancestor issues 2 → 0.

### Task 1.4 — Fix `festival-zones-vocabulary.md` absolute links [G-3]
- **File:** `core-lore/festival-zones-vocabulary.md` (7 links, lines 66/95/124/153/191/192/193)
- **Approach:** Repointed absolute paths to relative from `core-lore/`:
  `/core-lore/archetypes.md#x` → `archetypes.md#x`; `/core-lore/ancestors/` → `ancestors/`;
  `/traits/overlays/molecules/` → `../traits/overlays/molecules/`. Anchors preserved.
- **Result:** all 7 resolve; codex-content broken links 8 → 1 (remaining = grails/README, Task 1.5).

### Task 1.5 — Resolve `grails/README.md` flagged link (SDD Q2) [G-3]
- **File:** `grails/README.md:27-29`
- **Approach:** The flagged "link" was the illustrative placeholder `` `![grail](…)` ``;
  the checker's `\[…\]\(([^)]+)\)` regex extracts `…` as a target. Per Q2 ("reword to
  un-parse … do not fabricate a real link") I reworded to `` `![grail]` image markdown ``,
  removing the `](…)` adjacency so the regex no longer matches. Meaning preserved; no
  real link invented. The table-cell example paths (`:22-25`) were never flagged (plain
  code spans, no link syntax) and are untouched.
- **Result:** codex-content broken links → 0.

---

## Technical Highlights

- **Fail-loud, not fail-silent.** Both audit patches treat a missing exemption source
  as fatal (exit 2). This is the anti-recurrence lever: if `grails.jsonl` ever
  disappears, the audit refuses to run rather than silently re-flagging 1,144 grails as
  errors (or, worse, quietly passing). Verified by removal test.
- **Single source of truth.** The same `grails.jsonl` drives both scripts and both used
  the canonical `id` field; the 44-ID set was confirmed to map 1:1 onto zero-padded
  `miberas/NNNN.md` filenames (all 44 resolve, no gaps).
- **Surgical scope.** `git diff --stat`: 6 files, +103/−26. No `@generated:backlinks`
  section touched (grep-verified). No entity/mibera file modified.

---

## Testing Summary

All verification is via the existing audit trio (this is a markdown KB — no app/test suite).

```bash
bash   _codex/scripts/audit-structure.sh ; echo $?   # → 0 errors, exit 0
python3 _codex/scripts/audit-semantic.py ; echo $?    # → 8 pass / 0 fail, exit 0
bash   _codex/scripts/audit-links.sh ; echo $?        # → 0 codex-content broken (exit 1: 3 framework links)
```

Fail-loud regression (run, expect non-zero + abort message, file restored byte-identical):

```bash
mv _codex/data/grails.jsonl /tmp/g.hidden
bash   _codex/scripts/audit-structure.sh ; echo $?    # → exit 2, "grail exemption source not found…"
python3 _codex/scripts/audit-semantic.py ; echo $?    # → exit 2, "grail exemption source not found…"
mv /tmp/g.hidden _codex/data/grails.jsonl
```

---

## Known Limitations

- **`audit-links.sh` exit code (SDD Q3).** Still exits 1 due to 3 out-of-scope framework
  links. Sprint 1 AC is "0 codex-content broken," which is met, but a green CI would need
  a framework-link allowlist — deferred to Q3 follow-up, not this sprint's scope.
- **Editorial `period_modern` values (SDD Q4).** `2017–2024` (Irish Druids) and
  `2001–2024` (Pythia) are best-fit editorial choices grounded in each file's prose, not
  contract-sourced data. Flagged for reviewer/stakeholder confirmation; trivially
  adjustable.

---

## Verification Steps for Reviewer

1. Run the audit trio above; confirm structure exit 0 / semantic 8-pass-0-fail / links 0 codex-content broken.
2. Confirm exemption is data-driven: `grep -n grails.jsonl _codex/scripts/audit-structure.sh _codex/scripts/audit-semantic.py`.
3. Confirm fail-loud: run the regression block; confirm both exit 2.
4. Confirm no grail file fabricated: `git diff --stat` shows no `miberas/` paths.
5. Confirm no protected sections: `git diff -- core-lore grails _codex/scripts | grep '@generated'` → empty.
6. Review the two editorial `period_modern` values for acceptability.
