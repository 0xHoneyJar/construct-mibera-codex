# Festival Zones Vocabulary

*Structured spatial vocabulary for narrative-bot consumers of the Mibera Codex.*

---

## Purpose

Narrative agents (e.g. freeside-ruggy) need per-zone vocabulary to author environment descriptions at runtime. Static descriptions hit the Westworld-loop anti-pattern — the same scene plays on repeat. This file provides **vocabulary, not scripts**: the persona authors from these primitives combined with real-time state.

Each zone exposes three layers:

| Layer | What it provides |
|-------|-----------------|
| **Lynch primitives** | Spatial elements — paths, edges, districts, nodes, landmarks |
| **KANSEI tokens** | Sensory texture — warmth, motion, shadow, easing, density, sound |
| **Archetype anchor** | The codex archetype the zone embodies |

Lynch primitives follow Kevin Lynch's *The Image of the City* (1960) — five spatial elements that make environments legible and navigable. KANSEI tokens encode the felt texture of a space, not its geometry.

---

## Zone Index

| Zone | Slug | Archetype | Essence |
|------|------|-----------|---------|
| Stonehenge | `stonehenge` | *All* | Monolithic convergence — the shared ground |
| Bear-cave | `bear-cave` | Freetekno | Low-lit ritual warehouse |
| El-dorado | `el-dorado` | Milady | Neon-gilt treasure bazaar |
| Owsley-lab | `owsley-lab` | Acidhouse | Fluorescent synthesis floor |
| The Warehouse | `the-warehouse` | Chicago/Detroit | Sweat-dark birthplace of house |

---

## stonehenge

**Archetype:** All (monolithic, spans every tribe)
**Era resonance:** Timeless — pre-rave, pre-history, the gathering impulse itself
**Essence:** Dawn-grey stone circle. The festival's shared axis. Not owned by any archetype — where all four converge before dispersing to their zones.

### Lynch Primitives

| Element | Vocabulary |
|---------|-----------|
| **Paths** | Processional stone avenues, ley-line corridors between stages, trampled grass desire paths |
| **Edges** | Standing-stone perimeter, fog boundary, horizon line where sky meets field |
| **Districts** | The henge circle (ceremonial center), the avenue approach, outer campground ring |
| **Nodes** | Altar stone (center), sunrise gap between trilithons, bonfire gathering points |
| **Landmarks** | The trilithons, the heel stone, the slaughter stone, the aubrey holes |

### KANSEI Tokens

| Token | Value | Notes |
|-------|-------|-------|
| **Warmth** | 0.3 — cool | Pre-dawn chill, stone-cold surfaces, breath visible |
| **Motion** | Panoramic | Slow sweeping gaze, geological time, clouds passing over monoliths |
| **Shadow** | Mid | Open sky, diffused — shadows cast by stone, not enclosure |
| **Easing** | Objective | Observational distance, wide-angle, documentary |
| **Density** | Sparse | Open ground, vast sky-to-structure ratio |
| **Sound** | Wind through stone gaps, distant bass from other zones, footsteps on packed earth |

---

## bear-cave

