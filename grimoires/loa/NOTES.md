# Project Notes

## Learnings

- Mibera files now have YAML frontmatter AND markdown tables (Cycle 003 migration)
- Previously, Mibera files used only Markdown tables — different from traits/drugs
- Trait schemas vary by subcategory: accessories/clothing/items have `archetype`+`swag_score`, but body/character/overlays don't
- macOS BSD awk doesn't support capture groups in `match()` — use python3 for regex
- macOS grep doesn't support `-oP` — use python3 or sed for portable regex
- Bulk text replacements on drug names can accidentally hit image filenames and trait item names — scope replacements carefully
- Drug "Sakae Naa" and "Sakae Na" are the same drug (Combretum quadrangulare) — canonical name is "Sakae Na"
- Drug filename `mucana-pruriens.md` was a typo — correct spelling is `mucuna-pruriens.md`
- Drug `yohimbine.md` renamed to `yohimbe.md` — "yohimbine" is the alkaloid, "yohimbe" is the plant
- Drug `date_added` values were all "Month DD, YYYY" format — normalized to ISO 8601
- Drug `swag_score` was stored as quoted strings ('1'-'5') — ~12 drugs had multi-value comma-separated scores
- 56 trait files had `**Introduced By:**` in the `date_added` field — normalized to null
- ~6 trait files had Discord/Amazon URLs appended to swag_score — extracted leading integer
- `llms-full.txt` is 534KB (exceeds 300KB target) because drug/ancestor files have rich content

## Next Cycle Fixes

- **black-niqab.md** — image needs fixing before embedding (currently at `traits/clothing/long-sleeves/black-niqab.md`, image field cleared)
- **4 VM entries still need source art**: propeller (hat), cancer-crab (item), closed (eyes), waleswoosh-pink-face-mask (mask)
- **132 orphan images** from sprint-1 still need codex entries or mapping fixes (color variants, SS-vending, misc)

## Blockers

### Remaining content gaps

1. **PROCESS.md framework references** — Links to `INSTALLATION.md` and `docs/architecture/capability-schema.md` which are Loa framework docs, not codex content. Harmless.
2. **`_schema/README.md` template examples** — Contains placeholder links (`slug.md`, `NNNN.md`) that intentionally don't resolve. Could add a note or use different syntax.
3. **5 drug files with YAML parsing warnings** — `ancestral-trance.md`, `euphoria.md`, `sober.md`, `st-johns-wort.md`, `weed.md` have unquoted single quotes in `origin` field (e.g., `origin: Nature's pharmacy`). PyYAML warns but parses them. Fix requires quoting the values.
4. **Ancestor name inconsistencies in drug files** — Drug files use slightly different ancestor names than Mibera files (e.g., "Native Americans" vs "Native American", "Mesoamerican" vs specific ancestors). Graph export shows 51 ancestor nodes vs 33 canonical. Needs normalization pass.

### Resolved in Cycle 002

- ~~Missing `traveller.md` ancestor~~ → Created stub (92 links resolved)
- ~~3 missing drug files~~ → Were actually naming mismatches; renamed `mucana-pruriens.md` → `mucuna-pruriens.md`, `yohimbine.md` → `yohimbe.md`
- ~~`ecstasy-brown-2.md`, `crying-ocean-2.md`~~ → Created stubs
- ~~Corrupted `sakae-naa.md`~~ → Deleted (duplicate of `sakae-na.md`), references redirected
- ~~4 special collections missing `type` field~~ → Added type to apdao, beradoge, berakin, gumball
- ~~PROCESS.md framework links~~ → Confirmed valid (false positive in Cycle 001)

### Resolved in Cycle 003

- ~~Mibera files had no YAML frontmatter~~ → All 10,000 now have 29-field frontmatter
- ~~Drug swag_score as quoted strings~~ → All normalized to integers
- ~~Date formats inconsistent (20+ patterns)~~ → All normalized to ISO 8601 or null
- ~~No bulk data export~~ → `_data/miberas.jsonl` (10,000 lines, 6.1 MB)
- ~~No formal JSON schemas~~ → 7 schema files in `_schema/`
- ~~No semantic validation~~ → `audit-semantic.py` with 8 cross-reference checks
- ~~No backlinks on entity files~~ → 188 files with `@generated:backlinks` sections
- ~~No LLM full context file~~ → `llms-full.txt` (534KB, 117 sections)
- ~~No community infrastructure~~ → deferred (not needed for single-maintainer repo)

### Resolved in Cycle 004

- ~~`bufotenine.md` naming mismatch~~ → Renamed to `bufotenin.md` (canonical), updated 155+ files
- ~~`hiberanation-eye-mask-2.md` phantom reference~~ → Removed duplicate line from masks/index.md
- ~~No cross-dimensional browse~~ → 274 cluster MOC pages (archetype×ancestor, archetype×element, ancestor×element)
- ~~No aggregate statistics~~ → `_data/stats.md` with 10 statistic sections
- ~~No entity relationship graph~~ → `_data/graph.json` (10,237 nodes, 70,302 edges, 5.4 MB)
- ~~No formal ontology~~ → `_schema/ontology.yaml` (12 entity types, 11 relationships, signal hierarchy)
- ~~Semantic audit 7/8~~ → Now 8/8 (bufotenin bidirectional reference resolved)

## Decisions

### P2 Item 1: Schema meta blocks with confidence levels — IMPLEMENTED (Cycle 012)
Added `x-codex-confidence` and `x-codex-source` annotations to all 65 fields across 8 schema files. Used JSON Schema `x-` extension mechanism (non-breaking). Three confidence levels: canonical (77%), derived (1.5%), community (21.5%). Seven source types: contract-metadata, project-lore, project-asset, editorial, research, artist, classification.

## Observations

- 10,000 Mibera files are 100% structurally consistent — zero issues
- After Cycle 003: 248,487 links across 11,545 files — 10 remaining broken (all out-of-scope edge cases)
- After Cycle 004: 260,371 links across 11,820 files — 8 remaining broken (framework refs + template examples)
- Structural audit: **0 errors, 0 warnings** across all files
- Total backlinks added: ~9,350 new links across 188 entity files
- Semantic audit: **8/8 pass** (all cross-reference checks)
- JSONL export: 10,000 records, 6.1 MB, all fields validated
- Scripts: 9 total in `_scripts/` (2 audit, 1 browse gen, 1 frontmatter, 1 normalize, 1 export, 1 semantic, 1 backlinks, 1 llms-full, 3 generators)
- Cluster stats: 274 pages — 132 archetype×ancestor, 16 archetype×element, 126 ancestor×element
- Graph export: 10,237 nodes (10K Miberas + 237 dimension values), 70,302 edges, 5.4 MB
- Stats dashboard: Milady is 37.39% of all Miberas, Hindu most common ancestor (6.64%), swag scores skew low (10-19 bucket largest at 2,660)
- Audit scripts run in ~20 seconds total (14s structure + 6s links)
- Cluster page links must use `../../../` (3 levels up) — caught by audit-links.sh after initial `../../` error generated 11,020 broken links
- `generate-graph.py` self-validates: orphan nodes, edge refs, expected counts, duplicate edges
