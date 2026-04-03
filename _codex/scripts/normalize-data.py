#!/usr/bin/env python3
"""Normalize data inconsistencies in drug and trait YAML frontmatter.

Normalizes:
- date_added: Various formats → ISO 8601 (YYYY-MM-DD) or null
- swag_score: Quoted strings, multi-value, URLs → integer or null

Per SDD 3.2 — Cycle 003.
"""

import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent

# Month name → number mapping
MONTHS = {
    'january': '01', 'february': '02', 'march': '03', 'april': '04',
    'may': '05', 'june': '06', 'july': '07', 'august': '08',
    'september': '09', 'october': '10', 'november': '11', 'december': '12',
}

# Patterns for date parsing (in priority order)
# "January 12, 2025" or "December 9, 2024"
DATE_FULL = re.compile(r'^(\w+)\s+(\d{1,2}),\s*(\d{4})$')
# "August 1st, 2024" or "January 2nd, 2025"
DATE_ORDINAL = re.compile(r'^(\w+)\s+(\d{1,2})(?:st|nd|rd|th),\s*(\d{4})$')
# "December 10 , 2024" (extra space before comma)
DATE_EXTRA_SPACE = re.compile(r'^(\w+)\s+(\d{1,2})\s+,\s*(\d{4})$')
# "18 June, 2024" (day-first format)
DATE_DAY_FIRST = re.compile(r'^(\d{1,2})\s+(\w+),\s*(\d{4})$')
# "August 2024" (month + year only)
DATE_MONTH_YEAR = re.compile(r'^(\w+)\s+(\d{4})$')
# Already ISO: "2026-02-15"
DATE_ISO = re.compile(r'^\d{4}-\d{2}(-\d{2})?$')


def normalize_date(value):
    """Normalize a date_added value to ISO format.

    Returns (normalized_value, was_changed, warning).
    """
    if not value or value.strip() == '""' or value.strip() == "''":
        return None, True, None

    value = value.strip().strip('"').strip("'")

    if not value:
        return None, True, None

    # Already null (from previous normalization)
    if value == 'null':
        return None, False, None

    # Already ISO
    if DATE_ISO.match(value):
        return value, False, None

    # Malformed: **Introduced By:** or similar
    if '**' in value:
        return None, True, f"malformed date: {value!r}"

    # Standard: "January 12, 2025"
    m = DATE_FULL.match(value)
    if m:
        month_name, day, year = m.groups()
        month_num = MONTHS.get(month_name.lower())
        if month_num:
            return f"{year}-{month_num}-{int(day):02d}", True, None
        return None, True, f"unknown month: {month_name!r}"

    # Ordinal: "August 1st, 2024"
    m = DATE_ORDINAL.match(value)
    if m:
        month_name, day, year = m.groups()
        month_num = MONTHS.get(month_name.lower())
        if month_num:
            return f"{year}-{month_num}-{int(day):02d}", True, None
        return None, True, f"unknown month: {month_name!r}"

    # Extra space: "December 10 , 2024"
    m = DATE_EXTRA_SPACE.match(value)
    if m:
        month_name, day, year = m.groups()
        month_num = MONTHS.get(month_name.lower())
        if month_num:
            return f"{year}-{month_num}-{int(day):02d}", True, None
        return None, True, f"unknown month: {month_name!r}"

    # Day-first: "18 June, 2024"
    m = DATE_DAY_FIRST.match(value)
    if m:
        day, month_name, year = m.groups()
        month_num = MONTHS.get(month_name.lower())
        if month_num:
            return f"{year}-{month_num}-{int(day):02d}", True, None
        return None, True, f"unknown month: {month_name!r}"

    # Month + year only: "August 2024"
    m = DATE_MONTH_YEAR.match(value)
    if m:
        month_name, year = m.groups()
        month_num = MONTHS.get(month_name.lower())
        if month_num:
            return f"{year}-{month_num}", True, None
        return None, True, f"unknown month: {month_name!r}"

    # Unknown pattern
    return None, True, f"unparseable date: {value!r}"