**Archetype:** [Freetekno](archetypes.md#freetekno)
**Era resonance:** Early-Late 90s — Castlemorton, Spiral Tribe, the Criminal Justice Act and everything after
**Essence:** Deep in the tree line, past the generator perimeter. UV strips on cable. Tea and speed and someone's dog asleep by the fire barrel. The rig hasn't stopped since Thursday.

### Lynch Primitives

| Element | Vocabulary |
|---------|-----------|
| **Paths** | Narrow tunnels lit by UV strips, cable-strewn corridors, muddy ruts between rigs, torch-lit trails through woods |
| **Edges** | Tree line, sound-system wall of bass, generator perimeter, the point where torchlight gives out |
| **Districts** | Main rig clearing, chill-out zone (tarps and cushions), tea stall cluster, vehicle circle (vans and converted ambulances) |
| **Nodes** | Speaker stack, fire barrel, DJ position behind the rig, kettle on a camp stove |
| **Landmarks** | The Spiral Tribe banner, the tallest stack, the burnt-out van that's always been there, the information tent |

### KANSEI Tokens

| Token | Value | Notes |
|-------|-------|-------|
| **Warmth** | 0.7 — warm | Body heat in a crowd, fire-barrel glow, shared blankets |
| **Motion** | 700ms — ritual | Slow head-nods, fire-flicker rhythm, unhurried — nobody's going anywhere |
| **Shadow** | Deep | Near-total darkness punctuated by UV, torch beams, cigarette cherries |
| **Easing** | Intimate | Close-range, eye-contact distance, whispered-over-bass |
| **Density** | Medium-thick | Clustered around rigs, thinning toward tree line |
| **Sound** | Relentless kick drum through leaves, generator hum, dog bark, kettle whistle, someone laughing in the dark |

---

## el-dorado

**Archetype:** [Milady](archetypes.md#milady)
**Era resonance:** Current — network spirituality, post-ironic aspiration, the screen as altar
**Essence:** Everything glows and everything's for sale. Neon kanji over velvet rope. The treasure is real but the map keeps changing. Somewhere between a shrine and a night market.

### Lynch Primitives

| Element | Vocabulary |
|---------|-----------|
| **Paths** | Neon-lit market alleys, rope bridges between platforms, glowing stairways, QR-code breadcrumb trails |
| **Edges** | Velvet rope lines, holographic barriers, screen walls cycling Remilia art, the drop-off where the platform ends |
| **Districts** | The bazaar (merch and mints), the shrine (projection-mapped devotional space), the viewing deck, the catboy lounge |
| **Nodes** | The golden throne, the display case, the bidding altar, the selfie mirror |
| **Landmarks** | The neon kanji sign, the vault door, the giant Milady projection, the wishing well (drop tokens in) |

### KANSEI Tokens

| Token | Value | Notes |
|-------|-------|-------|
| **Warmth** | 0.5 — neon | Neither warm nor cool — synthetic, screen-temperature |
| **Motion** | 200ms — snap | Quick cuts, swipe-speed, notification cadence, dopamine timing |
| **Shadow** | Mid | Lit by screens and neon — shadows are cast by light sources, not absence |
| **Easing** | Playful | Bouncy, overshoot, emoji-logic, irony-coated sincerity |
| **Density** | High | Maximalist visual clutter, market energy, everything competing for attention |
| **Sound** | Notification chimes layered over hyperpop, crowd murmur, someone saying "gm", cash register ka-ching |

---

## owsley-lab

**Archetype:** [Acidhouse](archetypes.md#acidhouse)
**Era resonance:** Late 90s / 2000s — Second Summer of Love afterglow, PLUR, the smiley face as sigil
**Essence:** Fluorescent tubes and dripping condensation. Everything hums at 440Hz. The periodic table on the wall but the elements have been renamed. Someone left a copy of PiHKAL on the centrifuge.

### Lynch Primitives

| Element | Vocabulary |
|---------|-----------|
| **Paths** | Fluorescent-lit corridors, grated metal walkways, dripping pipe tunnels, paths marked with smiley-face stickers |
| **Edges** | Glass partition walls, chemical-spill tape perimeters, ventilation grate boundaries, the threshold where fluorescent light meets blacklight |
| **Districts** | The synthesis floor (main dance area), the greenhouse (chill zone, actual plants), the testing chamber (immersive AV), the library (zine table, harm reduction) |
| **Nodes** | The centrifuge (center-floor installation), the microscope station (close-looking art), the dosing window (bar/distribution), the reagent rack |
| **Landmarks** | The periodic table mural (elements renamed after molecules), the crystal display, the Owsley portrait, the giant Erlenmeyer flask |

### KANSEI Tokens

| Token | Value | Notes |
|-------|-------|-------|
| **Warmth** | 0.4 — ethereal | Cool fluorescent wash, clinical undertone, warmth only from bodies |
| **Motion** | 2000ms — breathing | Slow pulsing, come-up pacing, time-dilation, the 20-minute track |
| **Shadow** | Deep | UV and blacklight create deep contrast — things glow or they vanish |
| **Easing** | Otherworldly | Sine-wave, liquid, no hard edges, everything melts into everything |
| **Density** | Low-medium | Spacious, room to move, room to lie down, room to stare at your hand |
| **Sound** | 303 acid line, white noise washes, dripping water, heartbeat kick, someone reading Shulgin aloud over the PA |

---

## the-warehouse

**Archetype:** [Chicago/Detroit](archetypes.md#chicagodetroit)
**Era resonance:** Early 80s — The Warehouse, Music Box, abandoned auto plants, the birth of house
**Essence:** Concrete floor, steel columns, no decoration that wasn't already here. The building was a factory, then it was nothing, now Ron Hardy is behind the decks and 400 people are losing their minds. The genre is named after this room.

### Lynch Primitives

| Element | Vocabulary |
|---------|-----------|
| **Paths** | Loading-dock ramps, concrete corridors, fire-escape stairwells, freight-elevator shafts repurposed as light wells |
| **Edges** | Roller-shutter doors (half-open to the street), chain-link fencing, exposed brick walls sweating with condensation, the line where streetlight ends and bass begins |
| **Districts** | The main floor (open warehouse span, columns as the only structure), the balcony (mezzanine, looking down), the back room (smaller, darker, deeper), the parking lot (cool-down, smoking, dawn) |
| **Nodes** | The DJ booth (elevated, minimal — a table and two turntables), the 303 on a milk crate, the water fountain, the single working bathroom |
| **Landmarks** | The industrial ceiling fan (always spinning), the freight elevator (permanently open), the fire exit sign (the only signage), the Chosen Few banner |

### KANSEI Tokens

| Token | Value | Notes |
|-------|-------|-------|
| **Warmth** | 0.8 — hot | Body heat in a box, no ventilation, sweat on concrete, radiator-pipe warmth |
| **Motion** | 400ms — pulse | Relentless 4/4, mechanical, assembly-line precision, the beat that built the genre |
| **Shadow** | Deep | One light on the DJ, everything else is silhouette and strobe-flash |
| **Easing** | Raw | No smoothing, no irony, no mediation — direct, physical, undeniable |
| **Density** | High | Packed floor, shoulder-to-shoulder, the crowd as a single organism |
| **Sound** | 808 kick through concrete, Ron Hardy's reel-to-reel edits, crowd vocals, hand-claps, squeaking sneakers on wet floor, the door opening and street noise rushing in |

---

## Usage Notes

### For narrative agents

- **Compose, don't recite.** These primitives are ingredients. The persona selects and combines based on real-time state (time of day, crowd energy, recent events). Never dump an entire zone description.
- **Cross-zone bleed is valid.** A Mibera walking from bear-cave to the-warehouse passes through transitional space. Mix primitives at boundaries.
- **KANSEI tokens are ranges, not constants.** A bear-cave at 4am is warmer (0.8) than at setup (0.4). Use the base value as center of gravity.
- **Sound is ambient, not soundtrack.** Layer environmental sounds under music references, not over them.

### Codex integration

- Archetype anchors link to [`core-lore/archetypes.md`](archetypes.md)
- Drug/molecule references draw from [`traits/overlays/molecules/`](../traits/overlays/molecules/)
- Ancestor context available at [`core-lore/ancestors/`](ancestors/)

---

## References

- Kevin Lynch, *The Image of the City* (1960) — spatial legibility framework
- Soju / freeside-ruggy creative direction — initial KANSEI vectors
- [Issue #51](https://github.com/0xHoneyJar/construct-mibera-codex/issues/51) — proposal origin

---
