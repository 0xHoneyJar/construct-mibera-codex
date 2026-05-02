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
micodex lookup grail 876
micodex lookup grail "Black Hole"      # case-insensitive name match
micodex lookup grail black-hole         # slug also accepted
micodex lookup zone bear-cave
micodex lookup archetype Freetekno
micodex lookup factor nft:mibera
micodex lookup mibera 4488
```

Single deterministic call. Returns the full entity JSON. Exits 1 on not_found.

Use `--field=<name>` to extract a single field for shell pipelines:

```bash
micodex lookup grail black-hole --field=image
# https://assets.0xhoneyjar.xyz/Mibera/grails/black-hole.png
```

### By intent (fuzzy / motif / concept)

When the user has a motif (`"void"`, `"underworld"`, `"skull"`) instead of a canonical name:

```bash
micodex search "void motif" --collection=grails
# returns ranked refs: [{ref: "@g876", name: "Black Hole", score: 0.88, ...}, ...]
```

Pipeable into lookup for resolution:

```bash
micodex search "void motif" --refs --limit=3 | xargs -n1 micodex lookup grail
```

`micodex lookup grail @g876` strips the `@g` prefix and resolves deterministically. Refs are STABLE — the same id `lookup` already accepts.

Empty result `[]` is valid data, not an error. The intent layer never returns false positives below threshold.

### Cross-construct join (factor lore)

`micodex lookup factor <factor-id>` joins score-mibera factor IDs to codex factor-lore. Use this when score-mibera emits `nft:mibera` and the agent needs the narrative meaning behind it.

## Completeness check

```bash
micodex list zones
micodex list archetypes
```

Use to discover what's canonical before claiming an entity doesn't exist. `validate_world_element` (MCP tool) does the same with fuzzy-suggest:

```bash
micodex validate archetype Freetech
# {"canonical": false, "suggested": "Freetekno", "distance": 1, ...}
```

## Bulk / structured access

For programmatic exhaustive queries:
- `_codex/data/miberas.jsonl` — all 10,000 Miberas (JSONL)
- `_codex/data/grails.jsonl` — 43 grails (JSONL)
- `_codex/data/graph.json` — full knowledge graph (5.9 MB)

Prefer the CLI for single-entity queries; the JSONL/graph dumps are for batch processing.

## When the CLI isn't available

If `codex` isn't on PATH (e.g. the construct pack hasn't been installed in the consumer's environment), **fix the install rather than reading files directly**:

```bash
# Loa pack install
loa /constructs install construct-mibera-codex

# OR: install from npm directly
npm install @0xhoneyjar/construct-mibera-codex
```

Then retry `micodex lookup` / `micodex search`. Reading entity files via filesystem paths is not supported — the CLI is the only blessed surface for substrate access (per `~/vault/wiki/concepts/construct-surface-decision-tree.md` §6.4: skill teaches WHAT, CLI knows HOW).

## Doctrine

- Bucket-1 (CLI primary, MCP wraps): `~/vault/wiki/concepts/construct-surface-decision-tree.md`
- §6 intent-layer / search-partner pattern (this skill's intent half): same doc, §6
- QMD as the canonical search partner: §6.3
