#!/usr/bin/env python3
"""Generate entity relationship graph as JSON adjacency list.

Reads frontmatter from Miberas, tarot cards, and drugs. Builds nodes
for all entity types and typed edges for all relationships.

Output: _codex/data/graph.json
"""

import glob
import json
import os
import yaml
from collections import defaultdict
from datetime import datetime, timezone

MIBERA_DIR = "miberas"
DRUG_DIR = "traits/overlays/molecules"
TAROT_DIR = "core-lore/tarot-cards"
OUTPUT_FILE = "_codex/data/graph.json"
TIMESTAMP = datetime.now(timezone.utc).strftime("%Y-%m-%d")


def slugify(name):
    """Convert display name to slug for node IDs."""
    if not name:
        return ""
    s = name.lower()
    s = s.replace("\u2019", "")
    s = s.replace("'", "")
    s = s.replace(".", "")
    s = s.replace(" ", "-")
    s = s.replace("/", "-")
    return s


def load_frontmatter(directory, skip_index=True):
    """Load YAML frontmatter from all .md files in a directory."""
    items = []
    for filepath in sorted(glob.glob(os.path.join(directory, "*.md"))):
        basename = os.path.basename(filepath)
        if skip_index and basename == "README.md":
            continue
        try:
            with open(filepath, "r") as f:
                content = f.read()
            if not content.startswith("---"):
                continue
            end = content.index("---", 3)
            fm = yaml.safe_load(content[3:end])
            if fm and isinstance(fm, dict):
                fm["_file"] = basename
                items.append(fm)
        except Exception as e:
            print(f"  WARNING: Error reading {filepath}: {e}")
    return items


