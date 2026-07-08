# Archetype Quiz — MiberaArchetypeAlignment (miChainMirror)

> Soulbound archetype assignment via on-chain quiz. One token per wallet, permanently bound.

## Overview

The Archetype Quiz is a soulbound NFT system on Berachain that assigns each participant an archetype. Users take an off-chain quiz (the "Tarot Quiz") that determines their archetype alignment, then mint a non-transferable token recording that result on-chain. The contract is named `MiberaArchetypeAlignment` with token name "miChainMirror" and symbol "MIRA".

The contract itself does not contain quiz logic or archetype assignment — it is a pure soulbound minting contract. The quiz happens **off-chain** on the Mibera Honeyroad frontend, and the resulting archetype is encoded in the token's metadata served through the `baseURI`.

> **The full quiz is documented** in [`core-lore/archetype-quiz/`](../../core-lore/archetype-quiz/README.md): the [7 questions and scoring engine](../../core-lore/archetype-quiz/quiz-questions.md), the [10 archetypes](../../core-lore/archetype-quiz/), and the [esoteric roles, on-chain actions, and boosts](../../core-lore/archetype-quiz/esoteric-roles.md). This file covers only the on-chain contract mechanics.

## Contract

| Field | Value |
|-------|-------|
| Contract name | `MiberaArchetypeAlignment` |
| Token name | miChainMirror |
| Token symbol | MIRA |
| Address | `0x4B08a069381EfbB9f08C73D6B2e975C9BE3c4684` |
| Chain | Berachain (80094) |
| Standard | ERC-721 Enumerable (soulbound) |
| Compiler | Solidity 0.8.26 |

## Mechanics

### Soulbound Enforcement

The `_update` function is overridden to only allow minting (transfers from `address(0)`). Any transfer between addresses or burning reverts with `SoulboundTokensCannotBeTransferred()`. The `approve` and `setApprovalForAll` functions also revert unconditionally.

### Minting

```
function mint() external
```

1. Reverts with `MintingPaused()` if paused
2. Reverts with `AddressAlreadyHasToken()` if caller already holds a token (enforced in `_update` via `balanceOf(to) > 0`)
3. Token ID is assigned sequentially from `totalSupply()`
4. Emits `Minted(address to, uint256 tokenId)`

Minting is free (no payment required). One token per address, permanently.

### Token Lookup

```
function getTokenIdOfOwner(address owner) external view returns (uint256)
```

Returns the token ID for a given address, or `type(uint256).max` if the address holds no token. Since each address can hold at most one token, this is a direct lookup via `tokenOfOwnerByIndex(owner, 0)`.

### Metadata

Token metadata is served via `baseURI + tokenId`. The base URI is set by the contract owner via `setBaseURI(string)`. A `triggerBatchMetadataUpdate()` function emits `BatchMetadataUpdate(0, type(uint256).max)` to signal indexers that all token metadata has changed.

The metadata is the **source of truth for the archetype result**. It is generated server-side from the `quiz_metadata` Postgres table (Drizzle/Railway) and served via the Honeyroad route `app/api/quiz/[tokenId]/route.ts`. Each record encodes the wallet's dominant archetype, its grid vector, and the secondary/tertiary archetypes. See [`core-lore/archetype-quiz/quiz-questions.md`](../../core-lore/archetype-quiz/quiz-questions.md) for how those values are computed.

### Owner Functions

| Function | Purpose |
|----------|---------|
| `setBaseURI(string)` | Update metadata endpoint |
| `setPaused(bool)` | Enable/disable minting |
| `triggerBatchMetadataUpdate()` | Signal metadata refresh to indexers |
| `transferOwnership(address)` | Transfer contract ownership |
| `renounceOwnership()` | Remove contract owner |

## Quiz-to-Chain Flow

The archetype assignment happens in two layers:

