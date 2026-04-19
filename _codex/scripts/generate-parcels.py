#!/usr/bin/env python3
"""Generate MiParcel codex entries from source JSON metadata.

Produces:
  - miparcels/{NNNN}.md          (10,000 individual parcel files)
  - miparcels/README.md          (lore + index page)
  - miparcels/traits/*.md        (12 trait pages + README)
  - _codex/data/parcels.jsonl    (data export)
  - _codex/data/parcels-graph.json (knowledge graph)
  - _codex/data/parcels-trait-report.json (copy of source report)

Usage:
    python3 _codex/scripts/generate-parcels.py --source DIR [--output DIR] [--sample N] [--dry-run]
"""

import argparse
import json
import os
import re
import shutil
import sys
from pathlib import Path


# --- Constants ---

IPFS_CID = "bafybeiexd3lj53j4gpm7rcvnvprlfaa5kqj7bi4zlh4tlj5og23j6fyese"
S3_BASE = "https://thj-assets.s3.us-west-2.amazonaws.com/parcels/parcelsImages"
CONTRACT = "0x6956dae88C00372B1A0b2dfBfE5Eed19F85b0D4B"

# Trait key normalization: source trait_type -> frontmatter key
KEY_MAP = {
    "base": "base",
    "normal addys": "normal_addys",
    "mibera return addy": "mibera_return_addy",
    "stamps": "stamps",
    "scrawl": "scrawl",
    "confetti": "confetti",
    "confetti_second": "confetti_second",
    "confetti_third": "confetti_third",
    "confetti_fourth": "confetti_fourth",
    "sticker1": "sticker1",
    "sticker1_second": "sticker1_second",
    "sticker2": "sticker2",
    "airmail": "airmail",
    "uk orange": "uk_orange",
    "big labels": "big_labels",
    "bigger misc": "bigger_misc",
    "background": None,  # excluded from output
}

# Display names for the markdown trait table
DISPLAY_NAMES = {
    "base": "Base",
    "normal_addys": "Normal Addys",
    "mibera_return_addy": "Mibera Return Addy",
    "stamps": "Stamps",
    "scrawl": "Scrawl",
    "confetti": "Confetti",
    "confetti_second": "Confetti (2nd)",
    "confetti_third": "Confetti (3rd)",
    "confetti_fourth": "Confetti (4th)",
    "sticker1": "Sticker 1",
    "sticker1_second": "Sticker 1 (2nd)",
    "sticker2": "Sticker 2",
    "airmail": "Airmail",
    "uk_orange": "UK Orange",
    "big_labels": "Big Labels",
    "bigger_misc": "Bigger Misc",
}

# Fixed order for frontmatter and trait table
TRAIT_ORDER = [
    "base", "normal_addys", "mibera_return_addy", "stamps", "scrawl",
    "confetti", "confetti_second", "confetti_third", "confetti_fourth",
    "sticker1", "sticker1_second", "sticker2",
    "airmail", "uk_orange", "big_labels", "bigger_misc",
]

SCRAWL_THEMES = [
    "Rave & K-Hole", "Milady-Mibera Duality", "Cosmology",
    "Lore Figures", "The Choose Manifesto", "Refusal",
    "Kaironic Time", "Love Letters", "True Names & Identity",
    "Mission & Rescue",
]


def slugify(text):
    """Convert text to a URL-safe slug."""
    s = text.lower().strip()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'[\s]+', '-', s)
    s = re.sub(r'-+', '-', s)
    return s.strip('-')


# --- Data Loading ---

def load_parcel(source_dir, parcel_id):
    """Load a single parcel JSON file."""
    path = os.path.join(source_dir, str(parcel_id))
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def parse_parcel(raw, scrawl_theme_map):
    """Parse raw JSON into normalized trait dict."""
    pid = int(re.search(r'#(\d+)', raw["name"]).group(1))
    traits = {}
    for attr in raw["attributes"]:
        key = KEY_MAP.get(attr["trait_type"])
        if key is not None:  # skip background (mapped to None)
            traits[key] = attr["value"]

    # Add derived scrawl_theme
    scrawl_text = traits.get("scrawl", "")
    traits["scrawl_theme"] = scrawl_theme_map.get(scrawl_text, "")

    return {
        "id": pid,
        "traits": traits,
        "image": f"{S3_BASE}/{pid}.png",
        "ipfs_image": f"ipfs://{IPFS_CID}/{pid}.png",
    }


