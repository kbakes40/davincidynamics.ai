/**
 * DaVinci Dynamics — Home (structured, conversion-focused)
 */

import { Fragment, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Check,
  ArrowRight,
  Monitor,
  Workflow,
  TrendingUp,
  ChevronRight,
  ChevronDown,
  Target,
  LineChart,
} from "lucide-react";
import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import { useLgPricingHover } from "@/hooks/useLgPricingHover";
import { useScrollFade } from "@/hooks/useScrollFade";
import { Helmet } from "react-helmet-async";
import { onTelegramCta } from "@/lib/telegramCtas";
import { cn } from "@/lib/utils";
import { brandPrimaryButton } from "@/lib/brandStyles";

const SITE_TITLE = "DaVinci Dynamics | Fix What's Slowing Your Growth";
const SITE_DESCRIPTION =
  "Most businesses aren't broken, the system behind them is. We build conversion, follow up, and automation systems that turn missed opportunities into real revenue.";
const SITE_URL = "https://www.davincidynamics.ai/";
const OG_IMAGE =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663317811544/PXfURBFNVBolMqns.png";

const CARD_BG =
  "https://private-us-east-1.manuscdn.com/sessionFile/dCGapd5ewVrrofgrkY54Ge/sandbox/MDz8hgGj6z586IAHhYtAJw-img-3_1770941425000_na1fn_Y2FyZC10ZXh0dXJl.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZENHYXBkNWV3VnJyb2ZncmtZNTRHZS9zYW5kYm94L01EejhoZ0dqNno1ODZJQUhoWXRBSnctaW1nLTNfMTc3MDk0MTQyNTAwMF9uYTFmbl9ZMkZ5WkMxMFpYaDBkWEpsLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=NwbO2hSlXZECY4hHxTgt3pwhEz65-RQLXrytXjEqXQcsiu-Naffa03ArEh0nCy0~-o0PVVV6hck6UbEKtR1kFbiII-i9EyI-Vphqpjpg4ZrjiiorMcpC6VNglSA0iVfO4s6VUDYmuxw9EUFhFNdpTx3DnSXUsdQBwMuLUthgKoxBZ~jdP8QcKeiY1rSAEiDquOAf~eV1OD5~aBaCbyYS1JZuTUKRbjYYjt4NbNo4SdL~6efi1BH~PjBhlV3qA9cFh-djHmYi2YGWJUvnBR-lfx49JO6W2Aqa1DT3bu~f8cAggept1WFo~jzOiF0qmt9Xw7tgm68f3i4RycvS-iPgsQ__";

const sectionY = "py-24 md:py-32 lg:py-36";

const cardSurface =
  "rounded-2xl border border-white/[0.08] bg-card/40 backdrop-blur-sm transition-all duration-300 hover:border-accent/25 hover:bg-card/55 hover:shadow-[0_8px_40px_rgba(0,0,0,0.35),0_0_48px_-12px_rgba(0,200,255,0.08)]";

