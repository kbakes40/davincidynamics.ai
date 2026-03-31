import { cn } from "@/lib/utils";
import { leInset, leMuted } from "../surface";

export function MarketHeatList({
  title,
  rows,
  labelKey,
  valueKey,
  className,
}: {
  title: string;
  rows: Record<string, string | number>[];
  labelKey: string;
  valueKey: string;
  className?: string;
}) {
  const max = Math.max(1, ...rows.map(r => Number(r[valueKey]) || 0));
  return (
    <div className={className}>
      <p className={cn(leMuted, "uppercase tracking-wider text-[11px] mb-3")}>{title}</p>
      <ul className="space-y-2">
        {rows.slice(0, 8).map((row, i) => {
          const label = String(row[labelKey]);
          const val = Number(row[valueKey]) || 0;
          const pct = Math.round((val / max) * 100);
          return (
            <li key={`${label}-${i}`} className="space-y-1">
              <div className="flex justify-between text-xs font-heading">
                <span className="text-foreground truncate pr-2">{label}</span>
                <span className="text-muted-foreground tabular-nums shrink-0">{val}</span>
              </div>
              <div className={cn(leInset, "h-1.5 overflow-hidden p-0 border-0 bg-white/[0.06]")}>
                <div
                  className="h-full bg-accent/35 rounded-sm transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
