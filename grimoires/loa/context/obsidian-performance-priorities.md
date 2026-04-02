# Obsidian Performance & UX Priorities

*Context from user discussion — February 2026*

---

## Problem Statement

The Mibera Codex is edited and visualized primarily through Obsidian. With 10,000+ mibera files, 1,200+ trait files, and hundreds of lore files, **Obsidian lags significantly**. The user needs performance optimizations and visual improvements to make the vault usable as a daily editing/browsing tool.

## Priority 1: Obsidian Performance

The `miberas/` folder contains 1,700+ files in a flat directory structure. Obsidian's indexer, graph view, link resolver, and search all degrade with this layout.

### Key interventions:
- **Subfolder sharding**: Split `miberas/` into range-based subdirectories (e.g., `miberas/0001-0500/`, `miberas/0501-1000/`). Obsidian handles nested folders significantly better than flat directories with thousands of files.
- **Exclude non-content directories from indexing**: `.git`, `.claude`, `.beads`, `.run`, `grimoires`, `_scripts`, `_schema`, `_data` should all be excluded from Obsidian's file indexer.
- **Disable expensive features**: Live preview, full graph view (use local graph instead), and unused plugins should be turned off or scoped.
- **Obsidian `app.json` tuning**: Configure settings to reduce indexing overhead.

### Important constraint:
Any file reorganization (sharding) **must update all internal wiki-links** across the entire codex to prevent breakage. The codex has 239,140+ internal links.

## Priority 2: Graph View Color Groups

The `.obsidian/graph.json` currently has **empty `colorGroups`**. All nodes appear as default gray, making the graph view uninformative.

### Desired color groups (by content type/path):
| Group | Query | Purpose |
|-------|-------|---------|
| Miberas | `path:miberas` | The 10,000 core entries |
| Tarot Cards | `path:core-lore/tarot-cards` | 78 tarot card files |
| Ancestors | `path:core-lore/ancestors` | 32 ancestor culture files |
| Drugs | `path:traits/overlays/molecules` | 79 drug profile files |
| Traits | `path:traits` | 1,255 visual trait files |
| Browse/Index | `path:browse` | Navigation/browse pages |
| Core Lore | `path:core-lore` | Philosophy, archetypes, cosmology |
| Birthdays | `path:birthdays` | Birthday era files |

Colors should be distinct, readable on a dark background, and semantically meaningful (e.g., drugs could be green, tarot could be purple/gold).

## Priority 3: Graph View Tuning

Current settings show high repel strength (10) and large link distance (250), which spreads nodes far apart. For a vault this size:
- Reduce `repelStrength` for tighter clustering
- Adjust `centerStrength` for better centering
- Consider increasing `nodeSizeMultiplier` for hub nodes (drugs, ancestors, tarot are hubs connecting many miberas)
- `textFadeMultiplier: 0` means labels never show — consider increasing slightly for labeled hub nodes

## Scope

This cycle should focus on **Obsidian-specific improvements only**:
1. Graph view color configuration
2. Graph view force/display tuning
3. Obsidian settings optimization (app.json, excluded folders)
4. Assess feasibility of subfolder sharding (link rewriting impact)

Static site generation, AI integration, MCP servers, and other improvements from the research doc are **out of scope** for this cycle.

## Existing Assets

- `.obsidian/graph.json` — graph view config (exists, needs color groups)
- `.obsidian/app.json` — app settings (exists, currently empty `{}`)
- `.obsidian/appearance.json` — theme settings (exists, currently empty `{}`)
- `.obsidian/core-plugins.json` — plugin toggles (exists)
- `grimoires/loa/context/codex-improvement-research.md` — comprehensive improvement research (see §14 for Obsidian-specific items)
