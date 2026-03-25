const STATUSES = [
  "Lead Captured",
  "Follow Up Sent",
  "System Synced",
  "Validation Passed",
  "Deployment Live",
];

/** Thin live-ops strip below the hero. */
export function AITeamLiveStrip() {
  const doubled = [...STATUSES, ...STATUSES];
  return (
    <div
      className="ai-team-live-strip pointer-events-none relative mx-auto mt-14 max-w-5xl overflow-hidden border-y border-white/[0.06] bg-black/40 px-4 py-2.5 backdrop-blur-sm"
      aria-hidden
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.55)_0%,transparent_12%,transparent_88%,rgba(0,0,0,0.55)_100%)]" />
      <div className="ai-team-live-strip__track flex w-max gap-12 pl-4">
        {doubled.map((label, i) => (
          <span
            key={`${label}-${i}`}
            className="font-heading text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40"
          >
            <span className="ai-team-live-strip__dot mr-2 inline-block size-1 rounded-full bg-cyan-400/50 align-middle" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
