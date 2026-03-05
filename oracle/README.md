# The Oracle

> Ask anything about the Mibera Codex. The Oracle routes your question to the right voice.

The Oracle is a single system prompt that gives any LLM conversational access to the [Mibera Codex](../README.md). It answers questions across three domains — Data, Lore, and Sight — automatically routing to the right voice based on what you ask.

## How to Use

1. Copy the system prompt from [oracle.md](oracle.md) (between the `---` markers)
2. Give the LLM access to the codex (via RAG, MCP, or file inclusion)
3. Ask your question — the Oracle handles routing

Works with Claude, GPT, Gemini, Llama, or any LLM that accepts system prompts.

## What It Covers

| Domain | Voice | Example Questions |
|--------|-------|-------------------|
| **Data** | Precise archivist | "What's Mibera #4269's swag score?" / "How many grails are there?" |
| **Lore** | Storyteller at the fire | "Tell me about the Greek ancestor" / "What's the Saturn grail about?" |
| **Sight** | Psychonaut-mystic | "What does The Hermit card mean?" / "Tell me about MDMA" |

## For Bot Builders

The system prompt in `oracle.md` is self-contained between `---` horizontal rule markers. Parse that section programmatically or paste it directly. The prompt references codex file paths — for best results, give the LLM access to those files.

## Files

| File | Description |
|------|-------------|
| [oracle.md](oracle.md) | The system prompt |
| [README.md](README.md) | This file — usage guide |
