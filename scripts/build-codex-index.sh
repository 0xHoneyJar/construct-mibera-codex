#!/usr/bin/env bash
# build-codex-index.sh — set up qmd collections for `codex search`.
#
# Indexes grails/*.md and core-lore/**/*.md as qmd collections, registers
# human-written context for each (propagates to LLM rerank), generates
# embeddings. Idempotent — safe to re-run.
#
# Doctrine: ~/vault/wiki/concepts/construct-surface-decision-tree.md §6
#
# Run from the construct-mibera-codex root (or via `pnpm codex:index`).

set -euo pipefail

# ──────── pre-flight ────────

if ! command -v qmd >/dev/null 2>&1; then
  cat <<'EOF' >&2
error: qmd binary not found in PATH.
@tobilu/qmd is a peerDependency of construct-mibera-codex.
Install:  npm install -g @tobilu/qmd
Then re-run this script.
See ~/vault/wiki/concepts/construct-surface-decision-tree.md §6.3
EOF
  exit 1
fi

ROOT="${ROOT:-$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)}"
GRAILS_DIR="$ROOT/grails"
CORE_LORE_DIR="$ROOT/core-lore"

if [[ ! -d "$GRAILS_DIR" ]]; then
  echo "error: $GRAILS_DIR not found. run from construct-mibera-codex root." >&2
  exit 2
fi

echo "qmd: $(qmd --version 2>/dev/null || echo unknown)"
echo "root: $ROOT"
echo

# ──────── collections ────────

# qmd's "collection add" upserts. Re-running the script does not duplicate.

echo "→ adding collection codex-grails  ($GRAILS_DIR)"
qmd collection add "$GRAILS_DIR" --name codex-grails --pattern '*.md'

echo "→ adding collection codex-core-lore  ($CORE_LORE_DIR)"
qmd collection add "$CORE_LORE_DIR" --name codex-core-lore --pattern '**/*.md'

# ──────── context (propagates into LLM rerank) ────────

echo
echo "→ registering context for each collection"
qmd context add qmd://codex-grails \
  '1/1 hand-drawn grails — 43 canonical entries with category (zodiac/element/concept/ancestor/etc), description, image URL, and cultural reference. Top-tier rarity in the Mibera collection. Each grail has a numeric token id; ref scheme is `@g<id>` (e.g. @g876 = Black Hole).'

qmd context add qmd://codex-core-lore \
  'Mibera narrative substrate — 4 archetypes (Freetekno, Milady, Acidhouse, Chicago/Detroit), festival zones with KANSEI tokens, score-mibera factors, ancestor lore, philosophy. Indexed for intent search; ref schemes for zones/archetypes/factors are V1.5 — V1 returns file-path snippets.'

# ──────── embed ────────

echo
echo "→ generating embeddings (this is the slow step, ~30-90s on first run)"
qmd embed

# ──────── verify ────────

echo
echo "→ smoke test"
qmd query "void motif" -c codex-grails --json -n 3 | head -40 || true

echo
echo "✓ codex index built. now you can:"
echo "    codex search \"void motif\""
echo "    codex search \"void motif\" --refs | xargs -n1 codex lookup grail"
