# Sprint Plan: Codex Quality, Maintenance & Future-Proofing

**Cycle:** 021
**Created:** 2026-04-05
**Sprints:** 2
**Estimated effort:** Medium (file edits + 1 new script)

---

## Sprint 1: Truth Reconciliation — Audits, Structure & Meta Files

**Goal:** Fix all structural audit errors, resolve the #0002/#0219 false positives, and reconcile every count across all meta files so every number in the codex tells the truth.

### T-1.1: Investigate and fix Mibera #0002 / #0219 audit false positives

**Description:** The structure audit reports 50 errors (25 per file) for Miberas #0002 and #0219, claiming all fields are missing. Both files have complete frontmatter and markdown tables. Diagnose why `audit-structure.sh` flags them (likely table formatting edge case or invisible characters) and fix either the files or the audit script.

**Approach:** Byte-level diff of `miberas/0002.md` vs `miberas/0001.md` table sections. Check for non-breaking spaces, different column widths, or encoding differences. Fix the root cause.

**Acceptance criteria:**
- Root cause identified and documented
- `bash _codex/scripts/audit-structure.sh` reports 0 mibera errors
- Both files still render correctly on GitHub

---

### T-1.2: Fix remaining structural errors (molecules + ancestor)

**Description:** Add `origin: null` to 5 molecule files missing the field. Add `locations` to `buddhist.md` ancestor.

**Files:**
- `traits/overlays/molecules/{ancestral-trance,euphoria,sober,st-johns-wort,weed}.md` — add `origin: null`
- `core-lore/ancestors/buddhist.md` — add `locations` array

**Acceptance criteria:**
- `bash _codex/scripts/audit-structure.sh` reports 0 errors total (combined with T-1.1)
- Buddhist `locations` values are geographically accurate (India, Southeast Asia, East Asia, Tibet)

---

### T-1.3: Reconcile manifest.json with disk reality

**Description:** Fix all count discrepancies in `manifest.json`:
- `birthday_eras`: 11→10
- `special_collections`: 32→33
- `earrings` subcategory: 62→63
- `trait_total`: recalculate from subcategory sum (currently off by 14)
- Oracle description: remove "three internal voices" reference
- Update all `last_verified` dates to 2026-04-05

**Acceptance criteria:**
- Every entity count in manifest.json matches `find <dir> -name "*.md" ! -name "README.md" | wc -l`
- Oracle description accurately reflects oracle.md content
- All `last_verified` dates are current

---

### T-1.4: Reconcile scope.json, schema README, SUMMARY.md, browse/README.md

**Description:** Fix count mismatches across all remaining meta files:
- `scope.json`: birthday_eras 11→10, special_collections 32→33
- `_codex/schema/README.md`: drug count 79→78, ancestor count 32→33
- `_codex/schema/mibera.schema.json`: add `F` to swag_rank enum (verify Ss/Sss usage in frontmatter)
- `SUMMARY.md`: grails.jsonl 42→43, graph.json stats to 11,475 nodes / 192,707 edges
- `browse/README.md`: verify era count consistency

**Acceptance criteria:**
- All numeric claims across scope.json, schema README, SUMMARY.md, browse/README.md match actual file counts
- swag_rank enum includes all values present in mibera frontmatter

---

### T-1.5: Refresh llms.txt

**Description:** Update `llms.txt` to reflect the current codex state after 20 cycles of development:
- Grails count: 42→43
- Add `graph.json` (11,475 nodes, 192,707 edges, 18 MB knowledge graph) to data exports
- Add mibera-sets (12 Honey Road ERC-1155 tokens on Optimism)
- Add vending-machine (102 VM-exclusive shadow traits across 11 categories)
- Add fractures (10 reveal phases)
- Verify all lookup patterns still work with current paths

**Acceptance criteria:**
- Every entity type in the codex is mentioned in llms.txt
- All counts match reality
- All file paths are valid
- File stays under 4 KB (concise LLM context)

---

## Sprint 2: Content Quality, Housekeeping & Health Report

**Goal:** Fix all AI writing issues, create missing convention docs, archive stale tooling, and build the health report generator.

### T-2.1: Fix broken/empty cultural context (7 files)

