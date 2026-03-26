#!/usr/bin/env python3
"""Embed S3-hosted trait images into codex markdown files.

Cycle 019 — Trait Image Embedding — S3 Visual Layer

Usage:
    python3 _codex/scripts/embed-images.py [--dry-run]

Stdlib-only. No external dependencies.
"""

import os
import re
import sys
import json
from urllib.parse import quote
from pathlib import Path

CODEX_ROOT = Path(__file__).resolve().parent.parent.parent
IMAGE_DIR = Path("/Users/gumi/micodex-images/output")
S3_BASE = "https://mibera.s3.amazonaws.com/traits"

DRY_RUN = "--dry-run" in sys.argv

# --- Known constants ---

ARCHETYPES = {"acidhouse", "chicagodetroit", "freetekno", "milady"}
ERAS = {"ancient", "modern"}
ELEMENTS = {"air", "earth", "fire", "water"}
RANKING_LETTERS = {"a", "b", "c", "d", "f", "s", "ss", "sss"}
ASTROLOGY_SIGNS = {
    "aries", "taurus", "gemini", "cancer", "leo", "virgo",
    "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
}
ASTROLOGY_LAYERS = {"sun", "moon", "rising"}

# Ancestor names as they appear in image filenames → codex slug
# (many-to-one because images use camelCase, plurals, abbreviations)
ANCESTOR_IMAGE_NAMES = {
    "aboriginal", "aboriginals", "arabs", "ballroomScene", "ballroom",
    "buddhist", "buddhists", "chinese", "cypherpunk", "ethiopian",
    "ethiopians", "gabon", "greek", "greekAncients", "haitian",
    "haitians", "hindu", "indian", "irishDruids", "japanese",
    "mayan", "mongolian", "nativeAmerican", "nativeAmericans", "nepal",
    "orthodoxJews", "palestinian", "polynesian", "punjabi", "pythia",
    "rastafarian", "rastafarians", "sami", "satanist", "satanists",
    "sicanje", "stonewall", "sufi", "sufis", "thai", "traveller", "turkey",
}


def slugify(name):
    """Convert display name to slug: lowercase, spaces/special → hyphens."""
    s = name.lower().strip()
    s = re.sub(r"[''`]", "", s)  # remove apostrophes
    s = re.sub(r"[^a-z0-9]+", "-", s)  # non-alnum → hyphen
    s = s.strip("-")
    return s


def s3_url(filename):
    """Build full S3 URL with proper encoding."""
    return f"{S3_BASE}/{quote(filename, safe='')}"


def build_slug_index():
    """Walk codex dirs and build slug → filepath mapping."""
    index = {}
    dirs_to_walk = [
        CODEX_ROOT / "traits",
        CODEX_ROOT / "drugs-detailed",
        CODEX_ROOT / "vending-machine",
    ]
    for d in dirs_to_walk:
        if not d.exists():
            continue
        for root, _, files in os.walk(d):
            for f in files:
                if f.endswith(".md") and f != "README.md":
                    slug = f[:-3]  # strip .md
                    filepath = Path(root) / f
                    # Store relative to codex root for reporting
                    index[slug] = filepath
    return index


