#!/usr/bin/env python3
"""Build scrawl-theme-map.json by parsing fractures/miparcels/scrawl.md
and cross-referencing against the source trait report.

Usage:
    python3 _codex/scripts/build-scrawl-theme-map.py [--source DIR] [--output DIR]

    --source DIR   Path to parcelsMetadataFinal/ (for trait report)
    --output DIR   Codex root directory (default: .)
"""

import argparse
import json
import os
import re
import sys


THEME_SECTIONS = [
    "Rave & K-Hole",
    "Milady-Mibera Duality",
    "Cosmology",
    "Lore Figures",
    "The Choose Manifesto",
    "Refusal",
    "Kaironic Time",
    "Love Letters",
    "True Names & Identity",
    "Mission & Rescue",
]


def parse_scrawl_md(scrawl_path):
    """Parse scrawl.md and extract text -> theme mappings."""
    with open(scrawl_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    theme_map = {}
    current_theme = None
    in_table = False

    for line in lines:
        line_stripped = line.strip()

        # Detect theme headings
        if line_stripped.startswith("## "):
            heading = line_stripped[3:].strip()
            if heading in THEME_SECTIONS:
                current_theme = heading
                in_table = False
            else:
                current_theme = None
                in_table = False
            continue

        if current_theme is None:
            continue

        # Detect table rows (skip header and separator)
        if line_stripped.startswith("|") and not line_stripped.startswith("|-") and not line_stripped.startswith("| Text"):
            # Extract first column (the scrawl text)
            cols = [c.strip() for c in line_stripped.split("|")]
            # cols[0] is empty (before first |), cols[1] is the text
            if len(cols) >= 2 and cols[1]:
                text = cols[1].strip()
                if text and text != "---":
                    # Store mapping (first occurrence wins if duplicate)
                    if text not in theme_map:
                        theme_map[text] = current_theme

    return theme_map


def load_trait_report_scrawls(source_dir):
    """Load the 189 unique scrawl values from the trait report."""
    report_path = os.path.join(source_dir, "_final_trait_report.json")
    with open(report_path, "r", encoding="utf-8") as f:
        report = json.load(f)
    return set(report.get("scrawl", {}).keys())


def match_scrawls(theme_map, trait_scrawls):
    """Match trait report scrawl values against the theme map."""
    matched = {}
    unmatched = []

    # Build case-insensitive lookup
    lower_map = {}
    for text, theme in theme_map.items():
        key = text.lower().strip()
        if key not in lower_map:
            lower_map[key] = theme

    for scrawl in sorted(trait_scrawls):
        # Exact match
        if scrawl in theme_map:
            matched[scrawl] = theme_map[scrawl]
            continue

        # Case-insensitive match
        lower_scrawl = scrawl.lower().strip()
        if lower_scrawl in lower_map:
            matched[scrawl] = lower_map[lower_scrawl]
            continue

        # Strip trailing/leading punctuation and retry
        stripped = scrawl.strip().rstrip(".").rstrip(",")
        if stripped in theme_map:
            matched[scrawl] = theme_map[stripped]
            continue
        if stripped.lower() in lower_map:
            matched[scrawl] = lower_map[stripped.lower()]
            continue

        unmatched.append(scrawl)

    return matched, unmatched


def main():
    parser = argparse.ArgumentParser(description="Build scrawl-theme-map.json")
    parser.add_argument("--source", required=True, help="Path to parcelsMetadataFinal/")
    parser.add_argument("--output", default=".", help="Codex root directory")
    args = parser.parse_args()

    scrawl_path = os.path.join(args.output, "fractures", "miparcels", "scrawl.md")
    if not os.path.exists(scrawl_path):
        print(f"ERROR: scrawl.md not found at {scrawl_path}", file=sys.stderr)
        sys.exit(1)

    # Step 1: Parse scrawl.md
    print("Parsing fractures/miparcels/scrawl.md...")
    theme_map = parse_scrawl_md(scrawl_path)
    print(f"  Extracted {len(theme_map)} unique text -> theme mappings from scrawl.md")

    # Theme distribution
    theme_counts = {}
    for theme in theme_map.values():
        theme_counts[theme] = theme_counts.get(theme, 0) + 1
    for theme in THEME_SECTIONS:
        print(f"    {theme}: {theme_counts.get(theme, 0)} texts")

    # Step 2: Load trait report scrawl values
    print(f"\nLoading trait report from {args.source}...")
    trait_scrawls = load_trait_report_scrawls(args.source)
    print(f"  Found {len(trait_scrawls)} unique scrawl values in trait report")

    # Step 3: Match
    print("\nMatching...")
    matched, unmatched = match_scrawls(theme_map, trait_scrawls)
    print(f"  Matched: {len(matched)}/{len(trait_scrawls)}")

    if unmatched:
        print(f"  UNMATCHED ({len(unmatched)}):")
        for s in unmatched:
            print(f"    - {s}")

    # Step 4: Write output
    out_path = os.path.join(args.output, "_codex", "data", "scrawl-theme-map.json")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(matched, f, indent=2, ensure_ascii=False)
    print(f"\nWrote {out_path} ({len(matched)} entries)")

    if unmatched:
        print(f"\nWARNING: {len(unmatched)} scrawl values could not be mapped to a theme.")
        print("These need manual assignment before running generate-parcels.py")
        sys.exit(1)
    else:
        print("\nAll scrawl values mapped successfully!")


if __name__ == "__main__":
    main()
