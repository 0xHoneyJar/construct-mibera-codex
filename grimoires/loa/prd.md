# PRD: MiParcels — 10K Parcel Entries & Trait Documentation

**Cycle:** 022
**Status:** Draft
**Created:** 2026-04-16

---

## 1. Problem Statement

MiParcels are the Phase 1 reveal of the Mibera collection — 10,000 generative sealed envelopes, each a unique combination of stamps, stickers, scrawl, labels, and confetti. They are the first thing holders see before their Mibera is revealed. The parcels are not decoration — every trait layer encodes deliberate cultural, political, and lore references: real-world postage stamps from revolutionary Ireland and Aboriginal Australia, delivery addresses pointing to Alexander Shulgin's lab and the Grateful Dead house, handwritten lore fragments spanning ten thematic clusters from "I am the refusal" to "there is no random I love you."

Currently, the codex documents MiParcels only as a fracture entry (`fractures/miparcels.md`) with a single trait page for scrawl (`fractures/miparcels/scrawl.md`). The full parcel metadata — 16 trait categories across 10,000 tokens — exists only as raw JSON files outside the repo. There are no individual parcel entries, no per-trait documentation, no cultural context for the addresses/stamps/stickers, and no parcel-specific knowledge graph. Parcels are invisible to navigation, search, and cross-referencing.

Meanwhile, the mibera entries already display parcel images in their Reveal Timeline but have no structured link back to parcel trait data.

## 2. Vision

After this cycle, every MiParcel has its own codex entry at `miparcels/{NNNN}.md` with full trait data in YAML frontmatter, cross-linked to its corresponding Mibera. Each parcel trait category has culturally-annotated documentation — not just lists of values, but explanations of *why* gumi chose Sinn Fein forerunner stamps, why the delivery addresses point to a federal death row and a psychedelic chemist's lab, what the elemental Jani confetti system represents. A dedicated parcel knowledge graph captures the trait relationships. Every parcel's scrawl is tagged to its thematic cluster, connecting the per-parcel data back to the curated analysis that already exists. The "Honey Road" collection name itself is documented as lore.

The parcel section is a first-class citizen of the codex — navigable, searchable, machine-readable, and rich with the same cultural depth the mibera traits received in cycle-016.

## 3. Goals & Success Metrics

| Goal | Metric |
|------|--------|
| Parcel coverage | 10,000 individual `miparcels/{NNNN}.md` files, one per token |
| Trait documentation | Culturally-annotated documentation pages for all 16 trait categories |
| Cultural context | Every address, stamp series, and sticker character explained with provenance |
| Scrawl theme linkage | Every parcel's scrawl tagged to one of the 10 thematic clusters |
| Cross-linking | Every parcel links to its Mibera; every Mibera links to its parcel |
| Parcel graph | Dedicated `_codex/data/parcels-graph.json` with trait relationships |
| Navigation integration | `miparcels/` in manifest.json, scope.json, SUMMARY.md, CLAUDE.md |
| Honey Road lore | Collection name, description, and cultural references documented |
| Data fidelity | 0 trait mismatches between source JSON and generated .md files |

## 4. Source Data

**Location:** `/Users/mandy/Downloads/parcelsMetadataFinal/`
**Files:** 10,000 JSON files (named `1` through `10000`) + `_final_trait_report.json`

### Per-Parcel JSON Structure

```json
{
  "name": "Honey Road Parcel #1 from High Council 任侠団体 of 101 Bears",
  "description": "We're glad this made its way through the border. Kaironic time viscous like Honey. Mibera thoon. uART thooon.",
  "image": "ipfs://bafybeiexd3lj53j4gpm7rcvnvprlfaa5kqj7bi4zlh4tlj5og23j6fyese/1.png",
  "attributes": [
    { "trait_type": "base", "value": "Parcel 9" },
    { "trait_type": "scrawl", "value": "Let's get off because it's the end of the world" },
    ...
  ]
}
```