def parse_image_filename(filename):
    """Parse an image filename and return (target_slug, target_dir_hint, image_type).

    Returns None if the image should be skipped.
    """
    name = filename[:-5]  # strip .webp

    # --- Skip rules ---
    if name.endswith("_overlay"):
        return None  # deferred
    if name.startswith("IMG_"):
        return None  # unknown

    # --- Astrology: "Sun Aries", "Moon Pisces", "Rising Leo" ---
    astro_match = re.match(r"^(Sun|Moon|Rising)\s+(.+)$", name)
    if astro_match:
        layer, sign = astro_match.groups()
        sign_slug = slugify(sign)
        if sign_slug in ASTROLOGY_SIGNS:
            return (sign_slug, "astrology", "astrology", layer.lower())

    # --- Elements ---
    if name.lower() in ELEMENTS:
        return (name.lower(), "elements", "element", None)

    # --- Ranking letters ---
    if name.upper() in {x.upper() for x in RANKING_LETTERS}:
        return (name.lower(), "ranking", "ranking", None)

    # --- SS5_bongbear_ prefix ---
    bb_match = re.match(r"^SS5_bongbear_(.+)$", name)
    if bb_match:
        trait_name = bb_match.group(1)
        return (slugify(trait_name), "bong-bears", "trait", None)

    # --- SS5_cypherpunk_ prefix ---
    cp_match = re.match(r"^SS5_cypherpunk_(.+)$", name)
    if cp_match:
        trait_name = cp_match.group(1)
        return (slugify(trait_name), "general-items", "trait", None)

    # --- SS-prefixed with archetype + era + ancestor(s) + trait ---
    ss_full = re.match(r"^SS(\d+)_([a-z]+)_(ancient|modern)_(.+)$", name, re.IGNORECASE)
    if ss_full:
        _, arch, era, rest = ss_full.groups()
        if arch.lower() in ARCHETYPES:
            # rest might be "ancestor_TraitName" or "anc1_anc2_TraitName"
            # The trait name is the last component that ISN'T an ancestor
            parts = rest.split("_")
            # Walk from the end to find where ancestors stop
            trait_parts = []
            for i in range(len(parts) - 1, -1, -1):
                if parts[i].lower() in {a.lower() for a in ANCESTOR_IMAGE_NAMES}:
                    break
                trait_parts.insert(0, parts[i])
            if trait_parts:
                trait_name = " ".join(trait_parts)
                return (slugify(trait_name), None, "trait", None)

    # --- SS-prefixed with archetype + trait (no era/ancestor) ---
    ss_arch = re.match(r"^SS(\d+)_([a-z]+)_(.+)$", name, re.IGNORECASE)
    if ss_arch:
        _, arch, trait_name = ss_arch.groups()
        if arch.lower() in ARCHETYPES:
            return (slugify(trait_name), None, "trait", None)

    # --- SS-prefixed, just trait name ---
    ss_plain = re.match(r"^SS(\d+)_(.+)$", name, re.IGNORECASE)
    if ss_plain:
        _, trait_name = ss_plain.groups()
        return (slugify(trait_name), None, "trait", None)

    # --- Non-SS archetype combos: check for drug (molecule overlay) ---
    # Pattern: arch_ancestor(s)_drug
    parts = name.split("_")
    if len(parts) >= 3 and parts[0].lower() in ARCHETYPES:
        # Last component is the drug/trait name
        # Check if middle components look like ancestors
        middle = parts[1:-1]
        all_ancestors = all(
            any(m.lower() == a.lower() for a in ANCESTOR_IMAGE_NAMES)
            for m in middle
        )
        if all_ancestors:
            drug_name = parts[-1]
            return (slugify(drug_name), "drugs-detailed", "drug", None)

    # --- Non-SS archetype + trait (2 components, glasses etc.) ---
    if len(parts) == 2 and parts[0].lower() in ARCHETYPES:
        trait_name = parts[1]
        return (slugify(trait_name), None, "trait", None)

    # --- Era + ancestor + tattoo ---
    if len(parts) >= 3 and parts[0].lower() in ERAS:
        # Check if parts[1:-1] are ancestors
        middle = parts[1:-1]
        all_ancestors = all(
            any(m.lower() == a.lower() for a in ANCESTOR_IMAGE_NAMES)
            for m in middle
        )
        if all_ancestors:
            tattoo_name = parts[-1]
            return (slugify(tattoo_name), "tattoos", "trait", None)

    # --- Direct name match (broadest) ---
    return (slugify(name), None, "direct", None)


def update_frontmatter_image(content, url):
    """Update or insert image: field in YAML frontmatter."""
    lines = content.split("\n")

    # Find frontmatter boundaries
    fm_start = -1
    fm_end = -1
    for i, line in enumerate(lines):
        if line.strip() == "---":
            if fm_start == -1:
                fm_start = i
            else:
                fm_end = i
                break

    if fm_start == -1 or fm_end == -1:
        return content  # no frontmatter, skip

    # Look for existing image: field
    image_found = False
    for i in range(fm_start + 1, fm_end):
        if re.match(r"^image:", lines[i]):
            lines[i] = f'image: "{url}"'
            image_found = True
            break

    if not image_found:
        # Insert before closing ---
        lines.insert(fm_end, f'image: "{url}"')
        fm_end += 1

    return "\n".join(lines)


