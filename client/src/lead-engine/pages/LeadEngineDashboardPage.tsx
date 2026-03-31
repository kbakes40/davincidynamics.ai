import { useCallback, useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import type { DashboardOverviewResponse } from "@shared/lead-engine-types";
import { ActivityFeed } from "../components/ActivityFeed";
import { MarketHeatList } from "../components/MarketHeatList";
import {
  MetricCard,
  PageHeader,
  PageSkeleton,
  RefreshControl,
  SectionCard,
} from "../components/lead-engine-primitives";
import { JobStatusBadge } from "../components/lead-engine-badges";
import { fetchLeadEngineDashboard } from "../api";
import { LeadEngineShell } from "../LeadEngineShell";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { leMuted, leSurface } from "../surface";
import { PIPELINE_STAGE_LABELS } from "@shared/lead-engine-types";

const chartTick = { fill: "oklch(0.55 0 0)", fontSize: 11 };

export default function LeadEngineDashboardPage() {
  const [data, setData] = useState<DashboardOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [last, setLast] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const d = await fetchLeadEngineDashboard();
      setData(d);
      setLast(new Date());
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && !data) {
    return (
      <LeadEngineShell title="Command center" subtitle="Pipeline health and acquisition throughput">
        <PageSkeleton />
      </LeadEngineShell>
    );
  }

  if (err || !data) {
    return (
      <LeadEngineShell title="Command center" subtitle="Pipeline health and acquisition throughput">
        <div className={cn(leSurface, "p-8 border border-white/10")}>
          <p className="text-foreground font-heading mb-2">Could not load dashboard</p>
          <p className={cn(leMuted, "text-sm mb-4")}>{err}</p>
          <Button onClick={() => void load()} variant="outline" className="border-white/15">
            Retry
          </Button>
        </div>
      </LeadEngineShell>
    );
  }

  const topConv = [...data.conversionByStage].sort((a, b) => b.count - a.count).slice(0, 4);

  return (
    <LeadEngineShell
      title="Command center"
      subtitle="Pipeline health, job throughput, and market concentration"
      headerActions={<RefreshControl loading={loading} lastUpdated={last} onRefresh={() => void load()} />}
    >
      <PageHeader
        title="Acquisition overview"
        subtitle="Real-time snapshot of search jobs, verification, and outreach readiness."
        actions={
          <Button asChild variant="outline" className="border-white/12 bg-background/40 font-heading">
            <Link href="/lead-engine/leads">Open leads</Link>
          </Button>
        }
      />

      <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-card/60 to-card/30 p-6 lg:p-8 mb-8 backdrop-blur-sm">
        <p className="font-display text-lg md:text-xl text-foreground font-bold tracking-tight mb-1">
          DaVinci Dynamics — Lead Engine
        </p>
        <p className={cn(leMuted, "max-w-2xl mb-6")}>
          Operations command center for hookah, smoke, and tobacco verticals. Revenue metrics will layer in from
          your store database beside this traffic view.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <MetricCard label="Active jobs" value={data.activeJobs} hint="Currently executing" />
          <MetricCard label="Queued jobs" value={data.queuedJobs} hint="Scheduled" />
          <MetricCard label="Verified leads" value={data.verifiedLeads} hint="Phone / identity" />
          <MetricCard label="Outreach ready" value={data.outreachReadyLeads} hint="Approved for Vinci & Leo" />
          <MetricCard label="High score (80+)" value={data.highScoreLeads} hint="Market priority" className="col-span-2 lg:col-span-1" />
        </div>
      </div>

      <SectionCard
        title="Sales context"
        description="Order economics and profit will sync from your commerce database — not from GA4."
      >
        <div className={cn(leSurface, "p-4 border-dashed border-white/10 bg-background/20")}>
          <p className={cn(leMuted, "text-sm")}>
            Placeholder row: connect <span className="text-foreground/90">orders</span>,{" "}
            <span className="text-foreground/90">AOV</span>, and <span className="text-foreground/90">margin</span> here
            above the traffic panels.
          </p>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <SectionCard title="Traffic & sessions (7d)" description="Synthetic trend — wire to DB telemetry later." className="lg:col-span-2">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.trend7d} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="oklch(0.25 0 0 / 25%)" vertical={false} />
                <XAxis dataKey="day" tick={chartTick} tickLine={false} axisLine={false} />
                <YAxis tick={chartTick} tickLine={false} axisLine={false} width={32} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.12 0 0)",
                    border: "1px solid oklch(0.25 0 0 / 40%)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "oklch(0.85 0 0)" }}
                />
                <Bar dataKey="users" fill="oklch(0.62 0.14 210 / 0.75)" radius={[4, 4, 0, 0]} name="Users" />
                <Bar dataKey="sessions" fill="oklch(0.45 0.08 210 / 0.45)" radius={[4, 4, 0, 0]} name="Sessions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Market snapshot" description="Quality signals across captured leads.">
          <div className="space-y-3 text-sm font-heading">
            <div className="flex justify-between border-b border-white/[0.06] pb-2">
              <span className="text-muted-foreground">Avg score (outreach)</span>
              <span className="tabular-nums text-foreground">{data.marketSnapshot.avgScoreOutreachReady || "—"}</span>
            </div>
            <div className="flex justify-between border-b border-white/[0.06] pb-2">
              <span className="text-muted-foreground">Verification rate</span>
              <span className="tabular-nums text-foreground">{data.marketSnapshot.verificationRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Leads in focus set</span>
              <span className="tabular-nums text-foreground">{data.marketSnapshot.leadsThisWeek}</span>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <p className={cn(leMuted, "text-[11px] uppercase tracking-wider")}>Conversion by stage</p>
            <ul className="space-y-2">
              {topConv.map(row => (
                <li key={row.stage} className="flex justify-between text-xs font-heading">
                  <span className="text-muted-foreground truncate pr-2">{PIPELINE_STAGE_LABELS[row.stage]}</span>
                  <span className="text-foreground tabular-nums">{row.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <SectionCard title="Recent jobs">
          <ul className="space-y-2">
            {data.recentJobs.map(j => (
              <li key={j.id} className={cn(leSurface, "p-3 flex flex-wrap items-center gap-2 justify-between")}>
                <div>
                  <Link href={`/lead-engine/jobs/${j.id}`}>
                    <span className="font-heading text-sm text-accent hover:underline cursor-pointer">{j.niche}</span>
                  </Link>
                  <p className={cn(leMuted, "text-xs")}>{j.locationQuery}</p>
                </div>
                <JobStatusBadge status={j.status} />
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Recent activity">
          <ActivityFeed items={data.recentActivity} />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <SectionCard title="Top cities">
          <MarketHeatList title="Volume" rows={data.topCities} labelKey="city" valueKey="count" />
        </SectionCard>
        <SectionCard title="Top niches">
          <MarketHeatList title="Volume" rows={data.topNiches} labelKey="niche" valueKey="count" />
        </SectionCard>
      </div>
    </LeadEngineShell>
  );
}
