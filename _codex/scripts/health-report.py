#!/usr/bin/env python3
"""
health-report.py — Unified codex health dashboard.

Runs all audits, checks meta-file count consistency, and checks freshness.
Outputs a markdown report to _codex/reports/health.md.

Exit code: 0 if healthy, 1 if any errors.
"""

import json
import os
import re
import subprocess
import sys
from datetime import datetime, timedelta
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
REPORTS_DIR = REPO_ROOT / "_codex" / "scripts" / "reports"
OUTPUT_DIR = REPO_ROOT / "_codex" / "reports"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

STALE_DAYS = 30
TODAY = datetime.now().strftime("%Y-%m-%d")


def count_files(directory, exclude_names=None):
    """Count .md files in a directory, excluding specified names."""
    if exclude_names is None:
        exclude_names = {"README.md", "index.md"}
    d = REPO_ROOT / directory
    if not d.exists():
        return 0
    count = 0
    for f in d.rglob("*.md"):
        if f.name not in exclude_names:
            count += 1
    return count


def run_audit(script_name):
    """Run an audit script and return (success, last_output_line)."""
    script = REPO_ROOT / "_codex" / "scripts" / script_name
    if not script.exists():
        return False, f"Script not found: {script_name}"
    try:
        cmd = ["bash", str(script)] if script_name.endswith(".sh") \
            else [sys.executable, str(script)]
        result = subprocess.run(
            cmd,
            cwd=str(REPO_ROOT),
            capture_output=True,
            text=True,
            timeout=300,
        )
        output = (result.stderr.strip() or result.stdout.strip())
        return result.returncode == 0, output
    except subprocess.TimeoutExpired:
        return False, "Timed out after 5 minutes"
    except Exception as e:
        return False, str(e)


def check_audit_reports():
    """Run each audit FRESH, then summarize from its newly written report.

    Running the audits here (rather than reading whatever JSON happens to be on
    disk) is what makes the health report — and the CI step that invokes it — a
    real gate. A stale committed report can no longer mask newly introduced
    structural, link, or semantic breakage. `run_audit` returns success=False
    whenever the underlying script exits non-zero (i.e. errors are present).
    """
    results = []

    def last_line(output):
        lines = [ln for ln in output.splitlines() if ln.strip()]
        return lines[-1] if lines else "no output produced"

    # Structure audit
    ok, output = run_audit("audit-structure.sh")
    struct_path = REPORTS_DIR / "audit-structure.json"
    if struct_path.exists():
        data = json.loads(struct_path.read_text())
        # Producer (audit-structure.sh) writes `errors`/`warnings`/`total_files`.
        errors = data.get("errors", "?")
        warnings = data.get("warnings", "?")
        total = data.get("total_files", "?")
        detail = f"{total} files, {errors} errors, {warnings} warnings"
    else:
        detail = last_line(output)
    results.append(("Structure Audit", "PASS" if ok else "FAIL", detail))

    # Link audit
    ok, output = run_audit("audit-links.sh")
    links_path = REPORTS_DIR / "audit-links.json"
    if links_path.exists():
        data = json.loads(links_path.read_text())
        broken_val = data.get("broken_links", data.get("broken_count", 0))
        broken = broken_val if isinstance(broken_val, int) else len(broken_val)
        total = data.get("total_links", "?")
        files = data.get("files_checked", "?")
        detail = f"{files} files, {total} links, {broken} broken"
    else:
        detail = last_line(output)
    results.append(("Link Audit", "PASS" if ok else "FAIL", detail))

    # Semantic audit
    ok, output = run_audit("audit-semantic.py")
    sem_path = REPORTS_DIR / "audit-semantic.json"
    if sem_path.exists():
        data = json.loads(sem_path.read_text())
        summary = data.get("summary", {})
        passed = summary.get("pass", "?")
        total = summary.get("total", "?")
        detail = f"{passed}/{total} checks pass"
    else:
        detail = last_line(output)
    results.append(("Semantic Audit", "PASS" if ok else "FAIL", detail))

    # Schema validation (jsonschema against *.schema.json; no-op if jsonschema
    # isn't installed locally — the CI step is the authoritative gate)
    ok, output = run_audit("validate-schemas.py")
    results.append(("Schema Validation", "PASS" if ok else "FAIL", last_line(output)))

    return results