**Description:** Fix all AI writing quality issues identified in the audit:

1. `traits/accessories/hats/russian.md` — rewrite broken cultural context (incomplete sentence + incoherent body)
2. `traits/character-traits/tattoos/enso.md` — fill empty cultural context (Zen Buddhist symbol)
3. `traits/accessories/glasses/red-sunglasses.md` — rewrite "The article explores..." as direct cultural context
4. `traits/character-traits/tattoos/straight-edge.md` — rewrite "The article explores..." as cultural context
5. `traits/accessories/hats/sudan-sufi.md` — rewrite "The article showcases..." as cultural context
6. `traits/character-traits/tattoos/reindeer.md` — rewrite travel blog copy to focus on Sami cultural significance
7. `traits/clothing/long-sleeves/cool.md` — replace WIP placeholder with cultural context

**Style:** Direct, knowledgeable, specific. No AI filler ("tapestry", "testament", "intersection of", "rich heritage"). Use justification comments as tone reference.

**Acceptance criteria:**
- All 7 files have coherent, non-placeholder cultural context
- Zero instances of "The article explores/showcases" pattern in trait files
- No broken or incomplete sentences

---

### T-2.2: Fix PROCESS.md broken links + create CONTRIBUTING.md and CODEOWNERS

**Description:**
1. Remove or fix the 4 broken links in `PROCESS.md` (pointing to `INSTALLATION.md` and `docs/architecture/capability-schema.md`)
2. Create `CONTRIBUTING.md` — minimal: how to add cultural context to traits, how to submit holder lore, how to run audit scripts, PR process
3. Create `CODEOWNERS` — protect `core-lore/`, `IDENTITY.md`, `oracle/`, `_codex/schema/`

**Acceptance criteria:**
- `bash _codex/scripts/audit-links.sh` reports 0 broken links
- `CONTRIBUTING.md` exists and is linked from README or SUMMARY
- `CODEOWNERS` exists with at least core-lore protection rules
- NOTES.md claim about these files is now true

---

### T-2.3: Convention and script housekeeping

**Description:**
1. Update CLAUDE.md script convention: "stdlib-only where possible; PyYAML permitted for complex parsing in generator scripts"
2. Add `fetch-mibera-images.py` and `fetch-mibera-sets.py` to `_codex/scripts/README.md`
3. Move 5 migration scripts to `_codex/scripts/archive/`: `add-frontmatter.py`, `add-reveal-timeline.py`, `apply-enrichment.py`, `apply-justifications.py`, `migrate-trait-template.py`
4. Regenerate `stats.md` by running `generate-stats.py`

**Acceptance criteria:**
- CLAUDE.md script convention matches reality
- All scripts in `_codex/scripts/` are documented in README
- Migration scripts moved to archive (not deleted)
- `stats.md` regenerated with current date

---

### T-2.4: Codex Health Report generator (20% creative)

**Description:** Create `_codex/scripts/health-report.py` — a unified script that runs all audits and meta-count checks, producing `_codex/reports/health.md`.

**Features:**
- Runs structure, link, and semantic audits (via their JSON reports)
- Compares actual file counts vs claims in manifest.json, scope.json, llms.txt, SUMMARY.md
- Checks last_verified freshness (flags >30 days stale)
- Outputs markdown report with overall health score, category breakdown, specific discrepancies
- Exit code 0 (healthy) or 1 (errors)

**Acceptance criteria:**
- Script runs without errors: `python3 _codex/scripts/health-report.py`
- Generates `_codex/reports/health.md` with readable output
- After all Sprint 1+2 fixes, reports 100% healthy (or close, with only known-acceptable items flagged as INFO)
- Script is stdlib-only Python (no PyYAML)

---

## Validation Checklist (end of cycle)

- [ ] `audit-structure.sh` → 0 errors, 0 warnings
- [ ] `audit-links.sh` → 0 broken links
- [ ] `audit-semantic.py` → 8/8 pass
- [ ] `health-report.py` → all checks pass
- [ ] Manual: every count in manifest.json matches disk
- [ ] No "article explores" or "article showcases" in trait files
- [ ] CONTRIBUTING.md and CODEOWNERS exist
- [ ] llms.txt mentions all entity types and data exports
