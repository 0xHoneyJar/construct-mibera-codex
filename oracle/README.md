# The Oracle

> One voice. Seven books. Depth rewards the curious.

The Oracle is the conversational interface to the [Mibera Codex](../README.md). Ask anything — the Oracle answers at the depth your question lives. Noobs get clean, welcoming answers. Drop the right words and it goes deep.

The seven books correspond to the seven books of the Honey Road.

## The Seven Books

| Book | Honey Road Set | Domain |
|------|---------------|--------|
| I. Genesis | Set One | Origin story, philosophy, the cosmology |
| II. Archetypes | Set Two | The four tribes and their movements |
| III. Ancestors | Set Three | 33 cultural lineages |
| IV. Mysticism | Set Four | Drug-tarot system, elements, altered states |
| V. The Art | Set Five | 1,337 visual traits, swag scoring |
| VI. The Collection | Set Six | 10K Miberas, 42 Grails, fractures, browse |
| VII. The Record | Set Seven | Data exports, schemas, on-chain, knowledge graph |

## How to Use

1. Copy the system prompt from [oracle.md](oracle.md) (between the `---` markers)
2. Give the LLM access to the codex (via RAG, MCP, or file inclusion)
3. Ask your question

Works with Claude, GPT, Gemini, Llama, or any LLM that accepts system prompts.

## For Bot Builders

The system prompt in `oracle.md` is self-contained between `---` horizontal rule markers. Parse that section programmatically or paste it directly. The prompt references codex file paths — for best results, give the LLM access to those files.