def normalize_swag_score(value):
    """Normalize a swag_score value to integer.

    Returns (normalized_value, was_changed, warning).
    """
    if not value or value.strip() == '""' or value.strip() == "''":
        return None, True, None

    value = value.strip().strip('"').strip("'")

    if not value or value == '---':
        return None, True, None

    # Already null (from previous normalization)
    if value == 'null':
        return None, False, None

    # Try direct integer parse
    try:
        int_val = int(value)
        # Check if already a clean integer in the YAML (no quotes)
        return int_val, False, None
    except ValueError:
        pass

    # Multi-value: "2,3,4" or "1, 2, 3" — take first
    if ',' in value:
        first = value.split(',')[0].strip()
        try:
            return int(first), True, f"multi-value swag_score {value!r} → took first: {first}"
        except ValueError:
            pass

    # Number followed by URL/text: "3 - https://..."
    m = re.match(r'^(\d+)\s*-?\s', value)
    if m:
        return int(m.group(1)), True, f"swag_score with trailing text: {value[:50]!r}"

    # Just a URL or garbage
    return None, True, f"unparseable swag_score: {value[:60]!r}"


def parse_frontmatter(content):
    """Parse YAML frontmatter from file content.

    Returns (frontmatter_lines, body) or (None, content) if no frontmatter.
    """
    if not content.startswith('---\n'):
        return None, content

    end_idx = content.index('\n---', 3)
    fm_text = content[4:end_idx]
    body = content[end_idx + 4:]  # skip \n---

    return fm_text.split('\n'), body


def rebuild_file(fm_lines, body):
    """Rebuild file content from frontmatter lines and body."""
    return '---\n' + '\n'.join(fm_lines) + '\n---' + body


def process_file(filepath, normalize_dates=True, normalize_scores=True):
    """Process a single file. Returns (changes, warnings)."""
    content = filepath.read_text(encoding='utf-8')
    fm_lines, body = parse_frontmatter(content)

    if fm_lines is None:
        return 0, []

    changes = 0
    warnings = []
    new_lines = []

    for line in fm_lines:
        # Normalize date_added
        if normalize_dates and line.startswith('date_added:'):
            raw = line.split(':', 1)[1]
            normalized, changed, warning = normalize_date(raw)
            if changed:
                if normalized is None:
                    new_lines.append('date_added: null')
                else:
                    new_lines.append(f'date_added: "{normalized}"')
                changes += 1
            else:
                new_lines.append(line)
            if warning:
                warnings.append(f"{filepath.name}: {warning}")
            continue

        # Normalize swag_score
        if normalize_scores and line.startswith('swag_score:'):
            raw = line.split(':', 1)[1]
            normalized, changed, warning = normalize_swag_score(raw)
            if changed:
                if normalized is None:
                    new_lines.append('swag_score: null')
                else:
                    new_lines.append(f'swag_score: {normalized}')
                changes += 1
            else:
                new_lines.append(line)
            if warning:
                warnings.append(f"{filepath.name}: {warning}")
            continue

        new_lines.append(line)

    if changes > 0:
        new_content = rebuild_file(new_lines, body)
        filepath.write_text(new_content, encoding='utf-8')

    return changes, warnings


def main():
    total_changes = 0
    total_warnings = []
    files_modified = 0

    # Process drug files
    drug_dir = REPO_ROOT / "traits/overlays/molecules"
    print("Processing drug files...")
    drug_files = sorted([f for f in drug_dir.glob("*.md") if f.name != "README.md"])
    for f in drug_files:
        changes, warnings = process_file(f)
        if changes > 0:
            files_modified += 1
            total_changes += changes
        total_warnings.extend(warnings)
    print(f"  {len(drug_files)} files, {total_changes} changes")

    # Process trait files
    trait_base = REPO_ROOT / "traits"
    print("Processing trait files...")
    trait_count = 0
    trait_changes = 0
    for f in sorted(trait_base.rglob("*.md")):
        if f.name == "README.md" or f.name == "overview.md":
            continue
        content = f.read_text(encoding='utf-8')
        if not content.startswith('---'):
            continue
        trait_count += 1
        changes, warnings = process_file(f)
        if changes > 0:
            files_modified += 1
            trait_changes += changes
        total_warnings.extend(warnings)
    total_changes += trait_changes
    print(f"  {trait_count} files, {trait_changes} changes")

    # Summary
    print(f"\n{'='*50}")
    print(f"Total files modified: {files_modified}")
    print(f"Total field changes: {total_changes}")

    if total_warnings:
        print(f"\nWarnings ({len(total_warnings)}):")
        for w in total_warnings:
            print(f"  {w}")

    print("\nDone.")


if __name__ == "__main__":
    main()
