#!/usr/bin/env bash
# count-entities.sh — Emit authoritative per-entity-type counts for the Mibera Codex.
#
# FR-2 (cycle-025): produces the committed entity-counts.json artifact that canonical-doc
# counts are derived from. Note: this is NOT the runtime gate — health-report.py recomputes
# counts independently from disk reality so it can detect drift in BOTH the docs and this
# artifact (two independent disk-counters, by design, not one shared source).
# The `files` (on-disk) vs `concept` (conceptual entity count) split is the whole point —
# conflating the two is the chronic drift bug this cycle exists to kill. Where they differ,
# the entry carries an explicit note (e.g. traits: 1326 files / 1337 unique concept).
#
# stdlib only (find/wc/ls/printf), macOS/BSD-compatible. Emits JSON to stdout AND writes
# _codex/data/entity-counts.json. The find/ls invocations are lifted verbatim from
# sdd.md §0 (the commands that produced the verified-reality table).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"

OUT="_codex/data/entity-counts.json"

# --- File counts, computed from the working tree (sdd.md §0) ---
mibera_files=$(find miberas -name '[0-9]*.md' | wc -l | tr -d ' ')
miparcel_files=$(find miparcels -maxdepth 1 -name '[0-9]*.md' | wc -l | tr -d ' ')
grail_files=$(ls grails/*.md | grep -vi README | wc -l | tr -d ' ')
fracture_files=$(ls fractures/*.md | grep -viE 'README|index' | wc -l | tr -d ' ')
birthday_files=$(ls birthdays/*.md | wc -l | tr -d ' ')
trait_files=$(find traits -name '*.md' ! -name README.md ! -name overview.md | wc -l | tr -d ' ')
drug_files=$(find traits/overlays/molecules -name '*.md' ! -name README.md ! -name drug-pairings.md | wc -l | tr -d ' ')
tarot_files=$(find core-lore/tarot-cards -name '*.md' ! -name README.md | wc -l | tr -d ' ')
ancestor_files=$(find core-lore/ancestors -name '*.md' ! -name README.md | wc -l | tr -d ' ')
special_files=$(find special-collections -name '*.md' ! -name README.md | wc -l | tr -d ' ')
special_subdirs=$(find special-collections -mindepth 1 -type d | wc -l | tr -d ' ')
set_files=$(find mibera-sets -name '*.md' ! -name README.md | wc -l | tr -d ' ')

generated=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# --- Emit JSON. `concept` constants are canonical (project lore); `files`/`eras`/
# `subcollections` are computed above. Notes state any files-vs-concept divergence. ---
json=$(cat <<JSON
{
  "generated": "$generated",
  "source": "count-entities.sh — find/wc/ls over the working tree (sdd.md §0)",
  "counts": {
    "mibera":             { "files": $mibera_files,   "concept": 10000 },
    "miparcel":           { "files": $miparcel_files, "concept": 10000 },
    "grail":              { "files": $grail_files,    "concept": 44, "note": "42 canonical + 2 community" },
    "fracture":           { "files": $fracture_files, "concept": 10 },
    "birthday":           { "files": $birthday_files, "eras": 10, "note": "10 eras + README + timeline" },
    "trait":              { "files": $trait_files,    "concept": 1337, "note": "1337 unique = 1323 imaged + 14 metadata-only" },
    "drug":               { "files": $drug_files,     "concept": 78 },
    "tarot_card":         { "files": $tarot_files,    "concept": 78 },
    "ancestor":           { "files": $ancestor_files, "concept": 33 },
    "special_collection": { "files": $special_files,  "subcollections": $special_subdirs, "concept": 33, "note": "$special_files files / $special_subdirs populated subdirs; 33 = documented collaborations" },
    "mibera_set":         { "files": $set_files,      "concept": 12 }
  }
}
JSON
)

printf '%s\n' "$json" > "$OUT"
printf '%s\n' "$json"
