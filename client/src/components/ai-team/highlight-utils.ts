import type { BotId } from "./bots-data";
import { BOT_BY_ID, FLOW_STEP_IDS } from "./bots-data";

export type HighlightTier = "none" | "primary" | "secondary" | "dim";

export function collectFocusActors(focusId: BotId | null): {
  primary: BotId | null;
  secondary: Set<BotId>;
} {
  if (!focusId) {
    return { primary: null, secondary: new Set() };
  }
  const bot = BOT_BY_ID[focusId];
  if (!bot) return { primary: focusId, secondary: new Set() };
  return { primary: focusId, secondary: new Set(bot.connectedWith) };
}

export function cardHighlightTier(botId: BotId, focusId: BotId | null): HighlightTier {
  if (!focusId) return "none";
  const { primary, secondary } = collectFocusActors(focusId);
  if (botId === primary) return "primary";
  if (secondary.has(botId)) return "secondary";
  return "dim";
}

/** Flow nodes 0..idx inclusive; edges between consecutive nodes up to idx */
export function flowPathIndices(focusId: BotId | null): {
  activeIndex: number;
  litNodeIndices: Set<number>;
  litEdgeIndices: Set<number>;
} {
  const emptyNodes = new Set<number>();
  const emptyEdges = new Set<number>();
  if (!focusId) {
    return { activeIndex: -1, litNodeIndices: emptyNodes, litEdgeIndices: emptyEdges };
  }
  const idx = FLOW_STEP_IDS.indexOf(focusId);
  if (idx < 0) {
    return { activeIndex: -1, litNodeIndices: emptyNodes, litEdgeIndices: emptyEdges };
  }
  const litNodeIndices = new Set<number>();
  const litEdgeIndices = new Set<number>();
  for (let i = 0; i <= idx; i++) litNodeIndices.add(i);
  for (let i = 0; i < idx; i++) litEdgeIndices.add(i);
  return { activeIndex: idx, litNodeIndices, litEdgeIndices };
}

export function flowNodeTier(stepIndex: number, focusId: BotId | null): "idle" | "path" | "active" {
  const { litNodeIndices, activeIndex } = flowPathIndices(focusId);
  if (!litNodeIndices.has(stepIndex)) return "idle";
  if (stepIndex === activeIndex) return "active";
  return "path";
}

export function flowEdgeLit(edgeIndex: number, focusId: BotId | null): boolean {
  return flowPathIndices(focusId).litEdgeIndices.has(edgeIndex);
}
