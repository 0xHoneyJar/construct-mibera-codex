/**
 * GrimoireShelf — one book + the tools that fall under it.
 *
 * Layout: book image on the left, tool list on the right. Each tool row
 * is `name · hint` linked to the tool's page. SSR-safe; styling lives in
 * /global.css.
 *
 * Usage in MDX:
 *
 *   <GrimoireShelf
 *     book={{ n: 1, title: "Introducing Mibera" }}
 *     tools={[
 *       { name: "lookup_mibera", hint: "one of ten thousand", href: "/tools/lookup_mibera" },
 *     ]}
 *   />
 */

export type GrimoireBook = {
  /** Grimoire image number (1..7) under /grimoire/. */
  n: number;
  /** Book title — Imperial, uppercase tracking. */
  title: string;
  /** Optional sub-label (e.g. era, theme). */
  hint?: string;
};

export type GrimoireTool = {
  /** Canonical tool name (renders mono). */
  name: string;
  /** One-line purpose. */
  hint?: string;
  /** Tool page URL. */
  href: string;
};

type Props = {
  book: GrimoireBook;
  tools: GrimoireTool[];
  ariaLabel?: string;
};

export function GrimoireShelf({ book, tools, ariaLabel }: Props) {
  return (
    <section
      className="grimoire-shelf"
      aria-label={ariaLabel ?? `${book.title} — ${tools.length} tool${tools.length === 1 ? "" : "s"}`}
    >
      <img
        src={`/grimoire/${book.n}.avif`}
        alt=""
        width={260}
        height={347}
        loading="lazy"
        decoding="async"
        className="grimoire-shelf__cover"
      />
      <div className="grimoire-shelf__heading">
        <div className="grimoire-shelf__book-title">{book.title}</div>
        {book.hint ? (
          <div className="grimoire-shelf__book-hint">{book.hint}</div>
        ) : null}
      </div>
      <ul className="grimoire-shelf__tools" role="list">
        {tools.map((tool) => (
          <li key={tool.href}>
            <a href={tool.href} className="grimoire-shelf__tool">
              <span className="grimoire-shelf__tool-name">{tool.name}</span>
              {tool.hint ? (
                <span className="grimoire-shelf__tool-hint">{tool.hint}</span>
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