export default function Home() {
  const [, setLocation] = useLocation();
  const { growthHovered, onGrowthEnter, onGrowthLeave } = useLgPricingHover();

  const heroVisualRef = useScrollFade();
  const problemSection = useScrollFade();
  const solutionSection = useScrollFade();
  const trustSection = useScrollFade();
  const servicesSection = useScrollFade();
  const leadSection = useScrollFade();
  const pricingSection = useScrollFade();
  const finalSection = useScrollFade();

  const flowSteps = ["Capture", "Qualify", "Route", "Close"];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "o") {
        event.preventDefault();
        setLocation("/control/login");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <Navigation />
      <Helmet>
        <title>{SITE_TITLE}</title>
        <meta name="description" content={SITE_DESCRIPTION} />
        <meta
          name="keywords"
          content="revenue systems, conversion websites, lead capture, marketing automation, DaVinci Dynamics"
        />
        <link rel="canonical" href={SITE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content={SITE_TITLE} />
        <meta property="og:description" content={SITE_DESCRIPTION} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={SITE_URL} />
        <meta property="twitter:title" content={SITE_TITLE} />
        <meta property="twitter:description" content={SITE_DESCRIPTION} />
        <meta property="twitter:image" content={OG_IMAGE} />
      </Helmet>

      <div className="pointer-events-none absolute inset-0 opacity-90">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_62%_at_50%_-12%,rgba(34,211,238,0.18),transparent_56%),radial-gradient(ellipse_65%_45%_at_92%_12%,rgba(59,130,246,0.1),transparent_50%),linear-gradient(180deg,rgba(2,6,23,0.55)_0%,rgba(2,6,23,0.25)_38%,rgba(2,6,23,0.62)_100%)]" />
        <div className="absolute inset-0 opacity-[0.2] [background-image:linear-gradient(rgba(56,189,248,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />
      </div>

      <main className="relative z-10">
        {/* 1. Hero */}
        <section
          className={cn(
            "container mx-auto min-h-[82vh] px-4 pb-36 pt-28 md:pb-44 md:pt-36 lg:min-h-[88vh] lg:pb-52 lg:pt-40"
          )}
        >
          <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-24">
            <div className="mx-auto max-w-[44rem] text-center lg:mx-0 lg:text-left">
              <div className="mx-auto mb-12 h-px w-20 bg-gradient-to-r from-transparent via-cyan-300/85 to-transparent lg:mx-0" />
              <h1 className="font-display font-black text-4xl leading-[1.05] tracking-tight text-white/92 sm:text-5xl md:text-6xl lg:max-w-[13ch] lg:text-[4rem] xl:text-[4.35rem]">
                Built for{" "}
                <span className="bg-gradient-to-r from-cyan-200 via-cyan-300 to-sky-300 bg-clip-text text-transparent">
                  Revenue
                </span>
                , Not Just Design
              </h1>
              <p className="mt-9 max-w-[34rem] font-heading text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
                We build systems that capture leads, automate follow up, and turn
                more of your business into actual revenue.
              </p>
              <ul className="mx-auto mt-10 inline-block space-y-4 text-left font-heading text-muted-foreground/95 lg:mx-0">
                {[
                  "Capture more leads",
                  "Follow up instantly",
                  "Close more customers",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 justify-center lg:justify-start">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyan-300/35 bg-cyan-400/15 text-cyan-200 shadow-[0_0_20px_-4px_rgba(34,211,238,0.42)]">
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </span>
                    <span className="text-base md:text-lg">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-12 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center lg:justify-start">
                <Button
                  size="lg"
                  className={`${brandPrimaryButton} md:text-lg`}
                  type="button"
                  onClick={onTelegramCta("home")}
                >
                  Start My System
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="default"
                  variant="ghost"
                  className="h-auto px-4 py-3 font-heading text-sm font-medium text-muted-foreground hover:bg-transparent hover:text-cyan-200 md:text-base sm:px-6"
                  onClick={() => setLocation("/pricing")}
                >
                  See Pricing
                </Button>
              </div>
              <p className="mt-10 text-sm font-heading tracking-wide text-muted-foreground/75">
                Takes 30 seconds. No signup required.
              </p>
            </div>

            {/* Right: premium abstract brand visual */}
            <div
              ref={heroVisualRef.ref}
              className={cn(
                "scroll-fade-section relative mx-auto w-full max-w-[34rem] transition-opacity duration-700 lg:max-w-none",
                heroVisualRef.isVisible ? "visible" : ""
              )}
              aria-hidden
            >
              <div className="relative isolate overflow-hidden rounded-[2rem] border border-cyan-300/22 bg-[linear-gradient(160deg,rgba(15,23,42,0.76)_0%,rgba(2,6,23,0.9)_65%,rgba(3,7,18,0.96)_100%)] p-8 shadow-[0_14px_64px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06),0_0_90px_-20px_rgba(34,211,238,0.28)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_64%_at_50%_20%,rgba(34,211,238,0.16),transparent_64%)]" />
                <div className="pointer-events-none absolute -left-16 top-6 h-48 w-48 rounded-full bg-cyan-300/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 right-0 h-56 w-56 rounded-full bg-blue-400/12 blur-3xl" />

                <div className="relative h-[340px] rounded-2xl border border-white/[0.08] bg-[linear-gradient(180deg,rgba(15,23,42,0.5),rgba(2,6,23,0.78))]">
                  <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(56,189,248,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />
                  <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/30 shadow-[0_0_38px_rgba(34,211,238,0.22)]" />
                  <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/45 bg-cyan-300/8 shadow-[0_0_44px_rgba(34,211,238,0.34)]" />
                  <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/20 blur-sm" />
                  <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.95)]" />

                  <div className="absolute left-[50%] top-[50%] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/20" />
                  <div className="absolute left-[50%] top-[50%] h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/10" />

                  <div className="absolute left-[22%] top-[30%] h-2.5 w-2.5 rounded-full bg-cyan-300/90 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
                  <div className="absolute right-[24%] top-[26%] h-2.5 w-2.5 rounded-full bg-cyan-200/85 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
                  <div className="absolute bottom-[28%] left-[26%] h-2.5 w-2.5 rounded-full bg-sky-300/80 shadow-[0_0_12px_rgba(56,189,248,0.72)]" />
                  <div className="absolute bottom-[24%] right-[24%] h-2.5 w-2.5 rounded-full bg-cyan-300/85 shadow-[0_0_12px_rgba(34,211,238,0.76)]" />

                  <svg className="absolute inset-0 h-full w-full">
                    <line x1="22%" y1="30%" x2="50%" y2="50%" stroke="rgba(103,232,249,0.28)" strokeWidth="1" />
                    <line x1="76%" y1="26%" x2="50%" y2="50%" stroke="rgba(103,232,249,0.24)" strokeWidth="1" />
                    <line x1="26%" y1="72%" x2="50%" y2="50%" stroke="rgba(103,232,249,0.22)" strokeWidth="1" />
                    <line x1="76%" y1="76%" x2="50%" y2="50%" stroke="rgba(103,232,249,0.2)" strokeWidth="1" />
                  </svg>

                  <div className="pointer-events-none absolute inset-x-8 bottom-7 h-px bg-gradient-to-r from-transparent via-cyan-300/38 to-transparent" />
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-cyan-300/8 to-transparent" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/60 to-transparent" />
                  <div className="absolute left-1/2 top-[17%] -translate-x-1/2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-100/80">
                    Core Signal
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Problem */}
        <section
          className={cn(
            "border-t border-white/[0.05] bg-card/[0.08]",
            "mt-8 md:mt-12 lg:mt-16",
            sectionY,
            "scroll-fade-section",
            problemSection.isVisible ? "visible" : ""
          )}
          ref={problemSection.ref}
        >
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-14 md:mb-16">
              <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-[2.5rem] text-white/90 mb-5 tracking-tight">
                Most Businesses Don&apos;t Have a Traffic Problem
              </h2>
              <p className="font-heading text-lg md:text-xl text-muted-foreground leading-relaxed">
                They have a system problem.
              </p>
            </div>
            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 lg:gap-8">
              {[
                "Leads go cold",
                "Follow up is inconsistent",
                "Website doesn't convert",
              ].map((title) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/[0.06] bg-background/20 p-7 text-center backdrop-blur-sm md:text-left"
                >
                  <div className="mx-auto md:mx-0 mb-4 h-1 w-10 rounded-full bg-gradient-to-r from-accent/60 to-accent/20" />
                  <h3 className="font-heading font-bold text-lg text-foreground">{title}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Solution */}
        <section
          ref={solutionSection.ref}
          className={cn(
            "container mx-auto px-4",
            sectionY,
            "scroll-fade-section",
            solutionSection.isVisible ? "visible" : ""
          )}
        >
          <div className="max-w-3xl mx-auto text-center mb-14 md:mb-16">
            <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-[2.5rem] text-foreground tracking-tight">
              We Fix the System Behind Your Business
            </h2>
          </div>
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: Target,
                title: "Capture",
                line: "Turn visitors into qualified leads with clear offers and fast capture.",
              },
              {
                icon: LineChart,
                title: "Convert",
                line: "Sharpen pages and follow up so more conversations become revenue.",
              },
              {
                icon: Workflow,
                title: "Automate",
                line: "Route, remind, and nurture so nothing slips when you are busy.",
              },
            ].map(({ icon: Icon, title, line }) => (
              <div key={title} className={cn(cardSurface, "p-8 lg:p-9 flex flex-col items-center md:items-start text-center md:text-left")}>
                <div className="mb-5 rounded-xl border border-accent/20 bg-accent/10 p-3 shadow-[0_0_24px_-8px_rgba(0,200,255,0.35)]">
                  <Icon className="w-7 h-7 text-accent" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading font-bold text-xl text-foreground mb-3">{title}</h3>
                <p className="font-heading text-sm md:text-base text-muted-foreground leading-relaxed">
                  {line}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Flow — From first click to closed revenue */}
        <section
          ref={trustSection.ref}
          className={cn(
            "border-t border-white/[0.05] bg-card/[0.08]",
            sectionY,
            "scroll-fade-section",
            trustSection.isVisible ? "visible" : ""
          )}
        >
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12 md:mb-16">
              <h2 className="font-display font-bold text-2xl md:text-3xl lg:text-4xl text-foreground mb-6 tracking-tight">
                From First Click to Closed Revenue
              </h2>
              <p className="font-heading text-muted-foreground text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
                Every layer we ship — site, automations, and follow up — is wired so
                opportunities move forward instead of stalling.
              </p>
            </div>
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col lg:flex-row lg:flex-nowrap lg:items-center lg:justify-center gap-0">
                {flowSteps.map((label, i) => (
                  <Fragment key={label}>
                    <div
                      className={cn(
                        "w-full max-w-sm mx-auto lg:mx-0 lg:flex-1 lg:min-w-0 rounded-2xl border border-accent/15 bg-background/40 backdrop-blur-sm px-6 py-5 md:py-6 text-center",
                        "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300",
                        "hover:border-accent/35 hover:bg-background/55 hover:shadow-[0_0_40px_-12px_rgba(0,200,255,0.15)]"
                      )}
                    >
                      <span className="text-[10px] font-heading uppercase tracking-widest text-accent/80 mb-1 block">
                        Step {i + 1}
                      </span>
                      <span className="font-display font-bold text-lg md:text-xl text-foreground">
                        {label}
                      </span>
                    </div>
                    {i < flowSteps.length - 1 && (
                      <>
                        <div
                          className="hidden lg:flex shrink-0 items-center justify-center self-center px-0.5 xl:px-2 text-accent/45"
                          aria-hidden
                        >
                          <ChevronRight
                            className="w-6 h-6 xl:w-7 xl:h-7 drop-shadow-[0_0_8px_rgba(0,200,255,0.35)]"
                            strokeWidth={1.5}
                          />
                        </div>
                        <div className="flex lg:hidden justify-center py-2 text-accent/40" aria-hidden>
                          <ChevronDown className="w-5 h-5" strokeWidth={1.5} />
                        </div>
                      </>
                    )}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. Core services */}
        <section
          ref={servicesSection.ref}
          className={cn(
            "container mx-auto px-4",
            sectionY,
            "scroll-fade-section",
            servicesSection.isVisible ? "visible" : ""
          )}
        >
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {[
                {
                  icon: Monitor,
                  title: "Revenue Focused Websites",
                  body: "Built to convert visitors into qualified leads and customers.",
                },
                {
                  icon: Workflow,
                  title: "Automation and Follow Up",
                  body: "Capture leads, respond faster, and keep opportunities moving.",
                },
                {
                  icon: TrendingUp,
                  title: "Growth Systems",
                  body: "Funnels, routing, and business infrastructure designed to scale.",
                },
              ].map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className={cn(
                    cardSurface,
                    "p-8 lg:p-9 flex flex-col items-start text-left"
                  )}
                >
                  <Icon className="w-7 h-7 text-accent mb-5 opacity-90" strokeWidth={1.5} />
                  <h3 className="font-heading font-bold text-lg text-foreground mb-3">
                    {title}
                  </h3>
                  <p className="font-heading text-sm md:text-base text-muted-foreground leading-relaxed">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Lead capture */}
        <section
          id="lead-capture"
          ref={leadSection.ref}
          className={cn(
            "container mx-auto px-4",
            sectionY,
            "scroll-fade-section",
            leadSection.isVisible ? "visible" : ""
          )}
        >
          <div className="max-w-3xl mx-auto text-center rounded-2xl border border-accent/25 bg-accent/[0.06] backdrop-blur-sm px-6 py-14 md:px-12 md:py-16 shadow-[0_0_60px_-20px_rgba(0,200,255,0.2)]">
            <h2 className="font-display font-bold text-2xl md:text-3xl lg:text-4xl text-foreground mb-5 tracking-tight">
              See What&apos;s Slowing Growth
            </h2>
            <p className="font-heading text-muted-foreground text-base md:text-lg leading-relaxed mb-10 max-w-xl mx-auto">
              Get a clear breakdown of where your business may be losing leads,
              hurting conversion, or missing automation opportunities.
            </p>
            <Button
              size="lg"
              className={brandPrimaryButton}
              type="button"
              onClick={onTelegramCta("audit")}
            >
              Get Your System Breakdown
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </section>

        {/* 7. Pricing preview */}
        <section
          ref={pricingSection.ref}
          className={cn(
            "border-t border-white/[0.05] bg-card/[0.06]",
            sectionY,
            "scroll-fade-section",
            pricingSection.isVisible ? "visible" : ""
          )}
        >
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
            <div
              className="pointer-events-none absolute left-1/2 top-[38%] h-[min(440px,58vh)] w-[min(880px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_72%_65%_at_50%_50%,rgba(0,200,255,0.09),transparent_70%)] blur-[72px] opacity-70"
              aria-hidden
            />
            <div className="relative z-[1]">
              <div className="text-center mb-12 md:mb-14 lg:mb-16 max-w-3xl mx-auto">
                <h2 className="font-display font-black text-2xl md:text-3xl lg:text-[2.25rem] leading-[1.12] tracking-tight text-foreground mb-4 md:mb-5">
                  Choose the System That Fits Your Growth Stage
                </h2>
                <p className="font-heading text-base md:text-lg text-muted-foreground/80 font-normal max-w-2xl mx-auto leading-relaxed">
                  Every build is designed to convert, automate, and scale your
                  business, not just launch a website.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 lg:gap-10 mb-10 lg:mb-12">
                {/* Starter */}
                <div
                  className={cn(
                    "group/starter relative flex flex-col overflow-hidden rounded-xl p-7 md:p-8",
                    "border border-white/[0.08] bg-card/45 backdrop-blur-md",
                    "shadow-[0_4px_28px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.06)]",
                    "before:pointer-events-none before:absolute before:inset-x-4 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/18 before:to-transparent",
                    "transition-all duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
                    "lg:hover:-translate-y-1.5 lg:hover:shadow-[0_16px_48px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,255,255,0.08)]",
                    growthHovered && "lg:opacity-[0.68] lg:scale-[0.985]"
                  )}
                  style={{
                    backgroundImage: `url('${CARD_BG}')`,
                    backgroundSize: "cover",
                  }}
                >
                  <h3 className="font-heading text-lg font-bold tracking-tight text-foreground md:text-xl mb-3">
                    Starter
                  </h3>
                  <div className="mb-4">
                    <p className="font-display text-3xl font-black tracking-tight text-accent drop-shadow-[0_0_24px_rgba(0,217,255,0.12)] md:text-4xl">
                      $1,500
                    </p>
                  </div>
                  <p className="mb-6 text-sm font-heading leading-relaxed text-muted-foreground/90">
                    Perfect for businesses that need a clean, conversion ready
                    foundation.
                  </p>
                  <ul className="mb-6 flex-grow space-y-3">
                    {[
                      "Conversion focused website",
                      "Lead capture setup",
                      "Basic automation",
                      "Mobile optimized design",
                    ].map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2.5 text-sm leading-snug text-foreground/95 font-heading"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent/90" strokeWidth={2} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mb-0 text-center text-[11px] font-heading leading-relaxed text-muted-foreground/65">
                    Built to launch fast and start capturing leads
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6 h-12 w-full rounded-lg border border-accent/35 font-heading text-sm font-semibold text-accent shadow-sm transition-all duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:bg-accent/10 lg:hover:border-accent/55 lg:hover:shadow-[0_0_18px_rgba(0,200,255,0.12)]"
                    type="button"
                    onClick={onTelegramCta("pricing")}
                  >
                    Book Your Strategy Call
                  </Button>
                </div>

                {/* Growth — featured */}
                <div
                  className={cn(
                    "group/growth relative z-[2] flex flex-col overflow-visible rounded-xl px-7 pb-7 pt-10 md:px-8 md:pb-8 md:pt-11",
                    "border border-cyan-400/40 bg-card/55 backdrop-blur-md",
                    "shadow-[0_0_0_1px_rgba(0,200,255,0.14),0_8px_36px_rgba(0,0,0,0.42),0_0_100px_-28px_rgba(0,200,255,0.18)]",
                    "before:pointer-events-none before:absolute before:inset-x-4 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-cyan-400/45 before:to-transparent",
                    "transition-all duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
                    "lg:scale-[1.035]",
                    "lg:hover:-translate-y-2 lg:hover:scale-[1.055] lg:hover:border-cyan-400/65",
                    "lg:hover:shadow-[0_0_0_1px_rgba(0,200,255,0.28),0_22px_56px_rgba(0,0,0,0.55),0_0_120px_-24px_rgba(0,200,255,0.22)]"
                  )}
                  onMouseEnter={onGrowthEnter}
                  onMouseLeave={onGrowthLeave}
                  style={{
                    backgroundImage: `url('${CARD_BG}')`,
                    backgroundSize: "cover",
                  }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-b from-[rgba(0,200,255,0.07)] via-transparent to-transparent opacity-0 transition-opacity duration-500 ease-out lg:group-hover/growth:opacity-100"
                    aria-hidden
                  />
                  <div
                    className="absolute left-1/2 top-[-11px] z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/20 px-4 py-1.5 text-[11px] font-heading font-semibold tracking-wide text-white/95 shadow-[0_2px_16px_rgba(0,200,255,0.35),0_0_32px_rgba(0,200,255,0.12)]"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(0,214,255,0.92) 0%, rgba(0,165,230,0.88) 50%, rgba(0,130,210,0.9) 100%)",
                    }}
                  >
                    Most Popular
                  </div>
                  <h3 className="font-heading text-lg font-bold tracking-tight text-foreground md:text-xl mb-3">
                    Growth
                  </h3>
                  <div className="mb-4">
                    <p className="font-display text-3xl font-black tracking-tight text-accent drop-shadow-[0_0_28px_rgba(0,217,255,0.18)] md:text-4xl">
                      $3,000
                    </p>
                  </div>
                  <p className="mb-6 text-sm font-heading leading-relaxed text-muted-foreground/90">
                    For businesses ready to scale with better systems and follow
                    up.
                  </p>
                  <ul className="mb-6 flex-grow space-y-3">
                    {[
                      "Everything in Starter",
                      "Funnel structure",
                      "Automated follow up system",
                      "Lead routing logic",
                      "Conversion optimization",
                    ].map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2.5 text-sm leading-snug text-foreground/95 font-heading"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent/90" strokeWidth={2} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mb-0 text-center text-[11px] font-heading leading-relaxed text-muted-foreground/65">
                    Designed to turn traffic into consistent customers
                  </p>
                  <Button
                    className="relative z-10 mt-6 h-12 w-full rounded-lg bg-accent font-heading text-sm font-bold text-background shadow-[0_2px_16px_rgba(0,200,255,0.38),inset_0_1px_0_rgba(255,255,255,0.22)] transition-all duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:bg-accent/92 hover:shadow-[0_4px_22px_rgba(0,200,255,0.45),inset_0_1px_0_rgba(255,255,255,0.26)] lg:group-hover/growth:shadow-[0_4px_26px_rgba(0,200,255,0.48),inset_0_1px_0_rgba(255,255,255,0.28)]"
                    type="button"
                    onClick={onTelegramCta("pricing")}
                  >
                    Book Your Strategy Call
                  </Button>
                </div>

                {/* Scale */}
                <div
                  className={cn(
                    "group/scale relative flex flex-col overflow-hidden rounded-xl p-7 md:p-8",
                    "border border-white/[0.08] bg-card/45 backdrop-blur-md",
                    "shadow-[0_4px_28px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.06)]",
                    "before:pointer-events-none before:absolute before:inset-x-4 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/18 before:to-transparent",
                    "transition-all duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
                    "lg:hover:-translate-y-1.5 lg:hover:shadow-[0_16px_48px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,255,255,0.08)]",
                    growthHovered && "lg:opacity-[0.68] lg:scale-[0.985]"
                  )}
                  style={{
                    backgroundImage: `url('${CARD_BG}')`,
                    backgroundSize: "cover",
                  }}
                >
                  <h3 className="font-heading text-lg font-bold tracking-tight text-foreground md:text-xl mb-3">
                    Scale
                  </h3>
                  <div className="mb-4">
                    <p className="font-display text-3xl font-black tracking-tight text-accent drop-shadow-[0_0_24px_rgba(0,217,255,0.12)] md:text-4xl">
                      $5,000+
                    </p>
                  </div>
                  <p className="mb-6 text-sm font-heading leading-relaxed text-muted-foreground/90">
                    For businesses that want a full revenue system built to scale.
                  </p>
                  <ul className="mb-6 flex-grow space-y-3">
                    {[
                      "Everything in Growth",
                      "Advanced automation workflows",
                      "CRM pipeline setup",
                      "Reporting and tracking systems",
                      "Custom system architecture",
                    ].map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2.5 text-sm leading-snug text-foreground/95 font-heading"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent/90" strokeWidth={2} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mb-0 text-center text-[11px] font-heading leading-relaxed text-muted-foreground/65">
                    Built for performance, automation, and long term growth
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6 h-12 w-full rounded-lg border border-accent/35 font-heading text-sm font-semibold text-accent shadow-sm transition-all duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:bg-accent/10 lg:hover:border-accent/55 lg:hover:shadow-[0_0_18px_rgba(0,200,255,0.12)]"
                    type="button"
                    onClick={onTelegramCta("pricing")}
                  >
                    Book Your Strategy Call
                  </Button>
                </div>
              </div>

              <div className="mx-auto mt-4 max-w-3xl border-t border-white/[0.06] px-4 pt-10 md:pt-12">
                <p className="text-center text-sm font-heading leading-relaxed text-muted-foreground/85">
                  Every system is customized based on your business. Final scope and
                  pricing may vary depending on complexity and goals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Final CTA */}
        <section
          ref={finalSection.ref}
          className={cn(
            "container mx-auto px-4 pt-12 pb-28 md:pb-36",
            "scroll-fade-section",
            finalSection.isVisible ? "visible" : ""
          )}
        >
          <div className="max-w-2xl mx-auto text-center rounded-2xl border border-white/[0.08] bg-card/30 backdrop-blur-sm px-8 py-14 md:py-16 shadow-[0_0_80px_-30px_rgba(0,200,255,0.15)]">
            <h2 className="font-display font-bold text-2xl md:text-3xl lg:text-4xl text-foreground mb-8 tracking-tight">
              Let&apos;s Fix What&apos;s Slowing Your Growth
            </h2>
            <Button
              size="lg"
              className={`${brandPrimaryButton} md:text-lg`}
              type="button"
              onClick={onTelegramCta("home")}
            >
              Start My System
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
