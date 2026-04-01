"use client";

import { formatSignedPct } from "@/lib/traffic/format";
import type { TrafficKpi } from "@/lib/traffic/types";
import clsx from "clsx";
import { trafficCard, trafficHeroNum, trafficKicker, trafficMuted } from "./traffic-styles";

type Props = {
  items: TrafficKpi[];
  dateRangeLabel: string;
};

function isPositiveSignal(k: TrafficKpi): boolean {
  if (k.changePct == null || !Number.isFinite(k.changePct)) return false;
  if (k.changePct === 0) return true;
  return k.higherIsBetter ? k.changePct > 0 : k.changePct < 0;
}

function KpiCard({ kpi }: { kpi: TrafficKpi }) {
  const good = isPositiveSignal(kpi);
  const pct = kpi.changePct;

  return (
    <div className={`${trafficCard} p-5 sm:p-6`}>
      <p className={trafficKicker}>{kpi.label}</p>
      <p className={`mt-3 text-3xl sm:text-4xl ${trafficHeroNum}`}>{kpi.valueDisplay}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={clsx(
            "rounded-full px-2.5 py-1 text-[11px] font-semibold tabular-nums",
            pct == null || !Number.isFinite(pct)
              ? "bg-white/[0.06] text-orange-200/50 ring-1 ring-white/10"
              : good
                ? "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/25"
                : "bg-red-950/50 text-red-200/90 ring-1 ring-red-500/20"
          )}
        >
          {formatSignedPct(pct)}
        </span>
        <span className={trafficMuted}>vs prior window</span>
      </div>
    </div>
  );
}

export function KpiStack({ items, dateRangeLabel }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <p className={`${trafficMuted} text-center lg:text-left`}>{dateRangeLabel}</p>
      <div className="grid grid-cols-1 gap-4">
        {items.map(kpi => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>
    </div>
  );
}
