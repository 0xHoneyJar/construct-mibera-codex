/**
 * ZoneBrowse — Initiation Ritual grimoire browse.
 *
 * The 5 festival zones — stonehenge, bear-cave, el-dorado,
 * owsley-lab, the-warehouse — rendered as cards with archetype
 * anchor, era resonance, essence, KANSEI snapshot, and Lynch
 * primitives summary.
 *
 * Data inlined from core-lore/festival-zones-vocabulary.md.
 * Stacked layout (single column) since each zone carries dense
 * vocabulary — readability over density.
 */

type Zone = {
  slug: string;
  name: string;
  emoji: string;
  archetype: string;
  era: string;
  essence: string;
  warmth: string;
  motion: string;
  density: string;
  sound: string;
  landmarks: string[];
};

const ZONES: Zone[] = [
  {
    slug: "stonehenge",
    name: "Stonehenge",
    emoji: "🪨",
    archetype: "All",
    era: "Timeless — pre-rave, pre-history, the gathering impulse itself",
    essence:
      "Dawn-grey stone circle. The festival's shared axis. Not owned by any archetype — where all four converge before dispersing to their zones.",
    warmth: "0.3 — cool · pre-dawn chill, breath visible",
    motion: "Panoramic — slow sweeping gaze, geological time",
    density: "Sparse — open ground, vast sky-to-structure ratio",
    sound: "Wind through stone gaps, distant bass from other zones, footsteps on packed earth",
    landmarks: [
      "The trilithons",
      "The heel stone",
      "The slaughter stone",
      "The aubrey holes",
    ],
  },
  {
    slug: "bear-cave",
    name: "Bear-cave",
    emoji: "🐻",
    archetype: "Freetekno",
    era: "Early-Late 90s — Castlemorton, Spiral Tribe, post-Criminal Justice Act",
    essence:
      "Deep in the tree line, past the generator perimeter. UV strips on cable. Tea and speed and someone's dog asleep by the fire barrel. The rig hasn't stopped since Thursday.",
    warmth: "0.7 — warm · body heat in a crowd, fire-barrel glow",
    motion: "700ms — ritual · slow head-nods, fire-flicker rhythm",
    density: "Medium-thick — clustered around rigs, thinning toward tree line",
    sound: "Relentless kick drum through leaves, generator hum, dog bark, kettle whistle",
    landmarks: [
      "The Spiral Tribe banner",
      "The tallest stack",
      "The burnt-out van that's always been there",
      "The information tent",
    ],
  },
  {
    slug: "el-dorado",
    name: "El-dorado",
    emoji: "🌅",
    archetype: "Milady",
    era: "Current — network spirituality, post-ironic aspiration, the screen as altar",
    essence:
      "Everything glows and everything's for sale. Neon kanji over velvet rope. The treasure is real but the map keeps changing. Somewhere between a shrine and a night market.",
    warmth: "0.5 — neon · synthetic, screen-temperature",
    motion: "200ms — snap · quick cuts, swipe-speed, dopamine timing",
    density: "High — maximalist visual clutter, market energy",
    sound: "Notification chimes layered over hyperpop, crowd murmur, someone saying \"gm\", cash register ka-ching",
    landmarks: [
      "The neon kanji sign",
      "The vault door",
      "The giant Milady projection",
      "The wishing well",
    ],
  },
  {
    slug: "owsley-lab",
    name: "Owsley-lab",
    emoji: "🧪",
    archetype: "Acidhouse",
    era: "Late 90s / 2000s — Second Summer of Love afterglow, PLUR, the smiley face as sigil",
    essence:
      "Fluorescent tubes and dripping condensation. Everything hums at 440Hz. The periodic table on the wall but the elements have been renamed. Someone left a copy of PiHKAL on the centrifuge.",
    warmth: "0.4 — ethereal · cool fluorescent wash, clinical undertone",
    motion: "2000ms — breathing · slow pulsing, come-up pacing",
    density: "Low-medium — spacious, room to lie down, room to stare at your hand",
    sound: "303 acid line, white noise washes, dripping water, heartbeat kick, someone reading Shulgin aloud",
    landmarks: [
      "The periodic table mural",
      "The crystal display",
      "The Owsley portrait",
      "The giant Erlenmeyer flask",
    ],
  },
  {
    slug: "the-warehouse",
    name: "The Warehouse",
    emoji: "🏭",
    archetype: "Chicago/Detroit",
    era: "Early 80s — The Warehouse, Music Box, abandoned auto plants, the birth of house",
    essence:
      "Concrete floor, steel columns, no decoration that wasn't already here. The building was a factory, then it was nothing, now Ron Hardy is behind the decks and 400 people are losing their minds. The genre is named after this room.",
    warmth: "0.8 — hot · body heat in a box, no ventilation, sweat on concrete",
    motion: "400ms — pulse · relentless 4/4, assembly-line precision",
    density: "High — packed floor, shoulder-to-shoulder, the crowd as a single organism",
    sound: "808 kick through concrete, Ron Hardy's reel-to-reel edits, crowd vocals, hand-claps, squeaking sneakers",
    landmarks: [
      "The industrial ceiling fan",
      "The freight elevator",
      "The fire exit sign",
      "The Chosen Few banner",
    ],
  },
];

export function ZoneBrowse() {
  return (
    <div className="zone-browse">
      {ZONES.map((zone) => (
        <article key={zone.slug} className="zone-card">
          <header className="zone-card__head">
            <div className="zone-card__title-row">
              <span className="zone-card__emoji" aria-hidden>{zone.emoji}</span>
              <h2 className="zone-card__name">{zone.name}</h2>
              <code className="zone-card__slug">{zone.slug}</code>
            </div>
            <div className="zone-card__meta">
              <span className="zone-card__archetype">{zone.archetype}</span>
              <span className="zone-card__sep" aria-hidden>·</span>
              <span className="zone-card__era">{zone.era}</span>
            </div>
          </header>

          <p className="zone-card__essence">{zone.essence}</p>

          <section className="zone-card__kansei">
            <div className="zone-card__kansei-row">
              <div className="zone-card__kansei-label">Warmth</div>
              <div className="zone-card__kansei-value">{zone.warmth}</div>
            </div>
            <div className="zone-card__kansei-row">
              <div className="zone-card__kansei-label">Motion</div>
              <div className="zone-card__kansei-value">{zone.motion}</div>
            </div>
            <div className="zone-card__kansei-row">
              <div className="zone-card__kansei-label">Density</div>
              <div className="zone-card__kansei-value">{zone.density}</div>
            </div>
            <div className="zone-card__kansei-row">
              <div className="zone-card__kansei-label">Sound</div>
              <div className="zone-card__kansei-value">{zone.sound}</div>
            </div>
          </section>

          <section className="zone-card__landmarks">
            <div className="zone-card__section-label">Landmarks</div>
            <ul className="zone-card__landmarks-list" role="list">
              {zone.landmarks.map((lm) => (
                <li key={lm}>{lm}</li>
              ))}
            </ul>
          </section>
        </article>
      ))}
    </div>
  );
}
