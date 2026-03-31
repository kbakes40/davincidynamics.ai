import { useCallback, useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LeadDetailResponse } from "@shared/lead-engine-types";
import { PIPELINE_STAGE_LABELS } from "@shared/lead-engine-types";
import { PageSkeleton, SectionCard } from "../components/lead-engine-primitives";
import { LeadScoreBadge, VerificationBadge } from "../components/lead-engine-badges";
import { LeadReasonChips } from "../components/LeadReasonChips";
import { ActivityFeed } from "../components/ActivityFeed";
import { fetchLead } from "../api";
import { LeadEngineShell } from "../LeadEngineShell";
import { cn } from "@/lib/utils";
import { leMuted, leSurface } from "../surface";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";

export default function LeadEngineLeadDetailPage() {
  const [, params] = useRoute("/lead-engine/leads/:id");
  const id = params?.id ?? "";
  const [data, setData] = useState<LeadDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const r = await fetchLead(id);
      setData(r);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!id || (loading && !data)) {
    return (
      <LeadEngineShell title="Lead" subtitle="">
        <PageSkeleton />
      </LeadEngineShell>
    );
  }

  if (!data) {
    return (
      <LeadEngineShell title="Lead" subtitle="">
        <p className="text-muted-foreground font-heading">Lead not found.</p>
        <Button asChild variant="outline" className="mt-4 border-white/12">
          <Link href="/lead-engine/leads">Back to leads</Link>
        </Button>
      </LeadEngineShell>
    );
  }

  const { lead, activity, pipelineHistory } = data;

  return (
    <LeadEngineShell
      title={lead.businessName}
      subtitle={`${lead.city}, ${lead.state} · ${lead.category}`}
      headerActions={
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="border-white/12">
            <Link href="/lead-engine/leads">All leads</Link>
          </Button>
          <Button
            size="sm"
            className="bg-accent text-background font-heading"
            onClick={async () => {
              await fetch(`/api/leads/${lead.id}/verify-phone`, { method: "POST" });
              toast.success("Verification queued");
            }}
          >
            Verify phone
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-white/12 font-heading"
            onClick={async () => {
              await fetch(`/api/leads/${lead.id}/review-website`, { method: "POST" });
              toast.success("Website review logged");
            }}
          >
            Review website
          </Button>
        </div>
      }
    >
      <div className={cn(leSurface, "p-5 lg:p-6 mb-6 border-white/[0.07] flex flex-col lg:flex-row gap-6 lg:items-start lg:justify-between")}>
        <div className="space-y-3 min-w-0">
          <div className="flex flex-wrap gap-2 items-center">
            <LeadScoreBadge score={lead.leadScore} />
            <VerificationBadge status={lead.verificationStatus} />
            <span className="text-sm font-heading text-muted-foreground">
              {PIPELINE_STAGE_LABELS[lead.pipelineStage]}
            </span>
          </div>
          <LeadReasonChips codes={lead.reasonCodes} />
          <div className={cn(leMuted, "text-sm flex flex-wrap gap-x-4 gap-y-1")}>
            <span>Source: {lead.source}</span>
            <span>Owner: {lead.assignedOwner ?? "—"}</span>
            <span>Last seen: {new Date(lead.lastSeenAt).toLocaleString()}</span>
          </div>
        </div>
        <div className="shrink-0 flex flex-col gap-2">
          {lead.website ? (
            <Button asChild variant="outline" size="sm" className="border-white/12 font-heading gap-2">
              <a href={lead.website} target="_blank" rel="noreferrer">
                <ExternalLink className="size-3.5" />
                Live site
              </a>
            </Button>
          ) : null}
        </div>
      </div>

      <Tabs defaultValue="business" className="w-full">
        <TabsList className="bg-white/[0.04] border border-white/[0.08] p-1 rounded-xl flex flex-wrap h-auto gap-1">
          {["business", "enrichment", "website", "activity", "notes", "history"].map(t => (
            <TabsTrigger
              key={t}
              value={t}
              className="rounded-lg data-[state=active]:bg-white/[0.09] data-[state=active]:text-foreground text-muted-foreground font-heading text-xs px-3 py-2 capitalize"
            >
              {t === "history" ? "Pipeline history" : t}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="business" className="mt-6">
          <SectionCard title="Business identity">
            <div className="grid sm:grid-cols-2 gap-4 text-sm font-heading">
              <div>
                <p className={leMuted}>Phone</p>
                <p className="text-foreground font-mono">{lead.phone ?? "—"}</p>
              </div>
              <div>
                <p className={leMuted}>Website</p>
                <p className="text-foreground break-all">{lead.website ?? "—"}</p>
              </div>
              <div>
                <p className={leMuted}>Job ID</p>
                <p className="text-foreground">{lead.sourceJobId ?? "—"}</p>
              </div>
              <div>
                <p className={leMuted}>Tags</p>
                <p className="text-foreground">{lead.tags.length ? lead.tags.join(", ") : "—"}</p>
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="enrichment" className="mt-6">
          <SectionCard title="Enrichment">
            {lead.enrichment ? (
              <div className="space-y-3 text-sm">
                <p className="text-foreground font-heading leading-relaxed">{lead.enrichment.summary}</p>
                <div>
                  <p className={cn(leMuted, "text-xs mb-1")}>Tech</p>
                  <p className="font-heading text-foreground">{lead.enrichment.techStack.join(", ")}</p>
                </div>
                <div>
                  <p className={cn(leMuted, "text-xs mb-1")}>Orders (est.)</p>
                  <p className="font-heading text-foreground">{lead.enrichment.estimatedMonthlyOrders ?? "—"}</p>
                </div>
                <div>
                  <p className={cn(leMuted, "text-xs mb-1")}>Social</p>
                  <p className="font-heading text-foreground">{lead.enrichment.socialPresence}</p>
                </div>
              </div>
            ) : (
              <p className={cn(leMuted, "text-sm")}>Lead not enriched yet — enqueue enrichment from a job.</p>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="website" className="mt-6">
          <SectionCard title="Website review">
            <LeadReasonChips codes={lead.reasonCodes} />
            <p className={cn(leMuted, "text-sm mt-4")}>
              Review captures checkout friction, mobile layout, and ordering paths. Wire automated Lighthouse + cart
              probes here.
            </p>
          </SectionCard>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <SectionCard title="Activity">
            <ActivityFeed items={activity} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <SectionCard title="Notes">
            {lead.notes.length ? (
              <ul className="space-y-2">
                {lead.notes.map((n, i) => (
                  <li key={i} className={cn(leSurface, "p-3 text-sm text-foreground border-white/[0.06]")}>
                    {n}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={cn(leMuted, "text-sm")}>No notes yet.</p>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <SectionCard title="Pipeline history" description="Source: internal transitions (mock)">
            <ul className="space-y-2">
              {pipelineHistory.map(h => (
                <li key={h.id} className={cn(leSurface, "p-3 border-white/[0.06] text-sm font-heading")}>
                  <span className="text-muted-foreground">
                    {new Date(h.at).toLocaleString()} · {h.actor}
                  </span>
                  <p className="text-foreground mt-1">
                    {h.from ? PIPELINE_STAGE_LABELS[h.from] : "Start"} → {PIPELINE_STAGE_LABELS[h.to]}
                    {h.note ? ` · ${h.note}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </LeadEngineShell>
  );
}
