import { getTrafficRangeSpec } from "./dateRanges";
import {
  formatBounceRateFraction,
  formatDurationSeconds,
  formatPercentRatio,
  pctChange,
  safeNum,
} from "./format";
import { getAnalyticsDataClient, getGa4PropertyResourceName, getMissingGa4Env } from "./ga4Client";
import type {
  TrafficChannelRow,
  TrafficDashboardData,
  TrafficDateRange,
  TrafficResult,
  TrafficTableMode,
  TrafficTableRow,
} from "./types";

const AGG_METRICS = [
  "sessions",
  "totalUsers",
  "bounceRate",
  "averageSessionDuration",
  "newUsers",
  "screenPageViewsPerSession",
] as const;

function parseAggregateRow(row: { metricValues?: { value?: string | null }[] | null } | undefined | null) {
  const mv = row?.metricValues;
  if (!mv?.length) {
    return {
      sessions: 0,
      totalUsers: 0,
      bounceRate: 0,
      averageSessionDuration: 0,
      newUsers: 0,
      screenPageViewsPerSession: 0,
    };
  }
  return {
    sessions: safeNum(mv[0]?.value),
    totalUsers: safeNum(mv[1]?.value),
    bounceRate: safeNum(mv[2]?.value),
    averageSessionDuration: safeNum(mv[3]?.value),
    newUsers: safeNum(mv[4]?.value),
    screenPageViewsPerSession: safeNum(mv[5]?.value),
  };
}

async function runAggregate(property: string, dateRange: { startDate: string; endDate: string }) {
  const client = getAnalyticsDataClient();
  if (!client) throw new Error("GA4 client unavailable");
  const [resp] = await client.runReport({
    property,
    dateRanges: [dateRange],
    metrics: AGG_METRICS.map(name => ({ name })),
  });
  return parseAggregateRow(resp.rows?.[0]);
}

async function runTrendSeries(property: string, dateRange: { startDate: string; endDate: string }) {
  const client = getAnalyticsDataClient();
  if (!client) throw new Error("GA4 client unavailable");
  const [resp] = await client.runReport({
    property,
    dateRanges: [dateRange],
    dimensions: [{ name: "date" }],
    metrics: [{ name: "sessions" }, { name: "totalUsers" }],
    orderBys: [{ dimension: { dimensionName: "date" } }],
  });
  return (resp.rows ?? []).map(row => {
    const d = row.dimensionValues?.[0]?.value ?? "";
    const y = d.slice(0, 4);
    const m = d.slice(4, 6);
    const day = d.slice(6, 8);
    return {
      date: d.length === 8 ? `${y}-${m}-${day}` : d,
      sessions: safeNum(row.metricValues?.[0]?.value),
      users: safeNum(row.metricValues?.[1]?.value),
    };
  });
}

async function runChannelBreakdown(property: string, dateRange: { startDate: string; endDate: string }): Promise<TrafficChannelRow[]> {
  const client = getAnalyticsDataClient();
  if (!client) throw new Error("GA4 client unavailable");
  const [resp] = await client.runReport({
    property,
    dateRanges: [dateRange],
    dimensions: [{ name: "sessionDefaultChannelGroup" }],
    metrics: [{ name: "sessions" }, { name: "totalUsers" }],
    orderBys: [{ desc: true, metric: { metricName: "sessions" } }],
    limit: 25,
  });
  return (resp.rows ?? []).map(row => ({
    channel: row.dimensionValues?.[0]?.value ?? "Unknown",
    sessions: safeNum(row.metricValues?.[0]?.value),
    users: safeNum(row.metricValues?.[1]?.value),
  }));
}

