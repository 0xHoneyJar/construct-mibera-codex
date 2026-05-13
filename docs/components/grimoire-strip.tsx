/**
 * GrimoireStrip — the seven grimoires as a horizontal row.
 *
 * Visual hero for the install page. The strip says, before any prose:
 * "this is what your agent gains." Each cover links to the volume's
 * primary tool. On narrow viewports the row scrolls horizontally so
 * every cover stays at a recognizable size — better to scroll than
 * to shrink the books to thumbnails.
 *
 * Image substrate: /grimoire/{1..7}.avif (already generated, used in
 * GrimoireShelf and ToolCard). Each book pairs with the canonical
 * mapping the rest of the docs uses.
 */

type Volume = {
  n: number;
  title: string;
  subtitle: string;
  href: string;
};

const VOLUMES: Volume[] = [
  { n: 1, title: "Introducing Mibera",   subtitle: "10 000 time-travellers",   href: "/tools/lookup_mibera" },
  { n: 2, title: "Clearpill vs Ravepill", subtitle: "4 rave tribes",            href: "/tools/lookup_archetype" },
  { n: 3, title: "Mibera Maker · I",     subtitle: "44 grails",                href: "/tools/lookup_grail" },
  { n: 4, title: "Network Mysticism",    subtitle: "score factors ↔ lore",     href: "/tools/lookup_factor" },
  { n: 5, title: "Initiation Ritual",    subtitle: "5 festival zones",         href: "/tools/lookup_zone" },
  { n: 6, title: "Mibera Maker · II",    subtitle: "every tribe, every zone",  href: "/tools/list_archetypes" },
  { n: 7, title: "Mibera Maker · III",   subtitle: "is this canon?",           href: "/tools/validate_world_element" },
];

export function GrimoireStrip() {
  return (
    <nav className="grimoire-strip" aria-label="The seven grimoires">
      <ol className="grimoire-strip__row" role="list">
        {VOLUMES.map((vol) => (
          <li key={vol.n} className="grimoire-strip__item">
            <a href={vol.href} className="grimoire-strip__cover-link">
              <img
                src={`/grimoire/${vol.n}.avif`}
                alt=""
                className="grimoire-strip__cover"
                loading="lazy"
                decoding="async"
                width={200}
                height={267}
              />
              <span className="grimoire-strip__roman" aria-hidden>
                {romanize(vol.n)}
              </span>
              <span className="grimoire-strip__title">{vol.title}</span>
              <span className="grimoire-strip__subtitle">{vol.subtitle}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function romanize(n: number): string {
  return ["I", "II", "III", "IV", "V", "VI", "VII"][n - 1] ?? String(n);
}
