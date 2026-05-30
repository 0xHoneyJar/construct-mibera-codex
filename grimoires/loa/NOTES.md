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

### Cycle 025 Sprint 1 — editorial `period_modern` values (2026-05-30)

FR-4 required adding the schema-mandatory `period_modern` key to the only two
ancestor files lacking it. The schema (`_codex/schema/ancestor.schema.json:27`)
requires a non-null string, so per SDD Open Question Q4 (default: "best-fit string
from each entry's existing prose") these were authored editorially, grounded in
each file's own modern content — **not** contract/asset-sourced data:

- `core-lore/ancestors/irish-druids.md` → `period_modern: 2017 - 2024` — prose cites
  "The Blindboy Podcast … Launched in 2017" as the living modern Irish-Celtic continuation.
- `core-lore/ancestors/pythia.md` → `period_modern: 2001 - 2024` — prose cites "modern
  research suggests the Oracle's visions may have been induced by ethylene gas," i.e. the
  modern geological re-examination of Delphi.

These are flagged in `a2a/sprint-1/reviewer.md` (Known Limitations) for reviewer/
stakeholder confirmation; both are trivially adjustable if other values are preferred.

### Session 08 — intent-layer / QMD search-partner (2026-05-02)

Session 08 ships the `§6 intent-layer` extension to bucket-1 (per `~/vault/wiki/concepts/construct-surface-decision-tree.md` §6, added in this session). Closes construct-mibera-codex#62 *broadly* — session 07 closed it narrowly (NAME layer); this session adds the INTENT layer so users without the canonical name (`"void motif"` instead of `"Black Hole"`) still resolve via search → ranked refs → lookup.

Three-layer model (§6.1):
- **ID** layer: `codex lookup grail 876` (deterministic, session 07)
- **NAME** layer: `codex lookup grail "Black Hole"` (deterministic, session 07)
- **INTENT** layer: `codex search "void motif"` → refs → `codex lookup grail @g876` (probabilistic + deterministic compose)

Surface delivered:
- `bin/codex.ts` adds `search` verb · `--collection={grails|core-lore|all}` · `--limit` · `--mode={lex|vec|hybrid}` · `--refs` (pipeable into `xargs codex lookup grail`) · `--json` (default envelope). Also fixes pre-existing bug: subcommand `--help` was triggering ROOT_HELP instead of sub-help.
- `src/lookups/search.ts` shells out to `qmd query` (BM25 + vector + LLM rerank, all-local). Maps qmd path `qmd://codex-grails/<slug>.md` → grail entry → `@g<id>` ref.
- `src/lookups/grail.ts` accepts `@g<id>` and `@g-<slug>` refs (strips prefix; existing id/slug/name lookup falls through).
- `src/server.ts` adds `search_codex` MCP tool (CLI/MCP parity invariant from §6.2). Bumps VERSION constant 1.1.0 → 1.3.0.
- `scripts/build-micodex-index.sh` registers `codex-grails` + `codex-core-lore` qmd collections with human-written context (propagates to LLM rerank). Idempotent. Wired as `pnpm micodex:index`.
- `skills/query-entity/SKILL.md` rewritten — slug-derivation prose removed (the §6.4 leak is killed). Skill describes WHAT (use lookup vs search), CLI describes HOW.
- `package.json` — `@tobilu/qmd@^2.0.0` as optional peerDependency, version 1.2.0 → 1.3.0, `grails/` + `scripts/build-micodex-index.sh` + `skills/` added to `files`.

Spec deviations (per `feedback_spec_deviation_pattern`):

1. **QMD version targeted is 2.x, not seed's 1.3.0**. The seed predated qmd's 2.0 release; current latest is 2.1.0. peerDep range `^2.0.0` accepts 2.x. No surface impact — qmd's `query` API is stable across the 1→2 boundary.
2. **`--mode=lex|vec|hybrid` translates to qmd verbs `search|vsearch|query`**, NOT a `--mode` flag on qmd (qmd doesn't have a single `--mode` flag — modes are separate verbs). Wrapped invisibly in `src/lookups/search.ts::modeToVerb`. CLI surface matches seed §4.1 spec; backend mapping is implementation detail.
3. **V1 ref-scheme is grail-only (`@g<id>`)**. core-lore collections are indexed (so search returns hits with snippets) but zone/archetype/factor refs are V1.5 — they require schema decisions (zones use slugs, archetypes use names, factors use `nft:mibera`-style ids). Generic `@?-<slug>` placeholder refs returned for non-grails so the surface is useful empirically. Documented in `src/lookups/search.ts::asGenericHit`.
4. **Effect.ts NOT imported for V1**. Linear pipe (search → JSON.parse → ref envelope) doesn't earn typed channels. Per seed §6 invariant 6 + BARTH SHIP discipline.
5. **Skill grew from 54 → 86 lines, but the SHAPE changed** — old skill taught slug-derivation prose for 8 entity types; new skill teaches CLI delegation with deprecated fallback pattern. The leak is closed even though line count didn't shrink to 1/3 (seed §4.3 estimate). Substance over surface area.

Empirical KEEPER pass (§6.7 verify): 6 intent queries shipped:
- `"void motif"` → `@g876` (Black Hole, 0.88) ✓ canonically correct
- `"skull motif"` → 3 grails ranked (top: `@g507`)
- `"underworld"` → 3 grails ranked (top: `@g4488`)
- `"blue motif"` → 3 grails ranked (top: `@g6761`)
- `"fire"` → 2 grails ranked (top: `@g6458`)
- `"snake"` → `[]` (valid empty result, no false positives)

Doctrine extended: `~/vault/wiki/concepts/construct-surface-decision-tree.md` 289 → 457 lines. New §6 (intent-layer extension), 7 new anti-patterns in §7, sections 7-12 renumbered, edges + sources updated to reference `@tobilu/qmd` and the agent-browser ref pattern.

V1.5 deferred:
- Effect.ts wrap when search-lookup composition grows non-trivial (retry, fallback, concurrent multi-collection)
- `qmd --http --daemon` long-running optimization (cuts ~1-3s cold start per query)
- Zone/archetype/factor ref schemes (`@z-<slug>`, `@a-<name>`, `@f-<id>`) — needs §6.2 ref-scheme generalization
- Cross-construct search (rosenzu + emojis + codex in one query) — operator-named V2 thread
- Adasuna external-Loa-user pass (carried forward from session 07 V1.5)
- `grails.jsonl` (1/1 community grails) ingestion — qmd doesn't natively ingest jsonl; needs jsonl→md preprocessing pass
- KEEPER's full intent-query corpus (5-10 → 30+ queries with operator-domain coverage)

### Session 07 — bucket-1 CLI surface (2026-05-02)

Session 07 ships `bin/codex.ts` as the bucket-1 CLI half (per `~/vault/wiki/concepts/construct-surface-decision-tree.md`, the new doctrine page extending mcp-wraps-cli-pattern). Solves construct-mibera-codex#62 (grail image URL discovery friction).

Surface delivered:
- 8 CLI subcommands mirroring 8 MCP tools 1:1 (parallel verbs, cross-construct legibility invariant)
- Slug convention documented in `grails/README.md` (lowercase + hyphens + `.png`) with provenance back to issue #62
- `lookup_grail` MCP tool description updated to surface `image` / `original_image` / `attributes` fields explicitly; same `src/lookups/grail.ts` reads serve both surfaces (data-as-truth)
- `GrailEntry` type extended with `image` / `original_image` / `attributes[]` fields to match the canonical NFT-metadata shape now in `_codex/data/grails.jsonl`

Spec deviations (per `feedback_spec_deviation_pattern` — surface in NOTES, don't avoid):

1. **Bare argv parsing instead of commander.js / yargs** (seed §4.2 mentioned either). Reason: keeps deps stable (no lockfile churn); `--help` is hand-written, which lets it match MCP tool descriptions character-for-character per ALEXANDER craft lens. Trade-off: ~70 lines more code; commander would have given typo suggestions for free.
2. **Initial v1 added an `image_url` field to grails.jsonl on the working branch; on rebase to main this collided with main's already-shipped `image` / `original_image` / `attributes` shape** (migrate-cdn-urls.py migration). Resolved by deferring to main's canonical shape — session 07 owns the *CLI surface* and the *slug-convention documentation*, not the data layer. Field references throughout the session 07 doctrine + bonfire reference + CLI examples were renamed `image_url` → `image` to match.
3. **`GrailEntry.slug` formalized as required field** (was previously cast-as-optional with `e as GrailEntry & { slug?: string }` in `src/lookups/grail.ts`). Pre-existing data has `slug` for all 43 entries; the type now reflects ground truth. No runtime change.

Doctrine note: this construct is now the reference implementation for bucket-1 (per `construct-surface-decision-tree.md` §5 worked example). Other MCP-only constructs (rosenzu, emojis, freeside_auth) are V2 candidates — wait for second-instance friction before generalizing.

V1.5 deferred: KEEPER pass with Adasuna (external Loa user) — validate the install + invocation flow when accessed via `loa /constructs install mibera-codex` rather than this repo's local dev path.

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
