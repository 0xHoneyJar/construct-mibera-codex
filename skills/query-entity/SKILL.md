---
name: query-entity
description: Look up any mibera, trait, drug, ancestor, grail, or tarot card. Delegate to the codex CLI; intent-search via QMD when only motif/concept is known.
user-invocable: true
allowed-tools: Bash, Read
---

# Query Entity

Look up any entity in the Mibera Codex. **Always prefer the CLI** — it encapsulates the slug-derivation rules, data layout, and integration contract. The skill says WHAT to do; the CLI says HOW.

## Lookup patterns

### By ID or canonical name (deterministic)

```bash
codex lookup grail 876
codex lookup grail "Black Hole"      # case-insensitive name match
codex lookup grail black-hole         # slug also accepted
codex lookup zone bear-cave
codex lookup archetype Freetekno
codex lookup factor nft:mibera
codex lookup mibera 4488
```

Single deterministic call. Returns the full entity JSON. Exits 1 on not_found.

Use `--field=<name>` to extract a single field for shell pipelines:

```bash
codex lookup grail black-hole --field=image
# https://assets.0xhoneyjar.xyz/Mibera/grails/black-hole.png
```

### By intent (fuzzy / motif / concept)

When the user has a motif (`"void"`, `"underworld"`, `"skull"`) instead of a canonical name:

```bash
codex search "void motif" --collection=grails
# returns ranked refs: [{ref: "@g876", name: "Black Hole", score: 0.88, ...}, ...]
```

Pipeable into lookup for resolution:

```bash
codex search "void motif" --refs --limit=3 | xargs -n1 codex lookup grail
```

`codex lookup grail @g876` strips the `@g` prefix and resolves deterministically. Refs are STABLE — the same id `lookup` already accepts.

Empty result `[]` is valid data, not an error. The intent layer never returns false positives below threshold.

### Cross-construct join (factor lore)

`codex lookup factor <factor-id>` joins score-mibera factor IDs to codex factor-lore. Use this when score-mibera emits `nft:mibera` and the agent needs the narrative meaning behind it.

## Completeness check

```bash
codex list zones
codex list archetypes
```

Use to discover what's canonical before claiming an entity doesn't exist. `validate_world_element` (MCP tool) does the same with fuzzy-suggest:

```bash
codex validate archetype Freetech
# {"canonical": false, "suggested": "Freetekno", "distance": 1, ...}
```

## Bulk / structured access

For programmatic exhaustive queries:
- `_codex/data/miberas.jsonl` — all 10,000 Miberas (JSONL)
- `_codex/data/grails.jsonl` — 43 grails (JSONL)
- `_codex/data/graph.json` — full knowledge graph (5.9 MB)

Prefer the CLI for single-entity queries; the JSONL/graph dumps are for batch processing.

## Fallback (no CLI installed)

The CLI is bundled with construct-mibera-codex. If `codex` isn't on PATH (e.g. consumer hasn't run pack install ceremony), fall back to:

- Mibera by ID: read `miberas/{NNNN}.md` (zero-padded: #42 → `miberas/0042.md`)
- Grail by slug: read `grails/{slug}.md` (slug = lowercase + hyphens, e.g. `"Black Hole"` → `black-hole.md`)
- Ancestor by name: read `core-lore/ancestors/{slug}.md`
- Tarot card by name: read `core-lore/tarot-cards/{slug}.md`

This pattern is documented but discouraged — it bakes substrate assumptions into the skill. Prefer fixing the install over reading files directly.

## Doctrine

- Bucket-1 (CLI primary, MCP wraps): `~/vault/wiki/concepts/construct-surface-decision-tree.md`
- §6 intent-layer / search-partner pattern (this skill's intent half): same doc, §6
- QMD as the canonical search partner: §6.3
