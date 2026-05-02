# /codex

Query the Mibera knowledge base.

## Usage

```
/micodex <query>
```

## Routing

The codex command routes queries to the appropriate skill:

- **Entity lookups** ("what is Mibera #42?", "tell me about MDMA") -> query-entity
- **Browsing** ("show me all Fire element Miberas", "list the archetypes") -> browse-codex
- **Relationships** ("which ancestor has the most Freetekno Miberas?", "what tarot card pairs with ketamine?") -> cross-reference

## Examples

- `/micodex Mibera 7777` — look up a specific Mibera
- `/micodex ancestor Greek` — read the Greek ancestor entry
- `/micodex browse by drug` — browse Miberas grouped by drug
- `/micodex grail Saturn` — look up the Saturn grail
- `/micodex drug-tarot pairings` — show the drug-to-tarot mapping

## Context files

For full context on how to navigate the codex, read:
- `manifest.json` — programmatic file index
- `llms.txt` — condensed LLM context with all lookup patterns
- `IDENTITY.md` — embodiment constraints (if asked to roleplay a Mibera)
