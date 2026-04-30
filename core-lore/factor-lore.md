---
title: Factor → Lore Mapping
description: Canonical factor IDs (emitted by score-mibera) mapped to Mibera-codex lore for narrator-bot consumption.
seeded_by: operator (zksoju)
seeded_at: 2026-04-30
status: operator-seeded · curator-pending
curator: gumi
load_bearing: true
---

# Factor → Lore

Score-mibera emits factor IDs (`og:jani_keys`, `nft:mibera`, `onchain:milady_burner`, etc.) as machine labels for on-chain activity. Narrator bots (ruggy, satoshi, future puruhani daemons) need to translate these into Mibera-world lore: which archetype the factor anchors, what cultural register it carries, what the activity *means* in the world.

This file is the canonical join table — the codex side of `score-mibera` ↔ `construct-mibera-codex`. `mcp__codex__lookup_factor(factor_id)` reads from here.

## Editorial authority

Gumi is the SoT for factor lore. The seeded entries below were extracted from `freeside-characters/apps/character-ruggy/codex-anchors.md` (operator-curated interim) and from the score-mibera factor list at `src/lib/midi/unified-factor-config.ts`. They are **starting points, not finished**. Curate freely.

## Status field

Per `score-mibera#72`: factors with `weight: 0` in score config are folded into multipliers and should carry `status: "historic"` or `"merged"` here. Live factors carry `status: "live"` (default).

---

## OG dimension

### og:jani_keys

- **dimension**: `og`
- **archetype**: All (pre-archetype — foundational team era)
- **status**: live
- **display_name**: Jani Keys
- **lore**: 🪶 **TODO (Gumi)** — the Honey Jar Genesis Keys minted by Jani's pre-Mibera era. Cultural register: founder lineage, builder credentials, "before the rave."

### og:cfang_keys

- **dimension**: `og`
- **archetype**: Milady
- **status**: live
- **display_name**: Cfang Keys
- **lore**: 🪶 **TODO (Gumi)** — Charlotte Fang / Remilia keys. Cultural register: network spirituality, post-ironic aspiration, "the screen as altar."

### og:articles

- **dimension**: `og`
- **archetype**: All
- **status**: live
- **display_name**: Articles
- **lore**: 🪶 **TODO (Gumi)** — written-form OG signal. Cultural register: chronicler / lore-keeper, "the rave gets written down."

### og:sets

- **dimension**: `og`
- **archetype**: Chicago/Detroit
- **status**: live
- **display_name**: DJ Sets
- **lore**: 🪶 **TODO (Gumi)** — recorded mixes / sets archive. Cultural register: Ron Hardy at the Music Box, "the genre is named after this room."

### og:cubquest

- **dimension**: `og`
- **archetype**: Freetekno
- **status**: live
- **display_name**: CubQuest
- **lore**: 🪶 **TODO (Gumi)** — quest engine OG participation. Cultural register: muddy ruts between rigs, "the rig hasn't stopped since Thursday."

---

## NFT dimension

### nft:mibera

- **dimension**: `nft`
- **archetype**: All (depends on the specific Mibera)
- **status**: live
- **display_name**: Mibera NFT
- **lore**: 🪶 **TODO (Gumi)** — the foundational holding. Cultural register: 10,000 time-travelling Beras carrying the eternal flame of the rave; the shadow side of Milady; ravepill, sweaty filthy reality of the dance floor.

### nft:mibera_quality

- **dimension**: `nft`
- **archetype**: All
- **status**: historic
- **display_name**: Mibera Quality
- **lore**: 🪶 **TODO (Gumi)** — folded into `nft:mibera` as a quality_score multiplier. Per score-mibera#72: surface as historic so list_factors hides it from live consumers.

### nft:fractures

- **dimension**: `nft`
- **archetype**: Milady
- **status**: live
- **display_name**: Fractures
- **lore**: 🪶 **TODO (Gumi)** — Fracture pieces / Milady fragment collection. Cultural register: el-dorado bazaar, "the treasure is real but the map keeps changing."

### nft:fractures_complete

- **dimension**: `nft`
- **archetype**: Milady
- **status**: historic
- **display_name**: Complete Fracture Sets
- **lore**: 🪶 **TODO (Gumi)** — folded into `nft:fractures` quality multiplier. Per score-mibera#72: historic.

---

## Onchain dimension

### onchain:miberamaker

- **dimension**: `onchain`
- **archetype**: All
- **status**: live
- **display_name**: Mibera Maker
- **lore**: 🪶 **TODO (Gumi)** — the maker contract that mints grails / 1/1s. Cultural register: builder's bench, "the artist commissioning their own commissioning."

### onchain:validator_booster

- **dimension**: `onchain`
- **archetype**: Chicago/Detroit
- **status**: live
- **display_name**: Validator Booster
- **lore**: 🪶 **TODO (Gumi)** — Berachain validator boosting. Cultural register: foundational infra, "undecorated, undeniable, foundational."

### onchain:candies_minter

- **dimension**: `onchain`
- **archetype**: Freetekno
- **status**: live
- **display_name**: Candies Minter
- **lore**: 🪶 **TODO (Gumi)** — Honey Candies minting. Cultural register: rig-running, sticky sweet, "tea + speed and someone's dog asleep by the fire barrel."

### onchain:gif_minter

- **dimension**: `onchain`
- **archetype**: Milady
- **status**: live
- **display_name**: GIF Minter
- **lore**: 🪶 **TODO (Gumi)** — animated frame collector. Cultural register: notification chimes layered over hyperpop.

