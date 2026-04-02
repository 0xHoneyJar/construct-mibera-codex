# PRD: Data Quality & Tag Enrichment

**Cycle**: 005
**Date**: 2026-02-15
**Status**: Draft

---

## 1. Problem Statement

After 4 cycles of development, the Mibera Codex has strong structural integrity (0 audit errors, 8/8 semantic checks, 260K+ links). However, two data quality issues remain, and entity files lack semantic tags for clustering and discovery.

**Remaining data issues:**
- 5 drug files have YAML frontmatter values that generate parsing warnings
- Entity files (drugs, ancestors, tarot cards) have no `tags` field, limiting discoverability in Obsidian's tag pane and preventing semantic clustering

> Sources: grimoires/loa/NOTES.md (blockers #3), codex-improvement-research.md:254-265 (item #19)

---

## 2. Goals & Success Metrics

| Goal | Metric |
|------|--------|
| Zero YAML warnings | `generate-graph.py` runs with 0 warnings on all 78 drug files |
| Tags on all entity files | 189 files (78 drugs + 33 ancestors + 78 tarot cards) have `tags:` in frontmatter |
| Tag consistency | All tag values are lowercase, hyphenated slugs |
| No regressions | All existing audits pass (structure, links, semantic) |

---

## 3. User & Stakeholder Context

**Primary users:**
- Humans browsing on GitHub, GitBook, or Obsidian
- AI agents consuming the codex via llms.txt, JSONL, or graph.json

**Value of tags:**
- Obsidian: Tag pane provides instant filtering and clustering
- GitHub: Frontmatter tags are visible in file view, aid search
- AI: Tags provide lightweight semantic signals beyond raw field values

---

## 4. Functional Requirements

### F1: Fix Drug YAML Warnings

Fix frontmatter issues in 5 drug files that generate PyYAML warnings during graph generation: `ancestral-trance.md`, `euphoria.md`, `sober.md`, `st-johns-wort.md`, `weed.md`.

**Acceptance criteria:**
- `generate-graph.py` produces 0 warnings
- No change to parsed field values (fix quoting/encoding only)
- All audits pass after fix

### F2: Auto-Generate Tags on Entity Files

Add a `tags:` field to YAML frontmatter of all drug, ancestor, and tarot card files. Tags are derived from existing frontmatter fields — no manual curation needed.

**Tag derivation rules:**

*Drugs (78 files):*
- `archetype` → archetype slug (e.g., `freetekno`, `milady`, `chicago-detroit`, `acidhouse`)
- `era` → era tag (e.g., `ancient`, `modern`)
- `ancestor` → ancestor slug
- Element derived from drug→tarot→element chain (via tarot card mapping)

*Ancestors (33 files):*
- Period tags from `period_ancient`/`period_modern` (e.g., `ancient`, `modern`, `both`)
- Location-derived region tags from `locations` (e.g., `mediterranean`, `asia`, `americas`)

*Tarot Cards (78 files):*
- `suit` → suit slug (e.g., `major-arcana`, `cups`, `wands`, `pentacles`, `swords`)
- `element` → element slug (e.g., `fire`, `water`, `earth`, `air`)
- `drug_type` → drug type slug (e.g., `ancient`, `modern`)

**Tag format:**
```yaml
tags:
  - freetekno
  - ancient
  - greek
  - earth
```

**Acceptance criteria:**
- All 189 entity files have a `tags:` array in frontmatter
- All tag values are lowercase, hyphenated slugs (no spaces, no uppercase)
- Tags are derived deterministically from existing fields (scriptable, reproducible)
- Script is idempotent (re-running produces identical output)
- Existing frontmatter fields are preserved unchanged
- All audits pass after tag addition

### F3: Regenerate Dependent Artifacts

After modifying frontmatter, regenerate:
- `_data/miberas.jsonl` (if Mibera tags are affected — they are not in this scope)
- `_data/graph.json` (to verify 0 warnings)
- `llms-full.txt` (entity files changed)

**Acceptance criteria:**
- All generated artifacts reflect updated frontmatter
- graph.json validation passes (0 orphans, 0 bad refs, 10K Miberas, 0 duplicates)

---

## 5. Technical Constraints

- **Pure Markdown on GitHub** — no build steps, no static site
- **Python 3 scripts** — consistent with existing `_scripts/` pattern
- **YAML frontmatter** — standard `---` delimited, parseable by PyYAML
- **Idempotent generation** — scripts can be re-run safely
- **macOS compatible** — no GNU-specific tools

---

## 6. Scope & Prioritization

**In scope:**
- F1: Fix 5 drug YAML warnings
- F2: Auto-generate tags on 189 entity files (drugs, ancestors, tarot cards)
- F3: Regenerate dependent artifacts

**Out of scope:**
- Tags on trait files (1,257 files — future cycle if desired)
- Tags on Mibera files (10,000 files — derivable from existing fields, low marginal value)
- Manual tag curation (auto-generation only)
- Hierarchical/nested tag taxonomy
- Tag-based browse pages (future cycle)

---

## 7. Risks & Dependencies

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Tag derivation misses edge cases | Medium | Cross-reference against graph.json node types |
| Ancestor location parsing ambiguous | Medium | Use simple keyword→region mapping, skip ambiguous |
| Drug→element chain requires tarot lookup | Low | Tarot cards already have drug + element fields |
| Frontmatter modification breaks existing tools | Low | Run all 3 audits after every change |

---

## 8. Deliverables

| Artifact | Path |
|----------|------|
| Tag generation script | `_scripts/generate-tags.py` |
| Updated drug files (5 YAML fixes) | `traits/overlays/molecules/*.md` |
| Updated drug files (78 with tags) | `traits/overlays/molecules/*.md` |
| Updated ancestor files (33 with tags) | `core-lore/ancestors/*.md` |
| Updated tarot card files (78 with tags) | `core-lore/tarot-cards/*.md` |
| Regenerated graph | `_data/graph.json` |
| Regenerated llms-full | `llms-full.txt` |
