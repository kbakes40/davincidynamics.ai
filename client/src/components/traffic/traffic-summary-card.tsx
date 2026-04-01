"use client";

import { trafficCard, trafficKicker, trafficMuted } from "./traffic-styles";

type Props = {
  summary: string;
  badge: string;
  dateRangeLabel: string;
};

export function TrafficSummaryCard({ summary, badge, dateRangeLabel }: Props) {
  return (
    <div className={`${trafficCard} p-6 sm:p-7`}>
      <p className={trafficKicker}>Traffic summary</p>
      <p className={`mt-1 ${trafficMuted}`}>{dateRangeLabel}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-200 ring-1 ring-amber-500/25">
          {badge}
        </span>
      </div>
      <p className="mt-5 text-[13px] leading-7 text-orange-100/75 sm:text-sm sm:leading-7">{summary}</p>
    </div>
  );
}
