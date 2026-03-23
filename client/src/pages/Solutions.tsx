/**
 * Solutions — revenue systems, conversion-focused (aligned with Home)
 */

import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Monitor, Workflow, TrendingUp, Building2, Radio, Wrench, ShoppingBag } from "lucide-react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { onTelegramCta } from "@/lib/telegramCtas";

const PAGE_TITLE = "Solutions | DaVinci Dynamics";
const PAGE_DESCRIPTION =
  "Conversion-focused websites, automation, and growth infrastructure that turn traffic into customers. Book a strategy call.";

const CARD_BG =
  "https://private-us-east-1.manuscdn.com/sessionFile/dCGapd5ewVrrofgrkY54Ge/sandbox/MDz8hgGj6z586IAHhYtAJw-img-3_1770941425000_na1fn_Y2FyZC10ZXh0dXJl.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZENHYXBkNWV3VnJyb2ZncmtZNTRHZS9zYW5kYm94L01EejhoZ0dqNno1ODZJQUhoWXRBSnctaW1nLTNfMTc3MDk0MTQyNTAwMF9uYTFmbl9ZMkZ5WkMxMFpYaDBkWEpsLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=NwbO2hSlXZECY4hHxTgt3pwhEz65-RQLXrytXjEqXQcsiu-Naffa03ArEh0nCy0~-o0PVVV6hck6UbEKtR1kFbiII-i9EyI-Vphqpjpg4ZrjiiorMcpC6VNglSA0iVfO4s6VUDYmuxw9EUFhFNdpTx3DnSXUsdQBwMuLUthgKoxBZ~jdP8QcKeiY1rSAEiDquOAf~eV1OD5~aBaCbyYS1JZuTUKRbjYYjt4NbNo4SdL~6efi1BH~PjBhlV3qA9cFh-djHmYi2YGWJUvnBR-lfx49JO6W2Aqa1DT3bu~f8cAggept1WFo~jzOiF0qmt9Xw7tgm68f3i4RycvS-iPgsQ__";

const solutions = [
  {
    icon: Monitor,
    title: "Revenue Focused Websites",
    description:
      "Websites built to do more than look good. Designed to capture leads, guide action, and convert visitors into real opportunities.",
    bullets: [
      "Conversion focused design",
      "Mobile optimized experience",
      "Clear lead capture flow",
      "Built for speed and trust",
    ],
  },
  {
    icon: Workflow,
    title: "Automation and Follow Up",
    description:
      "Automation systems that help your business respond faster, stay organized, and keep leads moving without constant manual work.",
    bullets: [
      "Lead capture automation",
      "Follow up workflows",
      "Routing and notifications",
      "Operational efficiency",
    ],
  },
  {
    icon: TrendingUp,
    title: "Growth Infrastructure",
    description:
      "The backend systems that support cleaner scaling, better lead handling, and more consistent customer flow.",
    bullets: [
      "Funnels and customer paths",
      "CRM setup and pipeline flow",
      "Qualification logic",
      "Reporting and tracking",
    ],
  },
] as const;

const audiences = [
  {
    icon: Building2,
    title: "Small Businesses",
    body: "Improve conversion, lead capture, and follow up with a stronger digital foundation.",
  },
  {
    icon: Radio,
    title: "Telecom and Dealer Operations",
    body: "Streamline recruitment, qualification, routing, and onboarding systems.",
  },
  {
    icon: Wrench,
    title: "Service Businesses",
    body: "Capture more inquiries, improve response speed, and reduce missed opportunities.",
  },
  {
    icon: ShoppingBag,
    title: "Ecommerce Brands",
    body: "Support growth through stronger conversion paths, automation, and better customer flow.",
  },
] as const;

const steps = [
  {
    title: "Break Down the Gaps",
    body: "We identify where your current system is losing leads, hurting conversion, or creating friction.",
  },
  {
    title: "Build the Right System",
    body: "We design the structure, pages, automation, and flow around your business goals.",
  },
  {
    title: "Launch and Optimize",
    body: "Once live, the system is built to support growth, cleaner operations, and stronger lead performance.",
  },
] as const;