# --- File Generation ---

def yaml_escape(value):
    """Escape a YAML string value."""
    if not isinstance(value, str):
        return str(value)
    # Quote strings that contain special chars or could be misinterpreted
    needs_quote = any(c in value for c in [':', '#', '{', '}', '[', ']', ',', '&', '*', '?', '|', '-', '<', '>', '=', '!', '%', '@', '`', '"', "'", '\n'])
    needs_quote = needs_quote or value.lower() in ('true', 'false', 'null', 'yes', 'no')
    needs_quote = needs_quote or (value and value[0] in (' ', '\t'))
    if needs_quote:
        escaped = value.replace('"', '\\"')
        return f'"{escaped}"'
    return value


def render_parcel_md(parcel):
    """Render a parcel .md file."""
    pid = parcel["id"]
    traits = parcel["traits"]
    nnnn = f"{pid:04d}"

    # YAML frontmatter
    lines = ["---"]
    lines.append(f"id: {pid}")
    lines.append("type: miparcel")

    for key in TRAIT_ORDER:
        if key in traits:
            lines.append(f"{key}: {yaml_escape(traits[key])}")

    lines.append(f"scrawl_theme: {yaml_escape(traits.get('scrawl_theme', ''))}")
    lines.append(f"image: {yaml_escape(parcel['image'])}")
    lines.append(f"ipfs_image: {yaml_escape(parcel['ipfs_image'])}")
    lines.append("---")
    lines.append("")

    # Markdown body
    lines.append(f"# MiParcel #{pid}")
    lines.append("")
    lines.append(f"![MiParcel #{pid}]({parcel['image']})")
    lines.append("")
    lines.append("## Traits")
    lines.append("")
    lines.append("| Trait | Value |")
    lines.append("|-------|-------|")

    for key in TRAIT_ORDER:
        if key in traits:
            display = DISPLAY_NAMES[key]
            lines.append(f"| {display} | {traits[key]} |")

    lines.append("")

    # Scrawl theme link
    theme = traits.get("scrawl_theme", "")
    if theme:
        theme_slug = slugify(theme)
        lines.append(f"**Scrawl Theme:** [{theme}](traits/scrawl.md#{theme_slug}) · [Full analysis →](../fractures/miparcels/scrawl.md#{theme_slug})")
        lines.append("")

    # Mibera cross-link
    lines.append(f"**Mibera:** [Mibera #{pid}](../miberas/{nnnn}.md)")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("[← Back to Index](README.md)")
    lines.append("")

    return "\n".join(lines)


