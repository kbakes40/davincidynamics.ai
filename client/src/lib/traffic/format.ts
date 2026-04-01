export function formatCompactInt(n: number): string {
  if (!Number.isFinite(n)) return "-";
  return Math.round(n).toLocaleString("en-US");
}

export function formatSignedPct(pct: number | null): string {
  if (pct == null || !Number.isFinite(pct)) return "-";
  const sign = pct >= 0 ? "+" : "-";
  return `${sign}${Math.abs(pct).toFixed(1)}%`;
}
