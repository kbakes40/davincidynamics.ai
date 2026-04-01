import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AnalyticsOverviewResponse } from "@shared/lead-engine-types";
import {
  MetricCard,
  PageHeader,
  PageSkeleton,
  RefreshControl,
  SectionCard,
} from "../components/lead-engine-primitives";
import { MarketHeatList } from "../components/MarketHeatList";
import { fetchLeadEngineAnalytics } from "../api";
import { LeadEngineShell } from "../LeadEngineShell";
import { cn } from "@/lib/utils";
import { leMuted } from "../surface";

const tick = { fill: "oklch(0.55 0 0)", fontSize: 11 };
const tooltipContentStyle = {
  background: "oklch(0.12 0 0 / 0.96)",
  border: "1px solid oklch(0.25 0 0 / 40%)",
  borderRadius: 12,
  fontSize: 12,
  color: "oklch(0.9 0 0)",
};
const tooltipLabelStyle = {
  color: "oklch(0.88 0 0)",
};
const tooltipItemStyle = {
  color: "oklch(0.82 0 0)",
};

export default function LeadEngineAnalyticsPage() {
  const [data, setData] = useState<AnalyticsOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [last, setLast] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const d = await fetchLeadEngineAnalytics();
      setData(d);
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

  useEffect(() => {
    const t = setInterval(() => void load(), 60_000);
    return () => clearInterval(t);
  }, [load]);

  if (loading && !data) {
    return (
      <LeadEngineShell title="Analytics" subtitle="Market performance">
        <PageSkeleton />
      </LeadEngineShell>
    );
  }

  if (err || !data) {
    return (
      <LeadEngineShell title="Analytics" subtitle="">
        <p className="text-red-400/90 font-heading text-sm">{err}</p>
      </LeadEngineShell>
    );
  }

  const funnelData = data.verificationFunnel.map(f => ({ name: f.step, value: f.count }));

  return (
    <LeadEngineShell
      title="Analytics"
      subtitle="Executive view — ingestion quality and pipeline yield"
      headerActions={<RefreshControl loading={loading} lastUpdated={last} onRefresh={() => void load()} />}
    >
      <PageHeader
        title="Lead performance"
        subtitle="Volumes, scoring, and funnel integrity across captured markets."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Outreach-ready rate"
          value={`${data.outreachReadyRate}%`}
          hint="Of total captured set"
        />
        <MetricCard
          label="Top market (avg score)"
          value={data.topMarkets[0]?.label ?? "—"}
          hint={data.topMarkets[0] ? `Avg ${data.topMarkets[0].avgScore}` : ""}
        />
        <MetricCard label="Sources tracked" value={data.sourceQuality.length} hint="Acquisition mix" />
        <MetricCard label="Cities" value={data.volumeByCity.length} hint="Distinct metros" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <SectionCard title="Lead volume by city">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.volumeByCity.slice(0, 8)} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="oklch(0.25 0 0 / 20%)" vertical={false} />
                <XAxis dataKey="city" tick={tick} tickLine={false} axisLine={false} />
                <YAxis tick={tick} tickLine={false} axisLine={false} width={28} />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  labelStyle={tooltipLabelStyle}
                  itemStyle={tooltipItemStyle}
                  cursor={{ fill: "oklch(0.24 0 0 / 35%)" }}
                />
                <Bar dataKey="count" fill="oklch(0.58 0.12 210 / 0.75)" radius={[4, 4, 0, 0]} name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Score distribution">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.scoreDistribution} layout="vertical" margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="oklch(0.25 0 0 / 20%)" horizontal={false} />
                <XAxis type="number" tick={tick} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="bucket" width={56} tick={tick} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  labelStyle={tooltipLabelStyle}
                  itemStyle={tooltipItemStyle}
                  cursor={{ fill: "oklch(0.24 0 0 / 35%)" }}
                />
                <Bar dataKey="count" fill="oklch(0.5 0.1 210 / 0.65)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Website status (enrichment)" description="From automated site checks.">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[...(data.websiteStatusBreakdown ?? [])].slice(0, 12)}
                margin={{ top: 8, right: 8, left: 0, bottom: 32 }}
              >
                <CartesianGrid stroke="oklch(0.25 0 0 / 20%)" vertical={false} />
                <XAxis
                  dataKey="status"
                  tick={{ ...tick, fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-18}
                  textAnchor="end"
                  height={52}
                />
                <YAxis tick={tick} tickLine={false} axisLine={false} width={28} />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  labelStyle={tooltipLabelStyle}
                  itemStyle={tooltipItemStyle}
                  cursor={{ fill: "oklch(0.24 0 0 / 35%)" }}
                />
                <Bar dataKey="count" fill="oklch(0.52 0.11 200 / 0.72)" radius={[4, 4, 0, 0]} name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SectionCard title="Verification funnel">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={funnelData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="oklch(0.25 0 0 / 20%)" />
                <XAxis dataKey="name" tick={tick} tickLine={false} axisLine={false} />
                <YAxis tick={tick} tickLine={false} axisLine={false} width={28} />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  labelStyle={tooltipLabelStyle}
                  itemStyle={tooltipItemStyle}
                  cursor={{ stroke: "oklch(0.38 0 0 / 80%)" }}
                />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="oklch(0.65 0.16 210)" strokeWidth={2} dot={{ r: 3 }} name="Count" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Pipeline conversion (% of total)" description="Share of leads in each stage.">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.pipelineConversion.filter(p => p.count > 0)}
                margin={{ top: 8, right: 8, left: 0, bottom: 32 }}
              >
                <CartesianGrid stroke="oklch(0.25 0 0 / 20%)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ ...tick, fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-12}
                  textAnchor="end"
                  height={48}
                />
                <YAxis tick={tick} tickLine={false} axisLine={false} width={32} />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  labelStyle={tooltipLabelStyle}
                  itemStyle={tooltipItemStyle}
                  cursor={{ fill: "oklch(0.24 0 0 / 35%)" }}
                  formatter={(v: number, name: string, props: { payload?: { count?: number } }) => [
                    `${v}% (${props.payload?.count ?? 0})`,
                    name,
                  ]}
                />
                <Bar dataKey="pctOfTotal" fill="oklch(0.55 0.14 210 / 0.7)" radius={[4, 4, 0, 0]} name="Share" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard title="Top performing markets" description="By avg score × volume.">
          <ul className="space-y-2">
            {data.topMarkets.map(m => (
              <li
                key={m.label}
                className="flex justify-between text-sm font-heading border-b border-white/[0.06] pb-2 last:border-0"
              >
                <span className="text-foreground">{m.label}</span>
                <span className="text-muted-foreground tabular-nums">
                  {m.leads} leads · avg {m.avgScore}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Source quality" description="Average lead score by acquisition source.">
          <ul className="space-y-2">
            {data.sourceQuality.map(s => (
              <li
                key={s.source}
                className="flex justify-between text-sm font-heading border-b border-white/[0.06] pb-2 last:border-0"
              >
                <span className="text-foreground">{s.source}</span>
                <span className={cn(leMuted, "tabular-nums")}>
                  avg {s.avgScore} · {s.count} leads
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <SectionCard title="Niche concentration" className="mt-6">
        <MarketHeatList title="Leads" rows={data.volumeByNiche} labelKey="niche" valueKey="count" />
      </SectionCard>
    </LeadEngineShell>
  );
}
