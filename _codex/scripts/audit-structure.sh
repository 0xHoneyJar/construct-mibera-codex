#!/usr/bin/env bash
# audit-structure.sh — Validate structural integrity of all Mibera Codex content files
# Strategy: batch grep across all files (fast) instead of per-file processing (slow)
# Outputs JSON report to _codex/scripts/reports/audit-structure.json
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
REPORT_DIR="$REPO_ROOT/_codex/scripts/reports"
mkdir -p "$REPORT_DIR"
ISSUES_FILE=$(mktemp)
trap 'rm -f "$ISSUES_FILE"' EXIT

# --- Grail exemption ---
# The 44 grail token IDs are hand-drawn 1/1 art placed on random Miberas post-reveal.
# By design they carry no generative trait table, so the per-field checks below would
# flag every one as 26 "missing field" errors (1,144 false positives). Source the
# exemption from the canonical grails.jsonl (NOT a hardcoded list) so it stays in sync;
# fail loud if that source is missing, otherwise we'd silently re-mask genuine errors.
GRAILS_JSONL="$REPO_ROOT/_codex/data/grails.jsonl"
if [[ ! -r "$GRAILS_JSONL" ]]; then
  echo "ERROR: grail exemption source not found or unreadable: $GRAILS_JSONL" >&2
  echo "Cannot distinguish grail 1/1s from genuine structural errors. Aborting." >&2
  exit 2
fi
declare -A GRAIL_FILE
while IFS= read -r gid; do
  [[ -z "$gid" ]] && continue
  printf -v padded '%04d' "$gid"
  GRAIL_FILE["$padded.md"]=1
