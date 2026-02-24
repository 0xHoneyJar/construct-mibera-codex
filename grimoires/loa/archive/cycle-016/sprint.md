# Sprint Plan: Trait Enrichment — Cultural Context at Scale

> **Cycle**: cycle-016
> **Created**: 2026-02-22
> **PRD**: [grimoires/loa/prd.md](prd.md)
> **Team**: 1 AI agent + 1 human reviewer (domain expert)
> **Sprint cadence**: Per-subcategory batches

---

## Sprint 1 — Backgrounds (73 files)

**Global ID**: 24
**Goal**: Migrate all 73 background trait files to the hybrid template. Validate the template pattern before scaling to larger batches.

### Tasks

#### T1.1: Document the trait enrichment template in schema README
- Update `_codex/schema/README.md` Section 2 with the hybrid template (Visual Elements, Cultural Context, Justification, Attribution)
- Include migration rules for converting existing fields
- **Acceptance**: Template documented, matches PRD Section 5

#### T1.2: Migrate and enrich all 73 background files
- Consolidate Visual Description + Dominant Colors + Image Files → **Visual Elements**
- Consolidate Cultural Origin + Why This Matters + Era → **Cultural Context**
- Write **Justification** for each (why this background is in the collection)
- Preserve team notes, sources, introduced-by in **Attribution**
- Drop empty fields; don't preserve blanks
- **Acceptance**: All 73 files follow hybrid template. No empty sections. All claims sourceable.

#### T1.3: User review of background batch
- Present enriched entries for review
- Flag entries where cultural context was thin or uncertain
- **Acceptance**: User approves content accuracy

#### T1.4: Validate and commit
- Run `_codex/scripts/audit-links.sh` — zero new broken links
- Commit and PR
- **Acceptance**: Link audit passes, PR merged

---

## Sprint 2 — General Items (259 files)

**Global ID**: 25
**Goal**: Enrich the largest and most culturally significant subcategory — music gear, historical objects, cypherpunk artifacts, ancestral items.

### Tasks

#### T2.1: Migrate and enrich all 259 general item files
- 163 already have "Why This Matters" content — consolidate into Cultural Context
- 27 have team notes — preserve in Attribution
- Write Justification for each (archetype/ancestor connection)
- Research Cultural Context for items with clear cultural references but empty fields
- Flag items with no discernible cultural context for user input
- **Acceptance**: All 259 files follow hybrid template. Flagged items documented.

#### T2.2: User review of items batch
- Present enriched entries for review, especially flagged items
- **Acceptance**: User approves content accuracy

#### T2.3: Validate and commit
- Run link audit, commit, PR
- **Acceptance**: Link audit passes, PR merged

---

## Sprint 3 — Hats + Earrings (192 files)

**Global ID**: 26
**Goal**: Enrich accessory files that carry ancestor and archetype signal. Hats (128) and earrings (64) have the strongest existing Cultural Origin data among accessories.

### Tasks

#### T3.1: Migrate and enrich all 128 hat files
- 34 already have Cultural Origin — consolidate into Cultural Context
- 20 have team notes — preserve in Attribution
- Many hats are ancestor-linked (Aboriginal Flag, etc.) — research cultural significance
- **Acceptance**: All 128 files follow hybrid template

#### T3.2: Migrate and enrich all 64 earring files
- 44 already have Cultural Origin — consolidate into Cultural Context
- Many earrings are culturally specific (hoops, studs, tribal) — research significance
- **Acceptance**: All 64 files follow hybrid template

#### T3.3: User review + validate + commit
- **Acceptance**: User approves, link audit passes, PR merged

---

## Sprint 4 — Clothing (181 files)

**Global ID**: 27
**Goal**: Enrich all clothing files — long sleeves (52), short sleeves (121), simple shirts (8).

### Tasks

#### T4.1: Migrate and enrich all 52 long-sleeve files
- 51/52 already have Cultural Origin — richest clothing category
- Write Justification connecting each to archetype/scene
- **Acceptance**: All 52 files follow hybrid template

#### T4.2: Migrate and enrich all 121 short-sleeve files
- Only 19 have Cultural Origin — most need research
- 14 have team notes as starting points
- **Acceptance**: All 121 files follow hybrid template. Thin entries flagged.

#### T4.3: Migrate and enrich all 8 simple shirt files
- Completely empty — minimal schema, no existing cultural content
- Research what each represents (likely color/pattern variants)
- **Acceptance**: All 8 files follow hybrid template

#### T4.4: User review + validate + commit
- **Acceptance**: User approves, link audit passes, PR merged

---

## Sprint 5 — Tattoos + Remaining Accessories (158 files)

**Global ID**: 28
**Goal**: Enrich tattoos (46), face accessories (42), glasses (38), masks (32).

### Tasks

#### T5.1: Migrate and enrich all 46 tattoo files
- 17 have Cultural Origin — tattoos carry strong ancestor signal (Sami reindeer, Japanese motifs, Celtic knotwork)
- Research cultural significance of each tattoo style
- **Acceptance**: All 46 files follow hybrid template

#### T5.2: Migrate and enrich all 42 face accessory files
- 13 have Cultural Origin
- **Acceptance**: All 42 files follow hybrid template

#### T5.3: Migrate and enrich all 38 glasses files
- Only 5 have Cultural Origin — mostly visual/style items
- **Acceptance**: All 38 files follow hybrid template

#### T5.4: Migrate and enrich all 32 mask files
- 20 have Cultural Origin — masks often carry ritual/cultural significance
- **Acceptance**: All 32 files follow hybrid template

#### T5.5: User review + validate + commit
- **Acceptance**: User approves, link audit passes, PR merged

---

## Summary

| Sprint | Subcategory | Files | Global ID |
|--------|------------|-------|-----------|
| 1 | Backgrounds | 73 | 24 |
| 2 | General Items | 259 | 25 |
| 3 | Hats + Earrings | 192 | 26 |
| 4 | Clothing | 181 | 27 |
| 5 | Tattoos + Remaining Accessories | 158 | 28 |
| **Total** | | **863** | |

## Definition of Done (per sprint)

- [ ] All files in batch migrated to hybrid template
- [ ] No empty sections (drop rather than leave blank)
- [ ] All cultural claims Wikipedia-sourceable
- [ ] Existing team notes and sources preserved verbatim
- [ ] User review passed
- [ ] `audit-links.sh` passes with zero new broken links
- [ ] Changes committed and PR merged
