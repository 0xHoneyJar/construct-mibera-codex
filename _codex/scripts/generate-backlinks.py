#!/usr/bin/env python3
"""Generate backlink sections on entity files (drugs, ancestors, tarot cards).

Parses Mibera frontmatter to build lookup maps, then inserts
@generated:backlinks sections on each entity file.

Per SDD 3.6 — Cycle 003.
"""

import re
import sys
import yaml
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent

MAX_INLINE_LINKS = 50
MARKER_START = "<!-- @generated:backlinks-start -->"
MARKER_END = "<!-- @generated:backlinks-end -->"


def slugify(name):
    """Convert display name to filename slug."""
    s = name.lower()
    s = s.replace('\u2019', '')  # Right single quote → remove
    s = s.replace("'", '')
    s = s.replace('.', '')
    s = s.replace(' ', '-')
    s = s.replace('/', '-')
    return s


def load_mibera_data():
    """Load drug and ancestor values from all Mibera frontmatter."""
    drug_map = {}    # drug_slug → [mibera_ids]
    ancestor_map = {}  # ancestor_slug → [mibera_ids]

    miberas_dir = REPO_ROOT / "miberas"
    for f in miberas_dir.glob("*.md"):
        if not f.stem.isdigit():
            continue
        content = f.read_text(encoding='utf-8')
        if not content.startswith('---\n'):
            continue
        end_idx = content.index('\n---', 3)
        fm = yaml.safe_load(content[4:end_idx])
        if not fm:
            continue

        mid = fm.get('id', int(f.stem))

        # Drug mapping
        drug_name = fm.get('drug')
        if drug_name:
            slug = slugify(drug_name)
            drug_map.setdefault(slug, []).append(mid)

        # Ancestor mapping
        anc_name = fm.get('ancestor')
        if anc_name:
            slug = slugify(anc_name)
            ancestor_map.setdefault(slug, []).append(mid)

    # Sort all lists
    for v in drug_map.values():
        v.sort()
    for v in ancestor_map.values():
        v.sort()

    return drug_map, ancestor_map


def load_drug_tarot_map():
    """Build tarot_slug → drug_slug mapping from tarot card frontmatter."""
    tarot_to_drug = {}
    tarot_dir = REPO_ROOT / "core-lore" / "tarot-cards"
    for f in tarot_dir.glob("*.md"):
        if f.name == "README.md":
            continue
        content = f.read_text(encoding='utf-8')
        if not content.startswith('---\n'):
            continue
        end_idx = content.index('\n---', 3)
        fm = yaml.safe_load(content[4:end_idx])
        if fm and 'drug' in fm:
            tarot_to_drug[f.stem] = slugify(fm['drug'])
    return tarot_to_drug


def format_backlink_section(entity_type, mibera_ids, link_prefix):
    """Format a backlink section with inline links."""
    lines = [MARKER_START]

    if entity_type == "Drug":
        lines.append(f"## Miberas with this Drug")
    elif entity_type == "Ancestor":
        lines.append(f"## Miberas with this Ancestor")
    elif entity_type == "Tarot Card":
        lines.append(f"## Miberas with this Tarot Card")
    else:
        lines.append(f"## Related Miberas")

    lines.append("")

    # Format inline links
    total = len(mibera_ids)
    shown = mibera_ids[:MAX_INLINE_LINKS]
    link_parts = [f"[#{mid:04d}]({link_prefix}{mid:04d}.md)" for mid in shown]
    link_line = " • ".join(link_parts)

    if total > MAX_INLINE_LINKS:
        link_line += f" • ... and {total - MAX_INLINE_LINKS} more"

    lines.append(link_line)
    lines.append("")
    lines.append(f"*{total} Miberas total*")
    lines.append(MARKER_END)

    return "\n".join(lines)


def insert_backlinks(filepath, backlink_section):
    """Insert or replace backlink section in a file."""
    content = filepath.read_text(encoding='utf-8')

    # Check if markers already exist — replace
    if MARKER_START in content:
        start_idx = content.index(MARKER_START)
        end_idx = content.index(MARKER_END) + len(MARKER_END)
        new_content = content[:start_idx] + backlink_section + content[end_idx:]
    else:
        # Insert before the last --- footer (if it exists) or at end
        # Look for a standalone --- near the end
        lines = content.rstrip().split('\n')

        # Find last standalone --- (not YAML frontmatter)
        insert_pos = len(lines)
        for i in range(len(lines) - 1, max(len(lines) - 5, 0), -1):
            if lines[i].strip() == '---':
                insert_pos = i
                break

        # Insert before the footer
        lines.insert(insert_pos, "")
        lines.insert(insert_pos + 1, backlink_section)
        lines.insert(insert_pos + 2, "")
        new_content = '\n'.join(lines) + '\n'

    filepath.write_text(new_content, encoding='utf-8')


def main():
    print("Loading Mibera data...")
    drug_map, ancestor_map = load_mibera_data()
    tarot_to_drug = load_drug_tarot_map()
    print(f"  Drug groups: {len(drug_map)}, Ancestor groups: {len(ancestor_map)}, Tarot cards: {len(tarot_to_drug)}")

    stats = {"drugs": 0, "ancestors": 0, "tarot": 0, "skipped": 0}

    # Process drug files
    print("\nProcessing drug files...")
    drug_dir = REPO_ROOT / "traits/overlays/molecules"
    for f in sorted(drug_dir.glob("*.md")):
        if f.name == "README.md":
            continue
        slug = f.stem
        mibera_ids = drug_map.get(slug, [])
        if not mibera_ids:
            stats["skipped"] += 1
            continue
        section = format_backlink_section("Drug", mibera_ids, "../miberas/")
        insert_backlinks(f, section)
        stats["drugs"] += 1

    # Process ancestor files
    print("Processing ancestor files...")
    ancestor_dir = REPO_ROOT / "core-lore" / "ancestors"
    for f in sorted(ancestor_dir.glob("*.md")):
        if f.name == "README.md":
            continue
        slug = f.stem
        mibera_ids = ancestor_map.get(slug, [])
        if not mibera_ids:
            stats["skipped"] += 1
            continue
        section = format_backlink_section("Ancestor", mibera_ids, "../../miberas/")
        insert_backlinks(f, section)
        stats["ancestors"] += 1

    # Process tarot card files
    print("Processing tarot card files...")
    tarot_dir = REPO_ROOT / "core-lore" / "tarot-cards"
    for f in sorted(tarot_dir.glob("*.md")):
        if f.name == "README.md":
            continue
        slug = f.stem
        drug_slug = tarot_to_drug.get(slug)
        if not drug_slug:
            stats["skipped"] += 1
            continue
        mibera_ids = drug_map.get(drug_slug, [])
        if not mibera_ids:
            stats["skipped"] += 1
            continue
        section = format_backlink_section("Tarot Card", mibera_ids, "../../miberas/")
        insert_backlinks(f, section)
        stats["tarot"] += 1

    print(f"\nResults:")
    print(f"  Drug files with backlinks: {stats['drugs']}")
    print(f"  Ancestor files with backlinks: {stats['ancestors']}")
    print(f"  Tarot card files with backlinks: {stats['tarot']}")
    print(f"  Skipped (no matching Miberas): {stats['skipped']}")
    print(f"  Total entity files updated: {stats['drugs'] + stats['ancestors'] + stats['tarot']}")


if __name__ == "__main__":
    main()
