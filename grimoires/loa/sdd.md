# SDD: Full Trait Knowledge Graph

**Cycle:** 020
**Created:** 2026-04-03

## Architecture

Single-script expansion of the existing `_codex/scripts/generate-graph.py`. No new files, no new dependencies. The script already uses stdlib + PyYAML and follows the codex convention of regex YAML parsing — PyYAML is the one exception, already present.

The change is purely additive: new trait directories loaded, new node types created, new edge types emitted. Existing node/edge structures are unchanged.

## Component Design

### 1. Trait Directory Registry

A configuration mapping from mibera frontmatter field names to trait file directories. This is the core lookup table the script uses to resolve a mibera's trait values to trait file nodes.

```python
TRAIT_DIRS = {
    # field_name: (node_type, [directories], weight)
    "shirt":          ("shirt",          ["traits/clothing/short-sleeves", "traits/clothing/long-sleeves", "traits/clothing/simple-shirts"], 1),
    "hat":            ("hat",            ["traits/accessories/hats"], 1),
    "item":           ("item",           ["traits/items/general-items", "traits/items/bong-bears"], 1),
    "glasses":        ("glasses",        ["traits/accessories/glasses"], 1),
    "earrings":       ("earrings",       ["traits/accessories/earrings"], 1),
    "mask":           ("mask",           ["traits/accessories/masks"], 1),
    "face_accessory": ("face_accessory", ["traits/accessories/face-accessories"], 1),
    "tattoo":         ("tattoo",         ["traits/character-traits/tattoos"], 1),
    "background":     ("background",     ["traits/backgrounds"], 1),
    "body":           ("body",           ["traits/character-traits/body"], 1),
    "hair":           ("hair",           ["traits/character-traits/hair"], 1),
    "eyes":           ("eyes",           ["traits/character-traits/eyes"], 1),
    "eyebrows":       ("eyebrows",       ["traits/character-traits/eyebrows"], 1),
    "mouth":          ("mouth",          ["traits/character-traits/mouth"], 1),
}
```

### 2. Trait File Loader

Extends the existing `load_frontmatter()` to also extract the Cultural Context section from the markdown body:

```python
def load_trait_files(directories):
    """Load frontmatter + cultural context from trait files across multiple directories."""
    items = {}  # slug -> {frontmatter + context}
    for directory in directories:
        for filepath in sorted(glob.glob(os.path.join(directory, "*.md"))):
            basename = os.path.basename(filepath)
            if basename == "README.md" or basename == "drug-pairings.md":
                continue
            slug = basename.replace(".md", "")
            content = open(filepath).read()
            # Extract frontmatter
            fm = parse_frontmatter(content)
            # Extract cultural context
            context = extract_cultural_context(content)
            if fm:
                fm["_slug"] = slug
                fm["_context"] = context
                fm["_category"] = directory
                items[slug] = fm
    return items
```

### 3. Cultural Context Extractor

Regex-based extraction of the Cultural Context section from markdown:

```python
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
```

This same function is applied to existing node types (ancestors, drugs, tarot cards, archetypes) to backfill `context` on all nodes.

### 4. Slug Resolution

The critical mapping step: converting a mibera's frontmatter value (e.g., `shirt: "Free Palestine"`) to the corresponding trait file slug (`free-palestine`). Uses the existing `slugify()` function, then validates against loaded trait files.

```python
def resolve_trait(value, trait_files):
    """Resolve a mibera's trait value to a trait file slug."""
    if not value or value == "None":
        return None
    slug = slugify(value)
    if slug in trait_files:
        return slug
    # Fallback: try without common suffixes/variations
    # Log warning if unresolved
    return None
```

Unresolved traits are logged as warnings. The validation phase catches any systematic mismatches.

### 5. Edge Weight System

Weights are assigned per edge type, stored on each edge object:

```python
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
```

The `add_edge()` function is updated to include weight:

```python
def add_edge(source, target, etype):
    key = (source, target, etype)
    if key not in edge_set:
        edge_set.add(key)
        edges.append({
            "source": source,
            "target": target,
            "type": etype,
            "weight": EDGE_WEIGHTS.get(etype, 1)
        })
```

### 6. Node Schema

All nodes gain a `context` field. Existing nodes are backfilled:

