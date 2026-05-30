# PRD: Codex Reality Reconciliation & Hygiene

**Cycle:** 025
**Created:** 2026-05-29
**Stakeholder:** gumi (henlogumibera) — codex maintainer
**Source artifacts:** live audit runs (`audit-structure.sh`, `audit-links.sh`, `audit-semantic.py`), `CLAUDE.md`, `_codex/data/scope.json`, `_codex/data/grails.jsonl`, direct repo inspection
**Discovery method:** /discovering-requirements — codebase-grounded via native audit tooling (no /ride), 5 scope gates

---

## 1. Problem

The Mibera Codex's canonical documentation has drifted from the repository's actual state, and its audit tooling reports a large but mostly-false error count that hides the genuine issues.

**Two distinct problems:**

1. **Docs ≠ reality.** The codex's own description files disagree with each other and with the repo. Examples found during discovery:
   - `CLAUDE.md` self-contradicts: scope section says "44 Grails" while the directory-layout table says "43."
   - `CLAUDE.md` says "11 Fractures"; reality and `scope.json` agree on **10** (`fractures/` has 10 entity files).
   - Birthdays: docs say "10 eras" but `birthdays/` holds **11** files.
   - Traits: docs say "1,337"; the actual trait-file count is **~1,326** (the "1,245" the structure audit reports is an audit-subset, not the file total). 1,337 is a conceptual "1,323 with images + 14 metadata-only" count per `scope.json` — the file-vs-concept distinction is undocumented and the authoritative file count must be script-derived (FR-2).
   - Special collections: `scope.json` says 33, `CLAUDE.md` says 32; **53** files exist across **5** sub-collections (`bera-eco`, `bong-bears`, `cypherpunk-floppies`, `milady-1-of-1s`, `singapore-jani`).

2. **Audit noise masks real signal.** `audit-structure.sh` reports **1,146 errors** and `audit-semantic.py` reports **4 enum failures** — but **1,144 + all 4** are the **44 grail token IDs**, which are 1/1 hand-drawn art and *correctly* have no generative trait table. The audit scripts don't exempt them. The genuine structural error count is **2**.

> **Sources:** `audit-structure.json` (1,146 errors; `by_type.mibera=1144`, `by_type.ancestor=2`), `audit-semantic.json` (4 FAIL: archetype/element/drug/ancestor enum), verified grail-ID match (the 44 missing-table mibera IDs == the 44 IDs in `_codex/data/grails.jsonl`, exact match), `scope.json:1–60`, `CLAUDE.md` scope + directory-layout sections.

---

## 2. Vision

Every canonical doc states a number that matches the repo, every reported audit error is a real one, and a maintainer can trust `audit-*` output at a glance. The codex is "clean and organized as intended" — and provably so, because the tooling that proves it no longer cries wolf.

> **Sources:** Phase 1 stakeholder goal ("make sure all the docs reflect the reality of the codex, and also go thru and make sure the codex itself is clean/organized as intended").

---

## 3. Goals & Success Metrics

| ID | Goal | Measurement | Validation |
|----|------|-------------|------------|
| G1 | Canonical docs match repo reality | Every entity count in `CLAUDE.md`, `scope.json`, `manifest.json`, `README.md`, `SUMMARY.md`, `llms.txt` matches computed reality (or states a documented file-vs-concept distinction) | Manual diff against a generated counts table; no remaining contradictions |
| G2 | Audit tooling reports only genuine issues | `audit-structure.sh` error count drops from 1,146 → **2**; `audit-semantic.py` archetype/element/drug/ancestor checks PASS after grail exemption | Re-run audits; confirm grails excluded, real issues remain visible |
| G3 | Genuine content errors fixed | 2 ancestor `period_modern` gaps closed; codex-content broken links resolved | `audit-structure.sh` → 0 errors; `audit-links.sh` → 0 codex-content broken links |
| G4 | Orphan-trait status understood | The 20 zero-reference traits documented with context + a keep/prune recommendation | Findings doc exists; no silent deletion |
| G5 | No regression | Mibera/parcel/grail entity counts unchanged; no backlink sections touched; existing valid links still resolve | Audit counts stable; `git diff` review |

> **Sources:** derived from Phase-2 scope gates (remediate / fix-scripts / reality-wins / investigate-orphans).

---

## 4. Users & Stakeholders

