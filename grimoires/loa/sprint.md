# Sprint Plan: Codex Reality Reconciliation & Hygiene

**Version:** 1.0
**Date:** 2026-05-30
**Author:** Sprint Planner Agent
**Cycle:** 025
**PRD Reference:** grimoires/loa/prd.md
**SDD Reference:** grimoires/loa/sdd.md

---

## Executive Summary

This is a **hygiene / data-reconciliation cycle for a markdown knowledge base** — no application, no DB, no API. The work is a bounded set of surgical edits plus two audit-script patches plus one provenance script, verified by re-running the existing audit trio to exact target numbers.

The plan follows the SDD's suggested grouping (sdd.md:347):

- **Sprint 1 (global 41) — Audit Truth + Genuine Content Fixes** (Phases 1–2): patch the audits so they report only real issues, then close the 2 genuine ancestor gaps and fix codex-content broken links. This is the P0 core that unblocks trustworthy audits.
- **Sprint 2 (global 42) — Provenance, Reconciliation, Orphans + E2E** (Phases 3–5): add the count-provenance script, reconcile every canonical doc to computed reality driven by that script, document the 20 orphan traits, and run the final E2E goal-validation gate.

**Total Sprints:** 2
**Sprint Duration:** 2.5 days each
**Estimated Completion:** 2026-06-04

> From sdd.md:347: *"Sprint 1 = Phases 1–2 (audit truth + content fixes, the P0 core). Sprint 2 = Phases 3–4 (provenance + reconciliation + orphan investigation). Phase 5 is the audit gate folded into each sprint's acceptance."*

---

## Sprint Overview

| Sprint | Global ID | Theme | Key Deliverables | Dependencies |
|--------|-----------|-------|------------------|--------------|
| 1 | 41 | Audit Truth + Genuine Content Fixes | Grail-exempt audit patches (structure + semantic); `period_modern` for 2 ancestors; 8 codex-content links fixed | None |
| 2 | 42 | Provenance, Reconciliation, Orphans + E2E | `count-entities.sh` + `entity-counts.json`; 6 canonical docs reconciled; orphan-trait findings doc; E2E goal validation | Sprint 1 (audits must be truthful before reconciliation is verifiable) |

---

## Sprint 1: Audit Truth + Genuine Content Fixes

**Global Sprint ID:** 41
**Scope:** MEDIUM (5 tasks)
**Duration:** 2.5 days
**Dates:** 2026-05-30 – 2026-06-01

### Sprint Goal
Make the audit tooling report only genuine issues (grails exempted) and close the 2 real ancestor gaps plus the 8 codex-content broken links, so `audit-structure.sh` reaches 0 errors and `audit-links.sh` reaches 0 codex-content broken links.

### Deliverables
- [ ] `audit-structure.sh` patched to skip generative-trait checks for the 44 grail IDs, sourced from `_codex/data/grails.jsonl`, fail-loud if the jsonl is missing.
- [ ] `audit-semantic.py` patched to exempt grail IDs from `check_archetype_enum`, `check_element_enum`, `check_drug_references`, `check_ancestor_references`.
- [ ] `core-lore/ancestors/irish-druids.md` and `core-lore/ancestors/pythia.md` each carry a valid `period_modern` frontmatter key.
- [ ] `core-lore/festival-zones-vocabulary.md`: 7 absolute-path links repointed to working relative paths (with verified archetype anchors).
- [ ] `grails/README.md` flagged-link false-positive resolved per SDD Q2 (reword example paths, or document as accepted false positive — no fabricated link).

### Acceptance Criteria
- [ ] `bash _codex/scripts/audit-structure.sh; echo $?` → errors drop to **2** after FR-3 patch, then **0** after FR-4 fixes; exit 0 at 0 errors.
- [ ] `python3 _codex/scripts/audit-semantic.py` → `archetype_enum`, `element_enum`, `drug_references`, `ancestor_references` all report **PASS** (each was a 44-violation FAIL).
- [ ] Grail exemption is sourced from `grails.jsonl` (not a hardcoded list); script exits non-zero with a clear message if the jsonl is absent/unreadable.
- [ ] **No** fake trait tables added to any grail file.
- [ ] `bash _codex/scripts/audit-links.sh` → **0** codex-content broken links (3 framework links in `PROCESS.md`/`INSTALLATION.md` remain, documented out-of-scope).
- [ ] The 4 archetype anchors (`#freetekno`, `#milady`, `#acidhouse`, `#chicagodetroit`) in `archetypes.md` resolve before and after the link edits.