def insert_inline_image(content, url, alt_text):
    """Insert centered <img> tag after frontmatter, before existing content."""
    # Check if already has an S3 image embedded
    if "mibera.s3.amazonaws.com" in content and '<img src="' in content:
        # Already embedded, just update frontmatter
        return content

    lines = content.split("\n")

    # Find closing --- of frontmatter
    fm_count = 0
    insert_at = -1
    for i, line in enumerate(lines):
        if line.strip() == "---":
            fm_count += 1
            if fm_count == 2:
                insert_at = i + 1
                break

    if insert_at == -1:
        return content

    # Remove any existing old object storage images
    cleaned_lines = []
    skip_old_div = False
    for i, line in enumerate(lines):
        if i < insert_at:
            cleaned_lines.append(line)
            continue
        # Skip old embedded images from objectstorage
        if "mibera.fsn1.your-objectstorage.com" in line:
            continue
        if line.startswith("![") and "objectstorage" in line:
            continue
        cleaned_lines.append(line)

    lines = cleaned_lines

    # Re-find insert point after cleaning
    fm_count = 0
    insert_at = -1
    for i, line in enumerate(lines):
        if line.strip() == "---":
            fm_count += 1
            if fm_count == 2:
                insert_at = i + 1
                break

    img_block = [
        "",
        '<div align="center">',
        f'  <img src="{url}" alt="{alt_text}" width="320" />',
        '</div>',
        "",
    ]

    for j, img_line in enumerate(img_block):
        lines.insert(insert_at + j, img_line)

    return "\n".join(lines)


def insert_astrology_images(content, sign):
    """Insert 3 astrology layer images for a sign."""
    if "mibera.s3.amazonaws.com" in content and '<img src="' in content:
        return content

    lines = content.split("\n")
    fm_count = 0
    insert_at = -1
    for i, line in enumerate(lines):
        if line.strip() == "---":
            fm_count += 1
            if fm_count == 2:
                insert_at = i + 1
                break

    if insert_at == -1:
        return content

    # Remove old objectstorage images
    cleaned = []
    for i, line in enumerate(lines):
        if i < insert_at:
            cleaned.append(line)
            continue
        if "mibera.fsn1.your-objectstorage.com" in line:
            continue
        if line.startswith("![") and "objectstorage" in line:
            continue
        if line.startswith("![Sun") or line.startswith("![Moon") or line.startswith("![Rising"):
            if "objectstorage" in line or "fsn1" in line:
                continue
        cleaned.append(line)
    lines = cleaned

    fm_count = 0
    insert_at = -1
    for i, line in enumerate(lines):
        if line.strip() == "---":
            fm_count += 1
            if fm_count == 2:
                insert_at = i + 1
                break

    sign_cap = sign.capitalize()
    sun_url = s3_url(f"Sun {sign_cap}.webp")
    moon_url = s3_url(f"Moon {sign_cap}.webp")
    rising_url = s3_url(f"Rising {sign_cap}.webp")

    img_block = [
        "",
        '<div align="center">',
        f'  <img src="{sun_url}" alt="Sun {sign_cap}" width="200" />',
        f'  <img src="{moon_url}" alt="Moon {sign_cap}" width="200" />',
        f'  <img src="{rising_url}" alt="Rising {sign_cap}" width="200" />',
        '</div>',
        "",
    ]

    for j, img_line in enumerate(img_block):
        lines.insert(insert_at + j, img_line)

    return "\n".join(lines)


