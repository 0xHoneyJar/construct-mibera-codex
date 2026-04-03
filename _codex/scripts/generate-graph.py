#!/usr/bin/env python3
"""Generate entity relationship graph as JSON adjacency list.

Reads frontmatter from Miberas, tarot cards, drugs, and all visual trait
files. Builds nodes for all entity types and typed edges for all
relationships. Embeds cultural context from source markdown files.

Output: _codex/data/graph.json
"""

import glob
import json
import os
import re
import yaml
from collections import defaultdict
from datetime import datetime, timezone

MIBERA_DIR = "miberas"
DRUG_DIR = "traits/overlays/molecules"
TAROT_DIR = "core-lore/tarot-cards"
ANCESTOR_DIR = "core-lore/ancestors"
ARCHETYPE_FILE = "core-lore/archetypes.md"
OUTPUT_FILE = "_codex/data/graph.json"
TIMESTAMP = datetime.now(timezone.utc).strftime("%Y-%m-%d")

# Visual trait directories: mibera_field -> (node_type, [directories])
TRAIT_DIRS = {
    "shirt":          ("shirt",          ["traits/clothing/short-sleeves", "traits/clothing/long-sleeves", "traits/clothing/simple-shirts"]),
    "hat":            ("hat",            ["traits/accessories/hats"]),
    "item":           ("item",           ["traits/items/general-items", "traits/items/bong-bears"]),
    "glasses":        ("glasses",        ["traits/accessories/glasses"]),
    "earrings":       ("earrings",       ["traits/accessories/earrings"]),
    "mask":           ("mask",           ["traits/accessories/masks"]),
    "face_accessory": ("face_accessory", ["traits/accessories/face-accessories"]),
    "tattoo":         ("tattoo",         ["traits/character-traits/tattoos"]),
    "background":     ("background",     ["traits/backgrounds"]),
    "body":           ("body",           ["traits/character-traits/body"]),
    "hair":           ("hair",           ["traits/character-traits/hair"]),
    "eyes":           ("eyes",           ["traits/character-traits/eyes"]),
    "eyebrows":       ("eyebrows",       ["traits/character-traits/eyebrows"]),
    "mouth":          ("mouth",          ["traits/character-traits/mouth"]),
}

# Edge weights per signal hierarchy tier
EDGE_WEIGHTS = {
    # Load-bearing (3)
    "has_archetype": 3, "has_ancestor": 3, "born_in_era": 3,
    # Textural (2)
    "has_drug": 2, "maps_to_tarot": 2, "has_element": 2,
    "has_suit_element": 2, "drug_archetype": 2, "drug_ancestor": 2,
    # Modifier (1.5)
    "has_swag_rank": 1.5, "has_sun_sign": 1.5,
    "has_moon_sign": 1.5, "has_ascending_sign": 1.5,
    # Visual (1)
    "has_shirt": 1, "has_hat": 1, "has_item": 1, "has_glasses": 1,
    "has_earrings": 1, "has_mask": 1, "has_face_accessory": 1,
    "has_tattoo": 1, "has_background": 1, "has_body": 1,
    "has_hair": 1, "has_eyes": 1, "has_eyebrows": 1, "has_mouth": 1,
}

# Manual slug overrides for mibera frontmatter values that don't match filenames
SLUG_OVERRIDES = {
    "sakae-naa": "sakae-na-plant",
    "keith-harding-shirt": "keith-haring-shirt",
    "mother": "mother-shirt",
    "geez-love": "ge-ez-love",
}

SIGNAL_WEIGHTS = {
    "load_bearing": ["has_archetype", "has_ancestor", "born_in_era"],
    "textural": ["has_drug", "maps_to_tarot", "has_element", "has_suit_element", "drug_archetype", "drug_ancestor"],
    "modifier": ["has_swag_rank", "has_sun_sign", "has_moon_sign", "has_ascending_sign"],
    "visual": ["has_shirt", "has_hat", "has_item", "has_glasses", "has_earrings",
               "has_mask", "has_face_accessory", "has_tattoo", "has_background",
               "has_body", "has_hair", "has_eyes", "has_eyebrows", "has_mouth"],
}


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


def extract_cultural_context(content):
    """Extract text between '## Cultural Context' and next section/comment."""
    match = re.search(
        r'## Cultural Context\s*\n(.*?)(?=\n## |\n<!--|---\n|\Z)',
        content, re.DOTALL
    )
    if match:
        text = match.group(1).strip()
        return text if text else None
    return None


def extract_section(content, heading):
    """Extract text under a markdown heading."""
    pattern = rf'## {re.escape(heading)}\s*\n(.*?)(?=\n## |\n<!--|---\n|\Z)'
    match = re.search(pattern, content, re.DOTALL)
    if match:
        text = match.group(1).strip()
        return text if text else None
    return None


