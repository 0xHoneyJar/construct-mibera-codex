#!/usr/bin/env bash
# add-vm-trait.sh — Add a new VM-exclusive Shadow Trait to the Mibera Codex.
#
# Creates the trait .md file and updates all 12 index/count locations
# automatically so health-report.py stays clean.
#
# Usage:
#   ./_codex/scripts/add-vm-trait.sh \
#     --category hats \
#     --name "Cool Hat" \
#     [--image "https://assets.0xhoneyjar.xyz/Mibera/traits/cool%20hat.webp"] \
#     [--from "community-handle"]
#
# After running:
#   1. Edit the Description section in the generated .md file
#   2. Run:    ./_codex/scripts/regen-exports.sh
#   3. Verify: python3 _codex/scripts/health-report.py
#   4. Commit all changed files in one PR

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

VALID_CATEGORIES="body earrings eyes face-accessories glasses hats items masks mouth necklaces shirts tattoos"

usage() {
  cat >&2 <<'USAGE'
Usage: add-vm-trait.sh --category CATEGORY --name "Trait Name" [OPTIONS]

Required:
  --category   One of: body earrings eyes face-accessories glasses hats
                       items masks mouth necklaces shirts tattoos
  --name       Display name (e.g. "Cool Hat", "1312 Bong")

Optional:
  --image      Full CDN URL (default: auto-constructed from name)
  --from       Community attribution handle or description (default: empty)
  -h, --help   Show this message

Example:
  ./_codex/scripts/add-vm-trait.sh \
    --category hats \
    --name "Mushroom Crown" \
    --from "berafrend.eth"
USAGE
  exit 1
}

CATEGORY=""
NAME=""
IMAGE=""
FROM=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --category) [[ -n "${2:-}" ]] || { echo "Error: --category requires a value" >&2; usage; }
                CATEGORY="$2"; shift 2 ;;
    --name)     [[ -n "${2:-}" ]] || { echo "Error: --name requires a value" >&2; usage; }
                NAME="$2"; shift 2 ;;
    --image)    [[ -n "${2:-}" ]] || { echo "Error: --image requires a value" >&2; usage; }
                IMAGE="$2"; shift 2 ;;
    --from)     FROM="${2:-}"; shift 2 ;;
    -h|--help)  usage ;;
    *) echo "Unknown option: $1" >&2; usage ;;
  esac
done

[[ -z "$CATEGORY" ]] && { echo "Error: --category is required" >&2; usage; }
[[ -z "$NAME" ]]     && { echo "Error: --name is required" >&2; usage; }

# Validate category
if ! echo "$VALID_CATEGORIES" | tr ' ' '\n' | grep -qx "$CATEGORY"; then
  echo "Error: unknown category '$CATEGORY'" >&2
  echo "Valid categories: $VALID_CATEGORIES" >&2
  exit 1
fi

