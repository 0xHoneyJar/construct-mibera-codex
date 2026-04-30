#!/usr/bin/env python3
"""Migrate image URLs from legacy hosts to assets.0xhoneyjar.xyz CDN.

Cycle 023 — CDN URL Migration
Issue: https://github.com/0xHoneyJar/construct-mibera-codex/issues/54

Rewrites URLs in-place across all codex markdown, JSON, JSONL, and Python
files. Two rewrite patterns:

  1. thj-assets.s3.us-west-2.amazonaws.com/{path}
     → assets.0xhoneyjar.xyz/{path}

  2. gateway.irys.xyz/7rpvwFYcB5t7S1HziaBAr4RgfAFpqCwCYbFUbkFqpbAq/{hash}
     → assets.0xhoneyjar.xyz/reveal_phase8/images/{hash}

Usage:
    python3 _codex/scripts/migrate-cdn-urls.py --dry-run
    python3 _codex/scripts/migrate-cdn-urls.py --verify 10
    python3 _codex/scripts/migrate-cdn-urls.py

Stdlib-only. No external dependencies.
"""

import argparse
import os
import random
import re
import sys
import urllib.request
from pathlib import Path

CODEX_ROOT = Path(__file__).resolve().parent.parent.parent

SKIP_DIRS = {".git", ".claude", "node_modules", ".beads", ".run", ".ck"}

FILE_EXTENSIONS = {".md", ".json", ".jsonl", ".py"}

# Irys transaction ID used for all 10K mibera primary renders
IRYS_TX_ID = "7rpvwFYcB5t7S1HziaBAr4RgfAFpqCwCYbFUbkFqpbAq"

CDN_HOST = "assets.0xhoneyjar.xyz"

# Pattern 1: S3-direct (thj-assets)
PAT_S3 = re.compile(
    r"https://thj-assets\.s3\.us-west-2\.amazonaws\.com/"
)

# Pattern 2: Irys gateway
PAT_IRYS = re.compile(
    rf"https://gateway\.irys\.xyz/{re.escape(IRYS_TX_ID)}/"
)


def rewrite_line(line):
    """Apply all rewrite rules to a single line. Returns (new_line, counts)."""
    s3_count = len(PAT_S3.findall(line))
    irys_count = len(PAT_IRYS.findall(line))

    if s3_count or irys_count:
        line = PAT_S3.sub(f"https://{CDN_HOST}/", line)
        line = PAT_IRYS.sub(f"https://{CDN_HOST}/reveal_phase8/images/", line)

    return line, s3_count, irys_count


def collect_files():
    """Walk codex root and yield all eligible file paths."""
    for dirpath, dirnames, filenames in os.walk(CODEX_ROOT):
        # Prune skipped directories in-place
        dirnames[:] = [
            d for d in dirnames
            if d not in SKIP_DIRS
        ]
        for fname in filenames:
            if Path(fname).suffix in FILE_EXTENSIONS:
                yield Path(dirpath) / fname


def collect_old_urls(files):
    """Scan files and return lists of old URLs per pattern (for --verify)."""
    s3_urls = []
    irys_urls = []
    for fpath in files:
        try:
            content = fpath.read_text(encoding="utf-8")
        except (UnicodeDecodeError, PermissionError):
            continue
        for match in PAT_S3.finditer(content):
            # Extract the full URL up to whitespace, quote, or paren
            start = match.start()
            rest = content[start:]
            url_match = re.match(r'(https://[^\s"\')\]>]+)', rest)
            if url_match:
                s3_urls.append(url_match.group(1))
        for match in PAT_IRYS.finditer(content):
            start = match.start()
            rest = content[start:]
            url_match = re.match(r'(https://[^\s"\')\]>]+)', rest)
            if url_match:
                irys_urls.append(url_match.group(1))
    return s3_urls, irys_urls


def verify_url(url):
    """HEAD a URL. Returns (status, content_length) or (None, error)."""
    try:
        req = urllib.request.Request(url, method="HEAD")
        resp = urllib.request.urlopen(req, timeout=10)
        return resp.status, resp.headers.get("Content-Length", "?")
    except Exception as e:
        return None, str(e)


