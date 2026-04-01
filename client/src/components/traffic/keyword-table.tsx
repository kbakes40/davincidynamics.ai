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
    <div className={`${trafficCard} p-6 sm:p-7`}>
      <p className={trafficKicker}>{title}</p>
      <p className={`mt-1 ${trafficMuted}`}>{dateRangeLabel}</p>
      {list.length === 0 ? (
        <p className="py-10 text-center text-sm text-orange-200/40" role="status">
          No rows returned for this period.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto pr-1">
          <table className="w-full min-w-[280px] border-separate border-spacing-y-1 text-left text-[13px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-orange-200/45">
                <th className="pb-2 pr-4 font-medium">Label</th>
                <th className="pb-2 pl-3 text-right font-medium">Sessions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row, i) => (
                <tr key={`${row.label}-${i}`} className="rounded-xl bg-black/[0.12] ring-1 ring-white/[0.04]">
                  <td className="max-w-[min(100%,280px)] truncate rounded-l-xl py-2.5 pr-4 pl-3 text-orange-50/90 leading-5" title={row.label}>
                    {row.label || "-"}
                  </td>
                  <td className="rounded-r-xl py-2.5 pr-3 pl-3 text-right tabular-nums text-amber-100/90 leading-5">
                    {formatCompactInt(row.sessions)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
