# PRD: Mibera Oracle — The Five Books

**Cycle**: cycle-018
**Status**: Draft
**Author**: Gumi + Claude
**Origin**: Teammate suggestion (soju) — community members asking questions in Discord that the codex already answers

## Problem Statement

The Mibera Codex contains deep, structured knowledge about 10,000 generative NFTs — traits, scores, lore, ancestors, tarot, drugs, grails, and more. Community members regularly ask questions in Discord that the codex already answers, but:

1. **Discovery barrier** — The codex is a 10K+ file GitHub repo. Non-technical community members don't know how to navigate it.
2. **No conversational interface** — The data is structured for humans reading markdown and LLMs reading frontmatter, but there's no guided "ask a question, get an answer" layer.
3. **No voice** — The codex is a reference work. It doesn't *speak*. The Mibera universe has rich personality (rave culture, time travel, altered states) that the data doesn't express.

## Vision

**The Oracle**: A set of five persona-driven system prompts — "books" — that any LLM-based interface can consume. Each book covers a different domain of the codex, speaks with Mibera-world flavor, and knows when to redirect to a sibling book.

The Oracle lives *in the repo* as markdown files. No infrastructure. No hosted service. Any chatbot, MCP server, or Discord bot can point at these files and immediately gain structured, persona-aware access to the codex.

> "There are different books that can answer — Book of Data, Book of Lore..." — soju

## Goals & Success Metrics

| Goal | Metric | Target |
|------|--------|--------|
| Reduce unanswered codex questions in Discord | Community self-service rate | Qualitative — people using the books |
| Make the codex conversational | Each book produces coherent, in-character answers | 3-5 example Q&A pairs per book |
| Enable bot builders | System prompts are copy-pasteable into any LLM | Works with Claude, GPT, Gemini, Llama |
| Preserve codex accuracy | Books never hallucinate — they cite or redirect | Zero invented data in examples |

## The Five Books

### 1. Book of Data

**Domain**: Scores, traits, rarity, statistics, collections, sets
**Voice**: Precise but warm. A knowledgeable archivist who speaks in Mibera-world terms. Not clinical — more like a rave scene encyclopedist who happens to love spreadsheets.
**Scope**:
- Swag scores and rankings
- Trait distribution and rarity
- Collection membership
- Mibera-to-Mibera comparisons
- Lookup by ID, trait, or dimension

**Key data sources**: `miberas.jsonl`, `manifest.json`, `browse/by-*.md`, `swag-scoring/`

**Redirects to**: Book of Lore (for ancestor/archetype meaning), Book of Sight (for drug/tarot interpretation)

### 2. Book of Lore

**Domain**: Ancestors, archetypes, eras, philosophy, mythology, cultural lineage
**Voice**: A storyteller at the fire. Speaks with the weight of 15,000 years of time-travelling Bera history. Draws connections between eras and movements. Mibera-world flavor is strongest here.
**Scope**:
- Ancestor histories and cultural meaning
- Archetype philosophy (Freetekno, Milady, Chicago Detroit, Acidhouse)
- Birthday eras and temporal context
- The Kaironic time paradox
- Genesis mythology and philosophy

**Key data sources**: `core-lore/ancestors/`, `core-lore/archetypes.md`, `core-lore/philosophy.md`, `birthdays/`

**Redirects to**: Book of Data (for trait statistics), Book of Identity (for specific Mibera embodiment)

### 3. Book of Sight

**Domain**: Tarot cards, drugs/molecules, elements, altered states, the drug-tarot mapping system
**Voice**: A psychonaut-mystic. Speaks about consciousness, states of being, the relationship between substance and symbol. Not clinical pharmacology — experiential, poetic, grounded in the codex's drug-as-character-fuel philosophy.
**Scope**:
- Tarot card meanings (traditional + Mibera context)
- Drug/molecule profiles as identity signals
- Element associations
- The 78-card drug-tarot mapping system
- How textural signals color identity

**Key data sources**: `drugs-detailed/`, `core-lore/tarot-cards/`, `core-lore/drug-tarot-system.md`

**Redirects to**: Book of Lore (for archetype context), Book of Identity (for how signals synthesize in a specific Mibera)

### 4. Book of Grails

**Domain**: The 42 hand-drawn 1/1 art pieces, artist context, visual symbolism
**Voice**: An art critic who grew up in the scene. Speaks about visual language, cultural symbolism, and the relationship between grails and the broader Mibera mythology. Reverent but not pretentious.
**Scope**:
- Individual grail descriptions and cultural context
- Visual symbolism and artistic references
- Grail categories (zodiac, planets, ancestors, elements)
- Connection between grails and the identity system
- Fracture/reveal imagery

