import { useCallback, useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageSkeleton, SectionCard } from "../components/lead-engine-primitives";
import { fetchCampaign, patchCampaignLeadApi } from "../api";
import { LeadEngineShell } from "../LeadEngineShell";
import type { CampaignLeadOutreachStatus, CampaignDetailResponse } from "@shared/lead-engine-types";
import { toast } from "sonner";
import { WebsiteLink } from "../components/WebsiteLink";

const STATUSES: CampaignLeadOutreachStatus[] = ["not_started","drafted","ready_to_send","sent","opened","replied","interested","not_interested","follow_up_needed"];

export default function LeadEngineCampaignDetailPage() {
  const [, params] = useRoute('/lead-engine/campaigns/:id');
  const [data, setData] = useState<CampaignDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const id = params?.id ?? '';

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const r = await fetchCampaign(id);
      setData(r);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  async function updateLead(rowId: string, payload: { outreachStatus?: CampaignLeadOutreachStatus; assignedTo?: string; notes?: string; nextFollowUpAt?: string }) {
    try {
      await patchCampaignLeadApi(rowId, payload);
      toast.success('Campaign lead updated');
      await load();
    } catch (e) {
      toast.error('Update failed', { description: e instanceof Error ? e.message : String(e) });
    }
  }

  if (loading && !data) return <LeadEngineShell title="Campaign" subtitle=""><PageSkeleton /></LeadEngineShell>;
  if (!data) return <LeadEngineShell title="Campaign" subtitle=""><Button asChild variant="outline" className="border-white/12"><Link href="/lead-engine/campaigns">Back</Link></Button></LeadEngineShell>;

  return (
    <LeadEngineShell title={data.campaign.campaignName} subtitle={`${data.campaign.channel} · ${data.campaign.status}`} headerActions={<Button asChild variant="outline" className="border-white/12"><Link href="/lead-engine/campaigns">All campaigns</Link></Button>}>
      <SectionCard title="Campaign details" description={data.campaign.objective ?? "—"}>
        <div className="text-sm text-muted-foreground font-heading space-y-1">
          <div>Owner: {data.campaign.owner ?? '—'}</div>
          <div>Audience: {data.campaign.targetAudience ?? '—'}</div>
          <div>Notes: {data.campaign.notes ?? '—'}</div>
        </div>
      </SectionCard>
      <div className="space-y-4 mt-6">
        {data.leads.map(l => (
          <SectionCard
            key={l.id}
            title={l.businessName ?? l.leadId}
            description={`${l.assignedTo ?? 'Unassigned'} · ${l.outreachStatus}`}
            actions={
              <Button asChild size="sm" variant="outline" className="border-white/12">
                <Link href={`/lead-engine/leads/${l.leadId}`}>Open lead</Link>
              </Button>
            }
          >
            <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-5">
              <div className="space-y-3 text-sm font-heading">
                <div className="grid sm:grid-cols-2 gap-3 text-muted-foreground">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider mb-1">Contact</div>
                    <div className="text-foreground">{l.ownerName ?? '—'}</div>
                    <div>{l.phone ?? 'No phone'}</div>
                    <div>{l.email ?? 'No email'}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider mb-1">Business</div>
                    <div className="text-foreground">{l.subCategory ? `${l.category} / ${l.subCategory}` : l.category ?? '—'}</div>
                    <div>{[l.city, l.state].filter(Boolean).join(', ') || '—'}</div>
                    <div>{l.address ?? '—'}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider mb-1 text-muted-foreground">Website</div>
                  <WebsiteLink value={l.website} showExternalIcon className="text-sm" />
                  <div className="text-xs text-muted-foreground mt-1">Status: {l.websiteStatus ?? 'unknown'}</div>
                </div>
              </div>
              <div className="grid gap-3">
                <select defaultValue={l.outreachStatus} onChange={e => void updateLead(l.id, { outreachStatus: e.target.value as CampaignLeadOutreachStatus })} className="h-10 rounded-lg border border-white/12 bg-background/50 px-3 text-sm font-heading text-foreground">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select defaultValue={l.assignedTo ?? 'unassigned'} onChange={e => void updateLead(l.id, { assignedTo: e.target.value === 'unassigned' ? '' : e.target.value })} className="h-10 rounded-lg border border-white/12 bg-background/50 px-3 text-sm font-heading text-foreground">
                  <option value="unassigned">Unassigned</option><option value="leo">Leo</option><option value="vinci">Vinci</option>
                </select>
                <Input type="datetime-local" defaultValue={l.nextFollowUpAt ? l.nextFollowUpAt.slice(0,16) : ''} onBlur={e => { if (e.target.value) void updateLead(l.id, { nextFollowUpAt: new Date(e.target.value).toISOString() }); }} />
                <Textarea rows={3} defaultValue={l.notes ?? ''} onBlur={e => void updateLead(l.id, { notes: e.target.value })} />
              </div>
            </div>
          </SectionCard>
        ))}
      </div>
    </LeadEngineShell>
  );
}