**IPFS CID (all parcels):** `bafybeiexd3lj53j4gpm7rcvnvprlfaa5kqj7bi4zlh4tlj5og23j6fyese`
**S3 image base:** `https://thj-assets.s3.us-west-2.amazonaws.com/parcels/parcelsImages/{N}.png`
**Shared identity:** All 10,000 parcels share the same name pattern ("Honey Road Parcel #N from High Council 任侠団体 of 101 Bears") and description.

### Trait Categories (15)

| Category | Unique Values | Present On | Description |
|----------|--------------|------------|-------------|
| base | 24 | All | Base parcel envelope design (Parcel 1–24) |
| normal addys | 14 | All | Delivery address labels (real locations with lore significance) |
| mibera return addy | 17 | All | Return address handwriting style |
| stamps | 41 | All | Postage stamps (real-world historical + Grateful Dead + elemental) |
| scrawl | 189 | All | Handwritten lore fragments (206 visual variants documented in fractures/miparcels/scrawl.md) |
| confetti | 71 | All | Primary confetti layer (elemental Jani, Tsuheji, Henlo beras, boarding passes) |
| confetti_second | 71 | Sparse | Second confetti layer |
| confetti_third | 71 | Sparse | Third confetti layer |
| confetti_fourth | 71 | Sparse | Fourth confetti layer |
| sticker1 | 24 | Sparse | Primary sticker (chibi characters, Puruhani, elemental Jani) |
| sticker1_second | 24 | Sparse | Secondary variant of sticker1 |
| sticker2 | 30 | Sparse | Second sticker (character portraits and pairings) |
| airmail | 42 | Sparse | International airmail labels (Welsh, Korean, Japanese, Indonesian, German, etc.) |
| uk orange | 4 | Sparse | Royal Mail Return To Sender stickers |
| big labels | 16 | Sparse | Large shipping labels (Grateful Dead House, Shulgin Foundation, USPS) |
| bigger misc | 18 | Sparse | Larger visual elements (Chibi Jani stamps, FRAGILE, URGENT, Air Letter Post) |

**Trait count per parcel:** 7–17 (median ~11). Sticker, confetti (layers 2–4), airmail, label, and misc traits are sparse.

### Trait Report

`_final_trait_report.json` contains the complete distribution: every trait category mapped to every value with count of parcels that have it.

## 5. Cultural Layers

The parcel traits are not random generative noise. Every category encodes deliberate cultural, political, and lore-specific references. This section maps the threads that the trait documentation pages must capture.

### 5.1 The Addresses — Where the Parcels Ship

The 14 "normal addys" are delivery addresses pointing to 5 real-world locations. Each is a deliberate choice:

| Location | Variants | Cultural Significance |
|----------|----------|----------------------|
| **Alexander Shulgin Research Institute** | 2 (clean + smudged) | Sasha Shulgin — "the Godfather of Psychedelics." Synthesized MDMA, 2C-B, and hundreds of other compounds. Author of PiHKAL and TiHKAL. His lab was his home in Lafayette, California. The address on the parcel is a pilgrimage marker — sending mail to the source of psychedelic chemistry. |
| **USP Terre Haute** | 4 variants | United States Penitentiary, Terre Haute, Indiana. Home of the federal death row. Site of Timothy McVeigh's execution (2001). Sending a parcel here = sending art to the belly of the carceral state. |
| **Grateful Dead House** | 2 (clean + smudged) | 710 Ashbury Street, San Francisco. The Dead's communal home during the Summer of Love (1967). Epicenter of the psychedelic counterculture. |
| **Big Nig's House** | 4 variants | Underground culture reference. The name preserved faithfully as part of the art. |
| **Dow Chemical Co** | 2 (clean + smudged) | Manufacturer of Agent Orange, napalm, and Saran Wrap. The corporate-industrial complex as destination — sending parcels to the machine. |

**Pattern:** Psychedelic lab, federal prison, counterculture commune, underground figure, military-industrial corporation. The addresses map a moral geography — where you send things says everything about what world you live in.

