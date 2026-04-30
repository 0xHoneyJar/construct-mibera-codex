import { readFileSync } from "node:fs";

export interface H2Section {
  heading: string;
  body: string;
}

export function readMarkdown(path: string): string {
  return readFileSync(path, "utf8");
}

export function splitH2Sections(markdown: string): H2Section[] {
  const lines = markdown.split("\n");
  const sections: H2Section[] = [];
  let current: H2Section | null = null;
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.startsWith("```")) inCodeBlock = !inCodeBlock;

    if (!inCodeBlock && line.startsWith("## ")) {
      if (current) sections.push(current);
      current = { heading: line.slice(3).trim(), body: "" };
      continue;
    }

    if (current) current.body += line + "\n";
  }
  if (current) sections.push(current);
  return sections;
}

export function splitH3Sections(markdown: string): H2Section[] {
  const lines = markdown.split("\n");
  const sections: H2Section[] = [];
  let current: H2Section | null = null;
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.startsWith("```")) inCodeBlock = !inCodeBlock;

    if (!inCodeBlock && line.startsWith("### ")) {
      if (current) sections.push(current);
      current = { heading: line.slice(4).trim(), body: "" };
      continue;
    }

    if (current) current.body += line + "\n";
  }
  if (current) sections.push(current);
  return sections;
}

export interface TableRow {
  [column: string]: string;
}

export function parseFirstMarkdownTable(body: string): TableRow[] {
  const lines = body.split("\n");
  let headerLine = -1;
  for (let i = 0; i < lines.length - 1; i++) {
    if (
      lines[i].includes("|") &&
      /^\s*\|[-:\s|]+\|\s*$/.test(lines[i + 1])
    ) {
      headerLine = i;
      break;
    }
  }
  if (headerLine === -1) return [];

  const cols = splitTableRow(lines[headerLine]);
  const rows: TableRow[] = [];
  for (let i = headerLine + 2; i < lines.length; i++) {
    const line = lines[i];
    if (!line.includes("|")) break;
    if (line.trim() === "") break;
    const cells = splitTableRow(line);
    if (cells.length === 0) continue;
    const row: TableRow = {};
    cols.forEach((col, idx) => {
      row[col.toLowerCase().trim()] = (cells[idx] ?? "").trim();
    });
    rows.push(row);
  }
  return rows;
}

function splitTableRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((c) => c.trim());
}

export function stripBackticks(s: string): string {
  return s.replace(/^`|`$/g, "").trim();
}

export function stripMarkdownLinks(s: string): string {
  return s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}
