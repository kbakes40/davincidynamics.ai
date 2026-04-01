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
    <div className="mx-auto w-full max-w-[1800px] px-4 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-8 lg:px-8">
      <div className="grid min-w-0 grid-cols-1 items-start gap-10 xl:grid-cols-[280px_minmax(0,1.9fr)_456px] xl:[&>*]:self-start">
        <div className="min-w-0 xl:w-[280px]">
          <KpiStack items={kpis} dateRangeLabel={data.dateRangeLabel} />
        </div>
        <div className="grid min-w-0 gap-12">
          <div className="grid min-w-0 gap-6 lg:grid-cols-2 xl:gap-6">
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
          <div className="mt-16 grid min-w-0 gap-8 lg:grid-cols-2 xl:gap-10">
            <ChannelBubbleChart title="Sessions by channel" channels={data.channelBySessions} mode="sessions" dateRangeLabel={data.dateRangeLabel} />
            <ChannelBubbleChart title="Users by channel" channels={data.channelByUsers} mode="users" dateRangeLabel={data.dateRangeLabel} />
          </div>
        </div>
        <div className="grid min-w-0 content-start gap-10 xl:w-[456px]">
          <TrafficSummaryCard summary={data.summary} badge={data.summaryBadge} dateRangeLabel={data.dateRangeLabel} />
          <KeywordTable title={data.tableTitle} rows={data.tableRows} dateRangeLabel={data.dateRangeLabel} />
        </div>
      </div>
    </div>
  );
}