The 17 "mibera return addy" values are handwriting styles for the return address: Childish, Elegant Cursive, Mirrored, Cryptic Cursive, Too Smol, Proud, etc. These describe how Mibera writes its own name on the envelope.

### 5.2 The Stamps — Real Postage, Real History

The 41 stamp designs cluster into 7 series, each drawn from real-world postal history:

| Series | Stamps | Cultural Significance |
|--------|--------|----------------------|
| **Grateful Dead Montserrat** | 8 variants | Montserrat (Caribbean island) actually issued official Grateful Dead postage stamps in 1996. The intersection of counterculture and state-sanctioned postal art. |
| **Canada Bear Stamps** | 5 variants | Polar Bear (Ursus Maritimus, 1953) and Grizzly Bear (Ursus Arctos Horribilis, 1976). Bear iconography bridging real-world wildlife conservation and Berachain. |
| **Sinn Fein Forerunner** | 4 variants | Pre-independence Irish revolutionary stamps from 1907. Not official state postage — propaganda labels produced by Sinn Fein before Irish independence. Artifacts of a nation that didn't yet exist claiming the right to issue its own stamps. |
| **Irish Free State (Saorstat Eireann)** | 4 variants (red + green) | 1922 overprints — British stamps with "Saorstat Eireann" (Irish Free State) printed over the king's head. The act of overprinting as political erasure and reclamation. |
| **Australian Aboriginal Art** | 8 variants | Real stamps featuring named First Nations artists and their communities: **George Milpurrurru** (Ganalbingu) — Goose Egg Hunt; **Tim Leura Tjapaltjarri** — Hunter Dreaming (1977); **Jack Wunuwun** (Murrungun) — Barrdje Bunpa Yam Plants; **Rover Thomas** (Wangkajunga/Kukatja) — Kalumpiwarra Ngulalintji. Indigenous sovereignty expressed through the postal system of the colonizer state. |
| **Prevent Drug Abuse 1971** | 4 variants | US postage stamp from the War on Drugs era. Ironic juxtaposition on a parcel shipped from Alexander Shulgin's lab and the Grateful Dead House. |
| **Elemental Jani** | 2 variants (rectangle + square) | Jani — a central Mibera lore figure — rendered as elemental postage. The only non-real-world stamp. |

**Thread:** Revolutionary stamps (Irish independence), indigenous art on colonial postage (Aboriginal Australia), counterculture iconography (Grateful Dead), anti-drug propaganda repurposed ironically, and bear stamps that bridge the real and the Berachain. The stamp layer is a compressed history of resistance, art, and bureaucratic subversion.

### 5.3 The Stickers — Mibera Characters

Three sticker slots feature the Mibera character roster in chibi and portrait form:

**Sticker1 (24 values):** Chibi-style character stickers — Jani in 7 poses (driving, flex, phone, sitting, rocket, water surf, thumbsup), Jani expressions (aww, greetings), Puruhani in 6 colors (blue, red, yellow, green, purple × 2 each), Chibi Akane, Chibi Nemu in a box.

**Sticker2 (30 values):** Character portraits and pairings — solo characters (Akane, Nemu, Ruan, Kaori, Eun, Jani) plus relationship pairings (Ruan with Kaori, Ruan with Eun, Akane with Nemu, Chibi Nemu with Chibi Kaori, etc.) and the group shot (Chibi Jani with Akane Kaori Eun Nemu Ruan). These aren't just decorative — they map the social graph of the Mibera character universe.

**Characters identified:** Jani, Akane, Nemu, Ruan, Kaori, Eun, Puruhani, Tsuheji.

### 5.4 The Confetti — Elemental System

71 confetti designs shared across 4 layers cluster into sub-families:

| Sub-family | Count | Description |
|------------|-------|-------------|
| **Elemental Jani** | ~15 | Jani rendered in five Chinese elements: Fire, Water, Earth, Metal, Wood. Parallels the Mibera element system. |
| **Tsuheji Elements** | ~10 | Tsuheji (character) in the same five-element system. |
| **Henlo Animals** | ~12 | Bear-adjacent animals: Black Bear, Brown Bera, Polar Bera, Black Bera, Red Panda, Panda. "Henlo" is the Berachain greeting. |
| **Boarding Passes** | ~6 | Purple, Blue, Yellow boarding passes — travel documents for the Honey Road. |

The elemental confetti ties the parcel art to the same Wood/Fire/Earth/Metal/Water system used in the Mibera lore, expressed through characters rather than abstract symbols.

### 5.5 The Airmail Labels — Global Postal Network

42 airmail labels from 8 national postal systems:

| System | Language | Notable Detail |
|--------|----------|----------------|
| **Welsh Post** | Welsh (AWYR par avion Post Brenhinol) | Welsh-language postal service — minority language on official mail |
| **Royal Mail** | English | British empire's postal system |
| **Irish Air Mail** | Irish (Aerphost) | Irish-language priority labels |
| **Korean Air Mail** | Korean (Par Avion) | East Asian representation |
| **Japanese Air Mail** | Japanese | |
| **Indonesian Air Mail** | Indonesian (CEPAT TEPAT AMAN — "Fast, Accurate, Safe") | Southeast Asian representation |
| **Deutsche PRIORITY** | German (Prioritaire Luftpost) | European continental |
| **Vintage Canadian Air Mail** | English/French (Par Avion) | |
| **USPS Surface Transportation Only** | English | Ground shipping — the anti-airmail |
| **Atlantic Ocean Label IIB April 1997** | English | Specific historical air route label |

Plus 6 FRAGILE Handle With Care variants — care instructions as art.

**Thread:** A global postal network. The parcels move through Welsh, Irish, Korean, Japanese, Indonesian, German, Canadian, British, and American postal systems. Minority languages (Welsh, Irish) appear alongside colonial languages. The parcel is an international object.

### 5.6 The Big Labels & Misc

