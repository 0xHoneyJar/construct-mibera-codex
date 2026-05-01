#!/usr/bin/env python3
"""Extend grails.jsonl with name (option A), attributes (narrative), and original_image placeholder.

Reads grail .md files for description, category, and cultural context.
Outputs grails.jsonl v3 with:
- name: grail name only (no "Mibera #N:" prefix)
- attributes: Tier, Category, Theme (from description), Cultural Reference (first sentence of Cultural Context)
- image: current CDN grail image
- original_image: placeholder for original generative render hash (to be filled from S3 metadata)

Usage:
    python3 _codex/scripts/extend-grails-jsonl.py --dry-run
    python3 _codex/scripts/extend-grails-jsonl.py
"""

import argparse
import json
import re
from pathlib import Path

CODEX_ROOT = Path(__file__).resolve().parent.parent.parent
GRAILS_DIR = CODEX_ROOT / "grails"
GRAILS_JSONL = CODEX_ROOT / "_codex" / "data" / "grails.jsonl"
CDN_HOST = "assets.0xhoneyjar.xyz"


def extract_section(content, heading):
    """Extract text under a ## heading."""
    pattern = rf"## {re.escape(heading)}\s*\n(.*?)(?=\n## |\Z)"
    match = re.search(pattern, content, re.DOTALL)
    if match:
        return match.group(1).strip()
    return None


def first_sentence(text):
    """Extract first real sentence from text (skip markdown headings)."""
    if not text:
        return None
    for line in text.split('\n'):
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        match = re.match(r'(.+?\.)\s', line)
        if match:
            return match.group(1)
        return line
    return None


def extract_image_url(content):
    """Extract image URL from markdown."""
    match = re.search(r'!\[.*?\]\((https://[^)]+)\)', content)
    return match.group(1) if match else None


def load_grail(fpath):
    """Load a grail file and extract all fields."""
    content = fpath.read_text(encoding="utf-8")
    if not content.startswith("---"):
        return None

    end = content.index("---", 3)
    fm_text = content[3:end].strip()

    entry = {"slug": fpath.stem}
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

    entry["image"] = extract_image_url(content)
    entry["cultural_context"] = extract_section(content, "Cultural Context")
    entry["visual_elements"] = extract_section(content, "Visual Elements")

    return entry


def build_attributes(entry):
    """Build narrative attributes from grail data."""
    attrs = [
        {"trait_type": "Tier", "value": "Grail"},
        {"trait_type": "Category", "value": entry.get("category", "").title()},
    ]

    # Theme from description
    desc = entry.get("description", "")
    if desc:
        attrs.append({"trait_type": "Theme", "value": desc})

    # Cultural Reference from first sentence of Cultural Context
    cultural = entry.get("cultural_context", "")
    if cultural:
        ref = first_sentence(cultural)
        if ref:
            attrs.append({"trait_type": "Cultural Reference", "value": ref})

    return attrs


def main():
    parser = argparse.ArgumentParser(description="Extend grails.jsonl v3")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    entries = []
    for fpath in sorted(GRAILS_DIR.glob("*.md")):
        if fpath.name == "README.md":
            continue
        grail = load_grail(fpath)
        if not grail or "id" not in grail:
            continue

        out = {
            "id": grail["id"],
            "name": grail["name"],
            "type": "grail",
            "category": grail.get("category", ""),
            "slug": grail["slug"],
            "description": grail.get("description", ""),
            "image": grail.get("image", ""),
            "attributes": build_attributes(grail),
        }
        entries.append(out)

    if args.dry_run:
        for e in entries:
            print(f"  #{e['id']} {e['name']}: {len(e['attributes'])} attributes")
        print(f"\n  Would write: {len(entries)} entries")
    else:
        with open(GRAILS_JSONL, "w", encoding="utf-8") as f:
            for e in entries:
                f.write(json.dumps(e, ensure_ascii=False) + "\n")
        print(f"  Wrote: {len(entries)} entries to grails.jsonl")


if __name__ == "__main__":
    main()
