/**
 * GrimoireShelf — a row of grimoires.
 *
 * SSR-safe: pure render, no browser globals at module top-level. Hover
 * physics live in CSS (var(--spring-gentle), var(--duration-normal))
 * so vocs prerendering produces identical markup to runtime.
 *
 * Usage in MDX:
 *
 *   import { GrimoireShelf } from '../components/grimoire-shelf'
 *
 *   <GrimoireShelf books={[
 *     { n: 1, label: "lookup_zone",      href: "/tools/lookup_zone" },
 *     { n: 2, label: "lookup_archetype", href: "/tools/lookup_archetype" },
 *     ...
 *   ]} />
 */

export type GrimoireBook = {
  /** Which avif (1..7) under /grimoire/. */
  n: number
  /** Display name (Imperial). */
  label: string
  /** Sub-label, optional uppercase HERALD-register hint. */
  hint?: string
  /** Where the book opens to. */
  href: string
}

type Props = {
  books: GrimoireBook[]
  /** Optional aria-label for the whole shelf. */
  ariaLabel?: string
}

export function GrimoireShelf({ books, ariaLabel = "Mibera Codex grimoire shelf" }: Props) {
  return (
    <ul className="grimoire-shelf" role="list" aria-label={ariaLabel}>
      {books.map((book) => (
        <li key={`${book.n}-${book.href}`}>
          <a
            href={book.href}
            className="grimoire-shelf__book"
            aria-label={`Open the grimoire for ${book.label}`}
          >
            <img
              src={`/grimoire/${book.n}.avif`}
              alt=""
              width={240}
              height={320}
              loading="lazy"
              decoding="async"
              className="grimoire-shelf__cover"
            />
            <span className="grimoire-shelf__label">{book.label}</span>
            {book.hint ? <span className="grimoire-shelf__hint">{book.hint}</span> : null}
          </a>
        </li>
      ))}
    </ul>
  )
}
