import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LeadEnginePriorityLevel, PipelineStage, VerificationStatus } from "@shared/lead-engine-types";
import { PIPELINE_STAGE_LABELS } from "@shared/lead-engine-types";
import type { SavedViewId } from "@shared/lead-engine-leads-query";

export type { SavedViewId };

const WEB_STATUS_OPTS = [
  "",
  "live",
  "redirected",
  "broken",
  "timeout",
  "invalid_url",
  "missing",
  "unknown",
  "none",
] as const;

const PRIORITY_OPTS: ("" | LeadEnginePriorityLevel)[] = ["", "low", "medium", "high", "urgent"];

const views: { id: SavedViewId; label: string }[] = [
  { id: "all", label: "All leads" },
  { id: "outreach_window", label: "Outreach ready" },
  { id: "verify_queue", label: "Verify queue" },
  { id: "high_score", label: "High score" },
];

export function LeadFilters({
  savedView,
  onSavedView,
  stageFilter,
  onStageFilter,
  verificationFilter,
  onVerificationFilter,
  sourceFilter,
  onSourceFilter,
  websiteStatusFilter,
  onWebsiteStatusFilter,
  priorityFilter,
  onPriorityFilter,
  categoryFilter,
  onCategoryFilter,
  cityFilter,
  onCityFilter,
  stateFilter,
  onStateFilter,
}: {
  savedView: SavedViewId;
  onSavedView: (v: SavedViewId) => void;
  stageFilter: PipelineStage | "";
  onStageFilter: (s: PipelineStage | "") => void;
  verificationFilter: VerificationStatus | "";
  onVerificationFilter: (v: VerificationStatus | "") => void;
  sourceFilter: string;
  onSourceFilter: (v: string) => void;
  websiteStatusFilter: string;
  onWebsiteStatusFilter: (v: string) => void;
  priorityFilter: string;
  onPriorityFilter: (v: string) => void;
  categoryFilter: string;
  onCategoryFilter: (v: string) => void;
  cityFilter: string;
  onCityFilter: (v: string) => void;
  stateFilter: string;
  onStateFilter: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {views.map(v => (
          <Button
            key={v.id}
            type="button"
            size="sm"
            variant={savedView === v.id ? "default" : "outline"}
            className={cn(
              "h-8 font-heading text-xs rounded-lg",
              savedView === v.id
                ? "bg-accent text-background hover:bg-accent/90"
                : "border-white/12 bg-background/30 text-foreground hover:bg-background/50"
            )}
            onClick={() => onSavedView(v.id)}
          >
            {v.label}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-heading">
          Stage
        </span>
        <select
          value={stageFilter}
          onChange={e => onStageFilter((e.target.value || "") as PipelineStage | "")}
          className="h-8 rounded-lg border border-white/12 bg-background/50 px-2 text-xs font-heading text-foreground"
        >
          <option value="">Any</option>
          {(Object.keys(PIPELINE_STAGE_LABELS) as PipelineStage[]).map(s => (
            <option key={s} value={s}>
              {PIPELINE_STAGE_LABELS[s]}
            </option>
          ))}
        </select>
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-heading ml-2">
          Verification
        </span>
        <select
          value={verificationFilter}
          onChange={e => onVerificationFilter((e.target.value || "") as VerificationStatus | "")}
          className="h-8 rounded-lg border border-white/12 bg-background/50 px-2 text-xs font-heading text-foreground"
        >
          <option value="">Any</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
          <option value="unverified">Unverified</option>
          <option value="failed">Failed</option>
        </select>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-heading">
          Source
        </span>
        <input
          value={sourceFilter}
          onChange={e => onSourceFilter(e.target.value)}
          placeholder="e.g. google_places"
          className="h-8 w-36 rounded-lg border border-white/12 bg-background/50 px-2 text-xs font-heading text-foreground placeholder:text-muted-foreground"
        />
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-heading ml-1">
          Site
        </span>
        <select
          value={websiteStatusFilter}
          onChange={e => onWebsiteStatusFilter(e.target.value)}
          className="h-8 rounded-lg border border-white/12 bg-background/50 px-2 text-xs font-heading text-foreground max-w-[8.5rem]"
        >
          {WEB_STATUS_OPTS.map(s => (
            <option key={s || "any"} value={s}>
              {s ? s : "Any"}
            </option>
          ))}
        </select>
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-heading ml-1">
          Pri
        </span>
        <select
          value={priorityFilter}
          onChange={e => onPriorityFilter(e.target.value)}
          className="h-8 rounded-lg border border-white/12 bg-background/50 px-2 text-xs font-heading text-foreground"
        >
          {PRIORITY_OPTS.map(s => (
            <option key={s || "any"} value={s}>
              {s ? s : "Any"}
            </option>
          ))}
        </select>
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-heading ml-1">
          Cat
        </span>
        <input
          value={categoryFilter}
          onChange={e => onCategoryFilter(e.target.value)}
          placeholder="Category"
          className="h-8 w-28 rounded-lg border border-white/12 bg-background/50 px-2 text-xs font-heading text-foreground"
        />
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-heading ml-1">
          City
        </span>
        <input
          value={cityFilter}
          onChange={e => onCityFilter(e.target.value)}
          placeholder="City"
          className="h-8 w-28 rounded-lg border border-white/12 bg-background/50 px-2 text-xs font-heading text-foreground"
        />
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-heading ml-1">
          St
        </span>
        <input
          value={stateFilter}
          onChange={e => onStateFilter(e.target.value)}
          placeholder="ST"
          className="h-8 w-14 rounded-lg border border-white/12 bg-background/50 px-2 text-xs font-heading text-foreground"
        />
      </div>
    </div>
  );
}
