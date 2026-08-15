#!/usr/bin/env bash
# add-vm-trait.sh — Add a new VM-exclusive Shadow Trait to the Mibera Codex.
#
# Two modes:
#
#   Full pipeline (PNG → composite → S3 → codex):
#     ./_codex/scripts/add-vm-trait.sh \
#       --category hats --name "Cool Hat" --png ~/Desktop/cool-hat.PNG \
#       [--from "attribution"]
#
#   Codex-only (image already on CDN, or supply URL manually):
#     ./_codex/scripts/add-vm-trait.sh \
#       --category hats --name "Cool Hat" \
#       [--image "https://assets.0xhoneyjar.xyz/Mibera/traits/cool-hat.webp"] \
#       [--from "attribution"]
#
# Body-color traits need a second layer (arms). Pass it via --png-arms:
#     ./_codex/scripts/add-vm-trait.sh \
#       --category body --name "Pepe" \
#       --png ~/Desktop/pepe.PNG --png-arms ~/Desktop/pepe-arms.PNG
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

# z-index for each category (matches micodex-assembler.py DEFAULT_Z_INDICES)
declare -A CATEGORY_Z
CATEGORY_Z=(
  [body]=30
  [earrings]=130
  [eyes]=69
  [face-accessories]=60
  [glasses]=140
  [hats]=160
  [items]=170
  [masks]=100
  [mouth]=90
  [necklaces]=45
  [shirts]=50
  [tattoos]=250
)

usage() {
  cat >&2 <<'USAGE'
Usage: add-vm-trait.sh --category CATEGORY --name "Trait Name" [OPTIONS]

Required:
  --category    One of: body earrings eyes face-accessories glasses hats
                        items masks mouth necklaces shirts tattoos
  --name        Display name (e.g. "Cool Hat", "1312 Bong")

Image (pick one):
  --png PATH    Raw trait layer PNG (1848×2500 RGBA). Composites with templates,
                uploads to S3, and sets the image URL automatically.
  --image URL   Supply a CDN URL directly (skips compose + upload).
                Omit both to auto-construct the URL from --name.

Optional:
  --png-arms PATH   Second PNG for body-color traits (the recolored arms layer).
                    Required when --category body and --png is used.
  --from TEXT   Community attribution handle or description (default: empty)
  --yes         Skip the pre-upload confirmation prompt
  -h, --help    Show this message
USAGE
  exit 1
}

CATEGORY=""
NAME=""
PNG_PATH=""
PNG_ARMS_PATH=""
IMAGE=""
FROM=""
AUTO_YES=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --category) [[ -n "${2:-}" ]] || { echo "Error: --category requires a value" >&2; usage; }
                CATEGORY="$2"; shift 2 ;;
    --name)     [[ -n "${2:-}" ]] || { echo "Error: --name requires a value" >&2; usage; }
                NAME="$2"; shift 2 ;;
    --png)      [[ -n "${2:-}" ]] || { echo "Error: --png requires a value" >&2; usage; }
                PNG_PATH="$2"; shift 2 ;;
    --png-arms) [[ -n "${2:-}" ]] || { echo "Error: --png-arms requires a value" >&2; usage; }
                PNG_ARMS_PATH="$2"; shift 2 ;;
    --image)    [[ -n "${2:-}" ]] || { echo "Error: --image requires a value" >&2; usage; }
                IMAGE="$2"; shift 2 ;;
    --from)     FROM="${2:-}"; shift 2 ;;
    --yes|-y)   AUTO_YES=1; shift ;;
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

# Validate --png path exists if provided
if [[ -n "$PNG_PATH" && ! -f "$PNG_PATH" ]]; then
  echo "Error: --png file not found: $PNG_PATH" >&2
  exit 1
fi
if [[ -n "$PNG_ARMS_PATH" && ! -f "$PNG_ARMS_PATH" ]]; then
  echo "Error: --png-arms file not found: $PNG_ARMS_PATH" >&2
  exit 1
fi

# Warn if body category without arms layer
if [[ -n "$PNG_PATH" && "$CATEGORY" == "body" && -z "$PNG_ARMS_PATH" ]]; then
  echo "Warning: body-color traits usually need a recolored arms layer." >&2
  echo "         Pass it via --png-arms if this is a body color replacement." >&2
  echo ""
fi

