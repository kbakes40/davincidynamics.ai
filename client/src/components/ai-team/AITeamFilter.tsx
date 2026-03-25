import type { FilterId } from "./bots-data";
import { cn } from "@/lib/utils";

const SEGMENTS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "growth", label: "Growth" },
  { id: "customer-facing", label: "Customer Facing" },
  { id: "operations", label: "Operations" },
  { id: "engineering", label: "Engineering" },
];

const ACTIVE_BG: Record<FilterId, string> = {
  all: "from-cyan-500/28 to-blue-600/12",
  growth: "from-violet-500/28 to-indigo-600/14",
  "customer-facing": "from-sky-400/28 to-cyan-600/14",
  operations: "from-emerald-500/25 to-teal-600/12",
  engineering: "from-amber-500/22 to-indigo-600/14",
};

const ACTIVE_SHADOW: Record<FilterId, string> = {
  all: "shadow-[0_0_28px_-6px_rgba(34,211,238,0.45)]",
  growth: "shadow-[0_0_28px_-6px_rgba(167,139,250,0.4)]",
  "customer-facing": "shadow-[0_0_28px_-6px_rgba(56,189,248,0.42)]",
  operations: "shadow-[0_0_28px_-6px_rgba(52,211,153,0.38)]",
  engineering: "shadow-[0_0_28px_-6px_rgba(251,146,60,0.32)]",
};

const ACTIVE_TEXT: Record<FilterId, string> = {
  all: "text-cyan-50",
  growth: "text-violet-100",
  "customer-facing": "text-sky-100",
  operations: "text-emerald-100",
  engineering: "text-amber-50",
};

interface AITeamFilterProps {
  value: FilterId;
  onChange: (next: FilterId) => void;
}

export function AITeamFilter({ value, onChange }: AITeamFilterProps) {
  return (
    <div
      className="relative mx-auto flex w-full max-w-2xl items-center justify-center p-1"
      role="tablist"
      aria-label="Filter specialists"
    >
      <div className="flex w-full rounded-full border border-white/10 bg-black/55 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_14px_48px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        {SEGMENTS.map(seg => {
          const active = value === seg.id;
          return (
            <button
              key={seg.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={cn(
                "relative z-[1] min-h-10 flex-1 rounded-full px-2 py-2 text-center text-xs font-heading font-semibold tracking-wide transition-all duration-300 sm:px-3 sm:text-sm",
                active
                  ? cn(
                      ACTIVE_TEXT[seg.id],
                      "ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                    )
                  : "text-white/42 hover:text-white/72"
              )}
              onClick={() => onChange(seg.id)}
            >
              {active ? (
                <span
                  className={cn(
                    "absolute inset-0 -z-10 rounded-full bg-gradient-to-b opacity-95",
                    ACTIVE_BG[seg.id],
                    ACTIVE_SHADOW[seg.id]
                  )}
                  aria-hidden
                />
              ) : null}
              <span className="relative">{seg.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
