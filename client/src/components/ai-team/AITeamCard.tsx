import type { Bot } from "./bots-data";
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
  return (
    <article
      role="button"
      tabIndex={0}
      className={cn(
        "group relative flex h-full cursor-pointer flex-col rounded-2xl border bg-[var(--ai-panel)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-all duration-300 ease-out outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-cyan-400/10 before:via-transparent before:to-blue-600/5 before:opacity-0 before:transition-opacity before:duration-300",
        highlight === "primary" &&
          "border-cyan-300/55 shadow-[0_0_0_1px_rgba(34,211,238,0.25),0_24px_80px_rgba(0,0,0,0.55),0_0_60px_-8px_rgba(34,211,238,0.35)] before:opacity-100",
        highlight === "secondary" &&
          "border-cyan-400/28 shadow-[0_0_48px_-16px_rgba(34,211,238,0.2)] before:opacity-70",
        highlight === "dim" && "border-white/[0.06] opacity-[0.38]",
        highlight === "none" &&
          "border-cyan-400/15 hover:-translate-y-0.5 hover:border-cyan-300/35 hover:shadow-[0_28px_70px_rgba(0,0,0,0.5),0_0_52px_-12px_rgba(34,211,238,0.22)] hover:before:opacity-100"
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
        <header className="space-y-1">
          <h3 className="font-display text-lg font-semibold tracking-tight text-white md:text-xl">
            {bot.name}
          </h3>
          <p className="font-heading text-xs font-medium uppercase tracking-[0.12em] text-cyan-200/70 md:text-[0.72rem]">
            {bot.role}
          </p>
        </header>
        <p className="font-body flex-1 text-sm leading-relaxed text-white/72">{bot.personality}</p>
        <div className="flex items-center pt-1">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/35 px-3 py-1 text-[10px] font-heading font-semibold uppercase tracking-wider text-white/65",
              "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
            )}
          >
            <span
              className="ai-team-status-dot size-1.5 rounded-full bg-cyan-300"
              aria-hidden
            />
            {bot.statusLabel}
          </span>
        </div>
      </div>
    </article>
  );
}