# Compute slug: lowercase, non-alphanumeric runs → hyphens, strip leading/trailing hyphens
SLUG=$(printf '%s' "$NAME" | python3 -c "
import sys, re
name = sys.stdin.read().strip()
slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
print(slug)
")

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

# ── Compose + Upload (only when --png is provided) ────────────────────────────
if [[ -n "$PNG_PATH" ]]; then

  # Dependency checks
  if ! command -v aws &>/dev/null; then
    echo "Error: aws CLI not found. Install it and configure S3 credentials." >&2
    exit 1
  fi

  ASSEMBLER="$REPO_ROOT/_codex/scripts/micodex-assembler.py"
  TEMPLATES_DIR="$REPO_ROOT/_codex/assets/templates"

  # Prefer uv run (handles Pillow dep via inline PEP 723 metadata), fall back to python3
  if command -v uv &>/dev/null; then
    ASSEMBLE_CMD="uv run $ASSEMBLER"
  else
    # Verify Pillow is available
    if ! python3 -c "from PIL import Image" &>/dev/null; then
      echo "Error: Pillow not installed. Run: pip install Pillow" >&2
      exit 1
    fi
    ASSEMBLE_CMD="python3 $ASSEMBLER"
  fi

  STAGE_DIR=$(mktemp -d)
  OUT_DIR=$(mktemp -d)
  trap 'rm -rf "$STAGE_DIR" "$OUT_DIR"' EXIT

  Z_INDEX="${CATEGORY_Z[$CATEGORY]}"
  FOLDER_NAME="${CATEGORY}__z${Z_INDEX}"
  mkdir -p "$STAGE_DIR/$FOLDER_NAME"

  # Copy PNG into staging dir, renamed to slug so assembler names output correctly
  cp "$PNG_PATH" "$STAGE_DIR/$FOLDER_NAME/${SLUG}.PNG"

  # Body-color arms layer: copy with _z80 suffix so assembler bumps it to z=210
  if [[ -n "$PNG_ARMS_PATH" ]]; then
    cp "$PNG_ARMS_PATH" "$STAGE_DIR/$FOLDER_NAME/${SLUG}_z80.PNG"
  fi

  echo "Compositing..."
  echo "  Input    : $PNG_PATH"
  echo "  Stage    : $STAGE_DIR/$FOLDER_NAME/"
  echo "  Output   : $OUT_DIR/${SLUG}.webp"
  echo ""

  $ASSEMBLE_CMD \
    --templates "$TEMPLATES_DIR" \
    --traits "$STAGE_DIR" \
    --output "$OUT_DIR"

  WEBP_PATH="$OUT_DIR/${SLUG}.webp"
  if [[ ! -f "$WEBP_PATH" ]]; then
    echo "Error: assembler did not produce $WEBP_PATH" >&2
    exit 1
  fi

  echo ""
  echo "Opening composite for review..."
  open "$WEBP_PATH"
  echo ""
  echo "  Check: trait sits at the right depth (bg → body → trait → arms)."
  echo "         Hands should wrap around held items. Glasses on face, not behind it."
  echo ""

  if [[ $AUTO_YES -eq 0 ]]; then
    read -r -p "  Press Enter to upload to S3, or Ctrl+C to abort: "
    echo ""
  fi

  S3_KEY="Mibera/traits/${SLUG}.webp"
  S3_URI="s3://thj-assets/${S3_KEY}"
  CDN_URL="https://assets.0xhoneyjar.xyz/${S3_KEY}"

  echo "Uploading to S3..."
  aws s3 cp "$WEBP_PATH" "$S3_URI" --content-type "image/webp"
  echo "  ✓ Uploaded → $S3_URI"
  echo ""

  echo "Verifying CDN..."
  HTTP_STATUS=$(curl -sI "${CDN_URL}?cb=$(date +%s)" | head -1 | awk '{print $2}')
  if [[ "$HTTP_STATUS" == "200" ]]; then
    echo "  ✓ CDN live → $CDN_URL  (HTTP $HTTP_STATUS)"
  else
    echo "  ⚠ CDN returned HTTP $HTTP_STATUS — may be a propagation delay." >&2
    echo "    URL: $CDN_URL" >&2
    echo "    Continuing with codex update. Verify manually before committing." >&2
  fi
  echo ""

  # Use the clean slug-based URL (no %20 encoding)
  IMAGE="$CDN_URL"

else
  # No --png: derive image URL from name if not explicitly provided
  if [[ -z "$IMAGE" ]]; then
    IMG_ENCODED=$(printf '%s' "$NAME" | python3 -c "
import sys, urllib.parse
name = sys.stdin.read().strip().lower()
print(urllib.parse.quote(name, safe=''))
")
    IMAGE="https://assets.0xhoneyjar.xyz/Mibera/traits/${IMG_ENCODED}.webp"
  fi
fi

# ── Codex update ──────────────────────────────────────────────────────────────
echo "Updating codex..."
echo "  Name     : $NAME"
echo "  Category : $CATEGORY ($CAT_DISPLAY)"
echo "  Slug     : $SLUG"
echo "  Image    : $IMAGE"
echo "  From     : ${FROM:-<empty>}"
echo ""

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
    print(f"    1. Write the Description in the trait file")
    print(f"    2. Run:    ./_codex/scripts/regen-exports.sh")
    print(f"    3. Verify: python3 _codex/scripts/health-report.py")
    print(f"    4. Commit: git add -A && commit with your PR")
    print("─" * 60)
PYEOF
