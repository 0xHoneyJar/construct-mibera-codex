---
cycle: micodex-09a
date: 2026-05-02
witness_persona: Margaret Hamilton (canon · 0.1.0)
register: smol
status: 🟡 operator-bounded · awaits live trial
inputs:
  - construct-mibera-codex@1.4.0 (PR #65 merged 2026-05-02T22:30:53Z, b724391c)
  - tests-smoke/eval-corpus.jsonl (58/58 = 100% per session 09a)
  - Railway deploy https://codex-mcp-production.up.railway.app (healthz 200, MCP transport responsive)
sources:
  - ~/bonfire/grimoires/bonfire/specs/micodex-eval-corpus-2026-05-02.md (session 09a — substrate proof)
  - ~/bonfire/grimoires/bonfire/specs/micodex-integration-qa-2026-05-02.md (session 09b — integration QA, gates on this checklist)
  - ~/Documents/GitHub/construct-mibera-codex/grimoires/loa/NOTES.md (decision log)
  - ~/vault/wiki/concepts/synthetic-supervision-for-knowledge-maps.md (doctrine — operator-paired KEEPER replaced by real-user dogfood per WITNESS)
audience: operator + Gumi + community
---

# WITNESS — micodex 09a + Discord trial

> 09a proved the substrate (58/58). this checklist proves it's TRUE IN THE WORLD. three shareable paths · seven surfaces · capture+triage paths SPECIFIC. real users typing real things; operator-paired hunches retired in favor of dogfood signal.

---

## three shareable paths · pick what fits the audience

### 🟢 Path A — MCP deeplink (1-click · for Gumi/devs/operator using Cursor or VSCode)

**Cursor**:
```
cursor://anysphere.cursor-deeplink/mcp/install?name=codex&config=eyJuYW1lIjoiY29kZXgiLCJ0eXBlIjoiaHR0cCIsInVybCI6Imh0dHBzOi8vY29kZXgtbWNwLXByb2R1Y3Rpb24udXAucmFpbHdheS5hcHAvbWNwIn0=
```

**VSCode**:
```
vscode:mcp/install?%7B%22name%22%3A%22codex%22%2C%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A//codex-mcp-production.up.railway.app/mcp%22%7D
```

**Claude Desktop / other clients** (manual config snippet):
```json
{
  "name": "codex",
  "type": "http",
  "url": "https://codex-mcp-production.up.railway.app/mcp"
}
```

Hosted at `https://codex-mcp-production.up.railway.app/mcp` (Railway Path B HTTP transport · streamable-http). No auth required for V1.

### 🟡 Path B — CLI install (for developers comfortable with npm + qmd peer dep)

```sh
npm install -g @0xhoneyjar/construct-mibera-codex@1.4.0
npm install -g @tobilu/qmd@^2.1.0    # peer dependency
git clone https://github.com/0xHoneyJar/construct-mibera-codex
cd construct-mibera-codex
pnpm micodex:index                    # builds qmd codex-grails + codex-core-lore collections
micodex search "void motif" --json    # smoke test
```

Heavier setup than Path A — qmd peer + index build (~30-90s) before first query.

### 🔴 Path C — Discord live (for community · status uncertain)

`/satoshi show me a void grail` in any Discord channel where the freeside-characters bot is deployed. Scenario S7 below verifies bot deployment FIRST — don't share path C until it's confirmed live.

---

## scenarios (7 surfaces · IMPACT-ordered)

### S1 — 🟢 MCP deeplink install + first query (Cursor)

**setup**: operator (or Gumi) clicks Path A Cursor deeplink. Cursor prompts to add codex MCP server. Accept.

**expected**:
- Cursor MCP settings show `codex` server with `connected` status
- Tool palette includes `mcp__codex__search_codex`, `mcp__codex__lookup_grail`, `mcp__codex__lookup_mibera`, +5 more (8 tools per session 08 v1.4.0)
- Run `search_codex({intent: "void motif"})` → returns `[{ref: "@g876", name: "Black Hole", score: 0.88, image: "https://assets.0xhoneyjar.xyz/Mibera/grails/black-hole.png", ...}]`
- Latency: <5s warm, <10s cold (Railway cold start adds ~3s on first hit)

**📊 capture**:
- Screenshot 1: Cursor MCP settings panel with codex `connected`
- Screenshot 2: tool palette showing 8 codex tools
- Screenshot 3: tool result for `search_codex({intent: "void motif"})` — embed includes image_url
- Save to: `grimoires/loa/qa/captures/micodex-09a/s1-cursor-deeplink/`

**❌ triage**:
- Cursor shows `disconnected` → check `https://codex-mcp-production.up.railway.app/healthz` returns 200; if not, Railway is down (operator pings Railway dashboard)
- Tool returns error `No session: send initialize first` → MCP client didn't send `initialize`; client-bug not codex-bug; capture client version + report to client
- Tool returns wrong shape → schema drift; check `searchCodex` envelope shape vs `tests-smoke/eval-corpus.jsonl` expectations; promote to bug if recurrent

**goal**: validates Path A end-to-end · proves the agent-browser pattern works (same vocabulary, HTTP transport, real client)

---

### S2 — 🟢 CLI install + smoke (one developer machine)

**setup**: operator (or Gumi) on a fresh-ish machine runs Path B install commands.

**expected**:
- `npm install -g @0xhoneyjar/construct-mibera-codex@1.4.0` succeeds (no peer warnings about qmd missing)
- `micodex search "void motif" --json` returns same envelope as Path A S1
- KRANZ act 1 invariant: substrate reproducible across machines

**📊 capture**:
- Terminal screenshot of `pnpm micodex:index` output (collection counts, time)
- Terminal screenshot of `micodex search "void motif" --json` first 30 lines
- Save to: `grimoires/loa/qa/captures/micodex-09a/s2-cli-install/`

**❌ triage**:
- `qmd: command not found` → peer dep missing; per `~/Documents/GitHub/construct-mibera-codex/scripts/build-micodex-index.sh:18-22` install `@tobilu/qmd`
- `SQLiteError: no such module: vec0` → THIS IS THE KRANZ act 1 BUG we caught in 09a · runtime/qmd version mismatch · verify `@tobilu/qmd@^2.1.0`, NOT 2.0.0; if reproduced, file as integration regression
- `qmd collection "codex-grails" not found` → user skipped `pnpm micodex:index`; re-run

**goal**: validates Path B reproducibility · catches the same bug KRANZ caught in 09a (proves the fix is canon-shipped, not a one-machine workaround)

---

### S3 — 🟢 substrate-truth seed cases (any path · proves 09a corpus is real)

**setup**: from any client (Cursor / CLI / Claude Desktop), run these 5 queries against `search_codex`:

```
1. search_codex({intent: "void motif"})        → expect @g876 Black Hole @ ≥0.7
2. search_codex({intent: "the dark grail"})    → expect @g6458 Fire @ ≥0.7
3. search_codex({intent: "underworld grail"})  → expect @g6805 Aquarius @ ≥0.65
4. search_codex({intent: "skull motif"})       → expect @g507 Mongolian @ ≥0.6
5. search_codex({intent: "snake"})             → expect [] (empty refusal)
```

**expected**: each returns the corpus-canonical answer at or above the floor. case 3 is the substrate-truth correction (Aquarius/Hades-as-Aquarius IS the canonical underworld grail — see NOTES.md session 09a Decision Log; spec example @g4488 was wrong).

**📊 capture**:
- For each query: tool result JSON (top-1 ref + score + name)
- Save as `s3-seed-cases.jsonl` at `grimoires/loa/qa/captures/micodex-09a/`

**❌ triage**:
- ANY case returns wrong ref → substrate regression; cross-check `tests-smoke/eval-harness.ts` locally; if also fails locally, qmd index drift; if local passes but remote fails, Railway deploy is stale
- Case 5 returns hits → false positive; check `~/.cache/qmd/index.sqlite` was rebuilt after package update; report to operator

**goal**: validates 09a corpus IS the deployed truth · proves substrate-truth doctrine in real environment

---

### S4 — 🟡 Gumi-style real-user query dump (KEEPER source surrogate)

**setup**: operator (or Gumi) opens Cursor with codex MCP active. Spends 15 min asking codex "what would you search for to find X?" using natural intuition — anything from "that one with the rings" to "milady-coded grail" to "vibey purple one." Capture EACH query + actual top-1 result + score.

**expected**:
- Substrate finds reasonable matches for ≥80% of operator-natural queries
- ≥1 surprising true-positive (substrate richer than operator assumed — like "crypto" → Satoshi-as-Hermes per 09a iteration)
- ≥1 honest gap (substrate misses what operator clearly meant — these become V1.5 substrate-thin candidates per spec §4.6)

**📊 capture**:
- Save query+result rows as `s4-keeper-realsource.jsonl` at `grimoires/loa/qa/captures/micodex-09a/`
- Include the operator-narrated WHY behind each query (the "what should this match"); WITNESS doctrine: ungrounded captures rot

**❌ triage**:
- All queries return same grail → embedding/HyDE drift; sample 3 unrelated queries to confirm; if confirmed, qmd index needs rebuild
- Substrate consistently MISSES operator-natural phrasings → bucket-3 finding for spec §4.6 substrate-thin: extend the `<slug>.md` Justification sections; promote to construct-mibera-codex#issue with the natural query as evidence

**goal**: REPLACES the operator-paired KEEPER source pass that was originally planned for session 09a · real signal beats hunches · feeds V1.5 corpus expansion via real query shapes

---

### S5 — 🔴 Discord `/satoshi` live trial (path C · gated on S7)

**setup**: operator runs `/satoshi show me a void grail` in a Discord channel where freeside-characters bot is deployed.

**expected**:
- Bot responds within 5s with embed
- Embed: title=Black Hole · thumbnail=image url from codex · description in satoshi voice cadence (numinous/grail-words register)
- Footer carries `@g876` ref OR token id

**📊 capture**:
- Discord screenshot (full embed visible)
- Wall-clock timing (from slash command sent → embed rendered)
- Trajectory log if accessible (freeside-characters orchestrator output)
- Save to: `grimoires/loa/qa/captures/micodex-09a/s5-discord-satoshi/`

**❌ triage**:
- Bot doesn't respond → check freeside-characters bot deployed + `CODEX_MCP_URL` env set + Discord interactions endpoint configured; per session 09 spec §4.0 read `apps/bot/src/discord-interactions/dispatch.ts:220-307`
- Bot responds but no image → composer not extracting `image_url` from tool result; check `packages/persona-engine/src/deliver/embed.ts` (or `embed-with-image.ts` if session 09 shipped); pre-09 freeside-characters has no image-aware composer (V1.5 territory)
- Bot responds but voice is generic → satoshi character anchor not loaded; check `apps/character-satoshi/persona.md` + `codex-anchors.md` are in deployed bundle
- Wall-clock >10s warm → Railway+codex+SDK chain too slow; capture timing per layer (Discord→bot, bot→Railway, Railway→qmd, qmd→sqlite) per session 09b §4.5 layer triage

**goal**: validates Path C end-to-end · proves the user-facing surface delivers the substrate's truth in the user's actual environment

---

### S6 — 🟡 KEEPER refusal cadence (any path · validates no-false-positive discipline)

**setup**: from any client, run 5 modern-domain refusal cases:

```
search_codex({intent: "gasoline"})       → expect []
search_codex({intent: "smartphone"})     → expect []
search_codex({intent: "refrigerator"})   → expect []
search_codex({intent: "soccer"})         → expect []
search_codex({intent: "iphone"})         → expect []
```

**expected**: all 5 return empty hits — substrate refuses to false-positive on modern terms with no canon anchor.

**📊 capture**:
- Tool results for each (should all be `[]`)
- If ANY returns a hit, capture the ref + score + the grail markdown that generated the match
- Save to: `grimoires/loa/qa/captures/micodex-09a/s6-refusals/`

**❌ triage**:
- Any false positive → check if substrate has a TRUE positive (lore explicitly mentions the term — like "crypto"→Satoshi-as-Hermes legitimately matches because lore mentions Bitcoin) OR a vec/HyDE quirk (no lexical anchor — like "dragon"→Mongolian @ 0.88 in 09a baseline)
- Vec/HyDE quirks: not bugs, but document via `seed-empty-and-motif.jsonl` style note; the empty-expected term should be replaced via `tests-smoke/probe-empty.ts` for the next corpus version

**goal**: proves substrate restraint is real · KEEPER's refusal discipline still holds in deployment

---

### S7 — 🔴 Discord deployment status (PRECONDITION for S5)

**setup**: operator confirms freeside-characters bot is alive in a Discord channel. Two checks:

```sh
curl -sS https://api.freeside.0xhoneyjar.xyz/healthz
# WITNESS noted 2026-05-02: SSL handshake error (curl 35); domain may not be propagated OR service is down
```

AND check Discord guild settings: bot user is in guild + permissions include slash command + interactions endpoint URL is set per `freeside-characters/.env.example`.

**expected**: healthz 200; bot present in at least one accessible Discord guild; `/satoshi` slash command appears in command palette.

**📊 capture**:
- curl output for healthz
- Discord guild → bot user → permissions screenshot
- `/satoshi` autocomplete screenshot
- Save to: `grimoires/loa/qa/captures/micodex-09a/s7-bot-deployment/`

**❌ triage**:
- healthz fails → freeside-characters Railway service down OR custom domain DNS not propagated; check Railway dashboard + Cloudflare DNS for `api.freeside.0xhoneyjar.xyz`
- Bot not in guild → invite via Discord OAuth URL; per `freeside-characters/.env.example` line "Set Interactions Endpoint URL"
- `/satoshi` doesn't appear → slash command registration not run on deploy; check `apps/bot/src/discord-interactions/register.ts` (if exists) or equivalent

**STOP-MERGE if**: Path C (S5) is being shipped to community AND S7 fails. Don't advertise Discord trial when bot isn't up. Paths A + B are independent of S7.

**goal**: gates whether Path C is shareable · S5 cannot proceed if S7 ❌

---

## coordination block

- **Operator**: paths A + B can be shared TODAY. Path C gated on S7.
- **Gumi**: prime audience for S4 (KEEPER real-source pass) — has gygax/arneson construct intuition, knows what real users type. Send Path A Cursor deeplink + ask for ~15 min of natural query dumping.
- **Adasuna** (external Loa user): Path B candidate · validates "consumer-side install actually works for someone who isn't operator" — same invariant KRANZ act 1 catches in 09a forge prep
- **freeside-characters team**: S7 + S5 belong here. If freeside-characters is deployed but `CODEX_MCP_URL` env not set, the bot will use stale config and fail S5 silently. Surface to bot owner before community trial.

## reflection — what the construct is learning about itself

Session 09a's plan called for an operator-paired KEEPER source pass to expand the corpus from 58 → 90+ via operator-named motif paraphrases. Operator questioned the question (MAY-LATITUDE-3): the real KEEPER source isn't operator hunches — it's real users in Discord. WITNESS materializes this pivot:

1. Substrate is now PROVEN (09a corpus 58/58)
2. The PR ships
3. The MCP/CLI deeplinks make it shareable
4. Real users dogfood
5. KEEPER captures real friction (S4 + S5 capture files)
6. Captured query shapes feed V1.5 corpus expansion

This is the [[synthetic-supervision-for-knowledge-maps]] doctrine evolving: the corpus seeds canon validation; real-user signal seeds canon expansion. Both are KEEPER source — but at different lifecycle stages.

WITNESS's job: make the shareable surfaces real, structure the captures so they don't rot, name the triage paths so failure modes are diagnostic. Hamilton's discipline: trust deployments, not diffs.

If this checklist's S1-S7 all green, MICODEX 09a is `🟢 true in the world` — promote `synthetic-supervision-for-knowledge-maps.md` §10 from "first instance" to "first instance · validated live." If S5 or S7 stay 🔴 after a serious attempt, that's session 09b's territory.

---

## STOP-MERGE gates

- 🔴 if S2 reproduces the `vec0` SQLite error → KRANZ fix didn't ship to npm; bump `@tobilu/qmd` peer dep MIN to `^2.1.0` in published package and republish
- 🔴 if S3 returns wrong refs → substrate corpus drift between local repo and Railway; redeploy Railway with current main
- 🔴 if S6 returns false positives at score ≥0.85 → empty-expected discipline broken; investigate qmd index OR add cases to corpus and re-run harness
