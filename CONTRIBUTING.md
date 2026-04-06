# Contributing to the Mibera Codex

## What You Can Contribute

### Trait Cultural Context
Every trait file in `traits/` has a `## Cultural Context` section explaining what the trait means and where it comes from. If you have knowledge about a specific trait's cultural roots, subculture history, or design reference — submit a PR.

**Guidelines:**
- Be specific. Name people, events, dates, places.
- No AI filler language ("tapestry of", "testament to", "rich heritage").
- Write like you're explaining it to someone at the bar, not writing a museum placard.
- Include sources where possible.

### Holder Lore
If you hold a Mibera, you can add lore to its file. Add a `## Holder Lore` section below the Traits table in `miberas/{ID}.md`.

**Guidelines:**
- Your lore, your rules — but it should feel like it belongs in this world.
- Don't contradict the Mibera's traits (read the file first).
- Keep it under the backlinks section marker (`<!-- @generated:backlinks-start -->`).

### Bug Reports
Found a broken link, wrong count, missing file, or factual error? Open an issue or submit a fix directly.

## What NOT to Edit

- **Backlinks** — Everything between `<!-- @generated:backlinks-start -->` and `<!-- @generated:backlinks-end -->` is auto-generated. Don't touch it.
- **Core lore** — `core-lore/`, `IDENTITY.md`, `oracle/` require team review.
- **YAML frontmatter** — Don't change trait values, IDs, or metadata fields without coordination.
- **Schemas** — `_codex/schema/` files define the data model. Changes here affect everything.

## Running Audits

Before submitting, run the validation scripts:

```bash
# Structural validation (YAML fields, required content)
bash _codex/scripts/audit-structure.sh

# Link validation (245K+ internal links)
bash _codex/scripts/audit-links.sh

# Semantic validation (cross-reference integrity)
python3 _codex/scripts/audit-semantic.py
```

All three should pass with 0 errors.

## PR Process

1. Fork the repo
2. Make your changes on a branch
3. Run the audits above
4. Submit a PR with a clear description of what you changed and why
5. Core lore changes require team review; trait context and holder lore get lighter review
