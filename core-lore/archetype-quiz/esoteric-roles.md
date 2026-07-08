# Esoteric Roles, On-Chain Actions & Boosts

The three sets of modifiers that shift a wallet's grid position before the dominant archetype is chosen. All values transcribed verbatim from `mibera-honeyroad` (`lib/hooks/use-quiz.ts`, `components/quiz-page.tsx`).

Each modifier is a vector `{x, y}` added to the position, where **X = Chaos(−) ↔ Order(+)** and **Y = Hidden(−) ↔ Visible(+)**. See [`quiz-questions.md`](quiz-questions.md) for how the position is computed.

---

## Esoteric Roles

A tier earned by how many Mibera-ecosystem NFTs the wallet holds. Higher tiers nudge the position toward Order/Visible. Art: `public/Esoteric/{ROLE}.png` in the frontend.

| Role | NFT count | Vector (x, y) |
|------|----------:|:-------------:|
| Seeker | 1 | (−10, −10) |
| Neophyte | 2 | (−5, 0) |
| Acolyte | 5 | (0, 5) |
| Adept | 10 | (5, 10) |
| Alchemist | 25 | (10, 15) |
| Sigil Mage | 50 | (15, 20) |
| Keeper of Keys | 100 | (20, 25) |
| Chain Archivist | 250 | (25, 30) |
| The Contract | 500 | (30, 35) |

## On-Chain Actions

A single declared "how you behaved" flag. Art: `public/badges/{action}.png`.

| Action | Vector (x, y) | Reading |
|--------|:-------------:|---------|
| crazy | (−20, 10) | Chaos, Visible |
| cradled | (10, −10) | Order, Hidden |
| capitulate | (−15, −15) | Chaos, Hidden |
| Collectooor | (15, 5) | Order, Visible |
| Comeback | (0, 20) | Neutral, Very Visible |
| Cashed out | (−10, 0) | Chaos, Neutral |

## Boosts

On-chain holdings and contributions that pull the position toward a specific archetype's quadrant. Each is a boolean flag on the wallet's quiz record; when true, its vector is added. Badge art: `public/badges/{name}.png`.

### NFT holdings

| Boost | Vector (x, y) | Pulls toward |
|-------|:-------------:|--------------|
| apDAO | (−20, −20) | Serpent (Chaos, Hidden) |
| Honeycomb | (−30, −40) | Oracle (Chaos, Very Hidden) |
| Bulla | (30, 30) | Centurion (Order, Visible) |
| Tedism | (−10, 20) | Phoenix / Serpent (Chaos, Visible) |
| Parcel | (−40, 10) | Doppel (Very Chaos, Slightly Visible) |
| Miladies | (20, −10) | Phoenix (Order, Hidden) |
| MiReveal | (25, 25) | Centurion (Order, Visible) |

### Drug-related

| Boost | Vector (x, y) | Pulls toward |
|-------|:-------------:|--------------|
| Cheap drugs | (−25, −35) | Oracle (Chaos, Hidden) |
| Expensive drugs | (15, 15) | Phoenix / Centurion (Order, Visible) |

### Shadow-trait count

| Boost | Vector (x, y) | Pulls toward |
|-------|:-------------:|--------------|
| 1 shadow | (−15, −15) | Serpent (Chaos, Hidden) |
| 2–10 shadows | (10, −10) | Phoenix (Order, Hidden) |
| 10+ shadows | (40, −30) | Anointer (Order, Hidden) |

### Mibera Set tier

| Boost | Vector (x, y) | Pulls toward |
|-------|:-------------:|--------------|
| Set holder | (5, −45) | Witness (Slightly Order, Very Hidden) |
| Strong set holder | (−35, 10) | Doppel (Very Chaos, Slightly Visible) |
| Super set holder | (35, 35) | Centurion (Order, Visible) |

### Contribution

| Boost | Vector (x, y) | Pulls toward |
|-------|:-------------:|--------------|
| Articles | (−20, −30) | Oracle (Chaos, Hidden) |
| Delegator | (0, −30) | Witness (Neutral, Hidden) |
| Scribe | (0, −50) | Bound One (Neutral, Very Hidden) |

---

## Order of operations

1. Average the base vectors of the 7 answers → raw position.
2. Add the esoteric-role adjustment.
3. Add the on-chain action adjustment.
4. Add every active boost vector.
5. Clamp to ±100.
6. Resolve the dominant archetype by bounding box, else nearest base vector.

The `forced_archetype` override (Phoenix / Prodigal Son / Ouroboros only) short-circuits this and wins outright.
