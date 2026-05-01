#!/usr/bin/env python3
"""Add grail backlinks to mibera files and image field to grails.jsonl.

Cycle 023 Sprint 2 — Grail ↔ Mibera cross-links

For each grail, patches the corresponding mibera file:
1. Adds `grail: "{grail_name}"` to YAML frontmatter (after `parcel:`)
2. Adds `| Grail | [{name}](../grails/{slug}.md) |` to traits table

Also regenerates grails.jsonl with `image` field.

Usage:
    python3 _codex/scripts/add-grail-backlinks.py --dry-run
    python3 _codex/scripts/add-grail-backlinks.py
"""

import argparse
import json
import os
import re
from pathlib import Path

CODEX_ROOT = Path(__file__).resolve().parent.parent.parent
GRAILS_DIR = CODEX_ROOT / "grails"
MIBERAS_DIR = CODEX_ROOT / "miberas"
GRAILS_JSONL = CODEX_ROOT / "_codex" / "data" / "grails.jsonl"

CDN_HOST = "assets.0xhoneyjar.xyz"


def load_grails():
    """Load all grail entries from grails/*.md frontmatter."""
    grails = []
    for fpath in sorted(GRAILS_DIR.glob("*.md")):
        if fpath.name == "README.md":
            continue
        content = fpath.read_text(encoding="utf-8")
        # Parse YAML frontmatter
        if not content.startswith("---"):
            continue
        end = content.index("---", 3)
        fm = content[3:end].strip()

        entry = {"slug": fpath.stem}
        for line in fm.split("\n"):
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


def mibera_path(mibera_id):
    """Get the path to a mibera file by ID."""
    return MIBERAS_DIR / f"{mibera_id:04d}.md"


def patch_mibera(fpath, grail_name, grail_slug, dry_run=False):
    """Add grail field to mibera frontmatter and grail row to traits table."""
    content = fpath.read_text(encoding="utf-8")

    # Skip if already patched
    if "grail:" in content:
        return False

    lines = content.split("\n")
    new_lines = []
    in_frontmatter = False
    frontmatter_done = False
    parcel_found = False
    table_patched = False

    for i, line in enumerate(lines):
        if line.strip() == "---" and not in_frontmatter and not frontmatter_done:
            in_frontmatter = True
            new_lines.append(line)
            continue
        elif line.strip() == "---" and in_frontmatter:
            # End of frontmatter — if we didn't find parcel, add grail before closing
            if not parcel_found:
                new_lines.append(f'grail: "{grail_name}"')
            in_frontmatter = False
            frontmatter_done = True
            new_lines.append(line)
            continue

        if in_frontmatter and line.startswith("parcel:"):
            parcel_found = True
            new_lines.append(line)
            new_lines.append(f'grail: "{grail_name}"')
            continue

        # Find the last trait table row (before the --- separator)
        if frontmatter_done and not table_patched:
            if line.startswith("| Parcel"):
                new_lines.append(line)
                new_lines.append(f"| Grail | [{grail_name}](../grails/{grail_slug}.md) |")
                table_patched = True
                continue
            # If no parcel row, look for last | row before ---
            if line.strip() == "---" and i > 0 and new_lines and new_lines[-1].startswith("| "):
                new_lines.append(f"| Grail | [{grail_name}](../grails/{grail_slug}.md) |")
                table_patched = True

        new_lines.append(line)

    if not dry_run:
        fpath.write_text("\n".join(new_lines), encoding="utf-8")

    return True


def grail_image_url(slug, grail_md_path=None):
    """Get CDN URL for a grail image — read from the .md file if available."""
    if grail_md_path and grail_md_path.exists():
        content = grail_md_path.read_text(encoding="utf-8")
        import re
        match = re.search(r'!\[.*?\]\((https://[^)]+)\)', content)
        if match:
            return match.group(1)
    return f"https://{CDN_HOST}/Mibera/grails/{slug}.png"


def update_grails_jsonl(grails, dry_run=False):
    """Regenerate grails.jsonl with image field."""
    entries = []
    for g in grails:
        entry = {
            "id": g["id"],
            "name": g["name"],
            "type": "grail",
            "category": g.get("category", ""),
            "slug": g["slug"],
            "description": g.get("description", ""),
            "image": grail_image_url(g["slug"], GRAILS_DIR / f"{g['slug']}.md"),
        }
        entries.append(entry)

    if not dry_run:
        with open(GRAILS_JSONL, "w", encoding="utf-8") as f:
            for entry in entries:
                f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    return len(entries)


def main():
    parser = argparse.ArgumentParser(description="Add grail backlinks to mibera files")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    grails = load_grails()
    print(f"Loaded {len(grails)} grails")

    patched = 0
    skipped = 0
    missing = 0

    for g in grails:
        fpath = mibera_path(g["id"])
        if not fpath.exists():
            print(f"  MISSING: miberas/{g['id']:04d}.md for grail '{g['name']}'")
            missing += 1
            continue

        if patch_mibera(fpath, g["name"], g["slug"], args.dry_run):
            patched += 1
            if args.dry_run:
                print(f"  Would patch: miberas/{g['id']:04d}.md ← {g['name']}")
        else:
            skipped += 1

    jsonl_count = update_grails_jsonl(grails, args.dry_run)

    action = "Would patch" if args.dry_run else "Patched"
    print(f"\n  {action}: {patched} mibera files")
    print(f"  Skipped (already patched): {skipped}")
    if missing:
        print(f"  Missing mibera files: {missing}")
    print(f"  grails.jsonl: {jsonl_count} entries {'(would update)' if args.dry_run else 'updated'} with image field")


if __name__ == "__main__":
    main()
