import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Lead } from "@shared/lead-engine-types";
import { PIPELINE_STAGE_LABELS } from "@shared/lead-engine-types";
import { cn } from "@/lib/utils";
import { LeadScoreBadge } from "./lead-engine-badges";
import { VerificationBadge } from "./lead-engine-badges";
import { leMuted } from "../surface";

export type LeadSortKey = "score" | "city" | "stage" | "verification" | "lastSeen";

export function LeadTable({
  leads,
  sortKey,
  sortDir,
  onSort,
  selectedIds,
  onToggleRow,
  onToggleAll,
  onRowClick,
}: {
  leads: Lead[];
  sortKey: LeadSortKey;
  sortDir: "asc" | "desc";
  onSort: (k: LeadSortKey) => void;
  selectedIds: Set<string>;
  onToggleRow: (id: string, on: boolean) => void;
  onToggleAll: (on: boolean) => void;
  onRowClick: (lead: Lead) => void;
}) {
  const allSelected = leads.length > 0 && leads.every(l => selectedIds.has(l.id));

  const headerBtn = (key: LeadSortKey, label: string) => (
    <button
      type="button"
      onClick={() => onSort(key)}
      className={cn(
        "font-heading text-left text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      )}
    >
      {label}
      {sortKey === key ? (sortDir === "desc" ? " ↓" : " ↑") : ""}
    </button>
  );

  return (
    <div className="rounded-xl border border-white/[0.08] overflow-hidden bg-card/30">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/[0.08] hover:bg-transparent">
              <TableHead className="w-10 sticky left-0 bg-card/95 backdrop-blur-sm z-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={c => onToggleAll(c === true)}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="sticky left-8 bg-card/95 backdrop-blur-sm z-10 min-w-[180px]">
                {headerBtn("lastSeen", "Business")}
              </TableHead>
              <TableHead>{headerBtn("verification", "Verify")}</TableHead>
              <TableHead>{headerBtn("score", "Score")}</TableHead>
              <TableHead>{headerBtn("stage", "Stage")}</TableHead>
              <TableHead>{headerBtn("city", "Market")}</TableHead>
              <TableHead className="min-w-[100px]">Phone</TableHead>
              <TableHead className="min-w-[140px]">Website</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Owner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map(lead => (
              <TableRow
                key={lead.id}
                className="border-white/[0.06] hover:bg-white/[0.03] cursor-pointer"
                onClick={() => onRowClick(lead)}
              >
                <TableCell className="sticky left-0 bg-background/80 backdrop-blur-sm z-10" onClick={e => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.has(lead.id)}
                    onCheckedChange={c => onToggleRow(lead.id, c === true)}
                    aria-label={`Select ${lead.businessName}`}
                  />
                </TableCell>
                <TableCell className="sticky left-8 bg-background/80 backdrop-blur-sm z-10 font-heading font-medium text-foreground">
                  <div>{lead.businessName}</div>
                  <div className={cn(leMuted, "text-xs font-normal")}>{lead.category}</div>
                </TableCell>
                <TableCell>
                  <VerificationBadge status={lead.verificationStatus} />
                </TableCell>
                <TableCell>
                  <LeadScoreBadge score={lead.leadScore} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground font-heading whitespace-nowrap">
                  {PIPELINE_STAGE_LABELS[lead.pipelineStage]}
                </TableCell>
                <TableCell className="text-sm font-heading text-foreground whitespace-nowrap">
                  {lead.city}, {lead.state}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                  {lead.phone ?? "—"}
                </TableCell>
                <TableCell className="text-xs text-accent/80 truncate max-w-[160px]">
                  {lead.website ? (
                    <span className="underline-offset-2 hover:underline">Live</span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{lead.source}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{lead.assignedOwner ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
