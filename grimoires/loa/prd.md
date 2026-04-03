# PRD: Full Trait Knowledge Graph

**Cycle:** 020
**Status:** Draft
**Created:** 2026-04-03

---

## 1. Problem Statement

The Mibera Codex knowledge graph (`_codex/data/graph.json`) currently captures only 9 of 24 trait dimensions available on each Mibera. The existing graph includes the "identity signal" layer (archetype, ancestor, drug/molecule, tarot, element, era, sun sign, swag rank) but excludes all 15 visual trait dimensions (shirt, hat, item, glasses, earrings, mask, face accessory, tattoo, background, body, hair, eyes, eyebrows, mouth) and 2 astrological dimensions (moon sign, ascending sign).

This means downstream consumers — Finn's personality synthesis pipeline, codex navigation tools, and any future applications — cannot query trait-level relationships like "which Miberas wear the Free Palestine shirt" or "what items appear alongside the Freetekno archetype."

## 2. Vision

Every trait on every Mibera is queryable through the knowledge graph. The graph becomes the single compiled data structure for the entire codex relationship system — not just identity signals, but the complete trait fingerprint of all 10,000 Miberas.

## 3. Goals & Success Metrics

| Goal | Metric |
|------|--------|
| Complete trait coverage | All 24 mibera frontmatter fields represented as graph nodes + edges |
| Every trait file is a node | 1,324 trait files → 1,324+ trait nodes (plus existing identity nodes) |
| Zero YAML parsing errors | Fix the 5 broken molecule files; 0 warnings on generation |
| Backward compatible | Existing node/edge types unchanged; new types additive only |
| Finn-ready | graph.json loadable by KnowledgeGraphLoader without code changes |

## 4. Signal Weighting

Per IDENTITY.md and project owner direction, not all signals carry equal weight. The graph should encode this hierarchy so consumers can filter by tier:

| Tier | Weight | Signals |
|------|--------|---------|
| **Load-bearing** | 3 | Archetype, Ancestor, Birthday/Era |
| **Textural** | 2 | Drug/Molecule, Tarot, Element |
| **Modifier** | 1.5 | Swag Rank, Sun Sign, Moon Sign, Ascending Sign |
| **Visual** | 1 | Shirt, Hat, Item, Glasses, Earrings, Mask, Face Accessory, Tattoo, Background, Body, Hair, Eyes, Eyebrows, Mouth |

Weights are metadata on edge types, not filtering logic. Consumers decide how to use them. The non-visual signals should always be weighted more highly than visual ones.

## 5. Scope

### In Scope

**New node types** (15):
- `shirt` — 187 nodes (short-sleeves + long-sleeves + simple-shirts)
- `hat` — 126 nodes
- `item` — 357 nodes (general-items + bong-bears)
- `glasses` — 37 nodes
- `earrings` — 62 nodes
- `mask` — 31 nodes
- `face_accessory` — 42 nodes
- `tattoo` — 44 nodes
- `background` — 73 nodes
- `body` — 12 nodes
- `hair` — 129 nodes
- `eyes` — 90 nodes
- `eyebrows` — 10 nodes
- `mouth` — 21 nodes
- `moon_sign` / `ascending_sign` — reuse existing `zodiac` node type with new edge types

**New edge types** (16):
- `has_shirt`, `has_hat`, `has_item`, `has_glasses`, `has_earrings`, `has_mask`, `has_face_accessory`, `has_tattoo`, `has_background`, `has_body`, `has_hair`, `has_eyes`, `has_eyebrows`, `has_mouth` — Mibera → Trait
- `has_moon_sign`, `has_ascending_sign` — Mibera → Zodiac

**Documentation updates:**
- Update IDENTITY.md to reflect the full signal hierarchy including visual traits and weights
- Update CLAUDE.md if any lookup patterns or directory references change

**Bug fixes:**
- Fix 5 molecule files with `origin: '---'` YAML issue

### Out of Scope

- Modifying Finn's personality pipeline code (separate repo)
- Trait-to-trait relationship edges (e.g., shirt↔archetype correlations) — future cycle

## 6. Functional Requirements

### FR-1: Expand generate-graph.py