### Technical Tasks

<!-- Annotate each task with contributing goal(s) -->

- [x] Task 1.1: Patch `_codex/scripts/audit-structure.sh` — load `GRAIL_IDS` from `_codex/data/grails.jsonl`; skip the trait-field grep loop (sdd.md:329, audit-structure.sh:33–43) for grail IDs; fail loud (exit non-zero) if the jsonl is missing/unreadable. → **[G-2]**
- [x] Task 1.2: Patch `_codex/scripts/audit-semantic.py` — add `load_grail_ids()`; exempt grail IDs in `check_archetype_enum`/`check_element_enum`/`check_drug_references`/`check_ancestor_references` (sdd.md:330, audit-semantic.py:105–187). Verify structure 1,146 → 2 and semantic 4 FAIL → 4 PASS. → **[G-2]**
- [x] Task 1.3: Add a valid `period_modern` frontmatter key to `core-lore/ancestors/irish-druids.md` and `core-lore/ancestors/pythia.md`, consistent with each entry's content and the ancestor schema (audit checks key presence; per SDD Q4 default to best-fit string from existing prose). Verify structure ancestor issues 2 → 0. → **[G-3]**
- [x] Task 1.4: Repoint the 7 absolute-path links in `core-lore/festival-zones-vocabulary.md` to relative (sdd.md:270–274): `/core-lore/archetypes.md#anchor` → `archetypes.md#anchor`; `/core-lore/ancestors/` → `ancestors/`; `/traits/overlays/molecules/` → `../traits/overlays/molecules/`. Confirm all target anchors resolve. → **[G-3]**
- [x] Task 1.5: Resolve the `grails/README.md` flagged link per SDD Q2/§6.5 — reword the illustrative `…/…webp` example paths so the checker stops parsing them as links (backtick/escape), or accept + document as a known false positive. Do not invent a real link. → **[G-3]**

### Dependencies
- None (first sprint). All inputs (`grails.jsonl`, ancestor files, link targets) exist and were verified in the working tree on 2026-05-29.

### Security Considerations
- **Trust boundaries**: All inputs are local repo files. `grails.jsonl` is generated/trusted; the FR-3 fail-loud requirement guards against a missing exemption source silently re-masking real errors.
- **External dependencies**: None added. Patches stay in-language (bash for structure, Python 3 + existing PyYAML for semantic).
- **Sensitive data**: None. No credentials, PII, or network calls.
- **Zone**: `_codex/scripts/` and codex content are App/State zone (editable with care). `.claude/` is out of bounds. No `@generated:backlinks` section may be touched.

### Risks & Mitigation
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| `grails.jsonl` absent / set-equality breaks at audit time | Low | High | FR-3 fail-loud (exit non-zero + clear message); invariant verified today (44==44, symdiff ∅); wire to jsonl not a hardcoded list (sdd.md §3.2) |
| `festival-zones` anchor edits break valid anchors | Low | Low | All 4 archetype anchors confirmed present in `archetypes.md`; verify with `audit-links.sh` before/after (sdd.md §6.4) |
| `grails/README.md` "broken link" is a false positive | High (confirmed) | Low | It's an illustrative `…/…webp` example; reword or accept per Q2 — do not fabricate a real link (sdd.md §6.5) |
| Orphan check accidentally flipped to FAIL while editing semantic audit | Low | Med | Assert `audit-semantic.py` orphan check stays `status: "info"` (sdd.md:307, line 248) |

### Success Metrics
- `audit-structure.sh` errors: 1,146 → **0** (1,144 grail false positives exempted, 2 ancestor gaps fixed).
- `audit-semantic.py`: 4 pass / 4 fail → **8 pass / 0 fail** (orphan check stays informational).
- `audit-links.sh` codex-content broken links: 8 → **0**.

---

## Sprint 2 (Final): Provenance, Reconciliation, Orphans + E2E

**Global Sprint ID:** 42
**Scope:** MEDIUM (5 tasks)
**Duration:** 2.5 days
**Dates:** 2026-06-02 – 2026-06-04

### Sprint Goal
Establish a script-derived count-provenance artifact, reconcile every canonical doc to computed reality driven by it, document the 20 orphan traits with keep/prune recommendations, and run the end-to-end goal-validation gate confirming all PRD goals are met with no regression.

