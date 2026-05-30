#!/usr/bin/env python3
"""Semantic validation: cross-reference consistency checks.

Validates logical relationships between entity types that
structural validation misses.

Per SDD 3.5 — Cycle 003.
"""

import json
import re
import sys
import yaml
from pathlib import Path
from datetime import datetime

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
REPORTS_DIR = REPO_ROOT / "_codex" / "scripts" / "reports"

# Expected enum values
VALID_ARCHETYPES = {"Freetekno", "Milady", "Acidhouse", "Chicago/Detroit"}
VALID_ELEMENTS = {"Earth", "Fire", "Water", "Air"}
VALID_SWAG_RANKS = {"S", "A", "B", "C", "D"}


def load_mibera_frontmatter():
    """Load all 10,000 Mibera frontmatter into memory."""
    miberas = {}
    miberas_dir = REPO_ROOT / "miberas"
    for f in miberas_dir.glob("*.md"):
        if not f.stem.isdigit():
            continue
        content = f.read_text(encoding='utf-8')
        if not content.startswith('---\n'):
            continue
        end_idx = content.index('\n---', 3)
        fm = yaml.safe_load(content[4:end_idx])
        if fm:
            miberas[fm.get('id', int(f.stem))] = fm
    return miberas


def load_drug_frontmatter():
    """Load all drug file frontmatter."""
    drugs = {}
    drug_dir = REPO_ROOT / "traits/overlays/molecules"
    for f in drug_dir.glob("*.md"):
        if f.name == "README.md":
            continue
        content = f.read_text(encoding='utf-8')
        if not content.startswith('---\n'):
            continue
        end_idx = content.index('\n---', 3)
        fm = yaml.safe_load(content[4:end_idx])
        if fm:
            drugs[f.stem] = fm
    return drugs


def load_ancestor_frontmatter():
    """Load all ancestor file frontmatter."""
    ancestors = {}
    ancestor_dir = REPO_ROOT / "core-lore" / "ancestors"
    for f in ancestor_dir.glob("*.md"):
        if f.name == "README.md":
            continue
        content = f.read_text(encoding='utf-8')
        if not content.startswith('---\n'):
            continue
        end_idx = content.index('\n---', 3)
        fm = yaml.safe_load(content[4:end_idx])
        if fm:
            ancestors[f.stem] = fm
    return ancestors


def load_tarot_frontmatter():
    """Load all tarot card file frontmatter."""
    tarot = {}
    tarot_dir = REPO_ROOT / "core-lore" / "tarot-cards"
    for f in tarot_dir.glob("*.md"):
        if f.name == "README.md":
            continue
        content = f.read_text(encoding='utf-8')
        if not content.startswith('---\n'):
            continue
        end_idx = content.index('\n---', 3)
        fm = yaml.safe_load(content[4:end_idx])
        if fm:
            tarot[f.stem] = fm
    return tarot


def load_grail_ids():
    """Load the 44 grail token IDs from the canonical grails.jsonl.

    Grail token IDs are hand-drawn 1/1s placed on random Miberas post-reveal;
    they carry no generative traits, so they have no archetype/element/drug/
    ancestor values and must be exempted from the enum/reference checks. The
    set is sourced from grails.jsonl (not hardcoded) so it stays in sync, and
    we fail loud if the source is missing — silently skipping the exemption
    would re-mask genuine semantic errors.
    """
    grails_path = REPO_ROOT / "_codex" / "data" / "grails.jsonl"
    if not grails_path.is_file():
        print(f"ERROR: grail exemption source not found: {grails_path}", file=sys.stderr)
        print("Cannot distinguish grail 1/1s from genuine semantic errors. Aborting.", file=sys.stderr)
        sys.exit(2)
    grail_ids = set()
    with open(grails_path, encoding='utf-8') as fh:
        for line in fh:
            line = line.strip()
            if line:
                grail_ids.add(json.loads(line)['id'])
    if not grail_ids:
        print(f"ERROR: grail exemption source {grails_path} yielded 0 IDs. Aborting.", file=sys.stderr)
        sys.exit(2)
    return grail_ids


def slugify(name):
    """Convert display name to filename slug."""
    s = name.lower()
    s = s.replace('\u2019', "'")  # Right single quote → ASCII
    s = s.replace("'", "")
    s = s.replace(".", "")
    s = s.replace(" ", "-")
    s = s.replace("/", "-")
    return s