| Persona | Need | Current state | Future state |
|---------|------|---------------|--------------|
| **Codex maintainer (gumi)** | Trust the audits; keep docs honest | 1,146-error wall of false positives; contradictory counts | 2 real errors surfaced cleanly; docs match repo |
| **AI / LLM consumer** | Accurate counts from `llms.txt`, `scope.json`, `manifest.json` to reason about the codex | Drifted counts mislead | Counts authoritative |
| **Contributor** | Run audits in CI / pre-PR and get a true pass/fail | False positives make red builds meaningless | Audit red == real problem |

> **Sources:** `CLAUDE.md` (consumption is GitHub + LLMs/AI); audit scripts exit non-zero on error (CI gate intent per `codex-improvement-research.md:147–149`).

---

## 5. Functional Requirements

### FR-1 — Reconcile entity counts across all canonical docs · **Must**
Update every count to computed reality, preserving conceptual-vs-file distinctions explicitly.

**Acceptance criteria:**
- [ ] Fractures stated as **10** everywhere (fix `CLAUDE.md` "11").
- [ ] Grails stated as **44** everywhere (fix `CLAUDE.md` directory-table "43"; reconcile with scope "44").
- [ ] Birthdays state **11 files / 10 eras** (or explain the 11th).
- [ ] Traits state the conceptual count (**1,337 unique** = 1,323 imaged + 14 metadata-only) and the **authoritative file count from FR-2's script** (~1,326) distinctly — do not hardcode the 1,245 audit-subset.
- [ ] Special collections state **53 files across 5 sub-collections** (vs the "33 documented collaborations" concept).
- [ ] Drugs confirmed **78** (verify-only — already correct; `drug-pairings.md` + `README.md` are non-drug files).
- [ ] Files updated: `CLAUDE.md`, `_codex/data/scope.json`, `manifest.json`, `README.md`, `SUMMARY.md`, `llms.txt`.

**Dependencies:** a single computed counts source (see FR-2).

### FR-2 — Establish a count provenance step so drift can't silently recur · **Should**
Provide a generated counts artifact (or extend an existing generator/audit) so docs cite computed values rather than hand-maintained ones.

**Acceptance criteria:**
- [ ] A script (or extended audit) emits authoritative per-entity-type counts.
- [ ] The reconciliation in FR-1 is driven by that output, not eyeballing.

### FR-3 — Exempt grails from generative-trait audits · **Must**
Patch `_codex/scripts/audit-structure.sh` and `_codex/scripts/audit-semantic.py` to recognize grail token IDs (source: `_codex/data/grails.jsonl`) and skip archetype/ancestor/drug/element/etc. checks for them.

**Acceptance criteria:**
- [ ] `audit-structure.sh` total errors: 1,146 → **2**.
- [ ] `audit-semantic.py` archetype/element/drug/ancestor checks PASS (no grail violations).
- [ ] Grail exemption sourced from `grails.jsonl` (not a hardcoded list that can drift).
- [ ] **Do NOT** add fake trait tables to grail files.

### FR-4 — Fix the 2 genuine ancestor gaps · **Must**
Add the missing `period_modern` YAML field to `core-lore/ancestors/irish-druids.md` and `core-lore/ancestors/pythia.md`.

**Acceptance criteria:**
- [ ] Both files have a valid `period_modern` value consistent with ancestor-schema and the entries' content.
- [ ] `audit-structure.sh` ancestor issues: 2 → 0.

### FR-5 — Fix codex-content broken links · **Must**
Resolve the broken links that live in codex content.

**Acceptance criteria:**
- [ ] `core-lore/festival-zones-vocabulary.md`: 7 absolute-path links (`/core-lore/...`, `/traits/...`) converted to working relative paths (incl. correct archetype anchors).
- [ ] `grails/README.md`: 1 broken link fixed.
- [ ] `audit-links.sh` reports 0 broken links within codex content.

### FR-6 — Investigate the 20 orphan traits · **Must (investigate), No-decision (disposition)**
Document each zero-reference trait with context; recommend keep vs prune; make **no** deletions this cycle.

**Acceptance criteria:**
- [ ] All 20 orphans listed with path + likely reason (legit-unused catalog entry vs erroneous/duplicate).
- [ ] A keep/prune recommendation per orphan.
- [ ] `audit-semantic.py` orphan check remains **informational** (not a hard FAIL).

> **Sources:** all FRs grounded in §1 audit findings + Phase-2 scope gates.

---

## 6. Non-Functional Requirements

- **Safety:** Never edit `@generated` backlink sections. Never hallucinate trait values (`CLAUDE.md` safety rules). Never add trait tables to grails.
- **Zone:** `_codex/scripts/` and codex content are App/State zone (editable with care). `.claude/` is System Zone — out of bounds.
- **Determinism:** Count reconciliation must be reproducible from a script, not manual.
- **Performance:** Audit scripts must remain batch-grep fast (no per-file regression).