1. **Off-chain quiz**: Users answer **7 questions** on the Mibera Honeyroad frontend (the "Tarot Quiz" / "Archetype Quiz"). Answers are tallied and projected onto a 2-axis grid, weighted by on-chain boosts, to select one of **10 quiz archetypes** — Centurion, Oracle, Witness, Prodigal Son, Doppel, Ouroboros, Anointer, Serpent, Bound One, Phoenix. The result is saved to the `quiz_metadata` Postgres table before mint. Full mechanics: [`core-lore/archetype-quiz/quiz-questions.md`](../../core-lore/archetype-quiz/quiz-questions.md).
2. **On-chain mint**: The user calls `mint()` to create their soulbound token. The token ID is sequential and carries no on-chain archetype data — the archetype result is encoded in the off-chain metadata served at the token URI.

## Two archetype systems — do not conflate

The quiz's **10 archetypes are a separate system** from the collection's **4 trait archetypes**. They share no members and are computed differently.

| | Trait archetypes | Quiz archetypes (MIRA) |
|---|---|---|
| Count | 4 | 10 |
| Members | Freetekno, Chicago/Detroit, Acidhouse, Milady | Centurion, Oracle, Witness, Prodigal Son, Doppel, Ouroboros, Anointer, Serpent, Bound One, Phoenix |
| Basis | Rave movement, assigned from astrological birth data | Esoteric/tarot role, chosen by answering the quiz |
| Where | A generative trait on each of the 10,000 Miberas ([`core-lore/archetypes.md`](../../core-lore/archetypes.md)) | This soulbound token, one per wallet |

The contract name "ArchetypeAlignment" and token name "miChainMirror" refer to the **10 quiz archetypes** — the quiz "mirrors" a wallet's identity into one of the ten esoteric roles. It does **not** assign a trait archetype. Full detail: [`core-lore/archetype-quiz/`](../../core-lore/archetype-quiz/README.md).

## Not related to the 78 drug-tarot cards

The codex's [drug-tarot system](../../core-lore/drug-tarot-system.md) — the **78 tarot cards mapped to 78 drugs** across four suits (Wands/Fire, Cups/Water, Swords/Air, Pentacles/Earth) — has **nothing to do with this quiz**. "Tarot Quiz" is merely the frontend's colloquial nickname for the Archetype Quiz. The quiz does not draw, assign, or reference any of the 78 tarot cards; its questions and results map only to the [10 quiz archetypes](../../core-lore/archetype-quiz/README.md). The contract and ABI contain no tarot-specific data structures. The two systems share the word "tarot" and nothing else.

## Key Errors

| Error | Trigger |
|-------|---------|
| `SoulboundTokensCannotBeTransferred()` | Any transfer, approval, or burn attempt |
| `AddressAlreadyHasToken()` | Minting when caller already holds a token |
| `MintingPaused()` | Minting when contract is paused |

## Key Events

| Event | Emitted When |
|-------|-------------|
| `Minted(address to, uint256 tokenId)` | Successful mint |
| `BatchMetadataUpdate(uint256, uint256)` | Owner triggers metadata refresh or updates base URI |

## Comparison with Other Soulbound Contracts

| Feature | ArchetypeAlignment (MIRA) | FracturedMibera | Shadow Traits (MST) |
|---------|--------------------------|-----------------|---------------------|
| Soulbound | Yes | Yes | No (standard ERC-721) |
| One per wallet | Yes | One per Mibera ID | No limit |
| Mint cost | Free | Paid (BERA) | Paid (BERA) |
| Requires main Mibera | No | Yes (ownership check) | No |
| On-chain trait data | None (metadata only) | None (metadata only) | Trait string hashed on-chain |
| Upgradeable | No | No | Yes (UUPS Proxy) |

## Source

- Verified source: `src/MiberaArchetypeAlignment.sol` (retrieved from Routescan verified contract)
- GitHub repo: [mibera-contracts](https://github.com/0xHoneyJar/mibera-contracts) (private — source not accessible via public GitHub API)
- Dependencies: OpenZeppelin Contracts v5.x (`ERC721`, `ERC721Enumerable`, `Ownable`), Solady (`LibString`)
- Chain: Berachain (80094)