done < <(python3 -c "
import json, sys
for line in open(sys.argv[1], encoding='utf-8'):
    line = line.strip()
    if line:
        print(json.loads(line)['id'])" "$GRAILS_JSONL")
if [[ "${#GRAIL_FILE[@]}" -eq 0 ]]; then
  echo "ERROR: grail exemption source $GRAILS_JSONL yielded 0 IDs." >&2
  echo "Refusing to run without a valid exemption set. Aborting." >&2
  exit 2
fi

echo "Mibera Codex Structural Audit" >&2
echo "==============================" >&2

# --- 1. Validate Mibera files ---
echo "" >&2
echo "Auditing Mibera entries..." >&2

MIBERA_DIR="$REPO_ROOT/miberas"
mibera_total=$(find "$MIBERA_DIR" -name '[0-9]*.md' -type f | wc -l | tr -d ' ')

# Check each required field with a single grep -rL (files NOT containing pattern)
MIBERA_FIELDS=(
  "Archetype" "Ancestor" "Time Period" "Birthday" "Birth Coordinates"
  "Sun Sign" "Moon Sign" "Ascending Sign" "Element" "Swag Rank"
  "Swag Score" "Background" "Body" "Hair" "Eyes" "Eyebrows" "Mouth"
  "Shirt" "Hat" "Glasses" "Mask" "Earrings" "Face Accessory"
  "Tattoo" "Item" "Drug"
)

mibera_issue_files=0
for field in "${MIBERA_FIELDS[@]}"; do
  # Find files missing this field
  missing=$(grep -rL "^| $field |" "$MIBERA_DIR"/ --include='[0-9]*.md' 2>/dev/null || true)
  if [[ -n "$missing" ]]; then
    while IFS= read -r f; do
      # Grail 1/1s have no generative trait table by design — skip (see GRAIL_FILE above).
      [[ -n "${GRAIL_FILE[$(basename "$f")]+x}" ]] && continue
      rel="${f#$REPO_ROOT/}"
      echo "{\"severity\":\"error\",\"file\":\"$rel\",\"message\":\"Missing field: $field\",\"type\":\"mibera\"}" >> "$ISSUES_FILE"
      ((mibera_issue_files++)) || true
    done <<< "$missing"
  fi
done

# Check for missing heading
missing_heading=$(grep -rL '^# Mibera #' "$MIBERA_DIR"/ --include='[0-9]*.md' 2>/dev/null || true)
if [[ -n "$missing_heading" ]]; then
  while IFS= read -r f; do
    rel="${f#$REPO_ROOT/}"
    echo "{\"severity\":\"warning\",\"file\":\"$rel\",\"message\":\"Missing heading\",\"type\":\"mibera\"}" >> "$ISSUES_FILE"
  done <<< "$missing_heading"
fi

# Check for missing back link
missing_back=$(grep -rL '← Back to Index' "$MIBERA_DIR"/ --include='[0-9]*.md' 2>/dev/null || true)
if [[ -n "$missing_back" ]]; then
  while IFS= read -r f; do
    rel="${f#$REPO_ROOT/}"
    echo "{\"severity\":\"warning\",\"file\":\"$rel\",\"message\":\"Missing back-to-index link\",\"type\":\"mibera\"}" >> "$ISSUES_FILE"
  done <<< "$missing_back"
fi

echo "  $mibera_total files checked" >&2

# --- 2. Validate YAML frontmatter files ---
check_yaml_dir() {
  local type="$1" dir="$2"
  shift 2
  local required=("$@")
  local count=0 issues=0

  for f in "$dir"/*.md; do
    [[ ! -f "$f" ]] && continue
    local bn; bn="$(basename "$f")"
    [[ "$bn" == "README.md" || "$bn" == "overview.md" || "$bn" == "drug-pairings.md" ]] && continue
    ((count++)) || true

    local rel="${f#$REPO_ROOT/}"

    # Check frontmatter exists
    if [[ "$(head -1 "$f")" != "---" ]]; then
      echo "{\"severity\":\"warning\",\"file\":\"$rel\",\"message\":\"No YAML frontmatter\",\"type\":\"$type\"}" >> "$ISSUES_FILE"
      ((issues++)) || true
      continue
    fi

    # Extract frontmatter (between first and second ---)
    local fm
    fm=$(awk '/^---$/{n++; if(n==2) exit; next} n==1{print}' "$f")

    for field in "${required[@]}"; do
      if ! grep -q "^${field}:" <<< "$fm"; then
        echo "{\"severity\":\"error\",\"file\":\"$rel\",\"message\":\"Missing YAML field: $field\",\"type\":\"$type\"}" >> "$ISSUES_FILE"
        ((issues++)) || true
      fi
    done
  done
  echo "$count $issues"
}

# Traits — different schemas per subcategory
echo "Auditing trait files..." >&2
trait_total=0; trait_issues=0

# Full schema: accessories, clothing, items (have swag_score; archetype is optional)
TRAIT_FULL_REQ=("name" "swag_score" "date_added")
for subdir in \
  "$REPO_ROOT/traits/accessories/earrings" \
  "$REPO_ROOT/traits/accessories/face-accessories" \
  "$REPO_ROOT/traits/accessories/glasses" \
  "$REPO_ROOT/traits/accessories/hats" \
  "$REPO_ROOT/traits/accessories/masks" \
  "$REPO_ROOT/traits/clothing/long-sleeves" \
  "$REPO_ROOT/traits/clothing/short-sleeves" \
  "$REPO_ROOT/traits/items/general-items"; do
  [[ ! -d "$subdir" ]] && continue
  result=$(check_yaml_dir "trait" "$subdir" "${TRAIT_FULL_REQ[@]}")
  read -r c i <<< "$result"
  ((trait_total += c)) || true
  ((trait_issues += i)) || true
done

# Minimal schema: character traits + backgrounds (name only required)
TRAIT_CHAR_REQ=("name")
for subdir in \
  "$REPO_ROOT/traits/backgrounds" \
  "$REPO_ROOT/traits/clothing/simple-shirts" \
  "$REPO_ROOT/traits/items/bong-bears" \
  "$REPO_ROOT/traits/character-traits/body" \
  "$REPO_ROOT/traits/character-traits/eyebrows" \
  "$REPO_ROOT/traits/character-traits/eyes" \
  "$REPO_ROOT/traits/character-traits/hair" \
  "$REPO_ROOT/traits/character-traits/mouth" \
  "$REPO_ROOT/traits/character-traits/tattoos"; do
  [[ ! -d "$subdir" ]] && continue
  result=$(check_yaml_dir "trait_character" "$subdir" "${TRAIT_CHAR_REQ[@]}")
  read -r c i <<< "$result"
  ((trait_total += c)) || true
  ((trait_issues += i)) || true
done

# Overlay schemas: astrology, elements, ranking (custom fields)
TRAIT_ASTRO_REQ=("name")
for subdir in "$REPO_ROOT/traits/overlays/astrology"; do
  [[ ! -d "$subdir" ]] && continue
  result=$(check_yaml_dir "trait_astrology" "$subdir" "${TRAIT_ASTRO_REQ[@]}")
  read -r c i <<< "$result"
  ((trait_total += c)) || true
  ((trait_issues += i)) || true
done

TRAIT_ELEM_REQ=("name")
for subdir in "$REPO_ROOT/traits/overlays/elements"; do
  [[ ! -d "$subdir" ]] && continue
  result=$(check_yaml_dir "trait_element" "$subdir" "${TRAIT_ELEM_REQ[@]}")
  read -r c i <<< "$result"
  ((trait_total += c)) || true
  ((trait_issues += i)) || true
done

TRAIT_RANK_REQ=("name" "rank")
for subdir in "$REPO_ROOT/traits/overlays/ranking"; do
  [[ ! -d "$subdir" ]] && continue
  result=$(check_yaml_dir "trait_ranking" "$subdir" "${TRAIT_RANK_REQ[@]}")
  read -r c i <<< "$result"
  ((trait_total += c)) || true
  ((trait_issues += i)) || true
done

echo "  $trait_total files checked, $trait_issues issues" >&2

# Drugs
echo "Auditing drug files..." >&2
DRUG_REQ=("name" "molecule" "era" "origin" "archetype" "ancestor" "swag_score" "image" "date_added")
result=$(check_yaml_dir "drug" "$REPO_ROOT/traits/overlays/molecules" "${DRUG_REQ[@]}")
read -r drug_total drug_issues <<< "$result"
echo "  $drug_total files checked, $drug_issues issues" >&2

# Ancestors
echo "Auditing ancestor files..." >&2
ANCESTOR_REQ=("name" "period_ancient" "period_modern" "locations")
result=$(check_yaml_dir "ancestor" "$REPO_ROOT/core-lore/ancestors" "${ANCESTOR_REQ[@]}")
read -r ancestor_total ancestor_issues <<< "$result"
echo "  $ancestor_total files checked, $ancestor_issues issues" >&2

# Tarot cards
echo "Auditing tarot card files..." >&2
TAROT_REQ=("name" "suit" "element" "meaning" "drug" "drug_type" "molecule")
result=$(check_yaml_dir "tarot_card" "$REPO_ROOT/core-lore/tarot-cards" "${TAROT_REQ[@]}")
read -r tarot_total tarot_issues <<< "$result"
echo "  $tarot_total files checked, $tarot_issues issues" >&2

# Special collections (includes nested subdirectories)
echo "Auditing special collection files..." >&2
COLLECTION_REQ=("name" "type")
collection_total=0; collection_issues=0
while IFS= read -r scdir; do
  result=$(check_yaml_dir "special_collection" "$scdir" "${COLLECTION_REQ[@]}")
  read -r t i <<< "$result"
  ((collection_total += t)) || true
  ((collection_issues += i)) || true
done < <(find "$REPO_ROOT/special-collections" -type d)
echo "  $collection_total files checked, $collection_issues issues" >&2

# MiParcels (10,000 files — batch grep like Miberas, not per-file, for speed)
echo "Auditing miparcel files..." >&2
MIPARCEL_DIR="$REPO_ROOT/miparcels"
miparcel_total=$(find "$MIPARCEL_DIR" -name '[0-9]*.md' -type f | wc -l | tr -d ' ')
miparcel_issues=0
for field in "id" "type"; do
  missing=$(grep -rL "^${field}:" "$MIPARCEL_DIR"/ --include='[0-9]*.md' 2>/dev/null || true)
  if [[ -n "$missing" ]]; then
    while IFS= read -r f; do
      [[ -z "$f" ]] && continue
      rel="${f#$REPO_ROOT/}"
      echo "{\"severity\":\"error\",\"file\":\"$rel\",\"message\":\"Missing field: $field\",\"type\":\"miparcel\"}" >> "$ISSUES_FILE"
      ((miparcel_issues++)) || true
    done <<< "$missing"
  fi
done
echo "  $miparcel_total files checked, $miparcel_issues issues" >&2

# Vending-machine shadow traits (nested subdirectories, like special collections)
echo "Auditing vending-machine (shadow trait) files..." >&2
VM_REQ=("name" "category")
vm_total=0; vm_issues=0
while IFS= read -r vmdir; do
  result=$(check_yaml_dir "vm_trait" "$vmdir" "${VM_REQ[@]}")
  read -r t i <<< "$result"
  ((vm_total += t)) || true
  ((vm_issues += i)) || true
done < <(find "$REPO_ROOT/vending-machine" -type d)
echo "  $vm_total files checked, $vm_issues issues" >&2

# Mibera Sets (Honey Road ERC-1155)
echo "Auditing mibera-set files..." >&2
SET_REQ=("token_id" "name" "type")
result=$(check_yaml_dir "mibera_set" "$REPO_ROOT/mibera-sets" "${SET_REQ[@]}")
read -r set_total set_issues <<< "$result"
echo "  $set_total files checked, $set_issues issues" >&2

# Grails (hand-drawn 1/1 entity files in grails/, distinct from the grail
# placement exemption on miberas/ above)
echo "Auditing grail files..." >&2
GRAIL_REQ=("name" "type" "category")
result=$(check_yaml_dir "grail" "$REPO_ROOT/grails" "${GRAIL_REQ[@]}")
read -r grail_total grail_issues <<< "$result"
echo "  $grail_total files checked, $grail_issues issues" >&2

# --- 3. Generate report ---
grand_total=$((mibera_total + miparcel_total + trait_total + drug_total + ancestor_total + tarot_total + collection_total + vm_total + set_total + grail_total))
error_count=$(grep -c '"severity":"error"' "$ISSUES_FILE" 2>/dev/null) || error_count=0
warning_count=$(grep -c '"severity":"warning"' "$ISSUES_FILE" 2>/dev/null) || warning_count=0

{
  echo "{"
  echo "  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
  echo "  \"total_files\": $grand_total,"
  echo "  \"errors\": $error_count,"
  echo "  \"warnings\": $warning_count,"
  echo "  \"by_type\": {"
  echo "    \"mibera\": {\"total\": $mibera_total},"
  echo "    \"miparcel\": {\"total\": $miparcel_total, \"issues\": $miparcel_issues},"
  echo "    \"trait\": {\"total\": $trait_total, \"issues\": $trait_issues},"
  echo "    \"drug\": {\"total\": $drug_total, \"issues\": $drug_issues},"
  echo "    \"ancestor\": {\"total\": $ancestor_total, \"issues\": $ancestor_issues},"
  echo "    \"tarot_card\": {\"total\": $tarot_total, \"issues\": $tarot_issues},"
  echo "    \"special_collection\": {\"total\": $collection_total, \"issues\": $collection_issues},"
  echo "    \"vm_trait\": {\"total\": $vm_total, \"issues\": $vm_issues},"
  echo "    \"mibera_set\": {\"total\": $set_total, \"issues\": $set_issues},"
  echo "    \"grail\": {\"total\": $grail_total, \"issues\": $grail_issues}"
  echo "  },"

  # Issues array
  echo "  \"issues\": ["
  first=true
  while IFS= read -r line; do
    [[ -z "$line" ]] && continue
    if [[ "$first" == true ]]; then first=false; else echo ","; fi
    printf "    %s" "$line"
  done < "$ISSUES_FILE"
  echo ""
  echo "  ]"
  echo "}"
} > "$REPORT_DIR/audit-structure.json"

echo "" >&2
echo "=== AUDIT COMPLETE ===" >&2
echo "Total: $grand_total files | Errors: $error_count | Warnings: $warning_count" >&2
echo "Report: $REPORT_DIR/audit-structure.json" >&2

if [[ "$error_count" -gt 0 ]]; then
  exit 1
fi
