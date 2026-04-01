"use client";

import { formatCompactInt } from "@/lib/traffic/format";
import type { TrafficTableRow } from "@/lib/traffic/types";
import { trafficCard, trafficKicker, trafficMuted } from "./traffic-styles";

type Props = {
  title: string;
  rows: TrafficTableRow[];
  dateRangeLabel: string;
};

export function KeywordTable({ title, rows, dateRangeLabel }: Props) {
  const list = Array.isArray(rows) ? rows : [];

  return (
    <div className={`${trafficCard} p-5 sm:p-6`}>
      <p className={trafficKicker}>{title}</p>
      <p className={`mt-1 ${trafficMuted}`}>{dateRangeLabel}</p>
      {list.length === 0 ? (
        <p className="py-10 text-center text-sm text-orange-200/40" role="status">
          No rows returned for this period.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[280px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-orange-900/50 text-[11px] uppercase tracking-wide text-orange-200/45">
                <th className="pb-2 pr-4 font-medium">Label</th>
                <th className="pb-2 text-right font-medium">Sessions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row, i) => (
                <tr key={`${row.label}-${i}`} className="border-b border-white/[0.04]">
                  <td className="max-w-[min(100%,280px)] truncate py-2.5 pr-4 text-orange-50/90" title={row.label}>
                    {row.label || "-"}
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-amber-100/90">{formatCompactInt(row.sessions)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
