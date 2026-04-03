# SDD: Obsidian Performance & Graph Visualization

**Cycle**: 006
**Date**: 2026-02-15
**Status**: Draft
**PRD**: `grimoires/loa/prd.md`

---

## 1. Executive Summary

This cycle modifies three Obsidian configuration files (all JSON, all gitignored) to improve graph visualization and vault performance for a 11,500-file codex. No application code, no markdown content changes, no scripts.

**Scope**: Edit `.obsidian/graph.json`, `.obsidian/app.json`, `.obsidian/core-plugins.json`. Produce a written sharding feasibility assessment.

---

## 2. Architecture

There is no application architecture. This cycle edits Obsidian's local config files directly.

```
.obsidian/
├── graph.json          ← F1 (color groups) + F2 (force tuning)
├── app.json            ← F3 (excluded directories)
├── core-plugins.json   ← F4 (enable random-note)
├── appearance.json     (unchanged)
└── workspace.json      (unchanged)
```

All files are JSON. All are gitignored. Obsidian reads them on startup and when switching views.

---

## 3. Component Design

### 3.1 graph.json — Color Groups (F1)

Obsidian's `colorGroups` array uses `{"query": "<search>", "color": {"a": <alpha>, "rgb": <packed-int>}}` format. The `rgb` value is a packed integer: `(R << 16) + (G << 8) + B`.

**Ordering matters**: Obsidian applies the first matching color group. More-specific paths must come before general paths (e.g., `path:core-lore/tarot-cards` before `path:core-lore`).

**Final color group specification:**

| Order | Query | Color Name | Hex | RGB Int |
|-------|-------|------------|-----|---------|
| 1 | `path:core-lore/tarot-cards` | Purple | `#9B59B6` | 10197430 |
| 2 | `path:core-lore/ancestors` | Teal | `#1ABC9C` | 1750428 |
| 3 | `path:core-lore` | Red | `#E74C3C` | 15158332 |
| 4 | `path:traits/overlays/molecules` | Green | `#2ECC71` | 3066993 |
| 5 | `path:traits` | Blue | `#3498DB` | 3447515 |
| 6 | `path:browse` | Silver | `#ECF0F1` | 15527665 |
| 7 | `path:birthdays` | Amber | `#F39C12` | 15969298 |
| 8 | `path:miberas` | Gold | `#C9A84C` | 13217868 |

**Rationale for ordering:**
- Rows 1-2 are sub-paths of `core-lore` → must precede row 3
- `path:miberas` is last because it's the largest group (10K nodes) and acts as the "background" color
- All other paths are non-overlapping so order doesn't matter between them

### 3.2 graph.json — Force Tuning (F2)

**Final settings:**

```json
{
  "repelStrength": 6,
  "centerStrength": 0.6,
  "linkDistance": 100,
  "linkStrength": 1,
  "lineSizeMultiplier": 0.5,
  "nodeSizeMultiplier": 1.2,
  "textFadeMultiplier": -0.5
}
```

**Design rationale:**
- `repelStrength: 6` (was 10): Reduces inter-node spacing. At 10K nodes, high repulsion creates an unbounded expanding cloud. 6 keeps clusters tight while preventing overlap.
- `centerStrength: 0.6` (was 0.519): Pulls the graph toward center, preventing drift off-screen with large node counts.
- `linkDistance: 100` (was 250): Hub nodes (drugs, ancestors, tarot) each connect to hundreds of miberas. At 250px per link, these fans are enormous. 100px keeps fan radius manageable.
- `lineSizeMultiplier: 0.5` (was 1): With 239K+ links, full-width lines create visual noise. Half-width is more readable.
- `nodeSizeMultiplier: 1.2` (was 1): Slightly larger dots aid visibility when zoomed out on 10K nodes.
- `textFadeMultiplier: -0.5` (was 0): At 0, labels never render. At -0.5, labels appear at moderate zoom — useful for identifying hub nodes without cluttering the zoomed-out view.

**Preserved settings (unchanged):**
- `search: "miberas"` — user's current filter
- `showTags: false`, `showAttachments: false`, `showOrphans: true` — user preferences
- `showArrow: false` — directional arrows add noise at scale
- `scale: 0.0702...` — zoom level, user-controlled

### 3.3 app.json — Excluded Directories (F3)

Obsidian's `userIgnoreFilters` array accepts glob patterns. Each entry excludes matching paths from the file explorer, search, graph view, and link suggestions.

**Final config:**

```json
{
  "userIgnoreFilters": [
    ".claude/",
    ".beads/",
    ".run/",
    ".ck/",
    "grimoires/",
    "_scripts/",
    "_schema/",
    "_data/",
    "node_modules/"
  ]
}
```

**Impact analysis:**
- These 9 directories contain ~200 non-content files (scripts, JSON configs, framework state)
- Excluding them removes ~200 nodes from graph view and ~200 entries from search index
- All content files (miberas, drugs, tarot, ancestors, traits, browse, birthdays, core-lore) remain fully indexed
- `grimoires/` exclusion removes Loa state files from Obsidian — these are agent-facing, not human-facing