def render_readme(trait_report):
    """Render miparcels/README.md with Honey Road lore."""
    trait_categories = [
        ("Base", "base", "24", "All", "base.md"),
        ("Normal Addys", "normal addys", "14", "All", "normal-addys.md"),
        ("Mibera Return Addy", "mibera return addy", "17", "All", "return-addys.md"),
        ("Stamps", "stamps", "41", "All", "stamps.md"),
        ("Scrawl", "scrawl", "189", "All", "scrawl.md"),
        ("Confetti", "confetti", "71", "All (up to 4 layers)", "confetti.md"),
        ("Stickers", "sticker1", "24+24+30", "Sparse", "stickers.md"),
        ("Airmail", "airmail", "42", "Sparse", "airmail.md"),
        ("UK Orange", "uk orange", "4", "Sparse", "uk-orange.md"),
        ("Big Labels", "big labels", "16", "Sparse", "big-labels.md"),
        ("Bigger Misc", "bigger misc", "18", "Sparse", "bigger-misc.md"),
    ]

    lines = []
    lines.append("# MiParcels")
    lines.append("")
    lines.append('> *"We\'re glad this made its way through the border. Kaironic time viscous like Honey. Mibera thoon. uART thooon."*')
    lines.append("")
    lines.append("10,000 generative sealed envelopes from the **Honey Road** — the Phase 1 reveal of the Mibera collection. Each parcel is a unique combination of stamps, stickers, scrawl, labels, and confetti. The first thing holders see is a package — not a being, not even a promise of one. Just anticipation in physical form.")
    lines.append("")
    lines.append("## The Honey Road")
    lines.append("")
    lines.append("Every parcel is named: **Honey Road Parcel #N from High Council 任侠団体 of 101 Bears**")
    lines.append("")
    lines.append("| Term | Meaning |")
    lines.append("|------|---------|")
    lines.append("| **Honey Road** | The Silk Road reimagined through Berachain — an ancient trade route and a darknet marketplace collapsed into one, with honey as the medium of exchange. The parcels travel this road. |")
    lines.append('| **High Council 任侠団体** | 任侠団体 (ninkyō dantai) — the formal Japanese term for yakuza syndicates, literally "chivalrous organization." The High Council is the governing body in Mibera lore: gangsters who operate by a code. |')
    lines.append("| **101 Bears** | The founding community — 101 Bears invoking the sky and earth. |")
    lines.append('| **"Kaironic time viscous like Honey"** | Time philosophy (Kairos vs Chronos) expressed through viscosity — time that flows slowly, stickily, non-linearly. Honey as temporal metaphor. |')
    lines.append('| **"Mibera thoon. uART thooon."** | Lore-specific slang. uART = the art layer. |')
    lines.append("")
    lines.append("## Collection Identity")
    lines.append("")
    lines.append("| Property | Value |")
    lines.append("|----------|-------|")
    lines.append("| Token Count | 10,000 |")
    lines.append(f"| Contract | `{CONTRACT}` |")
    lines.append(f"| IPFS CID | `{IPFS_CID}` |")
    lines.append("| Trait Categories | 15 (excl. background) |")
    lines.append("| Fracture Phase | Phase 1 |")
    lines.append("")
    lines.append("## Trait Categories")
    lines.append("")
    lines.append("| Category | Values | Coverage | Page |")
    lines.append("|----------|--------|----------|------|")
    for name, key, values, coverage, page in trait_categories:
        lines.append(f"| {name} | {values} | {coverage} | [→](traits/{page}) |")
    lines.append("")
    lines.append("## Lookup")
    lines.append("")
    lines.append("MiParcel by ID: `miparcels/{NNNN}.md` (zero-padded, e.g., #42 → `miparcels/0042.md`)")
    lines.append("")
    lines.append("## Related")
    lines.append("")
    lines.append("- [MiParcels Fracture Entry →](../fractures/miparcels.md)")
    lines.append("- [Scrawl Deep Analysis →](../fractures/miparcels/scrawl.md)")
    lines.append("")

    return "\n".join(lines)


# --- Trait Pages ---

def render_trait_page(title, description, cultural_context, values_with_counts):
    """Render a single trait documentation page."""
    lines = [f"# {title}"]
    lines.append("")
    lines.append(f"> {description}")
    lines.append("")
    lines.append("## Overview")
    lines.append("")
    total_parcels = sum(values_with_counts.values())
    lines.append(f"{len(values_with_counts)} unique values. {total_parcels:,} total assignments across 10,000 MiParcels.")
    lines.append("")

    if cultural_context:
        lines.append("## Cultural Context")
        lines.append("")
        lines.append(cultural_context)
        lines.append("")

    lines.append("## Values")
    lines.append("")
    lines.append("| Value | Count |")
    lines.append("|-------|-------|")
    for value, count in sorted(values_with_counts.items(), key=lambda x: -x[1]):
        lines.append(f"| {value} | {count:,} |")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("[← Back to Trait Index](README.md)")
    lines.append("")
    return "\n".join(lines)


