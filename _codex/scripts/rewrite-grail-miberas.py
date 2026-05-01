#!/usr/bin/env python3
"""Rewrite grail mibera files to reflect grail identity only.

Grail miberas are 1/1 hand-drawn pieces that replace the generative render.
The old visual traits (hair, eyes, shirt, etc.) no longer apply. This script
rewrites each grail mibera file to contain only the grail information.

Usage:
    python3 _codex/scripts/rewrite-grail-miberas.py --dry-run
    python3 _codex/scripts/rewrite-grail-miberas.py
"""

import argparse
import re
from pathlib import Path

CODEX_ROOT = Path(__file__).resolve().parent.parent.parent
GRAILS_DIR = CODEX_ROOT / "grails"
MIBERAS_DIR = CODEX_ROOT / "miberas"


def load_grails():
    """Load grail data from grails/*.md files."""
    grails = []
    for fpath in sorted(GRAILS_DIR.glob("*.md")):
        if fpath.name == "README.md":
            continue
        content = fpath.read_text(encoding="utf-8")
        if not content.startswith("---"):
            continue

        end = content.index("---", 3)
        fm_text = content[3:end].strip()
        body = content[end + 3:].strip()

        entry = {"slug": fpath.stem, "body": body}
        for line in fm_text.split("\n"):
            if ":" in line:
                key, val = line.split(":", 1)
                key = key.strip()
                val = val.strip().strip('"')
                if key == "id":
                    entry["id"] = int(val)
                elif key == "name":
                    entry["name"] = val
                elif key == "category":
                    entry["category"] = val
                elif key == "description":
                    entry["description"] = val

        if "id" in entry and "name" in entry:
            grails.append(entry)

    return grails


def extract_grail_body(body):
    """Extract the content sections from a grail file body (skip the header/image/breadcrumb)."""
    lines = body.split("\n")
    sections = []
    capture = False

    for line in lines:
        # Start capturing from first ## heading
        if line.startswith("## "):
            capture = True
        if capture:
            sections.append(line)

    return "\n".join(sections).strip()


def extract_image_url(body):
    """Extract the image URL from a grail file."""
    match = re.search(r'!\[.*?\]\((https://[^)]+)\)', body)
    return match.group(1) if match else None


def get_parcel_id(mibera_id):
    """Read the parcel ID from the mibera file."""
    fpath = MIBERAS_DIR / f"{mibera_id:04d}.md"
    if not fpath.exists():
        return None
    content = fpath.read_text(encoding="utf-8")
    match = re.search(r'^parcel:\s*(\d+)', content, re.MULTILINE)
    return int(match.group(1)) if match else None


def build_grail_mibera(mibera_id, grail):
    """Build the new mibera file content for a grail."""
    name = grail["name"]
    slug = grail["slug"]
    category = grail.get("category", "")
    description = grail.get("description", "")
    image_url = extract_image_url(grail["body"])
    grail_sections = extract_grail_body(grail["body"])
    parcel_id = get_parcel_id(mibera_id)

    lines = []

    # Frontmatter
    lines.append("---")
    lines.append(f"id: {mibera_id}")
    lines.append("type: mibera")
    lines.append(f'grail: "{name}"')
    lines.append(f"grail_category: {category}")
    if parcel_id is not None:
        lines.append(f"parcel: {parcel_id}")
    lines.append("---")
    lines.append("")

    # Title
    lines.append(f"# Mibera #{mibera_id}")
    lines.append("")

    # Grail badge
    category_display = category.title() if category else ""
    lines.append(f"> **Grail #{mibera_id}** · {category_display} · [{name}](../grails/{slug}.md)")
    lines.append("")

    # Image
    if image_url:
        lines.append(f"![{name}]({image_url})")
        lines.append("")

    # Description
    if description:
        lines.append(f"*{description}*")
        lines.append("")

    # Grail content sections
    if grail_sections:
        lines.append(grail_sections)
        lines.append("")

    # Parcel link
    if parcel_id is not None:
        lines.append("---")
        lines.append("")
        lines.append(f"**Parcel:** [MiParcel #{parcel_id}](../miparcels/{parcel_id:04d}.md)")
        lines.append("")

    # Footer
    lines.append("---")
    lines.append("")
    lines.append("[← Back to Index](README.md)")
    lines.append("")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Rewrite grail mibera files")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    grails = load_grails()
    print(f"Loaded {len(grails)} grails")

    rewritten = 0
    for g in grails:
        fpath = MIBERAS_DIR / f"{g['id']:04d}.md"
        if not fpath.exists():
            print(f"  MISSING: {fpath.name}")
            continue

        new_content = build_grail_mibera(g["id"], g)

        if args.dry_run:
            print(f"  Would rewrite: {fpath.name} → {g['name']}")
        else:
            fpath.write_text(new_content, encoding="utf-8")

        rewritten += 1

    action = "Would rewrite" if args.dry_run else "Rewrote"
    print(f"\n  {action}: {rewritten} grail mibera files")


if __name__ == "__main__":
    main()
