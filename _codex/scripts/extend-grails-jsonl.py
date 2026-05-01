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

# Original generative render hashes, recovered from fracture_images DB
ORIGINAL_HASHES = {
    235: "f720431514a32d100b435bc80f6d25ce86a24542.png",
    309: "e8a70742f89254388a77c32cee014f0de1b64ed5.png",
    392: "9428ed44ed50b550f06a45113c8defe6b7193a5b.png",
    507: "d23505a620e82e5c306c94091b9e7e78d59aa5cf.png",
    876: "8b526596cd71fdfc2bc9df4ac11ea875e9de6c63.png",
    895: "477f00a1c38c449f181fd06f37f2d6a747c76170.png",
    1134: "e3bcee999164c77617d3fd1502505ef6ee75178a.png",
    1606: "4633172212c68a318ec447eb46aa3c09eceda710.png",
    1630: "18d43dd4171bfa37e1bb7bcf1cb18e804566aa0e.png",
    2113: "529eff427e496a1842884c06fab3335eb3769573.png",
    2256: "ae358ad06f6b544de97857402527f439871ef071.png",
    2566: "0abaa1e9920a4655ce4e2b49ec4e5e913a9cdfa4.png",
    2769: "f90e3a52e373ced6542deffe770a3450c6bad6ce.png",
    3116: "57d7cf73bd61971000b8534dc8f5aa3a568e0dcf.png",
    3201: "0a94fe4a88c23baf120a222f91e5e2fd8c8e8013.png",
    3222: "6a751453410fd406d52c9edb3f4df59d020b7cc8.png",
    3244: "e678ca585b014d9ac1dfcc6655c5a4c1e5d21d13.png",
    3282: "4a2fdefcb8ff99146c523d85fed9f6c319ace492.png",
    3970: "ff27288ef25158fe33e1677376f457cc7b0b99e4.png",
    4221: "c5f21d776d720bdf74eb7fa8446114abc738634c.png",
    4363: "d43d1aa54b5752c7d586454e64a706d1942b6caa.png",
    4488: "fe793e9bc8ede90c94e2bcabb86ecfa19db2a271.png",
    4617: "a8f610f70e236891c71cc2902df8a392017004ab.png",
    4701: "879404171cf7bacf7d7395f6e9af6c781211495c.png",
    4734: "8769b02e96f861badc6c5ffbdce8072674e0113f.png",
    4803: "d4344f6923c0c7d7dd8dc3c9c568dd79320862a0.png",
    6409: "dd00d7d06b3ec0fe317c213e233a7e970f8d05a2.png",
    6458: "bedebf391932224eac2db6bbeedb60b5ae9e7f77.png",
    6761: "3fae41192778171693298da8df469befc6952513.png",
    6805: "a5ebc965648a86e5f899e374bbe30df1a3d63c2f.png",
    7218: "937fad7507a5f23cdb1e65e8ffd9d9ee925c0167.png",
    7321: "a79fd81b5e1da0c43b69211818a7a4d08c34f459.png",
    7388: "aa3a6bd808ce3d8824bbc16a9b8afa829f383429.png",
    7702: "ca4a3e64ba8f48de438421e27270bf182ab855f2.png",
    7916: "1451789c98b4a9bbe9f63336e1c7a54c42418978.png",
    8277: "3305f411e4f4d372b7bc0012b5f1cd1a2bd74cf3.png",
    8557: "9c7f0baaa22051b3d7ba703a8e8529ec7186d7d5.png",
    8620: "cee8e2a3fe4246b1c09d9e21619b85552ab8a9fd.png",
    8834: "441e2c984a1f2677870e034f474be1af750b37fa.png",
    8971: "dacba667a085a528175c34b58a6cc6dc981b2629.png",
    9112: "72b8282cbe6ff25e5347e8622910449038399cdf.png",
    9503: "033df7b09d8c8ddeb8a37336c40124cdd5df3177.png",
    9639: "86d7315693e5382ed8f409dfb9583c689b45fdf3.png",
}


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
            "original_image": f"https://{CDN_HOST}/reveal_phase8/images/{ORIGINAL_HASHES[grail['id']]}" if grail["id"] in ORIGINAL_HASHES else None,
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
