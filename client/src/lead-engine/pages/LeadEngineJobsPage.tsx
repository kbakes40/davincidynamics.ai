import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import type { SearchJob } from "@shared/lead-engine-types";
import { JobStatusBadge } from "../components/lead-engine-badges";
import { EmptyState, PageSkeleton, RefreshControl, SectionCard } from "../components/lead-engine-primitives";
import { fetchJobs, cancelJobApi } from "../api";
import { LeadEngineShell } from "../LeadEngineShell";
import { cn } from "@/lib/utils";
import { leMuted, leSurface } from "../surface";
import { toast } from "sonner";

export default function LeadEngineJobsPage() {
  const [jobs, setJobs] = useState<SearchJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [last, setLast] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetchJobs();
      setJobs(r.jobs);
      setLast(new Date());
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function cancel(id: string) {
    try {
      await cancelJobApi(id);
      toast.success("Job cancelled");
      void load();
    } catch {
      toast.error("Could not cancel job");
    }
  }

  if (loading && jobs.length === 0) {
    return (
      <LeadEngineShell title="Jobs" subtitle="Search and ingestion workloads">
        <PageSkeleton />
      </LeadEngineShell>
    );
  }

  return (
    <LeadEngineShell
      title="Jobs"
      subtitle="Search workloads, task health, and linked leads"
      headerActions={<RefreshControl loading={loading} lastUpdated={last} onRefresh={() => void load()} />}
    >
      {err ? (
        <p className="text-red-400 text-sm font-heading mb-4">{err}</p>
      ) : null}

      {jobs.length === 0 ? (
        <EmptyState
          title="No jobs yet"
          description="Create a search job to start ingesting hookah, smoke shop, and tobacco leads."
          action={
            <Button className="bg-accent text-background font-heading" disabled title="Wire POST /api/jobs">
              New job (soon)
            </Button>
          }
        />
      ) : (
        <SectionCard title="All jobs" description="Monitor runs, failures, and completion.">
          <div className="space-y-2">
            {jobs.map(j => (
              <div
                key={j.id}
                className={cn(leSurface, "p-4 flex flex-col lg:flex-row lg:items-center gap-4 justify-between border-white/[0.07]")}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Link href={`/lead-engine/jobs/${j.id}`}>
                      <span className="font-heading font-semibold text-foreground hover:text-accent cursor-pointer">
                        {j.niche}
                      </span>
                    </Link>
                    <JobStatusBadge status={j.status} />
                  </div>
                  <p className={cn(leMuted, "text-xs")}>
                    {j.locationQuery} · {j.source} · {new Date(j.createdAt).toLocaleString()}
                  </p>
                  <p className={cn(leMuted, "text-xs mt-1")}>
                    Tasks {j.taskCompleted}/{j.taskTotal} · failed {j.taskFailed} · leads {j.linkedLeadIds.length}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <Button asChild variant="outline" size="sm" className="border-white/12 font-heading">
                    <Link href={`/lead-engine/jobs/${j.id}`}>Open</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/12 text-muted-foreground"
                    disabled={j.status === "completed" || j.status === "cancelled"}
                    onClick={() => void cancel(j.id)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </LeadEngineShell>
  );
}