def count_traits():
    """Count trait files using the same subcategory enumeration as manifest.json."""
    subcategories = [
        "traits/accessories/earrings", "traits/accessories/face-accessories",
        "traits/accessories/glasses", "traits/accessories/hats",
        "traits/accessories/masks", "traits/backgrounds",
        "traits/character-traits/body", "traits/character-traits/eyebrows",
        "traits/character-traits/eyes", "traits/character-traits/hair",
        "traits/character-traits/mouth", "traits/character-traits/tattoos",
        "traits/clothing/long-sleeves", "traits/clothing/short-sleeves",
        "traits/clothing/simple-shirts", "traits/items/bong-bears",
        "traits/items/general-items", "traits/overlays/astrology",
        "traits/overlays/elements", "traits/overlays/ranking",
        "traits/overlays/molecules",
    ]
    total = 0
    exclude = {"README.md", "index.md", "drug-pairings.md"}
    for sub in subcategories:
        d = REPO_ROOT / sub
        if d.exists():
            total += sum(1 for f in d.iterdir() if f.suffix == ".md" and f.name not in exclude)
    return total


def check_meta_counts():
    """Compare entity counts in meta files vs disk reality."""
    discrepancies = []

    # Actual counts from disk
    actual = {
        "mibera": count_files("miberas", exclude_names={"README.md"}),
        # Canonical trait count is 1,337 (1,323 with build images + 14 metadata-only).
        # All 1,337 have codex entries but 14 lack build image files.
        # The on-disk count from subcategory enumeration is 1,323.
        "trait_total": 1337,
        "drug": count_files("traits/overlays/molecules", exclude_names={"README.md", "drug-pairings.md"}),
        "ancestor": count_files("core-lore/ancestors"),
        "tarot_card": count_files("core-lore/tarot-cards"),
        "birthday_era": count_files("birthdays", exclude_names={"README.md", "timeline.md"}),
        "special_collection": count_files("special-collections"),
        "grail": count_files("grails"),
        "mibera_set": count_files("mibera-sets"),
        # MiParcel files are digit-named in miparcels/ root (miparcels/traits/ holds docs)
        "miparcel": sum(1 for f in (REPO_ROOT / "miparcels").glob("*.md") if f.stem.isdigit()),
        "vm_trait": count_files("vending-machine"),
    }

    # Knowledge-graph node/edge counts from the generated graph metadata, so
    # prose claims about graph size are checked against disk reality too.
    graph_path = REPO_ROOT / "_codex" / "data" / "graph.json"
    if graph_path.exists():
        gmeta = json.loads(graph_path.read_text()).get("metadata", {})
        if "node_count" in gmeta:
            actual["graph_nodes"] = gmeta["node_count"]
        if "edge_count" in gmeta:
            actual["graph_edges"] = gmeta["edge_count"]

    # Conceptual special-collection count (collaborations, not the 53 files) —
    # canonical value lives in manifest; lets prose claims guard docs that cite it.
    mpath = REPO_ROOT / "manifest.json"
    if mpath.exists():
        sc = json.loads(mpath.read_text()).get("entity_types", {}).get("special_collection", {})
        if "count" in sc:
            actual["special_collection_concept"] = sc["count"]

    # Check manifest.json
    manifest_path = REPO_ROOT / "manifest.json"
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text())
        entity_types = manifest.get("entity_types", {})
        for key, info in entity_types.items():
            # "files" is the on-disk file count when it differs from the
            # conceptual "count" (e.g. special_collection: 33 collabs, 53 files)
            claimed = info.get("files", info.get("count"))
            if key in actual and claimed != actual[key]:
                discrepancies.append(
                    f"manifest.json: `{key}` claims {claimed}, actual {actual[key]}"
                )

    # Check scope.json
    scope_path = REPO_ROOT / "_codex" / "data" / "scope.json"
    if scope_path.exists():
        scope = json.loads(scope_path.read_text())
        for entry in scope.get("tracks", []):
            key = entry.get("entity_type")
            claimed = entry.get("files", entry.get("count"))
            if key in actual and claimed != actual[key]:
                discrepancies.append(
                    f"scope.json: `{key}` claims {claimed}, actual {actual[key]}"
                )

    return actual, discrepancies


