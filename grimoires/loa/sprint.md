# Sprint Plan: Mibera Oracle — The Five Books

**Cycle**: cycle-018
**PRD**: [prd.md](prd.md)
**SDD**: [sdd.md](sdd.md)
**Review Gate**: Human review required before any commit/push

## Sprint 1: Oracle Foundation + First Two Books (Global Sprint 30)

**Goal**: Create the oracle directory, README router, shared voice conventions, and the two highest-demand books (Data + Lore).

### Task 1.1: Oracle Directory + README Router
**Acceptance Criteria**:
- Create `oracle/` directory
- Create `oracle/README.md` with routing table, usage instructions for humans and bot builders
- Routing table maps question types to book names

### Task 1.2: Book of Data
**Acceptance Criteria**:
- Create `oracle/book-of-data.md` following SDD template
- System prompt under ~3,500 tokens
- Includes shared Mibera voice block
- References real data sources (`miberas.jsonl`, `browse/by-*.md`, `swag-scoring/`)
- Cross-book routing section
- Anti-hallucination rules
- 3-5 example Q&A pairs using verified real Mibera data

### Task 1.3: Book of Lore
**Acceptance Criteria**:
- Create `oracle/book-of-lore.md` following SDD template
- System prompt under ~3,500 tokens
- Includes shared Mibera voice block
- References real data sources (`core-lore/ancestors/`, `core-lore/archetypes.md`, `birthdays/`)
- Cross-book routing section
- Anti-hallucination rules
- 3-5 example Q&A pairs using verified real codex content

### Task 1.4: Integration Updates
**Acceptance Criteria**:
- Update `manifest.json` with oracle content type
- Update `CLAUDE.md` with oracle lookup pattern
- Update `llms.txt` with Oracle section
- Update `SUMMARY.md` with Oracle navigation link

## Sprint 2: Remaining Three Books (Global Sprint 31)

**Goal**: Complete the oracle with Book of Sight, Book of Grails, and Book of Identity.

### Task 2.1: Book of Sight
**Acceptance Criteria**:
- Create `oracle/book-of-sight.md` following SDD template
- System prompt under ~3,500 tokens
- References `drugs-detailed/`, `core-lore/tarot-cards/`, `core-lore/drug-tarot-system.md`
- 3-5 example Q&A pairs using verified real codex content

### Task 2.2: Book of Grails
**Acceptance Criteria**:
- Create `oracle/book-of-grails.md` following SDD template
- System prompt under ~3,500 tokens
- References `grails/`, `fractures/`
- 3-5 example Q&A pairs using verified real codex content

### Task 2.3: Book of Identity
**Acceptance Criteria**:
- Create `oracle/book-of-identity.md` following SDD template
- Incorporates IDENTITY.md synthesis framework
- System prompt under ~3,500 tokens (tightest budget — relies heavily on referenced files)
- References `IDENTITY.md`, `miberas/{ID}.md`, and linked trait files
- Signal hierarchy enforcement (load-bearing > textural > modifiers)
- 3-5 example Q&A pairs with full Mibera embodiment demonstrations
- At least one example showing temporal constraint handling (birthday/era voice)

### Task 2.4: Final Validation
**Acceptance Criteria**:
- All 5 books follow consistent template
- Cross-book routing is bidirectional and complete
- All referenced file paths exist in the codex
- Example Q&A data verified against source files
- README router covers all 5 books
- Token estimates validated (no book exceeds ~4K tokens for system prompt)

## Dependencies

- Sprint 2 depends on Sprint 1 (shared voice block and conventions established in Sprint 1)
- No external dependencies

## Estimated Scope

| Sprint | Tasks | New Files | Modified Files |
|--------|-------|-----------|----------------|
| Sprint 1 | 4 | 3 | 4 |
| Sprint 2 | 4 | 3 | 0 |
| **Total** | **8** | **6** | **4** |
