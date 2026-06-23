#!/usr/bin/env python3
"""validate-schemas.py — Validate entity frontmatter against the JSON Schemas.

Turns the `_codex/schema/*.schema.json` files from documentation into
enforcement: every entity file's YAML frontmatter is validated against its
schema (JSON Schema Draft 2020-12). Complements audit-structure.sh (which uses
its own field checks) with strict schema validation.

Exit code: 0 if all valid, 1 if any violation. Pass --sample N to cap printed
violations per schema (default 10).

Requires: PyYAML, jsonschema.
"""

import argparse
import json
import sys
from pathlib import Path

import yaml

try:
    from jsonschema import Draft202012Validator
except ImportError:
    Draft202012Validator = None

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
SCHEMA_DIR = REPO_ROOT / "_codex" / "schema"
SKIP_NAMES = {"README.md", "overview.md", "drug-pairings.md", "index.md", "timeline.md"}

# Trait subcategories split exactly as audit-structure.sh: "full" dirs carry
# swag_score/date_added, "minimal" dirs require only name.
TRAIT_FULL_DIRS = [
    "traits/accessories/earrings", "traits/accessories/face-accessories",
    "traits/accessories/glasses", "traits/accessories/hats",
    "traits/accessories/masks", "traits/clothing/long-sleeves",
    "traits/clothing/short-sleeves", "traits/items/general-items",
]
TRAIT_MINIMAL_DIRS = [
    "traits/backgrounds", "traits/clothing/simple-shirts",
    "traits/items/bong-bears", "traits/character-traits/body",
    "traits/character-traits/eyebrows", "traits/character-traits/eyes",
    "traits/character-traits/hair", "traits/character-traits/mouth",
    "traits/character-traits/tattoos", "traits/overlays/astrology",
    "traits/overlays/elements", "traits/overlays/ranking",
]

# (label, schema filename, list of dirs, digit_only)
TARGETS = [
    ("mibera", "mibera.schema.json", ["miberas"], True),
    ("miparcel", "miparcel.schema.json", ["miparcels"], True),
    ("trait-full", "trait-full.schema.json", TRAIT_FULL_DIRS, False),
    ("trait-minimal", "trait-minimal.schema.json", TRAIT_MINIMAL_DIRS, False),
    ("drug", "drug.schema.json", ["traits/overlays/molecules"], False),
    ("ancestor", "ancestor.schema.json", ["core-lore/ancestors"], False),
    ("tarot-card", "tarot-card.schema.json", ["core-lore/tarot-cards"], False),
    ("grail", "grail.schema.json", ["grails"], False),
    ("special-collection", "special-collection.schema.json", ["special-collections"], False),
]


def parse_frontmatter(path):
    """Return frontmatter dict, or None if absent/malformed (reported by caller)."""
    content = path.read_text(encoding="utf-8")
    if not content.startswith("---\n"):
        return None
    try:
        end = content.index("\n---", 3)
    except ValueError:
        return None
    return yaml.safe_load(content[4:end])


def iter_files(dirs, digit_only):
    for d in dirs:
        base = REPO_ROOT / d
        if not base.exists():
            continue
        # special-collections nests one level; everything else is flat
        pattern = "**/*.md" if d == "special-collections" else "*.md"
        for f in base.glob(pattern):
            if f.name in SKIP_NAMES:
                continue
            if digit_only and not f.stem.isdigit():
                continue
            yield f


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sample", type=int, default=10, help="max violations printed per schema")
    args = ap.parse_args()

    if Draft202012Validator is None:
        print("jsonschema not installed — skipping schema validation "
              "(install: pip install jsonschema)")
        return 0

    total_files = 0
    total_bad = 0
    for label, schema_name, dirs, digit_only in TARGETS:
        schema_path = SCHEMA_DIR / schema_name
        schema = json.loads(schema_path.read_text())
        Draft202012Validator.check_schema(schema)
        validator = Draft202012Validator(schema)

        checked = 0
        violations = []
        for f in iter_files(dirs, digit_only):
            fm = parse_frontmatter(f)
            if fm is None:
                violations.append((f, "missing or malformed frontmatter"))
                continue
            checked += 1
            errs = sorted(validator.iter_errors(fm), key=lambda e: str(e.path))
            for e in errs:
                loc = "/".join(str(p) for p in e.path) or "(root)"
                violations.append((f, f"{loc}: {e.message}"))

        total_files += checked
        bad = len(violations)
        total_bad += bad
        status = "PASS" if bad == 0 else "FAIL"
        print(f"  {status} {label:20s} {checked:5d} files, {bad} violation(s)")
        for f, msg in violations[: args.sample]:
            print(f"      - {f.relative_to(REPO_ROOT)} :: {msg}")
        if bad > args.sample:
            print(f"      ... and {bad - args.sample} more")

    print(f"\nTotal: {total_files} files validated, {total_bad} violation(s)")
    return 1 if total_bad else 0


if __name__ == "__main__":
    sys.exit(main())