def load_frontmatter(directory, skip_files=None):
    """Load YAML frontmatter from all .md files in a directory."""
    if skip_files is None:
        skip_files = {"README.md"}
    items = []
    for filepath in sorted(glob.glob(os.path.join(directory, "*.md"))):
        basename = os.path.basename(filepath)
        if basename in skip_files:
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
                fm["_path"] = filepath
                fm["_content"] = content
                items.append(fm)
        except Exception as e:
            print(f"  WARNING: Error reading {filepath}: {e}")
    return items


def load_trait_files(directories):
    """Load trait files from multiple directories, keyed by slug."""
    traits = {}  # slug -> {frontmatter + metadata}
    for directory in directories:
        for filepath in sorted(glob.glob(os.path.join(directory, "*.md"))):
            basename = os.path.basename(filepath)
            if basename in ("README.md", "drug-pairings.md"):
                continue
            slug = basename.replace(".md", "")
            try:
                with open(filepath, "r") as f:
                    content = f.read()
                fm = {}
                if content.startswith("---"):
                    end = content.index("---", 3)
                    fm = yaml.safe_load(content[3:end]) or {}
                fm["_slug"] = slug
                fm["_category"] = directory
                fm["_context"] = extract_cultural_context(content)
                traits[slug] = fm
            except Exception as e:
                print(f"  WARNING: Error reading {filepath}: {e}")
    return traits


