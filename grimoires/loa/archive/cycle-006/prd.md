# PRD: Obsidian Performance & Graph Visualization

**Cycle**: 006
**Date**: 2026-02-15
**Status**: Draft

---

## 1. Problem Statement

The Mibera Codex is primarily edited and visualized through Obsidian. With 10,001 mibera files, 1,255+ trait files, 79 drug files, 78 tarot cards, and 33 ancestors (~11,500 markdown files total), **Obsidian lags significantly** — slow file switching, unresponsive search, and an unusable graph view.

The graph view is especially degraded: all nodes render as identical gray dots with no visual differentiation between content types, and force settings are tuned for a much smaller vault.

**Root causes:**
- `miberas/` contains 10,001 files in a single flat directory — Obsidian's indexer degrades with large flat directories
- `.obsidian/graph.json` has empty `colorGroups` — graph is monochrome and uninformative
- Graph force settings (repelStrength: 10, linkDistance: 250) spread nodes far apart, inappropriate for 10K+ nodes
- No directories are excluded from Obsidian's indexer — non-content directories (`.claude`, `.beads`, `grimoires`, `_scripts`, `_schema`, `_data`) are indexed unnecessarily
- `random-note` plugin is disabled — missed discovery opportunity for 10K entries
- No CSS snippets exist for graph view customization

> Sources: User discussion (2026-02-15), `.obsidian/graph.json`, `.obsidian/app.json`, `.obsidian/core-plugins.json`, `grimoires/loa/context/obsidian-performance-priorities.md`

---

## 2. Goals & Success Metrics

| Goal | Metric |
|------|--------|
| Graph view shows content types as distinct colors | 8 color groups configured in `graph.json`, visually verified |
| Graph view renders at usable scale | Force settings tuned for 10K+ nodes (tighter clusters, readable labels on hubs) |
| Obsidian excludes non-content dirs | `app.json` contains `userIgnoreFilters` for all non-content directories |
| Random note enabled | `core-plugins.json` has `"random-note": true` |
| No link breakage | All 239,140+ internal links remain valid after changes |
| Assess sharding feasibility | Document the link-rewriting impact of subdirectory sharding for future decision |

---

## 3. User & Stakeholder Context

**Primary user:** Codex maintainer browsing, editing, and visualizing the vault in Obsidian daily.

**Pain points:**
- Graph view is a gray blob — can't distinguish miberas from drugs from ancestors
- Slow vault performance when navigating, searching, or opening files
- No serendipitous discovery mechanism (random note disabled)

**Value delivered:**
- A visually meaningful graph where content types are instantly identifiable by color
- Reduced indexing overhead from excluding irrelevant directories
- Random note for serendipitous browsing of 10K entries

---

## 4. Functional Requirements

### F1: Configure Graph View Color Groups

Add 8 color groups to `.obsidian/graph.json` mapping content directories to distinct colors.

**Color group specification:**

| Group | Query | Color (hex) | Rationale |
|-------|-------|-------------|-----------|
| Miberas | `path:miberas` | `#C9A84C` (gold) | Core entries — warm, dominant |
| Tarot Cards | `path:core-lore/tarot-cards` | `#9B59B6` (purple) | Mystical, arcane |
| Ancestors | `path:core-lore/ancestors` | `#1ABC9C` (teal) | Cultural heritage, grounded |
| Drugs | `path:traits/overlays/molecules` | `#2ECC71` (green) | Botanical, molecular |
| Traits | `path:traits` | `#3498DB` (blue) | Visual/descriptive layer |
| Browse/Index | `path:browse` | `#ECF0F1` (white/silver) | Navigation, structural |
| Core Lore | `path:core-lore` | `#E74C3C` (red) | Philosophy, cosmology — high authority |
| Birthdays | `path:birthdays` | `#F39C12` (amber) | Temporal, era-based |

**Obsidian color format:** `{"a": 1, "r": R, "g": G, "b": B}` where R/G/B are 0-255 integers.

**Acceptance criteria:**
- All 8 color groups present in `.obsidian/graph.json`
- Colors render correctly in graph view on dark background
- Color groups are ordered so more-specific paths take priority (e.g., `path:core-lore/tarot-cards` before `path:core-lore`)

### F2: Tune Graph View Forces & Display

Adjust force and display settings in `.obsidian/graph.json` for a vault with 10K+ nodes.

**Proposed settings:**

