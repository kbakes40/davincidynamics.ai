import { Fragment, useMemo } from "react";
import type { BotId } from "./bots-data";
import { BOT_BY_ID, FLOW_STEP_COPY, FLOW_STEP_IDS } from "./bots-data";
import { flowEdgeLit, flowNodeTier } from "./highlight-utils";
import { cn } from "@/lib/utils";

interface AITeamFlowProps {
  focusId: BotId | null;
  flowPinnedId: BotId | null;
  onFlowPinToggle: (id: BotId) => void;
  onFlowPinClear: () => void;
  onStepHover: (id: BotId | null) => void;
}

export function AITeamFlow({
  focusId,
  flowPinnedId,
  onFlowPinToggle,
  onFlowPinClear,
  onStepHover,
}: AITeamFlowProps) {
  const description = useMemo(() => {
    const idForCopy =
      flowPinnedId && FLOW_STEP_COPY[flowPinnedId] ? flowPinnedId
      : focusId && FLOW_STEP_COPY[focusId] ? focusId
      : null;
    if (idForCopy && FLOW_STEP_COPY[idForCopy]) {
      return FLOW_STEP_COPY[idForCopy]!;
    }
    return "Follow the sequence to see how attention becomes qualified pipeline, then coordinated follow-up.";
  }, [flowPinnedId, focusId]);

  return (
    <div className="space-y-8">
      <div className="relative overflow-x-auto pb-2">
        <div className="flex min-w-[640px] items-center justify-between gap-0 md:min-w-0">
          {FLOW_STEP_IDS.map((id, index) => {
            const bot = BOT_BY_ID[id];
            const tier = flowNodeTier(index, focusId);
            const isLast = index === FLOW_STEP_IDS.length - 1;

            const node = (
              <button
                type="button"
                className={cn(
                  "relative z-[2] flex min-w-[92px] flex-col items-center gap-2 rounded-2xl border px-3 py-3 text-center transition-all duration-300 md:min-w-[100px]",
                  tier === "idle" && "border-white/[0.07] bg-black/30 opacity-45",
                  tier === "path" &&
                    "border-cyan-400/25 bg-cyan-400/[0.07] shadow-[0_0_36px_-14px_rgba(34,211,238,0.35)]",
                  tier === "active" &&
                    "border-cyan-300/50 bg-cyan-500/15 shadow-[0_0_48px_-10px_rgba(34,211,238,0.45)]"
                )}
                onMouseEnter={() => onStepHover(id)}
                onMouseLeave={() => onStepHover(null)}
                onClick={() => onFlowPinToggle(id)}
              >
                <span className="font-display text-xs font-semibold text-white md:text-sm">
                  {bot.name}
                </span>
                <span className="font-heading text-[9px] font-medium uppercase tracking-wider text-cyan-100/55">
                  Stage {index + 1}
                </span>
              </button>
            );

            const connector =
              !isLast ? (
                <div
                  className="relative mx-1 flex min-w-[24px] flex-1 items-center"
                  aria-hidden
                >
                  <div
                    className={cn(
                      "h-px w-full rounded-full transition-all duration-300",
                      flowEdgeLit(index, focusId)
                        ? "bg-gradient-to-r from-cyan-400/55 via-cyan-200/45 to-cyan-400/35 shadow-[0_0_16px_rgba(34,211,238,0.35)]"
                        : "bg-white/[0.08]"
                    )}
                  />
                  {flowEdgeLit(index, focusId) ? (
                    <div className="ai-team-flow-line--pulse pointer-events-none absolute inset-0 h-px w-full bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent opacity-70" />
                  ) : null}
                </div>
              ) : null;

            return (
              <Fragment key={id}>
                {node}
                {connector}
              </Fragment>
            );
          })}
        </div>
      </div>

      <div
        className="rounded-2xl border border-white/[0.06] bg-black/35 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md md:px-7 md:py-5"
        aria-live="polite"
      >
        <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200/45">
          Active channel
        </p>
        <p className="mt-2 font-body text-sm leading-relaxed text-white/76">{description}</p>
        {flowPinnedId ? (
          <button
            type="button"
            className="mt-3 font-heading text-xs font-semibold text-cyan-200/65 underline-offset-4 hover:text-cyan-100 hover:underline"
            onClick={onFlowPinClear}
          >
            Clear pinned stage
          </button>
        ) : null}
      </div>
    </div>
  );
}
