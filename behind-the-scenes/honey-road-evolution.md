# The Honey Road

*How a Silk Road parody became a living marketplace — from first commit to the product that exists today.*

---

## Overview

HoneyRoad — the frontend face of Mibera — was not planned as a roadmap and executed on schedule. It was built in bursts — a seven-day prototype, an eight-month pause, then a feature storm that shipped a forum, a DeFi system, and ten fracture reveals in the span of weeks. The Silk Road parody wasn't a marketing angle applied after the fact. It was the founding intent, encoded in the very first component names.

The repo is `mibera-interface`. The product is **HoneyRoad**.

This document traces HoneyRoad's evolution from its first commit on December 9, 2023 through to the living marketplace that exists today. It is a companion to [Creative Process](creative-process.md) (the art) and [Team History](team-history.md) (the people). Where those documents end — roughly August 2024 — this one begins.

**Confidence markers**: ✅ Confirmed via git history (commit hash cited) · ⚠️ Inferred from code patterns or timing · ❓ Needs human validation

---

## I. The Seven-Day Marketplace (December 2023)

HoneyRoad started on December 9, 2023 — a Next.js + wagmi + bun scaffold. ✅ `3cd8d8dc`

What happened next was not a prototype in the exploratory sense. Within seven days, the core marketplace was functional:

- **Day 1**: VerdanaPro fonts added ✅ `22247dc5` — the typography choice that telegraphed the dark market aesthetic before a single feature existed
- **Day 2**: `DrugCard` component ✅ `9dae4a8b` — "candies = drugs" made concrete in code. `DrugPage` for individual listings ✅ `343a8701`
- **Day 3**: `VendorPage` for seller storefronts ✅ `e262b06d`. `CartPage` for the shopping cart ✅ `8c200e28`
- **Day 4**: Supabase integration (PR #1) ✅ `24726065` — the first backend, providing the database for listings, reviews, and sellers
- **Day 7**: First on-chain checkout ✅ `c46b69fe` — "checking out on contract"
- **Day 7**: Forum appears as static articles ✅ `a0a5391b`. Backing appears as a navigation route ✅ `11f9991c`

The naming is the tell. Not "items" and "shops" — *drugs* and *vendors*. Not "marketplace" — the *Honey Road*. The parody identity was never a pivot. It was the first architectural decision.

⚠️ The VerdanaPro font choice on day 1 may have been inherited from an earlier prototype or design mockup. The intent is clear, but the origin of the font decision itself is undocumented.

---

## II. The Encrypted Vendor (January – February 2024)

With the core marketplace standing, the team built out the features that made it feel like a real dark market:

| Date | Feature | Hash |
|------|---------|------|
| Dec 29, 2023 | Basic messaging display | ✅ `e924d208` |
| Dec 31, 2023 | SIWE (Sign-In With Ethereum) + messaging (PR #14) | ✅ `abc341b3` |
| Jan 2, 2024 | **PGP encryption** — "can decrypt messages" | ✅ `cedcd4ce` |
| Jan 4, 2024 | Orders page + reviews — "leave review (= finalize) order" | ✅ `d1abaf54` |
| Jan 10, 2024 | "buyer guide" — onboarding content mirroring darknet market UX | ✅ `ca2f26df` |
| Jan 31, 2024 | Quest system — quest status updates on successful checkout | ✅ `67ea1271` |
| Feb 5, 2024 | "parallelized gpt" — first GPT integration | ✅ `61444b53` |
| Feb 6, 2024 | Mobile view (PR #18) | ✅ `af9f4f2b` |

PGP-encrypted vendor messages. A buyer guide. Order finalization via on-chain review. These aren't marketplace features — they're *dark market* features, implemented with the fidelity of someone who understood the source material.

---

## III. The Vending Machine (February – March 2024)

The Vending Machine (VM) is the generative NFT avatar builder — a trait composition system where holders customize their Mibera by selecting and combining traits.

| Date | Milestone | Hash |
|------|-----------|------|
| Feb 21, 2024 | VM UI created | ✅ `c9075146` |
| Feb 22, 2024 | Trait loading — all traits available for composition | ✅ `c20de46e` |
| Feb 26, 2024 | Trait conflict detection — "warning of used traits combination" | ✅ `8823053b` |
| Mar 8, 2024 | **Swag score** — scoring/ranking system for VM builds | ✅ `caf986ac` |
| Mar 29, 2024 | Wagmi v2 migration (PR #26) | ✅ `7f5cd123` |

The VM is where the [Swag Scoring system](../swag-scoring/README.md) becomes tangible — not a number in a database but a live score that updates as you compose your avatar.

---

## IV. The First AI Agent (April 2024)

On April 15, 2024, HoneyGPT was deployed as a cron-based forum poster (PR #28) ✅ `5fc3f8f6`. This was the first version of what would later become a threaded conversation agent with real database tools and the ability to act as a vendor on the marketplace.

In the same month, the auth stack migrated from Privy to RainbowKit ✅ `cd0b1e2f` — the first of what would become four auth system changes over the project's life.

---

## V. The Berachain Wait (June 2024 – February 2025)

Between June 26, 2024 (`4e304dd1`) and February 27, 2025 (`c0b60759`), HoneyRoad saw two commits. Both were infrastructure changes — image hosting migration. Eight months of near-silence.

This was The Long Wait referenced in [Team History](team-history.md) — the period when Berachain mainnet was delayed and the team held position. The art was complete (see [Creative Process](creative-process.md)). The prototype was functional. The contracts were being audited (audit fixes appear in the contracts repo around May 2024 ⚠️). But the chain wasn't live.

❓ What the team was doing during this period — contract development, community building, planning — is not documented in git. Discord archives or team memory may fill this gap.

---

## VI. Honey Road Artifacts (August – September 2024)

During The Wait, the Honey Road artifacts shipped on Optimism. The [MiberaSets contract](../mibera-sets/README.md) was initialized on August 23, 2024 and renamed on September 4, 2024 (mibera-lore git history ⚠️).

Twelve ERC-1155 tokens — seven numbered sets, four media sets (Articles, Music, Posters, Video), one completionist set (Supersetooor) — deployed at [`0x886D2176D899796cD1AfFA07Eff07B9b2B80f1be`](https://optimistic.etherscan.io/address/0x886D2176D899796cD1AfFA07Eff07B9b2B80f1be) on Optimism. 481 supply, 309 holders.

These were the first tangible Mibera product to reach holders, months before the main collection minted.

---

## VII. The Presale (February – March 2025)

Berachain went live. HoneyRoad reactivated with a presale system:

| Date | Milestone | Hash |
|------|-----------|------|
| Feb 27, 2025 | "port over presale app + add dynamic" — Dynamic Labs replaces all previous auth | ✅ `c0b60759` |
| Mar 9, 2025 | "use fisher yates and provably fair seed" — provably fair randomization | ✅ `d48dde03` |
| Mar 11, 2025 | Privy fully stripped — Dynamic-only | ✅ `4f6994a9` |
| Mar 18, 2025 | Presale merged (PR #30) — multi-phase with merkle trees | ✅ `6439b231` |
| Mar 22, 2025 | "switch to berachain" — Berachain set as target chain | ✅ `d36cf1b6` |
| Mar 25, 2025 | App pages unhidden — site goes live | ✅ (interface git) |

The auth stack evolution tells its own story: SIWE → Privy → RainbowKit → Dynamic Labs. Four systems in two years, each migration driven by the chain's infrastructure requirements. ⚠️

---

## VIII. The Feature Storm (March – May 2025)

What followed the presale was the highest-velocity period in the project's history. In roughly six weeks, the team shipped:

### The Forum Clone

| Date | Milestone | Hash |
|------|-----------|------|
| Mar 30, 2025 | "wip forum" — forum rebuild begins | ✅ `5cc1ca8f` |
| Mar 31, 2025 | **"wip smf styling"** — the SMF parody crystallizes | ✅ `df361b3a` |
| Mar 31, 2025 | "add smf logo" | ✅ `7b5e820c` |
| Apr 1, 2025 | "add forums verdana font" — typography fidelity | ✅ `900c0493` |
| Apr 2, 2025 | Admin posting + forum replies | ✅ `b27dd030` |
| Apr 6, 2025 | Forum validation | ✅ `f0f5522d` |

The forum's evolution mirrors the marketplace: concept appears early (Dec 2023, as "articles"), goes dormant, then returns with full commitment to the source material. The SMF (Simple Machines Forum) parody — faithful typography, layout, even the logo — was a deliberate recreation, not a generic forum with a skin.

> *"Milady are making a 4chan. We're making a Silk Road."*
> — tez33

### Backing & Loans

The [Treasury contract](../_codex/data/42-motif.md) went live with the [42 motif](../_codex/data/42-motif.md) threaded through every parameter:

| Date | Milestone | Hash |
|------|-----------|------|
| Mar 26, 2025 | "wip backing page" — Backing/DeFi feature begins | ✅ `59aff917` |
| Apr 21, 2025 | Receive loan section + active loans | ✅ `2a4d58f8`, `507a3193` |

The backing system lets holders collateralize their Mibera NFTs for loans — 4.20% interest, 4.2-month terms, 42 WETH NoFloat. The numbers aren't arbitrary. They're a design signature (see [The 42 Motif](../_codex/data/42-motif.md)).

### Fractures & Reveals

| Date | Milestone | Hash |
|------|-----------|------|
| Apr 21, 2025 | "wip fractures page" | ✅ `1f56c718` |
| Apr 23, 2025 | miReveal 1.1 — first reveal event | ✅ `cec86b1c` |
| Apr 29, 2025 | miReveal 1.2 | ✅ `33841fef` |
| May 1, 2025 | miReveal 1.3 | ✅ `8f760ebf` |
| May 20, 2025 | miReveal 8.8 — final reveal | ✅ `38bdb04f` |

Ten [fracture reveals](../fractures/README.md) — from MiParcels through miReveal 8.8 — each progressively resolving the artwork. Ten soulbound companion collections deployed across April 17–21, 2025 (contracts git ⚠️).

### Everything Else in April

| Date | Feature | Hash |
|------|---------|------|
| Apr 15, 2025 | Vending Machine merged (PR #34) | ✅ `80c5090a` |
| Apr 19, 2025 | Candies + market contract addresses updated | ✅ `d4c35127` |
| Apr 22, 2025 | Stash page — user portfolio/inventory | ✅ `a9fa783f` |
| Apr 24, 2025 | Quiz system begins | ✅ `e22ecc80` |
| Apr 26, 2025 | Esoteric role scoring for on-chain actions | ✅ `9d6471dc` |
| Apr 27, 2025 | Gallery page (PR #36) | ✅ `ce86da35` |
| Apr 29, 2025 | Esoteric role layering — visual overlays on NFTs | ✅ `b63bde51` |
| Apr 29, 2025 | NFT minting added to site | ✅ `f3baebd6` |
| May 1, 2025 | Tarot NFTs integrated into stash | ✅ `4197b5c7` |
| May 1, 2025 | Trigger.dev adopted for metadata management | ✅ `4a057c9f` |

---

## IX. The Living Market (August 2025 – Present)

After the feature storm, HoneyRoad matured from prototype to production:

### HoneyGPT Phase 2

The AI agent evolved from a simple cron poster into a threaded conversation system with real database tools:

| Date | Milestone | Hash |
|------|-----------|------|
| Nov 7, 2025 | Threaded conversations for messaging | ✅ `cb9867db` |
| Nov 7, 2025 | HoneyGPT connected to real database — becomes a vendor agent | ✅ `71e1c6e7` |
| Nov 28, 2025 | HoneyGPT posts on the forum via Trigger.dev | ✅ `f6185d4a` |

### Infrastructure Evolution

| Date | What Changed | Hash |
|------|-------------|------|
| Nov 2, 2025 | Envio replaces Subsquid as indexer | ✅ `750189fe` |
| Nov 6, 2025 | Server actions migrated to next-safe-action v8 | ✅ `0086dbcd` |
| Dec 7, 2025 | Security audit — multiple HIGH/MEDIUM/LOW fixes | ✅ `595bbcb3` |
| Dec 19–20, 2025 | GIF minting via Trigger.dev | ✅ `d6232df3`, `0dbf8025` |
| Feb 1, 2026 | Loa framework mounted (v1.7.2) | ✅ `2ac59594` |
| Feb 14, 2026 | "migrate all API routes from dead subsquid to Envio" | ✅ `26ee6fa3` |

The commit message "dead subsquid" tells the infrastructure story in two words. Subsquid was adopted in April 2025, deprecated by November, and fully removed by February 2026 — replaced by Envio.

### Additional Features

| Date | Feature | Hash |
|------|---------|------|
| May 14, 2025 | Mibera Exchange | ✅ (interface git) |
| May 22–24, 2025 | Nichibis presale | ✅ (interface git) |
| May 26–27, 2025 | GIF Maker | ✅ (interface git) |
| Dec 2025 | VM sandbox mode + paint mode + necklaces | ✅ (interface git) |
| Dec 2025 | Onomancer Bot deployment | ✅ (interface git) |

---

## X. The Tech Stack Story

The auth stack alone tells a story about building on an emerging chain:

```
Dec 2023    SIWE (Sign-In With Ethereum) — web3-native baseline
    ↓
Apr 2024    Privy → RainbowKit — wallet abstraction
    ↓
Feb 2025    Dynamic Labs — social login + wallet, Berachain-compatible
```

The full stack as it exists today:

| Layer | Technology | Adopted |
|-------|-----------|---------|
| Framework | Next.js 15 | Dec 2023 |
| Wallet | Wagmi v2 + Dynamic Labs | Mar 2024 / Feb 2025 |
| Database | Supabase | Dec 2023 |
| Indexer | Envio (replaced Subsquid) | Nov 2025 |
| Background jobs | Trigger.dev | May 2025 |
| AI agent | HoneyGPT (AI SDK v4) | Apr 2024 / Nov 2025 |
| State | Zustand | ⚠️ (date unknown) |
| Server actions | next-safe-action v8 | Nov 2025 |
| Dev framework | Loa | Feb 2026 |

---

## XI. Patterns

**The parody was the architecture.** `DrugCard`, `VendorPage`, `CartPage` on day 2. PGP encryption on day 24. A buyer guide on day 32. The SMF forum clone on day 478. Every feature was built to match the source material, not to approximate it.

**Burst development.** A seven-day prototype. An eight-month pause. Then a six-week storm that shipped more features than the entire preceding year. The project moves in punctuated equilibria, not sprints.

**The 42 motif is load-bearing.** Not decoration — every economic parameter in the Treasury and CandiesMarket contracts references 42 or its derivatives. 4.2 BERA mint price, 4.20% interest, 42% max discount, 69420 seized candy ID. The number is a design signature that makes Mibera contracts recognizable on-chain (see [The 42 Motif](../_codex/data/42-motif.md)).

**Auth stack churn was environmental, not indecisive.** Four auth systems in two years reflects building on an emerging chain where the infrastructure was still settling. Each migration was forced by the environment: SIWE was too raw, Privy didn't survive the RainbowKit era, RainbowKit didn't support Berachain, Dynamic did.

**HoneyGPT evolved from toy to participant.** A cron-based forum poster in April 2024 became a threaded conversation agent with real database access and vendor tools by November 2025. The AI isn't bolted on — it's a vendor in the marketplace.

---

## Timeline Summary

| Period | Phase | Key Events |
|--------|-------|------------|
| Dec 9–16, 2023 | The Seven-Day Marketplace | DrugCard, VendorPage, CartPage, Supabase, first on-chain checkout |
| Jan – Feb 2024 | The Encrypted Vendor | PGP messaging, SIWE, buyer guide, orders/reviews, quests |
| Feb – Mar 2024 | The Vending Machine | VM trait builder, swag scoring, Wagmi v2 |
| Apr 2024 | The First AI Agent | HoneyGPT cron, Privy → RainbowKit migration |
| Jun 2024 – Feb 2025 | The Berachain Wait | 8-month pause; MiberaSets ship on Optimism (Aug–Sep 2024) |
| Feb – Mar 2025 | The Presale | Dynamic Labs, provably fair randomization, merkle trees, Berachain chain switch |
| Mar – May 2025 | The Feature Storm | SMF forum, backing/loans, fractures, gallery, quiz, tarot, VM merge, 10 miReveals |
| Aug – Dec 2025 | The Living Market | HoneyGPT v2, Envio migration, security audit, GIF minting, Trigger.dev standardization |
| Jan – Feb 2026 | Operational Maturity | Loa framework, full Envio migration, loan UI refinements |

---

## Contributors

HoneyRoad was built primarily by **soju (treblale/zksoju)** — 915 of 1,608 commits — with significant contributions from **jani (janitooor)** on full-stack and contract integration, **zerker (notzerker/zergucci)** on architecture and auth infrastructure, and **exp.table** on smart contracts, VM traits, and on-chain logic. See [Team History](team-history.md) for full profiles.

---

## Source

All dates and commit hashes are from `git log` of [mibera-interface](https://github.com/0xHoneyJar/mibera-interface). Contract deployment dates cross-referenced with [mibera-contracts](https://github.com/0xHoneyJar/mibera-contracts) and [mibera-lore](https://github.com/0xHoneyJar/mibera-lore) git histories. Items marked ⚠️ are inferred from code patterns or adjacent commit timing. Items marked ❓ require human validation — team memory or Discord archives may provide primary sources.

---

*This document is a draft for review. The team should validate dates, fill gaps marked with ❓, and add quotes or context from Discord/conversations that capture the intent behind key decisions. The git history tells you what happened and when. Only the people who were there can tell you why.*