async function runKeywordTable(property: string, dateRange: { startDate: string; endDate: string }): Promise<TrafficTableRow[]> {
  const client = getAnalyticsDataClient();
  if (!client) throw new Error("GA4 client unavailable");
  const [resp] = await client.runReport({
    property,
    dateRanges: [dateRange],
    dimensions: [{ name: "sessionManualTerm" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ desc: true, metric: { metricName: "sessions" } }],
    limit: 20,
  });
  return (resp.rows ?? []).map(row => ({
    label: row.dimensionValues?.[0]?.value ?? "",
    sessions: safeNum(row.metricValues?.[0]?.value),
  }));
}

async function runLandingTable(property: string, dateRange: { startDate: string; endDate: string }): Promise<TrafficTableRow[]> {
  const client = getAnalyticsDataClient();
  if (!client) throw new Error("GA4 client unavailable");
  const [resp] = await client.runReport({
    property,
    dateRanges: [dateRange],
    dimensions: [{ name: "landingPagePlusQueryString" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ desc: true, metric: { metricName: "sessions" } }],
    limit: 15,
  });
  return (resp.rows ?? []).map(row => ({
    label: row.dimensionValues?.[0]?.value ?? "-",
    sessions: safeNum(row.metricValues?.[0]?.value),
  }));
}

function isNotSetTerm(s: string): boolean {
  const t = s.trim().toLowerCase();
  return t === "" || t === "(not set)";
}

function shouldUseLandingFallback(rows: TrafficTableRow[]): boolean {
  if (rows.length === 0) return true;
  const total = rows.reduce((a, r) => a + r.sessions, 0);
  if (total <= 0) return true;
  const notSetSessions = rows.filter(r => isNotSetTerm(r.label)).reduce((a, r) => a + r.sessions, 0);
  return notSetSessions / total > 0.65;
}

function buildKpi(label: string, valueDisplay: string, cur: number, prev: number, higherIsBetter: boolean) {
  return { label, valueDisplay, changePct: pctChange(prev, cur), higherIsBetter };
}

function percentNewUsers(newUsers: number, totalUsers: number): number {
  if (totalUsers <= 0) return 0;
  return (newUsers / totalUsers) * 100;
}

function generateSummaryBadge(
  cur: ReturnType<typeof parseAggregateRow>,
  prev: ReturnType<typeof parseAggregateRow>
): string {
  const s = pctChange(prev.sessions, cur.sessions);
  const b = pctChange(prev.bounceRate, cur.bounceRate);
  if (s == null && b == null) return "Review period metrics";
  const sessionsDown = s != null && s < -5;
  const bounceDown = b != null && b < -3;
  const bounceUp = b != null && b > 3;
  if (sessionsDown && bounceDown) return "Lower traffic, stronger engagement";
  if (sessionsDown && !bounceUp) return "Traffic eased, quality steady";
  if (sessionsDown) return "Traffic declined vs prior window";
  if (s != null && s > 5) return "Sessions growing vs prior window";
  return "Stable with minor fluctuations";
}

function generateSummary(label: string, cur: ReturnType<typeof parseAggregateRow>, prev: ReturnType<typeof parseAggregateRow>): string {
  const s = pctChange(prev.sessions, cur.sessions);
  const br = pctChange(prev.bounceRate, cur.bounceRate);
  const dur = pctChange(prev.averageSessionDuration, cur.averageSessionDuration);
  const vps = pctChange(prev.screenPageViewsPerSession, cur.screenPageViewsPerSession);
  const pnu = percentNewUsers(cur.newUsers, cur.totalUsers);
  const pnuPrev = percentNewUsers(prev.newUsers, prev.totalUsers);
  const pnuDelta = pctChange(pnuPrev, pnu);

  const parts: string[] = [];
  parts.push(
    `In the ${label.toLowerCase()}, the site recorded ${Math.round(cur.sessions).toLocaleString("en-US")} sessions and ${Math.round(cur.totalUsers).toLocaleString("en-US")} users.`
  );

  if (s != null) {
    if (Math.abs(s) < 0.05) parts.push("Sessions were flat versus the prior window.");
    else parts.push(`Sessions ${s < 0 ? "fell" : "rose"} about ${Math.abs(s).toFixed(1)}% versus the prior window.`);
  }

  const engagement: string[] = [];
  if (br != null && br !== 0) {
    engagement.push(`bounce rate ${br < 0 ? "decreased" : "increased"} (visitor ${br < 0 ? "deeper" : "shallower"} engagement vs the prior period)`);
  }
  if (dur != null && dur !== 0) engagement.push(`average session duration ${dur > 0 ? "increased" : "decreased"}`);
  if (vps != null && vps !== 0) engagement.push(`views per session ${vps > 0 ? "rose" : "fell"}`);
  if (pnuDelta != null && Math.abs(pnuDelta) > 1) engagement.push(`new-user share moved to about ${pnu.toFixed(1)}%`);
  if (engagement.length) parts.push(`Engagement: ${engagement.join("; ")}.`);

  parts.push("Figures reflect GA4 property data; use filters in Google Analytics for segment drill-downs.");
  return parts.join(" ");
}