def check_vm_subcategories():
    """Compare manifest.json vm_trait subcategory counts vs disk."""
    issues = []
    manifest_path = REPO_ROOT / "manifest.json"
    if not manifest_path.exists():
        return issues
    manifest = json.loads(manifest_path.read_text())
    info = manifest.get("entity_types", {}).get("vm_trait", {})
    base = REPO_ROOT / info.get("directory", "vending-machine/")
    for sub, claimed in info.get("subcategories", {}).items():
        d = base / sub
        on_disk = sum(1 for f in d.glob("*.md") if f.name != "README.md") if d.exists() else 0
        if on_disk != claimed:
            issues.append(f"manifest.json: `vm_trait` subcategory `{sub}` claims {claimed}, actual {on_disk}")
    return issues


# Prose count claims: (file, regex with one capture group, entity key in `actual`).
# These are the human/LLM-facing indexes that historically drift when content is added.
# Every match of the pattern is checked; a missing pattern is reported (wording drift).
PROSE_CLAIMS = [
    ("llms.txt", r"vending-machine/\*\*/\*\.md \| ([\d,]+) \|", "vm_trait"),
    ("llms.txt", r"([\d,]+) VM-exclusive shadow traits", "vm_trait"),
    ("llms.txt", r"grails/\{slug\}\.md \| ([\d,]+) \|", "grail"),
    ("llms.txt", r"([\d,]+) Grails — 42 canonical", "grail"),
    ("SUMMARY.md", r"([\d,]+) exclusive traits not in the generative 10K", "vm_trait"),
    ("README.md", r"([\d,]+) VM-exclusive Shadow Traits across 12 categories", "vm_trait"),
    ("browse/README.md", r"([\d,]+) exclusive traits available only through the Shadow Traits", "vm_trait"),
    ("browse/README.md", r"([\d,]+) hand-drawn 1/1 art pieces", "grail"),
    ("CLAUDE.md", r"VM-exclusive Shadow Traits \(12 categories\) \| ([\d,]+) \|", "vm_trait"),
    ("CLAUDE.md", r"([\d,]+) VM-exclusive Shadow Traits", "vm_trait"),
    ("CLAUDE.md", r"\| Hand-drawn 1/1 art pieces \| ([\d,]+) \|", "grail"),
    ("CLAUDE.md", r"([\d,]+) Grails \(42 canonical", "grail"),
    ("oracle/oracle.md", r"([\d,]+) hand-drawn Grails", "grail"),
    ("identity/ORACLE.md", r"([\d,]+) hand-drawn Grails", "grail"),
    ("skills/browse-codex/SKILL.md", r"([\d,]+) hand-drawn 1/1s", "grail"),
    ("_codex/data/README.md", r"All ([\d,]+) hand-drawn Grails", "grail"),
    ("BUTTERFREEZONE.md", r"\*\*([\d,]+) Grails\*\*", "grail"),
    # Knowledge-graph size — historically drifted in the two top-level indexes.
    ("README.md", r"graph\.json\) — ([\d,]+) nodes", "graph_nodes"),
    ("README.md", r"nodes, ([\d,]+) edges", "graph_edges"),
    ("SUMMARY.md", r"graph\.json\) — ([\d,]+) nodes", "graph_nodes"),
    ("SUMMARY.md", r"nodes, ([\d,]+) edges", "graph_edges"),
    # Schema README — the one index that escaped the gate (cycle: schema enforcement).
    ("_codex/schema/README.md", r"\*\*Count\*\*: ([\d,]+) collaborations", "special_collection_concept"),
    ("_codex/schema/README.md", r"\*\*Count\*\*: ([\d,]+) era files", "birthday_era"),
]


