import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Lead, PipelineStage } from "@shared/lead-engine-types";
import { PIPELINE_COLUMNS, PIPELINE_STAGE_LABELS } from "@shared/lead-engine-types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { LeadScoreBadge } from "./lead-engine-badges";
import { patchLeadStageApi } from "../api";
import { leInset, leMuted, leSurface } from "../surface";

function PipelineCard({
  lead,
  onStageChange,
}: {
  lead: Lead;
  onStageChange: (id: string, stage: PipelineStage) => Promise<void>;
}) {
  return (
    <div className={cn(leInset, "p-3 space-y-2 border-white/[0.08] hover:border-accent/15 transition-colors")}>
      <div className="flex items-start justify-between gap-2">
        <p className="font-heading font-semibold text-sm text-foreground leading-tight">{lead.businessName}</p>
        <LeadScoreBadge score={lead.leadScore} />
      </div>
      <p className={cn(leMuted, "text-xs")}>
        {lead.city}, {lead.state}
      </p>
      <p className="text-[11px] text-muted-foreground font-heading">
        Web: {lead.website ? "Live" : "None"}
      </p>
      <p className="text-[11px] text-muted-foreground font-heading">
        Owner: {lead.assignedOwner ?? "—"}
      </p>
      <p className="text-[11px] text-muted-foreground font-heading">
        Last: {new Date(lead.lastSeenAt).toLocaleDateString()}
      </p>
      <Select
        value={lead.pipelineStage}
        onValueChange={async v => {
          await onStageChange(lead.id, v as PipelineStage);
        }}
      >
        <SelectTrigger className="h-8 text-xs border-white/12 bg-background/50 font-heading">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border-white/12 bg-card">
          {PIPELINE_COLUMNS.map(s => (
            <SelectItem key={s} value={s} className="font-heading text-xs">
              {PIPELINE_STAGE_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function PipelineBoard({
  leads,
  onRefresh,
}: {
  leads: Lead[];
  onRefresh: () => void;
}) {
  const byStage = PIPELINE_COLUMNS.map(stage => ({
    stage,
    label: PIPELINE_STAGE_LABELS[stage],
    items: leads.filter(l => l.pipelineStage === stage),
  }));

  async function handleStageChange(id: string, stage: PipelineStage) {
    try {
      await patchLeadStageApi(id, stage);
      toast.success("Stage updated");
      onRefresh();
    } catch {
      toast.error("Could not update stage");
    }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scroll-smooth">
      {byStage.map(col => (
        <div
          key={col.stage}
          className={cn(
            leSurface,
            "min-h-[320px] w-[min(100%,280px)] min-w-[260px] snap-start shrink-0 flex flex-col p-3 border-white/[0.07]"
          )}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground truncate">
              {col.label}
            </h3>
            <span className="text-[11px] tabular-nums text-muted-foreground">{col.items.length}</span>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto max-h-[70vh] pr-1 custom-scrollbar">
            {col.items.map(lead => (
              <PipelineCard key={lead.id} lead={lead} onStageChange={handleStageChange} />
            ))}
            {col.items.length === 0 ? (
              <p className={cn(leMuted, "text-xs px-1 py-6 text-center")}>Empty</p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