### Deliverables
- [ ] `_codex/scripts/count-entities.sh` (NEW) emitting authoritative per-entity-type counts.
- [ ] `_codex/data/entity-counts.json` (NEW, generated) matching the SDD §0 computed-reality table.
- [ ] 6 canonical docs reconciled to computed reality: `CLAUDE.md`, `_codex/data/scope.json`, `manifest.json`, `README.md`, `SUMMARY.md`, `llms.txt`.
- [ ] Orphan-trait findings doc: all 20 zero-reference traits listed with path + likely reason + keep/prune recommendation; no deletions.
- [ ] Final audit-trio re-run + `git diff` review confirming no regression and no count contradictions.

### Acceptance Criteria
- [ ] `bash _codex/scripts/count-entities.sh | python3 -m json.tool` → valid JSON matching the SDD §0 computed-reality table (grails 44, fractures 10, birthdays 12 files/10 eras, traits 1326 files / 1337 concept, special collections 53 files / 5 subdirs, drugs 78).
- [ ] FR-1 counts reconciled with the `files` vs `concept` distinction stated explicitly wherever they diverge:
  - [ ] Fractures stated as **10** everywhere (fix `CLAUDE.md` "11").
  - [ ] Grails stated as **44** everywhere (fix `CLAUDE.md` dir-table "43").
  - [ ] Birthdays state **10 eras / 12 files** (10 eras + README + timeline).
  - [ ] Traits state **1,337 unique (1,323 imaged + 14 metadata-only) / 1,326 files** — do not hardcode the 1,245 audit-subset.
  - [ ] Special collections state **53 files / 5 sub-collections** while keeping the "33 documented collaborations" concept distinct.
  - [ ] Drugs confirmed **78** (verify-only).
- [ ] No count contradiction remains across the 6 canonical docs (manual diff vs `entity-counts.json`).
- [ ] All 20 orphan traits listed (paths in sdd.md §11 Appendix A) with path + likely reason + keep/prune rec; orphan check remains `status: "info"`.
- [ ] No count edit falls inside a `@generated:backlinks` section; 10K Miberas / 10K MiParcels / 44 grails / 12 sets / 78 drugs / 78 tarot counts unchanged (G5).
- [ ] Full audit trio passes: `audit-structure.sh` 0 errors, `audit-semantic.py` 8 pass / 0 fail, `audit-links.sh` 0 codex-content broken links.

### Technical Tasks

- [x] Task 2.1: Write `_codex/scripts/count-entities.sh` (bash, stdlib only) emitting `_codex/data/entity-counts.json` per SDD §3.1, using the `find`/`wc`/`ls` commands in sdd.md:32–47. Each entity carries a `files` value and, where they differ, a `concept`/`eras`/`subcollections` value + `note`. Verify against the §0 table. → **[G-1, G-2]**
- [x] Task 2.2: Reconcile counts in all 6 canonical docs (`CLAUDE.md` lines 52/80/85/90, `_codex/data/scope.json`, `manifest.json`, `README.md`, `SUMMARY.md`, `llms.txt`), driven by `entity-counts.json` not eyeballing. Use surgical per-context Edit-tool replacements only — never repo-wide `sed` (sdd.md §6.1). Preserve both `files: 53`/`subcollections: 5` and the conceptual "33 documented collaborations" note in `scope.json` (sdd.md:362). → **[G-1, G-5]**
- [x] Task 2.3: Author the orphan-trait findings doc — list all 20 orphans (sdd.md §11 Appendix A paths) with path + likely reason (legit-unused variant/plain catalog entry vs erroneous duplicate) + keep/prune recommendation. Make **no** deletions; confirm orphan check stays `info` (FR-6). → **[G-4]**
- [x] Task 2.4: No-regression sweep — `git diff --stat` review; grep that no `@generated` section was edited; confirm entity counts 10K/10K/44/12/78/78 unchanged (G5). → **[G-5]**
- [x] Task 2.E2E: **End-to-End Goal Validation** (see below). → **[G-1, G-2, G-3, G-4, G-5]**

### Task 2.E2E: End-to-End Goal Validation

**Priority:** P0 (Must Complete)
**Goal Contribution:** All goals (G-1 … G-5)

**Description:**
Validate that all PRD goals are achieved through the complete implementation, by re-running the audit trio to the SDD §7.3 target ledger and diffing the canonical docs against `entity-counts.json`.

**Validation Steps:**

