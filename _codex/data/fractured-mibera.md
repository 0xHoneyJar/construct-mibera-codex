# FracturedMibera — Soulbound Companion Collections

> 10 non-transferable ERC-721 collections tied to main Mibera token IDs.

## Overview

FracturedMibera is a set of 10 soulbound (non-transferable) NFT collections on Berachain. Each collection is an independent ERC-721 contract where token IDs mirror the main Mibera collection — if you own Mibera #42, you can mint FracturedMibera #42 in each of the 10 collections.

Tokens cannot be transferred, approved, or burned after minting. They are permanently bound to the minting wallet.

## Current Contracts

| # | Address | Chain | Status |
|---|---------|-------|--------|
| 1 | `0x86db98cf1b81e833447b12a077ac28c36b75c8e1` | Berachain | active |
| 2 | `0x8d4972bd5d2df474e71da6676a365fb549853991` | Berachain | active |
| 3 | `0x144b27b1a267ee71989664b3907030da84cc4754` | Berachain | active |
| 4 | `0x72db992e18a1bf38111b1936dd723e82d0d96313` | Berachain | active |
| 5 | `0x3a00301b713be83ec54b7b4fb0f86397d087e6d3` | Berachain | active |
| 6 | `0x419f25c4f9a9c730aacf58b8401b5b3e566fe886` | Berachain | active |
| 7 | `0x81a27117bd894942ba6737402fb9e57e942c6058` | Berachain | active |
| 8 | `0xaab7b4502251ae393d0590bab3e208e2d58f4813` | Berachain | active |
| 9 | `0xc64126ea8dc7626c16daa2a29d375c33fcaa4c7c` | Berachain | active |
| 10 | `0x24f4047d372139de8dacbe79e2fc576291ec3ffc` | Berachain | active |

For machine consumption, `_codex/data/contracts.json` is authoritative: select `phases[*].current_address` or `all_addresses`. Do not select `deployment_history` records marked `superseded`.

### Deployment Lineage

An initial deployment batch preceded the active replacements by about 16 minutes. The nine first-batch contracts below have zero Transfer logs and are retained only as historical lineage. Phase 2 was not replaced.

| Phase | Historical Address | Status | Superseded By |
|-------|--------------------|--------|---------------|
| 1 | `0x6956dae88c00372b1a0b2dfbfe5eed19f85b0d4b` | superseded | `0x86db98cf1b81e833447b12a077ac28c36b75c8e1` |
| 3 | `0x77ec6b83495974a5b2c5bef943b0f2e5acd8fc26` | superseded | `0x144b27b1a267ee71989664b3907030da84cc4754` |
| 4 | `0xc557bf6c7d21ba98a40ddfe2beaba682c49d17a9` | superseded | `0x72db992e18a1bf38111b1936dd723e82d0d96313` |
| 5 | `0xbcb082bb41e892f29d9c600eaadea698d5f712ef` | superseded | `0x3a00301b713be83ec54b7b4fb0f86397d087e6d3` |
| 6 | `0x2030f226bf9a0c88687e83accdcefb7dae260094` | superseded | `0x419f25c4f9a9c730aacf58b8401b5b3e566fe886` |
| 7 | `0xcc426f9375c5edcef5ca6bdb0449c07113348cf7` | superseded | `0x81a27117bd894942ba6737402fb9e57e942c6058` |
| 8 | `0xf68f40230e39067ee7c98fe9a8641fc124c5be60` | superseded | `0xaab7b4502251ae393d0590bab3e208e2d58f4813` |
| 9 | `0xfc79b1bcca172ff5a8f74205c82f5cbb0125dd10` | superseded | `0xc64126ea8dc7626c16daa2a29d375c33fcaa4c7c` |
| 10 | `0xa3d3ef45712631a6fb50c677762b8653f932cf71` | superseded | `0x24f4047d372139de8dacbe79e2fc576291ec3ffc` |

Lineage was verified on 2026-07-18 from the deployer nonce sequence, identical runtime bytecode, and Transfer-log activity. Source: [mibera-contracts#2](https://github.com/0xHoneyJar/mibera-contracts/issues/2).

All contracts reference the main Mibera collection at `0x6666397DFe9a8c469BF65dc744CB1C733416c420`.

## Mechanics

### Soulbound Enforcement

The `_update` function is overridden to only allow minting (transfers from `address(0)`). Any transfer between addresses or burning reverts with `SoulboundTokensCannotBeTransferred()`. The `approve` and `setApprovalForAll` functions also revert.

### Minting

```
function mint(uint256[] calldata tokenIds) external payable
```

- Caller must own the corresponding Mibera token ID for each requested mint
- Batch minting supported — pass multiple token IDs in one transaction
- Payment: `mintPrice * tokenIds.length` in native BERA
- Ownership verified via `_mibera.ownerOf(tokenIds[i]) != msg.sender`

### Configuration

- `mintPrice` — configurable by owner
- `__baseURI` — metadata base URI, configurable by owner
- `withdraw()` — owner can withdraw collected mint fees

## Deployment

The collections were deployed from a single script (`DeployFractured.s.sol`) that reads configuration from `fracturedData.json`. Nine first-batch deployments were superseded by the current replacements listed above:
- Collection names and symbols
- Shared mint price
- Reference to main Mibera contract address

## Relationship to Main Collection

- Token IDs are 1:1 with main Mibera collection (token #42 mints FracturedMibera #42)
- Ownership of the main Mibera NFT is required at mint time
- After minting, the Fractured token is independent (selling the main Mibera does not affect the Fractured token, but it cannot be transferred anyway)

## Source

- Contract: `mibera/src/FracturedMibera.sol` in [mibera-contracts](https://github.com/0xHoneyJar/mibera-contracts)
- Deploy script: `mibera/script/DeployFractured.s.sol`
- Standard: ERC-721 (soulbound — transfer restricted)
- Chain: Berachain (80094)