def main():
    slug_index = build_slug_index()
    print(f"Slug index: {len(slug_index)} entries")

    # Collect all images
    images = sorted(f for f in os.listdir(IMAGE_DIR) if f.endswith(".webp"))
    print(f"Images found: {len(images)}")

    matched = []
    skipped = []
    orphaned = []
    errors = []
    astrology_pending = {}  # sign → list of (layer, filename)

    for img_file in images:
        result = parse_image_filename(img_file)

        if result is None:
            skipped.append({"file": img_file, "reason": "skip rule"})
            continue

        if len(result) == 4 and result[2] == "astrology":
            slug, _, _, layer = result
            if slug not in astrology_pending:
                astrology_pending[slug] = {}
            astrology_pending[slug][layer] = img_file
            continue

        slug, dir_hint, img_type, _ = result

        # Resolve to codex file
        target = None

        if dir_hint == "drugs-detailed":
            target = slug_index.get(slug)
            if target and "drugs-detailed" not in str(target):
                # Wrong directory - might be a trait with same name
                target = None
            if not target:
                # Try direct path
                p = CODEX_ROOT / "drugs-detailed" / f"{slug}.md"
                if p.exists():
                    target = p
        elif dir_hint == "elements":
            p = CODEX_ROOT / "traits" / "overlays" / "elements" / f"{slug}.md"
            if p.exists():
                target = p
        elif dir_hint == "ranking":
            p = CODEX_ROOT / "traits" / "overlays" / "ranking" / f"{slug}.md"
            if p.exists():
                target = p
        elif dir_hint == "bong-bears":
            # Try with and without "bong-bear-" prefix
            for try_slug in [slug, f"bong-bear-{slug}"]:
                if try_slug in slug_index:
                    target = slug_index[try_slug]
                    break
            if not target:
                p = CODEX_ROOT / "traits" / "items" / "bong-bears" / f"{slug}.md"
                if p.exists():
                    target = p
        elif dir_hint == "general-items":
            target = slug_index.get(slug)
            if not target:
                p = CODEX_ROOT / "traits" / "items" / "general-items" / f"{slug}.md"
                if p.exists():
                    target = p
        elif dir_hint == "tattoos":
            target = slug_index.get(slug)
            if target and "tattoos" not in str(target):
                target = None
            if not target:
                p = CODEX_ROOT / "traits" / "character-traits" / "tattoos" / f"{slug}.md"
                if p.exists():
                    target = p
        else:
            # General lookup
            target = slug_index.get(slug)

        if target is None:
            orphaned.append({"file": img_file, "slug": slug, "hint": dir_hint})
            continue

        matched.append({
            "file": img_file,
            "target": str(target.relative_to(CODEX_ROOT)),
            "slug": slug,
            "type": img_type,
        })

    # Process astrology signs
    for sign, layers in astrology_pending.items():
        target = CODEX_ROOT / "traits" / "overlays" / "astrology" / f"{sign}.md"
        if target.exists():
            matched.append({
                "file": f"[astrology:{sign}]",
                "target": str(target.relative_to(CODEX_ROOT)),
                "slug": sign,
                "type": "astrology",
                "layers": layers,
            })
        else:
            for layer, f in layers.items():
                orphaned.append({"file": f, "slug": sign, "hint": "astrology"})

    print(f"\nMatched:  {len(matched)}")
    print(f"Skipped:  {len(skipped)}")
    print(f"Orphaned: {len(orphaned)}")

    if orphaned:
        print("\nOrphan images (no codex match):")
        for o in sorted(orphaned, key=lambda x: x["file"]):
            print(f"  - {o['file']} (slug: {o['slug']})")

    # --- Apply changes ---
    updated = 0
    for entry in matched:
        target_path = CODEX_ROOT / entry["target"]

        try:
            content = target_path.read_text(encoding="utf-8")
        except Exception as e:
            errors.append({"file": entry["file"], "error": str(e)})
            continue

        if entry["type"] == "astrology":
            # Use first available layer for frontmatter
            layers = entry.get("layers", {})
            first_file = layers.get("sun") or layers.get("moon") or layers.get("rising")
            if first_file:
                url = s3_url(first_file)
                new_content = update_frontmatter_image(content, url)
                new_content = insert_astrology_images(new_content, entry["slug"])
            else:
                continue
        else:
            url = s3_url(entry["file"])
            alt_text = entry.get("slug", "").replace("-", " ").title()
            new_content = update_frontmatter_image(content, url)
            new_content = insert_inline_image(new_content, url, alt_text)

        if new_content != content:
            if not DRY_RUN:
                # Atomic write via temp file
                tmp_path = target_path.with_suffix(".md.tmp")
                tmp_path.write_text(new_content, encoding="utf-8")
                tmp_path.replace(target_path)
            updated += 1

    print(f"Updated:  {updated}")
    print(f"Errors:   {len(errors)}")

    # Write report
    report = {
        "matched": len(matched),
        "skipped": len(skipped),
        "orphaned": len(orphaned),
        "updated": updated,
        "errors": len(errors),
        "orphan_details": orphaned,
        "error_details": errors,
        "skip_details": skipped,
    }
    report_path = CODEX_ROOT / "_codex" / "scripts" / "reports" / "image-embed-report.json"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    if not DRY_RUN:
        report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
        print(f"\nReport written to {report_path.relative_to(CODEX_ROOT)}")


if __name__ == "__main__":
    main()