**Reversibility:** Remove any entry from the array to re-include that directory.

### 3.4 core-plugins.json — Random Note (F4)

Single field change:

```json
"random-note": true
```

This enables the "Open random note" command in Obsidian's command palette (Cmd+P → "Random note"). Highly valuable for serendipitous discovery across 10K entries.

### 3.5 Sharding Feasibility Assessment (F5)

This is a written deliverable, not a config change. It will be produced during sprint review and documented in reviewer notes.

**Pre-computed data for the assessment:**

| Metric | Value | Source |
|--------|-------|--------|
| Files in `miberas/` | 10,001 | `ls miberas/ \| wc -l` |
| Outbound links per mibera file | ~24 | `miberas/0001.md` sample |
| Total outbound links from miberas | ~240,024 | 10,001 × 24 |
| Link format (outbound) | `../core-lore/...`, `../traits/overlays/molecules/...`, `../traits/...` | Relative paths with `../` prefix |
| Inbound links to miberas | Thousands | Browse pages, drug backlinks |
| Link format (inbound) | `../miberas/XXXX.md` | Relative paths |
| Sharding depth change | `../` → `../../` for all outbound links | One extra parent traversal |

---

## 4. Complete File Specifications

### 4.1 `.obsidian/graph.json` (final state)

```json
{
  "collapse-filter": false,
  "search": "miberas",
  "showTags": false,
  "showAttachments": false,
  "hideUnresolved": false,
  "showOrphans": true,
  "collapse-color-groups": true,
  "colorGroups": [
    {
      "query": "path:core-lore/tarot-cards",
      "color": { "a": 1, "rgb": 10197430 }
    },
    {
      "query": "path:core-lore/ancestors",
      "color": { "a": 1, "rgb": 1750428 }
    },
    {
      "query": "path:core-lore",
      "color": { "a": 1, "rgb": 15158332 }
    },
    {
      "query": "path:traits/overlays/molecules",
      "color": { "a": 1, "rgb": 3066993 }
    },
    {
      "query": "path:traits",
      "color": { "a": 1, "rgb": 3447515 }
    },
    {
      "query": "path:browse",
      "color": { "a": 1, "rgb": 15527665 }
    },
    {
      "query": "path:birthdays",
      "color": { "a": 1, "rgb": 15969298 }
    },
    {
      "query": "path:miberas",
      "color": { "a": 1, "rgb": 13217868 }
    }
  ],
  "collapse-display": true,
  "showArrow": false,
  "textFadeMultiplier": -0.5,
  "nodeSizeMultiplier": 1.2,
  "lineSizeMultiplier": 0.5,
  "collapse-forces": true,
  "centerStrength": 0.6,
  "repelStrength": 6,
  "linkStrength": 1,
  "linkDistance": 100,
  "scale": 0.0702232054528092,
  "close": false
}
```

### 4.2 `.obsidian/app.json` (final state)

```json
{
  "userIgnoreFilters": [
    ".claude/",
    ".beads/",
    ".run/",
    ".ck/",
    "grimoires/",
    "_scripts/",
    "_schema/",
    "_data/",
    "node_modules/"
  ]
}
```

### 4.3 `.obsidian/core-plugins.json` (final state)

```json
{
  "file-explorer": true,
  "global-search": true,
  "switcher": true,
  "graph": true,
  "backlink": true,
  "canvas": true,
  "outgoing-link": true,
  "tag-pane": true,
  "footnotes": false,
  "properties": true,
  "page-preview": true,
  "daily-notes": true,
  "templates": true,
  "note-composer": true,
  "command-palette": true,
  "slash-command": false,
  "editor-status": true,
  "bookmarks": true,
  "markdown-importer": false,
  "zk-prefixer": false,
  "random-note": true,
  "outline": true,
  "word-count": true,
  "slides": false,
  "audio-recorder": false,
  "workspaces": false,
  "file-recovery": true,
  "publish": false,
  "sync": true,
  "bases": true,
  "webviewer": false
}
```

---

## 5. Verification Plan

| Check | Method |
|-------|--------|
| Color groups render | Open graph view in Obsidian, verify 8 distinct colors |
| Specific paths colored correctly | Zoom into a drug node → should be green; tarot → purple |
| Force settings usable | Graph doesn't freeze; clusters are visible at default zoom |
| Excluded dirs hidden | Open file explorer, search — `.claude`, `grimoires`, `_scripts` should not appear |
| Random note works | Cmd+P → "Open random note" → should open a random file |
| No link breakage | No config changes affect markdown content — zero risk |

---

## 6. Risks & Mitigation

| Risk | Mitigation |
|------|-----------|
| RGB integer calculation wrong | Verify one color visually; adjust if needed |
| `collapse-color-groups: true` hides color panel in graph settings | Set to `false` if user wants to see/edit groups in UI |
| `userIgnoreFilters` wrong syntax | Obsidian docs confirm trailing `/` for directories |
| Force settings need interactive tuning | Values are starting points; user adjusts via graph settings panel |
