# Sprint Plan: Full Trait Knowledge Graph

**Cycle:** 020
**Created:** 2026-04-03
**Sprints:** 2
**Estimated effort:** Small-medium (single script + docs)

---

## Sprint 1: Graph Expansion — Visual Traits + Context Embedding

**Goal:** Expand generate-graph.py to include all visual traits, moon/ascending signs, edge weights, and embedded cultural context. Fix molecule YAML bugs.

### T-1.1: Fix molecule YAML errors

**Description:** Remove the `origin: '---'` field from the 5 broken molecule files.

**Files:** `traits/overlays/molecules/{ancestral-trance,euphoria,sober,st-johns-wort,weed}.md`

**Acceptance criteria:**
- `origin` field removed from all 5 files
- `python3 _codex/scripts/generate-graph.py` runs with 0 YAML warnings
- Drugs count shows 78/78

---

### T-1.2: Add trait directory registry and loader

**Description:** Add `TRAIT_DIRS` config mapping mibera frontmatter fields to trait file directories. Implement `load_trait_files()` that loads frontmatter from all directories and builds slug→node lookup tables. Implement `extract_cultural_context()` to pull the Cultural Context section from markdown body.

**Acceptance criteria:**
- All 15 trait categories loaded (1,324 files)
- Each trait file produces a node with: id, type, label, category, image, swag_score (if present), context
- Node IDs namespaced: `shirt:free-palestine`, `hat:cute-bera`, etc.
- Files with no Cultural Context get `context: null`

---

### T-1.3: Add visual trait edges from miberas

**Description:** For each of the 10,000 miberas, resolve all visual trait frontmatter fields (shirt, hat, item, glasses, earrings, mask, face_accessory, tattoo, background, body, hair, eyes, eyebrows, mouth) to trait nodes via slug matching. Create typed edges. Skip null values.

**Acceptance criteria:**
- All 14 visual edge types emitted: `has_shirt`, `has_hat`, `has_item`, `has_glasses`, `has_earrings`, `has_mask`, `has_face_accessory`, `has_tattoo`, `has_background`, `has_body`, `has_hair`, `has_eyes`, `has_eyebrows`, `has_mouth`
- Null/None trait values produce no edge (no noise)
- Slug mismatches logged as warnings; count < 10 (ideally 0)

---

### T-1.4: Add moon sign and ascending sign edges

**Description:** Read `moon_sign` and `ascending_sign` from mibera frontmatter. Create edges to existing zodiac nodes.

**Acceptance criteria:**
- `has_moon_sign` and `has_ascending_sign` edge types present
- Both resolve to existing `zodiac:*` nodes
- 10,000 edges each (every mibera has both)

---

### T-1.5: Add edge weights

**Description:** Add `weight` field to all edges per the signal hierarchy: load-bearing=3, textural=2, modifier=1.5, visual=1. Update `add_edge()`. Include `signal_weights` metadata in output.

**Acceptance criteria:**
- Every edge in graph.json has a `weight` field
- Existing edge types get correct weights (has_archetype=3, has_drug=2, etc.)
- New edge types get correct weights (has_shirt=1, has_moon_sign=1.5, etc.)
- `metadata.signal_weights` block lists edge types grouped by tier

---

### T-1.6: Backfill context on existing nodes

**Description:** Extract Cultural Context from ancestor files (`core-lore/ancestors/*.md`), drug files (`traits/overlays/molecules/*.md`), and tarot files (`core-lore/tarot-cards/*.md`). Add `context` field to their existing nodes. Archetype nodes get context from `core-lore/archetypes.md` (anchored sections).

**Acceptance criteria:**
- All ancestor nodes have `context` (33 ancestors)
- All drug nodes have `context` (78 drugs)
- All tarot nodes have `context` (78 cards)
- Archetype nodes have `context` (4 archetypes)
- Zodiac, element, era, swag_rank nodes get `context: null` (no cultural context section in their files)

---

### T-1.7: Validation and generation

**Description:** Run the expanded script. Validate output. Fix any slug mismatches found.

**Acceptance criteria:**
- 0 YAML warnings
- 0 orphan nodes
- 0 bad edge references
- Mibera count = 10,000
- Node count ~11,500+
- Edge count ~190,000+
- File size < 25 MB
- All existing node/edge types present and unchanged

---

## Sprint 2: Documentation — IDENTITY.md + CLAUDE.md

**Goal:** Update project documentation to reflect the expanded signal system.

### T-2.1: Update IDENTITY.md

**Description:** Add visual traits as a fourth tier in the signal hierarchy. Document weights. Clarify that visual traits are signals (not scripts) at a lower weight than identity/textural/modifier signals.

**Acceptance criteria:**
- Signal Hierarchy section includes Visual tier with weight 1
- Existing tiers (load-bearing, textural, modifier) unchanged
- Clear statement that non-visual signals are weighted more highly
- No changes to the core principle ("traits are signals, not scripts")

---

### T-2.2: Update CLAUDE.md

**Description:** Verify all references are current post-molecules refactor. Ensure directory layout table is accurate.

**Acceptance criteria:**
- No references to `drugs-detailed/` in CLAUDE.md
- Directory layout table is accurate
- Lookup patterns reflect current structure

---