def render_scrawl_trait_page(scrawl_counts, scrawl_theme_map):
    """Special scrawl trait page with theme cluster grouping."""
    lines = ["# Scrawl"]
    lines.append("")
    lines.append("> *Gumi's handwriting on every parcel. 189 unique lore fragments inked directly onto sealed envelopes.*")
    lines.append("")
    lines.append("## Overview")
    lines.append("")
    lines.append("189 unique scrawl texts across 10,000 MiParcels. Every parcel has exactly one scrawl.")
    lines.append("")
    lines.append("**Note:** The [deep scrawl analysis](../../fractures/miparcels/scrawl.md) documents 206 visual variants — the same text can appear with different handwriting style, placement, weight, and ink color. This page tracks the 189 unique *text values* from the metadata; the deep analysis tracks the 206 unique *visual treatments*.")
    lines.append("")

    # Group by theme
    theme_groups = {}
    for text, theme in scrawl_theme_map.items():
        if text in scrawl_counts:
            if theme not in theme_groups:
                theme_groups[theme] = []
            theme_groups[theme].append((text, scrawl_counts[text]))

    lines.append("## Themes")
    lines.append("")
    lines.append("| Theme | Texts | Parcels |")
    lines.append("|-------|-------|---------|")
    for theme in SCRAWL_THEMES:
        entries = theme_groups.get(theme, [])
        text_count = len(entries)
        parcel_count = sum(c for _, c in entries)
        theme_slug = slugify(theme)
        lines.append(f"| [{theme}](#{theme_slug}) | {text_count} | {parcel_count:,} |")
    lines.append("")

    # Per-theme sections
    for theme in SCRAWL_THEMES:
        entries = theme_groups.get(theme, [])
        theme_slug = slugify(theme)
        lines.append(f"## {theme}")
        lines.append("")
        lines.append(f"[Full analysis →](../../fractures/miparcels/scrawl.md#{theme_slug})")
        lines.append("")
        lines.append("| Text | Count |")
        lines.append("|------|-------|")
        for text, count in sorted(entries, key=lambda x: -x[1]):
            lines.append(f"| {text} | {count:,} |")
        lines.append("")

    lines.append("---")
    lines.append("")
    lines.append("[← Back to Trait Index](README.md)")
    lines.append("")
    return "\n".join(lines)


def render_traits_readme():
    """Render miparcels/traits/README.md index."""
    pages = [
        ("Base", "base.md", "24 base envelope designs"),
        ("Normal Addys", "normal-addys.md", "14 delivery addresses with cultural provenance"),
        ("Return Addys", "return-addys.md", "17 return address handwriting styles"),
        ("Stamps", "stamps.md", "41 postage stamps with historical context"),
        ("Scrawl", "scrawl.md", "189 lore fragments grouped by thematic cluster"),
        ("Stickers", "stickers.md", "78 character stickers across 3 slots"),
        ("Confetti", "confetti.md", "71 confetti designs with elemental sub-families"),
        ("Airmail", "airmail.md", "42 international airmail labels"),
        ("UK Orange", "uk-orange.md", "4 Royal Mail Return To Sender stickers"),
        ("Big Labels", "big-labels.md", "16 large shipping labels"),
        ("Bigger Misc", "bigger-misc.md", "18 miscellaneous visual elements"),
    ]

    lines = ["# MiParcel Trait Index"]
    lines.append("")
    lines.append("Documentation for the 15 MiParcel trait categories.")
    lines.append("")
    lines.append("| Category | Page | Description |")
    lines.append("|----------|------|-------------|")
    for name, page, desc in pages:
        lines.append(f"| {name} | [{page}]({page}) | {desc} |")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("[← Back to MiParcels](../README.md)")
    lines.append("")
    return "\n".join(lines)


# --- Cultural Context ---

