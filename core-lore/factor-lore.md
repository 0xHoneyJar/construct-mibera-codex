---
title: "Factor \u2192 Lore Mapping"
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
- **lore**: Jani's Friendtech Keys. If you had one, you likely obtained one in order to get mibera WL.
### og:cfang_keys

- **dimension**: `og`
- **archetype**: Milady
- **status**: live
- **display_name**: Cfang Keys
- **lore**: Cfang's Friendtech Keys. If you had one, you likely obtained one in order to get mibera WL.

### og:articles

- **dimension**: `og`
- **archetype**: All
- **status**: live
- **display_name**: Articles
- **lore**: Written-form OG signal. Long-form pieces which documented the culture while it was being built. 

### og:sets

- **dimension**: `og`
- **archetype**: All
- **status**: live
- **display_name**: Mibera Sets
- **lore**: A collection of articles, posters, and music - later represented by pieces of art minted on Optimism. Predates Mibera mainstem. 

### og:cubquest

- **dimension**: `og`
- **archetype**: Freetekno
- **status**: live
- **display_name**: CubQuest
- **lore**: Quest engine OG participation. Showed up when the coordinates dropped and there was nothing but a field and a sound system. You were there.

---

## NFT dimension

### nft:mibera

- **dimension**: `nft`
- **archetype**: All (depends on the specific Mibera)
- **status**: live
- **display_name**: Mibera NFT
- **lore**: The foundational holding. 10,000 Miberas built from 1337 traits total - each with an archetype, ancestor, birthday, and signal hierarchy. Hand-painted on iPad in Procreate over 18 months. 

### nft:mibera_quality

- **dimension**: `nft`
- **archetype**: All
- **status**: historic
- **display_name**: Mibera Quality
- **lore**: Folded into `nft:mibera` as a multiplier. Swag score still exists per Mibera, just not counted separately anymore.

### nft:fractures

- **dimension**: `nft`
- **archetype**: All
- **status**: live
- **display_name**: Fractures
- **lore**: Fracture pieces from the Mibera reveal. 11 phases, each exposing more of the character underneath. Shards of a larger image that only made sense in sequence.

### nft:fractures_complete

- **dimension**: `nft`
- **archetype**: All
- **status**: historic
- **display_name**: Complete Fracture Sets
- **lore**: Folded into `nft:fractures` as a quality multiplier. Completeness used to be its own signal.

---

## Onchain dimension

### onchain:miberamaker

- **dimension**: `onchain`
- **archetype**: All
- **status**: live
- **display_name**: Mibera Maker
- **lore**: The maker contract. Where grails and 1-of-1s get minted. 43 hand-drawn pieces with cultural context.

### onchain:validator_booster

- **dimension**: `onchain`
- **archetype**: Chicago/Detroit
- **status**: live
- **display_name**: Validator Booster
- **lore**: Berachain validator boosting. Foundational infrastructure. The warehouse doesn't need a sign.

### onchain:candies_minter

- **dimension**: `onchain`
- **archetype**: Freetekno
- **status**: live
- **display_name**: Candies Minter
- **lore**: Honey Candies minting. Sticky sweet, passed hand to hand. Tea stall energy.

### onchain:gif_minter

- **dimension**: `onchain`
- **archetype**: Milady
- **status**: live
- **display_name**: GIF Minter
- **lore**: Animated frame collecting. Quick-cut, swipe-speed energy. Everything glows, everything moves.

### onchain:tarot_minter

- **dimension**: `onchain`
- **archetype**: Acidhouse
- **status**: live
- **display_name**: Tarot Minter
- **lore**: Drug-tarot card mints. 78 cards mapping molecules to divinatory arcana. The owsley-lab synthesis floor.

### onchain:zora_collector

- **dimension**: `onchain`
- **archetype**: Milady
- **status**: live
- **display_name**: Zora Collector
- **lore**: Zora-network collecting. The el-dorado bazaar in protocol form. The treasure is real but the map keeps changing.

