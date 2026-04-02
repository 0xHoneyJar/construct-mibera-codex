# Sprint Plan: Cycle 002 — Content Gap Remediation

**Version**: 1.0.0
**Date**: 2026-02-15
**Cycle**: 002
**PRD**: `grimoires/loa/prd.md`
**SDD**: `grimoires/loa/sdd.md`
**Sprints**: 1

---

## Sprint 1: Fix All Content Gaps

**Goal**: Resolve all 6 documented content gaps from Cycle 001 audit, achieving 0 errors and 0 broken links.

### Tasks

#### S1-T1: Create missing files (G1 + G5)

**Description**: Create the missing Traveller ancestor stub and the two trait variant stubs. These are net-new files with no rename/redirect complexity.

**Acceptance Criteria**:
- [ ] `core-lore/ancestors/traveller.md` exists with valid YAML frontmatter (name, period_ancient, period_modern, locations)
- [ ] `core-lore/ancestors/traveller.md` follows exact section structure of existing ancestor files
- [ ] `traits/character-traits/eyes/ecstasy-brown-2.md` exists with valid frontmatter (name, image, date_added)
- [ ] `traits/character-traits/eyes/crying-ocean-2.md` exists with valid frontmatter (name, image, date_added)
- [ ] `audit-links.sh` shows 92 fewer broken links (Traveller) + 2 fewer (trait variants) = 94 fewer

#### S1-T2: Rename drug files and update all references (G2 + G3)

**Description**: Rename `mucana-pruriens.md` → `mucuna-pruriens.md` and `yohimbine.md` → `yohimbe.md`. Update all internal links across the codex (~252 files). Update YAML name fields and headings in the renamed files.

**Acceptance Criteria**:
- [ ] `traits/overlays/molecules/mucuna-pruriens.md` exists with correct `name: Mucuna Pruriens`
- [ ] `traits/overlays/molecules/mucana-pruriens.md` no longer exists
- [ ] `traits/overlays/molecules/yohimbe.md` exists with correct `name: Yohimbe`
- [ ] `traits/overlays/molecules/yohimbine.md` no longer exists
- [ ] All link targets `mucana-pruriens.md` updated to `mucuna-pruriens.md` across codex
- [ ] All link targets `yohimbine.md` updated to `yohimbe.md` across codex
- [ ] Link display text `[Mucana Pruriens]` updated to `[Mucuna Pruriens]` in Mibera files
- [ ] Link display text `[Yohimbine]` updated to `[Yohimbe]` in Mibera files
- [ ] Body text references to "yohimbine" (the alkaloid) in other drug files left unchanged
- [ ] `generate-browse.sh` normalization map updated if needed
- [ ] `audit-links.sh` shows 0 broken links to these files

#### S1-T3: Delete corrupted sakae-naa.md and redirect references (G4)

**Description**: Delete the corrupted `sakae-naa.md` duplicate and update all ~164 references to point to the correct `sakae-na.md`.

**Acceptance Criteria**:
- [ ] `traits/overlays/molecules/sakae-naa.md` no longer exists
- [ ] All link targets `sakae-naa.md` updated to `sakae-na.md` across codex
- [ ] All link display text `[Sakae Naa]` updated to `[Sakae Na]` across codex
- [ ] Tarot card `five-of-cups.md` updated to reference `sakae-na.md`
- [ ] `audit-links.sh` shows 0 broken links to sakae-naa
- [ ] `audit-structure.sh` error count drops by 1 (corrupted file removed)

#### S1-T4: Add type field to special collections (G6)

**Description**: Add `type` field to YAML frontmatter and body of 4 special collection files.

**Acceptance Criteria**:
- [ ] `apdao.md` has `type: "DAO"` in frontmatter and `**Type:** DAO` in body
- [ ] `beradoge.md` has `type: "NFT"` in frontmatter and `**Type:** NFT` in body
- [ ] `berakin.md` has `type: "NFT"` in frontmatter and `**Type:** NFT` in body
- [ ] `gumball.md` has `type: "DeFi"` in frontmatter and `**Type:** DeFi` in body
- [ ] `audit-structure.sh` error count drops by 4

#### S1-T5: Final validation and cleanup

**Description**: Run full audit suite. Update NOTES.md to clear resolved blockers. Regenerate browse pages. Update manifest.json if needed.

**Acceptance Criteria**:
- [ ] `audit-structure.sh`: **0 errors**, 0 warnings
- [ ] `audit-links.sh`: **0 broken links**
- [ ] `generate-browse.sh` runs with 0 warnings
- [ ] `grimoires/loa/NOTES.md` blockers section cleared of resolved items
- [ ] `manifest.json` ancestor count updated if needed (32 → 33)
