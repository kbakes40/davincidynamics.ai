"use client";

import type { TrafficDashboardData } from "@/lib/traffic/types";
import { ChannelBubbleChart } from "./channel-bubble-chart";
import { KeywordTable } from "./keyword-table";
import { KpiStack } from "./kpi-stack";
import { TrafficLineChart } from "./traffic-line-chart";
import { TrafficSummaryCard } from "./traffic-summary-card";

type Props = {
  data: TrafficDashboardData;
};

export function TrafficShell({ data }: Props) {
  const kpis = [data.kpis.bounceRate, data.kpis.viewsPerSession, data.kpis.avgSessionDuration, data.kpis.percentNewUsers];

  return (
    <div className="mx-auto max-w-[1520px] space-y-6 px-5 pb-14 pt-8 sm:px-8 sm:pb-16 sm:pt-10">
      <div className="grid min-w-0 grid-cols-1 items-stretch gap-6 lg:grid-cols-12 lg:gap-6 xl:gap-7">
        <div className="min-w-0 lg:col-span-3">
          <KpiStack items={kpis} dateRangeLabel={data.dateRangeLabel} />
        </div>
        <div className="grid min-w-0 gap-6 lg:col-span-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TrafficLineChart
              title="Total users"
              total={Math.round(data.totals.totalUsers)}
              subtitle="Trend over selected period"
              data={data.usersTrend}
              color="amber"
            />
            <TrafficLineChart
              title="Sessions"
              total={Math.round(data.totals.sessions)}
              subtitle="Trend over selected period"
              data={data.sessionsTrend}
              color="orange"
            />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ChannelBubbleChart title="Sessions by channel" channels={data.channelBySessions} mode="sessions" dateRangeLabel={data.dateRangeLabel} />
            <ChannelBubbleChart title="Users by channel" channels={data.channelByUsers} mode="users" dateRangeLabel={data.dateRangeLabel} />
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-3">
          <TrafficSummaryCard summary={data.summary} badge={data.summaryBadge} dateRangeLabel={data.dateRangeLabel} />
          <KeywordTable title={data.tableTitle} rows={data.tableRows} dateRangeLabel={data.dateRangeLabel} />
        </div>
      </div>
    </div>
  );
}
