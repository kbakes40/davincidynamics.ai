import { useCallback, useEffect, useState } from "react";
import { PageSkeleton, RefreshControl, SectionCard } from "../components/lead-engine-primitives";
import { PipelineBoard } from "../components/PipelineBoard";
import { fetchLeads } from "../api";
import { LeadEngineShell } from "../LeadEngineShell";

import type { Lead } from "@shared/lead-engine-types";

export default function LeadEnginePipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [last, setLast] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetchLeads({});
      setLeads(r.leads);
      setLast(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && leads.length === 0) {
    return (
      <LeadEngineShell title="Pipeline" subtitle="Stage discipline">
        <PageSkeleton />
      </LeadEngineShell>
    );
  }

  return (
    <LeadEngineShell
      title="Pipeline"
      subtitle="Move deals with precision — stage changes sync to activity."
      headerActions={<RefreshControl loading={loading} lastUpdated={last} onRefresh={() => void load()} />}
    >
      <SectionCard
        title="Board"
        description="Drag-and-drop deferred; use the stage menu on each card for now."
      >
        <PipelineBoard leads={leads} onRefresh={() => void load()} />
      </SectionCard>
    </LeadEngineShell>
  );
}
