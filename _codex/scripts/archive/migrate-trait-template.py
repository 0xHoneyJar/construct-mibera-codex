#!/usr/bin/env python3
"""Migrate trait files from the old template to the hybrid template.

Usage:
    python3 migrate-trait-template.py <directory>
    python3 migrate-trait-template.py traits/backgrounds/
    python3 migrate-trait-template.py traits/backgrounds/stonehenge.md  # single file

Reads each .md file, extracts content from old sections, and rewrites
using the hybrid template: Visual Elements, Cultural Context, Justification, Attribution.

stdlib-only (no PyYAML). Regex-based YAML parsing per codex conventions.
"""

import os
import re
import sys


def extract_frontmatter(content):
    """Extract YAML frontmatter and body separately."""
    m = re.match(r'^---\n(.*?)\n---\n(.*)', content, re.DOTALL)
    if m:
        return m.group(1), m.group(2)
    return '', content


def parse_frontmatter_field(fm, field):
    """Extract a field value from frontmatter text."""
    m = re.search(rf'^{field}:\s*"?(.+?)"?\s*$', fm, re.MULTILINE)
    if m:
        return m.group(1).strip().strip('"')
    return ''


def extract_bold_field(body, field_name):
    """Extract text after a **Field:** marker."""
    # Use [ \t]* instead of \s* to avoid consuming newlines
    pattern = rf'\*\*{re.escape(field_name)}:\*\*[ \t]*(.*?)(?=\n\n|\n\*\*|\n---|\n##|\Z)'
    m = re.search(pattern, body, re.DOTALL)
    if m:
        val = m.group(1).strip()
        # Strip any remaining bold labels that leaked in
        val = re.sub(r'\*\*[A-Za-z ]+:\*\*\s*', '', val).strip()
        # Don't return if it's just whitespace or a lone ---
        if val and val != '---':
            return val
    return ''


def extract_image_markdown(body):
    """Extract the first ![...](...) image link from the body."""
    m = re.search(r'!\[([^\]]*)\]\(([^)]+)\)', body)
    if m:
        return m.group(0), m.group(1), m.group(2)
    return '', '', ''


def clean_text(text):
    """Remove trailing whitespace and normalize."""
    if not text:
        return ''
    # Remove trailing --- that sometimes leaks in
    text = re.sub(r'\s*---\s*$', '', text)
    return text.strip()


