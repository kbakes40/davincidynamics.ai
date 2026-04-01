export function safeNum(v: string | undefined | null): number {
  if (v == null || v === "") return 0;
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

export function formatBounceRateFraction(fraction: number): string {
  if (!Number.isFinite(fraction)) return "-";
  return `${(fraction * 100).toFixed(2)}%`;
}

export function formatPercentRatio(ratio: number): string {
  if (!Number.isFinite(ratio)) return "-";
  return `${ratio.toFixed(2)}%`;
}

export function formatDurationSeconds(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "-";
  const s = Math.round(seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return `${h}h ${mm}m ${r}s`;
  }
  return `${m}m ${String(r).padStart(2, "0")}s`;
}

export function pctChange(prev: number, cur: number): number | null {
  if (!Number.isFinite(prev) || !Number.isFinite(cur)) return null;
  if (prev === 0) return cur === 0 ? 0 : null;
  return ((cur - prev) / prev) * 100;
}
