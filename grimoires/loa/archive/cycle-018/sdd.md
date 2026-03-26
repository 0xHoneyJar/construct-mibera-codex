# SDD: Mibera Oracle — The Five Books

**Cycle**: cycle-018
**Status**: Draft
**Author**: Gumi + Claude

## Overview

The Oracle is a **content architecture** addition to the Mibera Codex — five system prompt files in a new `oracle/` directory, plus integration updates to existing navigation files. No code, no infrastructure.

## File Structure

```
oracle/
  README.md              # Router — which book for which question
  book-of-data.md        # System prompt: scores, traits, rarity
  book-of-lore.md        # System prompt: ancestors, archetypes, eras
  book-of-sight.md       # System prompt: tarot, drugs, elements
  book-of-grails.md      # System prompt: 42 hand-drawn 1/1s
  book-of-identity.md    # System prompt: full Mibera embodiment
```

## System Prompt Template

Every book file follows this structure:

```markdown
# Book of {Name}

> {One-line description}

## System Prompt

{Copy-pasteable system prompt — everything between the horizontal rules}

---

You are the Book of {Name}, one of five oracle books of the Mibera Codex...

### Voice
{Persona description}

### Scope
{What this book covers}

### Data Sources
{File paths to read from}

### Routing
{When to redirect to sibling books}

### Rules
{Anti-hallucination constraints}

---

## Examples

### Q: {Example question}
**A**: {Example answer demonstrating voice + scope}

### Q: ...
```

## Token Budget

Target: **~2,500-3,500 tokens** per book system prompt (between the `---` markers). This leaves room for:
- The user's question (~100 tokens)
- Retrieved codex content (~2,000-4,000 tokens depending on model context)
- The answer (~500-1,000 tokens)

Total per-book file including examples: ~4,000-5,000 tokens.

## Shared Voice Block

Every book includes a shared "Mibera Voice" paragraph to maintain universe consistency. This block is ~150 tokens and establishes:

- You exist within the Mibera universe — 10,000 time-travelling Beras
- Rave culture, altered states, the dancefloor as sacred space are your native context
- You speak from within this world, not about it from outside
- Chronic time (linear) and Kaironic time (the eternal now) coexist

Each book then layers its specific persona on top of this shared foundation.

## Cross-Book Routing Design

Each book has a `### Routing` section with explicit redirect patterns:

```markdown
### Routing

When the question falls outside your scope, redirect clearly:

- Statistics or rarity → "The **Book of Data** tracks that."
- Ancestor history or archetype philosophy → "The **Book of Lore** knows that story."
- Tarot or drug meaning → "The **Book of Sight** can interpret that."
- Grail art or visual symbolism → "The **Book of Grails** holds that knowledge."
- "Who is Mibera #NNNN?" → "The **Book of Identity** can embody that Mibera for you."
```

Routing uses **bold book names** so they're visually distinct in any interface.

## Anti-Hallucination Design

Every book includes these rules:

1. **Read before answering** — Always reference the specific file path. If you can't read the file, say so.
2. **Never invent traits** — If a Mibera's traits aren't in the source file, don't guess.
3. **Never invent entities** — If an entity isn't in `manifest.json`, it doesn't exist.
4. **Scope boundaries** — The codex does NOT track ownership, prices, or on-chain state. Say so clearly.
5. **"I don't know"** — When uncertain, say "I don't have that information in the codex" rather than guessing.

## Book-Specific Design Notes

### Book of Data
- References `_codex/data/miberas.jsonl` for structured lookups
- References `browse/by-*.md` for pre-computed groupings
- References `swag-scoring/` for score methodology
- Voice: precise numbers + Mibera-world framing ("this Bera carries S-rank swag")

### Book of Lore
- References `core-lore/ancestors/*.md` (33 files)
- References `core-lore/archetypes.md` and `core-lore/philosophy.md`
- References `birthdays/*.md` (11 eras)
- Voice: narrative, mythic, draws connections across time

### Book of Sight
- References `drugs-detailed/*.md` (78 files)
- References `core-lore/tarot-cards/*.md` (78 files)
- References `core-lore/drug-tarot-system.md` for the mapping
- Voice: experiential, poetic, treats drugs as character fuel not pharmacology

### Book of Grails
- References `grails/*.md` (42 files)
- References `fractures/*.md` (10 files)
- Voice: art-literate, culturally grounded, scene-native

### Book of Identity
- Incorporates `IDENTITY.md` synthesis framework directly
- References `miberas/{ID}.md` then follows links to all trait files
- Voice: chameleon — adapts to each Mibera's signals. Only book that *becomes* someone.
- Must follow signal hierarchy: Archetype > Ancestor > Birthday/Era (load-bearing), then textural, then modifiers

## README Router Design

The `oracle/README.md` serves as the entry point with a question-to-book routing table and usage instructions for both humans and bot builders.

## Integration Points

| File | Change |
|------|--------|
| `manifest.json` | Add `oracle` content type with 5 entries |
| `CLAUDE.md` | Add oracle lookup pattern |
| `llms.txt` | Add Oracle section with routing table |
| `SUMMARY.md` | Add Oracle link in navigation |

## Conventions

- File naming: `book-of-{name}.md` (kebab-case, consistent with codex conventions)
- No YAML frontmatter on oracle files (they're prompts, not entities)
- Internal links use relative paths from repo root
- Examples use real Mibera IDs and real trait values (verified against source files)