export async function getTrafficData(range: TrafficDateRange): Promise<TrafficResult> {
  const missing = getMissingGa4Env();
  if (missing.length > 0) return { ok: false, reason: "setup", missingEnv: missing };

  const property = getGa4PropertyResourceName();
  if (!property) return { ok: false, reason: "setup", missingEnv: ["GA4_PROPERTY_ID"] };

  const spec = getTrafficRangeSpec(range);
  const { current, previous } = spec;

  try {
    const [curAgg, prevAgg, trend, channels, keywordRows] = await Promise.all([
      runAggregate(property, current),
      runAggregate(property, previous),
      runTrendSeries(property, current),
      runChannelBreakdown(property, current),
      runKeywordTable(property, current),
    ]);

    let tableMode: TrafficTableMode = "keyword";
    let tableTitle = "Sessions by search term (manual)";
    let tableRows = keywordRows.filter(r => r.sessions > 0);
    if (shouldUseLandingFallback(tableRows)) {
      tableMode = "landing";
      tableTitle = "Top landing pages";
      tableRows = await runLandingTable(property, current);
    }

    const pnu = percentNewUsers(curAgg.newUsers, curAgg.totalUsers);
    const pnuPrev = percentNewUsers(prevAgg.newUsers, prevAgg.totalUsers);

    const data: TrafficDashboardData = {
      dateRange: range,
      dateRangeLabel: spec.label,
      kpis: {
        bounceRate: buildKpi("Bounce rate", formatBounceRateFraction(curAgg.bounceRate), curAgg.bounceRate, prevAgg.bounceRate, false),
        viewsPerSession: buildKpi("Views per session", curAgg.screenPageViewsPerSession.toFixed(2), curAgg.screenPageViewsPerSession, prevAgg.screenPageViewsPerSession, true),
        avgSessionDuration: buildKpi("Avg. session duration", formatDurationSeconds(curAgg.averageSessionDuration), curAgg.averageSessionDuration, prevAgg.averageSessionDuration, true),
        percentNewUsers: buildKpi("% new users", formatPercentRatio(pnu), pnu, pnuPrev, true),
      },
      totals: {
        sessions: curAgg.sessions,
        totalUsers: curAgg.totalUsers,
        sessionsPrev: prevAgg.sessions,
        totalUsersPrev: prevAgg.totalUsers,
      },
      usersTrend: trend.map(t => ({ date: t.date, value: t.users })),
      sessionsTrend: trend.map(t => ({ date: t.date, value: t.sessions })),
      channelBySessions: channels,
      channelByUsers: channels.map(c => ({ ...c })),
      tableMode,
      tableTitle,
      tableRows: tableRows.slice(0, 12),
      summary: generateSummary(spec.label, curAgg, prevAgg),
      summaryBadge: generateSummaryBadge(curAgg, prevAgg),
    };
    return { ok: true, data };
  } catch (e) {
    return { ok: false, reason: "error", message: e instanceof Error ? e.message : "Google Analytics request failed" };
  }
}
