import type { Bot, BotId, FilterId } from "./bots-data";
import { AITeamCard } from "./AITeamCard";
import { AITeamFilter } from "./AITeamFilter";
import { cardHighlightTier } from "./highlight-utils";
import type { HighlightTier } from "./highlight-utils";

interface AITeamSectionProps {
  bots: Bot[];
  filter: FilterId;
  onFilterChange: (f: FilterId) => void;
  focusId: BotId | null;
  onHoverCard: (id: BotId | null) => void;
  onSelectCard: (id: BotId) => void;
  layerBoostIds?: Set<BotId>;
}

function mergeHighlight(
  botId: BotId,
  tier: HighlightTier,
  layerBoost: boolean,
  hasGlobalFocus: boolean
): HighlightTier {
  if (hasGlobalFocus) return tier;
  if (tier === "none" && layerBoost) return "secondary";
  return tier;
}

export function AITeamSection({
  bots,
  filter,
  onFilterChange,
  focusId,
  onHoverCard,
  onSelectCard,
  layerBoostIds,
}: AITeamSectionProps) {
  const hasGlobalFocus = focusId !== null;

  return (
    <section className="space-y-10" aria-labelledby="ai-team-grid-heading">
      <div className="space-y-6 text-center">
        <h2 id="ai-team-grid-heading" className="sr-only">
          Specialist grid
        </h2>
        <AITeamFilter value={filter} onChange={onFilterChange} />
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {bots.map(bot => {
          const base = cardHighlightTier(bot.id, focusId);
          const tier = mergeHighlight(
            bot.id,
            base,
            Boolean(layerBoostIds?.has(bot.id)),
            hasGlobalFocus
          );
          return (
            <div
              key={bot.id}
              className="transition-all duration-500 ease-out motion-reduce:transition-none"
            >
              <AITeamCard
                bot={bot}
                highlight={tier}
                onSelect={onSelectCard}
                onHover={onHoverCard}
                onLeave={() => onHoverCard(null)}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