export default function Solutions() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <Navigation />
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
      </Helmet>

      <div
        className="absolute inset-0 opacity-[0.18] pointer-events-none"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <main className="relative z-10">
        {/* Hero */}
        <section className="container mx-auto px-4 pt-20 pb-16 md:pt-28 md:pb-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mb-10 opacity-80" />
            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl leading-[1.08] tracking-tight text-foreground mb-8">
              Solutions Built to Capture, Convert, and Scale
            </h1>
            <p className="font-heading text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed mb-12 max-w-2xl mx-auto">
              From conversion focused websites to automation and lead systems,
              every solution is designed to help your business turn traffic into
              customers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center">
              <Button
                size="lg"
                className="bg-accent text-background hover:bg-accent/90 font-heading font-bold text-base md:text-lg px-8 py-6 h-auto neon-glow"
                type="button"
                onClick={onTelegramCta("solutions")}
              >
                Book Your Strategy Call
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-accent/40 text-accent hover:bg-accent/10 hover:border-accent font-heading font-semibold text-base md:text-lg px-8 py-6 h-auto bg-background/30 backdrop-blur-sm"
                onClick={() => setLocation("/pricing")}
              >
                See Pricing
              </Button>
            </div>
          </div>
        </section>

        {/* Intro */}
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-2xl mx-auto text-center border-y border-accent/15 py-12 md:py-14">
            <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-5 tracking-tight">
              Built Around Revenue, Not Just Design
            </h2>
            <p className="font-heading text-muted-foreground text-base md:text-lg leading-relaxed">
              Most businesses do not need more digital clutter. They need better
              systems. DaVinci Dynamics builds solutions that improve lead flow,
              follow up, conversion, and growth infrastructure.
            </p>
          </div>
        </section>

        {/* Solutions grid */}
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 lg:gap-8">
            {solutions.map(({ icon: Icon, title, description, bullets }) => (
              <div
                key={title}
                className="rounded-2xl border border-accent/20 p-8 flex flex-col backdrop-blur-sm text-left"
                style={{
                  backgroundImage: `url('${CARD_BG}')`,
                  backgroundSize: "cover",
                }}
              >
                <Icon className="w-7 h-7 text-accent mb-5 shrink-0" strokeWidth={1.5} />
                <h3 className="font-heading font-bold text-xl text-foreground mb-3">
                  {title}
                </h3>
                <p className="font-heading text-sm text-muted-foreground leading-relaxed mb-6">
                  {description}
                </p>
                <ul className="space-y-2.5 mt-auto">
                  {bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-2 text-sm text-foreground/90 font-heading"
                    >
                      <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Who this is for */}
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display font-bold text-2xl md:text-3xl lg:text-4xl text-center text-foreground mb-10 md:mb-14 tracking-tight">
              Built for Businesses Ready to Grow
            </h2>
            <div className="grid sm:grid-cols-2 gap-5 md:gap-6">
              {audiences.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-accent/15 bg-background/50 backdrop-blur-sm p-7 md:p-8 flex flex-col items-start text-left hover:border-accent/25 transition-colors"
                >
                  <Icon className="w-6 h-6 text-accent mb-4 opacity-90" strokeWidth={1.5} />
                  <h3 className="font-heading font-bold text-lg text-foreground mb-2">
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

        {/* Process */}
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display font-bold text-2xl md:text-3xl text-center text-foreground mb-12 md:mb-14 tracking-tight">
              How It Works
            </h2>
            <div className="space-y-0 md:space-y-0">
              {steps.map((step, i) => (
                <div
                  key={step.title}
                  className="flex gap-6 md:gap-8 pb-10 md:pb-12 last:pb-0 border-b border-accent/10 last:border-0"
                >
                  <div className="shrink-0 w-10 h-10 rounded-full border border-accent/40 flex items-center justify-center font-display font-bold text-accent text-sm">
                    {i + 1}
                  </div>
                  <div className="pt-0.5">
                    <h3 className="font-heading font-bold text-lg md:text-xl text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="font-heading text-muted-foreground text-sm md:text-base leading-relaxed max-w-xl">
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 pt-8 pb-24 md:pb-28">
          <div className="max-w-2xl mx-auto text-center rounded-2xl border border-accent/25 bg-accent/[0.06] backdrop-blur-sm px-6 py-12 md:px-10 md:py-14">
            <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-5 tracking-tight">
              Let&apos;s Build the Right Solution for Your Business
            </h2>
            <p className="font-heading text-muted-foreground text-base md:text-lg leading-relaxed mb-10 max-w-lg mx-auto">
              If your current setup is costing you leads, slowing follow up, or
              making growth harder than it should be, the next step is a quick
              strategy call.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center">
              <Button
                size="lg"
                className="bg-accent text-background hover:bg-accent/90 font-heading font-bold text-base md:text-lg px-8 py-6 h-auto neon-glow"
                type="button"
                onClick={onTelegramCta("solutions")}
              >
                Book Your Strategy Call
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-accent/50 text-accent hover:bg-accent/10 font-heading font-semibold text-base md:text-lg px-8 py-6 h-auto"
                type="button"
                onClick={onTelegramCta("audit")}
              >
                Get Your System Breakdown
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
