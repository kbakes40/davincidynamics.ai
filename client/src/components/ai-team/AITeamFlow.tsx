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

  const focusInFlow = Boolean(focusId && FLOW_STEP_IDS.includes(focusId));

  return (
    <div className="space-y-8">
      {/* overflow-y-clip avoids overflow-x:auto forcing overflow-y:auto (scroll container) on this node. */}
      <div className="relative overflow-x-auto overflow-y-clip pb-3">
        <div
          className={cn(
            "ai-team-flow-halo pointer-events-none absolute -inset-x-6 -inset-y-10 -z-10 rounded-[3rem] bg-gradient-to-r from-cyan-400/[0.08] via-sky-300/[0.14] to-cyan-400/[0.08] blur-2xl transition-opacity duration-500 md:blur-3xl",
            focusInFlow ? "opacity-100" : "opacity-0"
          )}
          aria-hidden
        />
        <div className="relative flex min-w-[640px] items-center justify-between gap-0 md:min-w-0">
          {FLOW_STEP_IDS.map((id, index) => {
            const bot = BOT_BY_ID[id];
            const tier = flowNodeTier(index, focusId);
            const isLast = index === FLOW_STEP_IDS.length - 1;
            const edgeActive = flowEdgeLit(index, focusId);

            const node = (
              <button
                type="button"
                className={cn(
                  "relative z-[2] flex min-w-[92px] flex-col items-center gap-2 rounded-2xl border px-3 py-3 text-center transition-all duration-300 md:min-w-[100px]",
                  "hover:scale-[1.02] hover:shadow-[0_0_36px_-8px_rgba(34,211,238,0.45)]",
                  tier === "idle" && "border-white/[0.08] bg-black/35 opacity-50",
                  tier === "path" &&
                    "border-cyan-400/38 bg-cyan-400/[0.1] shadow-[0_0_44px_-12px_rgba(34,211,238,0.42)]",
                  tier === "active" &&
                    "z-[3] border-cyan-300/60 bg-cyan-500/[0.18] shadow-[0_0_56px_-8px_rgba(34,211,238,0.52),0_0_0_1px_rgba(165,243,252,0.2)]"
                )}
                onMouseEnter={() => onStepHover(id)}
                onMouseLeave={() => onStepHover(null)}
                onClick={() => onFlowPinToggle(id)}
              >
                <span className="font-display text-xs font-semibold text-white md:text-sm">{bot.name}</span>
                <span className="font-heading text-[9px] font-medium uppercase tracking-wider text-cyan-100/60">
                  Stage {index + 1}
                </span>
              </button>
            );

            const connector = !isLast ? (
              <div className="relative mx-1 flex min-w-[24px] flex-1 items-center" aria-hidden>
                <div
                  className={cn(
                    "h-px w-full rounded-full transition-all duration-300",
                    edgeActive
                      ? "bg-gradient-to-r from-cyan-400/75 via-cyan-100/65 to-cyan-400/75 shadow-[0_0_22px_rgba(34,211,238,0.45)]"
                      : "bg-white/[0.1]"
                  )}
                />
                {edgeActive ? (
                  <>
                    <div className="ai-team-flow-line--pulse pointer-events-none absolute inset-0 h-px w-full bg-gradient-to-r from-transparent via-cyan-100/75 to-transparent opacity-80" />
                    <div className="ai-team-flow-travel" />
                  </>
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

      <div className="rounded-2xl border border-white/[0.08] bg-black/40 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-lg md:px-7 md:py-5">
        <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200/50">
          Active channel
        </p>
        <p className="mt-2 font-body text-sm leading-relaxed text-white/78">{description}</p>
        {flowPinnedId ? (
          <button
            type="button"
            className="mt-3 font-heading text-xs font-semibold text-cyan-200/70 underline-offset-4 hover:text-cyan-100 hover:underline"
            onClick={onFlowPinClear}
          >
            Clear pinned stage
          </button>
        ) : null}
      </div>
    </div>
  );
}
