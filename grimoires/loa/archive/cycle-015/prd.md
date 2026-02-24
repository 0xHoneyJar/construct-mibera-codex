# PRD: Mibera Sets — Individual Token Entries

> **Cycle**: cycle-015
> **Created**: 2026-02-20
> **Status**: Draft

---

## 1. Problem Statement

The codex documents Mibera Sets at the collection level (`_codex/data/mibera-sets.md`) with contract data, tier structure, and on-chain activity. However, none of the 12 individual tokens have their own entries. The Arweave metadata — names, descriptions, images, attributes — has never been fetched because the contract isn't verified on any explorer and `uri()` must be called via RPC.

> Source: `_codex/data/mibera-sets.md` GAP comments (lines 96-102, 122-130)

## 2. Goal

Create an individual entry for each of the 12 Mibera Set ERC-1155 tokens, sourced from on-chain metadata. No narrative expansion — document what the metadata says.

### Success Criteria

- [ ] All 12 token metadata URIs fetched via RPC call to Optimism
- [ ] Arweave metadata downloaded for all 12 tokens
- [ ] Individual markdown files created at `mibera-sets/{slug}.md`
- [ ] `mibera-sets/README.md` index created with links to all entries
- [ ] `_codex/data/mibera-sets.md` updated with resolved metadata URIs
- [ ] Navigation indices updated (SUMMARY.md, manifest.json, README.md)
- [ ] GAP comments in `_codex/data/mibera-sets.md` resolved where applicable

## 3. Users

Same as codex-wide: humans and LLMs browsing on GitHub.

## 4. Functional Requirements

### FR-1: Fetch Metadata URIs via RPC

Call `uri(uint256)` on contract `0x886D2176D899796cD1AfFA07Eff07B9b2B80f1be` on Optimism for token IDs 1-12.

- **RPC endpoint**: `https://mainnet.optimism.io` (public)
- **Function selector**: `0x0e89341c` (ERC-1155 `uri(uint256)`)
- **Expected return**: Arweave URI (`ar://...`) or HTTPS gateway URL

### FR-2: Fetch Arweave Metadata

For each URI returned, fetch the JSON metadata via Arweave gateway (e.g. `https://arweave.net/{txid}`).

Expected metadata fields (standard ERC-1155):
- `name` — token name
- `description` — token description
- `image` — image URI (likely Arweave)
- `attributes` — trait array (optional)

### FR-3: Create Individual Token Files

One file per token at `mibera-sets/{slug}.md`. Slug derived from metadata name (e.g. "Honey Road Set One" → `honey-road-set-one.md`).

**Schema** (following grail/fracture conventions):

```yaml
---
token_id: 1
name: "Honey Road Set One"
type: mibera-set
category: numbered  # or "media" or "completionist"
supply: 65
image: "ar://..."
metadata_uri: "ar://..."
---
```

Body: description from Arweave metadata, plus a summary line with links. Backlink markers at bottom.

```markdown
# Honey Road Set One

> **Token #1** · Numbered Set · Supply: 65 · [All Mibera Sets →](README.md)

{description from metadata}

---

<!-- @generated:backlinks-start -->
<!-- @generated:backlinks-end -->
```

### FR-4: Create Index (README.md)

`mibera-sets/README.md` following the pattern of `grails/README.md` and `fractures/README.md`:

```markdown
<!-- codex-status: COMPLETE | entities: 12 | last-verified: 2026-02-20 -->
# Mibera Sets — Honey Road Artifacts

*12 ERC-1155 tokens on Optimism representing artifacts from the Honey Road.*

---

## Numbered Sets (7)

- [Honey Road Set One](honey-road-set-one.md) · Token #1 · Supply: 65
...

## Media (4)

...

## Completionist (1)

...
```

### FR-5: Update Existing References

- **`_codex/data/mibera-sets.md`**: Replace GAP comments with resolved metadata URIs. Add links to individual token files.
- **`manifest.json`**: Add `mibera-set` entity type with count and path
- **`SUMMARY.md`**: Add mibera-sets section
- **Root `README.md`**: Add to directory layout table if applicable

## 5. Technical Approach

### RPC Call

Use Python `urllib` (stdlib-only, per codex conventions) to make JSON-RPC calls:

```python
import json, urllib.request

rpc_url = "https://mainnet.optimism.io"
contract = "0x886D2176D899796cD1AfFA07Eff07B9b2B80f1be"

def call_uri(token_id):
    # Encode uri(uint256) call
    selector = "0x0e89341c"
    token_hex = hex(token_id)[2:].zfill(64)
    data = selector + token_hex

    payload = {
        "jsonrpc": "2.0",
        "method": "eth_call",
        "params": [{"to": contract, "data": data}, "latest"],
        "id": 1
    }
    req = urllib.request.Request(rpc_url, json.dumps(payload).encode(),
                                 {"Content-Type": "application/json"})
    resp = json.loads(urllib.request.urlopen(req).read())
    # Decode string from ABI-encoded response
    return decode_abi_string(resp["result"])
```

### Arweave Fetch

Standard HTTPS GET to `arweave.net` gateway. Parse JSON response.

## 6. Scope

### In Scope

- RPC calls to fetch metadata URIs for tokens 1-12
- Arweave metadata fetch for all 12 tokens
- Individual token entry files in `mibera-sets/`
- README index for the directory
- Updates to navigation indices and mibera-sets.md

### Out of Scope

- Honey Road narrative expansion
- Collector mechanic lore
- Image downloads or hosting
- On-chain activity analysis per token
- Schema JSON file for mibera-set type (can add in a later cycle)

## 7. Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| RPC rate limit on public Optimism endpoint | Low | Retry with backoff; fallback to Alchemy/Infura free tier |
| Arweave metadata not in expected format | Medium | Adapt schema to actual fields; document deviations |
| `uri()` returns template URI with `{id}` placeholder | Medium | ERC-1155 spec allows this; substitute token ID |
| Some tokens have no metadata on Arweave | Low | Create stub entries with on-chain data only, mark GAP |

## 8. Dependencies

- Public Optimism RPC access
- Arweave gateway availability
- Existing `_codex/data/mibera-sets.md` for supply/holder data