### onchain:beraji_staker

- **dimension**: `onchain`
- **archetype**: Chicago/Detroit
- **status**: live
- **display_name**: Beraji Staker
- **lore**: Beraji staking. Protocol-level commitment. Chosen Few energy — keep showing up, keep the warehouse open.

### onchain:shadow_minter

- **dimension**: `onchain`
- **archetype**: Acidhouse
- **status**: live
- **display_name**: Shadow Minter
- **lore**: Shadow mints from the vending machine. 102 exclusive traits not in the main collection. The unseen layer.

### onchain:milady_burner

- **dimension**: `onchain`
- **archetype**: Milady
- **status**: live
- **display_name**: Milady Burner
- **lore**: Burning Milady-adjacent assets. Wartime aesthetic. MIBERA IS THE REFUSAL — sometimes refusal is combustion.

### onchain:mibera_burner

- **dimension**: `onchain`
- **archetype**: All
- **status**: live
- **display_name**: Mibera Burner
- **lore**: Burning Miberas. The rave clears its own floor.

### onchain:cubquest_minter

- **dimension**: `onchain`
- **archetype**: Freetekno
- **status**: live
- **display_name**: CubQuest Minter
- **lore**: Quest reward mints. The wristband from the festival. You followed the coordinates, you earned the mark.

### onchain:liquid_backing

- **dimension**: `onchain`
- **archetype**: All
- **status**: live
- **display_name**: Liquid Backing
- **lore**: Protocol-owned liquidity. Structural commitment that doesn't announce itself. Concrete under the dance floor.

### onchain:loan_taker

- **dimension**: `onchain`
- **archetype**: Acidhouse
- **status**: live
- **display_name**: Loan Taker
- **lore**: Borrowing against on-chain assets. Leveraged risk. The come-up.

### onchain:loan_defaulter

- **dimension**: `onchain`
- **archetype**: Acidhouse
- **status**: live
- **display_name**: Loan Defaulter
- **lore**: Defaulted positions. The come-down. Not moral judgment — pharmacokinetics applied to capital.

### onchain:liquidator

- **dimension**: `onchain`
- **archetype**: Freetekno
- **status**: live
- **display_name**: Liquidator
- **lore**: Liquidation participation. Enforcement at the perimeter. The tree line where torchlight gives out.

### onchain:paddle_supplier

- **dimension**: `onchain`
- **archetype**: All
- **status**: live
- **display_name**: Paddle Supplier
- **lore**: Paddle protocol liquidity supply. Depth in the pool.

### onchain:paddle_borrower

- **dimension**: `onchain`
- **archetype**: All
- **status**: live
- **display_name**: Paddle Borrower
- **lore**: Paddle protocol borrowing. Drawing from the pool.

### onchain:paddle_liquidated

- **dimension**: `onchain`
- **archetype**: All
- **status**: live
- **display_name**: Paddle Liquidated
- **lore**: Paddle position liquidated. The pool reclaims what the pool provided.

### onchain:paddle_liquidator

- **dimension**: `onchain`
- **archetype**: All
- **status**: live
- **display_name**: Paddle Liquidator
- **lore**: Paddle liquidation enforcement. Returning the pool to equilibrium.

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
  lore: "The Genesis Keys predate the rave itself...",
  codex_anchor: "core-lore/factor-lore.md#ogjani_keys",
  status: "live"
}
```

When the operator's interim translations in `freeside-characters/apps/character-ruggy/codex-anchors.md` are made obsolete by curated entries here, that file deletes (per score-mibera#70 migration plan).

## Coverage gaps

`mcp__codex__validate_world_element({type: "factor", value: "..."})` logs unmatched-but-Mibera-relevant queries to `grimoires/codex-mcp/coverage-gaps.jsonl` per Gumi's C6 ask. Periodic review surfaces what's missing while the codex is still being built out.