> **Sources:** `CLAUDE.md` Safety Rules + Script Conventions; `zone-system.md`.

---

## 7. Scope & Prioritization

### In scope
- FR-1 (doc count reconciliation), FR-3 (grail audit exemption), FR-4 (ancestor gaps), FR-5 (codex-content links) — all **P0**.
- FR-2 (count provenance) — **P1**.
- FR-6 (orphan investigation, no disposition) — **P1**.

### Explicitly out of scope
- **3 framework-template broken links** in `PROCESS.md` / `INSTALLATION.md` (Loa template leftovers, not codex content) — Reason: framework docs, not codex; lower value.
- **Pruning/deleting orphan traits** — Reason: deferred per stakeholder (investigate only).
- **Subfolder sharding of `miberas/`/`miparcels/`** — Reason: not part of this cleanup; high blast radius.
- **Any `.claude/` edits** — Reason: System Zone.
- **New features, lore expansion, schema redesign** — Reason: this is a hygiene cycle.

### Priority matrix
| Requirement | Priority | Effort | Impact |
|-------------|----------|--------|--------|
| FR-3 grail audit exemption | P0 | S | High (unblocks trustworthy audits) |
| FR-1 doc reconciliation | P0 | M | High |
| FR-4 ancestor gaps | P0 | S | Med |
| FR-5 codex links | P0 | S | Med |
| FR-2 count provenance | P1 | M | Med (prevents recurrence) |
| FR-6 orphan investigation | P1 | S | Low-Med |

---

## 8. Success Criteria

- [ ] `bash _codex/scripts/audit-structure.sh` → **0 errors** (after FR-3 exemption + FR-4 fixes).
- [ ] `bash _codex/scripts/audit-links.sh` → **0** codex-content broken links.
- [ ] `python3 _codex/scripts/audit-semantic.py` → archetype/element/drug/ancestor PASS; orphan check informational.
- [ ] No count contradiction remains across the 6 canonical docs.
- [ ] Orphan-trait findings documented with recommendations.
- [ ] `git diff` shows no changes to entity counts (10K/10K/44/12…), no `@generated` edits.

---

## 9. Risks & Mitigation

| Risk | Prob | Impact | Mitigation |
|------|------|--------|------------|
| Grail-ID source unavailable at audit time | Low | High | `_codex/data/grails.jsonl` exists and is generated; wire exemption to it; fail loud if absent |
| "Reality" count itself is wrong (a real entity is missing/extra) | Med | Med | Treat the 11th birthday file & 53-vs-33 special-collections as **investigate-first**; if a true entity gap, escalate as content fix, not a doc edit |
| Editing `festival-zones-vocabulary.md` anchors breaks valid anchors | Low | Low | Verify target headings exist (`audit-links.sh` anchor handling) before/after |
| Doc reconciliation reintroduces drift later | Med | Med | FR-2 count provenance step makes counts script-derived |

### Assumptions
- `[ASSUMPTION]` The 11th birthday file and the 53-vs-33 special-collections gap are index/sub-collection **structure**, not missing/extra entities. If wrong → content fixes, not just doc edits.
- `[ASSUMPTION]` "Reality wins" = edit docs to match the repo (except the genuine repo fixes in FR-4/FR-5).

---

## 10. Appendix

### A. Verified baseline (discovery, 2026-05-29)
| Metric | Reported | Genuine |
|--------|----------|---------|
| Structural errors | 1,146 | **2** (1,144 = grails, false positive) |
| Semantic enum FAILs | 4 categories | **0** (all grails) |
| Broken links | 11 / 294,877 | 11 (8 codex-content + 3 framework, out of scope) |
| Orphan traits | 20 | 20 (informational) |

### B. Key fact
The 44 Mibera files lacking trait tables are **exactly** the 44 grail token IDs — 1/1 hand-drawn art with no generative traits by design. Confirmed by set-equality against `_codex/data/grails.jsonl`.

### C. Bibliography
- `_codex/scripts/reports/audit-structure.json`, `audit-links.json`, `audit-semantic.json`
- `_codex/data/scope.json`, `_codex/data/grails.jsonl`
- `CLAUDE.md` (scope boundaries + directory layout)

> **Sources for this PRD:** live audit runs + repo inspection during discovery (2026-05-29); confirmed against stakeholder scope decisions across 5 gates.

---

*Generated by /discovering-requirements — cycle-025, codebase-grounded.*
