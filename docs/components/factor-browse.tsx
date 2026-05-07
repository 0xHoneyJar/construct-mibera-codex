/**
 * FactorBrowse — Network Mysticism grimoire browse.
 *
 * 28 score-mibera factors mapped to codex lore, grouped by dimension
 * (og / nft / onchain). Each factor card shows: id (mono), display
 * name, archetype anchor, live/historic status, and the cultural
 * lore that grounds the factor.
 *
 * Data inlined from core-lore/factor-lore.md. Regenerate with:
 *   python3 scripts/extract-factors.py  (one-off in chat history)
 * The MD file stays the source of truth — keep this in sync when
 * Gumi curates new factors.
 */

type Factor = {
  id: string;
  dimension: "og" | "nft" | "onchain";
  archetype: string;
  status: "live" | "historic" | "merged";
  display_name: string;
  lore: string;
};

const FACTORS: Factor[] = [
  { id: "og:jani_keys", dimension: "og", archetype: "All", status: "live", display_name: "Jani Keys", lore: "Jani's Friendtech Keys. If you had one, you likely obtained one in order to get mibera WL." },
  { id: "og:cfang_keys", dimension: "og", archetype: "Milady", status: "live", display_name: "Cfang Keys", lore: "Cfang's Friendtech Keys. If you had one, you likely obtained one in order to get mibera WL." },
  { id: "og:articles", dimension: "og", archetype: "All", status: "live", display_name: "Articles", lore: "Written-form OG signal. Long-form pieces which documented the culture while it was being built." },
  { id: "og:sets", dimension: "og", archetype: "All", status: "live", display_name: "Mibera Sets", lore: "A collection of articles, posters, and music — later represented by pieces of art minted on Optimism. Predates Mibera mainstem." },
  { id: "og:cubquest", dimension: "og", archetype: "Freetekno", status: "live", display_name: "CubQuest", lore: "Quest engine OG participation. Showed up when the coordinates dropped and there was nothing but a field and a sound system. You were there." },

  { id: "nft:mibera", dimension: "nft", archetype: "All", status: "live", display_name: "Mibera NFT", lore: "The foundational holding. 10,000 Miberas built from 1337 traits total — each with an archetype, ancestor, birthday, and signal hierarchy. Hand-painted on iPad in Procreate over 18 months." },
  { id: "nft:mibera_quality", dimension: "nft", archetype: "All", status: "historic", display_name: "Mibera Quality", lore: "Folded into nft:mibera as a multiplier. Swag score still exists per Mibera, just not counted separately anymore." },
  { id: "nft:fractures", dimension: "nft", archetype: "All", status: "live", display_name: "Fractures", lore: "Fracture pieces from the Mibera reveal. 11 phases, each exposing more of the character underneath. Shards of a larger image that only made sense in sequence." },
  { id: "nft:fractures_complete", dimension: "nft", archetype: "All", status: "historic", display_name: "Complete Fracture Sets", lore: "Folded into nft:fractures as a quality multiplier. Completeness used to be its own signal." },

  { id: "onchain:miberamaker", dimension: "onchain", archetype: "All", status: "live", display_name: "Mibera Maker", lore: "The maker contract. Where grails and 1-of-1s get minted. 43 hand-drawn pieces with cultural context." },
  { id: "onchain:validator_booster", dimension: "onchain", archetype: "Chicago/Detroit", status: "live", display_name: "Validator Booster", lore: "Berachain validator boosting. Foundational infrastructure. The warehouse doesn't need a sign." },
  { id: "onchain:candies_minter", dimension: "onchain", archetype: "Freetekno", status: "live", display_name: "Candies Minter", lore: "Honey Candies minting. Sticky sweet, passed hand to hand. Tea stall energy." },
  { id: "onchain:gif_minter", dimension: "onchain", archetype: "Milady", status: "live", display_name: "GIF Minter", lore: "Animated frame collecting. Quick-cut, swipe-speed energy. Everything glows, everything moves." },
  { id: "onchain:tarot_minter", dimension: "onchain", archetype: "Acidhouse", status: "live", display_name: "Tarot Minter", lore: "Drug-tarot card mints. 78 cards mapping molecules to divinatory arcana. The owsley-lab synthesis floor." },
  { id: "onchain:zora_collector", dimension: "onchain", archetype: "Milady", status: "live", display_name: "Zora Collector", lore: "Zora-network collecting. The el-dorado bazaar in protocol form. The treasure is real but the map keeps changing." },
  { id: "onchain:beraji_staker", dimension: "onchain", archetype: "Chicago/Detroit", status: "live", display_name: "Beraji Staker", lore: "Beraji staking. Protocol-level commitment. Chosen Few energy — keep showing up, keep the warehouse open." },
  { id: "onchain:shadow_minter", dimension: "onchain", archetype: "Acidhouse", status: "live", display_name: "Shadow Minter", lore: "Shadow mints from the vending machine. 102 exclusive traits not in the main collection. The unseen layer." },
  { id: "onchain:milady_burner", dimension: "onchain", archetype: "Milady", status: "live", display_name: "Milady Burner", lore: "Burning Milady-adjacent assets. Wartime aesthetic. MIBERA IS THE REFUSAL — sometimes refusal is combustion." },
  { id: "onchain:mibera_burner", dimension: "onchain", archetype: "All", status: "live", display_name: "Mibera Burner", lore: "Burning Miberas. The rave clears its own floor." },
  { id: "onchain:cubquest_minter", dimension: "onchain", archetype: "Freetekno", status: "live", display_name: "CubQuest Minter", lore: "Quest reward mints. The wristband from the festival. You followed the coordinates, you earned the mark." },
  { id: "onchain:liquid_backing", dimension: "onchain", archetype: "All", status: "live", display_name: "Liquid Backing", lore: "Protocol-owned liquidity. Structural commitment that doesn't announce itself. Concrete under the dance floor." },
  { id: "onchain:loan_taker", dimension: "onchain", archetype: "Acidhouse", status: "live", display_name: "Loan Taker", lore: "Borrowing against on-chain assets. Leveraged risk. The come-up." },
  { id: "onchain:loan_defaulter", dimension: "onchain", archetype: "Acidhouse", status: "live", display_name: "Loan Defaulter", lore: "Defaulted positions. The come-down. Not moral judgment — pharmacokinetics applied to capital." },
  { id: "onchain:liquidator", dimension: "onchain", archetype: "Freetekno", status: "live", display_name: "Liquidator", lore: "Liquidation participation. Enforcement at the perimeter. The tree line where torchlight gives out." },
  { id: "onchain:paddle_supplier", dimension: "onchain", archetype: "All", status: "live", display_name: "Paddle Supplier", lore: "Paddle protocol liquidity supply. Depth in the pool." },
  { id: "onchain:paddle_borrower", dimension: "onchain", archetype: "All", status: "live", display_name: "Paddle Borrower", lore: "Paddle protocol borrowing. Drawing from the pool." },
  { id: "onchain:paddle_liquidated", dimension: "onchain", archetype: "All", status: "live", display_name: "Paddle Liquidated", lore: "Paddle position liquidated. The pool reclaims what the pool provided." },
  { id: "onchain:paddle_liquidator", dimension: "onchain", archetype: "All", status: "live", display_name: "Paddle Liquidator", lore: "Paddle liquidation enforcement. Returning the pool to equilibrium." },
];

