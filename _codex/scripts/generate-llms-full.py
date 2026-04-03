#!/usr/bin/env python3
"""Generate llms-full.txt — complete conceptual framework for LLM context.

Concatenates core lore files into a single plain-text file, stripping
YAML frontmatter and adding section markers.

Per SDD 3.7 — Cycle 003.
"""

import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
OUTPUT_FILE = REPO_ROOT / "llms-full.txt"

SEPARATOR = "═" * 60


def strip_frontmatter(content):
    """Remove YAML frontmatter from content."""
    if content.startswith('---\n'):
        end_idx = content.find('\n---\n', 3)
        if end_idx != -1:
            return content[end_idx + 5:]  # Skip past \n---\n
    return content


def add_section(parts, section_name, source_path, content):
    """Add a section with markers."""
    parts.append(f"\n{SEPARATOR}")
    parts.append(f"SECTION: {section_name}")
    parts.append(f"Source: {source_path}")
    parts.append(f"{SEPARATOR}\n")
    parts.append(strip_frontmatter(content).strip())
    parts.append("")


def main():
    parts = []

    # Header
    parts.append("# Mibera Codex — Full LLM Context")
    parts.append("")
    parts.append("10,000 time-travelling Beras. Mythology, traits, drugs, astrology, 15,000 years of lore.")
    parts.append("This file contains the complete conceptual framework for understanding the Mibera Codex.")
    parts.append("")

    # 1. IDENTITY.md
    print("Adding IDENTITY.md...")
    f = REPO_ROOT / "IDENTITY.md"
    if f.exists():
        add_section(parts, "IDENTITY", "IDENTITY.md", f.read_text(encoding='utf-8'))
    else:
        print(f"  WARNING: {f} not found", file=sys.stderr)

    # 2. core-lore/philosophy.md
    print("Adding philosophy.md...")
    f = REPO_ROOT / "core-lore" / "philosophy.md"
    if f.exists():
        add_section(parts, "PHILOSOPHY", "core-lore/philosophy.md", f.read_text(encoding='utf-8'))
    else:
        print(f"  WARNING: {f} not found", file=sys.stderr)

    # 3. core-lore/archetypes.md
    print("Adding archetypes.md...")
    f = REPO_ROOT / "core-lore" / "archetypes.md"
    if f.exists():
        add_section(parts, "ARCHETYPES", "core-lore/archetypes.md", f.read_text(encoding='utf-8'))
    else:
        print(f"  WARNING: {f} not found", file=sys.stderr)

    # 4. core-lore/drug-tarot-system.md
    print("Adding drug-tarot-system.md...")
    f = REPO_ROOT / "core-lore" / "drug-tarot-system.md"
    if f.exists():
        add_section(parts, "DRUG-TAROT SYSTEM", "core-lore/drug-tarot-system.md", f.read_text(encoding='utf-8'))
    else:
        print(f"  WARNING: {f} not found", file=sys.stderr)

    # 5. glossary.md
    print("Adding glossary.md...")
    f = REPO_ROOT / "glossary.md"
    if f.exists():
        add_section(parts, "GLOSSARY", "glossary.md", f.read_text(encoding='utf-8'))
    else:
        print(f"  WARNING: {f} not found", file=sys.stderr)

    # 6. All ancestors (sorted alphabetically)
    print("Adding ancestor files...")
    ancestor_dir = REPO_ROOT / "core-lore" / "ancestors"
    ancestor_files = sorted([
        f for f in ancestor_dir.glob("*.md")
        if f.name != "README.md"
    ])
    for f in ancestor_files:
        content = f.read_text(encoding='utf-8')
        add_section(parts, f"ANCESTOR: {f.stem.replace('-', ' ').title()}", f"core-lore/ancestors/{f.name}", content)
    print(f"  Added {len(ancestor_files)} ancestor files")

    # 7. All drugs (sorted alphabetically)
    print("Adding drug files...")
    drug_dir = REPO_ROOT / "traits/overlays/molecules"
    drug_files = sorted([
        f for f in drug_dir.glob("*.md")
        if f.name != "README.md"
    ])
    for f in drug_files:
        content = f.read_text(encoding='utf-8')
        add_section(parts, f"DRUG: {f.stem.replace('-', ' ').title()}", f"traits/overlays/molecules/{f.name}", content)
    print(f"  Added {len(drug_files)} drug files")

    # Write output
    output = "\n".join(parts)
    OUTPUT_FILE.write_text(output, encoding='utf-8')

    size_kb = OUTPUT_FILE.stat().st_size / 1024
    size_mb = size_kb / 1024

    print(f"\nOutput: {OUTPUT_FILE}")
    print(f"Size: {size_kb:.0f} KB ({size_mb:.2f} MB)")
    print(f"Sections: 5 core + {len(ancestor_files)} ancestors + {len(drug_files)} drugs = {5 + len(ancestor_files) + len(drug_files)} total")

    if size_kb > 300:
        print(f"  WARNING: File exceeds 300KB target ({size_kb:.0f}KB)")

    print("Done.")


if __name__ == "__main__":
    main()
