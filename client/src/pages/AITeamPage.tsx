/**
 * /ai-team — standalone showcase of the DaVinci AI operating system (marketing).
 */

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import { useScrollFade } from "@/hooks/useScrollFade";
import { cn } from "@/lib/utils";

import { BOTS, BOT_BY_ID, type BotId, type FilterId } from "@/components/ai-team/bots-data";
import { AITeamFlow } from "@/components/ai-team/AITeamFlow";
import { AITeamLayers } from "@/components/ai-team/AITeamLayers";
import { AITeamModal } from "@/components/ai-team/AITeamModal";
import { AITeamSection } from "@/components/ai-team/AITeamSection";

import "@/components/ai-team/ai-team-page.css";

const PAGE_TITLE = "AI Team | DaVinci Dynamics";
const PAGE_DESCRIPTION =
  "Inside the DaVinci Operating System—specialists for growth, capture, follow-up, operations, and engineering.";
const TELEGRAM_START = "https://t.me/VinciDynamicsBot?start=home";

function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const { ref, isVisible } = useScrollFade();
  return (
    <div ref={ref} className={cn("ai-team-reveal", isVisible && "is-visible", className)}>
      {children}
    </div>
  );
}

function HeroNodeMesh() {
  return (
    <svg
      className="ai-team-hero-mesh pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-[0.35]"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <radialGradient id="ai-hero-rad" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="rgba(34,211,238,0.14)" />
          <stop offset="55%" stopColor="rgba(15,23,42,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#ai-hero-rad)" />
      <g stroke="rgba(56,189,248,0.22)" strokeWidth="0.5" fill="none">
        <line x1="12%" y1="22%" x2="42%" y2="38%" />
        <line x1="42%" y1="38%" x2="68%" y2="28%" />
        <line x1="68%" y1="28%" x2="88%" y2="44%" />
        <line x1="22%" y1="62%" x2="48%" y2="48%" />
        <line x1="48%" y1="48%" x2="72%" y2="58%" />
      </g>
      <g fill="rgba(56,189,248,0.35)">
        <circle cx="12%" cy="22%" r="1.8" />
        <circle cx="42%" cy="38%" r="1.8" />
        <circle cx="68%" cy="28%" r="1.8" />
        <circle cx="88%" cy="44%" r="1.8" />
        <circle cx="22%" cy="62%" r="1.8" />
        <circle cx="48%" cy="48%" r="1.8" />
        <circle cx="72%" cy="58%" r="1.8" />
      </g>
    </svg>
  );
}

