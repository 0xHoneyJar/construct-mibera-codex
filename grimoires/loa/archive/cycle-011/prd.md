# PRD: Index Completeness Markers

**Cycle**: 011
**Date**: 2026-02-18
**Issue**: #15 P2 item — completeness comments on index files

## Problem

Agents navigating entity index files must check `manifest.json` to determine whether an entity type is COMPLETE or PARTIAL. Issue #15 proposed adding machine-readable HTML comments directly to index READMEs so agents can determine completeness status in a single file read.

## Requirement

### FR-1: Add completeness HTML comments to entity index files

Add a machine-readable HTML comment to the top of each entity index README with:
- `codex-status`: COMPLETE or PARTIAL
- `entities`: count of documented entities
- `last-verified`: date of last verification

Format:
```html
<!-- codex-status: COMPLETE | entities: 42 | last-verified: 2026-02-18 -->
```

### Target files (8)

| File | Entity Type | Status | Count |
|------|-------------|--------|-------|
| `miberas/README.md` | mibera | COMPLETE | 10,000 |
| `traits/README.md` | trait | COMPLETE | 1,257 |
| `traits/overlays/molecules/README.md` | drug | COMPLETE | 78 |
| `core-lore/ancestors/README.md` | ancestor | COMPLETE | 33 |
| `core-lore/tarot-cards/README.md` | tarot_card | COMPLETE | 78 |
| `birthdays/README.md` | birthday_era | COMPLETE | 11 |
| `special-collections/README.md` | special_collection | PARTIAL | 32 |
| `grails/README.md` | grail | COMPLETE | 42 |

Values sourced from `manifest.json` entity_types.

## Non-Requirements

- No schema changes (P2 item 1 deferred — see NOTES.md)
- No content changes to the files beyond the HTML comment
