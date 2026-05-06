/**
 * GrimoireShelf — one book, one destination.
 *
 * The entire shelf is a single click target — book cover + title +
 * hint all linked to the section's page. No per-shelf tool list. The
 * book IS the way in.
 *
 * Layout: book image on the left, title + hint on the right. Hover
 * lifts the cover and underlines the title. SSR-safe; styling lives
 * in /global.css.
 *
 * Usage in MDX:
 *
 *   <GrimoireShelf
 *     book={{ n: 1, title: "Introducing Mibera", hint: "..." }}
 *     href="/tools/lookup_mibera"
 *   />
 */

export type GrimoireBook = {
  /** Grimoire image number (1..7) under /grimoire/. */
  n: number;
  /** Book title — Imperial. */
  title: string;
  /** Optional sub-label (era, theme, content gloss). */
  hint?: string;
};

type Props = {
  book: GrimoireBook;
  /** Destination URL for the entire shelf. */
  href: string;
  ariaLabel?: string;
};

export function GrimoireShelf({ book, href, ariaLabel }: Props) {
  return (
    <a
      href={href}
      className="grimoire-shelf"
      aria-label={ariaLabel ?? book.title}
    >
      <img
        src={`/grimoire/${book.n}.avif`}
        alt=""
        width={260}
        height={347}
        loading="eager"
        decoding="async"
        className="grimoire-shelf__cover"
      />
      <div className="grimoire-shelf__heading">
        <div className="grimoire-shelf__book-title">{book.title}</div>
        {book.hint ? (
          <div className="grimoire-shelf__book-hint">{book.hint}</div>
        ) : null}
      </div>
    </a>
  );
}
