# PRD: Trait Enrichment — Cultural Context at Scale

> **Cycle**: cycle-016
> **Created**: 2026-02-22
> **Status**: Draft

---

## 1. Problem Statement

The codex contains 1,257 trait files across 18 subcategories. While the files have a template structure with sections for Cultural Origin, Visual Description, and team notes, the vast majority of those sections are **empty or incomplete**. An agent trying to synthesize a Mibera's identity from its traits hits dead ends — a hat file says "dark navy cap with an Aboriginal flag" but doesn't explain why that matters to the Mibera system.

The grail enrichment (PR #28) demonstrated the pattern: structured sections (Cultural Context, Visual Elements, Justification) transform thin entries into content that an agent can actually use for persona synthesis. This cycle applies the same treatment to trait files, starting with the ~863 files that carry the strongest cultural signal.

> Source: Direct file audit of `traits/` directory — see gap analysis below.

## 2. Goal

Enrich culture-heavy trait files with a standardized template: **Cultural Context**, **Visual Elements**, **Justification**, and **Attribution**. Fill in gaps using existing team notes, Discord attribution, and sourceable research. Migrate from the current scattered section structure to the hybrid template.

### Success Criteria

- [ ] Hybrid template (Cultural Context, Visual Elements, Justification, Attribution) applied to all target files
- [ ] Empty "Cultural Origin" / "Why This Matters" / "Era" fields replaced with consolidated sections
- [ ] Existing team notes, Discord sources, and introduced-by data preserved in Attribution
- [ ] All claims sourceable (Wikipedia-level, not invented)
- [ ] Template documented in `_codex/schema/README.md` (Section 2 update)
- [ ] Link audit passes after migration (`_codex/scripts/audit-links.sh`)

## 3. Users

| Persona | Need |
|---------|------|
| AI agent (embodiment) | Needs trait context to inform Mibera persona synthesis per IDENTITY.md |
| Human browser (GitHub) | Needs readable, informational entries — not empty shells |
| Contributor | Needs a clear template to follow when adding new traits |

## 4. Scope

### In Scope — Culture-Heavy Subcategories (863 files)

| Subcategory | Files | Cultural Origin Filled | Why This Matters Filled | Team Notes |
|---|---|---|---|---|
| items/general-items | 259 | 2 | 163 | 27 |
| accessories/hats | 128 | 34 | 0 | 20 |
| backgrounds | 73 | 40 | 69 | 0 |
| accessories/earrings | 64 | 44 | 0 | 4 |
| clothing/short-sleeves | 52 | 19 | 0 | 14 |
| clothing/long-sleeves | 52 | 51 | 0 | 3 |
| character-traits/tattoos | 46 | 17 | 0 | 4 |
| accessories/face-accessories | 42 | 13 | 0 | 1 |
| accessories/glasses | 38 | 5 | 0 | 1 |
| accessories/masks | 32 | 20 | 2 | 1 |
| clothing/simple-shirts | 8 | 0 | 0 | 0 |

### Out of Scope (This Cycle)

- **Bong bears** (107) — numbered plushie variants, minimal cultural signal
- **Character traits** (body: 12, eyes: 90, eyebrows: 10, hair: 129, mouth: 21) — purely visual, no cultural layer
- **Overlays** (astrology: 12, elements: 4, ranking: 8) — system-level, already documented
- Template migration for out-of-scope categories (future cycle)
- Drug files and tarot cards (separate enrichment cycle)

## 5. Template Design

### Target Template (Hybrid)

```markdown
---
{existing YAML frontmatter preserved}
---

# {Name}

## Visual Elements

**Image:**
![{Name}]({image-url})

{What is depicted — visual description, dominant colors, notable details.}

## Cultural Context

{Real-world history, cultural origin, or subculture significance.
Sourced claims. Why this object/style/reference matters.}

## Justification

{Why this trait exists in the Mibera collection. How it connects
to the archetype, ancestor, or scene it represents.}

---

## Attribution

**Archetype:** [{archetype}](link)
**Swag Score:** {score}
**Ancestor:** [{ancestor}](link) (if applicable)
**Date Added:** {date}
**Introduced By:** {name} (if known)
**Team Notes:** {preserved from existing files}
**Sources:** {preserved from existing files}
```

### Migration Rules

1. **Visual Description** + **Dominant Colors** + **Image Files** → consolidated into **Visual Elements**
2. **Cultural Origin** + **Why This Matters** + **Era** → consolidated into **Cultural Context**
3. **Archetype Alignment** → absorbed into **Justification** (why it's archetype-aligned)
4. **Mibera Integration** + **Connections** + existing **Attribution** → consolidated into **Attribution**
5. Empty fields are dropped, not preserved as blanks
6. Team notes and Discord sources are always preserved verbatim

### Content Guidelines (from grail enrichment)

- Informational tone — no AI-isms, no flowery language
- Stick to facts; all cultural claims should be Wikipedia-sourceable
- Justification is simple and dry — just why it's in the collection
- Don't editorialize ("most viewers will recognize on sight")
- Don't mention IDENTITY.md in entries

## 6. Sprint Structure

Batched by subcategory, starting with the richest (best for template validation) and working outward.

| Sprint | Subcategory | Files | Rationale |
|--------|------------|-------|-----------|
| 1 | backgrounds | 73 | Richest existing content (40 Cultural Origin, 69 Why This Matters). Best for validating the template migration. |
| 2 | items/general-items | 259 | Largest batch. 163 already have "Why This Matters". Heaviest cultural signal (music gear, historical objects, cypherpunk artifacts). |
| 3 | accessories/hats + accessories/earrings | 192 | Strong Cultural Origin (34 + 44 filled). Many ancestor-linked. |
| 4 | clothing (long + short + simple) | 181 | Long sleeves richest (51/52 Cultural Origin). Short sleeves sparse. |
| 5 | tattoos + face-accessories + glasses + masks | 158 | Remaining accessories. Tattoos carry ancestor signal. |

## 7. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scale — 863 files is a lot | Burnout, incomplete cycle | Sprint structure allows partial completion; each sprint is independently valuable |
| Content accuracy — cultural claims must be sourceable | Misinformation in the codex | Wikipedia-sourcing rule; user review per batch; no speculation |
| Template migration breaks links | Broken internal links | Run `audit-links.sh` after each sprint |
| Existing team notes lost in migration | Loss of attribution data | Migration rule #6: always preserve team notes verbatim |
| Many traits lack cultural context entirely | Can't enrich without input | Flag these for user review; skip rather than invent |

## 8. Dependencies

- User review per sprint batch (cultural accuracy requires domain knowledge)
- Existing `_codex/scripts/audit-links.sh` for validation
- Template documentation update in `_codex/schema/README.md`
