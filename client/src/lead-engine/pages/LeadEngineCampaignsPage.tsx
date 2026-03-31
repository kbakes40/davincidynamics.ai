import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { PageSkeleton, RefreshControl, SectionCard } from "../components/lead-engine-primitives";
import { fetchCampaigns } from "../api";
import { LeadEngineShell } from "../LeadEngineShell";
import type { LeadCampaign } from "@shared/lead-engine-types";

export default function LeadEngineCampaignsPage() {
  const [campaigns, setCampaigns] = useState<LeadCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [last, setLast] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetchCampaigns();
      setCampaigns(r.campaigns);
      setLast(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading && campaigns.length === 0) {
    return <LeadEngineShell title="Campaigns" subtitle="Outreach tracking"><PageSkeleton /></LeadEngineShell>;
  }

  return (
    <LeadEngineShell title="Campaigns" subtitle="Track who was contacted and campaign progress" headerActions={<RefreshControl loading={loading} lastUpdated={last} onRefresh={() => void load()} />}>
      <div className="space-y-4">
        {campaigns.map(c => (
          <SectionCard key={c.id} title={c.campaignName} description={`${c.channel} · ${c.status} · ${c.owner ?? "Unassigned"}`} actions={<Button asChild size="sm" variant="outline" className="border-white/12"><Link href={`/lead-engine/campaigns/${c.id}`}>Open</Link></Button>}>
            <div className="text-sm text-muted-foreground font-heading">
              <div>Type: {c.campaignType}</div>
              <div>Objective: {c.objective ?? "—"}</div>
              <div>Created: {new Date(c.createdAt).toLocaleString()}</div>
            </div>
          </SectionCard>
        ))}
      </div>
    </LeadEngineShell>
  );
}
