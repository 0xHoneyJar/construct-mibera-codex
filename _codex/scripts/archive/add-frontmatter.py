#!/usr/bin/env python3
"""Add YAML frontmatter to all 10,000 Mibera files.

Parses each Mibera's markdown table, extracts field values, and inserts
YAML frontmatter above the existing content. Idempotent — skips files
that already have frontmatter.

Per SDD 3.1 — Cycle 003.
"""

import os
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
MIBERAS_DIR = REPO_ROOT / "miberas"

# Regex to extract display text from markdown link: [text](url)
LINK_RE = re.compile(r'\[([^\]]+)\]\([^)]+\)')

# Field name mapping: table field name → frontmatter key
FIELD_MAP = {
    "Archetype": "archetype",
    "Ancestor": "ancestor",
    "Time Period": "time_period",
    "Birthday": "birthday",
    "Birth Coordinates": "birth_coordinates",
    "Sun Sign": "sun_sign",
    "Moon Sign": "moon_sign",
    "Ascending Sign": "ascending_sign",
    "Element": "element",
    "Swag Rank": "swag_rank",
    "Swag Score": "swag_score",
    "Background": "background",
    "Body": "body",
    "Hair": "hair",
    "Eyes": "eyes",
    "Eyebrows": "eyebrows",
    "Mouth": "mouth",
    "Shirt": "shirt",
    "Hat": "hat",
    "Glasses": "glasses",
    "Mask": "mask",
    "Earrings": "earrings",
    "Face Accessory": "face_accessory",
    "Tattoo": "tattoo",
    "Item": "item",
    "Drug": "drug",
}

# Fields that should be stored as YAML null when value is "None"
NULLABLE_FIELDS = {
    "hair", "shirt", "hat", "glasses", "mask",
    "earrings", "face_accessory", "tattoo", "item",
}


def extract_value(raw_value):
    """Extract clean value from a table cell.

    - Markdown links → display text
    - "None" → None (will become YAML null)
    - Plain text → string
    """
    raw_value = raw_value.strip()
    if not raw_value:
        return None

    # Check for markdown link
    match = LINK_RE.search(raw_value)
    if match:
        return match.group(1)

    # Plain text
    if raw_value == "None":
        return None
    return raw_value


def yaml_quote(value):
    """Quote a YAML string value if it contains special characters."""
    if value is None:
        return "null"
    # Characters that require quoting in YAML
    needs_quoting = False
    if any(c in str(value) for c in [':', '#', "'", '"', '[', ']', '{', '}', ',', '/', '&', '*', '?', '|', '>', '<', '=', '!', '%', '@', '`']):
        needs_quoting = True
    # Leading/trailing spaces
    if str(value) != str(value).strip():
        needs_quoting = True
    # Strings that look like numbers but should stay strings
    if needs_quoting:
        # Use double quotes, escape any double quotes inside
        escaped = str(value).replace('"', '\\"')
        return f'"{escaped}"'
    return str(value)


def parse_mibera_table(content):
    """Parse markdown table from Mibera file content.

    Returns dict of field_name → raw_value.
    """
    fields = {}
    in_table = False
    header_seen = False

    for line in content.split('\n'):
        stripped = line.strip()

        # Detect table start
        if '| Trait |' in stripped and '| Value |' in stripped:
            in_table = True
            header_seen = True
            continue

        # Skip separator line
        if in_table and stripped.startswith('|') and '---' in stripped:
            continue

        # Parse table rows
        if in_table and stripped.startswith('|') and stripped.endswith('|'):
            parts = stripped.split('|')
            # parts[0] is empty (before first |), parts[-1] is empty (after last |)
            if len(parts) >= 3:
                field_name = parts[1].strip()
                field_value = parts[2].strip()
                if field_name and field_name in FIELD_MAP:
                    fields[field_name] = field_value

        # End of table
        elif in_table and header_seen and not stripped.startswith('|'):
            break

    return fields


def generate_frontmatter(mibera_id, fields):
    """Generate YAML frontmatter string from parsed fields."""
    lines = ["---"]

    # id and type first
    lines.append(f"id: {mibera_id}")
    lines.append("type: mibera")

    # Process fields in the order defined by FIELD_MAP
    for table_name, yaml_key in FIELD_MAP.items():
        raw = fields.get(table_name, "")
        value = extract_value(raw)

        # Handle nullable fields
        if yaml_key in NULLABLE_FIELDS and value is None:
            lines.append(f"{yaml_key}: null")
            continue

        # swag_score should be integer
        if yaml_key == "swag_score":
            try:
                lines.append(f"{yaml_key}: {int(value)}")
            except (ValueError, TypeError):
                lines.append(f"{yaml_key}: {yaml_quote(value)}")
            continue

        # All other fields
        if value is None:
            lines.append(f"{yaml_key}: null")
        else:
            lines.append(f"{yaml_key}: {yaml_quote(value)}")

    lines.append("---")
    return "\n".join(lines)


def process_file(filepath):
    """Process a single Mibera file. Returns (status, message)."""
    content = filepath.read_text(encoding='utf-8')

    # Idempotency: skip if already has frontmatter
    if content.startswith('---\n'):
        return "skipped", "already has frontmatter"

    # Extract ID from filename
    stem = filepath.stem  # "0001" → "0001"
    try:
        mibera_id = int(stem)
    except ValueError:
        return "skipped", f"non-numeric filename: {stem}"

    # Parse table
    fields = parse_mibera_table(content)
    if not fields:
        return "error", "no table found"

    # Check we got the critical fields
    missing = [k for k in FIELD_MAP if k not in fields]
    if missing:
        return "error", f"missing fields: {', '.join(missing)}"

    # Generate frontmatter
    frontmatter = generate_frontmatter(mibera_id, fields)

    # Insert frontmatter above existing content
    new_content = frontmatter + "\n\n" + content

    filepath.write_text(new_content, encoding='utf-8')
    return "migrated", f"added {len(FIELD_MAP) + 2} fields"


def main():
    if not MIBERAS_DIR.is_dir():
        print(f"ERROR: {MIBERAS_DIR} not found", file=sys.stderr)
        sys.exit(1)

    # Get all numbered Mibera files
    files = sorted([
        f for f in MIBERAS_DIR.glob("*.md")
        if f.stem.isdigit()
    ], key=lambda f: int(f.stem))

    print(f"Found {len(files)} Mibera files")

    stats = {"migrated": 0, "skipped": 0, "error": 0}
    errors = []

    for f in files:
        status, msg = process_file(f)
        stats[status] += 1
        if status == "error":
            errors.append(f"  {f.name}: {msg}")

    print(f"\nResults:")
    print(f"  Migrated: {stats['migrated']}")
    print(f"  Skipped:  {stats['skipped']}")
    print(f"  Errors:   {stats['error']}")

    if errors:
        print(f"\nErrors:")
        for e in errors:
            print(e)

    if stats['error'] > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
