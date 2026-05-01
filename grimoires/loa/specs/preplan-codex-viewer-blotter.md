# Preplan — Mibera Codex Viewer (web-blotter integration)

> **Status**: PRE-KICKOFF stub. This document captures Session B's scope so the next `/kickoff` invocation has grounded context. The actual ARCH + build doc lands when operator runs `/kickoff` for this session.
> **Date**: 2026-04-30 (preplan)
> **Decision direction**: coordinate with Gumi to ship a **web-blotter** that shares blotter's React frontend (no Tauri/Rust for web build); Mibera Codex docs site embeds it as the codex content browser.

---

## Why this session exists

> "MCPs are just a portion of the codex, people will be able to navigate the entire codex via this site" — operator, 2026-04-30

The docs site as it exists today shows 8 MCP tools. The full codex is ~1,500+ markdown files (120 core-lore + 1,349 traits + 44 grails + 13 mibera-sets + miberas data + 78 drug-tarot + ancestor cultures). Blotter was built BY Gumi, FOR this codex, as a desktop vault explorer. Bringing blotter's UX patterns to the web — without rebuilding from scratch — is the move.

---

## What's true today (DIG findings)

### Blotter

| | |
| --- | --- |
| Repo | https://github.com/0xHoneyJar/blotter |
| Stack | Tauri 2 + React 19 + Vite + TypeScript + Rust backend + CodeMirror 6 + Shiki + Zustand |
| Frontend dir | `src/` (App.tsx, components, lib, store, styles, workers for indexing) |
| Backend dir | `src-tauri/` (Rust: parser, query, search, store, vault) |
| Maintainer | @gumibera |
| Status | pre-release v0.1.0, build-from-source only, no installer yet |
| License | AGPL-3.0 |
| Designed for | "Vaults with 10,000+ notes" — the Mibera Codex IS that vault |

### Blotter features (in scope for web-port)

- Browse + search markdown vault with **faceted filtering**
- **Live editor** with CodeMirror 6 (wikilinks, callouts, checkboxes, frontmatter, tables, Dataview blocks)
- **Syntax highlighting** via Shiki
- **Gallery view** for image-heavy vaults
- **Graph view** with force-directed layout
- **Infinite canvas moodboard** (multi-select, card colors, text labels)
- **Outline panel**, **backlink navigation**, **link hover previews**
- **Tab management**, **split view**, **command palette**
- **Keyboard-driven workflow**

### What's NOT portable

- Tauri's native filesystem APIs (web has no fs)
- Rust backend (parser/query/search/store) — needs JS/TS replacement OR moved to a server
- Cross-platform native builds (web is web)

### The codex vault scale

| dir | files | content |
| --- | --- | --- |
| `core-lore/` | 120 md | archetypes, zones, factor-lore, drug-tarot, ancestors |
| `traits/` | 1,349 md | every visual trait per category |
| `grails/` | 44 md | 1/1 NFTs |
| `mibera-sets/` | 13 md | Honey Road sets 1-7 + companion content |
| `_codex/data/` | jsonl | 10,000 mibera trait blobs + grails + miberas |

≈1,500+ markdown files + jsonl data. Currently invisible from the docs site.

---

## Open architectural questions (for the proper /kickoff)

### Q1 — How does web-blotter get its data?

The vault content lives in the codex repo. Options:

- **(a) Build-time bundle**: at vocs build, parse all markdown files + frontmatter + wikilinks into a static JSON index. Frontend fetches the index, renders pages from raw markdown URLs. **Pro**: pure static, no server. **Con**: 1,500-file index = potentially large bundle.
- **(b) Lightweight server**: a small Cloudflare Worker / Vercel function that serves the index + handles search queries. **Pro**: scales beyond static limits, search is server-side. **Con**: introduces backend ops.
- **(c) Embed Algolia or similar**: hosted search index. **Pro**: zero ops. **Con**: external dep, vault content goes to Algolia.

Lean: **(a) build-time bundle** for v1 — vocs is already static, the content is bounded, search can be client-side.

### Q2 — Repo structure — where does web-blotter live?

- **(a) Inside `blotter` repo** as `apps/web/` or `packages/web/` — shared monorepo, frontend code shared between desktop and web. Requires Gumi coordination + agreement on monorepo shape.
- **(b) New repo** `0xHoneyJar/blotter-web` — independent repo, depends on `blotter` for shared frontend code (npm package or git subtree). Decoupled from Gumi's desktop work.
- **(c) Inside `construct-mibera-codex/docs/`** — viewer code lives in the docs site. Diverges from blotter immediately. Don't recommend.

Lean: **(a) monorepo in blotter** — shared frontend, single source of truth for the viewer.

### Q3 — How does the codex docs site embed it?

- **(a) Subroute on the docs site** — `/codex/*` routes render web-blotter components inside vocs's layout. Requires vocs config gymnastics (custom routes) OR a separate route handler.
- **(b) Subdomain** — `codex.0xhoneyjar.xyz` runs web-blotter standalone; main docs site at `docs.0xhoneyjar.xyz` cross-links. Cleaner separation, two surfaces.
- **(c) Subpath served by web-blotter** — web-blotter becomes the primary host, docs is a subpath inside web-blotter's routing.

Lean: **(b) subdomain** for v1 — cleanest. Docs site stays vocs-pure; codex viewer is its own thing.

### Q4 — What's the v1 cut for web-blotter feature parity?

- Must have: browse + read markdown · search · backlinks · link previews · syntax highlighting
- Should have: faceted filter, outline panel, graph view
- Could defer: live editor (read-only first), infinite canvas, tab management, split view
- Will not (v1): native filesystem, plugin system

---

## Coordination with Gumi (required before /kickoff)

Topics to align on:

1. **Monorepo move** — does Gumi want `apps/desktop` + `apps/web` shape in blotter? Or separate repo with shared package?
2. **Frontend shared layer** — what becomes `packages/blotter-frontend` (vault abstraction, components, hooks, store)? What stays per-app?
3. **Vault contract** — desktop reads from filesystem; web reads from build-time index. Both implement an `IVault` interface?
4. **Branding** — blotter has its own brand (BLOTTER-BRAND.md). Web-blotter inherits. Does it co-brand with Mibera Codex on `codex.0xhoneyjar.xyz`?
5. **Timing** — Gumi has bandwidth for this when?

This document IS the operator's coordination brief for that conversation.

---

## What this preplan does NOT cover (yet)

- The actual blast-radius mapping (needs Gumi's monorepo decisions)
- Specific vault index schema
- Mibera Codex side: which markdown files to expose, in what order, with what URL structure
- Authentication (codex content is public; assume no auth for v1)
- Editing flow (deferred — read-only first)

---

## Next step

When operator is ready: `/kickoff "codex viewer with blotter integration" --target-repo construct-mibera-codex` (or wherever the integration lands). That kickoff will:

1. Read this preplan
2. Coordinate with Gumi on Q1-Q5 above
3. Run a deeper DIG into blotter's frontend code structure
4. Produce arch-doc + build-doc for the actual session

For now, this stub is the operator's coordination input.
