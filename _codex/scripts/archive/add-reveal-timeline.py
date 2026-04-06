#!/usr/bin/env python3
"""Add a Reveal Timeline section to all 10,000 Mibera files.

Inserts a 9-column horizontal image table showing fracture phases
(MiParcels through MiReveal #7.7) between the hero image and the
Traits table. Idempotent — replaces existing timeline if present.

Usage:
    python3 _codex/scripts/add-reveal-timeline.py
    python3 _codex/scripts/add-reveal-timeline.py --dry-run
"""

import json
import os
import re
import sys

S3_BASE = "https://thj-assets.s3.us-west-2.amazonaws.com"

# (label, S3 path template) — {token_id} or {hash} will be substituted
PHASES = [
    ("MiParcels", "parcels/parcelsImages/{token_id}.png"),
    ("Miladies",  "fractures/miladies/images/{token_id}.png"),
    ("#1.1",      "reveal_phase1_images/{hash}.png"),
    ("#2.2",      "reveal_phase2/reveal_phase2_images/{hash}.png"),
    ("#3.3",      "reveal_phase3/reveal_phase3_images/{hash}.png"),
    ("#4.20",     "reveal_phase4/images/{hash}.png"),
    ("#5.5",      "reveal_phase5/images/{hash}.png"),
    ("#6.9",      "reveal_phase6/images/{hash}.png"),
    ("#7.7",      "reveal_phase7/images/{hash}.png"),
]

TIMELINE_HEADING = "## Reveal Timeline"


def load_hash_mapping(json_path):
    """Load mibera-image-urls.json and extract {token_id: hash} mapping."""
    with open(json_path, "r") as f:
        data = json.load(f)
    mapping = {}
    for token_id, url in data.items():
        # URL format: https://gateway.irys.xyz/.../HASH.png
        filename = url.rsplit("/", 1)[-1]  # e.g., "8a7e39...21.png"
        hash_val = filename.rsplit(".", 1)[0]  # strip .png
        mapping[int(token_id)] = hash_val
    return mapping


def build_timeline_section(token_id, hash_val):
    """Build the markdown for the Reveal Timeline section."""
    header_cells = []
    align_cells = []
    image_cells = []

    for label, path_template in PHASES:
        url = S3_BASE + "/" + path_template.format(
            token_id=token_id, hash=hash_val
        )
        header_cells.append(label)
        align_cells.append(":-:")
        image_cells.append("![{label}]({url})".format(label=label, url=url))

    lines = [
        TIMELINE_HEADING,
        "",
        "| " + " | ".join(header_cells) + " |",
        "|" + "|".join(align_cells) + "|",
        "| " + " | ".join(image_cells) + " |",
    ]
    return lines


def process_file(filepath, token_id, hash_val, dry_run=False):
    """Insert or replace the Reveal Timeline section in a Mibera file."""
    with open(filepath, "r") as f:
        content = f.read()

    lines = content.split("\n")

    # Find key markers
    traits_idx = None
    timeline_start = None
    timeline_end = None

    for i, line in enumerate(lines):
        if line.strip() == "## Traits":
            traits_idx = i
        if line.strip() == TIMELINE_HEADING:
            timeline_start = i

    if traits_idx is None:
        return "skipped_no_traits"

    # If timeline already exists, find its end (next ## heading or ## Traits)
    if timeline_start is not None:
        for i in range(timeline_start + 1, len(lines)):
            if lines[i].startswith("## "):
                timeline_end = i
                break
        if timeline_end is None:
            timeline_end = len(lines)

        # Remove existing timeline section (including surrounding blank lines)
        # Also remove blank line before timeline if present
        remove_start = timeline_start
        if remove_start > 0 and lines[remove_start - 1].strip() == "":
            remove_start -= 1

        # Remove blank lines after timeline section end
        remove_end = timeline_end
        while remove_end < len(lines) and lines[remove_end].strip() == "":
            # Don't consume the blank line right before ## Traits
            break

        lines = lines[:remove_start] + lines[remove_end:]

        # Recalculate traits_idx after removal
        for i, line in enumerate(lines):
            if line.strip() == "## Traits":
                traits_idx = i
                break

    # Build new timeline
    timeline_lines = build_timeline_section(token_id, hash_val)

    # Insert before ## Traits with proper spacing
    # We want: [hero image]\n\n## Reveal Timeline\n\n...\n\n## Traits
    insert_at = traits_idx

    # Ensure blank line before ## Traits after our insertion
    new_lines = (
        lines[:insert_at]
        + [""]  # blank line before timeline
        + timeline_lines
        + [""]  # blank line after timeline
        + lines[insert_at:]
    )

    # Clean up: avoid double blank lines
    cleaned = []
    prev_blank = False
    for line in new_lines:
        is_blank = line.strip() == ""
        if is_blank and prev_blank:
            continue
        cleaned.append(line)
        prev_blank = is_blank

    new_content = "\n".join(cleaned)

    if new_content == content:
        return "unchanged"

    if not dry_run:
        with open(filepath, "w") as f:
            f.write(new_content)

    return "modified"


def main():
    dry_run = "--dry-run" in sys.argv

    # Resolve paths relative to repo root
    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.abspath(os.path.join(script_dir, "..", ".."))

    json_path = os.path.join(repo_root, "_codex", "data", "mibera-image-urls.json")
    miberas_dir = os.path.join(repo_root, "miberas")

    if not os.path.exists(json_path):
        print("ERROR: {0} not found".format(json_path))
        sys.exit(1)

    print("Loading hash mapping...")
    hash_map = load_hash_mapping(json_path)
    print("  Loaded {0} token→hash mappings".format(len(hash_map)))

    if dry_run:
        print("  DRY RUN — no files will be modified\n")

    stats = {"modified": 0, "unchanged": 0, "skipped_no_traits": 0,
             "skipped_no_hash": 0, "errors": 0}

    for i in range(1, 10001):
        filename = "{0:04d}.md".format(i)
        filepath = os.path.join(miberas_dir, filename)

        if not os.path.exists(filepath):
            stats["errors"] += 1
            print("  MISSING: {0}".format(filename))
            continue

        if i not in hash_map:
            stats["skipped_no_hash"] += 1
            print("  NO HASH: token {0}".format(i))
            continue

        try:
            result = process_file(filepath, i, hash_map[i], dry_run=dry_run)
            stats[result] += 1
        except Exception as e:
            stats["errors"] += 1
            print("  ERROR: {0}: {1}".format(filename, e))

        if i % 1000 == 0:
            print("  Processed {0}/10000...".format(i))

    print("\nDone!")
    print("  Modified:       {0}".format(stats["modified"]))
    print("  Unchanged:      {0}".format(stats["unchanged"]))
    print("  Skipped (no ##Traits): {0}".format(stats["skipped_no_traits"]))
    print("  Skipped (no hash):     {0}".format(stats["skipped_no_hash"]))
    print("  Errors:         {0}".format(stats["errors"]))


if __name__ == "__main__":
    main()