| Goal ID | Goal | Validation Action | Expected Result |
|---------|------|-------------------|-----------------|
| G-1 | Canonical docs match repo reality | Manual diff of all 6 docs against `_codex/data/entity-counts.json` | No count contradiction; file-vs-concept distinction stated wherever they diverge |
| G-2 | Audit tooling reports only genuine issues | `bash audit-structure.sh`; `python3 audit-semantic.py` | structure errors → 0 (grails exempted); archetype/element/drug/ancestor → PASS |
| G-3 | Genuine content errors fixed | `bash audit-structure.sh` (ancestor); `bash audit-links.sh` | ancestor gaps 2 → 0; codex-content broken links → 0 |
| G-4 | Orphan-trait status understood | Findings doc present | 20 orphans listed with reason + keep/prune rec; no silent deletion |
| G-5 | No regression | `git diff --stat`; grep `@generated`; entity-count check | 10K/10K/44/12/78 counts unchanged; no backlink-section edits; valid links still resolve |

**Acceptance Criteria:**
- [ ] Each goal validated with documented evidence (command output / diff captured).
- [ ] Integration points verified: `entity-counts.json` → reconciled docs flows end-to-end; grail exemption flows from `grails.jsonl` into both audit scripts.
- [ ] No goal marked "not achieved" without explicit justification.

### Dependencies
- Sprint 1: the audit scripts must be truthful (grail-exempt) before reconciliation correctness can be verified against clean audit output. FR-2's `entity-counts.json` is the input that drives FR-1 (Task 2.2 depends on Task 2.1).

### Security Considerations
- **Trust boundaries**: All local files. `count-entities.sh` reads only repo contents; no untrusted input.
- **External dependencies**: None. `count-entities.sh` is bash stdlib (`find`/`wc`/`ls`/`printf`).
- **Sensitive data**: None.
- **Zone**: Edits confined to `_codex/` and repo-root canonical docs + codex content. `.claude/` out of bounds. No `@generated:backlinks` edits.

### Risks & Mitigation
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Bulk count replacement hits unrelated content (image filenames, trait names) | Med | High | Surgical per-context Edit-tool replacements only, never repo-wide `sed`; `git diff` review (sdd.md §6.1) |
| PRD count figures are stale (traits 1245, birthdays 11, special-coll 6) | High (confirmed) | High | Reconcile to SDD §0 computed reality (1326/12/5), not PRD figures; `entity-counts.json` is the single source |
| Editing `scope.json` special_collection count 33→53 erases the concept | Med | Med | Keep BOTH `files: 53`/`subcollections: 5` AND the "33 documented collaborations" note (sdd.md:362) |
| Orphan check flipped to FAIL | Low | Med | Assert it stays `status: "info"` (sdd.md §7.2) |

### Success Metrics
- `entity-counts.json` valid JSON, matches §0 table for all 11 entity types.
- 0 count contradictions across the 6 canonical docs.
- 20/20 orphan traits documented with keep/prune recommendations.
- Final audit trio: structure 0 errors, semantic 8 pass / 0 fail, links 0 codex-content broken.
- `git diff` shows no `@generated` edits and no change to the protected counts.

---

## Risk Register

| ID | Risk | Sprint | Probability | Impact | Mitigation | Owner |
|----|------|--------|-------------|--------|------------|-------|
| R1 | `grails.jsonl` absent / set-equality breaks | 1 | Low | High | FR-3 fail-loud; invariant verified (symdiff ∅); jsonl-sourced exemption | Maintainer |
| R2 | `festival-zones` anchor edits break valid anchors | 1 | Low | Low | Anchors confirmed; `audit-links.sh` before/after | Maintainer |
| R3 | `grails/README.md` flagged link is a false positive | 1 | High | Low | Reword or accept per Q2; no fabricated link | Maintainer |
| R4 | Bulk count replacement hits unrelated content | 2 | Med | High | Surgical per-context edits; `git diff` review | Maintainer |
| R5 | Reconcile to stale PRD figures (1245/11/6) | 2 | High | High | Use SDD §0 computed reality; `entity-counts.json` source | Maintainer |
| R6 | `scope.json` special-collections concept overwritten by file count | 2 | Med | Med | Keep both files-count and concept note | Maintainer |
| R7 | Orphan check flipped to FAIL | 1–2 | Low | Med | Assert orphan check stays `info` | Maintainer |

---

## Success Metrics Summary

