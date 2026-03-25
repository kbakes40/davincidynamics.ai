import type { FilterId } from "./bots-data";
import { cn } from "@/lib/utils";

const SEGMENTS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "growth", label: "Growth" },
  { id: "customer-facing", label: "Customer Facing" },
  { id: "operations", label: "Operations" },
  { id: "engineering", label: "Engineering" },
];

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
      <div className="flex w-full rounded-full border border-cyan-400/20 bg-black/50 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
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
                  ? "text-cyan-100 shadow-[0_0_24px_-4px_rgba(34,211,238,0.5),inset_0_0_0_1px_rgba(34,211,238,0.25)]"
                  : "text-white/45 hover:text-white/70"
              )}
              onClick={() => onChange(seg.id)}
            >
              {active ? (
                <span
                  className="absolute inset-0 -z-10 rounded-full bg-gradient-to-b from-cyan-500/25 to-blue-600/10 opacity-90"
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
