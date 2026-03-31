import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Lead, LeadSearchNichePreset, LeadWorkflowStatus, PipelineStage, VerificationStatus } from "@shared/lead-engine-types";
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
import { createManualLeadApi, fetchLeads, importCsvLeadApi, importSelectedGooglePlacesLeads, postLeadsExportCsv, previewGooglePlacesLeads } from "../api";
import { downloadBlob } from "../exportLeadsCsv";
import { filterAndSortLeads } from "@shared/lead-engine-leads-query";
import { LeadEngineShell } from "../LeadEngineShell";
import { cn } from "@/lib/utils";
import { leMuted, leSurface } from "../surface";
import { toast } from "sonner";
import { Download, Plus, Search, Upload } from "lucide-react";
import type { LeadSearchResultRow, WebsiteStatus } from "@shared/lead-engine-types";

function searchRowSelectKey(r: LeadSearchResultRow): string {
  return (r.key?.trim() || r.sourceRecordId?.trim() || "").trim();
}

const DEFAULT_MANUAL_FORM = {
  businessName: "",
  ownerName: "",
  category: "",
  subCategory: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  phone: "",
  email: "",
  website: "",
  googleBusinessProfile: "",
  facebook: "",
  instagram: "",
  linkedin: "",
  targetZip: "",
  radiusMiles: "10",
  notes: "",
  outreachPrep: "",
  status: "new" as LeadWorkflowStatus,
};