def verify_url_pair(old_url, new_url):
    """Verify URL pair. For S3→CDN, compare both. For Irys→CDN, verify new only
    (Irys gateway blocks HEAD requests)."""
    is_irys = "gateway.irys.xyz" in old_url

    # Always check the new URL
    new_status, new_length = verify_url(new_url)
    if new_status is None:
        return False, f"NEW failed: {new_length}"
    if new_status != 200:
        return False, f"NEW returned {new_status}"

    if is_irys:
        # Irys gateway blocks HEAD — just confirm CDN serves it
        return True, f"200 OK, {new_length} bytes (CDN-only, Irys gateway blocks HEAD)"

    # For S3-direct, compare both
    old_status, old_length = verify_url(old_url)
    if old_status is None:
        return False, f"OLD failed: {old_length}"
    if old_status != 200:
        return False, f"OLD returned {old_status}"
    if old_length != new_length:
        return False, f"Content-Length mismatch: old={old_length} new={new_length}"
    return True, f"200 OK, {old_length} bytes"


def rewrite_old_to_new(old_url):
    """Apply rewrite rules to transform an old URL into a new one."""
    url = PAT_S3.sub(f"https://{CDN_HOST}/", old_url)
    url = PAT_IRYS.sub(f"https://{CDN_HOST}/reveal_phase8/images/", url)
    return url


def run_verify(n, files):
    """Spot-check n random URLs per pattern."""
    print(f"\n  Collecting URLs for verification...")
    s3_urls, irys_urls = collect_old_urls(files)
    print(f"  Found {len(s3_urls)} S3-direct URLs, {len(irys_urls)} Irys URLs")

    all_ok = True
    for label, url_list in [("S3-direct", s3_urls), ("Irys", irys_urls)]:
        sample = random.sample(url_list, min(n, len(url_list)))
        print(f"\n  Verifying {len(sample)} {label} URLs:")
        for old_url in sample:
            new_url = rewrite_old_to_new(old_url)
            ok, detail = verify_url_pair(old_url, new_url)
            status = "OK" if ok else "FAIL"
            print(f"    [{status}] {detail}")
            if not ok:
                print(f"           old: {old_url}")
                print(f"           new: {new_url}")
                all_ok = False

    return all_ok


def main():
    parser = argparse.ArgumentParser(
        description="Migrate codex image URLs to assets.0xhoneyjar.xyz"
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Print stats without modifying files"
    )
    parser.add_argument(
        "--verify", type=int, metavar="N",
        help="Spot-check N random URLs per pattern via HTTP HEAD"
    )
    args = parser.parse_args()

    files = list(collect_files())
    print(f"Scanning {len(files)} files...")

    if args.verify:
        ok = run_verify(args.verify, files)
        sys.exit(0 if ok else 1)

    total_s3 = 0
    total_irys = 0
    files_modified = 0

    for fpath in files:
        try:
            content = fpath.read_text(encoding="utf-8")
        except (UnicodeDecodeError, PermissionError):
            continue

        new_lines = []
        file_s3 = 0
        file_irys = 0

        for line in content.splitlines(keepends=True):
            new_line, s3_c, irys_c = rewrite_line(line)
            new_lines.append(new_line)
            file_s3 += s3_c
            file_irys += irys_c

        if file_s3 or file_irys:
            total_s3 += file_s3
            total_irys += file_irys
            files_modified += 1

            if not args.dry_run:
                fpath.write_text("".join(new_lines), encoding="utf-8")

    action = "Would rewrite" if args.dry_run else "Rewrote"
    print(f"\n  {action}:")
    print(f"    S3-direct (thj-assets):  {total_s3:,} refs")
    print(f"    Irys gateway:            {total_irys:,} refs")
    print(f"    Total:                   {total_s3 + total_irys:,} refs")
    print(f"    Files touched:           {files_modified:,}")

    if args.dry_run:
        print("\n  (dry run — no files modified)")


if __name__ == "__main__":
    main()
