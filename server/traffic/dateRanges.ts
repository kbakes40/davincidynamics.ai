import type { TrafficDateRange } from "./types";

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function formatYmd(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

type Ga4DateWindow = {
  startDate: string;
  endDate: string;
};

export type TrafficRangeSpec = {
  label: string;
  current: Ga4DateWindow;
  previous: Ga4DateWindow;
};

export function getTrafficRangeSpec(range: TrafficDateRange): TrafficRangeSpec {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  switch (range) {
    case "last7":
      return {
        label: "Last 7 days",
        current: { startDate: "7daysAgo", endDate: "today" },
        previous: { startDate: "14daysAgo", endDate: "8daysAgo" },
      };
    case "last30":
      return {
        label: "Last 30 days",
        current: { startDate: "30daysAgo", endDate: "today" },
        previous: { startDate: "60daysAgo", endDate: "31daysAgo" },
      };
    case "last90":
      return {
        label: "Last 90 days",
        current: { startDate: "90daysAgo", endDate: "today" },
        previous: { startDate: "180daysAgo", endDate: "91daysAgo" },
      };
    case "ytd": {
      const y = today.getFullYear();
      const start = `${y}-01-01`;
      const end = formatYmd(today);
      const jan1 = new Date(y, 0, 1);
      const days = Math.floor((today.getTime() - jan1.getTime()) / 86400000);
      const prevStart = new Date(y - 1, 0, 1);
      const prevEnd = new Date(prevStart);
      prevEnd.setDate(prevEnd.getDate() + days);
      return {
        label: "Year to date",
        current: { startDate: start, endDate: end },
        previous: { startDate: `${y - 1}-01-01`, endDate: formatYmd(prevEnd) },
      };
    }
    default:
      return {
        label: "Last 30 days",
        current: { startDate: "30daysAgo", endDate: "today" },
        previous: { startDate: "60daysAgo", endDate: "31daysAgo" },
      };
  }
}
