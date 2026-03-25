import type { Bot } from "./bots-data";
import { BOT_VISUAL_ACCENTS } from "./bots-data";
import type { HighlightTier } from "./highlight-utils";
import { cn } from "@/lib/utils";

interface AITeamCardProps {
  bot: Bot;
  highlight: HighlightTier;
  onSelect: (id: Bot["id"]) => void;
  onHover: (id: Bot["id"]) => void;
  onLeave: () => void;
}

export function AITeamCard({ bot, highlight, onSelect, onHover, onLeave }: AITeamCardProps) {
  const accent = BOT_VISUAL_ACCENTS[bot.id];

  return (
    <article
      role="button"
      tabIndex={0}
      data-visual-accent={accent}
      className={cn(
        "ai-team-card group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border bg-[var(--ai-card-bg)] p-6 backdrop-blur-xl transition-all duration-300 ease-out outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50",
        "shadow-[0_24px_70px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.07)]",
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-2xl after:bg-gradient-to-br after:from-white/[0.055] after:via-transparent after:to-transparent after:opacity-80",
        "before:pointer-events-none before:absolute before:inset-y-4 before:left-0 before:z-[1] before:w-px before:rounded-full before:bg-[rgba(var(--va),0.6)] before:shadow-[0_0_18px_2px_rgba(var(--va),0.18)] before:content-['']",
        highlight === "primary" &&
          "border-cyan-300/65 shadow-[0_0_0_1px_rgba(34,211,238,0.32),0_28px_90px_rgba(0,0,0,0.58),0_0_76px_-10px_rgba(34,211,238,0.45),inset_0_1px_0_rgba(255,255,255,0.08)]",
        highlight === "secondary" &&
          "border-[rgba(var(--va),0.38)] shadow-[0_0_56px_-16px_rgba(var(--va),0.28),0_24px_70px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]",
        highlight === "dim" && "border-white/[0.05] opacity-[0.36]",
        highlight === "none" &&
          "border-white/[0.09] hover:-translate-y-1 hover:border-[rgba(var(--va),0.45)] hover:shadow-[0_32px_90px_rgba(0,0,0,0.55),0_0_68px_-12px_rgba(var(--va),0.22),inset_0_1px_0_rgba(255,255,255,0.09)]"
      )}
      onMouseEnter={() => onHover(bot.id)}
      onMouseLeave={onLeave}
      onClick={() => onSelect(bot.id)}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(bot.id);
        }
      }}
    >
      <div className="relative z-10 flex flex-1 flex-col gap-4">
        {bot.mascotSrc ? (
          <>
            {bot.id === "nova" ? (
              <div className="ai-team-nova-mascot-wrap -mx-1 flex w-full shrink-0 justify-center px-1 pb-1.5 pt-0.5 md:-mx-0">
                <div className="flex h-[200px] w-full max-w-[218px] items-center justify-center md:h-[216px] md:max-w-[228px]">
                  <img
                    src={bot.mascotSrc}
                    alt={`${bot.name} mascot`}
                    width={1376}
                    height={768}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="pointer-events-none h-auto max-h-full w-auto max-w-full object-contain object-center select-none"
                  />
                </div>
              </div>
            ) : (
              <div className="flex justify-center py-1">
                <img
                  src={bot.mascotSrc}
                  alt={`${bot.name} mascot`}
                  width={378}
                  height={664}
                  className="mx-auto h-auto max-h-52 w-auto max-w-full object-contain object-center"
                  decoding="async"
                />
              </div>
            )}
            <span className="sr-only">{bot.name}</span>
            <p className="ai-team-card-role pl-1.5 font-heading text-xs font-medium uppercase tracking-[0.12em] md:text-[0.72rem]">
              {bot.role}
            </p>
          </>
        ) : (
          <header className="space-y-1 pl-1.5">
            <h3 className="font-display text-lg font-semibold tracking-tight text-white md:text-xl">
              {bot.name}
            </h3>
            <p className="ai-team-card-role font-heading text-xs font-medium uppercase tracking-[0.12em] md:text-[0.72rem]">
              {bot.role}
            </p>
          </header>
        )}
        <p className="font-body flex-1 pl-1.5 text-sm leading-relaxed text-white/76">
          {bot.personality}
        </p>
        <div className="flex items-center pt-1 pl-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-black/48 px-3 py-1 text-[10px] font-heading font-semibold uppercase tracking-wider text-white/74",
              "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
            )}
          >
            <span className="ai-team-status-dot ai-team-card-dot size-1.5 shrink-0 rounded-full" aria-hidden />
            {bot.statusLabel}
          </span>
        </div>
      </div>
    </article>
  );
}