# Compute slug: lowercase, non-alphanumeric runs → hyphens, strip leading/trailing hyphens
SLUG=$(printf '%s' "$NAME" | python3 -c "
import sys, re
name = sys.stdin.read().strip()
slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
print(slug)
")

# Compute URL-encoded name for CDN image path
IMG_ENCODED=$(printf '%s' "$NAME" | python3 -c "
import sys, urllib.parse
name = sys.stdin.read().strip().lower()
print(urllib.parse.quote(name, safe=''))
")

# Default image URL if not supplied
if [[ -z "$IMAGE" ]]; then
  IMAGE="https://assets.0xhoneyjar.xyz/Mibera/traits/${IMG_ENCODED}.webp"
fi

# Title-case category name for display (face-accessories → Face Accessories)
CAT_DISPLAY=$(printf '%s' "$CATEGORY" | python3 -c "
import sys
print(sys.stdin.read().strip().replace('-', ' ').title())
")

TRAIT_FILE="$REPO_ROOT/vending-machine/$CATEGORY/$SLUG.md"

if [[ -f "$TRAIT_FILE" ]]; then
  echo "Error: $TRAIT_FILE already exists. Aborting." >&2
  exit 1
fi

echo "Adding VM trait..."
echo "  Name     : $NAME"
echo "  Category : $CATEGORY ($CAT_DISPLAY)"
echo "  Slug     : $SLUG"
echo "  Image    : $IMAGE"
echo "  From     : ${FROM:-<empty>}"
echo ""

# Pass values to Python via env vars (avoids heredoc shell-expansion issues)
export VM_CATEGORY="$CATEGORY"
export VM_NAME="$NAME"
export VM_SLUG="$SLUG"
export VM_IMAGE="$IMAGE"
export VM_FROM="$FROM"
export VM_CAT_DISPLAY="$CAT_DISPLAY"
export VM_REPO_ROOT="$REPO_ROOT"

python3 << 'PYEOF'
import os, json, re, sys
from pathlib import Path

category    = os.environ["VM_CATEGORY"]
name        = os.environ["VM_NAME"]
slug        = os.environ["VM_SLUG"]
image       = os.environ["VM_IMAGE"]
from_attr   = os.environ["VM_FROM"]
cat_display = os.environ["VM_CAT_DISPLAY"]
repo        = Path(os.environ["VM_REPO_ROOT"])

trait_file    = repo / "vending-machine" / category / f"{slug}.md"
cat_readme    = repo / "vending-machine" / category / "README.md"
vm_readme     = repo / "vending-machine" / "README.md"
manifest_path = repo / "manifest.json"
scope_path    = repo / "_codex/data/scope.json"
llms_txt      = repo / "llms.txt"
summary_md    = repo / "SUMMARY.md"
browse_readme = repo / "browse/README.md"
root_readme   = repo / "README.md"
claude_md     = repo / "CLAUDE.md"

errors = []

def fail(msg):
    print(f"  ERROR: {msg}", file=sys.stderr)
    errors.append(msg)

# ── 1. Create trait file ─────────────────────────────────────────────────────
from_line = from_attr if from_attr else "*Community attribution TBD*"
trait_content = f"""---
name: "{name}"
category: {category}
from: "{from_attr}"
image: "{image}"
---

<div align="center">
  <img src="{image}" alt="{name}" width="320" />
</div>


# {name}

## Description

*WIP*

## From

{from_line}

---

*VM-exclusive trait · [All VM Traits](../README.md) · [{cat_display}](README.md)*
"""
trait_file.write_text(trait_content)
print(f"  ✓ Created  vending-machine/{category}/{slug}.md")

# ── 2. Category README: increment heading count + append list entry ──────────
text = cat_readme.read_text()
m = re.search(r'## All Entries \((\d+)\)', text)
if not m:
    fail(f"'## All Entries (N)' not found in vending-machine/{category}/README.md")
else:
    old_n = int(m.group(1))
    new_n = old_n + 1
    text = text.replace(m.group(0), f"## All Entries ({new_n})", 1)
    # Insert new list entry before the trailing separator line
    text = re.sub(
        r'(\n---\n\n\*\[← All VM Traits\])',
        f"\n- [{name}]({slug}.md)\\1",
        text
    )
    cat_readme.write_text(text)
    print(f"  ✓ Updated  vending-machine/{category}/README.md  ({old_n} → {new_n})")

# ── 3. VM top-level README: category row count + overview sentence ───────────
text = vm_readme.read_text()

row_pat = rf'(\| \[{re.escape(cat_display)}\]\({re.escape(category)}/README\.md\) \| )(\d+)( \|)'
m = re.search(row_pat, text, re.IGNORECASE)
if not m:
    fail(f"Category row for '{cat_display}' not found in vending-machine/README.md")
else:
    old_row_n = int(m.group(2))
    text = text[:m.start()] + m.group(1) + str(old_row_n + 1) + m.group(3) + text[m.end():]

m2 = re.search(r'\*\*(\d+) exclusive traits\*\*', text)
if not m2:
    fail("'**N exclusive traits**' not found in vending-machine/README.md")
else:
    old_total = int(m2.group(1))
    new_total = old_total + 1
    text = text.replace(m2.group(0), f"**{new_total} exclusive traits**", 1)
    vm_readme.write_text(text)
    print(f"  ✓ Updated  vending-machine/README.md  ({old_total} → {new_total})")

# ── 4. manifest.json ─────────────────────────────────────────────────────────
data = json.loads(manifest_path.read_text())
vm = data["entity_types"]["vm_trait"]
old_count = vm["count"]
new_count = old_count + 1
vm["count"] = new_count
vm["subcategories"][category] = vm["subcategories"][category] + 1
vm["completeness_note"] = re.sub(
    r'\d+(?= VM-exclusive)',
    str(new_count),
    vm["completeness_note"]
)
manifest_path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
print(f"  ✓ Updated  manifest.json  ({old_count} → {new_count})")

# ── 5. scope.json ─────────────────────────────────────────────────────────────
data = json.loads(scope_path.read_text())
old_sc = None
for item in data["tracks"]:
    if item.get("entity_type") == "vm_trait":
        old_sc = item["count"]
        item["count"] = old_sc + 1
        item["note"] = re.sub(r'\d+(?= VM-exclusive)', str(old_sc + 1), item["note"])
        break
if old_sc is None:
    fail("vm_trait entry not found in _codex/data/scope.json")
else:
    scope_path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    print(f"  ✓ Updated  _codex/data/scope.json  ({old_sc} → {old_sc + 1})")

# ── 6–12. Prose count claims ──────────────────────────────────────────────────
# Each tuple: (file, regex with 3 groups — prefix, old-count, suffix)
prose_patterns = [
    (llms_txt,
     rf'(\| VM Exclusive Trait \| vending-machine/\*\*/\*\.md \| )({old_count})( \|)'),
    (llms_txt,
     rf'(- )({old_count})( VM-exclusive shadow traits)'),
    (summary_md,
     rf'(— )({old_count})( exclusive traits not in the generative 10K)'),
    (browse_readme,
     rf'(\*)({old_count})( exclusive traits available only through)'),
    (root_readme,
     rf'(— )({old_count})( VM-exclusive Shadow Traits across 12 categories)'),
    (claude_md,
     rf'(\| `vending-machine/` \| VM-exclusive Shadow Traits \(12 categories\) \| )({old_count})( \|)'),
    (claude_md,
     rf'(,\s*)({old_count})( VM-exclusive Shadow Traits)'),
]

for path, pat in prose_patterns:
    text = path.read_text()
    m = re.search(pat, text)
    if not m:
        fail(f"Pattern not matched in {path.relative_to(repo)}:\n           {pat!r}")
        continue
    n = int(m.group(2))
    updated = text[:m.start()] + m.group(1) + str(n + 1) + m.group(3) + text[m.end():]
    path.write_text(updated)
    print(f"  ✓ Updated  {path.relative_to(repo)}")

print()
if errors:
    print(f"  ✗ Completed with {len(errors)} error(s):")
    for e in errors:
        print(f"    - {e}")
    print()
    print("  Fix the errors above, then re-run health-report.py to verify.")
    sys.exit(1)
else:
    print("─" * 60)
    print(f"  Trait file : vending-machine/{category}/{slug}.md")
    print()
    print("  Next steps:")
    print(f"    1. Open and write the Description in the trait file")
    print(f"    2. Run:    ./_codex/scripts/regen-exports.sh")
    print(f"    3. Verify: python3 _codex/scripts/health-report.py")
    print(f"    4. Commit: git add -A && commit with your PR")
    print("─" * 60)
PYEOF