### onchain:tarot_minter

- **dimension**: `onchain`
- **archetype**: Acidhouse
- **status**: live
- **display_name**: Tarot Minter
- **lore**: 🪶 **TODO (Gumi)** — drug-tarot card mints. Cultural register: owsley-lab synthesis floor, "PiHKAL on the centrifuge, periodic table on the wall."

### onchain:zora_collector

- **dimension**: `onchain`
- **archetype**: Milady
- **status**: live
- **display_name**: Zora Collector
- **lore**: 🪶 **TODO (Gumi)** — Zora-network collector activity. Cultural register: el-dorado bazaar, "everything glows and everything's for sale."

### onchain:beraji_staker

- **dimension**: `onchain`
- **archetype**: Chicago/Detroit
- **status**: live
- **display_name**: Beraji Staker
- **lore**: 🪶 **TODO (Gumi)** — Beraji staking participation. Cultural register: foundational protocol commitment.

### onchain:shadow_minter

- **dimension**: `onchain`
- **archetype**: Acidhouse
- **status**: live
- **display_name**: Shadow Minter
- **lore**: 🪶 **TODO (Gumi)** — shadow / off-glance mints. Cultural register: "everything hums at 440Hz," the unseen layer.

### onchain:milady_burner

- **dimension**: `onchain`
- **archetype**: Milady
- **status**: live
- **display_name**: Milady Burner
- **lore**: 🪶 **TODO (Gumi)** — burning Milady-adjacent assets. Cultural register: ritual destruction, the wartime aesthetic.

### onchain:mibera_burner

- **dimension**: `onchain`
- **archetype**: All
- **status**: live
- **display_name**: Mibera Burner
- **lore**: 🪶 **TODO (Gumi)** — burning miberas. Cultural register: ceremonial removal, "the rave clears its own floor."

### onchain:cubquest_minter

- **dimension**: `onchain`
- **archetype**: Freetekno
- **status**: live
- **display_name**: CubQuest Minter
- **lore**: 🪶 **TODO (Gumi)** — quest reward / mint participation. Cultural register: stamp on the journey, "the wristband from the festival."

### onchain:liquid_backing

- **dimension**: `onchain`
- **archetype**: All
- **status**: live
- **display_name**: Liquid Backing
- **lore**: 🪶 **TODO (Gumi)** — protocol-owned liquidity participation. Cultural register: structural commitment, "the building was a factory, then it was nothing."

### onchain:loan_taker

- **dimension**: `onchain`
- **archetype**: Acidhouse
- **status**: live
- **display_name**: Loan Taker
- **lore**: 🪶 **TODO (Gumi)** — borrower against on-chain assets. Cultural register: leveraged risk, "time-dilation, the 20-minute track."

### onchain:loan_defaulter

- **dimension**: `onchain`
- **archetype**: Acidhouse
- **status**: live
- **display_name**: Loan Defaulter
- **lore**: 🪶 **TODO (Gumi)** — defaulted positions. Cultural register: cautionary lore, the come-down.

### onchain:liquidator

- **dimension**: `onchain`
- **archetype**: Freetekno
- **status**: live
- **display_name**: Liquidator
- **lore**: 🪶 **TODO (Gumi)** — liquidation participants. Cultural register: enforcement, "the rig calls for clearance."

### onchain:paddle_supplier

- **dimension**: `onchain`
- **archetype**: All
- **status**: live
- **display_name**: Paddle Supplier
- **lore**: 🪶 **TODO (Gumi)** — Paddle protocol liquidity supplier.

### onchain:paddle_borrower

- **dimension**: `onchain`
- **archetype**: All
- **status**: live
- **display_name**: Paddle Borrower
- **lore**: 🪶 **TODO (Gumi)** — Paddle protocol borrower.

### onchain:paddle_liquidated

- **dimension**: `onchain`
- **archetype**: All
- **status**: live
- **display_name**: Paddle Liquidated
- **lore**: 🪶 **TODO (Gumi)** — Paddle position liquidated.

### onchain:paddle_liquidator

- **dimension**: `onchain`
- **archetype**: All
- **status**: live
- **display_name**: Paddle Liquidator
- **lore**: 🪶 **TODO (Gumi)** — Paddle liquidation enforcer.

---

## How this is read

Parsed by `src/lookups/factor.ts` — h3 (`### {factor_id}`) is the key, the bullet list under it is the lore body. Free-form prose under each entry is preserved verbatim in `lore` field.

When a consumer calls `mcp__codex__lookup_factor(factor_id)`:

```ts
{
  id: "og:jani_keys",
  display_name: "Jani Keys",
  dimension: "og",
  archetype: "All",
  lore: "🪶 TODO (Gumi) — the Honey Jar Genesis Keys minted by Jani's pre-Mibera era...",
  codex_anchor: "core-lore/factor-lore.md#ogjani_keys",
  status: "live"
}
```

When the operator's interim translations in `freeside-characters/apps/character-ruggy/codex-anchors.md` are made obsolete by curated entries here, that file deletes (per [score-mibera#70 migration plan](https://github.com/0xHoneyJar/score-mibera/issues/70)).

## Coverage gaps

`mcp__codex__validate_world_element({type: "factor", value: "..."})` logs unmatched-but-Mibera-relevant queries to `grimoires/codex-mcp/coverage-gaps.jsonl` per Gumi's C6 ask. Periodic review surfaces what's missing while the codex is still being built out.