CULTURAL_CONTEXT = {
    "normal-addys": """The 14 delivery address values point to 5 real-world locations — each a deliberate choice:

**Alexander Shulgin Research Institute** (2 variants: clean + smudged) — Sasha Shulgin, "the Godfather of Psychedelics." He synthesized MDMA, 2C-B, and hundreds of other psychoactive compounds at his home lab in Lafayette, California. Author of PiHKAL (Phenethylamines I Have Known and Loved) and TiHKAL (Tryptamines I Have Known and Loved). The address on the parcel is a pilgrimage marker — sending mail to the source of psychedelic chemistry.

**USP Terre Haute** (4 variants) — United States Penitentiary, Terre Haute, Indiana. Home of the federal death row. Site of Timothy McVeigh's execution (2001) and the resumption of federal executions in 2020. Sending a parcel here means sending art to the belly of the carceral state.

**Grateful Dead House** (2 variants: clean + smudged) — 710 Ashbury Street, San Francisco. The communal home of the Grateful Dead during the Summer of Love (1967). Epicenter of the psychedelic counterculture.

**Big Nig's House** (4 variants) — Underground culture reference preserved faithfully as part of the art.

**Dow Chemical Co** (2 variants: clean + smudged) — Manufacturer of Agent Orange, napalm, and Saran Wrap. The corporate-industrial complex as destination — sending parcels to the machine.

The addresses map a moral geography: psychedelic lab, federal prison, counterculture commune, underground figure, military-industrial corporation. Where you send things says everything about what world you live in.""",

    "stamps": """The 41 stamp designs are drawn from real-world postal history, clustering into 7 series:

**Grateful Dead Montserrat** (8 variants) — The Caribbean island of Montserrat actually issued official Grateful Dead postage stamps in 1996. The intersection of counterculture iconography and state-sanctioned postal art.

**Canada Bear Stamps** (5 variants) — Polar Bear (Ursus Maritimus, 1953) and Grizzly Bear (Ursus Arctos Horribilis, 1976). Real Canadian wildlife stamps bridging real-world conservation and Berachain bear iconography.

**Sinn Fein Forerunner** (4 variants) — Pre-independence Irish revolutionary stamps from 1907. These are NOT official state postage — they are propaganda labels produced by Sinn Fein before Irish independence. Artifacts of a nation that didn't yet exist claiming the right to issue its own stamps.

**Irish Free State / Saorstat Eireann** (4 variants, red + green) — 1922 overprints: British stamps with "Saorstat Eireann" (Irish Free State) printed over the king's head. The act of overprinting as political erasure and reclamation.

**Australian Aboriginal Art** (8 variants) — Real postage stamps featuring named First Nations artists and their communities: **George Milpurrurru** (Ganalbingu) — Goose Egg Hunt; **Tim Leura Tjapaltjarri** — Hunter Dreaming (1977); **Jack Wunuwun** (Murrungun) — Barrdje Bunpa Yam Plants; **Rover Thomas** (Wangkajunga/Kukatja) — Kalumpiwarra Ngulalintji. Indigenous sovereignty expressed through the postal system of the colonizer state.

**Prevent Drug Abuse 1971** (4 variants) — US postage stamp from the War on Drugs era. Ironic juxtaposition on a parcel shipped from Alexander Shulgin's lab and the Grateful Dead House.

**Elemental Jani** (2 variants: rectangle + square) — Jani, a central Mibera lore figure, rendered as elemental postage. The only non-real-world stamp in the collection.""",

    "stickers": """Three sticker slots feature the Mibera character roster in chibi and portrait form.

**Sticker 1** (24 values) — Chibi-style character stickers: Jani in 7 poses (driving, flex, phone, sitting yay, rocket, water surf, thumbsup), Jani expressions (aww ×3, greetings ×2), Elemental Jani water surf, Puruhani in 6 colors (blue, red, yellow, green, purple — each with 2 variants), Chibi Akane, and Chibi Nemu in a box.

**Sticker 1 Second** (24 values) — The same character set as Sticker 1, reshuffled. A parcel may have Sticker 1 or Sticker 1 Second (or neither), but not both.

**Sticker 2** (30 values) — Character portraits and relationship pairings: solo characters (Akane, Nemu, Ruan, Kaori, Eun, Jani in 4 variants), character pairings (Ruan with Kaori, Ruan with Eun, Akane with Nemu, Akane with Kaori, Chibi Ruan with Ruan, Chibi Eun with Eun, Chibi Kaori with Kaori, Chibi Akane with Akane, Chibi Nemu with Nemu, Chibi Nemu with Chibi Kaori, Chibi Eun with Chibi Akane), and the group shot: Chibi Jani with Akane Kaori Eun Nemu Ruan.

**Characters identified:** Jani, Akane, Nemu, Ruan, Kaori, Eun, Puruhani, Tsuheji.""",

    "confetti": """71 confetti designs shared across up to 4 layers per parcel, clustering into sub-families:

**Elemental Jani** (~15 variants) — Jani rendered in the five Chinese elements: Fire, Water, Earth, Metal, Wood. Each element has multiple visual variants. This parallels the Mibera element system (Earth, Fire, Water, Air) but uses the Chinese five-element (Wu Xing) framework instead.

**Tsuheji Elements** (~10 variants) — Tsuheji (a lore character) in the same five-element system: Earth, Fire, Metal, Wood elements with multiple variants per element.

**Henlo Animals** (~12 variants) — Bear-adjacent creatures: Black Bear, Brown Bera, Polar Bera, Black Bera, Red Panda, Panda. "Henlo" is the Berachain community greeting.

**Boarding Passes** (~6 variants) — Purple, Blue, and Yellow boarding passes — travel documents for the Honey Road.""",

    "airmail": """42 airmail labels from international postal systems:

| System | Language | Notable Detail |
|--------|----------|----------------|
| **Welsh Post** | Welsh (AWYR par avion Post Brenhinol) | Welsh-language postal label — a minority language on official mail |
| **Royal Mail** | English (Air Mail Par Avion) | 6 variants of the British empire's postal system |
| **Irish Air Mail** | Irish (Aerphost) | 4 variants — Irish-language priority labels |
| **Korean Air Mail** | Korean (Par Avion) | 4 variants |
| **Japanese Air Mail** | Japanese | 3 variants |
| **Indonesian Air Mail** | Indonesian (CEPAT TEPAT AMAN — "Fast, Accurate, Safe") | 4 variants |
| **Deutsche PRIORITY** | German (Prioritaire Luftpost) | 4 variants |
| **Vintage Canadian Air Mail** | English/French (Par Avion) | 4 variants |
| **USPS Surface Transportation Only** | English | 2 variants — ground shipping, the anti-airmail |
| **Atlantic Ocean Label IIB April 1997** | English | 4 variants — a specific historical air route label |

Plus 6 FRAGILE Handle With Care variants.

The parcels move through Welsh, Irish, Korean, Japanese, Indonesian, German, Canadian, British, and American postal systems. Minority languages (Welsh, Irish) appear alongside colonial languages. The parcel is an international object.""",

    "big-labels": """16 large shipping labels from 4 sources:

**Grateful Dead House** (5 variants) — Large address labels for 710 Ashbury Street.

**Shulgin Foundation & Shulgin Farm** (4 variants) — Labels for Alexander Shulgin's actual research facility in Lafayette, California. The Shulgin Foundation continues his legacy of psychedelic research.

**General Wade's Military Roads** (1 variant) — 18th-century roads built by Field Marshal George Wade to control the Scottish Highlands after the Jacobite risings of 1715. The British state imposing infrastructure as a tool of colonial control — parcels traveling roads built for military suppression.

**USPS Content Declarations** (6 variants) — Customs labels with Mibera-themed content descriptions: "Mibera???", "Supplements and Vitamins", "Mibera Stuff", "Mibera Star", "DVD", "Shirt". The mundane bureaucracy of declaring contraband art.""",
}


