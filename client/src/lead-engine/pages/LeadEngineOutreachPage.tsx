import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import type { OutreachQueueItem } from "@shared/lead-engine-types";
import { LeadScoreBadge } from "../components/lead-engine-badges";
import {
  EmptyState,
  PageSkeleton,
  RefreshControl,
  SectionCard,
} from "../components/lead-engine-primitives";
import { fetchOutreachQueue } from "../api";
import { LeadEngineShell } from "../LeadEngineShell";
import { cn } from "@/lib/utils";
import { leMuted, leSurface } from "../surface";
import { toast } from "sonner";

export default function LeadEngineOutreachPage() {
  const [items, setItems] = useState<OutreachQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [last, setLast] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetchOutreachQueue();
      setItems(r.items);
      setLast(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && items.length === 0) {
    return (
      <LeadEngineShell title="Outreach queue" subtitle="Vinci & Leo ready">
        <PageSkeleton />
      </LeadEngineShell>
    );
  }

  return (
    <LeadEngineShell
      title="Outreach queue"
      subtitle="Only verified, site-reviewed leads approved for DaVinci outreach"
      headerActions={<RefreshControl loading={loading} lastUpdated={last} onRefresh={() => void load()} />}
    >
      {items.length === 0 ? (
        <EmptyState
          title="Queue is clear"
          description="Move leads to Outreach ready in the pipeline to populate Vinci and Leo workstreams."
          action={
            <Button asChild variant="outline" className="border-white/12">
              <Link href="/lead-engine/pipeline">Open pipeline</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <SectionCard
              key={item.leadId}
              title={item.businessName}
              description={`${item.city}, ${item.state} · Priority ${item.priority}`}
              actions={
                <div className="flex items-center gap-2">
                  <LeadScoreBadge score={item.score} />
                  <Button
                    size="sm"
                    className="bg-accent text-background font-heading"
                    onClick={() => toast.message("Sent to outreach (mock)")}
                  >
                    Send to outreach
                  </Button>
                </div>
              }
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className={cn(leMuted, "text-[11px] uppercase tracking-wider mb-2")}>Opening angle</p>
                  <p className="text-sm text-foreground font-heading leading-relaxed">{item.openingAngle}</p>
                </div>
                <div>
                  <p className={cn(leMuted, "text-[11px] uppercase tracking-wider mb-2")}>Site weakness</p>
                  <p className="text-sm text-foreground font-heading leading-relaxed">{item.siteWeaknessSummary}</p>
                </div>
              </div>
              <div className={cn(leSurface, "mt-4 p-3 flex flex-wrap gap-4 text-xs font-heading text-muted-foreground border-white/[0.06]")}>
                <span>Web: {item.websiteStatus}</span>
                <span>Owner: {item.owner ?? "—"}</span>
                <span>Reviewed: {new Date(item.lastReviewAt).toLocaleDateString()}</span>
                <Link href={`/lead-engine/leads/${item.leadId}`} className="text-accent hover:underline">
                  Full lead →
                </Link>
              </div>
            </SectionCard>
          ))}
        </div>
      )}
    </LeadEngineShell>
  );
}
