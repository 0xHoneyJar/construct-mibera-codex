/**
 * ArchetypeBrowse — Clearpill vs Ravepill grimoire browse.
 *
 * The 4 archetypes — Freetekno, Milady, Chicago/Detroit, Acidhouse —
 * rendered as cards that match the parchment vocabulary. Each card
 * shows: name + era/zodiac/season header, locations, key figures,
 * fashion, drug + ancestor connections.
 *
 * Data inlined here from core-lore/archetypes.md. When the canon
 * shifts, edit this component (4 entries, easy to maintain). Future:
 * extract to a JSON data file shared with the MCP.
 */

type Archetype = {
  name: string;
  era: string;
  season: string;
  zodiac: string[];
  locations: string[];
  figures: string[];
  fashion: string;
  drugs: { modern: string[]; ancient: string[] };
  ancestors: string[];
};

const ARCHETYPES: Archetype[] = [
  {
    name: "Freetekno",
    era: "Early-Late 90s",
    season: "Summer",
    zodiac: ["Cancer", "Leo", "Virgo"],
    locations: [
      "Castlemorton (UK)",
      "London",
      "Stonehenge",
      "Amnesia & Pacha (Ibiza)",
      "Tonka at The Zap (Brighton)",
    ],
    figures: ["Spiral Tribe", "MF Doom", "DiY Collective", "DJ PGZ", "Frank Waln"],
    fashion:
      "Steampunk glasses · black graphic tees · monochromatic hoodie · military cargo jacket · camo hat · leather jacket · pilot cap · fluoro accessories · silver mask",
    drugs: {
      modern: ["LSD", "DMT", "Speed"],
      ancient: ["Khat", "Ayahuasca"],
    },
    ancestors: ["Aboriginal", "Native American", "Irish"],
  },
  {
    name: "Milady",
    era: "Current",
    season: "Winter",
    zodiac: ["Capricorn", "Aquarius", "Pisces"],
    locations: [
      "Remilia network",
      "Charlotte Fang's archive",
      "Network Spirituality circles",
    ],
    figures: ["Grimes", "Charlotte Fang", "Aum Shinrikyo (aesthetic)"],
    fashion:
      "Business suits · black t-shirts with Milady text · \"Mottega\" glasses · camo hat",
    drugs: {
      modern: ["LSD", "DMT", "Ketamine"],
      ancient: ["Khat", "Ayahuasca"],
    },
    ancestors: ["Hindu/Nepal", "Japanese", "Ethiopian", "Mongolian"],
  },
  {
    name: "Chicago/Detroit",
    era: "Early 80s",
    season: "Spring",
    zodiac: ["Aries", "Taurus", "Gemini"],
    locations: [
      "The Warehouse (Chicago)",
      "Music Box (Chicago)",
      "Abandoned Ford Factory (Michigan)",
    ],
    figures: [
      "Ron Hardy",
      "The Chosen Few DJs",
      "Lee \"Scratch\" Perry",
      "Sun Ra",
      "Marsha P. Johnson",
    ],
    fashion:
      "Industrial workwear · denim · leather · queer-club sartorial codes · house-warehouse uniform",
    drugs: {
      modern: ["MDMA", "Cocaine"],
      ancient: ["Tobacco", "Coca leaf"],
    },
    ancestors: ["African American", "Caribbean", "Mexican"],
  },
  {
    name: "Acidhouse",
    era: "Late 90s / 2000s",
    season: "Fall",
    zodiac: ["Libra", "Scorpio", "Sagittarius"],
    locations: [
      "Berlin warehouses",
      "UK clubs",
      "Acid party circuit",
    ],
    figures: ["Acid pioneers", "Underground Resistance offshoots"],
    fashion:
      "Smiley graphics · neon · oversized everything · acid-wash denim · happy hardcore visual codes",
    drugs: {
      modern: ["MDMA", "LSD"],
      ancient: ["Mescaline"],
    },
    ancestors: ["Acid lineage", "Rave underground"],
  },
];

export function ArchetypeBrowse() {
  return (
    <div className="archetype-browse">
      {ARCHETYPES.map((arch) => (
        <article key={arch.name} className="archetype-card">
          <header className="archetype-card__head">
            <h2 className="archetype-card__name">{arch.name}</h2>
            <div className="archetype-card__meta">
              <span className="archetype-card__era">{arch.era}</span>
              <span className="archetype-card__sep" aria-hidden>·</span>
              <span className="archetype-card__season">{arch.season}</span>
              <span className="archetype-card__sep" aria-hidden>·</span>
              <span className="archetype-card__zodiac">{arch.zodiac.join(" · ")}</span>
            </div>
          </header>

          <section className="archetype-card__section">
            <div className="archetype-card__section-label">Locations</div>
            <ul className="archetype-card__list" role="list">
              {arch.locations.map((loc) => (
                <li key={loc}>{loc}</li>
              ))}
            </ul>
          </section>

          <section className="archetype-card__section">
            <div className="archetype-card__section-label">Key Figures</div>
            <p className="archetype-card__figures">{arch.figures.join(" · ")}</p>
          </section>

          <section className="archetype-card__section">
            <div className="archetype-card__section-label">Fashion</div>
            <p className="archetype-card__fashion">{arch.fashion}</p>
          </section>

          <section className="archetype-card__section archetype-card__section--split">
            <div>
              <div className="archetype-card__section-label">Modern Drugs</div>
              <p className="archetype-card__chips">{arch.drugs.modern.join(" · ")}</p>
            </div>
            <div>
              <div className="archetype-card__section-label">Ancient Drugs</div>
              <p className="archetype-card__chips">{arch.drugs.ancient.join(" · ")}</p>
            </div>
          </section>

          <section className="archetype-card__section">
            <div className="archetype-card__section-label">Ancestor Connections</div>
            <p className="archetype-card__chips">{arch.ancestors.join(" · ")}</p>
          </section>
        </article>
      ))}
    </div>
  );
}
