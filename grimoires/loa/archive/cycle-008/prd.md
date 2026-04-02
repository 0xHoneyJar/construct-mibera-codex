# PRD: GitHub-First Navigation Restructure

**Cycle**: 008
**Created**: 2026-02-17
**Status**: Draft

---

## 1. Problem Statement

The Mibera Codex's primary consumption interface is **GitHub** — for both humans and LLMs/AI. The current directory structure has two problems that degrade the GitHub browsing experience:

1. **31 `index.md` files get no special treatment on GitHub.** GitHub auto-renders `README.md` below a directory's file listing, but does NOT do this for `index.md`. Every content directory has a curated landing page that nobody sees unless they explicitly click into `index.md`.

2. **Four infrastructure directories (`_scripts/`, `_schema/`, `_templates/`, `_data/`) dominate the root listing.** The `_` prefix sorts before alphabetic characters, making build tooling the first four entries a visitor encounters. For a codex about mythology and generative art, this is the wrong first impression.

> **Context**: The codex owner is building an Obsidian alternative and using this codex as a test case. GitHub is the primary interface, not Obsidian. This restructure optimizes for GitHub while maintaining machine-readability for AI and programmatic consumers.

> Sources: conversation analysis of codex hierarchy, GitHub rendering behavior

---

## 2. Goals & Success Metrics

### Goals

1. **GitHub directory landing pages work automatically** — navigating to any content directory shows its index content rendered below the file listing
2. **Content-first root listing** — infrastructure is consolidated so content directories are the first things visitors see
3. **Zero broken links** — all internal references updated, validated by `audit-links.sh`
4. **AI/machine access unaffected** — `manifest.json`, `llms.txt`, and all schemas continue to work with updated paths

### Success Metrics

| Metric | Target |
|--------|--------|
| Broken links after migration | 0 new breaks |
| GitHub auto-rendering | README.md renders in all content directories |
| Root-level `_` directories | 1 (down from 4) |
| Script functionality | All generators produce identical output |

---

## 3. Users & Stakeholders

| Persona | How they navigate | What matters to them |
|---------|-------------------|---------------------|
| **Casual browser** (human) | GitHub file listing, clicking directories | Content-first impression, landing pages visible |
| **Deep researcher** (human) | SUMMARY.md, browse pages, cross-links | Links work, navigation paths unchanged |
| **LLM/AI agent** | `llms.txt` → `manifest.json` → specific files | Paths in manifest.json resolve correctly |
| **Contributor** | Scripts, schemas, templates | Infrastructure findable and documented |
| **Codex owner** | All of the above + scripts | Everything works, gap analysis for Obsidian alternative |

---

## 4. Functional Requirements

### FR-1: Rename `index.md` → `README.md` in content directories

**Scope**: 26 content-directory index files (excluding `grimoires/` framework files)

Files to rename:
- `browse/index.md`
- `grails/index.md`
- `miberas/index.md`
- `traits/overlays/molecules/index.md`
- `birthdays/index.md`
- `special-collections/index.md`
- `core-lore/ancestors/index.md`
- `core-lore/tarot-cards/index.md`
- `traits/index.md`
- `traits/accessories/earrings/index.md`
- `traits/accessories/face-accessories/index.md`
- `traits/accessories/glasses/index.md`
- `traits/accessories/hats/index.md`
- `traits/accessories/masks/index.md`
- `traits/backgrounds/index.md`
- `traits/character-traits/body/index.md`
- `traits/character-traits/eyebrows/index.md`
- `traits/character-traits/eyes/index.md`
- `traits/character-traits/hair/index.md`
- `traits/character-traits/mouth/index.md`
- `traits/character-traits/tattoos/index.md`
- `traits/clothing/long-sleeves/index.md`
- `traits/clothing/short-sleeves/index.md`
- `traits/clothing/simple-shirts/index.md`
- `traits/items/bong-bears/index.md`
- `traits/items/general-items/index.md`
- `traits/overlays/astrology/index.md`
- `traits/overlays/elements/index.md`
- `traits/overlays/ranking/index.md`

**Link updates required**:
- 10,000 Mibera files: `[← Back to Index](index.md)` → `[← Back to Index](README.md)`
- Root `README.md`: 9 references to content `index.md` files
- `SUMMARY.md`: 29 references to content `index.md` files
- 6 browse pages: `(index.md)` → `(README.md)`
- `birthdays/timeline.md`: 1 reference
- `_schema/README.md`: 2 references
- Scripts that generate `index.md` links: `generate-browse.sh`, `generate-clusters.py`

