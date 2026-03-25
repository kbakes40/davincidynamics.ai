import { useEffect } from "react";
import type { Bot, BotId } from "./bots-data";
import { BOT_BY_ID, BOT_VISUAL_ACCENTS } from "./bots-data";
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

  const accent = BOT_VISUAL_ACCENTS[bot.id];

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-team-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/82 backdrop-blur-xl"
        aria-label="Close panel"
        onClick={onClose}
      />
      <div
        data-visual-accent={accent}
        className={cn(
          "ai-team-modal-panel relative z-10 flex max-h-[96vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-cyan-400/28 sm:mx-4 sm:rounded-3xl",
          "bg-[rgba(4,8,16,0.78)] shadow-[0_0_0_1px_rgba(34,211,238,0.14),0_48px_140px_rgba(0,0,0,0.72),0_0_88px_-12px_rgba(34,211,238,0.28)] backdrop-blur-2xl",
          "sm:max-h-[min(90vh,840px)]"
        )}
      >
        <div
          className="h-[3px] w-full bg-gradient-to-r from-violet-400/55 via-cyan-400/65 to-indigo-400/45"
          aria-hidden
        />
        <div className="relative border-b border-white/[0.07] bg-gradient-to-b from-cyan-400/[0.07] via-transparent to-transparent px-6 pb-4 pt-5 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-2.5">
              <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">
                Command layer / system node
              </p>
              <h2
                id="ai-team-modal-title"
                className="font-display text-2xl font-semibold tracking-tight text-white sm:text-[1.65rem]"
              >
                {bot.name}
              </h2>
              <div className="rounded-lg border border-white/[0.08] bg-black/35 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                  System role
                </p>
                <p className="ai-team-modal-role mt-1 font-heading text-xs font-medium leading-snug sm:text-[0.8rem]">
                  {bot.role}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="group shrink-0 rounded-full border border-white/12 bg-white/[0.05] p-2.5 text-white/72 transition hover:border-cyan-300/40 hover:bg-cyan-400/12 hover:text-white"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="size-4 transition duration-300 group-hover:rotate-90 motion-reduce:group-hover:rotate-0" />
            </button>
          </div>
        </div>

        {bot.mascotSrc && bot.id === "nova" ? (
          <div className="border-b border-white/[0.06] bg-transparent px-6 py-4 sm:px-8">
            <div className="ai-team-nova-mascot-wrap flex w-full justify-center">
              <div className="flex h-[236px] w-full max-w-[280px] items-center justify-center sm:h-[252px]">
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
          </div>
        ) : bot.mascotSrc ? (
          <div className="border-b border-white/[0.06] bg-transparent px-6 py-4 sm:px-8">
            <img
              src={bot.mascotSrc}
              alt={`${bot.name} mascot`}
              width={1376}
              height={768}
              className="mx-auto h-auto max-h-60 w-auto max-w-full object-contain object-center"
              decoding="async"
            />
          </div>
        ) : null}

        <div className="custom-scrollbar flex flex-1 flex-col gap-7 overflow-y-auto px-6 py-6 sm:px-8">
          <section className="space-y-2">
            <h3 className="font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-white/38">
              Overview
            </h3>
            <p className="font-body text-[15px] leading-relaxed text-white/82">{bot.shortDescription}</p>
          </section>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />

          <section className="space-y-2">
            <h3 className="font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-white/38">
              Personality
            </h3>
            <p className="font-body text-sm italic leading-relaxed text-cyan-100/78">{bot.personality}</p>
          </section>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />

          <section className="space-y-2">
            <h3 className="font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-white/38">
              System function
            </h3>
            <p className="font-body text-[15px] leading-relaxed text-white/80">{bot.systemFunction}</p>
          </section>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />

          <section className="space-y-3">
            <h3 className="font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-white/38">
              Connected with
            </h3>
            <div className="flex flex-wrap gap-2">
              {bot.connectedWith.map(id => {
                const other = BOT_BY_ID[id as BotId];
                const pillAccent = BOT_VISUAL_ACCENTS[id as BotId];
                return (
                  <span
                    key={id}
                    data-visual-accent={pillAccent}
                    className="ai-team-modal-pill rounded-full border px-3 py-1.5 text-xs font-heading font-semibold text-white/90"
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
                className="inline-flex w-full items-center justify-center rounded-xl border border-cyan-400/35 bg-gradient-to-r from-cyan-500/28 to-blue-600/18 px-4 py-3.5 text-center text-sm font-heading font-semibold text-cyan-50 shadow-[0_0_40px_-12px_rgba(34,211,238,0.55)] transition hover:-translate-y-0.5 hover:border-cyan-300/50 hover:shadow-[0_0_52px_-10px_rgba(34,211,238,0.6)]"
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
