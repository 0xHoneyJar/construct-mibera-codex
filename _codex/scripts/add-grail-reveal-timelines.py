#!/usr/bin/env python3
"""Add reveal timelines to grail mibera files using original generative render hashes.

Grail miberas had their images replaced post-reveal. The original generative
renders still exist on S3 with hash-keyed filenames. This script adds the
reveal timeline (phases 1-8 of the ORIGINAL mibera) plus a note explaining
that the grail replaced it.

Hashes recovered from the fracture_images Postgres table.

Usage:
    python3 _codex/scripts/add-grail-reveal-timelines.py --dry-run
    python3 _codex/scripts/add-grail-reveal-timelines.py
"""

import argparse
import json
import re
from pathlib import Path

CODEX_ROOT = Path(__file__).resolve().parent.parent.parent
MIBERAS_DIR = CODEX_ROOT / "miberas"
GRAILS_DIR = CODEX_ROOT / "grails"

CDN = "assets.0xhoneyjar.xyz"

PHASE_PREFIXES = {
    1: "reveal_phase1_images",
    2: "reveal_phase2/reveal_phase2_images",
    3: "reveal_phase3/reveal_phase3_images",
    4: "reveal_phase4/images",
    5: "reveal_phase5/images",
    6: "reveal_phase6/images",
    7: "reveal_phase7/images",
    8: "reveal_phase8/images",
}

# Original generative render hashes, recovered from fracture_images DB
GRAIL_HASHES = {
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

MIJEDI_ID = 4701


def load_grail_info(mibera_id):
    """Load grail name and slug from the grail file."""
    for fpath in GRAILS_DIR.glob("*.md"):
        if fpath.name == "README.md":
            continue
        content = fpath.read_text(encoding="utf-8")
        if not content.startswith("---"):
            continue
        end = content.index("---", 3)
        fm = content[3:end]
        id_match = re.search(r'^id:\s*(\d+)', fm, re.MULTILINE)
        name_match = re.search(r'^name:\s*"?([^"\n]+)', fm, re.MULTILINE)
        if id_match and int(id_match.group(1)) == mibera_id:
            return {
                "name": name_match.group(1).strip() if name_match else "",
                "slug": fpath.stem,
            }
    return None


def build_reveal_timeline(mibera_id, image_hash):
    """Build the reveal timeline markdown table."""
    lines = []
    lines.append("## Reveal Timeline")
    lines.append("")
    lines.append("*The original generative Mibera that this grail was placed on post-reveal.*")
    lines.append("")

    # Header
    headers = ["MiParcels", "Miladies", "#1.1", "#2.2", "#3.3", "#4.20", "#5.5", "#6.9", "#7.7"]
    lines.append("| " + " | ".join(headers) + " |")
    lines.append("|" + "|".join([":-:"] * len(headers)) + "|")

    # Image cells
    cells = []
    # MiParcels
    cells.append(f"![MiParcels](https://{CDN}/parcels/parcelsImages/{mibera_id}.png)")
    # Miladies
    cells.append(f"![Miladies](https://{CDN}/fractures/miladies/images/{mibera_id}.png)")
    # Phases 1-7
    for phase in range(1, 8):
        prefix = PHASE_PREFIXES[phase]
        label = headers[phase + 1]
        cells.append(f"![{label}](https://{CDN}/{prefix}/{image_hash})")

    lines.append("| " + " | ".join(cells) + " |")
    lines.append("")

    # Original phase 8 render
    phase8_url = f"https://{CDN}/{PHASE_PREFIXES[8]}/{image_hash}"
    lines.append("### Original Mibera (Phase 8)")
    lines.append("")
    lines.append(f"![Original Mibera #{mibera_id}]({phase8_url})")
    lines.append("")

    return "\n".join(lines)


def patch_grail_mibera(fpath, mibera_id, dry_run=False):
    """Add reveal timeline to a grail mibera file."""
    content = fpath.read_text(encoding="utf-8")

    if "## Reveal Timeline" in content:
        return False

    image_hash = GRAIL_HASHES.get(mibera_id)
    if not image_hash:
        return False

    grail_info = load_grail_info(mibera_id)
    if not grail_info:
        return False

    is_mijedi = mibera_id == MIJEDI_ID

    # Build the reveal timeline
    timeline = build_reveal_timeline(mibera_id, image_hash)

    # Insert after the grail image (before the description or Cultural Context)
    # Find the first ## heading after the grail image
    lines = content.split("\n")
    insert_idx = None
    for i, line in enumerate(lines):
        if line.startswith("*") and i > 5 and not line.startswith("**"):
            # This is the italic description line — insert before it
            insert_idx = i
            break
        if line.startswith("## Cultural Context") or line.startswith("## Visual"):
            insert_idx = i
            break

    if insert_idx is None:
        # Fallback: insert before the --- separator near the end
        for i in range(len(lines) - 1, -1, -1):
            if lines[i].strip() == "---":
                insert_idx = i
                break

    if insert_idx is None:
        return False

    # Build context note
    if is_mijedi:
        note = "> Miggs chose this Mibera to overwrite with the Mijedi grail."
    else:
        note = "> This grail was placed on a random Mibera post-reveal."

    # Insert timeline + note
    insert_block = [note, "", timeline, ""]
    new_lines = lines[:insert_idx] + insert_block + lines[insert_idx:]

    if not dry_run:
        fpath.write_text("\n".join(new_lines), encoding="utf-8")

    return True


def main():
    parser = argparse.ArgumentParser(description="Add reveal timelines to grail miberas")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    patched = 0
    skipped = 0

    for mibera_id in sorted(GRAIL_HASHES.keys()):
        fpath = MIBERAS_DIR / f"{mibera_id:04d}.md"
        if not fpath.exists():
            print(f"  MISSING: {fpath.name}")
            continue

        if patch_grail_mibera(fpath, mibera_id, args.dry_run):
            patched += 1
            if args.dry_run:
                grail = load_grail_info(mibera_id)
                name = grail["name"] if grail else "?"
                print(f"  Would patch: {fpath.name} ({name})")
        else:
            skipped += 1

    action = "Would patch" if args.dry_run else "Patched"
    print(f"\n  {action}: {patched} grail mibera files")
    print(f"  Skipped: {skipped}")


if __name__ == "__main__":
    main()