def main():
    print("Loading data sources...")
    miberas = load_frontmatter(MIBERA_DIR)
    drugs = load_frontmatter(DRUG_DIR)
    tarots = load_frontmatter(TAROT_DIR)
    print(f"  Miberas: {len(miberas)}, Drugs: {len(drugs)}, Tarot: {len(tarots)}")

    # Build node and edge sets
    nodes = {}  # id -> {id, type, label}
    edges = []  # [{source, target, type}]
    edge_set = set()  # for dedup

    def add_node(nid, ntype, label):
        if nid not in nodes:
            nodes[nid] = {"id": nid, "type": ntype, "label": label}

    def add_edge(source, target, etype):
        key = (source, target, etype)
        if key not in edge_set:
            edge_set.add(key)
            edges.append({"source": source, "target": target, "type": etype})

    # Collect dimension values from Miberas
    archetypes = set()
    ancestors = set()
    drug_names = set()
    elements = set()
    eras = set()
    sun_signs = set()
    swag_ranks = set()

    print("Processing Miberas...")
    for m in miberas:
        mid = m.get("id")
        if mid is None:
            continue
        mid = int(mid)
        node_id = f"mibera:{mid}"
        add_node(node_id, "mibera", f"Mibera #{mid}")

        # Archetype
        arch = m.get("archetype", "")
        if arch:
            archetypes.add(arch)
            arch_id = f"archetype:{slugify(arch)}"
            add_node(arch_id, "archetype", arch)
            add_edge(node_id, arch_id, "has_archetype")

        # Ancestor
        anc = m.get("ancestor", "")
        if anc:
            ancestors.add(anc)
            anc_id = f"ancestor:{slugify(anc)}"
            add_node(anc_id, "ancestor", anc)
            add_edge(node_id, anc_id, "has_ancestor")

        # Drug
        drug = m.get("drug", "")
        if drug:
            drug_names.add(drug)
            drug_id = f"drug:{slugify(drug)}"
            add_node(drug_id, "drug", drug)
            add_edge(node_id, drug_id, "has_drug")

        # Element
        elem = m.get("element", "")
        if elem:
            elements.add(elem)
            elem_id = f"element:{slugify(elem)}"
            add_node(elem_id, "element", elem)
            add_edge(node_id, elem_id, "has_element")

        # Era
        era = m.get("time_period", "")
        if era:
            eras.add(era)
            era_id = f"era:{slugify(era)}"
            add_node(era_id, "era", era)
            add_edge(node_id, era_id, "born_in_era")

        # Sun sign
        sun = m.get("sun_sign", "")
        if sun:
            sun_signs.add(sun)
            sun_id = f"zodiac:{slugify(sun)}"
            add_node(sun_id, "zodiac", sun)
            add_edge(node_id, sun_id, "has_sun_sign")

        # Swag rank
        rank = m.get("swag_rank", "")
        if rank:
            swag_ranks.add(rank)
            rank_id = f"swag_rank:{slugify(rank)}"
            add_node(rank_id, "swag_rank", rank)
            add_edge(node_id, rank_id, "has_swag_rank")

    # Process tarot cards (drug → tarot, tarot → element)
    print("Processing tarot cards...")
    drug_slug_map = {}  # drug slug -> drug display name
    for d in drugs:
        name = d.get("name", "")
        if name:
            drug_slug_map[slugify(name)] = name

    for t in tarots:
        name = t.get("name", "")
        if not name:
            continue
        tarot_id = f"tarot:{slugify(name)}"
        add_node(tarot_id, "tarot_card", name)

        # Drug → Tarot
        drug_name = t.get("drug", "")
        if drug_name:
            drug_id = f"drug:{slugify(drug_name)}"
            add_node(drug_id, "drug", drug_name)
            add_edge(drug_id, tarot_id, "maps_to_tarot")

        # Tarot → Element
        elem = t.get("element", "")
        if elem:
            elem_id = f"element:{slugify(elem)}"
            add_node(elem_id, "element", elem)
            add_edge(tarot_id, elem_id, "has_suit_element")

    # Process drugs (drug → archetype, drug → ancestor)
    print("Processing drugs...")
    for d in drugs:
        name = d.get("name", "")
        if not name:
            continue
        drug_id = f"drug:{slugify(name)}"
        add_node(drug_id, "drug", name)

        arch = d.get("archetype", "")
        if arch:
            arch_id = f"archetype:{slugify(arch)}"
            add_node(arch_id, "archetype", arch)
            add_edge(drug_id, arch_id, "drug_archetype")

        anc = d.get("ancestor", "")
        if anc:
            anc_id = f"ancestor:{slugify(anc)}"
            add_node(anc_id, "ancestor", anc)
            add_edge(drug_id, anc_id, "drug_ancestor")

    # Build output
    node_list = sorted(nodes.values(), key=lambda n: (n["type"], n["id"]))
    edge_list = sorted(edges, key=lambda e: (e["type"], e["source"], e["target"]))

    # Count by type
    node_type_counts = defaultdict(int)
    for n in node_list:
        node_type_counts[n["type"]] += 1

    edge_type_counts = defaultdict(int)
    for e in edge_list:
        edge_type_counts[e["type"]] += 1

    output = {
        "metadata": {
            "generated": TIMESTAMP,
            "generator": "_codex/scripts/generate-graph.py",
            "node_count": len(node_list),
            "edge_count": len(edge_list),
            "node_types": dict(sorted(node_type_counts.items())),
            "edge_types": dict(sorted(edge_type_counts.items())),
        },
        "nodes": node_list,
        "edges": edge_list,
    }

    # Write output
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(output, f, separators=(",", ":"))

    file_size = os.path.getsize(OUTPUT_FILE)
    print(f"\nOutput: {OUTPUT_FILE}")
    print(f"  Size: {file_size / 1024 / 1024:.1f} MB")
    print(f"  Nodes: {len(node_list)}")
    print(f"  Edges: {len(edge_list)}")
    print(f"\n  Node types:")
    for ntype, count in sorted(node_type_counts.items()):
        print(f"    {ntype}: {count}")
    print(f"\n  Edge types:")
    for etype, count in sorted(edge_type_counts.items()):
        print(f"    {etype}: {count}")

    # Validation
    print(f"\nValidation:")
    node_ids = set(n["id"] for n in node_list)

    # Check orphan nodes
    edge_nodes = set()
    for e in edge_list:
        edge_nodes.add(e["source"])
        edge_nodes.add(e["target"])
    orphans = node_ids - edge_nodes
    if orphans:
        print(f"  ✗ {len(orphans)} orphan nodes: {list(orphans)[:5]}")
    else:
        print(f"  ✓ No orphan nodes")

    # Check edge references
    bad_refs = []
    for e in edge_list:
        if e["source"] not in node_ids:
            bad_refs.append(e["source"])
        if e["target"] not in node_ids:
            bad_refs.append(e["target"])
    if bad_refs:
        print(f"  ✗ {len(bad_refs)} bad edge references")
    else:
        print(f"  ✓ All edge references valid")

    # Check expected counts
    mibera_count = node_type_counts.get("mibera", 0)
    print(f"  {'✓' if mibera_count == 10000 else '✗'} Mibera nodes: {mibera_count}")

    # Check for duplicate edges
    if len(edge_set) == len(edges):
        print(f"  ✓ No duplicate edges")
    else:
        print(f"  ✗ {len(edges) - len(edge_set)} duplicate edges")


if __name__ == "__main__":
    main()