export default function LeadEngineLeadsPage() {
  const [raw, setRaw] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [last, setLast] = useState<Date | null>(null);
  const [q, setQ] = useState("");
  const [savedView, setSavedView] = useState<SavedViewId>("all");
  const [stageFilter, setStageFilter] = useState<PipelineStage | "">("");
  const [verificationFilter, setVerificationFilter] = useState<VerificationStatus | "">("");
  const [statusFilter, setStatusFilter] = useState<LeadWorkflowStatus | "">("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [websiteStatusFilter, setWebsiteStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [sortKey, setSortKey] = useState<LeadSortKey>("newest");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<Lead | null>(null);
  const [exporting, setExporting] = useState(false);
  const [manual, setManual] = useState(DEFAULT_MANUAL_FORM);
  const [csvText, setCsvText] = useState("");
  const [savingManual, setSavingManual] = useState(false);
  const [savingCsv, setSavingCsv] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [importingSearch, setImportingSearch] = useState(false);
  const [searchForm, setSearchForm] = useState({
    targetZip: "",
    radiusMiles: "10",
    city: "",
    state: "",
    category: "",
    keyword: "",
    nichePreset: "auto" as LeadSearchNichePreset,
    websiteStatus: "" as "" | WebsiteStatus,
  });
  const [searchResults, setSearchResults] = useState<LeadSearchResultRow[]>([]);
  const [searchSelected, setSearchSelected] = useState<Set<string>>(new Set());

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

  const queryParams = useMemo(
    () => ({
      q,
      stageFilter,
      verificationFilter,
      statusFilter,
      sourceFilter,
      websiteStatusFilter,
      priorityFilter,
      categoryFilter,
      cityFilter,
      stateFilter,
      savedView,
      sortKey,
      sortDir,
    }),
    [
      q,
      stageFilter,
      verificationFilter,
      statusFilter,
      sourceFilter,
      websiteStatusFilter,
      priorityFilter,
      categoryFilter,
      cityFilter,
      stateFilter,
      savedView,
      sortKey,
      sortDir,
    ]
  );

  const leads = useMemo(() => filterAndSortLeads(raw, queryParams), [raw, queryParams]);

  async function exportCsv() {
    setExporting(true);
    try {
      await new Promise<void>(resolve => queueMicrotask(resolve));
      const { blob, filename, rowCount } = await postLeadsExportCsv(queryParams);
      downloadBlob(filename, blob);
      const count = rowCount > 0 ? rowCount : filterAndSortLeads(raw, queryParams).length;
      toast.success(`Exported ${count} lead${count === 1 ? "" : "s"}`, {
        description: filename,
      });
    } catch (e) {
      toast.error("Export failed", {
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setExporting(false);
    }
  }

  async function createManualLead() {
    if (!manual.businessName.trim()) {
      toast.error("Business name is required");
      return;
    }
    setSavingManual(true);
    try {
      await createManualLeadApi({
        ...manual,
        radiusMiles: Number.parseInt(manual.radiusMiles || "0", 10) || null,
        notes: manual.notes
          .split("\n")
          .map(v => v.trim())
          .filter(Boolean),
      });
      setManual(DEFAULT_MANUAL_FORM);
      toast.success("Lead added");
      await load();
    } catch (e) {
      toast.error("Manual lead entry failed", {
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setSavingManual(false);
    }
  }

  async function importCsv() {
    if (!csvText.trim()) {
      toast.error("Paste CSV data first");
      return;
    }
    setSavingCsv(true);
    try {
      await importCsvLeadApi({ csvText, source: "csv_manual_upload" });
      setCsvText("");
      toast.success("CSV import queued");
      await load();
    } catch (e) {
      toast.error("CSV import failed", {
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setSavingCsv(false);
    }
  }

  async function runSearch() {
    const targetZip = searchForm.targetZip.trim();
    const radiusMiles = Number.parseFloat(searchForm.radiusMiles || "0");
    if (!targetZip) {
      toast.error("Target ZIP is required");
      return;
    }
    if (!Number.isFinite(radiusMiles) || radiusMiles <= 0) {
      toast.error("Radius must be a positive number");
      return;
    }
    setSearching(true);
    try {
      const r = await previewGooglePlacesLeads({
        targetZip,
        radiusMiles,
        city: searchForm.city || undefined,
        state: searchForm.state || undefined,
        category: searchForm.category || undefined,
        keyword: searchForm.keyword || undefined,
        websiteStatus: searchForm.websiteStatus || undefined,
        nichePreset: searchForm.nichePreset,
        maxResults: 40,
      });
      if (!r.providerReady) {
        toast.message("Provider not configured", {
          description: r.message ?? "GOOGLE_PLACES_API_KEY is missing. Use CSV/manual import.",
        });
      }
      setSearchResults(r.results);
      const selectable = r.results
        .filter(x => x.importStatus === "new")
        .map(searchRowSelectKey)
        .filter((k): k is string => k.length > 0);
      setSearchSelected(new Set(selectable));
    } catch (e) {
      toast.error("Search failed", { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setSearching(false);
    }
  }

  function toggleSearchRow(key: string, on: boolean) {
    setSearchSelected(prev => {
      const n = new Set(prev);
      if (on) n.add(key);
      else n.delete(key);
      return n;
    });
  }

  function toggleSearchAll(on: boolean) {
    if (!on) {
      setSearchSelected(new Set());
      return;
    }
    setSearchSelected(
      new Set(
        searchResults
          .filter(r => r.importStatus === "new")
          .map(searchRowSelectKey)
          .filter(Boolean)
      )
    );
  }

  async function importSelectedSearch() {
    const targetZip = searchForm.targetZip.trim();
    const radiusMiles = Number.parseFloat(searchForm.radiusMiles || "0");
    const placeIds = searchResults
      .filter(
        r =>
          r.provider === "google_places" &&
          r.importStatus === "new" &&
          searchSelected.has(searchRowSelectKey(r))
      )
      .map(r => r.sourceRecordId || r.key)
      .filter((x): x is string => typeof x === "string" && x.length > 0);

    if (!placeIds.length) {
      toast.message("No new leads selected");
      return;
    }

    setImportingSearch(true);
    try {
      const r = await importSelectedGooglePlacesLeads({
        placeIds,
        targetZip,
        radiusMiles,
        city: searchForm.city || undefined,
        state: searchForm.state || undefined,
        category: searchForm.category || undefined,
        keyword: searchForm.keyword || undefined,
      });
      toast.success("Imported leads", {
        description: `Inserted ${r.inserted}, updated ${r.updated}, duplicates ${r.duplicates}, failed ${r.failed}`,
      });
      setSearchOpen(false);
      setSearchResults([]);
      setSearchSelected(new Set());
      await load();
    } catch (e) {
      toast.error("Import failed", { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setImportingSearch(false);
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
      subtitle="Local business lead engine built for research, qualification, and outreach prep"
      headerActions={
        <div className="flex flex-wrap items-center gap-3">
          <RefreshControl loading={loading} lastUpdated={last} onRefresh={() => void load()} />
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <SectionCard title="Lead engine controls" description="Search/filter existing leads, export the full filtered dataset, and store new leads safely.">
          <div className="space-y-4">
            <SearchToolbar value={q} onChange={setQ} placeholder="Search business, city, category…" />
            <LeadFilters
              savedView={savedView}
              onSavedView={setSavedView}
              stageFilter={stageFilter}
              onStageFilter={setStageFilter}
              verificationFilter={verificationFilter}
              onVerificationFilter={setVerificationFilter}
              statusFilter={statusFilter}
              onStatusFilter={setStatusFilter}
              sourceFilter={sourceFilter}
              onSourceFilter={setSourceFilter}
              websiteStatusFilter={websiteStatusFilter}
              onWebsiteStatusFilter={setWebsiteStatusFilter}
              priorityFilter={priorityFilter}
              onPriorityFilter={setPriorityFilter}
              categoryFilter={categoryFilter}
              onCategoryFilter={setCategoryFilter}
              cityFilter={cityFilter}
              onCityFilter={setCityFilter}
              stateFilter={stateFilter}
              onStateFilter={setStateFilter}
            />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
              <p className="text-sm text-muted-foreground font-heading">
                Provider-backed search is optional. If Google Places or another source is not configured, use manual entry or CSV import.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-white/12 font-heading gap-2"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search className="h-4 w-4 shrink-0" aria-hidden />
                  Search New Leads
                </Button>
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
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Add / ingest leads" description="Manual entry and CSV upload are production-safe today. Provider integrations can plug in later without changing the workflow.">
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-3">
              <Input placeholder="Business name" value={manual.businessName} onChange={e => setManual(v => ({ ...v, businessName: e.target.value }))} />
              <Input placeholder="Owner name" value={manual.ownerName} onChange={e => setManual(v => ({ ...v, ownerName: e.target.value }))} />
              <Input placeholder="Category" value={manual.category} onChange={e => setManual(v => ({ ...v, category: e.target.value }))} />
              <Input placeholder="Sub-category" value={manual.subCategory} onChange={e => setManual(v => ({ ...v, subCategory: e.target.value }))} />
              <Input placeholder="Target ZIP" value={manual.targetZip} onChange={e => setManual(v => ({ ...v, targetZip: e.target.value }))} />
              <Input placeholder="Radius miles" value={manual.radiusMiles} onChange={e => setManual(v => ({ ...v, radiusMiles: e.target.value }))} />
              <Input placeholder="City" value={manual.city} onChange={e => setManual(v => ({ ...v, city: e.target.value }))} />
              <Input placeholder="State" value={manual.state} onChange={e => setManual(v => ({ ...v, state: e.target.value }))} />
              <Input placeholder="ZIP" value={manual.zip} onChange={e => setManual(v => ({ ...v, zip: e.target.value }))} />
              <Input placeholder="Phone" value={manual.phone} onChange={e => setManual(v => ({ ...v, phone: e.target.value }))} />
              <Input placeholder="Email" value={manual.email} onChange={e => setManual(v => ({ ...v, email: e.target.value }))} />
              <Input placeholder="Website" value={manual.website} onChange={e => setManual(v => ({ ...v, website: e.target.value }))} />
            </div>
            <Input placeholder="Street address" value={manual.address} onChange={e => setManual(v => ({ ...v, address: e.target.value }))} />
            <div className="grid sm:grid-cols-3 gap-3">
              <Input placeholder="Google Business Profile" value={manual.googleBusinessProfile} onChange={e => setManual(v => ({ ...v, googleBusinessProfile: e.target.value }))} />
              <Input placeholder="Facebook" value={manual.facebook} onChange={e => setManual(v => ({ ...v, facebook: e.target.value }))} />
              <Input placeholder="Instagram" value={manual.instagram} onChange={e => setManual(v => ({ ...v, instagram: e.target.value }))} />
            </div>
            <Input placeholder="LinkedIn" value={manual.linkedin} onChange={e => setManual(v => ({ ...v, linkedin: e.target.value }))} />
            <Textarea placeholder="Internal notes (one per line)" value={manual.notes} onChange={e => setManual(v => ({ ...v, notes: e.target.value }))} rows={4} />
            <Textarea placeholder="Outreach prep for Leo" value={manual.outreachPrep} onChange={e => setManual(v => ({ ...v, outreachPrep: e.target.value }))} rows={4} />
            <div className="flex items-center gap-3">
              <select
                value={manual.status}
                onChange={e => setManual(v => ({ ...v, status: e.target.value as LeadWorkflowStatus }))}
                className="h-10 rounded-lg border border-white/12 bg-background/50 px-3 text-sm font-heading text-foreground"
              >
                {["new", "researched", "drafted", "ready_to_send", "sent", "replied", "interested", "not_interested", "follow_up_needed"].map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <Button className="bg-accent text-background font-heading gap-2" disabled={savingManual} onClick={() => void createManualLead()}>
                <Plus className="size-4" />
                {savingManual ? "Saving…" : "Add lead"}
              </Button>
            </div>
            <div className="border-t border-white/8 pt-4 space-y-3">
              <p className="text-sm text-muted-foreground font-heading">Paste CSV rows to import leads without relying on a third-party provider.</p>
              <Textarea placeholder="business_name,phone,email,website,city,state,zip..." value={csvText} onChange={e => setCsvText(e.target.value)} rows={6} />
              <Button variant="outline" className="border-white/12 font-heading gap-2" disabled={savingCsv} onClick={() => void importCsv()}>
                <Upload className="size-4" />
                {savingCsv ? "Importing…" : "Import CSV"}
              </Button>
            </div>
          </div>
        </SectionCard>
      </div>

      {selected.size > 0 ? (
        <div className={cn(leSurface, "mt-6 mb-4 p-3 flex flex-wrap gap-2 items-center justify-between border-accent/15 bg-accent/[0.04]")}>
          <span className="text-sm font-heading text-foreground">{selected.size} selected</span>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="border-white/12 font-heading" onClick={() => toast.message("Bulk verify queued (safe placeholder)")}>Verify</Button>
            <Button size="sm" variant="outline" className="border-white/12 font-heading" onClick={() => toast.message("Bulk assign queued (safe placeholder)")}>Assign</Button>
          </div>
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        {leads.length === 0 ? (
          <EmptyState
            title="No leads match"
            description="Adjust filters, widen ZIP/radius targeting, or import a new batch."
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
                <span className="text-xs font-heading text-muted-foreground">{PIPELINE_STAGE_LABELS[preview.pipelineStage]}</span>
              </div>
              <LeadReasonChips codes={preview.reasonCodes} />
              <p className={cn(leMuted, "text-sm")}>
                {preview.city}, {preview.state} · {preview.subCategory ? `${preview.category} / ${preview.subCategory}` : preview.category}
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm font-heading text-foreground">
                <div>
                  <p className={leMuted}>Website status</p>
                  <p>{preview.websiteStatus ?? "unknown"}</p>
                </div>
                <div>
                  <p className={leMuted}>Workflow status</p>
                  <p>{preview.status}</p>
                </div>
                <div>
                  <p className={leMuted}>Target ZIP</p>
                  <p>{preview.targetZip ?? "—"}</p>
                </div>
                <div>
                  <p className={leMuted}>Radius</p>
                  <p>{preview.radiusMiles ? `${preview.radiusMiles} mi` : "—"}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm" className="bg-accent text-background font-heading">
                  <Link href={`/lead-engine/leads/${preview.id}`}>Open full detail</Link>
                </Button>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
        <SheetContent className="bg-card border-white/10 w-full sm:max-w-4xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-left">Search New Leads</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="grid sm:grid-cols-3 gap-3">
              <Input placeholder="Target ZIP" value={searchForm.targetZip} onChange={e => setSearchForm(v => ({ ...v, targetZip: e.target.value }))} />
              <Input placeholder="Radius miles" value={searchForm.radiusMiles} onChange={e => setSearchForm(v => ({ ...v, radiusMiles: e.target.value }))} />
              <select
                value={searchForm.websiteStatus}
                onChange={e => setSearchForm(v => ({ ...v, websiteStatus: e.target.value as any }))}
                className="h-10 rounded-lg border border-white/12 bg-background/50 px-3 text-sm font-heading text-foreground"
              >
                <option value="">Website status: any</option>
                <option value="no_website">no_website</option>
                <option value="weak_website">weak_website</option>
                <option value="has_website">has_website</option>
                <option value="unknown">unknown</option>
              </select>
              <select
                value={searchForm.nichePreset}
                onChange={e => setSearchForm(v => ({ ...v, nichePreset: e.target.value as LeadSearchNichePreset }))}
                className="h-10 rounded-lg border border-white/12 bg-background/50 px-3 text-sm font-heading text-foreground"
              >
                <option value="auto">Preset: auto</option>
                <option value="smoke_shops">Smoke shops</option>
                <option value="restaurants">Restaurants</option>
                <option value="barber_shops">Barber shops</option>
                <option value="salons">Salons</option>
                <option value="dentists">Dentists</option>
                <option value="roofers">Roofers</option>
                <option value="hvac">HVAC</option>
                <option value="plumbers">Plumbers</option>
                <option value="auto_repair">Auto repair</option>
                <option value="gyms">Gyms</option>
                <option value="law_firms">Law firms</option>
              </select>
              <Input placeholder="City (optional)" value={searchForm.city} onChange={e => setSearchForm(v => ({ ...v, city: e.target.value }))} />
              <Input placeholder="State (optional)" value={searchForm.state} onChange={e => setSearchForm(v => ({ ...v, state: e.target.value }))} />
              <Input placeholder="Category (optional)" value={searchForm.category} onChange={e => setSearchForm(v => ({ ...v, category: e.target.value }))} />
              <Input placeholder="Keyword (optional)" value={searchForm.keyword} onChange={e => setSearchForm(v => ({ ...v, keyword: e.target.value }))} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className={cn(leMuted, "text-sm")}>
                Uses Google Places when configured. If not configured, use the CSV import section on this page.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" className="border-white/12 font-heading" disabled={searching} onClick={() => void runSearch()}>
                  {searching ? "Searching…" : "Search"}
                </Button>
                <Button className="bg-accent text-background font-heading" disabled={importingSearch || searchSelected.size === 0} onClick={() => void importSelectedSearch()}>
                  {importingSearch ? "Importing…" : `Import selected (${searchSelected.size})`}
                </Button>
              </div>
            </div>

            <div className="border-t border-white/8 pt-4">
              {searchResults.length === 0 ? (
                <p className={cn(leMuted, "text-sm")}>Run a search to preview results before importing.</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm font-heading">
                      <input
                        type="checkbox"
                        checked={(() => {
                          const newKeys = searchResults
                            .filter(r => r.importStatus === "new")
                            .map(searchRowSelectKey)
                            .filter(Boolean);
                          return (
                            newKeys.length > 0 &&
                            newKeys.every(k => searchSelected.has(k)) &&
                            searchSelected.size === newKeys.length
                          );
                        })()}
                        onChange={e => toggleSearchAll(e.target.checked)}
                      />
                      Select all new
                    </label>
                    <span className={cn(leMuted, "text-sm")}>
                      {searchResults.length} results · {searchResults.filter(r => r.importStatus === "already_imported").length} already imported
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-white/10">
                    <table className="min-w-[900px] w-full text-sm">
                      <thead className="bg-background/40">
                        <tr className="text-left font-heading">
                          <th className="p-3 w-10"></th>
                          <th className="p-3">Business</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">City</th>
                          <th className="p-3">Phone</th>
                          <th className="p-3">Email</th>
                          <th className="p-3">Website</th>
                          <th className="p-3">Website status</th>
                          <th className="p-3">Source</th>
                          <th className="p-3">Import status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {searchResults.map(r => {
                          const selectable = r.importStatus === "new";
                          const sk = searchRowSelectKey(r);
                          return (
                            <tr key={sk || r.businessName} className="border-t border-white/8">
                              <td className="p-3">
                                <input
                                  type="checkbox"
                                  disabled={!selectable || !sk}
                                  checked={selectable && !!sk && searchSelected.has(sk)}
                                  onChange={e => toggleSearchRow(sk, e.target.checked)}
                                />
                              </td>
                              <td className="p-3 font-heading text-foreground">{r.businessName}</td>
                              <td className="p-3">{r.subCategory ? `${r.category} / ${r.subCategory}` : r.category}</td>
                              <td className="p-3">{r.city}</td>
                              <td className="p-3">{r.phone ?? "—"}</td>
                              <td className="p-3">{r.email ?? "—"}</td>
                              <td className="p-3">{r.website ?? "—"}</td>
                              <td className="p-3">{r.websiteStatus}</td>
                              <td className="p-3">{r.leadSource}</td>
                              <td className="p-3">
                                {r.importStatus === "already_imported" ? "Already Imported" : r.importStatus}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </LeadEngineShell>
  );
}
