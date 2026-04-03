# Sprint Plan: Cycle 004 — Discovery & Browse

**Version**: 1.0.0
**Date**: 2026-02-15
**Cycle**: 004
**PRD**: `grimoires/loa/prd.md`
**SDD**: `grimoires/loa/sdd.md`
**Sprints**: 2

---

## Sprint 1: Data Fixes & Discovery Generation

**Goal**: Resolve the two remaining data blockers, generate cluster MOCs, stats dashboard, and ontology file.

### Tasks

#### S1-T1: Fix bufotenin rename across codex

**Description**: Rename `traits/overlays/molecules/bufotenine.md` → `traits/overlays/molecules/bufotenin.md`. Update the file's own frontmatter and heading. Update all ~155 Mibera files that reference this drug (both YAML frontmatter `drug:` field and markdown table link text/href). Update references in `traits/overlays/molecules/index.md`, `traits/overlays/molecules/drug-pairings.md`, `core-lore/ancestors/native-american.md`, `traits/overlays/molecules.md`. Do NOT update historical records in `grimoires/loa/` or `_scripts/reports/`.

**Acceptance Criteria**:
- [ ] `traits/overlays/molecules/bufotenin.md` exists, `bufotenine.md` does not
- [ ] Drug file frontmatter: `name: Bufotenin`
- [ ] All Mibera frontmatter updated: `drug: Bufotenin`
- [ ] All Mibera markdown table links updated
- [ ] `core-lore/tarot-cards/the-tower.md` link resolves correctly
- [ ] `_scripts/audit-semantic.py`: drug_tarot_bidirectional check passes

#### S1-T2: Fix hiberanation-eye-mask-2 duplicate and regenerate

**Description**: Remove the duplicate entry at line 76 of `traits/accessories/masks/index.md` that links to nonexistent `hiberanation-eye-mask-2.md`. Re-run `_scripts/audit-links.sh` to verify. Then re-run `_scripts/generate-browse.sh`, `_scripts/generate-backlinks.py`, `_scripts/generate-exports.py`, and `_scripts/generate-llms-full.py` to propagate the bufotenin rename from S1-T1.

**Acceptance Criteria**:
- [ ] Duplicate line removed from `traits/accessories/masks/index.md`
- [ ] `_scripts/audit-links.sh`: ≤8 broken links (down from 10)
- [ ] `_scripts/audit-semantic.py`: 8/8 checks pass
- [ ] Browse pages regenerated with "Bufotenin" (not "Bufotenine")
- [ ] `_data/miberas.jsonl` regenerated with correct drug name
- [ ] `llms-full.txt` regenerated

#### S1-T3: Create `_scripts/generate-clusters.py` and generate cluster MOCs

**Description**: Write the cluster MOC generation script per SDD 3.2. Read all 10,000 Mibera frontmatter files, compute 3 dimension pairs (archetype×ancestor, archetype×element, ancestor×element), and generate one Markdown page per non-empty intersection. Generate index page at `browse/clusters/index.md`. Update `SUMMARY.md`.

**Acceptance Criteria**:
- [ ] `_scripts/generate-clusters.py` exists and is executable
- [ ] `browse/clusters/` directory exists with subdirectories `archetype-ancestor/`, `archetype-element/`, `ancestor-element/`
- [ ] Cluster page count is between 150 and 280
- [ ] `browse/clusters/index.md` exists with table of all clusters sorted by count
- [ ] Each cluster page follows the format from SDD 3.2.4
- [ ] Max 50 inline links with "...and N more" truncation
- [ ] `_scripts/audit-links.sh`: no new broken links from cluster pages
- [ ] `SUMMARY.md` updated with clusters section
- [ ] Script is idempotent (re-running produces same output)

#### S1-T4: Create `_scripts/generate-stats.py` and generate stats dashboard

**Description**: Write the stats generation script per SDD 3.3. Compute all 10 statistic groups from Mibera frontmatter and output `_data/stats.md`.

**Acceptance Criteria**:
- [ ] `_scripts/generate-stats.py` exists and is executable
- [ ] `_data/stats.md` exists with all 10 statistic sections
- [ ] Archetype counts sum to 10,000
- [ ] Element counts sum to 10,000
- [ ] Ancestor count has 33 entries
- [ ] Drug count has 78 entries
- [ ] Swag score histogram covers full range
- [ ] Top 20 combinations are plausible
- [ ] Script is idempotent

#### S1-T5: Create `_schema/ontology.yaml`

**Description**: Write the ontology file per SDD 3.5. Document all entity types, their schemas, file locations, and relationship types with cardinality. Include signal hierarchy from IDENTITY.md.

**Acceptance Criteria**:
- [ ] `_schema/ontology.yaml` exists and is valid YAML
- [ ] All 11 entity types documented (mibera, archetype, ancestor, drug, tarot_card, element, era, zodiac_sign, swag_rank, trait, birthday_era, special_collection)
- [ ] All 11 relationship types documented with cardinality
- [ ] Entity counts match actual file counts
- [ ] Signal hierarchy documented with 3 tiers

---

## Sprint 2: Graph Export & Final Validation

**Goal**: Generate the entity relationship graph, run full validation suite, update manifest and navigation files.

### Tasks

#### S2-T1: Create `_scripts/generate-graph.py` and generate `_data/graph.json`

**Description**: Write the graph export script per SDD 3.4. Load frontmatter from Miberas, tarot cards, and drugs. Build node list (9 types) and edge list (11 types). Output to `_data/graph.json` with metadata, self-validation, and orphan node detection.

**Acceptance Criteria**:
- [ ] `_scripts/generate-graph.py` exists and is executable
- [ ] `_data/graph.json` exists and is valid JSON
- [ ] ~10,219 nodes (10,000 miberas + 219 other entities)
- [ ] ~70,312 edges (7 mibera dimensions × 10,000 + drug/tarot edges)
- [ ] No orphan nodes (every node has ≥1 edge)
- [ ] No duplicate edges
- [ ] Self-validation passes (printed to stdout)
- [ ] Script is idempotent

#### S2-T2: Final validation, manifest update, and cleanup

**Description**: Run full validation suite. Update `manifest.json` with new artifacts (cluster pages, stats, graph, ontology). Update `llms.txt` if needed. Update `grimoires/loa/NOTES.md` with Cycle 004 observations.

**Acceptance Criteria**:
- [ ] `_scripts/audit-structure.sh`: 0 errors, 0 warnings
- [ ] `_scripts/audit-links.sh`: ≤8 broken links (no regressions)
- [ ] `_scripts/audit-semantic.py`: 8/8 passes
- [ ] `manifest.json` updated with new artifacts
- [ ] `grimoires/loa/NOTES.md` updated with Cycle 004 learnings
- [ ] All new files accounted for in manifest

---

*Sprint plan generated by /simstim Phase 5 — Cycle 004*
*No commits made. All changes local.*
