<!-- codex-status: COMPLETE | entities: 10 | last-verified: 2026-07-18 -->
# Fractures — The Reveal Timeline

*10 soulbound collections marking each phase of Mibera's emergence into the world.*

---

## Overview

FracturedMibera is a set of 10 soulbound ERC-721 collections on Berachain. Each represents a reveal phase — a step in the progression from sealed envelope to fully-realized Mibera. They serve as permanent on-chain proof of which reveal wave a holder participated in.

Every Mibera holder can mint their corresponding token ID in each Fracture collection. The tokens are non-transferable — permanently bound to the minting wallet as a record of presence.

## The Reveal Phases

The reveal unfolds in 10 stages. The first two phases — MiParcels and Miladies — are conceptual predecessors: pure anticipation and a nod to lineage. The remaining eight are the progressive unveiling of the Mibera form.

| # | Phase | Symbol | What's Revealed |
|---|-------|--------|-----------------|
| 1 | [MiParcels](miparcels.md) | MIPARCEL | Sealed envelopes — labels, stickers, lore scrawl |
| 2 | [Miladies](miladies.md) | MILADIES | Flipped Milady Maker art with toilet graffiti |
| 3 | [MiReveal #1.1](mireveal-1.1.md) | MIREVEAL1.1 | Colors and scenery — first hints, rare foregrounds |
| 4 | [MiReveal #2.2](mireveal-2.2.md) | MIREVEAL2.2 | Scene clears, molecule placed, silhouette appears |
| 5 | [MiReveal #3.3](mireveal-3.3.md) | MIREVEAL3.3 | Form takes shape, astrology revealed, eyes closed |
| 6 | [MiReveal #4.20](mireveal-4.20.md) | MIREVEAL4.20 | Moon appears, hat placed if applicable |
| 7 | [MiReveal #5.5](mireveal-5.5.md) | MIREVEAL5.5 | Mibera awakes — rising sign, face finalized |
| 8 | [MiReveal #6.9](mireveal-6.9.md) | MIREVEAL6.9 | Head takes final form, ancient emblem appears |
| 9 | [MiReveal #7.7](mireveal-7.7.md) | MIREVEAL7.7 | Tattoos added — calm before the storm |
| 10 | [MiReveal #8.8](mireveal-8.8.md) | MIREVEAL8.8 | Final reveal — the current Mibera collection |

### The Naming Convention

The decimal numbering is playful and intentional: 1.1, 2.2, 3.3, **4.20**, 5.5, **6.9**, 7.7, 8.8. The cultural references in 4.20 and 6.9 are deliberate.

## Current Contracts

All 10 Fracture collections are soulbound ERC-721 contracts on Berachain. Token IDs mirror the main Mibera collection 1:1.

Use this table, or `_codex/data/contracts.json` → `FracturedMibera.phases[*].current_address`, for current collection intake. Historical contracts marked `superseded` below are lineage evidence, not active collections.

| # | Name | Current Contract | Status |
|---|------|------------------|--------|
| 1 | MiParcels | `0x86db98cf1b81e833447b12a077ac28c36b75c8e1` | active |
| 2 | Miladies | `0x8d4972bd5d2df474e71da6676a365fb549853991` | active |
| 3 | MiReveal #1.1 | `0x144b27b1a267ee71989664b3907030da84cc4754` | active |
| 4 | MiReveal #2.2 | `0x72db992e18a1bf38111b1936dd723e82d0d96313` | active |
| 5 | MiReveal #3.3 | `0x3a00301b713be83ec54b7b4fb0f86397d087e6d3` | active |
| 6 | MiReveal #4.20 | `0x419f25c4f9a9c730aacf58b8401b5b3e566fe886` | active |
| 7 | MiReveal #5.5 | `0x81a27117bd894942ba6737402fb9e57e942c6058` | active |
| 8 | MiReveal #6.9 | `0xaab7b4502251ae393d0590bab3e208e2d58f4813` | active |
| 9 | MiReveal #7.7 | `0xc64126ea8dc7626c16daa2a29d375c33fcaa4c7c` | active |
| 10 | MiReveal #8.8 | `0x24f4047d372139de8dacbe79e2fc576291ec3ffc` | active |

### Superseded Deployment Lineage

The deployer created an initial batch and then replaced nine of its ten contracts about 16 minutes later. The replacements have identical runtime bytecode and the mint/Transfer activity; the first-batch contracts below have zero Transfer logs. Phase 2 was not replaced.

| Phase | Historical Contract | Status | Superseded By |
|-------|---------------------|--------|---------------|
| 1 | `0x6956dae88c00372b1a0b2dfbfe5eed19f85b0d4b` | superseded (0 Transfer logs) | `0x86db98cf1b81e833447b12a077ac28c36b75c8e1` |
| 3 | `0x77ec6b83495974a5b2c5bef943b0f2e5acd8fc26` | superseded (0 Transfer logs) | `0x144b27b1a267ee71989664b3907030da84cc4754` |
| 4 | `0xc557bf6c7d21ba98a40ddfe2beaba682c49d17a9` | superseded (0 Transfer logs) | `0x72db992e18a1bf38111b1936dd723e82d0d96313` |
| 5 | `0xbcb082bb41e892f29d9c600eaadea698d5f712ef` | superseded (0 Transfer logs) | `0x3a00301b713be83ec54b7b4fb0f86397d087e6d3` |
| 6 | `0x2030f226bf9a0c88687e83accdcefb7dae260094` | superseded (0 Transfer logs) | `0x419f25c4f9a9c730aacf58b8401b5b3e566fe886` |
| 7 | `0xcc426f9375c5edcef5ca6bdb0449c07113348cf7` | superseded (0 Transfer logs) | `0x81a27117bd894942ba6737402fb9e57e942c6058` |
| 8 | `0xf68f40230e39067ee7c98fe9a8641fc124c5be60` | superseded (0 Transfer logs) | `0xaab7b4502251ae393d0590bab3e208e2d58f4813` |
| 9 | `0xfc79b1bcca172ff5a8f74205c82f5cbb0125dd10` | superseded (0 Transfer logs) | `0xc64126ea8dc7626c16daa2a29d375c33fcaa4c7c` |
| 10 | `0xa3d3ef45712631a6fb50c677762b8653f932cf71` | superseded (0 Transfer logs) | `0x24f4047d372139de8dacbe79e2fc576291ec3ffc` |

**Provenance:** [mibera-contracts lineage correction](https://github.com/0xHoneyJar/mibera-contracts/issues/2) · [codex correction](https://github.com/0xHoneyJar/construct-mibera-codex/issues/94) · verified 2026-07-18.

> **Technical details** — soulbound enforcement, minting mechanics, and deployment info: [FracturedMibera contract reference](../_codex/data/fractured-mibera.md)

---

<!-- @generated:backlinks-start -->
<!-- @generated:backlinks-end -->
