# Sprint Plan: CDN URL Migration — assets.0xhoneyjar.xyz

**Cycle:** 023
**Created:** 2026-04-29
**Sprints:** 2
**Estimated effort:** Medium (1 script + mechanical rewrite across ~50K refs + grail image fix)

---

## Sprint 1: URL Migration (COMPLETE)

**Status:** Complete. PR #55 merged (140K refs), PR #58 open (2.6K mibera.s3 refs).

---

## Sprint 2: Grail Image Fix & Mibera↔Grail Cross-Links

**Goal:** Fix all 43 broken grail images and add bidirectional grail↔mibera references.

### Problem

The CDN migration (PR #55) rewrote grail image URLs from `gateway.irys.xyz` to `assets.0xhoneyjar.xyz/reveal_phase8/images/{name}.png`. But grail images use **named files** (e.g., `satoshi.png`, `scorpio.PNG`) while regular miberas use **hash-named files**. The named files were never synced to S3 — they only exist on Irys. All 43 grail images now return 403.

Additionally, mibera files for grail tokens (e.g., #4488) have no reference to their grail status. The relationship is unidirectional: grail→mibera via the `id` field. There's no way to know a mibera is a grail by reading its .md file.

### T-2.1: Download grail images from Irys and upload to S3

**Description:** The 43 grail images exist on Irys at `gateway.irys.xyz/7rpvwFYcB5t7S1HziaBAr4RgfAFpqCwCYbFUbkFqpbAq/{name}.{ext}`. Download them and request soju/zerker upload to `thj-assets` at a path the CDN serves (e.g., `Mibera/grails/{name}.{ext}` or `reveal_phase8/images/{name}.{ext}`).

**Acceptance criteria:**
- All 43 grail images downloaded from Irys
- All 43 images uploaded to S3 and confirmed 200 via CDN
- Grail .md files updated with correct CDN URLs
- Images render on GitHub

---

### T-2.2: Add `grail` field to mibera frontmatter

**Description:** For all 43 grail-linked miberas, add a `grail` field to YAML frontmatter and a grail row in the traits table. Write `_codex/scripts/add-grail-backlinks.py` following the same pattern as `add-parcel-backlinks.py`.

43 miberas to patch:

| Grail | Mibera ID | Grail | Mibera ID |
|-------|-----------|-------|-----------|
| Air | #2769 | Earth | #3244 |
| Fire | #6458 | Water | #6761 |
| Moon | #309 | Sun | #3116 |
| Black Hole | #876 | Past | #4221 |
| Future | #4734 | Aries | #4803 |
| Taurus | #2113 | Gemini | #7218 |
| Cancer | #8620 | Leo | #9639 |
| Virgo | #8834 | Libra | #895 |
| Scorpio | #235 | Sagittarius | #7321 |
| Capricorn | #8971 | Aquarius | #6805 |
| Pisces | #6409 | Mercury | #9112 |
| Venus | #4617 | Mars | #2566 |
| Jupiter | #3201 | Saturn | #7388 |
| Neptune | #2256 | Pluto | #1606 |
| Buddhist | #9503 | Chinese | #392 |
| Ethiopian | #7702 | Greek | #1630 |
| Hindu | #8277 | Japanese | #4363 |
| Mayan | #3970 | Mongolian | #507 |
| Native American | #3282 | Rastafarian | #1134 |
| Satanist | #8557 | Gaia | #3222 |
| Uranus | #7916 | Satoshi as Hermes | #4488 |
| Mijedi | #4701 | | |

**Acceptance criteria:**
- `grail` field added to frontmatter of all 43 mibera files (e.g., `grail: "Satoshi as Hermes"`)
- Grail row added to traits table: `| Grail | [Satoshi as Hermes](../grails/satoshi-as-hermes.md) |`
- Mibera primary image updated to show grail art instead of standard render (for grail miberas, the grail IS the art)
- Script is idempotent (skip if `grail:` already present)

---

### T-2.3: Update mibera schema and exports

**Description:** Add optional `grail` field to `_codex/schema/mibera.schema.json`. Add `image` field to `_codex/data/grails.jsonl`. Regenerate exports.

**Acceptance criteria:**
- `mibera.schema.json` includes optional `grail` field (string)
- `grails.jsonl` entries include `image` field with working CDN URL
- `miberas.jsonl` regenerated to include `grail` field (and `parcel` field while we're at it)

---

### T-2.4: Audit and PR

**Description:** Verify everything renders, open PR.

**Acceptance criteria:**
- All 43 grail images render at their CDN URLs (HTTP 200)
- All 43 mibera files have grail backlinks
- `_codex/scripts/audit-links.sh` passes
- No broken image references across grails/ or miberas/
- PR opened referencing this sprint

---