def migrate_file(filepath):
    """Migrate a single trait file to the hybrid template."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    fm_text, body = extract_frontmatter(content)
    if not fm_text:
        return False, 'no frontmatter'

    # Extract frontmatter fields
    name = parse_frontmatter_field(fm_text, 'name')
    image_url = parse_frontmatter_field(fm_text, 'image')
    date_added = parse_frontmatter_field(fm_text, 'date_added')
    archetype = parse_frontmatter_field(fm_text, 'archetype')
    swag_score = parse_frontmatter_field(fm_text, 'swag_score')

    # Extract body fields
    img_md, img_alt, img_src = extract_image_markdown(body)
    visual_desc = clean_text(extract_bold_field(body, 'Visual Description'))
    dominant_colors = clean_text(extract_bold_field(body, 'Dominant Colors'))
    cultural_origin = clean_text(extract_bold_field(body, 'Cultural Origin'))
    why_matters = clean_text(extract_bold_field(body, 'Why This Matters'))
    era = clean_text(extract_bold_field(body, 'Era'))
    introduced_by = clean_text(extract_bold_field(body, 'Introduced By'))
    team_notes = clean_text(extract_bold_field(body, 'Team Notes'))
    arch_alignment = clean_text(extract_bold_field(body, 'Archetype Alignment'))

    # Extract sources (everything after **Sources:** until next section)
    sources = ''
    src_match = re.search(r'\*\*Sources:\*\*[ \t]*(.*?)(?=\n\n|\n\*\*|\n---|\n##|\Z)', body, re.DOTALL)
    if src_match:
        sources = clean_text(src_match.group(1))

    # Extract summary
    summary = clean_text(extract_bold_field(body, 'Summary'))

    # Extract ancestor connections (markdown links in Connections section)
    ancestor = clean_text(extract_bold_field(body, 'Ancestor'))

    # Use image from body if available, otherwise from frontmatter
    if not img_src and image_url:
        img_src = image_url
        img_alt = name

    # Build Visual Elements section
    visual_parts = []
    # Only embed image if it looks like a URL (not a local filename)
    if img_src and (img_src.startswith('http://') or img_src.startswith('https://')):
        visual_parts.append(f'![{img_alt or name}]({img_src})')
        visual_parts.append('')
    if visual_desc:
        visual_parts.append(visual_desc)
    if dominant_colors:
        # Only add if not already embedded in visual_desc
        if dominant_colors not in (visual_desc or ''):
            if visual_parts:
                visual_parts.append('')
            visual_parts.append(f'Dominant colors: {dominant_colors}')

    # Build Cultural Context section
    context_parts = []
    if cultural_origin:
        context_parts.append(cultural_origin)
    # Filter out very short why_matters (category labels like "Rave culture")
    if why_matters and len(why_matters) > 20 and why_matters != cultural_origin:
        # Don't duplicate if why_matters is a substring of cultural_origin
        if not cultural_origin or why_matters not in cultural_origin:
            if context_parts:
                context_parts.append('')
            context_parts.append(why_matters)
    if era:
        if context_parts:
            context_parts.append('')
        context_parts.append(f'Era: {era}')
    if summary and summary not in (cultural_origin or '') and summary not in (why_matters or ''):
        if context_parts:
            context_parts.append('')
        context_parts.append(summary)

    # Build Attribution section
    attr_parts = []
    if archetype and archetype != '**Archetype Alignment:**':
        attr_parts.append(f'**Archetype:** {archetype}')
    if ancestor:
        attr_parts.append(f'**Ancestor:** {ancestor}')
    if swag_score and swag_score != 'null' and swag_score != 'None':
        attr_parts.append(f'**Swag Score:** {swag_score}')
    if date_added and date_added != 'null':
        attr_parts.append(f'**Date Added:** {date_added}')
    if introduced_by:
        attr_parts.append(f'**Introduced By:** {introduced_by}')
    if team_notes:
        attr_parts.append(f'**Team Notes:** {team_notes}')
    if sources:
        attr_parts.append(f'**Sources:**\n{sources}')

    # Assemble the new file
    lines = [f'---\n{fm_text}\n---\n']
    lines.append(f'# {name}\n')

    # Visual Elements
    lines.append('## Visual Elements\n')
    if visual_parts:
        lines.append('\n'.join(visual_parts))
    lines.append('')

    # Cultural Context (only if we have content)
    if context_parts:
        lines.append('## Cultural Context\n')
        lines.append('\n'.join(context_parts))
        lines.append('')

    # Justification placeholder — to be filled manually
    lines.append('## Justification\n')
    lines.append('[TO BE ENRICHED]')
    lines.append('')

    # Attribution
    lines.append('---\n')
    lines.append('## Attribution\n')
    if attr_parts:
        lines.append('\n'.join(attr_parts))
    lines.append('')

    # Write
    output = '\n'.join(lines).rstrip() + '\n'

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(output)

    has_context = bool(context_parts)
    return True, 'migrated' + ('' if has_context else ' (no cultural context)')


def main():
    if len(sys.argv) < 2:
        print('Usage: python3 migrate-trait-template.py <directory-or-file>')
        sys.exit(1)

    target = sys.argv[1]

    if os.path.isfile(target):
        files = [target]
    elif os.path.isdir(target):
        files = sorted([
            os.path.join(target, f)
            for f in os.listdir(target)
            if f.endswith('.md') and f != 'README.md'
        ])
    else:
        print(f'Error: {target} is not a file or directory')
        sys.exit(1)

    migrated = 0
    no_context = 0
    errors = 0

    for filepath in files:
        try:
            success, status = migrate_file(filepath)
            if success:
                migrated += 1
                if 'no cultural context' in status:
                    no_context += 1
                print(f'  ✓ {os.path.basename(filepath)} — {status}')
            else:
                errors += 1
                print(f'  ✗ {os.path.basename(filepath)} — {status}')
        except Exception as e:
            errors += 1
            print(f'  ✗ {os.path.basename(filepath)} — ERROR: {e}')

    print(f'\nDone: {migrated} migrated, {no_context} without cultural context, {errors} errors')


if __name__ == '__main__':
    main()
