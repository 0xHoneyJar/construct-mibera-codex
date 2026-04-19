# PRD: Codex Quality, Maintenance & Future-Proofing

**Cycle:** 021
**Status:** Draft
**Created:** 2026-04-05

---

## 1. Problem Statement

Over 20 development cycles, the Mibera Codex's core data has reached excellent quality (graph: 11,475 nodes, 192,707 edges, zero orphans; semantic audit: 8/8 pass; link audit: 245,519 links, 4 broken). But the meta layer — manifests, schemas, counts, convention docs, and AI-generated prose — has accumulated drift. Numbers disagree across files, promised deliverables were never committed, stale dates linger, and a handful of AI writing artifacts need cleanup.

This cycle is a maintenance sweep: reconcile the meta layer with reality, fix content quality issues, archive completed migration tooling, and prepare the codex for its next phase of growth.

## 2. Vision

After this cycle, every meta file tells the truth, every count matches reality, every trait file has coherent cultural context, and the codex is self-consistent enough that a new contributor or AI agent can trust what they read without cross-referencing.

## 3. Goals & Success Metrics

| Goal | Metric |
|------|--------|
| Meta file accuracy | 0 count mismatches between manifest.json, scope.json, llms.txt, SUMMARY.md, schema README, and actual file counts |
| Structure audit clean | 0 errors (currently 56) |
| AI writing quality | 0 broken/empty cultural context sections; 0 "article explores" meta-commentary |
| Convention compliance | CLAUDE.md claims match reality (scripts, docs) |
| Audit freshness | stats.md, manifest.json last_verified dates current |
| Link health maintained | 0 broken links (currently 4 in PROCESS.md) |

## 4. Findings Summary

### 4.1 Structural Issues (56 errors)

| Issue | Severity | Files |
|-------|----------|-------|
| Miberas #0002 and #0219 missing all 25 fields (or audit false positive) | High | `miberas/0002.md`, `miberas/0219.md` |
| 5 molecule files missing `origin` field | Medium | `traits/overlays/molecules/{ancestral-trance,euphoria,sober,st-johns-wort,weed}.md` |
| Buddhist ancestor missing `locations` field | Medium | `core-lore/ancestors/buddhist.md` |

### 4.2 Meta File Drift (12 discrepancies)

| Issue | Details |
|-------|---------|
| `special-collections/` count | Manifest/scope claim 32, only 1 file exists on disk |
| Birthday eras count | Manifest/scope say 11, actual = 10, browse says 10 |
| Trait total arithmetic | Headline 1,337 vs subcategory sum 1,323 (off by 14) |
| Earrings subcategory | Manifest 62, actual 63 |
| Grails count | llms.txt says 42, actual 43 |
| Schema README drug count | Says 79, should be 78 |
| Schema README ancestor count | Says 32, should be 33 |
| SUMMARY.md grails.jsonl | Says 42 entries, should be 43 |
| SUMMARY.md graph stats | Node/edge counts may be stale |
| `mibera.schema.json` swag_rank | Enum missing `F` rank |
| `manifest.json` oracle description | Mentions "three internal voices" that don't exist in oracle.md |
| `llms.txt` | No mention of graph.json, mibera sets, vending machine, fractures |

### 4.3 Missing Content

| Issue | Details |
|-------|---------|
| `CONTRIBUTING.md` never committed | NOTES.md claims created in Cycle 003, not in git |
| `CODEOWNERS` never committed | Same — referenced but absent |
| `traveller.md` ancestor | 100% stub, all TBD, backs 91 Miberas |
| `timeline.json` | All dates null, all events unverified |
| 102 vending-machine trait files | All have WIP/TBD cultural context |

### 4.4 AI Writing Issues

| Issue | Files |
|-------|-------|
| Broken cultural context (incomplete sentence) | `traits/accessories/hats/russian.md` |
| Empty cultural context | `traits/character-traits/tattoos/enso.md` |
| "The article explores..." meta-commentary | `traits/accessories/glasses/red-sunglasses.md`, `traits/character-traits/tattoos/straight-edge.md`, `traits/accessories/hats/sudan-sufi.md` |
| Travel blog copy | `traits/character-traits/tattoos/reindeer.md` |
| Body traits misusing Ancestor field as notes | All 12+ files in `traits/character-traits/body/` |
| 38 trait files with empty Visual Elements | Various |
| 21 files with formulaic "intersection of" | Various |
| Clothing `cool.md` WIP cultural context | `traits/clothing/long-sleeves/cool.md` |

### 4.5 Staleness

| Issue | Details |
|-------|---------|
| `stats.md` | 47 days stale (generated 2026-02-18) |
| `manifest.json` last_verified | Most dates from 2026-02-18 |
| `gaps.json` GAP-008 | Still open (reveal phase dates) |
| Migration scripts | 5 one-shot scripts no longer needed |
| 2 scripts undocumented in README | `fetch-mibera-images.py`, `fetch-mibera-sets.py` |

### 4.6 Convention Violations

| Issue | Details |
|-------|---------|
| 5 scripts use `import yaml` (PyYAML) | CLAUDE.md says "stdlib-only Python (no PyYAML) with regex YAML parsing" |
| `PROCESS.md` has 4 broken links | Points to Loa framework files that don't exist in this repo |

### 4.7 Informational (no action needed this cycle)

- 20 orphan trait files (referenced by 0 Miberas) — may be VM-exclusive or data artifacts
- 44 trait files with empty `image: ""` — known, tracked in NOTES.md
- Duplicated cultural context across eye color variants — intentional
- Inconsistent H1 title case across trait files — cosmetic

## 5. Scope

**In scope:**
- Fix all 56 structural audit errors
- Reconcile all meta file counts and descriptions
- Fix AI writing quality issues (broken, empty, meta-commentary)
- Regenerate stale derived files (stats.md)
- Update llms.txt to reflect current codex state
- Archive migration scripts
- Fix or remove PROCESS.md broken links
- Update CLAUDE.md if conventions have evolved (PyYAML reality)
- Create CONTRIBUTING.md and CODEOWNERS (or remove false claims)

**Out of scope:**
- Vending machine WIP content (102 files — needs art/community input, not a maintenance task)
- `timeline.json` verification (requires external research)
- Empty trait images (tracked, needs S3 assets)
- New features, new entity types, new scripts
- Static site, MCP server, CI pipeline

## 6. 20% Creative Exploration

With the user's blessing for 20% creative effort, this cycle includes one exploratory deliverable: a **Codex Health Report generator** — a single script that runs all audits (structure, links, semantic, meta count reconciliation) and produces a unified `_codex/reports/health.md` dashboard. The goal: make the maintenance state of the codex visible at a glance so future cycles can spot drift immediately instead of needing 6 parallel research agents.

## 7. Risks

| Risk | Mitigation |
|------|------------|
| special-collections count fix cascades | Verify whether 32 files existed historically and were deleted, or if the count was always wrong |
| Birthday era count (10 vs 11) | Investigate which is canonical — may need user input |
| Mibera #0002 / #0219 may be false positives | Read the actual files before attempting fixes |
| PyYAML convention change may break CLAUDE.md trust | Either migrate scripts to stdlib regex or update CLAUDE.md to reflect reality |

## 8. Dependencies

None. This is a self-contained maintenance cycle operating entirely within the existing codex.
