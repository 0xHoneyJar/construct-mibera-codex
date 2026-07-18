# Mibera Ecosystem Contract ABIs

ABI files for all Mibera ecosystem smart contracts, fetched from block explorers.

## Berachain (Chain 80094)

| Contract | Address | File | Status |
|----------|---------|------|--------|
| Mibera (main collection) | `0x6666397DFe9a8c469BF65dc744CB1C733416c420` | `mibera.json` | Verified (52 entries) |
| Treasury | `0xaa04F13994A7fCd86F3BbbF4054d239b88F2744d` | `treasury.json` | Unverified |
| Candies | `0xecA03517c5195F1edD634DA6D690D6c72407c40c` | `candies.json` | Verified (39 entries) |
| CandiesMarket | `0x80283fbF2b8E50f6Ddf9bfc4a90A8336Bc90E38F` | `candies-market.json` | Proxy ABI only (ERC1967) |
| VendingMachine (Shadow Traits) | `0x048327A187b944ddac61c6e202BfccD20d17c008` | `vending-machine.json` | Proxy ABI only (ERC1967) |
| BeraMarketMinter | `0x66660f4Bb0B7b11b9f12F613F4CF043516EB3b20` | `bera-market-minter.json` | Unverified |
| MiberaTrade | `0x90485B61C9dA51A3c79fca1277899d9CD5D350c2` | `mibera-trade.json` | Unverified |
| Accounts | `0xC0a78722889c7De7E6eF4B7dB1FeD5b4B97d6dA1` | `accounts.json` | Unverified |
| FracturedMibera (current phase 1) | `0x86db98cf1b81e833447b12a077ac28c36b75c8e1` | `fractured-mibera.json` | Verified (39 entries) |

> All 10 current FracturedMibera contracts share the same ABI. The stored ABI was originally fetched from superseded phase 1 contract `0x6956dae88c00372b1a0b2dfbfe5eed19f85b0d4b`; its runtime bytecode is identical to the active replacement. See [_codex/data/fractured-mibera.md](../fractured-mibera.md) for lineage.

## Optimism (Chain 10)

| Contract | Address | File | Status |
|----------|---------|------|--------|
| MiberaSets | `0x886D2176D899796cD1AfFA07Eff07B9b2B80f1be` | `mibera-sets.json` | Unverified |

## Data Sources

- **Berachain**: [Routescan API](https://api.routescan.io/v2/network/mainnet/evm/80094/etherscan/api) (Etherscan-compatible)
- **Optimism**: [Optimism Blockscout](https://optimism.blockscout.com/) / Etherscan V2

## Notes

- **Proxy contracts** (CandiesMarket, VendingMachine): Returned ERC1967 proxy ABI. Implementation ABIs may be available once the implementation contracts are verified.
- **Unverified contracts**: Saved with a stub JSON indicating the contract source code is not verified on the explorer. Re-fetch when contracts are verified.
- **Fetched**: 2026-02-18