**Acceptance criteria**:
- [ ] All 26 content index.md files renamed to README.md
- [ ] All `(index.md)` links in content files updated to `(README.md)`
- [ ] Scripts updated to generate `README.md` references
- [ ] `audit-links.sh` reports 0 new broken links

### FR-2: Consolidate infrastructure directories into `_codex/`

**Current state** (4 root-level directories):
```
_data/       → 4 files (miberas.jsonl, grails.jsonl, graph.json, stats.md)
_schema/     → 10 files (8 schemas, ontology.yaml, README.md)
_scripts/    → 15 files + reports/ subdirectory
_templates/  → 6 files
```

**Target state** (1 root-level directory):
```
_codex/
  data/       → 4 files (unchanged)
  schema/     → 10 files (unchanged)
  scripts/    → 15 files + reports/ (unchanged)
  templates/  → 6 files (unchanged)
```

**Path updates required**:
- `manifest.json`: 15+ path references (schemas, data exports, ontology)
- `llms.txt`: 3 path references
- `SUMMARY.md`: 1 path reference
- `_codex/schema/README.md`: internal script references
- `_codex/schema/ontology.yaml`: 7 schema path references
- `_codex/scripts/README.md`: invocation path
- All Python scripts: hardcoded `_data/`, `_scripts/` path strings
- All Bash scripts: `REPORT_DIR` and self-referencing paths
- Generated file headers: auto-fix on next script run

**Acceptance criteria**:
- [ ] All files moved to `_codex/` subdirectories
- [ ] Old `_data/`, `_schema/`, `_scripts/`, `_templates/` directories removed
- [ ] All path references updated across manifest, llms.txt, SUMMARY.md
- [ ] All script internal paths updated
- [ ] Scripts produce identical output when run from new location
- [ ] `audit-links.sh` reports 0 new broken links

### FR-3: Update navigation and machine-readable files

- `manifest.json`: All schema, data, and generator paths updated
- `llms.txt`: Schema and data references updated
- `SUMMARY.md`: 1 schema path update + 29 `index.md` → `README.md` link updates
- `README.md` (root): 9 `index.md` → `README.md` link updates

**Acceptance criteria**:
- [ ] `manifest.json` paths all resolve correctly
- [ ] `llms.txt` paths all resolve correctly
- [ ] All 29 SUMMARY.md content links updated to `README.md`
- [ ] All 9 root README.md content links updated to `README.md`

---

## 5. Technical Constraints

- **Python scripts are stdlib-only** — no external dependencies, regex-based YAML parsing
- **All path changes must be mechanical** — no content changes, no structural logic changes
- **Scripts must be self-consistent** — each script's internal `REPO_ROOT` relative paths must work from `_codex/scripts/`
- **Generated files update on next run** — headers with old paths in browse pages will auto-fix when generators run
- **macOS compatibility** — BSD tools, use Python for regex operations

---

## 6. Scope & Prioritization

### In scope
- Rename 26 `index.md` → `README.md`
- Update all `(index.md)` link references (~10,015 files)
- Move 4 directories into `_codex/`
- Update all infrastructure path references (~30 files)
- Re-run all generators to update headers
- Full link audit validation

### Out of scope
- Content changes to any index/README page
- New navigation features
- Root-level file reorganization (llms.txt, manifest.json stay at root)
- Framework files in `grimoires/` (not part of public codex)
- `.gitignore` changes (infrastructure should remain in repo for contributors)

---

## 7. Risks & Dependencies

| Risk | Impact | Mitigation |
|------|--------|------------|
| 10,000+ file rename creates massive git diff | PR review noise | Mechanical change, easily verified with grep |
| Script path breakage | Generators fail silently | Run every generator after migration, diff output |
| External tools reference old paths | Broken integrations | `manifest.json` is the canonical API surface; update it first |
| Merge conflicts if other work in progress | Lost changes | Complete in single sprint, merge promptly |

---

## 8. Blast Radius Summary

| Category | Files affected | Type of change |
|----------|---------------|----------------|
| Mibera files | 10,000 | Link text: `index.md` → `README.md` |
| Index files renamed | 26 | File rename |
| Root README.md | 1 | 9 `index.md` → `README.md` link updates |
| SUMMARY.md | 1 | 29 `index.md` → `README.md` + 1 schema path |
| Infrastructure files moved | ~35 | Directory relocation |
| Script internal paths | ~15 | String replacement |
| Navigation files | 3 | Path updates (manifest, llms.txt, SUMMARY) |
| Browse pages | 6 | Link update + auto-regenerated headers |
| Schema cross-references | 2 | Path updates (ontology, schema README) |
| Other content files | 1 | birthdays/timeline.md |
| **Total** | **~10,090** | Mechanical, no logic changes |