def generate_trait_pages(trait_report, scrawl_theme_map, output_dir):
    """Generate all trait documentation pages."""
    traits_dir = os.path.join(output_dir, "miparcels", "traits")
    os.makedirs(traits_dir, exist_ok=True)

    # Traits README
    with open(os.path.join(traits_dir, "README.md"), "w", encoding="utf-8") as f:
        f.write(render_traits_readme())

    # Simple trait pages (no cultural context)
    simple_pages = [
        ("base.md", "Base", "Base parcel envelope designs — 24 unique sealed envelope templates.", trait_report.get("base", {})),
        ("return-addys.md", "Mibera Return Addy", "Return address handwriting styles — how Mibera writes its own name on the envelope.", trait_report.get("mibera return addy", {})),
        ("uk-orange.md", "UK Orange", "Royal Mail Return To Sender stickers.", trait_report.get("uk orange", {})),
        ("bigger-misc.md", "Bigger Misc", "Larger miscellaneous visual elements — stamps, FRAGILE/URGENT labels, postal markers.", trait_report.get("bigger misc", {})),
    ]

    for filename, title, desc, values in simple_pages:
        content = render_trait_page(title, desc, None, values)
        with open(os.path.join(traits_dir, filename), "w", encoding="utf-8") as f:
            f.write(content)

    # Culturally-annotated trait pages
    cultural_pages = [
        ("normal-addys.md", "Normal Addys", "Delivery addresses — 5 real-world locations, each a deliberate lore choice.", trait_report.get("normal addys", {})),
        ("stamps.md", "Stamps", "Postage stamps drawn from real-world postal history — revolutionary, indigenous, countercultural, and ironic.", trait_report.get("stamps", {})),
        ("confetti.md", "Confetti", "Confetti designs across up to 4 layers — elemental characters, bear creatures, and boarding passes.", trait_report.get("confetti", {})),
        ("airmail.md", "Airmail", "International airmail labels from 10 national postal systems.", trait_report.get("airmail", {})),
        ("big-labels.md", "Big Labels", "Large shipping labels — Grateful Dead House, Shulgin Foundation, General Wade, and USPS declarations.", trait_report.get("big labels", {})),
    ]

    for filename, title, desc, values in cultural_pages:
        context_key = filename.replace(".md", "")
        context = CULTURAL_CONTEXT.get(context_key, "")
        content = render_trait_page(title, desc, context, values)
        with open(os.path.join(traits_dir, filename), "w", encoding="utf-8") as f:
            f.write(content)

    # Stickers (merged from 3 slots)
    sticker_values = {}
    for key in ["sticker1", "sticker1_second", "sticker2"]:
        for val, count in trait_report.get(key, {}).items():
            label = f"{val} ({key})"
            sticker_values[label] = count
    content = render_trait_page("Stickers", "Character stickers across 3 slots — chibi portraits, Puruhani colors, and relationship pairings.",
                                CULTURAL_CONTEXT.get("stickers", ""), sticker_values)
    with open(os.path.join(traits_dir, "stickers.md"), "w", encoding="utf-8") as f:
        f.write(content)

    # Scrawl (special: grouped by theme)
    scrawl_counts = trait_report.get("scrawl", {})
    content = render_scrawl_trait_page(scrawl_counts, scrawl_theme_map)
    with open(os.path.join(traits_dir, "scrawl.md"), "w", encoding="utf-8") as f:
        f.write(content)


