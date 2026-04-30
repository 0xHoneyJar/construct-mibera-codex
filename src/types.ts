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
  description?: string;
  commissioned_for?: string;
  status?: "on-chain" | "pending";
}

export type WorldElementType = "zone" | "archetype" | "factor" | "grail" | "mibera";

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
