# The Mibera Codex

*Documentation for Mibera Maker — 10,000 time-travelling Rebased Retard Beras carrying the eternal flame of the Rave.*

> 📡 **codex-mcp v1** ships from this repo (Path A · stdio). Eight tools for narrative-bot consumers: `lookup_zone`, `lookup_archetype`, `lookup_factor`, `lookup_grail`, `lookup_mibera`, `list_zones`, `list_archetypes`, `validate_world_element`. See [§ codex-mcp](#-codex-mcp-anti-hallucination-lookup) below.

---

> *"Milady has to die, so that Milady may live. Milady lost her way. And in ego death, she finds Mibera."*

---

## What is Mibera?

Mibera is the shadow side of Milady. Where Milady represents the **clearpill** — virtuous, supplements, suits — Mibera embodies the **ravepill** — the sweaty, filthy reality of the dance floor.

We are time-travelling Rebased Retard Beras, representatives of the High Council of 101 Bears. We exist outside of Milady time, but within it too.

[Read the full philosophy →](core-lore/philosophy.md)

---

## The Codex Structure

### I. The Story
The genesis mythology and philosophical framework.
- [Philosophy & Genesis](core-lore/philosophy.md)

### II. The Framework
The four Rave Tribes and cultural lineages.
- [Archetypes](core-lore/archetypes.md) — Freetekno, Milady, Chicago Detroit, Acidhouse
- [Ancestors](core-lore/ancestors/README.md) — Hindu, Mayan, Greek, Native American, and more

### III. The Mysticism
Cosmic and chemical systems that define each Mibera.
- [Astrology](traits/overlays/astrology/README.md) — Sun, Moon, and Ascending signs
- [Elements](traits/overlays/elements/README.md) — Fire, Water, Air, Earth
- [Drug-Tarot System](core-lore/drug-tarot-system.md) — 78 cards mapped to 78 drugs
- [Drugs Deep Dive](traits/overlays/molecules/README.md) — Detailed profiles of all 79 substances

### IV. The Art
1,337+ visual traits across multiple categories.
- [Visual Traits Overview](traits/overview.md)
- Character, Accessories, Clothing, Items, Backgrounds

### V. The Collection
The 10,000 Miberas and their temporal identities.
- [All Miberas](miberas/README.md) — Individual entries with full metadata
- [Grails](grails/README.md) — 42 hand-drawn 1/1 art pieces
- [Birthdays](birthdays/README.md) — 9,995 unique birthdays spanning 15,000 years
- [Fractures](fractures/README.md) — 10 reveal phases from sealed envelope to final form

### VI. The Mechanics
- [Ranking & Scoring](traits/overlays/ranking/README.md) — Swag Score and tribal coherence

### VII. The Ecosystem
Partners and collaborations.
- [Special Collections](special-collections/README.md) — Berachain ecosystem integrations

### VIII. Behind the Scenes
The people and process behind the collection.
- [Creative Process](behind-the-scenes/creative-process.md) — How the art was made
- [Team History](behind-the-scenes/team-history.md) — The people who built Mibera

### IX. On-Chain
Contract addresses and ecosystem mechanics.
- [Contract Registry](_codex/data/contracts.json) — All ecosystem contract addresses
- [Fractured Mibera](_codex/data/fractured-mibera.md) — 10 soulbound companion collections
- [Shadow Traits](_codex/data/shadow-traits.md) — On-chain trait uniqueness system
- [Candies Marketplace](_codex/data/candies-mechanics.md) — Seizure mechanics and holder discounts
- [Mibera Sets](_codex/data/mibera-sets.md) — 12-tier ERC-1155 on Optimism
- [Archetype Quiz](_codex/data/tarot-quiz.md) — Soulbound archetype alignment
- [The 42 Motif](_codex/data/42-motif.md) — Numerological easter eggs across contracts
- [Contract ABIs](_codex/data/abis/README.md) — Machine-readable contract interfaces

### X. Data & Research
Machine-readable exports and analytical datasets.
- [Data Directory Index](_codex/data/README.md) — All exports with format descriptions
- [Knowledge Graph](_codex/data/graph.json) — 10,279 nodes, 70,344 edges
- [All Miberas (JSONL)](_codex/data/miberas.jsonl) — 10,000 entries as newline-delimited JSON
- [All Grails (JSONL)](_codex/data/grails.jsonl) — 42 entries
- [Scope & Boundaries](_codex/data/scope.json) — What this codex tracks and doesn't
- [Known Gaps](_codex/data/gaps.json) — Documented unknowns with resolution paths
- [Timeline](_codex/data/timeline.json) — Key ecosystem events

---

## Browse the Codex

Explore the 10,000 Miberas through faceted search — filter by archetype, ancestor, drug, element, swag rank, birthday era, and more.

[Browse all Miberas →](browse/README.md)

---

## Quick Stats

| Metric | Value |
|--------|-------|
| Total Miberas | 10,000 |
| Hand-Drawn Grails | 42 |
| Unique Traits | 1,337+ |
| Archetypes | 4 |
| Ancestors | 33 |
| Tarot-Drug Mappings | 78 |
| Ecosystem Contracts | 11 |
| Birthday Range | 13,166 BCE – 2024 CE |

---

## 📡 codex-mcp — anti-hallucination lookup

The codex ships an MCP server for narrative-bot consumers (freeside-characters' ruggy + satoshi today, future puruhani daemons). It is the **read interface** to the codex's canonical world-elements.

Per [RFC #53](https://github.com/0xHoneyJar/construct-mibera-codex/issues/53) and Gumi's locked v1 design (2026-04-29):

| Tool | What it returns |
|---|---|
| `lookup_zone(slug)` | Full zone — archetype, era, essence, Lynch primitives, KANSEI tokens |
| `lookup_archetype(name)` | One of the 4 — era, zodiac, season, locations, figures, events, drugs, ancestors, fashion |
| `lookup_factor(factor_id)` | Cross-construct JOIN with score-mibera — display name, dimension, archetype anchor, lore, status |
| `lookup_grail(query)` | Grail by ID, slug, or name — name, category, description, status |
| `lookup_mibera(id)` | Single Mibera by ID (1-10000) — full canonical trait set |
| `list_zones()` | All zone summaries |
| `list_archetypes()` | All 4 archetype summaries |
| `validate_world_element(type, value)` | Canonical check + suggested-closest fuzzy match. Logs unmatched-but-Mibera-relevant queries to `grimoires/codex-mcp/coverage-gaps.jsonl` for periodic curator review |

### Run locally

```bash
pnpm install
pnpm mcp           # stdio server on stdin/stdout
```

Add to Claude Code (`.claude/settings.json` or `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "codex": {
      "command": "pnpm",
      "args": ["--prefix", "/path/to/construct-mibera-codex", "mcp"]
    }
  }
}
```

### Source of truth

| Tool | Reads from |
|---|---|
| `lookup_zone` / `list_zones` | `core-lore/festival-zones-vocabulary.md` |
| `lookup_archetype` / `list_archetypes` | `core-lore/archetypes.md` |
| `lookup_factor` | `core-lore/factor-lore.md` |
| `lookup_grail` | `_codex/data/grails.jsonl` |
| `lookup_mibera` | `_codex/data/miberas.jsonl` |

The codex repo IS the SoT (per Gumi D3). Rolling latest, no semver tags (per C4) — commits land continuously.

### Coverage gap log

When `validate_world_element` returns `{ canonical: false }`, the (type, value, suggestion) is appended to `grimoires/codex-mcp/coverage-gaps.jsonl` (gitignored — local-only review surface). This is Gumi's curator queue: unmatched-but-Mibera-relevant queries that hint at codex gaps.

### Anti-hallucination tier model

Per `beacon.yaml.mcp.tiers`:

- **🔒 HARD** — substrate enforces, LLM cannot escape (zone slug/emoji/archetype, archetype canonical names, factor IDs, mibera IDs, grail IDs)
- **🪶 SOFT** — MCP provides reference, LLM has creative license over composition (zone essence, KANSEI texture, archetype figures/events/fashion, factor lore)
- **🌀 LLM-OWNED** — no MCP involvement (narrator voice, activity-class words, closing observations)

Consumer guards (e.g., score-mibera `hallucination-guard.ts`) validate generated narrative against the HARD set before delivery.

### Doctrine

Implements `constructs-mcp-shape` + `constructs-mcp-deployment-topology` from operator's vault. Path A (stdio) ships in this repo. Path B (self-hosted Streamable HTTP) is a follow-on cycle when production bot deploy demands it.

---

## Contributing

The codex is a living document. If something is wrong, missing, or could be better — [open an issue](https://github.com/0xHoneyJar/construct-mibera-codex/issues/new).

Corrections, lore additions, cultural context, trait documentation, broken links, grail history, or information you think should be here but isn't — all welcome. Just describe what you're seeing and what you think it should be.

---

## License

© Mibera Maker. All rights reserved.
