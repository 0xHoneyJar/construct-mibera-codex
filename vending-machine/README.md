# Mibera Shadows Vending Machine

> Exclusive traits available only through the [VendingMachine contract](../_codex/data/shadow-traits.md) — not found in the generative 10K collection.

## Overview

The Mibera Shadows Vending Machine mints custom trait combinations as ERC-721 tokens ("Mibera Shadow Traits" / MST). Each combination is a guaranteed 1-of-1 — once minted, no one else can claim the same set of traits.

The Vending Machine is one of the primary ways the **community can affect the fabric of Mibera**. Many of these traits originated as community suggestions, making this collection a living record of collective creative input.

This page catalogs the **102 exclusive traits** (across 11 categories, excludes overlays) that exist only in the Vending Machine and are not part of the main collection's 1,337 generative traits.

## Contract

| Name | Address | Chain |
|------|---------|-------|
| Mibera Shadows | [`0x048327A187b944ddac61c6e202BfccD20d17c008`](https://berascan.com/address/0x048327A187b944ddac61c6e202BfccD20d17c008) | Berachain |

## Exclusive Traits by Category

| Category | Count | Notes |
|----------|-------|-------|
| [Earrings](earrings/README.md) | 4 | |
| [Eyes](eyes/README.md) | 8 | Includes closed eyes from reveal phases |
| [Face Accessories](face-accessories/README.md) | 1 | |
| [Glasses](glasses/README.md) | 4 | |
| [Hats](hats/README.md) | 19 | |
| [Items](items/README.md) | 21 | |
| [Masks](masks/README.md) | 5 | |
| [Mouth](mouth/README.md) | 3 | |
| [Necklaces](necklaces/README.md) | 19 | VM-exclusive category |
| [Shirts](shirts/README.md) | 17 | |
| [Tattoos](tattoos/README.md) | 1 | |
| Overlays | — | *Coming soon* |

## How It Works

1. Pick your trait combination from the available exclusive options
2. Call `shop()` on the contract, paying the mint price in BERA
3. Your combination is hashed and stored — no one else can ever mint the same one
4. You receive an MST (ERC-721) token representing your unique Shadow Trait

For full contract mechanics (hashing, UUPS proxy, V1→V2 changes), see [Shadow Traits — VendingMachine System](../_codex/data/shadow-traits.md).

---

*See also: [All Traits](../traits/README.md) (generative collection) · [Shadow Traits Technical Docs](../_codex/data/shadow-traits.md)*