# --- Knowledge Graph ---

def build_graph(parcels, scrawl_theme_map, trait_report):
    """Build parcels-graph.json."""
    nodes = {}
    edges = []

    # Helper to add node
    def add_node(nid, ntype, label, context=None):
        if nid not in nodes:
            node = {"id": nid, "type": ntype, "label": label}
            if context:
                node["context"] = context
            nodes[nid] = node

    # Add scrawl theme nodes
    for theme in SCRAWL_THEMES:
        add_node(f"scrawl_theme:{slugify(theme)}", "scrawl_theme", theme)

    # Add character nodes
    characters = ["Jani", "Akane", "Nemu", "Ruan", "Kaori", "Eun", "Puruhani", "Tsuheji"]
    for char in characters:
        add_node(f"character:{slugify(char)}", "character", char)

    # Process parcels
    for parcel in parcels:
        pid = parcel["id"]
        traits = parcel["traits"]
        parcel_nid = f"miparcel:{pid}"
        add_node(parcel_nid, "miparcel", f"MiParcel #{pid}")

        # Mibera cross-reference
        edges.append({"source": parcel_nid, "target": f"mibera:{pid}", "type": "corresponds_to", "weight": 3})

        # Trait edges
        for key in TRAIT_ORDER:
            if key not in traits:
                continue
            val = traits[key]
            val_slug = slugify(val)
            val_nid = f"{key}:{val_slug}"
            add_node(val_nid, key, val)

            edge_type = f"has_{key}"
            edges.append({"source": parcel_nid, "target": val_nid, "type": edge_type, "weight": 1})

        # Scrawl theme edge
        theme = traits.get("scrawl_theme", "")
        if theme:
            scrawl_val = traits.get("scrawl", "")
            scrawl_nid = f"scrawl:{slugify(scrawl_val)}"
            theme_nid = f"scrawl_theme:{slugify(theme)}"
            edges.append({"source": scrawl_nid, "target": theme_nid, "type": "scrawl_in_theme", "weight": 2})

    return {
        "metadata": {
            "generated": "2026-04-16",
            "description": "MiParcel trait knowledge graph",
            "node_count": len(nodes),
            "edge_count": len(edges),
        },
        "nodes": list(nodes.values()),
        "edges": edges,
    }


# --- Main ---

