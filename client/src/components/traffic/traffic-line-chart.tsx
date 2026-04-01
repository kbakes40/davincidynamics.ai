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
  const stroke = color === "amber" ? "#fbbf24" : "#fb923c";
  const fillLow = color === "amber" ? "#fbbf24" : "#fb923c";

  const rows = useMemo(() => {
    return (Array.isArray(data) ? data : []).map(d => ({
      ...d,
      value: Number.isFinite(Number(d.value)) ? Number(d.value) : 0,
      label: parseChartDate(d.date),
    }));
  }, [data]);

  return (
    <div className={`${trafficCard} flex min-h-[280px] flex-col p-5 sm:p-6`}>
      <p className={trafficKicker}>{title}</p>
      <p className={`mt-2 text-4xl sm:text-5xl ${trafficHeroNum}`}>{formatCompactInt(total)}</p>
      <p className={`mt-1 ${trafficMuted}`}>{subtitle}</p>
      {rows.length === 0 ? (
        <p className="mt-8 flex flex-1 items-center justify-center text-center text-sm text-orange-200/40" role="status">
          No trend data for this period.
        </p>
      ) : (
        <div className="mt-4 h-44 min-h-[11rem] w-full min-w-0 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rows} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={fillLow} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={fillLow} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tick={{ fill: "rgba(254, 243, 199, 0.45)", fontSize: 10 }}
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
                strokeWidth={1.5}
                fill={`url(#${gradId})`}
                dot={false}
                isAnimationActive={rows.length < 120}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
