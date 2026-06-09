#!/usr/bin/env python3
"""Generate _codex/data/miberas.jsonl from Mibera YAML frontmatter.

Reads all 10,000 Mibera files' frontmatter and outputs one JSON object
per line, sorted by ID.

Per SDD 3.3 — Cycle 003.
"""

import json
import sys
import yaml
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
MIBERAS_DIR = REPO_ROOT / "miberas"
OUTPUT_DIR = REPO_ROOT / "_codex" / "data"
OUTPUT_FILE = OUTPUT_DIR / "miberas.jsonl"

# Fields to include in export (in order)
FIELDS = [
    "id", "type", "archetype", "ancestor", "time_period", "birthday",
    "birth_coordinates", "sun_sign", "moon_sign", "ascending_sign",
    "element", "swag_rank", "swag_score", "background", "body", "hair",
    "eyes", "eyebrows", "mouth", "shirt", "hat", "glasses", "mask",
    "earrings", "face_accessory", "tattoo", "item", "drug",
]


def extract_frontmatter(filepath):
    """Extract YAML frontmatter from a Mibera file."""
    content = filepath.read_text(encoding='utf-8')
    if not content.startswith('---\n'):
        return None

    end_idx = content.index('\n---', 3)
    fm_text = content[4:end_idx]
    return yaml.safe_load(fm_text)


def main():
    if not MIBERAS_DIR.is_dir():
        print(f"ERROR: {MIBERAS_DIR} not found", file=sys.stderr)
        sys.exit(1)

    # Discover files
    files = sorted([
        f for f in MIBERAS_DIR.glob("*.md")
        if f.stem.isdigit()
    ], key=lambda f: int(f.stem))

    print(f"Found {len(files)} Mibera files")

    # Create output directory
    OUTPUT_DIR.mkdir(exist_ok=True)

    records = []
    errors = []

    for f in files:
        fm = extract_frontmatter(f)
        if fm is None:
            errors.append(f"  {f.name}: no frontmatter")
            continue

        # Build record with fields in order
        record = {}
        for field in FIELDS:
            if field in fm:
                record[field] = fm[field]
            else:
                errors.append(f"  {f.name}: missing field '{field}'")
                record[field] = None

        # Grail-overwritten Miberas carry grail metadata instead of trait fields
        for field in ("grail", "grail_category"):
            if field in fm:
                record[field] = fm[field]

        records.append(record)

    # Sort by ID
    records.sort(key=lambda r: r["id"])

    # Write JSONL
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as out:
        for record in records:
            out.write(json.dumps(record, ensure_ascii=False) + '\n')

    print(f"Wrote {len(records)} records to {OUTPUT_FILE}")

    # Self-validation
    print("\nValidation:")
    ok = True

    # Check count
    if len(records) != 10000:
        print(f"  FAIL: expected 10000 records, got {len(records)}")
        ok = False
    else:
        print(f"  OK: 10000 records")

    # Check IDs are 1-10000 with no gaps
    ids = [r["id"] for r in records]
    expected_ids = list(range(1, 10001))
    if ids != expected_ids:
        missing = set(expected_ids) - set(ids)
        extra = set(ids) - set(expected_ids)
        if missing:
            print(f"  FAIL: missing IDs: {sorted(missing)[:10]}...")
        if extra:
            print(f"  FAIL: extra IDs: {sorted(extra)[:10]}...")
        ok = False
    else:
        print(f"  OK: IDs 1-10000, no gaps")

    # Check all fields present
    missing_fields = []
    for r in records:
        for field in FIELDS:
            if field not in r:
                missing_fields.append(f"id={r['id']}: {field}")
    if missing_fields:
        print(f"  FAIL: {len(missing_fields)} missing fields")
        ok = False
    else:
        print(f"  OK: all {len(FIELDS)} fields present in all records")

    # Check file size
    size_mb = OUTPUT_FILE.stat().st_size / (1024 * 1024)
    print(f"  File size: {size_mb:.1f} MB")

    if errors:
        print(f"\nErrors ({len(errors)}):")
        for e in errors[:20]:
            print(e)

    if not ok:
        sys.exit(1)

    print("\nAll validations passed.")


if __name__ == "__main__":
    main()