def main():
    print("Loading data sources...")
    miberas = load_frontmatter(MIBERA_DIR)
    drugs = load_frontmatter(DRUG_DIR, skip_files={"README.md", "drug-pairings.md"})
    tarots = load_frontmatter(TAROT_DIR)
    ancestors = load_frontmatter(ANCESTOR_DIR)
    print(f"  Miberas: {len(miberas)}, Drugs: {len(drugs)}, Tarot: {len(tarots)}, Ancestors: {len(ancestors)}")

    # Load all visual trait files
    print("Loading visual trait files...")
    trait_lookup = {}  # field_name -> {slug -> trait_data}
    trait_counts = {}
    for field, (node_type, dirs) in TRAIT_DIRS.items():
        traits = load_trait_files(dirs)
        trait_lookup[field] = traits
        trait_counts[field] = len(traits)
        print(f"  {field}: {len(traits)} files")

    # Build node and edge sets
    nodes = {}  # id -> node dict
    edges = []
    edge_set = set()  # for dedup
    slug_warnings = []  # track unresolved slugs

    def add_node(nid, ntype, label, **extra):
        if nid not in nodes:
            node = {"id": nid, "type": ntype, "label": label}
            node.update(extra)
            nodes[nid] = node
        else:
            # Merge extra fields into existing node
            for k, v in extra.items():
                if v is not None and k not in nodes[nid]:
                    nodes[nid][k] = v

    def add_edge(source, target, etype):
        key = (source, target, etype)
        if key not in edge_set:
            edge_set.add(key)
            weight = EDGE_WEIGHTS.get(etype, 1)
            edges.append({"source": source, "target": target, "type": etype, "weight": weight})

    # ── Process Miberas ──────────────────────────────────────────────
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
            arch_id = f"archetype:{slugify(arch)}"
            add_node(arch_id, "archetype", arch)
            add_edge(node_id, arch_id, "has_archetype")

        # Ancestor
        anc = m.get("ancestor", "")
        if anc:
            anc_id = f"ancestor:{slugify(anc)}"
            add_node(anc_id, "ancestor", anc)
            add_edge(node_id, anc_id, "has_ancestor")

        # Drug
        drug = m.get("drug", "")
        if drug:
            drug_id = f"drug:{slugify(drug)}"
            add_node(drug_id, "drug", drug)
            add_edge(node_id, drug_id, "has_drug")

        # Element
        elem = m.get("element", "")
        if elem:
            elem_id = f"element:{slugify(elem)}"
            add_node(elem_id, "element", elem)
            add_edge(node_id, elem_id, "has_element")

        # Era
        era = m.get("time_period", "")
        if era:
            era_id = f"era:{slugify(era)}"
            add_node(era_id, "era", era)
            add_edge(node_id, era_id, "born_in_era")

        # Sun sign
        sun = m.get("sun_sign", "")
        if sun:
            sun_id = f"zodiac:{slugify(sun)}"
            add_node(sun_id, "zodiac", sun)
            add_edge(node_id, sun_id, "has_sun_sign")

        # Moon sign
        moon = m.get("moon_sign", "")
        if moon:
            moon_id = f"zodiac:{slugify(moon)}"
            add_node(moon_id, "zodiac", moon)
            add_edge(node_id, moon_id, "has_moon_sign")

        # Ascending sign
        asc = m.get("ascending_sign", "")
        if asc:
            asc_id = f"zodiac:{slugify(asc)}"
            add_node(asc_id, "zodiac", asc)
            add_edge(node_id, asc_id, "has_ascending_sign")

        # Swag rank
        rank = m.get("swag_rank", "")
        if rank:
            rank_id = f"swag_rank:{slugify(rank)}"
            add_node(rank_id, "swag_rank", rank)
            add_edge(node_id, rank_id, "has_swag_rank")

        # ── Visual traits ──
        for field, (node_type, _dirs) in TRAIT_DIRS.items():
            value = m.get(field, "")
            if not value or str(value).lower() == "none":
                continue
            slug = slugify(str(value))
            slug = SLUG_OVERRIDES.get(slug, slug)
            traits = trait_lookup.get(field, {})
            if slug in traits:
                trait = traits[slug]
                trait_id = f"{node_type}:{slug}"
                add_node(
                    trait_id, node_type, str(value),
                    category=trait.get("_category"),
                    image=trait.get("image"),
                    swag_score=trait.get("swag_score"),
                    context=trait.get("_context"),
                )
                add_edge(node_id, trait_id, f"has_{field}")
            else:
                slug_warnings.append((mid, field, value, slug))

    # ── Process tarot cards ──────────────────────────────────────────
    print("Processing tarot cards...")
    for t in tarots:
        name = t.get("name", "")
        if not name:
            continue
        tarot_id = f"tarot:{slugify(name)}"
        context = extract_cultural_context(t.get("_content", ""))
        add_node(tarot_id, "tarot_card", name, context=context)

        drug_name = t.get("drug", "")
        if drug_name:
            drug_id = f"drug:{slugify(drug_name)}"
            add_node(drug_id, "drug", drug_name)
            add_edge(drug_id, tarot_id, "maps_to_tarot")

        elem = t.get("element", "")
        if elem:
            elem_id = f"element:{slugify(elem)}"
            add_node(elem_id, "element", elem)
            add_edge(tarot_id, elem_id, "has_suit_element")

    # ── Process drugs ────────────────────────────────────────────────
    print("Processing drugs...")
    for d in drugs:
        name = d.get("name", "")
        if not name:
            continue
        drug_id = f"drug:{slugify(name)}"
        context = extract_cultural_context(d.get("_content", ""))
        add_node(drug_id, "drug", name,
                 molecule=d.get("molecule"),
                 compound=d.get("compound"),
                 context=context)

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

    # ── Backfill context on ancestors ────────────────────────────────
    print("Backfilling context on ancestor nodes...")
    for a in ancestors:
        name = a.get("name", "")
        if not name:
            continue
        anc_id = f"ancestor:{slugify(name)}"
        if anc_id in nodes:
            context = extract_cultural_context(a.get("_content", ""))
            if context:
                nodes[anc_id]["context"] = context

    # ── Backfill context on archetypes ───────────────────────────────
    print("Backfilling context on archetype nodes...")
    if os.path.exists(ARCHETYPE_FILE):
        with open(ARCHETYPE_FILE, "r") as f:
            arch_content = f.read()
        for arch_id, node in nodes.items():
            if node["type"] != "archetype":
                continue
            label = node["label"]
            section = extract_section(arch_content, label)
            if section:
                node["context"] = section

    # ── Build output ─────────────────────────────────────────────────
    node_list = sorted(nodes.values(), key=lambda n: (n["type"], n["id"]))
    edge_list = sorted(edges, key=lambda e: (e["type"], e["source"], e["target"]))

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
            "signal_weights": SIGNAL_WEIGHTS,
        },
        "nodes": node_list,
        "edges": edge_list,
    }

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

    # ── Slug warnings ────────────────────────────────────────────────
    if slug_warnings:
        unique_slugs = set((f, s) for _, f, _, s in slug_warnings)
        print(f"\n  Slug warnings: {len(slug_warnings)} unresolved ({len(unique_slugs)} unique)")
        for field, slug in sorted(unique_slugs)[:20]:
            count = sum(1 for _, f, _, s in slug_warnings if f == field and s == slug)
            print(f"    {field}: '{slug}' ({count} miberas)")
        if len(unique_slugs) > 20:
            print(f"    ... and {len(unique_slugs) - 20} more")

    # ── Validation ───────────────────────────────────────────────────
    print(f"\nValidation:")
    node_ids = set(n["id"] for n in node_list)

    edge_nodes = set()
    for e in edge_list:
        edge_nodes.add(e["source"])
        edge_nodes.add(e["target"])
    orphans = node_ids - edge_nodes
    if orphans:
        print(f"  ✗ {len(orphans)} orphan nodes: {list(orphans)[:5]}")
    else:
        print(f"  ✓ No orphan nodes")

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

    mibera_count = node_type_counts.get("mibera", 0)
    print(f"  {'✓' if mibera_count == 10000 else '✗'} Mibera nodes: {mibera_count}")

    if len(edge_set) == len(edges):
        print(f"  ✓ No duplicate edges")
    else:
        print(f"  ✗ {len(edges) - len(edge_set)} duplicate edges")

    # Context coverage
    nodes_with_context = sum(1 for n in node_list if n.get("context"))
    non_mibera = sum(1 for n in node_list if n["type"] != "mibera")
    print(f"  Context coverage: {nodes_with_context}/{non_mibera} non-mibera nodes")


if __name__ == "__main__":
    main()