```python
# Trait nodes
{
    "id": "shirt:free-palestine",
    "type": "shirt",
    "label": "Free Palestine",
    "category": "clothing/short-sleeves",
    "image": "https://mibera.s3.amazonaws.com/...",
    "swag_score": 2,
    "context": "\"Free Palestine\" is one of the most recognized..."
}

# Existing identity nodes (backfilled)
{
    "id": "ancestor:greek",
    "type": "ancestor",
    "label": "Greek",
    "context": "The Greek ancestor lineage connects to..."
}

# Mibera nodes (unchanged, no context)
{
    "id": "mibera:1",
    "type": "mibera",
    "label": "Mibera #1"
}
```

## Data Flow

```
miberas/*.md (frontmatter)
    ↓ read 10,000 files
    ↓ extract all 24 fields
    ↓
traits/**/*.md (frontmatter + cultural context)
    ↓ read ~1,324 files across 15 directories
    ↓ build slug → node mapping
    ↓
core-lore/**/*.md (cultural context for backfill)
    ↓ read ancestor, archetype, tarot files
    ↓ extract context sections
    ↓
generate-graph.py
    ↓ create nodes (identity + visual + overlay)
    ↓ resolve mibera traits → trait slugs
    ↓ create weighted edges
    ↓ validate (orphans, bad refs, counts)
    ↓
_codex/data/graph.json (~18-22 MB)
```

## Processing Order

1. Load all trait files (build slug lookup tables)
2. Load all context source files (ancestors, archetypes, drugs, tarot)
3. Process miberas (create mibera nodes + all edges)
4. Process tarot cards (drug→tarot, tarot→element edges)
5. Process drugs (drug→archetype, drug→ancestor edges)
6. Backfill context on all non-mibera nodes
7. Validate
8. Write output

## Output Schema

```json
{
    "metadata": {
        "generated": "2026-04-03",
        "generator": "_codex/scripts/generate-graph.py",
        "node_count": 11561,
        "edge_count": 190000,
        "node_types": {"mibera": 10000, "shirt": 187, ...},
        "edge_types": {"has_archetype": 10000, "has_shirt": 10000, ...},
        "signal_weights": {
            "load_bearing": ["has_archetype", "has_ancestor", "born_in_era"],
            "textural": ["has_drug", "maps_to_tarot", "has_element"],
            "modifier": ["has_swag_rank", "has_sun_sign", "has_moon_sign", "has_ascending_sign"],
            "visual": ["has_shirt", "has_hat", "has_item", ...]
        }
    },
    "nodes": [...],
    "edges": [...]
}
```

The `signal_weights` metadata block lets consumers discover the hierarchy without hardcoding it.

## Bug Fix: Molecule YAML Errors

The 5 files with `origin: '---'` have a YAML value that is a quoted string containing the YAML document separator. Fix by replacing with a meaningful value or removing the field:

```yaml
# Before
origin: '---'

# After (option A: remove)
# (delete the line)

# After (option B: explicit unknown)
origin: "unknown"
```

Option A preferred — the `origin` field is not read by the graph generator or any other script.

## IDENTITY.md Update

Add a new section documenting that visual traits are now part of the signal system at weight 1, below the existing hierarchy. The core principle — "traits are signals, not scripts" — remains unchanged. Visual traits extend the signal system without displacing the load-bearing/textural/modifier tiers.

## Backward Compatibility

| Aspect | Impact |
|--------|--------|
| Existing node IDs | Unchanged — `mibera:1`, `archetype:freetekno`, etc. all preserved |
| Existing edge types | Unchanged — `has_archetype`, `has_drug`, etc. all preserved |
| Existing node fields | `id`, `type`, `label` all preserved; `context` added (new field) |
| Existing edge fields | `source`, `target`, `type` preserved; `weight` added (new field) |
| metadata block | Existing fields preserved; `signal_weights` added |
| Finn's KnowledgeGraphLoader | Reads nodes/edges by type — ignores unknown types. No code change needed. |

## Technical Risks

| Risk | Mitigation |
|------|------------|
| Slug mismatch | Build a validation pass that checks every mibera trait value resolves to a trait file. Log all failures. Run before generating edges. |
| File size | Compact JSON (no pretty-print). If >25MB, consider: (a) truncate context to 500 chars, (b) separate context into sidecar file |
| Generation time | Single-pass architecture. If >60s, parallelize file reads with concurrent.futures. |