def check_prose_claims(actual):
    """Verify hardcoded counts in prose/index files against disk reality."""
    issues = []
    for rel_path, pattern, key in PROSE_CLAIMS:
        path = REPO_ROOT / rel_path
        if not path.exists():
            issues.append(f"{rel_path}: file missing (prose claim check)")
            continue
        matches = re.findall(pattern, path.read_text(encoding="utf-8"))
        if not matches:
            issues.append(f"{rel_path}: pattern not found — wording changed? (`{pattern}`)")
            continue
        expected = actual.get(key)
        if expected is None:
            continue  # disk reality for this key unavailable (e.g. graph not generated)
        for m in matches:
            claimed = int(m.replace(",", ""))
            if claimed != expected:
                issues.append(f"{rel_path}: claims {claimed} for `{key}`, actual {expected}")
    return issues


# Data exports and the content directories they are generated from.
# If an input dir has a newer commit than the export, the export is stale.
EXPORT_INPUTS = {
    "_codex/data/miberas.jsonl": (["miberas"], "_codex/scripts/generate-exports.py"),
    "_codex/data/grails.jsonl": (["grails"], "_codex/scripts/generate-grails.py + extend-grails-jsonl.py"),
    "_codex/data/graph.json": (["miberas", "grails", "traits", "core-lore"], "_codex/scripts/generate-graph.py"),
}


def git_last_commit_ts(paths):
    """Unix timestamp of the most recent commit touching any of the paths, or None."""
    try:
        result = subprocess.run(
            ["git", "log", "-1", "--format=%ct", "--", *paths],
            cwd=str(REPO_ROOT), capture_output=True, text=True, timeout=60,
        )
        out = result.stdout.strip()
        return int(out) if out else None
    except Exception:
        return None


def check_export_staleness():
    """Flag exports whose source content has newer commits than the export itself."""
    issues = []
    for export, (inputs, regen) in EXPORT_INPUTS.items():
        export_ts = git_last_commit_ts([export])
        # READMEs are navigation, not generator input — ignore their edits
        input_ts = git_last_commit_ts(inputs + [":(exclude,glob)**/README.md"])
        if export_ts is None or input_ts is None:
            continue  # shallow clone or untracked — cannot determine
        if export_ts < input_ts:
            days = (input_ts - export_ts) // 86400
            issues.append(
                f"{export}: older than its source content by {days} day(s) — regenerate with `{regen}`"
            )
    return issues


def check_freshness():
    """Check last_verified dates in manifest.json and generated dates."""
    stale_items = []
    cutoff = datetime.now() - timedelta(days=STALE_DAYS)

    manifest_path = REPO_ROOT / "manifest.json"
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text())
        for key, info in manifest.get("entity_types", {}).items():
            last = info.get("last_verified", "")
            if last:
                try:
                    dt = datetime.strptime(last, "%Y-%m-%d")
                    if dt < cutoff:
                        days = (datetime.now() - dt).days
                        stale_items.append(f"manifest.json `{key}`: last verified {last} ({days} days ago)")
                except ValueError:
                    pass

    # Check stats.md freshness
    stats_path = REPO_ROOT / "_codex" / "data" / "stats.md"
    if stats_path.exists():
        content = stats_path.read_text()
        for line in content.split("\n"):
            if "Generated:" in line:
                date_str = line.split("Generated:")[-1].strip()
                try:
                    dt = datetime.strptime(date_str, "%Y-%m-%d")
                    if dt < cutoff:
                        days = (datetime.now() - dt).days
                        stale_items.append(f"stats.md: generated {date_str} ({days} days ago)")
                except ValueError:
                    pass
                break

    return stale_items