| Metric | Target | Measurement Method | Sprint |
|--------|--------|-------------------|--------|
| `audit-structure.sh` errors | 0 | `bash _codex/scripts/audit-structure.sh; echo $?` | 1 |
| `audit-semantic.py` summary | 8 pass / 0 fail (orphan info) | `python3 _codex/scripts/audit-semantic.py` | 1 |
| `audit-links.sh` codex-content broken | 0 | `bash _codex/scripts/audit-links.sh` | 1 |
| `entity-counts.json` validity | valid JSON, matches §0 table | `count-entities.sh \| python3 -m json.tool` | 2 |
| Doc count contradictions | 0 | Manual diff of 6 docs vs `entity-counts.json` | 2 |
| Orphan traits documented | 20/20 with keep/prune rec | Findings doc review | 2 |
| No regression | protected counts + `@generated` unchanged | `git diff --stat`; grep `@generated` | 2 |

---

## Dependencies Map

```
Sprint 1 (41) ──────────────▶ Sprint 2 (42)
   │                              │
   ├─ FR-3 audit grail exemption  ├─ FR-2 count-entities.sh + entity-counts.json
   ├─ FR-4 ancestor period_modern ├─ FR-1 reconcile 6 canonical docs (driven by FR-2)
   └─ FR-5 codex-content links    ├─ FR-6 orphan-trait findings
                                  └─ E2E goal validation + no-regression gate
```

---

## Appendix

### A. PRD Feature Mapping

| PRD Feature (FR) | Sprint | Status |
|------------------|--------|--------|
| FR-3 Grail audit exemption | Sprint 1 | Planned |
| FR-4 Ancestor `period_modern` gaps | Sprint 1 | Planned |
| FR-5 Codex-content broken links | Sprint 1 | Planned |
| FR-2 Count provenance | Sprint 2 | Planned |
| FR-1 Doc count reconciliation | Sprint 2 | Planned |
| FR-6 Orphan-trait investigation | Sprint 2 | Planned |

### B. SDD Component Mapping

| SDD Component | Sprint | Status |
|---------------|--------|--------|
| `audit-structure.sh` patch (grail skip + fail-loud) | Sprint 1 | Planned |
| `audit-semantic.py` patch (grail exemption in 4 checks) | Sprint 1 | Planned |
| `irish-druids.md` + `pythia.md` `period_modern` | Sprint 1 | Planned |
| `festival-zones-vocabulary.md` 7 abs→rel links | Sprint 1 | Planned |
| `grails/README.md` example-path reword (Q2) | Sprint 1 | Planned |
| `count-entities.sh` + `entity-counts.json` (NEW) | Sprint 2 | Planned |
| 6 canonical docs reconciliation | Sprint 2 | Planned |
| Orphan-trait findings doc (NEW) | Sprint 2 | Planned |

### C. PRD Goal Mapping

| Goal ID | Goal Description | Contributing Tasks | Validation Task |
|---------|------------------|--------------------|-----------------|
| G-1 | Canonical docs match repo reality | Sprint 2: Task 2.1, Task 2.2 | Sprint 2: Task 2.E2E |
| G-2 | Audit tooling reports only genuine issues | Sprint 1: Task 1.1, Task 1.2; Sprint 2: Task 2.1 | Sprint 2: Task 2.E2E |
| G-3 | Genuine content errors fixed | Sprint 1: Task 1.3, Task 1.4, Task 1.5 | Sprint 2: Task 2.E2E |
| G-4 | Orphan-trait status understood | Sprint 2: Task 2.3 | Sprint 2: Task 2.E2E |
| G-5 | No regression | Sprint 2: Task 2.2, Task 2.4 | Sprint 2: Task 2.E2E |

**Goal Coverage Check:**
- [x] All PRD goals (G-1…G-5) have at least one contributing task.
- [x] All goals have a validation task in the final sprint (Task 2.E2E).
- [x] No orphan tasks (every task contributes to ≥1 goal).

**Per-Sprint Goal Contribution:**

Sprint 1 (41): G-2 (audit truth via grail exemption), G-3 (ancestor + link content fixes).
Sprint 2 (42): G-1 (docs reconciled), G-2 (provenance backstop), G-4 (orphans documented), G-5 (no-regression), + E2E validation of all goals.

---

*Generated by Sprint Planner Agent — cycle-025, codebase-grounded against grimoires/loa/prd.md + grimoires/loa/sdd.md.*