export default function AITeamPage() {
  const [filter, setFilter] = useState<FilterId>("all");
  const [modalBotId, setModalBotId] = useState<BotId | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<BotId | null>(null);
  const [hoveredFlowId, setHoveredFlowId] = useState<BotId | null>(null);
  const [flowPinnedId, setFlowPinnedId] = useState<BotId | null>(null);
  const [layerBoostIds, setLayerBoostIds] = useState<Set<BotId> | null>(null);

  const focusId = useMemo(
    () => modalBotId ?? hoveredCardId ?? hoveredFlowId ?? flowPinnedId ?? null,
    [modalBotId, hoveredCardId, hoveredFlowId, flowPinnedId]
  );

  const visibleBots = useMemo(() => {
    if (filter === "all") return BOTS;
    return BOTS.filter(b => b.filterCategory === filter);
  }, [filter]);

  const modalBot = modalBotId ? BOT_BY_ID[modalBotId] : null;

  const onFilterChange = useCallback((next: FilterId) => {
    setFilter(next);
  }, []);

  const onSelectCard = useCallback((id: BotId) => {
    setModalBotId(id);
  }, []);

  const onCloseModal = useCallback(() => {
    setModalBotId(null);
  }, []);

  const onFlowPinToggle = useCallback((id: BotId) => {
    setFlowPinnedId(prev => (prev === id ? null : id));
  }, []);

  const onFlowPinClear = useCallback(() => {
    setFlowPinnedId(null);
  }, []);

  const onLayerHover = useCallback((ids: BotId[] | null) => {
    setLayerBoostIds(ids && ids.length ? new Set(ids) : null);
  }, []);

  const scrollToFlow = () => {
    document.getElementById("ai-team-flow")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="ai-team-os min-h-screen bg-[#02040a] text-white">
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
      </Helmet>

      <Navigation />

      <main className="relative overflow-x-hidden">
        {/* Base depth */}
        <div
          className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(34,211,238,0.12),transparent_55%),radial-gradient(ellipse_60%_40%_at_100%_20%,rgba(59,130,246,0.08),transparent_45%),linear-gradient(180deg,#020617_0%,#02040a_40%,#000_100%)]"
          aria-hidden
        />

        {/* Hero */}
        <section className="relative overflow-hidden pb-16 pt-28 md:pb-24 md:pt-32">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(closest-side_at_50%_35%,rgba(34,211,238,0.14),transparent_68%)]" />
          <HeroNodeMesh />

          <div className="container relative z-10 mx-auto max-w-4xl px-4 text-center">
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/55 md:text-[13px]">
              DaVinci Dynamics
            </p>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-white md:text-5xl lg:text-[3.25rem]">
              Inside the{" "}
              <span className="bg-gradient-to-r from-white via-cyan-100 to-cyan-200/90 bg-clip-text text-transparent">
                DaVinci Operating System
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl font-body text-base leading-relaxed text-white/68 md:text-lg">
              Each specialist handles a different part of the pipeline, from growth and lead capture
              to follow-up, infrastructure, and deployment.
            </p>

            <div className="mx-auto mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={TELEGRAM_START}
                className="group relative inline-flex min-w-[200px] items-center justify-center overflow-hidden rounded-xl border border-cyan-400/35 bg-gradient-to-r from-cyan-500/30 to-blue-600/25 px-8 py-3.5 text-sm font-heading font-semibold tracking-wide text-cyan-50 shadow-[0_0_40px_-8px_rgba(34,211,238,0.55)] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/55 hover:shadow-[0_0_56px_-6px_rgba(34,211,238,0.65)]"
              >
                <span className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
                  <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.12),transparent_55%)]" />
                </span>
                <span className="relative">Start My System</span>
              </a>
              <button
                type="button"
                onClick={scrollToFlow}
                className="inline-flex min-w-[200px] items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] px-8 py-3.5 text-sm font-heading font-semibold tracking-wide text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-md transition duration-300 hover:border-cyan-300/35 hover:text-cyan-50"
              >
                See How It Works
              </button>
            </div>
          </div>
        </section>

        {/* Team grid + filters */}
        <Reveal className="container mx-auto px-4 pb-20 md:pb-28">
          <AITeamSection
            bots={visibleBots}
            filter={filter}
            onFilterChange={onFilterChange}
            focusId={focusId}
            onHoverCard={setHoveredCardId}
            onSelectCard={onSelectCard}
            layerBoostIds={layerBoostIds ?? undefined}
          />
        </Reveal>

        {/* System flow */}
        <Reveal className="border-t border-white/[0.06] bg-black/25 py-20 md:py-28">
          <div className="container mx-auto max-w-6xl px-4" id="ai-team-flow">
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-heading text-xs font-semibold uppercase tracking-[0.26em] text-cyan-200/50">
                Pipeline
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white md:text-4xl">
                How the System Works
              </h2>
              <p className="mt-4 font-body text-sm leading-relaxed text-white/65 md:text-base">
                A calm, deliberate path from demand to qualified motion—each stage routed with
                intent.
              </p>
            </div>
            <div className="mx-auto mt-14 max-w-6xl">
              <AITeamFlow
                focusId={focusId}
                flowPinnedId={flowPinnedId}
                onFlowPinToggle={onFlowPinToggle}
                onFlowPinClear={onFlowPinClear}
                onStepHover={setHoveredFlowId}
              />
            </div>
          </div>
        </Reveal>

        {/* Layers */}
        <Reveal className="container mx-auto px-4 py-20 md:py-28">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.26em] text-cyan-200/50">
              Architecture
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white md:text-4xl">
              The Layers Behind the System
            </h2>
          </div>
          <AITeamLayers onLayerHover={onLayerHover} />
        </Reveal>

        {/* Final CTA */}
        <section className="relative border-t border-white/[0.06] py-24 md:py-32">
          <div className="group/cta container relative mx-auto max-w-3xl px-4 text-center">
            <div
              className="pointer-events-none absolute -left-4 top-0 size-20 rounded-full border border-cyan-400/20 bg-cyan-400/5 blur-[1px] shadow-[0_0_50px_-10px_rgba(34,211,238,0.35)] transition duration-500 group-hover/cta:scale-105 max-md:left-0"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -right-2 bottom-0 size-16 rounded-full border border-blue-400/20 bg-blue-500/5 shadow-[0_0_40px_-8px_rgba(59,130,246,0.35)] transition duration-500 group-hover/cta:scale-105 max-md:right-0"
              aria-hidden
            />
            <h2 className="font-display text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Want This System Behind Your Business?
            </h2>
            <p className="mt-4 font-body text-base leading-relaxed text-white/68">
              Start with Vinci and we&apos;ll map out what needs to be built, fixed, or automated
              first.
            </p>
            <a
              href={TELEGRAM_START}
              className="relative z-10 mt-10 inline-flex items-center justify-center rounded-xl border border-cyan-400/35 bg-gradient-to-r from-cyan-500/25 to-blue-600/20 px-10 py-3.5 text-sm font-heading font-semibold tracking-wide text-cyan-50 shadow-[0_0_44px_-10px_rgba(34,211,238,0.5)] transition duration-300 hover:scale-[1.02] hover:border-cyan-300/55 hover:shadow-[0_0_64px_-8px_rgba(34,211,238,0.6)]"
            >
              Start My System
            </a>
          </div>
        </section>
      </main>

      <AITeamModal bot={modalBot} open={Boolean(modalBot)} onClose={onCloseModal} />
    </div>
  );
}
