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
echo "==> graph.json"
$PY _codex/scripts/generate-graph.py
echo "Done. Review and commit changes under _codex/data/."