def check_archetype_enum(miberas, grail_ids):
    """Check all archetype values are valid (grail 1/1s exempted)."""
    violations = []
    checked = 0
    for mid, fm in miberas.items():
        if mid in grail_ids:
            continue
        checked += 1
        arch = fm.get('archetype')
        if arch not in VALID_ARCHETYPES:
            violations.append(f"Mibera #{mid}: archetype '{arch}' not in valid set")
    return {
        "status": "pass" if not violations else "fail",
        "violations": violations,
        "checked": checked,
    }


def check_element_enum(miberas, grail_ids):
    """Check all element values are valid (grail 1/1s exempted)."""
    violations = []
    checked = 0
    for mid, fm in miberas.items():
        if mid in grail_ids:
            continue
        checked += 1
        elem = fm.get('element')
        if elem not in VALID_ELEMENTS:
            violations.append(f"Mibera #{mid}: element '{elem}' not in valid set")
    return {
        "status": "pass" if not violations else "fail",
        "violations": violations,
        "checked": checked,
    }


def check_element_totals(miberas):
    """Check element counts sum to 10,000."""
    counts = {}
    for fm in miberas.values():
        elem = fm.get('element', 'UNKNOWN')
        counts[elem] = counts.get(elem, 0) + 1
    total = sum(counts.values())
    return {
        "status": "pass" if total == 10000 else "fail",
        "total": total,
        "breakdown": dict(sorted(counts.items())),
        "violations": [] if total == 10000 else [f"Element totals sum to {total}, expected 10000"],
    }


def check_drug_references(miberas, drugs, grail_ids):
    """Check every Mibera drug value has a matching drug file (grail 1/1s exempted)."""
    violations = []
    drug_slugs = set(drugs.keys())
    checked = 0

    for mid, fm in miberas.items():
        if mid in grail_ids:
            continue
        checked += 1
        drug_name = fm.get('drug')
        if not drug_name:
            violations.append(f"Mibera #{mid}: no drug value")
            continue
        slug = slugify(drug_name)
        if slug not in drug_slugs:
            violations.append(f"Mibera #{mid}: drug '{drug_name}' (slug: {slug}) has no matching file")

    return {
        "status": "pass" if not violations else "fail",
        "violations": violations,
        "checked": checked,
    }


def check_ancestor_references(miberas, ancestors, grail_ids):
    """Check every Mibera ancestor value has a matching ancestor file (grail 1/1s exempted)."""
    violations = []
    ancestor_slugs = set(ancestors.keys())
    checked = 0

    for mid, fm in miberas.items():
        if mid in grail_ids:
            continue
        checked += 1
        anc_name = fm.get('ancestor')
        if not anc_name:
            violations.append(f"Mibera #{mid}: no ancestor value")
            continue
        slug = slugify(anc_name)
        if slug not in ancestor_slugs:
            violations.append(f"Mibera #{mid}: ancestor '{anc_name}' (slug: {slug}) has no matching file")

    return {
        "status": "pass" if not violations else "fail",
        "violations": violations,
        "checked": checked,
    }


def check_drug_tarot_bidirectional(drugs, tarot):
    """Check drug↔tarot card bidirectional references."""
    violations = []

    # Build drug→tarot from tarot cards
    tarot_drug_map = {}
    for card_slug, fm in tarot.items():
        drug_name = fm.get('drug')
        if drug_name:
            tarot_drug_map[slugify(drug_name)] = {
                'card': fm.get('name', card_slug),
                'card_slug': card_slug,
            }

    # Check each drug has a tarot card referencing it
    for drug_slug, fm in drugs.items():
        if drug_slug not in tarot_drug_map:
            violations.append(f"Drug '{fm.get('name', drug_slug)}' not referenced by any tarot card")

    return {
        "status": "pass" if not violations else "fail",
        "violations": violations,
        "drugs_checked": len(drugs),
        "tarot_checked": len(tarot),
    }