The script must:
1. Load trait files from all 15 visual trait directories
2. Create nodes with `type`, `name`, `slug`, `category`, optional `image`, `swag_score`, `archetype`, and `context`
3. Extract the Cultural Context section from each trait file's markdown body and embed it in the node's `context` field
4. Map mibera frontmatter field values to trait node slugs
5. Create typed edges from each mibera to its visual traits
6. Handle null/None trait values (hat, mask, earrings, tattoo, face_accessory, glasses can be null)
7. Include `weight` metadata on each edge type per the signal hierarchy

### FR-2: Embed Cultural Context in All Nodes

Every node in the graph — both existing identity signal nodes and new visual trait nodes — should carry a `context` field containing the Cultural Context section from its source markdown file. This makes the full cultural grounding available to consumers without requiring them to read individual files at runtime.

**For new visual trait nodes:**
```json
{
  "id": "shirt:free-palestine",
  "type": "shirt",
  "name": "Free Palestine",
  "slug": "free-palestine",
  "category": "clothing/short-sleeves",
  "image": "https://...",
  "swag_score": 2,
  "context": "\"Free Palestine\" is one of the most recognized slogans of the Palestinian solidarity movement..."
}
```

**For existing identity signal nodes** (archetype, ancestor, drug, tarot, etc.):
Backfill `context` from their respective source files (e.g., `core-lore/ancestors/greek.md`, `traits/overlays/molecules/dmt.md`).

Node IDs are namespaced by type to avoid collisions (e.g., `shirt:free-palestine` vs `hat:free-palestine`).

Nodes with no Cultural Context section get `"context": null`.

### FR-3: Edge Weight Metadata

Each edge type carries a `weight` field:
```json
{
  "source": "mibera:0001",
  "target": "shirt:htrk-night-faces",
  "type": "has_shirt",
  "weight": 1
}
```

### FR-4: Moon Sign & Ascending Sign

Read `moon_sign` and `ascending_sign` from mibera frontmatter. Create edges to existing zodiac nodes (no new node type needed):
- `has_moon_sign` — Mibera → Zodiac (weight: 1.5)
- `has_ascending_sign` — Mibera → Zodiac (weight: 1.5)

### FR-5: Fix Molecule YAML Errors

The 5 files with `origin: '---'` must be fixed so generate-graph.py parses all 78 molecules with zero warnings:
- `traits/overlays/molecules/ancestral-trance.md`
- `traits/overlays/molecules/euphoria.md`
- `traits/overlays/molecules/sober.md`
- `traits/overlays/molecules/st-johns-wort.md`
- `traits/overlays/molecules/weed.md`

### FR-6: Validation

The script's existing validation must be extended:
- All new edge references must resolve to valid nodes
- No orphan trait nodes (every trait node must have at least 1 mibera edge)
- Mibera node count remains exactly 10,000
- Report total nodes, edges, and per-type counts

## 7. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Graph size | < 25 MB (currently 5.4 MB; context embedding adds ~5-8 MB) |
| Generation time | < 60 seconds |
| Backward compatibility | All existing node/edge types unchanged |
| Zero warnings | No YAML parse errors |

## 8. Estimated Impact

| Metric | Before | After |
|--------|--------|-------|
| Node types | 9 | 23 (+14 visual trait types) |
| Edge types | 11 | 27 (+16 new) |
| Total nodes | ~10,237 | ~11,561 (+1,324 trait nodes) |
| Total edges | ~70,302 | ~190,000+ (each mibera gains ~12 new edges) |
| File size | 5.4 MB | ~18-22 MB estimated (includes embedded context) |

## 9. Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Graph file too large for consumers | Low | Medium | Monitor size; compress if >25MB |
| Slug mismatch between mibera frontmatter and trait filenames | Medium | High | Build mapping table; validate exhaustively |
| Null trait values create noise | Low | Low | Skip null fields; don't create edges for missing traits |
| Trait name normalization issues | Medium | Medium | Reuse existing slugify function; test against all 10K miberas |

## 10. Dependencies

- `_codex/scripts/generate-graph.py` — primary modification target
- `miberas/*.md` — source of trait assignments (read-only)
- `traits/**/*.md` — source of trait metadata (read-only)
- `traits/overlays/molecules/*.md` — 5 files need YAML fix
