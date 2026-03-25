import { useEffect } from "react";
import type { Bot, BotId } from "./bots-data";
import { BOT_BY_ID } from "./bots-data";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface AITeamModalProps {
  bot: Bot | null;
  open: boolean;
  onClose: () => void;
}

export function AITeamModal({ bot, open, onClose }: AITeamModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !bot) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-team-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        aria-label="Close panel"
        onClick={onClose}
      />
      <div
        className={cn(
          "ai-team-modal-panel relative z-10 flex max-h-[96vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-cyan-400/25 bg-[rgba(6,10,18,0.92)] shadow-[0_0_0_1px_rgba(34,211,238,0.12),0_40px_120px_rgba(0,0,0,0.65),0_0_80px_-12px_rgba(34,211,238,0.35)] backdrop-blur-2xl sm:mx-4 sm:rounded-3xl",
          "sm:max-h-[min(90vh,840px)]"
        )}
      >
        <div
          className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400/55 to-transparent"
          aria-hidden
        />
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-6 pb-4 pt-5 sm:px-8">
          <div className="min-w-0 space-y-1">
            <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200/55">
              System node
            </p>
            <h2
              id="ai-team-modal-title"
              className="font-display text-xl font-semibold tracking-tight text-white sm:text-2xl"
            >
              {bot.name}
            </h2>
            <p className="font-heading text-xs font-medium text-cyan-100/75">{bot.role}</p>
          </div>
          <button
            type="button"
            className="group rounded-full border border-white/10 bg-white/[0.04] p-2 text-white/70 transition hover:border-cyan-300/35 hover:bg-cyan-400/10 hover:text-white"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4 transition group-hover:rotate-90" />
          </button>
        </div>

        <div className="custom-scrollbar flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-6 sm:px-8">
          <section className="space-y-2">
            <h3 className="font-heading text-[11px] font-semibold uppercase tracking-wider text-white/40">
              Overview
            </h3>
            <p className="font-body text-sm leading-relaxed text-white/78">{bot.shortDescription}</p>
          </section>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <section className="space-y-2">
            <h3 className="font-heading text-[11px] font-semibold uppercase tracking-wider text-white/40">
              Personality
            </h3>
            <p className="font-body text-sm italic leading-relaxed text-cyan-100/75">
              {bot.personality}
            </p>
          </section>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <section className="space-y-2">
            <h3 className="font-heading text-[11px] font-semibold uppercase tracking-wider text-white/40">
              System function
            </h3>
            <p className="font-body text-sm leading-relaxed text-white/78">{bot.systemFunction}</p>
          </section>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <section className="space-y-3">
            <h3 className="font-heading text-[11px] font-semibold uppercase tracking-wider text-white/40">
              Connected with
            </h3>
            <div className="flex flex-wrap gap-2">
              {bot.connectedWith.map(id => {
                const other = BOT_BY_ID[id as BotId];
                return (
                  <span
                    key={id}
                    className="rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 text-xs font-heading font-semibold text-cyan-100/85"
                  >
                    {other?.name ?? id}
                  </span>
                );
              })}
            </div>
          </section>

          {bot.modalCta ? (
            <div className="pt-1">
              <a
                href={bot.modalCta.href}
                className="inline-flex w-full items-center justify-center rounded-xl border border-cyan-400/35 bg-gradient-to-r from-cyan-500/25 to-blue-600/15 px-4 py-3 text-center text-sm font-heading font-semibold text-cyan-50 shadow-[0_0_32px_-10px_rgba(34,211,238,0.5)] transition hover:-translate-y-0.5 hover:border-cyan-300/55 hover:shadow-[0_0_48px_-10px_rgba(34,211,238,0.55)]"
                target="_blank"
                rel="noreferrer"
              >
                {bot.modalCta.label}
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