**Big Labels (16):** Shipping labels from the Grateful Dead House (5 variants), the Shulgin Foundation & Shulgin Farm (4 variants — Alexander Shulgin's actual research facility in Lafayette, CA), General Wade's Military Roads (18th-century British roads built to control the Scottish Highlands after the Jacobite risings), and USPS customs labels with Mibera-themed contents declarations (Mibera???, Supplements and Vitamins, Mibera Stuff, Mibera Star, DVD, Shirt).

**Bigger Misc (18):** Chibi Jani postage stamps (3 variants), FRAGILE/URGENT/Handle with Care labels, Air Letter Post, and "Eire Amhain Ireland Only ParcelPost" — Irish-language domestic-only restriction.

### 5.7 "Honey Road" — The Collection Name

The metadata itself is lore:

- **"Honey Road"** — Silk Road (the ancient trade route AND the darknet marketplace) + Honey (Berachain's native concept). The parcels travel the Honey Road.
- **"High Council 任侠団体 of 101 Bears"** — 任侠団体 (ninkyō dantai) is the formal Japanese term for yakuza syndicates, literally "chivalrous organization." The High Council is a governing body in the Mibera lore. 101 Bears references the founding community.
- **"We're glad this made its way through the border."** — The parcel as contraband. It crossed something.
- **"Kaironic time viscous like Honey."** — Time philosophy (Kairos vs Chronos) + viscosity of honey = time that flows slowly, stickily, non-linearly.
- **"Mibera thoon. uART thooon."** — "thoon" as lore-specific slang. uART = a reference to the art layer.

This is not just a collection name — it's a compressed lore statement. The README must document it.

## 6. Deliverables

### 6.1 Individual Parcel Entries (`miparcels/`)

10,000 markdown files at `miparcels/{NNNN}.md` (zero-padded 4-digit IDs).

**Format:** YAML frontmatter with all traits + scrawl theme tag + markdown body with image, trait table, and cross-link.

Example target for `miparcels/0001.md`:

```yaml
---
id: 1
type: miparcel
base: "Parcel 9"
normal_addys: "USP Terre Haute Smudged 2"
mibera_return_addy: "Childish"
stamps: "Canada Polar Bear Ursus Maritimus 1953 Two Stamps"
sticker2: "Nemu"
bigger_misc: "Fragile 2"
scrawl: "Let's get off because it's the end of the world"
scrawl_theme: "Love Letters"
confetti: "Tsuheji Fire Element 4"
confetti_second: "Yellow Boarding Pass 6"
confetti_third: "Wood Elemental Jani 3"
confetti_fourth: "Henlo Brown Bera 1"
airmail: "FRAGILE Handle With Care 6"
uk_orange: "Royal Mail Return To Sender 3"
image: "https://thj-assets.s3.us-west-2.amazonaws.com/parcels/parcelsImages/1.png"
ipfs_image: "ipfs://bafybeiexd3lj53j4gpm7rcvnvprlfaa5kqj7bi4zlh4tlj5og23j6fyese/1.png"
---

# MiParcel #1

![MiParcel #1](https://thj-assets.s3.us-west-2.amazonaws.com/parcels/parcelsImages/1.png)

| Trait | Value |
|-------|-------|
| Base | Parcel 9 |
| Normal Addys | USP Terre Haute Smudged 2 |
| Mibera Return Addy | Childish |
| Stamps | Canada Polar Bear Ursus Maritimus 1953 Two Stamps |
| Sticker 2 | Nemu |
| Bigger Misc | Fragile 2 |
| Scrawl | Let's get off because it's the end of the world |
| Confetti | Tsuheji Fire Element 4 |
| Confetti (2nd) | Yellow Boarding Pass 6 |
| Confetti (3rd) | Wood Elemental Jani 3 |
| Confetti (4th) | Henlo Brown Bera 1 |
| Airmail | FRAGILE Handle With Care 6 |
| UK Orange | Royal Mail Return To Sender 3 |

**Scrawl Theme:** [Love Letters](traits/scrawl.md#love-letters) · [Full scrawl analysis →](../fractures/miparcels/scrawl.md#love-letters)

**Mibera:** [Mibera #1](../miberas/0001.md)
```

**Key conventions:**
- Frontmatter keys use snake_case (normalizing `trait_type` spaces/numbers)
- Null/missing traits are omitted from frontmatter (not set to null)
- `scrawl_theme` is a derived field: the thematic cluster from scrawl.md that this parcel's scrawl text belongs to
- Image uses S3 URL for display, IPFS URL preserved in frontmatter
- Cross-link to corresponding Mibera at bottom
- Scrawl theme links to both the trait page section and the deep analysis

### 6.2 Mibera Backlinks

Add a `| Parcel |` row to all 10,000 mibera markdown tables linking to the corresponding parcel entry. Also add `parcel: N` to each mibera's YAML frontmatter.

### 6.3 Parcel Trait Pages (`miparcels/traits/`)

Per-category documentation pages with **cultural context** — not just lists of values with counts, but explanations of provenance, lore significance, and artistic intent.

**Structure:**
```
miparcels/traits/
  README.md            — Trait category index with cultural layer overview
  base.md              — 24 base envelope designs
  normal-addys.md      — 14 delivery addresses with location histories
  return-addys.md      — 17 return address handwriting styles
  stamps.md            — 41 stamps grouped by series with historical context
  scrawl.md            — 189 scrawl texts with theme cluster tags (links to deep docs)
  stickers.md          — 78 sticker values with character identification
  confetti.md          — 71 confetti designs grouped by sub-family
  airmail.md           — 42 international airmail labels with postal system context
  uk-orange.md         — 4 Royal Mail Return To Sender stickers
  big-labels.md        — 16 large labels with location/cultural context
  bigger-misc.md       — 18 miscellaneous elements
```

**Cultural context requirements by page:**

| Page | Required Context |
|------|-----------------|
| `normal-addys.md` | Full provenance for each of the 5 real-world locations (Shulgin, Terre Haute, Grateful Dead, Big Nig's, Dow Chemical). Why these addresses. What world they map. |
| `stamps.md` | Each of the 7 stamp series documented: Grateful Dead Montserrat (1996 stamps), Sinn Fein Forerunner (1907 revolutionary labels), Irish Free State overprints (1922), Aboriginal art (named artists + communities), Prevent Drug Abuse 1971, Canadian bears, Elemental Jani. |
| `stickers.md` | Character identification for all named characters (Jani, Akane, Nemu, Ruan, Kaori, Eun, Puruhani, Tsuheji). Relationship pairings documented. |
| `confetti.md` | Sub-family analysis: elemental system (Wood/Fire/Earth/Metal/Water), Henlo animals, boarding passes. Connection to Mibera element system. |
| `airmail.md` | Postal systems by nation. Minority language labels (Welsh, Irish) noted. |
| `big-labels.md` | Shulgin Foundation/Farm documented. General Wade's Military Roads explained. USPS content declarations catalogued. |
| `scrawl.md` | Each of the 189 texts tagged to one of the 10 thematic clusters from fractures/miparcels/scrawl.md. Cluster descriptions linked. Count mismatch (189 texts vs 206 visual variants) explained. |

### 6.4 Honey Road Lore (`miparcels/README.md`)

The README is not just an index — it documents the collection identity:

- **Honey Road** etymology: Silk Road + Honey (Berachain)
- **High Council 任侠団体** meaning: ninkyō dantai, chivalrous organization / yakuza syndicates
- **101 Bears** reference
- **Shared description** analysis: "Kaironic time viscous like Honey. Mibera thoon. uART thooon."
- **The parcel as art object**: sealed envelopes as the first thing holders see — anticipation in physical form
- Trait category overview with links to trait pages
- Navigation links

### 6.5 Scrawl Theme Mapping

A lookup table mapping each of the 189 scrawl text values to one of the 10 thematic clusters documented in `fractures/miparcels/scrawl.md`:

1. Rave & K-Hole (28 visual variants)
2. Milady-Mibera Duality (26)
3. Cosmology (23)
4. Lore Figures (21)
5. The Choose Manifesto (19)
6. Refusal (17)
7. Kaironic Time (15)
8. Love Letters (14)
9. True Names & Identity (14)
10. Mission & Rescue (11)

This mapping is used by the generator script to populate `scrawl_theme` in every parcel's frontmatter. Some texts may appear in scrawl.md with different capitalization or minor variations — the mapping must handle fuzzy matching.

**Note:** 189 unique text values in metadata vs 206 entries in scrawl.md. The difference is that scrawl.md documents visual variants (same text with different style/placement/weight/color). The metadata tracks text content only. The trait page must explain this distinction.

### 6.6 Parcel Knowledge Graph (`_codex/data/parcels-graph.json`)

Dedicated graph (NOT merged into graph.json) capturing:
- **Nodes:** 10,000 parcels + all unique trait values across all categories + 10 scrawl theme clusters + 8 characters (Jani, Akane, Nemu, etc.)
- **Edges:** parcel → trait value (HAS_TRAIT), parcel → scrawl theme (SCRAWL_THEME), parcel ↔ mibera (CORRESPONDS_TO), trait value → character (FEATURES_CHARACTER), confetti → element (ELEMENT_OF)
- **Metadata on edges:** trait_type category for each HAS_TRAIT edge

### 6.7 Navigation & Meta Integration

| File | Update |
|------|--------|
| `manifest.json` | Add `miparcel` entity type with count, directory, fields |
| `_codex/data/scope.json` | Add `miparcel` to tracked entities (count: 10,000) |
| `SUMMARY.md` | Add MiParcels section |
| `CLAUDE.md` | Add lookup pattern: `miparcels/{NNNN}.md` |
| `llms.txt` / `llms-full.txt` | Add parcel lookup pattern |
| `miparcels/README.md` | Lore + index page (see 6.4) |
| `fractures/miparcels.md` | Update stickers/labels from "coming soon" to links to new trait pages |

### 6.8 Data Exports

| File | Content |
|------|---------|
| `_codex/data/parcels.jsonl` | 10,000 lines, one JSON object per parcel (including scrawl_theme) |
| `_codex/data/parcels-trait-report.json` | Copy of source trait report for reference |

## 7. Scope Boundaries

### In Scope
- 10,000 individual parcel entries with full trait data and scrawl theme tags
- Culturally-annotated per-category trait pages
- Honey Road lore documentation in README
- Scrawl-to-theme mapping (189 texts → 10 clusters)
- Dedicated parcel knowledge graph
- Cross-links in both directions (parcel ↔ mibera)
- Navigation/meta file updates
- JSONL data export

### Out of Scope
- Merging parcel data into existing `graph.json` (separate graph)
- Browse-by pages for parcels (future cycle if needed)
- Per-trait-value individual pages (trait pages are per-category with all values listed)
- Ownership/on-chain parcel state
- Vending machine / shadow trait integration for parcels
- Moving or modifying `fractures/miparcels/scrawl.md` (preserved in place, linked)

## 8. Technical Approach

### Generator Script (`_codex/scripts/generate-parcels.py`)

Reads the source JSON files and generates:
1. 10,000 `miparcels/{NNNN}.md` files with YAML frontmatter + markdown body
2. `miparcels/README.md` lore + index page
3. `miparcels/traits/` documentation pages with cultural context
4. `_codex/data/parcels.jsonl` export
5. `_codex/data/parcels-graph.json`

The script includes a scrawl-theme lookup table (189 text → cluster mappings) built by cross-referencing the source scrawl values against the thematic clusters in `fractures/miparcels/scrawl.md`.

### Mibera Backlink Script (`_codex/scripts/add-parcel-backlinks.py`)

Patches all 10,000 `miberas/{NNNN}.md` files to:
1. Add `parcel: N` to YAML frontmatter
2. Add `| Parcel |` row to the markdown trait table

Includes dry-run mode and validation against existing audit tools.

### Cultural Context Authoring

The trait page cultural context (Section 5 of this PRD) is the source material for the trait documentation pages. The generator script uses this PRD as input for the cultural context sections, supplemented by the trait report counts. Sections requiring user verification (e.g., Big Nig's House reference, specific artist attributions) should be flagged for review.

### Existing Content

The `fractures/miparcels/scrawl.md` documentation (400+ lines of curated thematic analysis) is **preserved in place** and linked from the new trait pages. It is not duplicated or moved.

## 9. Risks

| Risk | Mitigation |
|------|------------|
| Scrawl text → theme mapping may have edge cases | Fuzzy matching + manual review of unmapped texts |
| Scrawl count mismatch (189 in metadata vs 206 in existing docs) | Document the distinction (text vs visual variant) explicitly in trait page |
| Cultural context for some traits needs user verification | Flag uncertain attributions; ask user before publishing |
| 10K file generation could be slow | Generator script with progress output; validate sample before full run |
| Mibera backlink injection could break existing formatting | Dry-run mode on backlink script; validate with existing audit tools |
| Some character names (Puruhani, Tsuheji) may need lore context we don't have | Document what's visible in the data; flag for user enrichment |

## 10. Dependencies

- Source metadata at `/Users/mandy/Downloads/parcelsMetadataFinal/` (10,001 files)
- Existing codex structure and conventions (YAML frontmatter, markdown tables, link format)
- S3 image URLs at `thj-assets.s3.us-west-2.amazonaws.com/parcels/parcelsImages/`
- Existing `fractures/miparcels/scrawl.md` (preserved, not modified)
- Existing mibera files for backlink injection (10,000 files)

---

> **Next:** `/architect` to design the generation pipeline, file schemas, and scrawl-theme mapping strategy.
