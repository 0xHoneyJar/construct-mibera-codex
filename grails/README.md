<!-- codex-status: COMPLETE | entities: 44 | last-verified: 2026-05-13 -->
# Grails — 1/1 Collection

*42 canonical hand-drawn art pieces in the Mibera Maker contract, plus 2 community commissions.*

---

## Image URL convention

Each grail is hosted at:

```
https://assets.0xhoneyjar.xyz/Mibera/grails/{slug}.webp   ← canonical (web-rendered)
https://assets.0xhoneyjar.xyz/Mibera/grails/{slug}.png    ← original full-resolution (download)
```

where `{slug}` is the canonical slug field from `_codex/data/grails.jsonl` —
**lowercase ASCII with spaces replaced by hyphens**:

| name | slug | url |
|---|---|---|
| Black Hole | `black-hole` | `…/grails/black-hole.webp` |
| Native American | `native-american` | `…/grails/native-american.webp` |
| Satoshi as Hermes | `satoshi-as-hermes` | `…/grails/satoshi-as-hermes.webp` |
| Scorpio | `scorpio` | `…/grails/scorpio.webp` |

**Why two variants?** `.webp` is the canonical inline-render form (resized to 1600px max,
quality 82, ~150-550 KB) — fits inside GitHub's 5 MB Camo proxy limit so the inline
`![grail]` image markdown renders on every `*/grails/{slug}.md` view. `.png` is the original
full-resolution artwork (3-7 MB) preserved alongside for high-fidelity downloads,
print, or any consumer that needs lossless. Composes with [[metadata-as-integration-contract]]
— field-shape (`image`) is the contract; the variant chosen at the URL extension is
operator-mutable per consumer.

The `image` field is materialized in `_codex/data/grails.jsonl` for all 44
entries (alongside `original_image` pointing at the legacy irys URL and an
NFT-metadata `attributes` array). Programmatic consumers should read `image`
from there rather than re-deriving from the slug. The convention above is the
authority that survives if the URL pattern ever changes.

Programmatic access:

- **CLI** — `micodex lookup grail black-hole --field=image`
- **MCP** — `lookup_grail({query: "black-hole"})` → the `image` field is in the response
- **Raw** — read the relevant line from `_codex/data/grails.jsonl`

The empirical convention was discovered via [issue #62](https://github.com/0xHoneyJarxhoneyjar/construct-mibera-codex/issues/62)
(Adeitasuna, 2026-04-30) — 40 of 42 grails resolved on first guess; multi-word
names (`Black Hole`, `Native American`) required ~14 HEAD probes each before
the lowercase-hyphenated form was identified. This document closes that gap.

---

## Elements (4)

- [Fire](fire.md) · #6458
- [Water](water.md) · #6761
- [Earth](earth.md) · #3244
- [Air](air.md) · #2769

## Luminaries (2)

- [Sun](sun.md) · #3116
- [Moon](moon.md) · #309

## Concepts (3)

- [Black Hole](black-hole.md) · #876
- [Past](past.md) · #4221
- [Future](future.md) · #4734

## Zodiac (12)

- [Aries](aries.md) · #4803
- [Taurus](taurus.md) · #2113
- [Gemini](gemini.md) · #7218
- [Cancer](cancer.md) · #8620
- [Leo](leo.md) · #9639
- [Virgo](virgo.md) · #8834
- [Libra](libra.md) · #895
- [Scorpio](scorpio.md) · #235
- [Sagittarius](sagittarius.md) · #7321
- [Capricorn](capricorn.md) · #8971
- [Aquarius](aquarius.md) · #6805
- [Pisces](pisces.md) · #6409

## Planets (7)

- [Mercury](mercury.md) · #9112
- [Venus](venus.md) · #4617
- [Mars](mars.md) · #2566
- [Jupiter](jupiter.md) · #3201
- [Saturn](saturn.md) · #7388
- [Neptune](neptune.md) · #2256
- [Pluto](pluto.md) · #1606

## Ancestors (11)

- [Buddhist](buddhist.md) · #9503
- [Chinese](chinese.md) · #392
- [Ethiopian](ethiopian.md) · #7702
- [Greek](greek.md) · #1630
- [Hindu](hindu.md) · #8277
- [Japanese](japanese.md) · #4363
- [Mayan](mayan.md) · #3970
- [Mongolian](mongolian.md) · #507
- [Native American](native-american.md) · #3282
- [Rastafarian](rastafarian.md) · #1134
- [Satanist](satanist.md) · #8557

## Primordial (2)

- [Uranus](uranus.md) · #7916
- [Gaia](gaia.md) · #3222

*Uranus placed on top of Gaia completes a combined piece.*

## Special (1)

- [Satoshi as Hermes](satoshi-as-hermes.md) · #4488

## Creator Community (2)

*Custom commissions for community members.*

- [Mijedi](mijedi.md) · #4701 · for Miggs (@ruwaiting4)
- [Milky Bullas](milky-bullas.md) · #6281 · for Silveycorp
