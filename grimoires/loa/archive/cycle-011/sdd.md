# SDD: Index Completeness Markers

**Cycle**: 011
**PRD**: `grimoires/loa/prd.md`

## Overview

Add a single HTML comment line to the top of 8 entity index README files. The comment is invisible to human readers but machine-parseable by agents.

## Format

```html
<!-- codex-status: {COMPLETE|PARTIAL} | entities: {count} | last-verified: {YYYY-MM-DD} -->
```

Inserted as the **first line** of each file, before any existing content.

## Files Modified

| Path | Comment |
|------|---------|
| `miberas/README.md` | `<!-- codex-status: COMPLETE \| entities: 10000 \| last-verified: 2026-02-18 -->` |
| `traits/README.md` | `<!-- codex-status: COMPLETE \| entities: 1257 \| last-verified: 2026-02-18 -->` |
| `traits/overlays/molecules/README.md` | `<!-- codex-status: COMPLETE \| entities: 78 \| last-verified: 2026-02-18 -->` |
| `core-lore/ancestors/README.md` | `<!-- codex-status: COMPLETE \| entities: 33 \| last-verified: 2026-02-18 -->` |
| `core-lore/tarot-cards/README.md` | `<!-- codex-status: COMPLETE \| entities: 78 \| last-verified: 2026-02-18 -->` |
| `birthdays/README.md` | `<!-- codex-status: COMPLETE \| entities: 11 \| last-verified: 2026-02-18 -->` |
| `special-collections/README.md` | `<!-- codex-status: PARTIAL \| entities: 32 \| last-verified: 2026-02-18 -->` |
| `grails/README.md` | `<!-- codex-status: COMPLETE \| entities: 42 \| last-verified: 2026-02-18 -->` |

## Validation

- All 8 files have the comment as first line
- Values match `manifest.json` entity_types
- Regex `^<!-- codex-status: (COMPLETE|PARTIAL) \| entities: \d+ \| last-verified: \d{4}-\d{2}-\d{2} -->$` matches all comments
