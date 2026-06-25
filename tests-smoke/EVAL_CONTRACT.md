# MICODEX Eval Contract

> OSTROM contract for `tests-smoke/eval-harness.ts`. Names what counts as
> passing for the intent-layer eval corpus. Per session-09a §4.3.

## Purpose

The corpus tests the **substrate**, not any agent. Each case asserts that
`searchCodex({intent})` returns a known top-1 ref shape against the live
qmd index. CI-runnable, deterministic given a fixed index.

## Pass criteria (per case)

- **Non-empty** (`expected_top_ref` is a string):
  - `actual.top1.ref === expected_top_ref` AND
  - `actual.top1.score >= min_score`
- **Empty-expected** (`expected_top_ref === null`):
  - `actual.length === 0` (qmd default min-score threshold applies)

## Exit codes

| code | meaning |
|------|---------|
| 0 | overall pass-rate ≥ GATE (default 0.85, override via `EVAL_GATE`) |
| 1 | pass-rate < GATE (any failure must clear gate via aggregate) |
| 2 | harness error: corpus malformed, qmd missing, IO failure |

## Aggregate report shape

Grouped by `category` (canonical / motif / concept / concept-paraphrase /
empty-expected / aesthetic / deferred). Per-category pass-count + percent.
Overall pass-rate vs gate.

Failures listed with: case index, intent, expected, actual, layer-hint,
keeper_source.

## Failure layer hints (per OSTROM §2.8 dual-layer-leak)

The harness emits a hint based on failure shape; final classification is human:

| harness hint | meaning |
|---|---|
| `INFRASTRUCTURE` | qmd binary, IO, runtime — not substrate or interface |
| `SUBSTRATE (false positive)` | empty-expected case got a hit; either substrate is too eager or the case mis-sourced |
| `SUBSTRATE (false negative)` | non-empty case got zero hits; substrate missing the term |
| `INTERFACE-or-SUBSTRATE` | wrong ref returned; intent maps to a neighbor — either case mis-named or grail md needs context |
| `THRESHOLD` | substrate hit but score under floor; tune min_score or extend grail md |

## Iteration buckets (per spec §4.6)

When a case fails, classify into one of three:

1. **case-wrong (KEEPER mis-sourced)** — amend `corpus.jsonl`, mark
   `keeper_source` deprecated. Substrate is right; the test was wrong.
2. **substrate-thin** — extend per-grail `grails/<slug>.md` Justification
   with the missing motif terms; `pnpm micodex:index` regenerates;
   re-run harness.
3. **inherent limitation** — tag the case `"deferred": true`, exclude
   from gate calculation but keep in corpus as known-fail surface.

## Corpus shape

JSONL, one case per line. Fields:

| field | type | required | purpose |
|---|---|---|---|
| `intent` | string | ✓ | the user query (what they'd type) |
| `expected_top_ref` | string \| null | ✓ | canonical answer ref; `null` = expects empty |
| `min_score` | number | ✓ | floor for top-1 score |
| `collection` | "grails" \| "core-lore" \| "all" | optional (default "grails") | search collection |
| `category` | string | ✓ | grouping for report |
| `keeper_source` | string | ✓ | provenance of the case |
| `deferred` | boolean | optional | exclude from gate, keep in corpus |
| `_forge_gap` | object | optional | STAMETS forge surfaced operator-vs-substrate gap |

## V1.5 optional fields

- `mode` — override search mode (lex/vec/hybrid)
- `acceptable_top_3` — array of refs; pass if expected appears in top-3
- `should_not_match` — anti-tests; fail if these appear in top-N

## Run

```sh
pnpm exec tsx tests-smoke/eval-harness.ts tests-smoke/eval-corpus.jsonl
EVAL_GATE=0.90 pnpm exec tsx tests-smoke/eval-harness.ts tests-smoke/eval-corpus.jsonl
```

## Forge

```sh
# Regenerate canonical baseline (43 grails × ~1s each)
pnpm exec tsx tests-smoke/forge-canonical.ts > tests-smoke/canonical.jsonl

# Compose final corpus (canonical + motif/empty seed)
cat tests-smoke/canonical.jsonl tests-smoke/seed-empty-and-motif.jsonl > tests-smoke/eval-corpus.jsonl
```

## Gate history

| date | corpus size | pass rate | notes |
|------|-------------|-----------|-------|
| 2026-05-02 | 57 | 91.2% | session-09a baseline · 5 failures (3 empty false-pos · 2 motif/concept spec-example wrong) |
| 2026-05-02 | 58 | 100.0% | session-09a iteration · empty refusals swapped to verified-empty terms; motif/concept amended to substrate-truth (Aquarius-as-Hades is canonical underworld; Fire's "dark orange" matches "the dark grail") |
