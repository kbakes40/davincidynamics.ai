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
import { AITeamLiveStrip } from "@/components/ai-team/AITeamLiveStrip";
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
      className="ai-team-hero-mesh pointer-events-none absolute inset-0 h-full w-full opacity-[0.42]"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <radialGradient id="ai-hero-rad" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stopColor="rgba(34,211,238,0.16)" />
          <stop offset="40%" stopColor="rgba(99,102,241,0.08)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <pattern id="ai-hero-grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path
            d="M 48 0 L 0 0 0 48"
            fill="none"
            stroke="rgba(56,189,248,0.07)"
            strokeWidth="0.5"
          />
        </pattern>
        <radialGradient id="ai-hero-node-soft" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(165,243,252,0.9)" />
          <stop offset="100%" stopColor="rgba(56,189,248,0)" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#ai-hero-rad)" />
      <rect width="100%" height="100%" fill="url(#ai-hero-grid)" className="ai-team-hero-grid-field" />
      <g stroke="rgba(56,189,248,0.26)" strokeWidth="0.5" fill="none">
        <line x1="10%" y1="20%" x2="40%" y2="36%" />
        <line x1="40%" y1="36%" x2="70%" y2="26%" />
        <line x1="70%" y1="26%" x2="90%" y2="42%" />
        <line x1="18%" y1="64%" x2="46%" y2="50%" />
        <line x1="46%" y1="50%" x2="74%" y2="58%" />
        <line x1="52%" y1="12%" x2="62%" y2="28%" />
      </g>
      <g>
        <circle cx="10%" cy="20%" r="2.2" fill="url(#ai-hero-node-soft)" opacity="0.5" />
        <circle cx="40%" cy="36%" r="2.2" fill="url(#ai-hero-node-soft)" opacity="0.5" />
        <circle cx="70%" cy="26%" r="2.2" fill="url(#ai-hero-node-soft)" opacity="0.5" />
        <circle cx="90%" cy="42%" r="2.2" fill="url(#ai-hero-node-soft)" opacity="0.5" />
        <circle cx="18%" cy="64%" r="2.2" fill="url(#ai-hero-node-soft)" opacity="0.5" />
        <circle cx="46%" cy="50%" r="2.2" fill="url(#ai-hero-node-soft)" opacity="0.5" />
        <circle cx="74%" cy="58%" r="2.5" fill="url(#ai-hero-node-soft)" opacity="0.5" />
        <circle cx="52%" cy="12%" r="1.8" fill="rgba(167,139,250,0.45)" />
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
        {/* Global motif: faint diagonal data lines */}
        <div
          className="ai-team-motif-diagonal pointer-events-none fixed inset-0 -z-20 opacity-50"
          aria-hidden
        />

        {/* Base depth */}
        <div
          className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(34,211,238,0.12),transparent_55%),radial-gradient(ellipse_60%_40%_at_100%_20%,rgba(59,130,246,0.08),transparent_45%),linear-gradient(180deg,#020617_0%,#02040a_40%,#000_100%)]"
          aria-hidden
        />

        {/* Hero shell: pointer-events-none so wheel isn’t trapped by overflow-hidden (non-scrollable scrollport). */}
        <section className="pointer-events-none relative overflow-hidden pb-6 pt-28 md:pb-8 md:pt-32">
          {/* Cinematic hero field: parallax drift + stronger headline glow */}
          <div className="ai-team-hero-parallax pointer-events-none absolute -inset-[22%] -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_62%_48%_at_50%_30%,rgba(56,189,248,0.2),rgba(99,102,241,0.09)_42%,transparent_72%)]" />
            <HeroNodeMesh />
          </div>
          <div className="pointer-events-none absolute inset-0 -z-[8] bg-[radial-gradient(ellipse_120%_70%_at_50%_-15%,rgba(15,23,42,0.5),transparent_55%)]" />

          <div className="ai-team-headline-halo pointer-events-none absolute left-1/2 top-[26%] -z-[6] h-[min(480px,58vw)] w-[min(920px,96%)] max-w-[1100px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(34,211,238,0.26),rgba(99,102,241,0.14)_42%,transparent_100%)] blur-2xl md:blur-3xl" />

          <div className="container pointer-events-auto relative z-10 mx-auto max-w-4xl px-4 text-center">
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/65 md:text-[13px]">
              DaVinci Dynamics
            </p>
            <h1 className="relative mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-white drop-shadow-[0_2px_28px_rgba(0,0,0,0.45)] md:text-5xl lg:text-[3.25rem]">
              Inside the{" "}
              <span className="relative inline-block bg-gradient-to-r from-white via-cyan-100 to-cyan-200/90 bg-clip-text text-transparent">
                DaVinci Operating System
                <span className="pointer-events-none absolute -inset-4 -z-10 rounded-2xl bg-[radial-gradient(closest-side,rgba(34,211,238,0.12),transparent_85%)] opacity-90 blur-md" />
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl font-body text-base leading-relaxed text-white/74 md:text-lg">
              Each specialist handles a different part of the pipeline, from growth and lead capture
              to follow-up, infrastructure, and deployment.
            </p>

            <div className="mx-auto mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={TELEGRAM_START}
                className="group relative inline-flex min-w-[200px] items-center justify-center overflow-hidden rounded-xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/35 to-blue-600/28 px-8 py-3.5 text-sm font-heading font-semibold tracking-wide text-cyan-50 shadow-[0_0_48px_-10px_rgba(34,211,238,0.6)] transition duration-300 hover:-translate-y-1 hover:border-cyan-300/55 hover:shadow-[0_0_64px_-8px_rgba(34,211,238,0.72)]"
              >
                <span className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
                  <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.14),transparent_55%)]" />
                </span>
                <span className="relative">Start My System</span>
              </a>
              <button
                type="button"
                onClick={scrollToFlow}
                className="inline-flex min-w-[200px] items-center justify-center rounded-xl border border-white/18 bg-white/[0.05] px-8 py-3.5 text-sm font-heading font-semibold tracking-wide text-white/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:text-cyan-50"
              >
                See How It Works
              </button>
            </div>
          </div>

          <AITeamLiveStrip />
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
        <Reveal className="relative border-t border-white/[0.08] bg-[linear-gradient(180deg,rgba(0,0,0,0.35)_0%,rgba(2,6,14,0.5)_100%)] py-20 md:py-28">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35] ai-team-motif-diagonal"
            aria-hidden
          />
          <div className="container relative mx-auto max-w-6xl px-4" id="ai-team-flow">
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-heading text-xs font-semibold uppercase tracking-[0.26em] text-cyan-200/55">
                Pipeline
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white md:text-4xl">
                How the System Works
              </h2>
              <p className="mt-4 font-body text-sm leading-relaxed text-white/68 md:text-base">
                A calm, deliberate path from demand to qualified motion—each stage routed with
                intent.
              </p>
            </div>
            <div className="relative mx-auto mt-14 max-w-6xl">
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
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.26em] text-cyan-200/55">
              Architecture
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white md:text-4xl">
              The Layers Behind the System
            </h2>
          </div>
          <AITeamLayers onLayerHover={onLayerHover} />
        </Reveal>

        {/* Final CTA — isolated band + stronger glow */}
        <section className="relative isolate mt-4 border-t border-white/[0.1] py-28 md:py-40">
          <div
            className="ai-team-cta-glow-pulse pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_95%_65%_at_50%_45%,rgba(34,211,238,0.16),rgba(99,102,241,0.07)_45%,transparent_72%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[min(900px,100%)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(34,211,238,0.12),transparent_100%)] blur-3xl"
            aria-hidden
          />

          <div className="group/cta container relative mx-auto max-w-3xl px-4 text-center">
            <div
              className="ai-team-cta-float-node pointer-events-none absolute -left-2 top-4 size-[5.5rem] rounded-full border border-cyan-400/25 bg-cyan-400/[0.07] blur-[0.5px] shadow-[0_0_60px_-12px_rgba(34,211,238,0.45)] transition duration-500 group-hover/cta:scale-105 md:-left-6"
              aria-hidden
            />
            <div
              className="ai-team-cta-float-node pointer-events-none absolute -right-3 bottom-8 size-[4.25rem] rounded-full border border-indigo-400/25 bg-indigo-500/[0.08] shadow-[0_0_50px_-10px_rgba(129,140,248,0.4)] transition duration-500 [animation-delay:0.5s] group-hover/cta:scale-105 md:-right-6"
              aria-hidden
            />
            {/* Small orbital accent */}
            <div
              className="pointer-events-none absolute left-[12%] top-1/2 size-24 -translate-y-1/2 rounded-full border border-cyan-400/10 opacity-50"
              style={{ clipPath: "ellipse(45% 50% at 50% 50%)" }}
              aria-hidden
            />

            <h2 className="relative z-[1] font-display text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Want This System Behind Your Business?
            </h2>
            <p className="relative z-[1] mt-4 max-w-xl mx-auto font-body text-base leading-relaxed text-white/72">
              Start with Vinci and we&apos;ll map out what needs to be built, fixed, or automated
              first.
            </p>
            <a
              href={TELEGRAM_START}
              className="relative z-[1] mt-12 inline-flex min-w-[220px] items-center justify-center rounded-xl border border-cyan-300/45 bg-gradient-to-r from-cyan-500/35 to-blue-600/28 px-12 py-4 text-base font-heading font-semibold tracking-wide text-white shadow-[0_0_56px_-12px_rgba(34,211,238,0.55),inset_0_1px_0_rgba(255,255,255,0.12)] transition duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-cyan-200/55 hover:shadow-[0_0_80px_-10px_rgba(34,211,238,0.65)]"
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
