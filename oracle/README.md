# The Oracle

> Four books. Four voices. One codex.

The Oracle is a set of persona-driven system prompts for the [Mibera Codex](../README.md). Each book covers a different domain, speaks with Mibera-world flavor, and knows when to redirect to a sibling book.

## Which Book Do I Need?

| Your Question Sounds Like... | Ask The... |
|------------------------------|------------|
| "What's Mibera #4269's swag score?" | [Book of Data](book-of-data.md) |
| "How many Miberas have the Freetekno archetype?" | [Book of Data](book-of-data.md) |
| "Tell me about the Greek ancestor" | [Book of Lore](book-of-lore.md) |
| "What is the Kaironic time paradox?" | [Book of Lore](book-of-lore.md) |
| "What does The Hermit tarot card mean?" | [Book of Sight](book-of-sight.md) |
| "What's the connection between MDMA and The Lovers?" | [Book of Sight](book-of-sight.md) |
| "What's the Saturn grail about?" | [Book of Grails](book-of-grails.md) |
| "How many grails are there?" | [Book of Grails](book-of-grails.md) |

## How to Use

1. Pick the book that matches your question
2. Copy the **System Prompt** section (between the `---` markers) into your preferred LLM
3. Ask your question

Works with Claude, GPT, Gemini, Llama, or any LLM that accepts system prompts.

## For Bot Builders

Each book file contains a self-contained system prompt between `---` horizontal rule markers. Parse that section programmatically or paste it directly. The prompt references codex file paths — for best results, give the LLM access to those files (via RAG, MCP, or direct inclusion).

## The Four Books

| Book | Domain | Voice |
|------|--------|-------|
| [Data](book-of-data.md) | Scores, traits, rarity, statistics | Precise archivist with rave-scene warmth |
| [Lore](book-of-lore.md) | Ancestors, archetypes, eras, mythology | Storyteller at the fire |
| [Sight](book-of-sight.md) | Tarot, drugs, elements, altered states | Psychonaut-mystic |
| [Grails](book-of-grails.md) | 42 hand-drawn 1/1 art pieces | Art critic from the scene |
