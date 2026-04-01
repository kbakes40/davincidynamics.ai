"use client";

import clsx from "clsx";
import type { TrafficDateRange } from "@/lib/traffic/types";

const OPTIONS: { value: TrafficDateRange; label: string }[] = [
  { value: "last7", label: "Last 7 Days" },
  { value: "last30", label: "Last 30 Days" },
  { value: "last90", label: "Last 90 Days" },
  { value: "ytd", label: "Year to Date" },
];

type Props = {
  selected: TrafficDateRange;
  onChange: (range: TrafficDateRange) => void;
};

export function TrafficDateRangeSelector({ selected, onChange }: Props) {
  return (
    <div
      className="flex max-w-full flex-wrap gap-1.5 rounded-2xl border border-orange-950/50 bg-[#292524]/50 p-1 backdrop-blur-md"
      role="group"
      aria-label="Date range"
    >
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          aria-pressed={selected === value}
          onClick={() => onChange(value)}
          className={clsx(
            "min-h-[40px] rounded-xl px-3 py-2 text-[11px] font-medium tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c0a02]",
            selected === value
              ? "bg-gradient-to-b from-amber-700/40 to-orange-950/60 text-amber-50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] ring-1 ring-amber-500/30"
              : "text-orange-200/45 hover:bg-white/[0.06] hover:text-orange-100/80"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