def check_orphan_traits(miberas):
    """Find trait files referenced by 0 Miberas."""
    # Collect all trait links from Mibera tables
    referenced_traits = set()
    trait_fields = ['background', 'body', 'hair', 'eyes', 'eyebrows', 'mouth',
                    'shirt', 'hat', 'glasses', 'mask', 'earrings',
                    'face_accessory', 'tattoo', 'item']

    miberas_dir = REPO_ROOT / "miberas"
    for f in miberas_dir.glob("*.md"):
        if not f.stem.isdigit():
            continue
        content = f.read_text(encoding='utf-8')
        # Find all trait links in the table
        for match in re.finditer(r'\]\(\.\./traits/([^)]+)\)', content):
            referenced_traits.add(match.group(1))

    # Get all actual trait files
    all_traits = set()
    traits_dir = REPO_ROOT / "traits"
    for f in traits_dir.rglob("*.md"):
        if f.name == "README.md" or f.name == "overview.md":
            continue
        rel = f.relative_to(traits_dir)
        all_traits.add(str(rel))

    # Find orphans
    orphans = all_traits - referenced_traits
    # Filter out overlays (astrology, elements, ranking) — those are referenced differently
    orphans = [t for t in sorted(orphans) if not t.startswith('overlays/')]

    return {
        "status": "info",
        "orphan_count": len(orphans),
        "orphans": orphans[:50],
        "total_traits": len(all_traits),
        "referenced_traits": len(referenced_traits),
    }


def check_swag_rank_distribution(miberas):
    """Check swag rank distribution is reasonable."""
    counts = {}
    for fm in miberas.values():
        rank = fm.get('swag_rank', 'UNKNOWN')
        counts[rank] = counts.get(rank, 0) + 1

    violations = []
    for rank in VALID_SWAG_RANKS:
        if rank not in counts:
            violations.append(f"Swag rank '{rank}' has 0 Miberas")

    return {
        "status": "pass" if not violations else "warn",
        "distribution": dict(sorted(counts.items())),
        "violations": violations,
    }


def main():
    print("Loading data...")
    miberas = load_mibera_frontmatter()
    drugs = load_drug_frontmatter()
    ancestors = load_ancestor_frontmatter()
    tarot = load_tarot_frontmatter()
    grail_ids = load_grail_ids()
    print(f"  Miberas: {len(miberas)}, Drugs: {len(drugs)}, Ancestors: {len(ancestors)}, Tarot: {len(tarot)}, Grails exempted: {len(grail_ids)}")

    print("\nRunning checks...")
    results = {}

    checks = [
        ("archetype_enum", lambda: check_archetype_enum(miberas, grail_ids)),
        ("element_enum", lambda: check_element_enum(miberas, grail_ids)),
        ("element_totals", lambda: check_element_totals(miberas)),
        ("drug_references", lambda: check_drug_references(miberas, drugs, grail_ids)),
        ("ancestor_references", lambda: check_ancestor_references(miberas, ancestors, grail_ids)),
        ("drug_tarot_bidirectional", lambda: check_drug_tarot_bidirectional(drugs, tarot)),
        ("orphan_traits", lambda: check_orphan_traits(miberas)),
        ("swag_rank_distribution", lambda: check_swag_rank_distribution(miberas)),
    ]

    pass_count = 0
    fail_count = 0
    for name, check_fn in checks:
        result = check_fn()
        results[name] = result
        status = result["status"]
        violations = result.get("violations", [])
        if status == "pass":
            print(f"  ✓ {name}: PASS")
            pass_count += 1
        elif status == "fail":
            print(f"  ✗ {name}: FAIL ({len(violations)} violations)")
            for v in violations[:5]:
                print(f"    - {v}")
            if len(violations) > 5:
                print(f"    ... and {len(violations) - 5} more")
            fail_count += 1
        elif status == "info":
            print(f"  ℹ {name}: {result.get('orphan_count', 0)} orphans found")
            pass_count += 1
        elif status == "warn":
            print(f"  ⚠ {name}: WARNING")
            pass_count += 1

    # Write report
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    report = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "checks": results,
        "summary": {
            "pass": pass_count,
            "fail": fail_count,
            "total": len(checks),
        },
    }
    report_path = REPORTS_DIR / "audit-semantic.json"
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)

    print(f"\nReport: {report_path}")
    print(f"Summary: {pass_count} pass, {fail_count} fail, {len(checks)} total")

    if fail_count > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
