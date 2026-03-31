import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Lead, PipelineStage, VerificationStatus } from "@shared/lead-engine-types";
import { PIPELINE_STAGE_LABELS } from "@shared/lead-engine-types";
import { LeadFilters, type SavedViewId } from "../components/LeadFilters";
import { LeadTable, type LeadSortKey } from "../components/LeadTable";
import {
  EmptyState,
  PageSkeleton,
  RefreshControl,
  SearchToolbar,
  SectionCard,
} from "../components/lead-engine-primitives";
import { LeadScoreBadge, VerificationBadge } from "../components/lead-engine-badges";
import { LeadReasonChips } from "../components/LeadReasonChips";
import { fetchLeads } from "../api";
import { buildLeadsCsv, downloadTextFile, localDateYyyyMmDd } from "../exportLeadsCsv";
import { filterAndSortLeads } from "../leadsQuery";
import { LeadEngineShell } from "../LeadEngineShell";
import { cn } from "@/lib/utils";
import { leMuted, leSurface } from "../surface";
import { toast } from "sonner";
import { Download } from "lucide-react";

export default function LeadEngineLeadsPage() {
  const [raw, setRaw] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [last, setLast] = useState<Date | null>(null);
  const [q, setQ] = useState("");
  const [savedView, setSavedView] = useState<SavedViewId>("all");
  const [stageFilter, setStageFilter] = useState<PipelineStage | "">("");
  const [verificationFilter, setVerificationFilter] = useState<VerificationStatus | "">("");
  const [sortKey, setSortKey] = useState<LeadSortKey>("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<Lead | null>(null);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetchLeads({});
      setRaw(r.leads);
      setLast(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const leads = useMemo(
    () =>
      filterAndSortLeads(raw, {
        q,
        stageFilter,
        verificationFilter,
        savedView,
        sortKey,
        sortDir,
      }),
    [raw, q, stageFilter, verificationFilter, savedView, sortKey, sortDir]
  );

  async function exportCsv() {
    setExporting(true);
    try {
      await new Promise<void>(resolve => queueMicrotask(resolve));
      const rows = filterAndSortLeads(raw, {
        q,
        stageFilter,
        verificationFilter,
        savedView,
        sortKey,
        sortDir,
      });
      const csv = buildLeadsCsv(rows);
      const name = `lead-engine-export-${localDateYyyyMmDd()}.csv`;
      downloadTextFile(name, csv);
      toast.success(`Exported ${rows.length} lead${rows.length === 1 ? "" : "s"}`, {
        description: name,
      });
    } catch (e) {
      toast.error("Export failed", { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setExporting(false);
    }
  }

  function toggleSort(k: LeadSortKey) {
    if (sortKey === k) {
      setSortDir(d => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(k);
      setSortDir("desc");
    }
  }

  function toggleRow(id: string, on: boolean) {
    setSelected(prev => {
      const n = new Set(prev);
      if (on) n.add(id);
      else n.delete(id);
      return n;
    });
  }

  function toggleAll(on: boolean) {
    if (!on) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(leads.map(l => l.id)));
  }

  if (loading && raw.length === 0) {
    return (
      <LeadEngineShell title="Leads" subtitle="Pipeline intelligence">
        <PageSkeleton />
      </LeadEngineShell>
    );
  }

  return (
    <LeadEngineShell
      title="Leads"
      subtitle="Scoring, verification, and stage discipline"
      headerActions={
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={exporting}
            className="border-white/12 font-heading gap-2"
            onClick={() => void exportCsv()}
          >
            <Download className="h-4 w-4 shrink-0" aria-hidden />
            {exporting ? "Exporting…" : "Export CSV"}
          </Button>
          <RefreshControl loading={loading} lastUpdated={last} onRefresh={() => void load()} />
        </div>
      }
    >
      {selected.size > 0 ? (
        <div
          className={cn(
            leSurface,
            "mb-4 p-3 flex flex-wrap gap-2 items-center justify-between border-accent/15 bg-accent/[0.04]"
          )}
        >
          <span className="text-sm font-heading text-foreground">{selected.size} selected</span>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-white/12 font-heading"
              onClick={() => toast.message("Bulk verify queued (mock)")}
            >
              Verify
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-white/12 font-heading"
              onClick={() => toast.message("Bulk assign (mock)")}
            >
              Assign
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-white/12 font-heading"
              onClick={() => toast.message("Stage move (mock)")}
            >
              Move stage
            </Button>
          </div>
        </div>
      ) : null}

      <SectionCard title="Filters" description="Saved views are local filters — wire to CRM rules later.">
        <div className="space-y-4">
          <SearchToolbar value={q} onChange={setQ} placeholder="Search business, city, category…" />
          <LeadFilters
            savedView={savedView}
            onSavedView={setSavedView}
            stageFilter={stageFilter}
            onStageFilter={setStageFilter}
            verificationFilter={verificationFilter}
            onVerificationFilter={setVerificationFilter}
          />
        </div>
      </SectionCard>

      <div className="mt-6">
        {leads.length === 0 ? (
          <EmptyState
            title="No leads match"
            description="Adjust filters or widen your search job geography."
            action={
              <Button variant="outline" className="border-white/12" onClick={() => void load()}>
                Reload
              </Button>
            }
          />
        ) : (
          <LeadTable
            leads={leads}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={toggleSort}
            selectedIds={selected}
            onToggleRow={toggleRow}
            onToggleAll={toggleAll}
            onRowClick={l => setPreview(l)}
          />
        )}
      </div>

      <Sheet open={!!preview} onOpenChange={o => !o && setPreview(null)}>
        <SheetContent className="bg-card border-white/10 w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-left">{preview?.businessName}</SheetTitle>
          </SheetHeader>
          {preview ? (
            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap gap-2 items-center">
                <LeadScoreBadge score={preview.leadScore} />
                <VerificationBadge status={preview.verificationStatus} />
                <span className="text-xs font-heading text-muted-foreground">
                  {PIPELINE_STAGE_LABELS[preview.pipelineStage]}
                </span>
              </div>
              <LeadReasonChips codes={preview.reasonCodes} />
              <p className={cn(leMuted, "text-sm")}>
                {preview.city}, {preview.state} · {preview.category}
              </p>
              <div className="flex gap-2">
                <Button asChild size="sm" className="bg-accent text-background font-heading">
                  <Link href={`/lead-engine/leads/${preview.id}`}>Open full detail</Link>
                </Button>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </LeadEngineShell>
  );
}
