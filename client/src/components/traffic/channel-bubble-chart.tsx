"use client";

import type { TrafficChannelRow } from "@/lib/traffic/types";
import { trafficCard, trafficKicker, trafficMuted } from "./traffic-styles";

const PALETTE = [
  { fill: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)", ring: "rgba(251, 146, 60, 0.45)" },
  { fill: "linear-gradient(135deg, #d97706 0%, #b45309 100%)", ring: "rgba(252, 211, 77, 0.4)" },
  { fill: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", ring: "rgba(254, 215, 170, 0.35)" },
  { fill: "linear-gradient(135deg, #92400e 0%, #78350f 100%)", ring: "rgba(180, 83, 9, 0.5)" },
  { fill: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", ring: "rgba(251, 191, 36, 0.4)" },
  { fill: "linear-gradient(135deg, #b45309 0%, #92400e 100%)", ring: "rgba(251, 146, 60, 0.35)" },
];

type Props = {
  title: string;
  channels: TrafficChannelRow[];
  mode: "sessions" | "users";
  dateRangeLabel: string;
};

export function ChannelBubbleChart({ title, channels, mode, dateRangeLabel }: Props) {
  const list = Array.isArray(channels) ? channels : [];
  const maxSize = list.length ? Math.max(...list.map(c => (mode === "sessions" ? c.sessions : c.users)), 1) : 1;

  return (
    <div className={`${trafficCard} p-5 sm:p-6`}>
      <p className={trafficKicker}>{title}</p>
      <p className={`mt-1 ${trafficMuted}`}>{dateRangeLabel}</p>
      {list.length === 0 ? (
        <p className="py-10 text-center text-sm text-orange-200/40" role="status">
          No channel breakdown for this period.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-center gap-3 py-6 sm:gap-4">
            {list.slice(0, 8).map((ch, i) => {
              const raw = mode === "sessions" ? ch.sessions : ch.users;
              const v = Number.isFinite(raw) ? raw : 0;
              const size = 36 + (v / maxSize) * 48;
              const style = PALETTE[i % PALETTE.length]!;
              return (
                <div
                  key={`${ch.channel}-${i}`}
                  className="group relative flex items-center justify-center rounded-full transition-transform duration-200 ease-out hover:scale-[1.04]"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    background: style.fill,
                    boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.12), 0 0 0 1px ${style.ring}`,
                  }}
                  title={`${ch.channel}: ${mode === "sessions" ? ch.sessions : ch.users}`}
                >
                  <span className="max-w-[90%] truncate px-1 text-center text-[9px] font-semibold uppercase tracking-wider text-white/95">
                    {ch.channel.slice(0, 3)}
                  </span>
                  <div className="pointer-events-none absolute -bottom-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-orange-900/60 bg-[#292524]/95 px-2.5 py-1 text-[10px] text-amber-50 opacity-0 shadow-lg backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
                    {ch.channel}
                    <span className="block text-[9px] text-orange-200/70">
                      {ch.sessions.toLocaleString("en-US")} sess. - {ch.users.toLocaleString("en-US")} users
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2 border-t border-white/[0.06] pt-4">
            {list.slice(0, 8).map((ch, i) => {
              const style = PALETTE[i % PALETTE.length]!;
              return (
                <div key={`${ch.channel}-leg-${i}`} className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full ring-1 ring-white/15" style={{ background: style.ring }} />
                  <span className="text-[10px] font-medium text-orange-200/55">{ch.channel}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
