#!/usr/bin/env python3
"""Add parcel backlinks to all 10,000 mibera files.

For each miberas/{NNNN}.md:
  1. Add `parcel: {id}` to YAML frontmatter (after drug: line)
  2. Add `| Parcel | [MiParcel #{id}](../miparcels/{NNNN}.md) |` as last trait table row

Usage:
    python3 _codex/scripts/add-parcel-backlinks.py [--codex-root DIR] [--sample N] [--dry-run]
"""

import argparse
import os
import re
import sys


def patch_mibera(filepath, parcel_id, dry_run=False):
    """Patch a single mibera file with parcel backlink. Returns (patched, skipped, error)."""
    nnnn = f"{parcel_id:04d}"

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Check if already patched
    if "\nparcel:" in content or content.startswith("parcel:"):
        return "skipped"

    # 1. Inject frontmatter field after drug: line
    drug_pattern = re.compile(r'^(drug: .+)$', re.MULTILINE)
    drug_match = drug_pattern.search(content)
    if not drug_match:
        return "error:no_drug_field"

    insert_pos = drug_match.end()
    content = content[:insert_pos] + f"\nparcel: {parcel_id}" + content[insert_pos:]

    # 2. Find the last trait table row and insert parcel row after it
    # The trait table is under ## Traits, rows match "| ... | ... |"
    # We need to find the last table row before the --- separator
    lines = content.split("\n")
    last_table_row_idx = None
    in_traits_section = False

    for i, line in enumerate(lines):
        if line.strip() == "## Traits":
            in_traits_section = True
            continue
        if in_traits_section:
            if line.strip().startswith("|") and not line.strip().startswith("|--"):
                last_table_row_idx = i
            elif line.strip() == "---" and last_table_row_idx is not None:
                break
            elif line.strip().startswith("##"):
                break  # next section

    if last_table_row_idx is None:
        return "error:no_trait_table"

    parcel_row = f"| Parcel | [MiParcel #{parcel_id}](../miparcels/{nnnn}.md) |"
    lines.insert(last_table_row_idx + 1, parcel_row)
    content = "\n".join(lines)

    if dry_run:
        return "would_patch"

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

    return "patched"


def main():
    parser = argparse.ArgumentParser(description="Add parcel backlinks to mibera files")
    parser.add_argument("--codex-root", default=".", help="Codex root directory")
    parser.add_argument("--sample", type=int, default=0, help="Patch only first N files")
    parser.add_argument("--dry-run", action="store_true", help="Show what would change")
    args = parser.parse_args()

    miberas_dir = os.path.join(args.codex_root, "miberas")
    max_id = args.sample if args.sample > 0 else 10000

    stats = {"patched": 0, "skipped": 0, "errors": 0, "would_patch": 0}

    for pid in range(1, max_id + 1):
        nnnn = f"{pid:04d}"
        filepath = os.path.join(miberas_dir, f"{nnnn}.md")

        if not os.path.exists(filepath):
            print(f"  WARNING: {filepath} not found")
            stats["errors"] += 1
            continue

        result = patch_mibera(filepath, pid, dry_run=args.dry_run)

        if result == "patched":
            stats["patched"] += 1
        elif result == "skipped":
            stats["skipped"] += 1
        elif result == "would_patch":
            stats["would_patch"] += 1
        elif result.startswith("error:"):
            print(f"  ERROR #{pid}: {result}")
            stats["errors"] += 1

        if pid % 1000 == 0:
            print(f"  {pid:,}/{max_id:,} processed")

    print(f"\nDone!")
    if args.dry_run:
        print(f"  Would patch: {stats['would_patch']:,}")
    else:
        print(f"  Patched:  {stats['patched']:,}")
    print(f"  Skipped:  {stats['skipped']:,}")
    print(f"  Errors:   {stats['errors']}")


if __name__ == "__main__":
    main()
