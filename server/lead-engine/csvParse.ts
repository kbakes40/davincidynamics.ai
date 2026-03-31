/**
 * Minimal RFC 4180-style CSV parsing (quoted fields, CRLF/LF).
 */
export function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const rows = splitRows(text.trim());
  if (rows.length === 0) return { headers: [], rows: [] };
  const headers = parseRow(rows[0]).map(h => normalizeHeader(h));
  const out: Record<string, string>[] = [];
  for (let i = 1; i < rows.length; i++) {
    const cells = parseRow(rows[i]);
    if (cells.every(c => c.trim() === "")) continue;
    const obj: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = cells[j] ?? "";
    }
    out.push(obj);
  }
  return { headers, rows: out };
}

function normalizeHeader(h: string): string {
  return h.trim().replace(/\s+/g, " ").toLowerCase();
}

function splitRows(text: string): string[] {
  const lines: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (c === '"') {
      inQuotes = !inQuotes;
      cur += c;
      continue;
    }
    if (!inQuotes && (c === "\n" || (c === "\r" && text[i + 1] === "\n"))) {
      if (c === "\r") i++;
      lines.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  if (cur.length > 0) lines.push(cur);
  return lines;
}

function parseRow(line: string): string[] {
  const cells: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i]!;
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (!inQuotes && c === ",") {
      cells.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  cells.push(cur);
  return cells.map(c => c.trim());
}
