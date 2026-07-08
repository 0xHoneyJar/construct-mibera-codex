# Archetype Quiz

*The soulbound personality quiz that maps a wallet to one of ten esoteric archetypes — distinct from the four rave-tribe trait archetypes of the main collection.*

---

## Two archetype systems (read this first)

Mibera uses the word **archetype** for two unrelated things. Do not conflate them.

| | Trait archetypes | Quiz archetypes (this section) |
|---|---|---|
| Count | **4** | **10** |
| Members | Freetekno, Chicago/Detroit, Acidhouse, Milady | Centurion, Oracle, Witness, Prodigal Son, Doppel, Ouroboros, Anointer, Serpent, Bound One, Phoenix |
| Basis | Rave-culture movements, assigned from astrological birth data | Esoteric/tarot roles, chosen by answering a personality quiz |
| Home | [`core-lore/archetypes.md`](../archetypes.md) | this section |
| On-chain | A generative trait on each of the 10,000 Miberas | A separate soulbound token, `MiberaArchetypeAlignment` (MIRA) |

The two systems share no members and are computed by completely different mechanisms. The quiz is an **alternative identity ritual** layered on top of the collection, not a second way to compute a trait archetype.

**Also not related:** the codex's [78 drug-tarot cards](../drug-tarot-system.md) (78 tarot cards ↔ 78 drugs). "Tarot Quiz" is just the frontend's nickname for this Archetype Quiz — it draws no tarot cards and references none of the 78. The two systems share the word "tarot" and nothing else.

## What the quiz is

The Archetype Quiz (frontend-branded "Tarot Quiz") is an **off-chain, 7-question** personality quiz. Each answer maps to one of the 10 quiz archetypes. Your answers are tallied and projected onto a 2-axis grid; the result is your **dominant archetype** plus a **secondary** and **tertiary**. On-chain holdings apply weighted "boosts" that pull your grid position. Completing the quiz lets you mint a **soulbound** (non-transferable, one-per-wallet) NFT — `miChainMirror` / **MIRA** — that records the result. The token art is your archetype sigil.

- **The 7 questions, all 70 answers, and the full scoring engine** → [`quiz-questions.md`](quiz-questions.md)
- **The 10 archetypes** (essence, description, grid position, art) → [`archetypes/`](archetypes/)
- **Esoteric roles, on-chain actions, and boost weights** → [`esoteric-roles.md`](esoteric-roles.md)
- **The MIRA contract mechanics** → [`../../_codex/data/tarot-quiz.md`](../../_codex/data/tarot-quiz.md)

## The 10 archetypes

| Archetype | Symbol | Grid disposition (Chaos↔Order, Hidden↔Visible) |
|-----------|:------:|--------------------------------------------------|
| [Centurion](archetypes/centurion.md) | 🛡 | Order, Visible |
| [Oracle](archetypes/oracle.md) | 🌒 | Chaos, Hidden |
| [Witness](archetypes/witness.md) | 🐈 | Slightly Order, Very Hidden |
| [Prodigal Son](archetypes/prodigal-son.md) | 🧠 | Chaos, Visible |
| [Doppel](archetypes/doppel.md) | 🪞 | Very Chaos, Slightly Visible |
| [Ouroboros](archetypes/ouroboros.md) | 🚨 | Very Order, Slightly Visible |
| [Anointer](archetypes/anointer.md) | 🧃 | Order, Hidden |
| [Serpent](archetypes/serpent.md) | 🐍 | Chaos, Hidden |
| [Bound One](archetypes/bound-one.md) | ⛓️ | Neutral, Very Hidden |
| [Phoenix](archetypes/phoenix.md) | 🔥 | Order, Hidden |

> Note: the frontend ships an eleventh sigil image, `Apostate.png`, that is not one of the ten scoreable archetypes. It appears to be an unused or special-case asset; no quiz answer maps to it.

## The grid

Every archetype sits on a 2D plane. Two axes:

- **X — Chaos (−100) ↔ Order (+100)**
- **Y — Hidden (−100) ↔ Visible (+100)**

Your answers place you at an average position; on-chain boosts nudge it; the archetype whose bounding box contains your point (or is nearest) becomes dominant. See [`quiz-questions.md`](quiz-questions.md) for the exact vectors and ranges.

## Provenance

This section reconstructs the quiz from its original frontend implementation in the private `0xHoneyJar/mibera-honeyroad` repository, recovered at commit `0db63db0` — the last state before the quiz UI was retired in the 2026-05-16 wind-down (commit `3246f324`). Source files:

- `components/quiz-page.tsx` — questions, archetype copy, symbols
- `lib/hooks/use-quiz.ts` — scoring engine (vectors, ranges, boosts, roles, actions)
- `constants/quiz.ts` — art paths and config

The MIRA contract remains live on Berachain; historical token metadata is still served from the `quiz_metadata` Postgres table via `app/api/quiz/[tokenId]/route.ts`. Everything here is transcribed from those sources, not inferred.