def main():
    parser = argparse.ArgumentParser(description="Generate MiParcel codex entries")
    parser.add_argument("--source", required=True, help="Path to parcelsMetadataFinal/")
    parser.add_argument("--output", default=".", help="Codex root directory")
    parser.add_argument("--sample", type=int, default=0, help="Generate only first N parcels")
    parser.add_argument("--dry-run", action="store_true", help="Print stats without writing")
    args = parser.parse_args()

    # Load scrawl theme map
    map_path = os.path.join(args.output, "_codex", "data", "scrawl-theme-map.json")
    print(f"Loading scrawl-theme-map.json from {map_path}...")
    with open(map_path, "r", encoding="utf-8") as f:
        scrawl_theme_map = json.load(f)
    print(f"  {len(scrawl_theme_map)} theme mappings loaded")

    # Load trait report
    report_path = os.path.join(args.source, "_final_trait_report.json")
    print(f"Loading trait report from {report_path}...")
    with open(report_path, "r", encoding="utf-8") as f:
        trait_report = json.load(f)

    # Determine parcel IDs to process
    max_id = args.sample if args.sample > 0 else 10000
    parcel_ids = list(range(1, max_id + 1))
    print(f"Processing {len(parcel_ids)} parcels...")

    if args.dry_run:
        print("[DRY RUN] Would generate:")
        print(f"  {len(parcel_ids)} parcel .md files")
        print(f"  1 README.md")
        print(f"  12 trait pages + 1 trait index")
        print(f"  1 parcels.jsonl ({len(parcel_ids)} lines)")
        print(f"  1 parcels-graph.json")
        return

    # Create directories
    parcels_dir = os.path.join(args.output, "miparcels")
    data_dir = os.path.join(args.output, "_codex", "data")
    os.makedirs(parcels_dir, exist_ok=True)
    os.makedirs(os.path.join(parcels_dir, "traits"), exist_ok=True)
    os.makedirs(data_dir, exist_ok=True)

    # Generate parcel files
    parcels = []
    unmapped_scrawls = set()
    jsonl_path = os.path.join(data_dir, "parcels.jsonl")

    with open(jsonl_path, "w", encoding="utf-8") as jsonl_f:
        for i, pid in enumerate(parcel_ids, 1):
            raw = load_parcel(args.source, pid)
            parcel = parse_parcel(raw, scrawl_theme_map)
            parcels.append(parcel)

            if not parcel["traits"].get("scrawl_theme"):
                unmapped_scrawls.add(parcel["traits"].get("scrawl", "???"))

            # Write .md file
            nnnn = f"{pid:04d}"
            md_content = render_parcel_md(parcel)
            with open(os.path.join(parcels_dir, f"{nnnn}.md"), "w", encoding="utf-8") as f:
                f.write(md_content)

            # Write JSONL line
            jsonl_obj = {"id": pid, "type": "miparcel"}
            jsonl_obj.update(parcel["traits"])
            jsonl_obj["image"] = parcel["image"]
            jsonl_obj["ipfs_image"] = parcel["ipfs_image"]
            jsonl_f.write(json.dumps(jsonl_obj, ensure_ascii=False) + "\n")

            if i % 1000 == 0:
                print(f"  {i:,}/{len(parcel_ids):,} parcels generated")

    print(f"  {len(parcels):,} parcel files written")

    # Generate README
    readme_content = render_readme(trait_report)
    with open(os.path.join(parcels_dir, "README.md"), "w", encoding="utf-8") as f:
        f.write(readme_content)
    print("  README.md written")

    # Generate trait pages
    generate_trait_pages(trait_report, scrawl_theme_map, args.output)
    print("  Trait pages written")

    # Generate graph
    print("  Building knowledge graph...")
    graph = build_graph(parcels, scrawl_theme_map, trait_report)
    graph_path = os.path.join(data_dir, "parcels-graph.json")
    with open(graph_path, "w", encoding="utf-8") as f:
        json.dump(graph, f, ensure_ascii=False)
    print(f"  Graph: {graph['metadata']['node_count']:,} nodes, {graph['metadata']['edge_count']:,} edges")

    # Copy trait report
    src_report = os.path.join(args.source, "_final_trait_report.json")
    dst_report = os.path.join(data_dir, "parcels-trait-report.json")
    shutil.copy2(src_report, dst_report)
    print("  Trait report copied")

    # Summary
    print(f"\nDone!")
    print(f"  Parcels: {len(parcels):,}")
    print(f"  JSONL:   {jsonl_path}")
    print(f"  Graph:   {graph_path}")

    if unmapped_scrawls:
        print(f"\n  WARNING: {len(unmapped_scrawls)} parcels have unmapped scrawl themes:")
        for s in sorted(unmapped_scrawls):
            print(f"    - {s}")


if __name__ == "__main__":
    main()
