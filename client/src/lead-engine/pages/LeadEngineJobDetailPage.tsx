import { useCallback, useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import type { JobDetailResponse } from "@shared/lead-engine-types";
import { JobStatusBadge } from "../components/lead-engine-badges";
import { PageSkeleton, SectionCard } from "../components/lead-engine-primitives";
import { cancelJobApi, fetchJob } from "../api";
import { LeadEngineShell } from "../LeadEngineShell";
import { cn } from "@/lib/utils";
import { leMuted, leSurface } from "../surface";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function LeadEngineJobDetailPage() {
  const [, params] = useRoute("/lead-engine/jobs/:id");
  const id = params?.id ?? "";
  const [data, setData] = useState<JobDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const j = await fetchJob(id);
      setData(j);
    } catch {
      setData(null);
      toast.error("Job not found");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!id || (loading && !data)) {
    return (
      <LeadEngineShell title="Job" subtitle="">
        <PageSkeleton />
      </LeadEngineShell>
    );
  }

  if (!data) {
    return (
      <LeadEngineShell title="Job" subtitle="">
        <p className="text-muted-foreground font-heading">Job not found.</p>
        <Button asChild variant="outline" className="mt-4 border-white/12">
          <Link href="/lead-engine/jobs">Back to jobs</Link>
        </Button>
      </LeadEngineShell>
    );
  }

  const { job, tasks } = data;

  return (
    <LeadEngineShell
      title={job.niche}
      subtitle={`${job.locationQuery} · ${job.source}`}
      headerActions={
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="border-white/12">
            <Link href="/lead-engine/jobs">All jobs</Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-white/12"
            disabled={job.status === "completed" || job.status === "cancelled"}
            onClick={async () => {
              await cancelJobApi(job.id);
              toast.success("Cancelled");
              void load();
            }}
          >
            Cancel job
          </Button>
        </div>
      }
    >
      <div className={cn(leSurface, "p-5 mb-6 flex flex-wrap gap-4 items-center border-white/[0.07]")}>
        <JobStatusBadge status={job.status} />
        <span className={cn(leMuted, "text-xs")}>
          Created {new Date(job.createdAt).toLocaleString()}
          {job.startedAt ? ` · Started ${new Date(job.startedAt).toLocaleString()}` : ""}
          {job.completedAt ? ` · Done ${new Date(job.completedAt).toLocaleString()}` : ""}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className={cn(leSurface, "p-4 border-white/[0.07]")}>
          <p className={cn(leMuted, "text-[11px] uppercase")}>Tasks done</p>
          <p className="text-xl font-display font-bold tabular-nums">{job.taskCompleted}</p>
        </div>
        <div className={cn(leSurface, "p-4 border-white/[0.07]")}>
          <p className={cn(leMuted, "text-[11px] uppercase")}>Failed</p>
          <p className="text-xl font-display font-bold tabular-nums text-red-400/90">{job.taskFailed}</p>
        </div>
        <div className={cn(leSurface, "p-4 border-white/[0.07]")}>
          <p className={cn(leMuted, "text-[11px] uppercase")}>Total</p>
          <p className="text-xl font-display font-bold tabular-nums">{job.taskTotal}</p>
        </div>
        <div className={cn(leSurface, "p-4 border-white/[0.07]")}>
          <p className={cn(leMuted, "text-[11px] uppercase")}>Linked leads</p>
          <p className="text-xl font-display font-bold tabular-nums">{job.linkedLeadIds.length}</p>
        </div>
      </div>

      <SectionCard title="Linked leads">
        <div className="flex flex-wrap gap-2">
          {job.linkedLeadIds.length ? (
            job.linkedLeadIds.map(lid => (
              <Button key={lid} asChild variant="outline" size="sm" className="border-white/12 font-mono text-xs">
                <Link href={`/lead-engine/leads/${lid}`}>{lid}</Link>
              </Button>
            ))
          ) : (
            <p className={cn(leMuted, "text-sm")}>No leads linked yet.</p>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Tasks" className="mt-6" description="Ingestion and enrichment steps.">
        <Table>
          <TableHeader>
            <TableRow className="border-white/[0.08] hover:bg-transparent">
              <TableHead className="text-muted-foreground font-heading">Kind</TableHead>
              <TableHead className="text-muted-foreground font-heading">Target</TableHead>
              <TableHead className="text-muted-foreground font-heading">Status</TableHead>
              <TableHead className="text-muted-foreground font-heading">Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map(t => (
              <TableRow key={t.id} className="border-white/[0.06]">
                <TableCell className="font-mono text-xs">{t.kind}</TableCell>
                <TableCell className="text-sm max-w-[240px] truncate">{t.target}</TableCell>
                <TableCell className="text-xs font-heading capitalize">{t.status}</TableCell>
                <TableCell className="text-xs text-red-400/80 max-w-[200px] truncate">{t.lastError ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SectionCard>
    </LeadEngineShell>
  );
}
