"use client";

import { formatCompactInt } from "@/lib/traffic/format";
import { useId, useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { trafficCard, trafficHeroNum, trafficKicker, trafficMuted } from "./traffic-styles";

const tooltipClass =
  "rounded-lg border border-orange-900/60 bg-[#292524]/95 px-3 py-2 text-xs text-amber-50 shadow-lg backdrop-blur-sm";

type Props = {
  title: string;
  total: number;
  subtitle: string;
  data: { date: string; value: number }[];
  color: "amber" | "orange";
};

function parseChartDate(d: string): string {
  if (d.length === 8 && /^\d{8}$/.test(d)) {
    const m = d.slice(4, 6);
    const day = d.slice(6, 8);
    return `${m}/${day}`;
  }
  if (d.includes("-")) {
    const p = d.split("-");
    if (p.length >= 3) return `${p[1]}/${p[2]}`;
  }
  return d;
}

export function TrafficLineChart({ title, total, subtitle, data, color }: Props) {
  const gid = useId().replace(/:/g, "");
  const gradId = `trafficArea-${color}-${gid}`;
  const stroke = color === "amber" ? "#fde68a" : "#fdba74";
  const fillLow = color === "amber" ? "#f59e0b" : "#f97316";

  const rows = useMemo(() => {
    return (Array.isArray(data) ? data : []).map(d => ({
      ...d,
      value: Number.isFinite(Number(d.value)) ? Number(d.value) : 0,
      label: parseChartDate(d.date),
    }));
  }, [data]);
  const isSparse = rows.length > 0 && rows.length < 4;
  const first = rows[0]?.value ?? 0;
  const last = rows[rows.length - 1]?.value ?? 0;
  const sparseChangePct = first === 0 ? null : ((last - first) / first) * 100;

  return (
    <div className={`${trafficCard} flex h-full min-h-[360px] flex-col p-6 sm:p-7`}>
      <p className={trafficKicker}>{title}</p>
      <p className={`mt-2 text-[2.25rem] sm:text-[2.6rem] ${trafficHeroNum}`}>{formatCompactInt(total)}</p>
      <p className={`mt-1 ${trafficMuted}`}>{subtitle}</p>
      {rows.length === 0 ? (
        <p className="mt-8 flex flex-1 items-center justify-center text-center text-sm text-orange-200/40" role="status">
          No trend data for this period.
        </p>
      ) : isSparse ? (
        <div className="mt-5 flex h-[108px] min-h-[6.75rem] w-full items-center justify-between rounded-2xl border border-orange-800/25 bg-black/[0.12] px-5">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/85 shadow-[0_0_0_4px_rgba(251,191,36,0.12)]" />
            <span className="text-sm text-orange-100/80">Limited points</span>
          </div>
          <span className="text-sm font-medium tabular-nums text-amber-100/90">
            {sparseChangePct == null ? "-" : `${sparseChangePct >= 0 ? "+" : "-"}${Math.abs(sparseChangePct).toFixed(1)}%`}
          </span>
        </div>
      ) : (
        <div className="mt-4 h-[210px] min-h-[210px] w-full min-w-0 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rows} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={fillLow} stopOpacity={0.42} />
                  <stop offset="100%" stopColor={fillLow} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tick={{ fill: "rgba(254, 243, 199, 0.62)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.[0] ? (
                    <div className={tooltipClass}>
                      <span className="tabular-nums text-amber-100">{formatCompactInt(Number(payload[0].value))}</span>
                    </div>
                  ) : null
                }
                cursor={{ stroke: "rgba(251, 191, 36, 0.25)" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={stroke}
                strokeOpacity={0.95}
                strokeWidth={2}
                fill={`url(#${gradId})`}
                dot={false}
                activeDot={{ r: 3, fill: stroke, stroke: "rgba(28,10,2,0.8)", strokeWidth: 1.5 }}
                isAnimationActive={rows.length < 120}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
