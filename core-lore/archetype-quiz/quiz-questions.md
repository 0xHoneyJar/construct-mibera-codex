# Quiz Questions & Scoring

The full 7-question quiz, all 70 answer options, and the scoring engine — transcribed verbatim from `mibera-honeyroad` (`components/quiz-page.tsx`, `lib/hooks/use-quiz.ts`).

Questions are presented in a **randomized order** per session (shuffled on mount). Every question offers exactly **one answer per archetype**, so the ten options below always appear in the same archetype order.

---

## The 7 questions

### Q1 — *"You receive a parcel from Mibera. It says: 'Mibera is now Miladies.' Timeline splits. What do you do?"*

| Answer | Archetype |
|--------|-----------|
| Change pfp first, ask never | Centurion |
| Cast divination, summon the chat | Oracle |
| Wait to see how it plays out | Witness |
| Post "this is low effort trash" | Prodigal Son |
| Remix the NFT into memes | Doppel |
| Say "we've been here before", this isn't the real reveal | Ouroboros |
| Slide into DMs and mint new meaning | Anointer |
| Post "this was written" then vanish | Serpent |
| Save every tweet, say nothing | Bound One |
| Burn it or Burn something | Phoenix |

### Q2 — *"The Discord is nuked. Founders radio silent or Raging. Timeline in flames. What do you do?"*

| Answer | Archetype |
|--------|-----------|
| Meme through it | Centurion |
| Drop a prophecy and vanish | Oracle |
| Refresh and observe | Witness |
| "Y'all got rugged again huh" | Prodigal Son |
| Post fake leaks to stir it | Doppel |
| "Another loop begins" | Ouroboros |
| Bless the ashes | Anointer |
| "Judgment has come" | Serpent |
| Scroll silently, feel cursed | Bound One |
| Burn it all, start again | Phoenix |

### Q3 — *"A community ritual spreads. Miladies being commented under confused Milady pfps. Comment waves. What's your move?"*

| Answer | Archetype |
|--------|-----------|
| Run ops, no permission needed | Centurion |
| Share lore, connect the symbols | Oracle |
| Watch the ritual, say nothing | Witness |
| Say "this is cringe" | Prodigal Son |
| Become the ritual | Doppel |
| Echo its prior versions | Ouroboros |
| Declare meaning, crown it | Anointer |
| Post sigils of awakening | Serpent |
| Archive everything | Bound One |
| Join, but note "all things must pass" | Phoenix |

### Q4 — *"Some meme Miladies. Others mourn. What's your response?"*

| Answer | Archetype |
|--------|-----------|
| Comment "we ride again" | Centurion |
| Post prophecy | Oracle |
| Screenshot and save | Witness |
| "Grift energy lol" | Prodigal Son |
| Post both sides of the meme war | Doppel |
| Share image from 6 cycles ago | Ouroboros |
| Bless it and elevate it | Anointer |
| "They awaken the old gods" | Serpent |
| Say nothing, absorb everything | Bound One |
| "Let this meme die with honor" | Phoenix |

### Q5 — *"The floor crashes. What now?"*

| Answer | Archetype |
|--------|-----------|
| "There is no chart" | Centurion |
| Decode the fall | Oracle |
| Lurk and log it | Witness |
| "Told you it was a rug" | Prodigal Son |
| Start chaos posts | Doppel |
| Post a spiral or ouroboric sigil | Ouroboros |
| Find meaning in the ashes | Anointer |
| "Karma loop complete" | Serpent |
| Feel the loss, hold the line | Bound One |
| Exit, re-enter stronger | Phoenix |

### Q6 — *"Your ideal contribution to the community is…"*

| Answer | Archetype |
|--------|-----------|
| Build and show up | Centurion |
| Receive and translate visions | Oracle |
| Observe and remember | Witness |
| Provide sharp critique | Prodigal Son |
| Stir things up | Doppel |
| Keep the wheel turning | Ouroboros |
| Amplify and validate others | Anointer |
| Reveal hidden truths | Serpent |
| Endure the vibes | Bound One |
| Transform and inspire | Phoenix |

### Q7 — *"Pick a symbol:"*

| Answer | Archetype |
|--------|-----------|
| 🛡 | Centurion |
| 🌒 | Oracle |
| 🐈 | Witness |
| 🧠 | Prodigal Son |
| 🪞 | Doppel |
| 🚨 | Ouroboros |
| 🧃 | Anointer |
| 🐍 | Serpent |
| ⛓️ | Bound One |
| 🔥 | Phoenix |

---

## Scoring engine

The result is computed in two complementary layers.

### Layer 1 — Answer tally (dominant archetype)

1. Each of the 7 answers awards **+1 point** to its archetype.
2. The archetype with the most points is **dominant**.
3. **Ties are broken at random** among the highest-scoring archetypes.
4. A `forced_archetype` flag in the wallet's quiz record can override the tally — but only for **Phoenix, Prodigal Son, or Ouroboros** (used for special/seeded assignments).

### Layer 2 — The grid (position, secondary, tertiary)

Two axes define a −100…+100 plane:

- **X — Chaos (−100) ↔ Order (+100)**
- **Y — Hidden (−100) ↔ Visible (+100)**

**Archetype base vectors** (their "home" coordinates):

| Archetype | X | Y | Reading |
|-----------|---:|---:|---------|
| Centurion | 60 | 60 | Order, Visible |
| Oracle | −40 | −70 | Chaos, Hidden |
| Witness | 10 | −90 | Slightly Order, Very Hidden |
| Prodigal Son | −60 | 60 | Chaos, Visible |
| Doppel | −90 | 20 | Very Chaos, Slightly Visible |
| Ouroboros | 90 | 20 | Very Order, Slightly Visible |
| Anointer | 80 | −50 | Order, Hidden |
| Serpent | −60 | −60 | Chaos, Hidden |
| Bound One | 0 | −100 | Neutral, Very Hidden |
| Phoenix | 40 | −20 | Order, Hidden |

**Position** = the average of the base vectors of your 7 chosen answers, clamped to ±100. On-chain **boosts** (see [`esoteric-roles.md`](esoteric-roles.md)) are then added to shift the point.

**Bounding ranges** — if your position falls inside an archetype's box, that archetype is selected; otherwise the **nearest base vector by Euclidean distance** wins:

| Archetype | X range | Y range |
|-----------|---------|---------|
| Centurion | [2, 58] | [2, 58] |
| Ouroboros | [17, 73] | [−18, 38] |
| Prodigal Son | [−58, −2] | [2, 58] |
| Doppel | [−73, −17] | [−18, 38] |
| Oracle | [−48, 8] | [−63, −7] |
| Serpent | [−58, −2] | [−58, −2] |
| Phoenix | [−8, 48] | [−38, 18] |
| Witness | [−23, 33] | [−73, −17] |
| Anointer | [12, 68] | [−53, 3] |
| Bound One | [−28, 28] | [−75.5, −19.5] |

**Secondary + tertiary archetypes** = the 2nd- and 3rd-nearest base vectors to your final position (excluding the dominant one). These are what the token's metadata records alongside the primary.

### What lands on-chain

The `mint()` call itself carries **no archetype data** — the token ID is sequential. The archetype, grid vector, and secondary are written to the off-chain `quiz_metadata` Postgres record and served through the contract's `baseURI`. See [`../../_codex/data/tarot-quiz.md`](../../_codex/data/tarot-quiz.md) for contract mechanics.
