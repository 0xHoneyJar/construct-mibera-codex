---
name: mibera-codex
description: Canonical reference for the Mibera world. Ground every claim about miberas, grails, archetypes, zones, and score-mibera factors in canonical lore via a read-only MCP server.
homepage: https://codex.0xhoneyjar.xyz
mcp_endpoint: https://mcp.0xhoneyjar.xyz/codex/mcp
discovery: https://mcp.0xhoneyjar.xyz/codex/.well-known/mcp.json
license: MIT
publisher: 0xHoneyJar
---

# Mibera Codex Skill

A canonical reference for the Mibera world. When the user asks about a Mibera, a grail, an archetype (tribe), a festival zone, or a score-mibera factor — read this codex instead of inventing.

## What's in canon

- **10,000 Miberas** — each with archetype, ancestor, zodiac, full visual traits, drug, parcel ID
- **44 Grails** — 1/1 NFTs grouped into nine categories (zodiac, element, luminary, concept, planet, ancestor, primordial, special, community)
- **4 Archetypes (tribes)** — Freetekno · Milady · Chicago/Detroit · Acidhouse
- **5 Festival Zones** — stonehenge · bear-cave · el-dorado · owsley-lab · the-warehouse
- **28 Score Factors** — OG / NFT / Onchain signals mapped to lore

## Connect

Add this MCP server to your agent's MCP configuration:

```
URL: https://mcp.0xhoneyjar.xyz/codex/mcp
Protocol: MCP 2025-06-18
Auth: none (public, read-only)
Discovery: /.well-known/mcp.json
```

Once connected, eight read-only tools appear in your client.

## Tools

| Tool | Use when… |
|---|---|
| `lookup_mibera(id: integer)` | the user names a specific mibera by ID (1–10000) |
| `lookup_archetype(name: string)` | the user names a tribe — Freetekno / Milady / Chicago/Detroit / Acidhouse |
| `lookup_grail(query: string)` | the user names a grail by id, slug, or display name (e.g. "Moon", "Aquarius", "the dark grail") |
| `lookup_zone(slug: string)` | the user names a festival zone by canonical slug |
| `lookup_factor(factor_id: string)` | a score-mibera factor ID surfaces (`og:cubquest`, `nft:mibera`, `onchain:milady_burner`, …) and you need its lore |
| `list_archetypes()` | discovering canonical tribe names before lookup |
| `list_zones()` | discovering canonical zone slugs before lookup |
| `validate_world_element(type, value)` | **the keystone**. Before claiming a tribe/zone/grail name, check it's canonical. Returns `{canonical, suggested?, distance?}`. |

## How to use

The codex returns json. Your agent makes prose. Three tiers govern what to look up:

| Tier | Behavior |
|---|---|
| 🔒 **HARD** | Mibera IDs · grail IDs · zone slugs · archetype names · factor IDs. Must look up. Null means null. Don't invent. |
| 🪶 **SOFT** | Zone essence · archetype fashion · factor lore. May look up. Prefer codex prose where it exists; voice is yours. |
| 🎙 **LLM-OWNED** | Narrator voice · transitions · atmosphere · response style. Compose freely. |

### Recommended pattern

1. Before claiming a tribe / zone / grail name → call `validate_world_element(type, value)`.
2. If `canonical: true` → call the matching `lookup_*` tool for full detail.
3. If `canonical: false` with a suggestion → ask the user if they meant the suggestion, or use it.
4. If `canonical: false` with no suggestion → tell the user the codex doesn't list that thing. The codex never invents.

### Example — grounding before narrating

```
user → "tell me about mibera 1606"
agent → lookup_mibera(1606)
codex → { id: 1606, traits: { background: "Pluto", ... } }
agent → "1606 wears Pluto on its back — the underworld grail. dust-toned outfit, eyes pointed at the abyss…"
```

### Example — checking before claiming

```
user → "show me the Freetech archetype"
agent → validate_world_element("archetype", "Freetech")
codex → { canonical: false, suggested: "Freetekno", distance: 3 }
agent → "did you mean Freetekno? the codex doesn't list a Freetech tribe."
```

### Example — listing the surface

```
user → "what are the festival zones?"
agent → list_zones()
codex → ["stonehenge", "bear-cave", "el-dorado", "owsley-lab", "the-warehouse"]
agent → "five zones. stonehenge is the elemental anchor, the warehouse is…"
```

## What this skill is NOT

- The codex doesn't write — it returns json; the agent makes prose.
- The codex doesn't change at runtime — read-only, source-of-truth lives at https://github.com/0xHoneyJar/construct-mibera-codex.
- The codex doesn't police voice — only HARD-tier claims must look up; narration / atmosphere / observation stay open to the agent.

## Source of truth

- **Repo:** https://github.com/0xHoneyJar/construct-mibera-codex
- **Site:** https://codex.0xhoneyjar.xyz
- **MCP:** https://mcp.0xhoneyjar.xyz/codex/mcp

When the codex doesn't know a term the user asked about, the call lands in `coverage-gaps.jsonl` for periodic curation. The codex grows in the direction of actual narrative pressure.