const DIMENSION_LABELS: Record<Factor["dimension"], { label: string; gloss: string }> = {
  og:      { label: "OG",      gloss: "Pre-archetype era — the foundation"  },
  nft:     { label: "NFT",     gloss: "Asset signals — what you hold"        },
  onchain: { label: "Onchain", gloss: "Activity signals — what you've done" },
};

const STATUS_LABEL: Record<Factor["status"], string> = {
  live: "live",
  historic: "historic",
  merged: "merged",
};

export function FactorBrowse() {
  const grouped: Record<Factor["dimension"], Factor[]> = { og: [], nft: [], onchain: [] };
  for (const f of FACTORS) grouped[f.dimension].push(f);

  return (
    <div className="factor-browse">
      {(Object.keys(grouped) as Factor["dimension"][]).map((dim) => {
        const list = grouped[dim];
        if (list.length === 0) return null;
        const meta = DIMENSION_LABELS[dim];
        return (
          <section key={dim} className="factor-browse__dimension">
            <header className="factor-browse__dim-head">
              <h2 className="factor-browse__dim-label">
                <span className="factor-browse__dim-name">{meta.label}</span>
                <span className="factor-browse__dim-count" aria-hidden>{list.length}</span>
              </h2>
              <p className="factor-browse__dim-gloss">{meta.gloss}</p>
            </header>
            <ul className="factor-browse__grid" role="list">
              {list.map((f) => (
                <li key={f.id}>
                  <article className={`factor-card factor-card--${f.status}`}>
                    <header className="factor-card__head">
                      <code className="factor-card__id">{f.id}</code>
                      {f.status !== "live" ? (
                        <span className="factor-card__status">{STATUS_LABEL[f.status]}</span>
                      ) : null}
                    </header>
                    <div className="factor-card__title-row">
                      <h3 className="factor-card__name">{f.display_name}</h3>
                      <span className="factor-card__archetype">{f.archetype}</span>
                    </div>
                    <p className="factor-card__lore">{f.lore}</p>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
