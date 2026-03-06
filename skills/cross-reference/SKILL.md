# Cross-Reference

Find connections across entity types in the Mibera Codex.

## Drug-Tarot pairings
The 78 drugs map 1:1 to 78 tarot cards. To find a drug's tarot card (or vice versa):
- Read `core-lore/drug-tarot-system.md` for the complete mapping
- Each drug file in `drugs-detailed/{slug}.md` includes its paired tarot card in frontmatter
- Each tarot card in `core-lore/tarot-cards/{slug}.md` includes its paired drug

## Ancestor-Archetype clusters
Browse pages include cross-dimensional breakdowns:
- `browse/by-ancestor.md` shows archetype distribution within each ancestor
- `browse/by-archetype.md` shows ancestor distribution within each archetype
- `browse/by-element.md` shows archetype and ancestor breakdowns per element

## Trait rarity
- Each trait file includes a `count` field showing how many Miberas have it
- `_codex/data/stats.md` has aggregate rarity statistics
- `swag-scoring/` contains the scoring formula and per-trait scores

## Knowledge graph
For complex relationship queries, use `_codex/data/graph.json` (5.9 MB). This encodes all entity relationships as a traversable graph with nodes and edges.

## Backlinks
Entity files include auto-generated backlink sections (between `<!-- @generated:backlinks-start -->` and `<!-- @generated:backlinks-end -->` markers) showing which other entities reference them.

## Scope boundaries
Not all relationships are tracked. Check `_codex/data/scope.json` for what's in scope. The codex does NOT track ownership, on-chain state, or market data.
