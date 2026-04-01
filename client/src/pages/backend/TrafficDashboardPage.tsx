import { TrafficDateRangeSelector } from "@/components/traffic/traffic-date-range";
import { TrafficShell } from "@/components/traffic/traffic-shell";
import { trafficHeaderBar } from "@/components/traffic/traffic-styles";
import type { TrafficDateRange, TrafficResult } from "@/lib/traffic/types";
import { useCallback, useEffect, useMemo, useState } from "react";

const RANGE_VALUES: TrafficDateRange[] = ["last7", "last30", "last90", "ytd"];

function parseRange(raw: string | null): TrafficDateRange {
  return raw && RANGE_VALUES.includes(raw as TrafficDateRange) ? (raw as TrafficDateRange) : "last30";
}

function readRangeFromUrl(): TrafficDateRange {
  if (typeof window === "undefined") return "last30";
  const p = new URLSearchParams(window.location.search);
  return parseRange(p.get("range"));
}

function writeRangeToUrl(range: TrafficDateRange): void {
  if (typeof window === "undefined") return;
  const u = new URL(window.location.href);
  u.searchParams.set("range", range);
  window.history.pushState({}, "", `${u.pathname}?${u.searchParams.toString()}`);
}

export default function TrafficDashboardPage() {
  const [range, setRange] = useState<TrafficDateRange>(() => readRangeFromUrl());
  const [result, setResult] = useState<TrafficResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    setRange(readRangeFromUrl());
  }, []);

  useEffect(() => {
    let isCancelled = false;
    const run = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/backend/traffic?range=${encodeURIComponent(range)}`);
        const json = (await res.json()) as TrafficResult;
        if (!isCancelled) setResult(json);
      } catch (e) {
        if (!isCancelled) {
          setResult({ ok: false, reason: "error", message: e instanceof Error ? e.message : "Request failed" });
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };
    void run();
    return () => {
      isCancelled = true;
    };
  }, [range, refreshTick]);

  const handleRangeChange = useCallback((next: TrafficDateRange) => {
    setRange(next);
    writeRangeToUrl(next);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshTick(x => x + 1);
  }, []);

  const body = useMemo(() => {
    if (isLoading && !result) return <TrafficSkeleton />;
    if (!result) return <TrafficSkeleton />;
    if (result.ok) return <TrafficShell data={result.data} />;
    if (result.reason === "setup") return <SetupState missing={result.missingEnv} />;
    return <ErrorState message={result.message} />;
  }, [isLoading, result]);

  return (
    <div className="fixed inset-0 z-50 min-h-screen overflow-y-auto font-sans text-[#fff7ed] antialiased">
      <div
        className="pointer-events-none fixed inset-0 -z-20"
        style={{ background: "linear-gradient(165deg, #1c0a02 0%, #431407 22%, #7c2d12 48%, #431407 72%, #1c0a02 100%)" }}
      />
      <div
        className="pointer-events-none fixed -top-32 left-1/2 -z-10 h-[min(70vh,520px)] w-[min(100vw,900px)] -translate-x-1/2 opacity-90"
        style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(251, 146, 60, 0.18) 0%, transparent 72%)" }}
      />

      <header className={trafficHeaderBar}>
        <div className="mx-auto flex max-w-[1520px] min-w-0 flex-col gap-5 px-5 py-5 sm:px-8 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 shrink-0 lg:max-w-[42%]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-orange-200/45">DaVinci Dynamics</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-[#fffbeb] sm:text-2xl">Traffic Intelligence</h1>
            <p className="mt-1 text-xs text-orange-100/45">Website traffic and engagement overview</p>
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-3 sm:gap-4">
            <TrafficDateRangeSelector selected={range} onChange={handleRangeChange} />
            <button
              type="button"
              onClick={handleRefresh}
              className="flex h-10 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-orange-950/50 bg-[#292524]/50 text-orange-200/60 transition-colors hover:border-amber-800/40 hover:bg-white/[0.05] hover:text-amber-100/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c0a02]"
              title="Refresh"
            >
              <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M12.25 7a5.25 5.25 0 11-1.54-3.71" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12.25 1.75v3.5h-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className={isLoading ? "pointer-events-none opacity-50 transition-opacity duration-300" : "transition-opacity duration-300"}>{body}</div>
    </div>
  );
}

function TrafficSkeleton() {
  return (
    <div className="mx-auto max-w-[1520px] space-y-7 px-5 pb-12 pt-10 sm:px-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="h-96 animate-pulse rounded-3xl border border-orange-950/30 bg-orange-950/20 lg:col-span-3" />
        <div className="space-y-6 lg:col-span-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="h-72 animate-pulse rounded-3xl border border-orange-900/30 bg-orange-950/15" />
            <div className="h-72 animate-pulse rounded-3xl border border-orange-900/30 bg-orange-950/15" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="h-64 animate-pulse rounded-3xl border border-orange-950/30 bg-orange-950/20" />
            <div className="h-64 animate-pulse rounded-3xl border border-orange-950/30 bg-orange-950/20" />
          </div>
        </div>
        <div className="space-y-6 lg:col-span-3">
          <div className="h-56 animate-pulse rounded-3xl border border-orange-950/30 bg-orange-950/20" />
          <div className="h-72 animate-pulse rounded-3xl border border-orange-950/30 bg-orange-950/20" />
        </div>
      </div>
    </div>
  );
}

function SetupState({ missing }: { missing: string[] }) {
  return (
    <div className="mx-auto max-w-lg px-5 py-16 sm:px-8">
      <div className="rounded-3xl border border-orange-900/50 bg-[#292524]/60 p-8 shadow-xl backdrop-blur-md">
        <h2 className="text-lg font-semibold text-[#fffbeb]">Connect Google Analytics 4</h2>
        <p className="mt-3 text-sm leading-relaxed text-orange-100/60">
          Set the following environment variables for a service account that has <strong className="text-orange-100/90">Viewer</strong> access to your GA4 property. Traffic data is fetched only on the server.
        </p>
        <ul className="mt-6 space-y-2 font-mono text-[12px] text-amber-200/80">
          {missing.map(k => (
            <li key={k} className="rounded-lg bg-black/20 px-3 py-2 ring-1 ring-white/5">
              {k}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-lg px-5 py-16 sm:px-8">
      <div className="rounded-3xl border border-red-900/40 bg-red-950/20 p-8 backdrop-blur-md" role="alert">
        <h2 className="text-lg font-semibold text-red-100">Google Analytics unavailable</h2>
        <p className="mt-3 text-sm text-red-200/80">{message}</p>
      </div>
    </div>
  );
}
