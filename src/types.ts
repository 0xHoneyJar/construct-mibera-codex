export type Archetype = "Freetekno" | "Milady" | "Acidhouse" | "Chicago/Detroit";

export type Dimension = "og" | "nft" | "onchain" | "tl" | "irl";

export interface ZoneSummary {
  slug: string;
  name: string;
  emoji?: string;
  archetype: Archetype | "All";
}

export interface ZoneFull extends ZoneSummary {
  essence: string;
  era_resonance?: string;
  lynch_primitives?: Record<string, string>;
  kansei_tokens?: Record<string, string>;
  raw_section?: string;
}

export interface ArchetypeSummary {
  name: Archetype;
  era: string;
  zodiac_signs: string[];
  season: string;
}

export interface ArchetypeFull extends ArchetypeSummary {
  locations: string[];
  figures: string[];
  events: string[];
  drugs: { modern: string[]; ancient: string[] };
  ancestor_connections: string[];
  fashion: string[];
  raw_section?: string;
}

export interface FactorLore {
  factor_id: string;
  display_name: string;
  dimension: Dimension;
  archetype?: Archetype | "All";
  lore: string;
  codex_anchor?: string;
  status: "live" | "historic" | "merged";
}

export interface MiberaEntry {
  id: number;
  archetype: Archetype;
  ancestor: string;
  time_period: string;
  birthday: string;
  birth_coordinates: string;
  sun_sign: string;
  moon_sign: string;
  ascending_sign: string;
  element: "Earth" | "Fire" | "Water" | "Air";
  swag_rank: "Sss" | "Ss" | "S" | "A" | "B" | "C" | "D" | "F";
  swag_score: number;
  background: string;
  body: string;
  hair: string | null;
  eyes: string;
  eyebrows: string;
  mouth: string;
  shirt: string | null;
  hat: string | null;
  glasses: string | null;
  mask: string | null;
  earrings: string | null;
  face_accessory: string | null;
  tattoo: string | null;
  item: string | null;
  drug: string;
  parcel?: number;
}

export interface GrailAttribute {
  trait_type: string;
  value: string;
}

export interface GrailEntry {
  id?: number;
  name: string;
  type: "grail";
  category:
    | "element"
    | "luminary"
    | "concept"
    | "zodiac"
    | "planet"
    | "ancestor"
    | "primordial"
    | "special"
    | "community";
  slug: string;
  description?: string;
  image?: string;
  original_image?: string;
  attributes?: GrailAttribute[];
  commissioned_for?: string;
  status?: "on-chain" | "pending";
}

export type WorldElementType =
  | "zone"
  | "archetype"
  | "factor"
  | "grail"
  | "mibera"
  | "mst"
  | "shadow";

/**
 * Sticker catalog — shape mirrored from URL_CONTRACT v1.2.0 + StickerProfile.
 * Used by `MstEntry` and reusable for future Mibera-family sub-collections
 * (Shadow · Tarot · Candies · GIF · Fractures) as they ship sticker substrate.
 *
 * `expressionsAvailable` is the LORE — what facial states this collection
 * supports. Default to V0.6.x baseline (Mibera canon) until a per-collection
 * catalog supersedes it (PRD O-4 future scope).
 */
export interface StickerCatalog {
  manifestUrl: string;
  version: string;
  expressionsAvailable: readonly string[];
  variants: readonly string[];
  defaultVariant: string;
  perTokenBaseUrlTemplate: string;
  /** "live" once substrate bytes published; "pending" until M-1+M-2+M-3 land */
  substrateStatus: "pending" | "live";
  /** Optional human-readable note about substrate state (timing, blockers) */
  substrateNotes?: string;
}

/**
 * Mibera Shadow Traits (MST) collection — collection-level metadata + sticker
 * config. Per-token data is COMPOSED at lookup time from `tokenId` + the
 * `perTokenBaseUrlTemplate` (no per-token records exist for MST since each
 * token is dynamically minted via user-submitted trait strings hashed
 * keccak256 on-chain — see `_codex/data/shadow-traits.md`).
 */
export interface MstCollection {
  contract: string;
  chain: string;
  chainId: number;
  standard: string;
  tokenSymbol: "MST";
  name: string;
  totalSupplyKnown: number;
  narrativeRef: string;
  metadata: {
    sovereignTokenURITemplate: string;
    shippedAt: string;
    cycle: string;
  };
  stickers: StickerCatalog;
  urlContractRef: {
    version: string;
    schemaUrl: string;
    migrationPhaseId: string;
  };
}

/**
 * Per-token MST entry returned by `lookupMst(tokenId)`. Composes the
 * collection-level data with per-token URL resolution. Agents calling this
 * get everything they need to render a token (sovereign metadata URL +
 * sticker URLs per expression) without composing strings themselves.
 */
export interface MstEntry {
  type: "mst";
  ref: string;
  tokenId: number;
  collection: {
    contract: string;
    chain: string;
    standard: string;
    name: string;
    symbol: "MST";
  };
  metadata: {
    sovereignUrl: string;
  };
  stickers: {
    manifestUrl: string;
    version: string;
    expressionsAvailable: readonly string[];
    variants: readonly string[];
    defaultVariant: string;
    /** expression slug → URL (composed from perTokenBaseUrlTemplate) */
    urls: Record<string, string>;
    substrateStatus: "pending" | "live";
    substrateNotes?: string;
  };
}

export interface ValidateResult {
  canonical: boolean;
  suggested?: string;
  distance?: number;
  type: WorldElementType;
}

export interface CoverageGap {
  ts: string;
  type: WorldElementType;
  value: string;
  suggested: string | null;
  distance: number | null;
  consumer_hint?: string;
}
