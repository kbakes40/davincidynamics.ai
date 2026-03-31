import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PipelineStage, VerificationStatus } from "@shared/lead-engine-types";
import { PIPELINE_STAGE_LABELS } from "@shared/lead-engine-types";
import type { SavedViewId } from "@shared/lead-engine-leads-query";

export type { SavedViewId };

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
}: {
  savedView: SavedViewId;
  onSavedView: (v: SavedViewId) => void;
  stageFilter: PipelineStage | "";
  onStageFilter: (s: PipelineStage | "") => void;
  verificationFilter: VerificationStatus | "";
  onVerificationFilter: (v: VerificationStatus | "") => void;
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
    </div>
  );
}
