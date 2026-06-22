#!/usr/bin/env bash
# Regenerate all data exports derived from codex content.
# Run this after adding/editing miberas, grails, traits, or core-lore,
# then commit the regenerated files alongside the content change.
set -euo pipefail
cd "$(dirname "$0")/../.."

# Generators need PyYAML; fall back to system python if the default lacks it
PY=python3
$PY -c 'import yaml' 2>/dev/null || PY=/usr/bin/python3
$PY -c 'import yaml' 2>/dev/null || { echo "ERROR: no python3 with PyYAML found" >&2; exit 1; }

echo "==> miberas.jsonl"
$PY _codex/scripts/generate-exports.py
echo "==> grails.jsonl + browse/grails.md"
$PY _codex/scripts/generate-grails.py
$PY _codex/scripts/extend-grails-jsonl.py
echo "==> graph.json"
$PY _codex/scripts/generate-graph.py
echo "==> browse/by-ancestor|archetype|element.md"
$PY _codex/scripts/generate-clusters.py
echo "==> browse/by-drug|era|tarot.md"
bash _codex/scripts/generate-browse.sh
echo "==> stats.md"
$PY _codex/scripts/generate-stats.py

echo "Done. Review and commit changes under _codex/data/ and browse/."

# Not regenerated here (documented in _codex/scripts/README.md):
#   - scrawl-theme-map.json  : build-scrawl-theme-map.py needs an external
#                              --source parcelsMetadataFinal/ dir (not in repo).
#   - parcels.jsonl / parcel *.md : generate-parcels.py is a 10K-file corpus
#                              generator, run deliberately on parcel reveals,
#                              not on every export refresh.
