import type { BotId } from "./bots-data";
import { SYSTEM_LAYERS } from "./bots-data";
import { BOT_BY_ID, BOT_VISUAL_ACCENTS } from "./bots-data";
import { cn } from "@/lib/utils";

const LAYER_BAR: Record<string, string> = {
  growth: "from-violet-400/8 to-indigo-600/25",
  revenue: "from-sky-400/8 to-cyan-600/25",
  operations: "from-emerald-400/8 to-teal-600/25",
  engineering: "from-amber-400/8 to-indigo-600/25",
};

const LAYER_HOVER: Record<string, string> = {
  growth: "hover:border-violet-400/22 hover:shadow-[0_28px_80px_rgba(0,0,0,0.55),0_0_48px_-14px_rgba(167,139,250,0.15)]",
  revenue:
    "hover:border-cyan-400/22 hover:shadow-[0_28px_80px_rgba(0,0,0,0.55),0_0_48px_-14px_rgba(56,189,248,0.15)]",
  operations:
    "hover:border-emerald-400/22 hover:shadow-[0_28px_80px_rgba(0,0,0,0.55),0_0_48px_-14px_rgba(52,211,153,0.15)]",
  engineering:
    "hover:border-amber-400/18 hover:shadow-[0_28px_80px_rgba(0,0,0,0.55),0_0_48px_-14px_rgba(251,146,60,0.12)]",
};

interface AITeamLayersProps {
  onLayerHover: (botIds: BotId[] | null) => void;
}

export function AITeamLayers({ onLayerHover }: AITeamLayersProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {SYSTEM_LAYERS.map((layer, i) => (
        <div
          key={layer.id}
          className={cn(
            "group pointer-events-none relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[linear-gradient(145deg,rgba(6,10,18,0.92),rgba(3,6,14,0.78))] shadow-[0_28px_80px_rgba(0,0,0,0.52)] backdrop-blur-xl transition-all duration-300",
            "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent",
            LAYER_HOVER[layer.id]
          )}
        >
          <div
            className={cn(
              "pointer-events-none absolute left-0 top-6 h-11 w-1 rounded-r-full bg-gradient-to-b opacity-80 transition group-hover:opacity-100",
              LAYER_BAR[layer.id]
            )}
            aria-hidden
          />
          <div
            className="relative cursor-default space-y-4 p-6 pl-8 pointer-events-auto"
            onMouseEnter={() => onLayerHover(layer.botIds)}
            onMouseLeave={() => onLayerHover(null)}
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-display text-base font-semibold tracking-tight text-white md:text-lg">
                {layer.title}
              </h3>
              <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-white/38">
                Layer {i + 1}
              </span>
            </div>
            <p className="font-body text-sm leading-relaxed text-white/72">{layer.explanation}</p>
            <div className="flex flex-wrap gap-2">
              {layer.botIds.map(id => {
                const a = BOT_VISUAL_ACCENTS[id];
                return (
                  <span
                    key={id}
                    data-visual-accent={a}
                    className="rounded-full border border-[rgba(var(--va),0.28)] bg-black/40 px-3 py-1 text-xs font-heading font-semibold text-white/85 shadow-[0_0_16px_-6px_rgba(var(--va),0.25)]"
                  >
                    {BOT_BY_ID[id].name}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