| Setting | Current | Proposed | Rationale |
|---------|---------|----------|-----------|
| `repelStrength` | 10 | 6 | Tighter clusters for large graphs |
| `centerStrength` | 0.519 | 0.6 | Stronger centering prevents drift |
| `linkDistance` | 250 | 100 | Shorter links, denser layout |
| `lineSizeMultiplier` | 1 | 0.5 | Thinner lines reduce visual noise |
| `nodeSizeMultiplier` | 1 | 1.2 | Slightly larger nodes for visibility |
| `textFadeMultiplier` | 0 | -0.5 | Show labels when reasonably zoomed in |

**Acceptance criteria:**
- Settings applied to `graph.json`
- Graph renders without browser/app freeze
- Hub nodes (drugs, ancestors, tarot) visually cluster their connected miberas

### F3: Optimize Obsidian App Settings

Configure `.obsidian/app.json` to exclude non-content directories from indexing.

**Directories to exclude:**
- `.claude` — framework files
- `.beads` — task tracking
- `.run` — runtime state
- `.ck` — checksums
- `grimoires` — Loa state files
- `_scripts` — Python/bash scripts
- `_schema` — JSON schema files
- `_data` — generated data exports
- `node_modules` — if present

**Acceptance criteria:**
- `app.json` contains `userIgnoreFilters` array with all listed directories
- Obsidian does not index or show excluded directories in file explorer or search
- Content files remain fully searchable and navigable

### F4: Enable Random Note Plugin

Set `random-note` to `true` in `.obsidian/core-plugins.json`.

**Acceptance criteria:**
- `"random-note": true` in `core-plugins.json`
- Random Note command available in Obsidian command palette

### F5: Sharding Feasibility Assessment

Produce a written assessment of splitting `miberas/` into subdirectories, documenting:

1. **Link rewriting scope**: How many files contain links into `miberas/` that would need updating
2. **Link format**: Current relative path format (`../miberas/XXXX.md`) and required change (`../miberas/XXXX-YYYY/XXXX.md`)
3. **Script requirements**: What a migration script would need to do
4. **Risk analysis**: Probability and impact of broken links
5. **Recommendation**: Whether to proceed in a future cycle

**Known facts (from codebase analysis):**
- 10,001 mibera files each contain ~24 relative links using `../` prefix
- Browse pages link to miberas using `../miberas/XXXX.md` format
- Drug files contain backlinks to specific miberas
- Total internal links: 239,140+
- Sharding would change every relative path in all 10,001 mibera files (deeper nesting = `../../` instead of `../`)
- All inbound links from browse, drugs, ancestors, etc. would also need updating

**Acceptance criteria:**
- Written assessment in the sprint reviewer notes
- Go/no-go recommendation with quantified risk

---

## 5. Technical Constraints

- **Obsidian config files are gitignored** — `.obsidian/` is in `.gitignore`, so all changes are local-only
- **JSON format** — Obsidian config files are JSON, not YAML
- **No Obsidian API** — changes are made by directly editing config files; Obsidian picks them up on restart
- **Color format** — Obsidian uses `{"a": 1, "r": R, "g": G, "b": B}` (0-255 int), not hex strings
- **No commits** — all changes stay local per user request
- **macOS** — Obsidian running on macOS (Darwin 24.3.0)

---

## 6. Scope & Prioritization

**In scope:**
- F1: Graph view color groups (8 content-type colors)
- F2: Graph view force/display tuning
- F3: App settings optimization (excluded directories)
- F4: Enable random-note plugin
- F5: Sharding feasibility assessment (document only, no migration)

**Out of scope:**
- Subfolder sharding migration (assessed but not executed)
- Community plugin installation (Dataview, Templater, etc.)
- CSS snippet creation for advanced graph styling
- Static site generation
- AI integration / MCP server
- Tag enrichment (deferred from cycle-005)
- Content changes to any markdown files

---

## 7. Risks & Dependencies

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Obsidian doesn't pick up config changes | Low | Medium | Restart Obsidian after changes |
| Color group queries overlap (e.g., `path:core-lore` matches tarot/ancestors too) | Medium | Low | Order specific paths before general ones; Obsidian uses first match |
| Force settings cause graph freeze with 10K nodes | Medium | Medium | Conservative initial values; user can tune interactively |
| `userIgnoreFilters` syntax wrong | Low | Low | Test with one directory first |
| Excluded directories needed for some Obsidian feature | Low | Low | Easy to revert — just edit `app.json` |

---

## 8. Deliverables

| Artifact | Path | Notes |
|----------|------|-------|
| Graph color groups + force tuning | `.obsidian/graph.json` | 8 color groups, tuned forces |
| App settings (excluded dirs) | `.obsidian/app.json` | `userIgnoreFilters` array |
| Enabled random-note | `.obsidian/core-plugins.json` | Single field change |
| Sharding assessment | Sprint reviewer notes | Go/no-go recommendation |