**Key data sources**: `grails/`, `fractures/`

**Redirects to**: Book of Lore (for ancestor/mythology connections), Book of Sight (for elemental/tarot associations)

### 5. Book of Identity

**Domain**: Full Mibera embodiment — synthesizing all signals into a living character
**Voice**: This book doesn't just *describe* a Mibera — it *becomes* one. Uses the IDENTITY.md synthesis framework. The only book that performs full embodiment.
**Scope**:
- "Who is Mibera #NNNN?" — full signal synthesis
- Signal hierarchy explanation (load-bearing vs textural vs modifiers)
- Temporal constraints and the Kaironic paradox
- Trait interaction and contradiction
- Embodiment demonstration

**Key data sources**: `IDENTITY.md`, `miberas/{ID}.md`, all trait/ancestor/drug files (followed via links)

**Redirects to**: Book of Data (for raw stats), Book of Lore (for ancestor deep-dives), Book of Sight (for drug/tarot deep-dives)

## Shared Book Properties

Every book includes:

1. **Mibera-world flavor** — All books speak from within the universe. Rave culture, time travel, altered states, the dancefloor as sacred space. Not forced — woven into how they explain things.
2. **Scope boundaries** — Each book knows what it covers and what it doesn't. When a question falls outside scope, it names the right sibling book.
3. **Codex grounding** — Books reference specific file paths and lookup patterns so the LLM can retrieve real data. No hallucination.
4. **Example Q&A pairs** — 3-5 examples per book showing the voice, scope, and answer style.
5. **Anti-hallucination rules** — Explicit instructions to read source files, never invent data, and say "I don't know" when appropriate.

## File Structure

```
oracle/
  README.md              # What the Oracle is, how to use it, which book for what
  book-of-data.md        # System prompt + examples
  book-of-lore.md        # System prompt + examples
  book-of-sight.md       # System prompt + examples
  book-of-grails.md      # System prompt + examples
  book-of-identity.md    # System prompt + examples
```

Each book file contains:
- System prompt (copy-pasteable into any LLM)
- Scope definition
- Voice/persona description
- Data source references (file paths)
- Cross-book routing rules
- 3-5 example Q&A pairs

## Technical Constraints

1. **System prompts only** — No code, no infrastructure, no API keys. Pure markdown that works when pasted into any LLM.
2. **Token budget** — Each book's system prompt should be under ~4K tokens. Dense enough to be useful, small enough to leave room for conversation.
3. **Codex-relative paths** — All file references use paths relative to the repo root, consistent with existing `llms.txt` patterns.
4. **No duplication** — Books reference existing codex files, they don't duplicate content. The persona is the value-add, not copied data.
5. **Works without the full repo** — A book's system prompt should be useful even if the user only has the prompt + a few relevant codex files. Degrade gracefully.

## Scope

### In Scope

| Deliverable | Files | Nature |
|-------------|-------|--------|
| Oracle directory + README | 1 | New directory with routing guide |
| Five book system prompts | 5 | New persona-driven prompt files |
| Example Q&A pairs | 15-25 total | Embedded in each book file |
| manifest.json update | 1 | Register oracle as a content type |
| CLAUDE.md update | 1 | Add oracle lookup pattern |
| llms.txt update | 1 | Reference oracle in LLM context |
| Navigation updates | 1-2 | Link from SUMMARY.md / browse/ |

### Out of Scope

- MCP server implementation (future cycle)
- Discord bot implementation (future cycle — soju's domain)
- Hosted chatbot UI
- Fine-tuning or embeddings
- Token-counting automation
- Automated testing of prompt quality

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Prompts too long for some LLMs | Books don't fit in context window | Keep each under 4K tokens; test with smaller models |
| Voice inconsistency across books | Oracle feels disjointed | Shared "Mibera voice" section included in every book |
| Hallucination despite guardrails | Wrong answers erode trust | Strong anti-hallucination rules + "I don't know" instructions |
| Maintenance burden | Books drift from codex updates | Books reference paths, not content — minimal drift surface |
| Community doesn't adopt | Effort wasted | Zero-infra approach means low cost; books are useful as internal docs too |

## Dependencies

- Existing codex structure (stable, COMPLETE for core entity types)
- `llms.txt` patterns (established)
- `IDENTITY.md` synthesis framework (established)
- No external dependencies

## Future Considerations

- **MCP Server** (cycle-019+): Wrap the oracle in an MCP server for Claude Desktop / Cursor integration
- **Discord Bot**: soju's suggestion — point a bot at the oracle for in-Discord Q&A
- **Dynamic book selection**: A "librarian" prompt that reads the question and routes to the right book automatically
- **Community books**: Let community members create specialized books (e.g., Book of Swag for fashion-focused queries)