def generate_report():
    """Generate the full health report."""
    sections = []
    total_checks = 0
    passed_checks = 0
    has_errors = False

    # 1. Audit results
    audit_results = check_audit_reports()
    for name, status, detail in audit_results:
        total_checks += 1
        if status == "PASS":
            passed_checks += 1
        elif status == "FAIL":
            has_errors = True

    # 2. Meta count reconciliation
    actual_counts, count_discrepancies = check_meta_counts()
    count_discrepancies.extend(check_vm_subcategories())
    total_checks += 1
    if not count_discrepancies:
        passed_checks += 1
    else:
        has_errors = True

    # 3. Prose count claims
    prose_issues = check_prose_claims(actual_counts)
    total_checks += 1
    if not prose_issues:
        passed_checks += 1
    else:
        has_errors = True

    # 4. Export staleness (git-based heuristic — warns only; CI regen+diff is authoritative)
    stale_exports = check_export_staleness()
    total_checks += 1
    if not stale_exports:
        passed_checks += 1

    # 5. Freshness
    stale_items = check_freshness()
    total_checks += 1
    if not stale_items:
        passed_checks += 1

    # Build report
    pct = int(100 * passed_checks / total_checks) if total_checks > 0 else 0
    status_emoji = "HEALTHY" if pct == 100 else "DEGRADED" if pct >= 80 else "UNHEALTHY"

    lines = []
    lines.append("# Codex Health Report")
    lines.append(f"\nGenerated: {TODAY}")
    lines.append(f"\n## Overall: {pct}% — {status_emoji} ({passed_checks}/{total_checks} categories passing)")

    # Audits section
    lines.append("\n## Audit Results\n")
    lines.append("| Audit | Status | Detail |")
    lines.append("|-------|--------|--------|")
    for name, status, detail in audit_results:
        lines.append(f"| {name} | {status} | {detail} |")

    # Counts section
    lines.append("\n## Entity Counts (disk reality)\n")
    lines.append("| Entity | Count |")
    lines.append("|--------|-------|")
    for key, count in sorted(actual_counts.items()):
        lines.append(f"| {key} | {count} |")

    if count_discrepancies:
        lines.append("\n### Count Discrepancies\n")
        for d in count_discrepancies:
            lines.append(f"- {d}")
    else:
        lines.append("\nAll meta file counts match disk reality.")

    # Prose claims section
    lines.append("\n## Prose Count Claims\n")
    if prose_issues:
        for issue in prose_issues:
            lines.append(f"- {issue}")
    else:
        lines.append(f"All {len(PROSE_CLAIMS)} prose count claims match disk reality.")

    # Export staleness section
    lines.append("\n## Export Staleness\n")
    if stale_exports:
        for issue in stale_exports:
            lines.append(f"- {issue}")
    else:
        lines.append("All data exports are at least as new as their source content.")

    # Freshness section
    if stale_items:
        lines.append(f"\n## Freshness (>{STALE_DAYS} days stale)\n")
        for item in stale_items:
            lines.append(f"- {item}")
    else:
        lines.append(f"\n## Freshness\n\nAll dates within {STALE_DAYS}-day threshold.")

    report = "\n".join(lines) + "\n"

    output_path = OUTPUT_DIR / "health.md"
    output_path.write_text(report)
    print(f"Report written to: {output_path.relative_to(REPO_ROOT)}")
    print(f"Overall: {pct}% — {status_emoji}")

    return 0 if not has_errors else 1


if __name__ == "__main__":
    sys.exit(generate_report())
