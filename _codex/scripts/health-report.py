#!/usr/bin/env python3
"""
health-report.py — Unified codex health dashboard.

Runs all audits, checks meta-file count consistency, and checks freshness.
Outputs a markdown report to _codex/reports/health.md.

Exit code: 0 if healthy, 1 if any errors.
"""

import json
import os
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
    """Run an audit script and return (success, summary)."""
    script = REPO_ROOT / "_codex" / "scripts" / script_name
    if not script.exists():
        return False, f"Script not found: {script_name}"
    try:
        result = subprocess.run(
            ["bash", str(script)] if script_name.endswith(".sh")
            else ["python3", str(script)],
            cwd=str(REPO_ROOT),
            capture_output=True,
            text=True,
            timeout=300,
        )
        return result.returncode == 0, result.stderr.strip() or result.stdout.strip()
    except subprocess.TimeoutExpired:
        return False, "Timed out after 5 minutes"
    except Exception as e:
        return False, str(e)


def check_audit_reports():
    """Read existing audit report JSONs and summarize."""
    results = []

    # Structure audit
    struct_path = REPORTS_DIR / "audit-structure.json"
    if struct_path.exists():
        data = json.loads(struct_path.read_text())
        errors = data.get("error_count", data.get("errors", "?"))
        warnings = data.get("warning_count", data.get("warnings", "?"))
        total = data.get("total_files", "?")
        status = "PASS" if errors == 0 else "FAIL"
        results.append(("Structure Audit", status, f"{total} files, {errors} errors, {warnings} warnings"))
    else:
        results.append(("Structure Audit", "SKIP", "No report found — run audit-structure.sh"))

    # Link audit
    links_path = REPORTS_DIR / "audit-links.json"
    if links_path.exists():
        data = json.loads(links_path.read_text())
        broken_val = data.get("broken_links", data.get("broken_count", 0))
        broken = broken_val if isinstance(broken_val, int) else len(broken_val)
        total = data.get("total_links", "?")
        files = data.get("files_checked", "?")
        status = "PASS" if broken == 0 else "WARN" if broken <= 5 else "FAIL"
        results.append(("Link Audit", status, f"{files} files, {total} links, {broken} broken"))
    else:
        results.append(("Link Audit", "SKIP", "No report found — run audit-links.sh"))

    # Semantic audit
    sem_path = REPORTS_DIR / "audit-semantic.json"
    if sem_path.exists():
        data = json.loads(sem_path.read_text())
        checks = data.get("checks", {})
        if isinstance(checks, dict):
            total = len(checks)
            passed = sum(1 for v in checks.values() if isinstance(v, dict) and v.get("status") in ("pass", "info"))
        else:
            total = len(checks)
            passed = sum(1 for c in checks if isinstance(c, dict) and c.get("status") == "pass")
        status = "PASS" if passed == total else "FAIL"
        results.append(("Semantic Audit", status, f"{passed}/{total} checks pass"))
    else:
        results.append(("Semantic Audit", "SKIP", "No report found — run audit-semantic.py"))

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
        "trait_total": count_traits(),
        "drug": count_files("traits/overlays/molecules", exclude_names={"README.md", "drug-pairings.md"}),
        "ancestor": count_files("core-lore/ancestors"),
        "tarot_card": count_files("core-lore/tarot-cards"),
        "birthday_era": count_files("birthdays", exclude_names={"README.md", "timeline.md"}),
        "special_collection": count_files("special-collections"),
        "grail": count_files("grails"),
        "mibera_set": count_files("mibera-sets"),
    }

    # Check manifest.json
    manifest_path = REPO_ROOT / "manifest.json"
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text())
        entity_types = manifest.get("entity_types", {})
        for key, info in entity_types.items():
            claimed = info.get("count")
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
            claimed = entry.get("count")
            if key in actual and claimed != actual[key]:
                discrepancies.append(
                    f"scope.json: `{key}` claims {claimed}, actual {actual[key]}"
                )

    return actual, discrepancies


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
    total_checks += 1
    if not count_discrepancies:
        passed_checks += 1
    else:
        has_errors = True

    # 3. Freshness
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
