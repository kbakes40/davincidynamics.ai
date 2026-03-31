import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LeadDetailResponse, LeadWorkflowStatus } from "@shared/lead-engine-types";
import { PIPELINE_STAGE_LABELS } from "@shared/lead-engine-types";
import { PageSkeleton, SectionCard } from "../components/lead-engine-primitives";
import { LeadScoreBadge, VerificationBadge } from "../components/lead-engine-badges";
import { LeadReasonChips } from "../components/LeadReasonChips";
import { ActivityFeed } from "../components/ActivityFeed";
import { fetchLead, patchLeadWorkflowApi } from "../api";
import { LeadEngineShell } from "../LeadEngineShell";
import { cn } from "@/lib/utils";
import { leMuted, leSurface } from "../surface";
import { toast } from "sonner";
import { ExternalLink, Save } from "lucide-react";

const WORKFLOW_STATUSES: LeadWorkflowStatus[] = [
  "new",
  "researched",
  "drafted",
  "ready_to_send",
  "sent",
  "replied",
  "interested",
  "not_interested",
  "follow_up_needed",
];

export default function LeadEngineLeadDetailPage() {
  const [, params] = useRoute("/lead-engine/leads/:id");
  const id = params?.id ?? "";
  const [data, setData] = useState<LeadDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notesText, setNotesText] = useState("");
  const [workflowStatus, setWorkflowStatus] = useState<LeadWorkflowStatus>("new");
  const [followUpAt, setFollowUpAt] = useState("");
  const [outreachPrep, setOutreachPrep] = useState("");

  const hydrateEditor = useCallback((payload: LeadDetailResponse | null) => {
    if (!payload) return;
    setNotesText(payload.lead.notes.join("\n"));
    setWorkflowStatus(payload.lead.status);
    setFollowUpAt(payload.lead.followUpAt ? payload.lead.followUpAt.slice(0, 16) : "");
    setOutreachPrep(payload.lead.outreachPrep ?? "");
  }, []);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const r = await fetchLead(id);
      setData(r);
      hydrateEditor(r);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [hydrateEditor, id]);

  useEffect(() => {
    void load();
  }, [load]);

  const notes = useMemo(
    () =>
      notesText
        .split("\n")
        .map(v => v.trim())
        .filter(Boolean),
    [notesText]
  );

  async function saveWorkflow() {
    if (!id) return;
    setSaving(true);
    try {
      const response = await patchLeadWorkflowApi(id, {
        status: workflowStatus,
        notes,
        outreachPrep,
        followUpAt: followUpAt ? new Date(followUpAt).toISOString() : null,
      });
      if (response.lead && data) {
        const next = { ...data, lead: response.lead };
        setData(next);
        hydrateEditor(next);
      } else {
        await load();
      }
      toast.success("Lead updated");
    } catch (e) {
      toast.error("Save failed", {
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setSaving(false);
    }
  }

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
      subtitle={`${lead.city}, ${lead.state} · ${lead.subCategory ? `${lead.category} / ${lead.subCategory}` : lead.category}`}
      headerActions={
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="border-white/12">
            <Link href="/lead-engine/leads">All leads</Link>
          </Button>
          <Button
            size="sm"
            className="bg-accent text-background font-heading"
            onClick={async () => {
              await fetch(`/api/leads/${lead.id}/review-website`, { method: "POST" });
              toast.success("Website review logged");
              await load();
            }}
          >
            Review website
          </Button>
          <Button size="sm" variant="outline" className="border-white/12 font-heading gap-2" disabled={saving} onClick={() => void saveWorkflow()}>
            <Save className="size-4" />
            {saving ? "Saving…" : "Save lead"}
          </Button>
        </div>
      }
    >
      <div className={cn(leSurface, "p-5 lg:p-6 mb-6 border-white/[0.07] flex flex-col lg:flex-row gap-6 lg:items-start lg:justify-between")}>
        <div className="space-y-3 min-w-0">
          <div className="flex flex-wrap gap-2 items-center">
            <LeadScoreBadge score={lead.leadScore} />
            <VerificationBadge status={lead.verificationStatus} />
            <span className="text-sm font-heading text-muted-foreground">{PIPELINE_STAGE_LABELS[lead.pipelineStage]}</span>
            <span className="text-sm font-heading text-foreground uppercase">{lead.status}</span>
          </div>
          <LeadReasonChips codes={lead.reasonCodes} />
          <div className={cn(leMuted, "text-sm flex flex-wrap gap-x-4 gap-y-1")}>
            <span>Source: {lead.source}</span>
            <span>Website status: {lead.websiteStatus ?? "unknown"}</span>
            <span>Targeting: {lead.targetZip ?? "—"}{lead.radiusMiles ? ` · ${lead.radiusMiles} mi` : ""}</span>
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
          {lead.googleBusinessProfile ? (
            <Button asChild variant="outline" size="sm" className="border-white/12 font-heading gap-2">
              <a href={lead.googleBusinessProfile} target="_blank" rel="noreferrer">
                <ExternalLink className="size-3.5" />
                Google profile
              </a>
            </Button>
          ) : null}
        </div>
      </div>

      <Tabs defaultValue="business" className="w-full">
        <TabsList className="bg-white/[0.04] border border-white/[0.08] p-1 rounded-xl flex flex-wrap h-auto gap-1">
          {["business", "enrichment", "workflow", "outreach", "activity", "history"].map(t => (
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
                <p className={leMuted}>Owner</p>
                <p className="text-foreground">{lead.ownerName ?? "—"}</p>
              </div>
              <div>
                <p className={leMuted}>Phone</p>
                <p className="text-foreground font-mono">{lead.phone ?? "—"}</p>
              </div>
              <div>
                <p className={leMuted}>Email</p>
                <p className="text-foreground">{lead.email ?? "—"}</p>
              </div>
              <div>
                <p className={leMuted}>Address</p>
                <p className="text-foreground">{lead.address ?? "—"}</p>
              </div>
              <div>
                <p className={leMuted}>Category</p>
                <p className="text-foreground">{lead.subCategory ? `${lead.category} / ${lead.subCategory}` : lead.category}</p>
              </div>
              <div>
                <p className={leMuted}>Job ID</p>
                <p className="text-foreground">{lead.sourceJobId ?? "—"}</p>
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="enrichment" className="mt-6">
          <SectionCard title="Enrichment">
            {lead.enrichment ? (
              <div className="space-y-3 text-sm">
                <p className="text-foreground font-heading leading-relaxed">{lead.enrichment.summary || "No enrichment summary yet."}</p>
                <div>
                  <p className={cn(leMuted, "text-xs mb-1")}>Tech</p>
                  <p className="font-heading text-foreground">{lead.enrichment.techStack.length ? lead.enrichment.techStack.join(", ") : "—"}</p>
                </div>
                <div>
                  <p className={cn(leMuted, "text-xs mb-1")}>Orders (est.)</p>
                  <p className="font-heading text-foreground">{lead.enrichment.estimatedMonthlyOrders ?? "—"}</p>
                </div>
                <div>
                  <p className={cn(leMuted, "text-xs mb-1")}>Social</p>
                  <p className="font-heading text-foreground">{lead.enrichment.socialPresence || "—"}</p>
                </div>
              </div>
            ) : (
              <p className={cn(leMuted, "text-sm")}>Lead not enriched yet. Manual entry and CSV import still work without provider APIs.</p>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="workflow" className="mt-6">
          <SectionCard title="Workflow + notes" description="Status, follow-up timing, and internal notes are editable here.">
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className={cn(leMuted, "text-xs mb-2")}>Workflow status</p>
                  <select
                    value={workflowStatus}
                    onChange={e => setWorkflowStatus(e.target.value as LeadWorkflowStatus)}
                    className="h-10 w-full rounded-lg border border-white/12 bg-background/50 px-3 text-sm font-heading text-foreground"
                  >
                    {WORKFLOW_STATUSES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className={cn(leMuted, "text-xs mb-2")}>Follow up at</p>
                  <Input type="datetime-local" value={followUpAt} onChange={e => setFollowUpAt(e.target.value)} />
                </div>
              </div>
              <div>
                <p className={cn(leMuted, "text-xs mb-2")}>Internal notes</p>
                <Textarea rows={6} value={notesText} onChange={e => setNotesText(e.target.value)} placeholder="One note per line" />
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="outreach" className="mt-6">
          <SectionCard title="Outreach prep" description="Structured prep for Leo to draft outbound messages later.">
            <div className="space-y-4">
              <Textarea
                rows={8}
                value={outreachPrep}
                onChange={e => setOutreachPrep(e.target.value)}
                placeholder="Angle, problem hypothesis, service fit, CTA, owner/context, objections, etc."
              />
              <div className="grid sm:grid-cols-2 gap-4 text-sm font-heading">
                <div>
                  <p className={leMuted}>Contacted at</p>
                  <p className="text-foreground">{lead.contactedAt ? new Date(lead.contactedAt).toLocaleString() : "Not yet"}</p>
                </div>
                <div>
                  <p className={leMuted}>Follow up at</p>
                  <p className="text-foreground">{lead.followUpAt ? new Date(lead.followUpAt).toLocaleString() : "—"}</p>
                </div>
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <SectionCard title="Activity">
            <ActivityFeed items={activity} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <SectionCard title="Pipeline history" description="Source: internal transitions">
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
