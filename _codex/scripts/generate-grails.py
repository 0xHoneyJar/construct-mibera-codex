#!/usr/bin/env python3
"""Generate Grails browse page and JSONL data export.

Reads grails/*.md frontmatter and generates:
  - browse/grails.md    (categorized browse page)
  - _codex/data/grails.jsonl  (structured data export)

Usage: python3 _codex/scripts/generate-grails.py
"""

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
GRAILS_DIR = REPO_ROOT / "grails"
BROWSE_OUT = REPO_ROOT / "browse" / "grails.md"
JSONL_OUT = REPO_ROOT / "_codex" / "data" / "grails.jsonl"

TIMESTAMP = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
HEADER = f"<!-- generated: {TIMESTAMP} by _codex/scripts/generate-grails.py -->"

# Category display order
CATEGORY_ORDER = [
    "element", "luminary", "concept", "zodiac",
    "planet", "ancestor", "primordial", "special",
    "community",
]

CATEGORY_LABELS = {
    "element": "Element",
    "luminary": "Luminary",
    "concept": "Concept",
    "zodiac": "Zodiac",
    "planet": "Planet",
    "ancestor": "Ancestor",
    "primordial": "Primordial",
    "special": "Special",
    "community": "Community",
}

REQUIRED_FIELDS = {"id", "name", "type", "category"}


def parse_frontmatter(path):
    """Parse YAML frontmatter from a markdown file (stdlib only)."""
    text = path.read_text(encoding="utf-8")
    match = re.match(r"^---\n(.*?)\n---", text, re.DOTALL)
    if not match:
        return None
    fm = {}
    for line in match.group(1).splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        m = re.match(r'^(\w+)\s*:\s*(.+)$', line)
        if m:
            key = m.group(1)
            val = m.group(2).strip()
            # Strip surrounding quotes
            if (val.startswith('"') and val.endswith('"')) or \
               (val.startswith("'") and val.endswith("'")):
                val = val[1:-1]
            # Parse integer for id
            if key == "id":
                try:
                    val = int(val)
                except ValueError:
                    pass
            fm[key] = val
    return fm


def slugify(name):
    """Convert display name to file slug."""
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')


def load_grails():
    """Load all Grail records from grails/*.md frontmatter."""
    grails = []
    errors = []
    for path in sorted(GRAILS_DIR.glob("*.md")):
        if path.name == "README.md":
            continue
        fm = parse_frontmatter(path)
        if fm is None:
            errors.append(f"{path.name}: no frontmatter found")
            continue
        missing = REQUIRED_FIELDS - set(fm.keys())
        if missing:
            errors.append(f"{path.name}: missing fields: {', '.join(sorted(missing))}")
            continue
        fm["slug"] = path.stem
        grails.append(fm)

    if errors:
        print("ERROR: Grail frontmatter validation failed:", file=sys.stderr)
        for e in errors:
            print(f"  {e}", file=sys.stderr)
        sys.exit(1)

    return grails


def generate_browse(grails):
    """Generate browse/grails.md."""
    # Group by category
    by_cat = {}
    for g in grails:
        cat = g["category"]
        by_cat.setdefault(cat, []).append(g)

    # Sort within each category by name
    for cat in by_cat:
        by_cat[cat].sort(key=lambda g: g["name"])

    lines = [
        HEADER,
        "",
        "# Browse: Grails",
        "",
        f"*{len(grails)} hand-drawn 1/1 art pieces across {len(by_cat)} categories.*",
        "",
        "---",
        "",
    ]

    for cat in CATEGORY_ORDER:
        items = by_cat.get(cat, [])
        if not items:
            continue
        label = CATEGORY_LABELS[cat]
        lines.append(f"## {label} ({len(items)})")
        lines.append("")
        links = [f"[{g['name']}](../grails/{g['slug']}.md)" for g in items]
        lines.append(" · ".join(links))
        lines.append("")

    BROWSE_OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"  wrote {BROWSE_OUT.relative_to(REPO_ROOT)} ({len(grails)} grails)")


def generate_jsonl(grails):
    """Generate _codex/data/grails.jsonl."""
    # Sort by token ID
    sorted_grails = sorted(grails, key=lambda g: g["id"])

    records = []
    for g in sorted_grails:
        records.append(json.dumps({
            "id": g["id"],
            "name": g["name"],
            "type": g["type"],
            "category": g["category"],
            "slug": g["slug"],
            "description": g.get("description", ""),
        }, ensure_ascii=False))

    JSONL_OUT.write_text("\n".join(records) + "\n", encoding="utf-8")
    print(f"  wrote {JSONL_OUT.relative_to(REPO_ROOT)} ({len(records)} records)")


def main():
    if not GRAILS_DIR.is_dir():
        print(f"ERROR: {GRAILS_DIR} not found", file=sys.stderr)
        sys.exit(1)

    grails = load_grails()
    if not grails:
        print("ERROR: no Grail files found", file=sys.stderr)
        sys.exit(1)

    print(f"generate-grails: {len(grails)} grails loaded")
    generate_browse(grails)
    generate_jsonl(grails)
    print("done.")


if __name__ == "__main__":
    main()
