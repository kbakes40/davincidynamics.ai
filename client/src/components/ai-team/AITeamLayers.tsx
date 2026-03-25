import type { BotId } from "./bots-data";
import { SYSTEM_LAYERS } from "./bots-data";
import { BOT_BY_ID } from "./bots-data";
import { cn } from "@/lib/utils";

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
            "group relative overflow-hidden rounded-2xl border border-cyan-400/12 bg-[linear-gradient(145deg,rgba(8,14,26,0.85),rgba(4,8,16,0.72))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300",
            "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-cyan-400/35 before:to-transparent",
            "hover:border-cyan-300/25 hover:shadow-[0_28px_80px_rgba(0,0,0,0.55),0_0_48px_-14px_rgba(34,211,238,0.18)]"
          )}
          onMouseEnter={() => onLayerHover(layer.botIds)}
          onMouseLeave={() => onLayerHover(null)}
        >
          <div
            className="absolute left-0 top-6 h-10 w-1 rounded-r-full bg-gradient-to-b from-cyan-300/55 to-blue-500/25 opacity-70 transition group-hover:opacity-100"
            aria-hidden
          />
          <div className="relative space-y-4 pl-4">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-display text-base font-semibold tracking-tight text-white md:text-lg">
                {layer.title}
              </h3>
              <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200/45">
                Layer {i + 1}
              </span>
            </div>
            <p className="font-body text-sm leading-relaxed text-white/70">{layer.explanation}</p>
            <div className="flex flex-wrap gap-2">
              {layer.botIds.map(id => (
                <span
                  key={id}
                  className="rounded-full border border-white/[0.08] bg-black/35 px-3 py-1 text-xs font-heading font-semibold text-cyan-100/80"
                >
                  {BOT_BY_ID[id].name}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
