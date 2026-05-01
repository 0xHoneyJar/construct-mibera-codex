#!/usr/bin/env python3
"""Fix grail/1of1 image URLs — rewrite from wrong reveal_phase8 path to correct Mibera/grails path.

Cycle 023 Sprint 2 — Grail Image Fix
Issue: https://github.com/0xHoneyJar/construct-mibera-codex/issues/54

Grail images are at s3://thj-assets/Mibera/grails/ with clean lowercase
hyphenated filenames (all .png). PR #55 incorrectly placed them at
reveal_phase8/images/ which only holds hash-keyed generative renders.

Usage:
    python3 _codex/scripts/fix-grail-urls.py --dry-run
    python3 _codex/scripts/fix-grail-urls.py
"""

import argparse
import os
from pathlib import Path

CODEX_ROOT = Path(__file__).resolve().parent.parent.parent

CDN_HOST = "assets.0xhoneyjar.xyz"
WRONG_BASE = f"https://{CDN_HOST}/reveal_phase8/images/"
RIGHT_BASE = f"https://{CDN_HOST}/Mibera/grails/"

# Exact mapping: wrong URL suffix → correct URL suffix
# Only the 42 canonical grail slugs
GRAIL_REWRITES = {
    "air.PNG": "air.png",
    "aquarius.png": "aquarius.png",
    "aries.PNG": "aries.png",
    "black hole.PNG": "black-hole.png",
    "buddhist.PNG": "buddhist.png",
    "cancer.PNG": "cancer.png",
    "capricorn.png": "capricorn.png",
    "chinese.PNG": "chinese.png",
    "earth.PNG": "earth.png",
    "ethiopian.PNG": "ethiopian.png",
    "fire.PNG": "fire.png",
    "future.PNG": "future.png",
    "gaia.png": "gaia.png",
    "gemini.PNG": "gemini.png",
    "greek.PNG": "greek.png",
    "hindu.PNG": "hindu.png",
    "japanese.PNG": "japanese.png",
    "jupiter.png": "jupiter.png",
    "leo.PNG": "leo.png",
    "libra.png": "libra.png",
    "mars.png": "mars.png",
    "mayan.PNG": "mayan.png",
    "mercury.png": "mercury.png",
    "mongolian.PNG": "mongolian.png",
    "moon.PNG": "moon.png",
    "native american.png": "native-american.png",
    "neptune.png": "neptune.png",
    "past.PNG": "past.png",
    "pisces.png": "pisces.png",
    "pluto.png": "pluto.png",
    "rastafarian.png": "rastafarian.png",
    "sagittarius.PNG": "sagittarius.png",
    "satanist.PNG": "satanist.png",
    "satoshi.png": "satoshi.png",
    "saturn.png": "saturn.png",
    "scorpio.png": "scorpio.png",
    "sun.PNG": "sun.png",
    "taurus.PNG": "taurus.png",
    "uranus.png": "uranus.png",
    "venus.png": "venus.png",
    "virgo.png": "virgo.png",
    "water.PNG": "water.png",
}


def fix_file(fpath, dry_run=False):
    """Fix grail URLs in a single file. Returns count of replacements."""
    try:
        content = fpath.read_text(encoding="utf-8")
    except (UnicodeDecodeError, PermissionError):
        return 0

    if WRONG_BASE not in content:
        return 0

    count = 0
    new_content = content
    for old_suffix, new_suffix in GRAIL_REWRITES.items():
        old_url = WRONG_BASE + old_suffix
        new_url = RIGHT_BASE + new_suffix
        if old_url in new_content:
            occurrences = new_content.count(old_url)
            new_content = new_content.replace(old_url, new_url)
            count += occurrences

    if count > 0 and not dry_run:
        fpath.write_text(new_content, encoding="utf-8")

    return count


def main():
    parser = argparse.ArgumentParser(description="Fix grail image URLs")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    total = 0
    files_modified = 0

    for dirpath, dirnames, filenames in os.walk(CODEX_ROOT):
        dirnames[:] = [d for d in dirnames if d not in {".git", ".claude", "node_modules"}]
        for fname in filenames:
            if not fname.endswith(".md"):
                continue
            fpath = Path(dirpath) / fname
            count = fix_file(fpath, args.dry_run)
            if count:
                files_modified += 1
                total += count
                if args.dry_run:
                    print(f"  {fpath.relative_to(CODEX_ROOT)}: {count} refs")

    action = "Would fix" if args.dry_run else "Fixed"
    print(f"\n  {action}: {total} grail URLs across {files_modified} files")
    if args.dry_run:
        print("  (dry run — no files modified)")


if __name__ == "__main__":
    main()
