/**
 * About — trust, story, conversion (aligned with Home / Solutions)
 */

import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Building2, Radio, Wrench, ShoppingBag } from "lucide-react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { onTelegramCta } from "@/lib/telegramCtas";
import {
  brandBreakdownButton,
  brandBackdrop,
  brandBackdropLayerA,
  brandBackdropLayerB,
  brandCard,
  brandCardHover,
  brandPageRoot,
  brandPrimaryButton,
  brandSecondaryButton,
  brandSectionY,
} from "@/lib/brandStyles";

const PAGE_TITLE = "About | DaVinci Dynamics";
const PAGE_DESCRIPTION =
  "DaVinci Dynamics builds revenue systems from real sales and operations experience—lead capture, conversion, and follow-up. Book a strategy call.";

const whoWeWorkWith = [
  {
    icon: Building2,
    title: "Small Businesses",
    body: "Looking to improve conversion, capture more leads, and create a stronger foundation for growth",
  },
  {
    icon: Radio,
    title: "Telecom and Dealer Operations",
    body: "Need better recruitment systems, routing, onboarding, and lead handling",
  },
  {
    icon: Wrench,
    title: "Service Businesses",
    body: "Want to respond faster, capture more inquiries, and reduce missed opportunities",
  },
  {
    icon: ShoppingBag,
    title: "Ecommerce Brands",
    body: "Need stronger conversion paths, automation, and customer flow",
  },
] as const;

export default function About() {
  const [, setLocation] = useLocation();

  return (
    <div className={brandPageRoot}>
      <Navigation />
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
      </Helmet>

      <div className={brandBackdrop}>
        <div className={brandBackdropLayerA} />
        <div className={brandBackdropLayerB} />
      </div>

      <main className="relative z-10">
        {/* Hero */}
        <section className="container mx-auto px-4 pb-24 pt-24 md:pb-28 md:pt-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mb-10 opacity-80" />
            <h1 className="font-display font-black text-4xl leading-[1.06] tracking-tight text-white/92 sm:text-5xl md:text-6xl">
              Built From Real Experience, Not Theory
            </h1>
            <p className="mx-auto mb-12 mt-8 max-w-2xl font-heading text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
              DaVinci Dynamics was built from years of working directly with
              customers, sales systems, and real business operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center">
              <Button
                size="lg"
                className={brandPrimaryButton}
                type="button"
                onClick={onTelegramCta("about")}
              >
                Book Your Strategy Call
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className={brandSecondaryButton}
                onClick={() => setLocation("/pricing")}
              >
                See Pricing
              </Button>
            </div>
          </div>
        </section>

        {/* Personal story */}
        <section className={`container mx-auto px-4 ${brandSectionY}`}>
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-8 tracking-tight text-center md:text-left">
              Why DaVinci Dynamics Exists
            </h2>
            <div className="space-y-6 font-heading text-muted-foreground text-base md:text-lg leading-relaxed">
              <p>
                Most businesses are not struggling because of effort. They are
                struggling because their systems are broken.
              </p>
              <p>
                After years of working in high-volume sales environments and
                seeing how leads are handled, one thing became clear.
              </p>
              <p className="text-foreground font-medium">
                Businesses lose money in the gaps.
              </p>
              <ul className="space-y-2 pl-0 list-none text-muted-foreground">
                {[
                  "Slow follow up",
                  "Poor conversion",
                  "No structure",
                  "No system behind the scenes",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <span className="text-accent mt-1.5 h-1 w-1 rounded-full bg-accent shrink-0" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <p className="text-foreground pt-2">
                DaVinci Dynamics was built to fix that.
              </p>
              <p className="border-t border-cyan-300/15 pt-4 text-sm text-muted-foreground/90">
                — Kevin Baker, founder
              </p>
            </div>
          </div>
        </section>

        {/* What makes us different */}
        <section className={`container mx-auto px-4 ${brandSectionY}`}>
          <div className="mx-auto max-w-2xl border-y border-cyan-300/14 py-12 md:py-14">
            <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-5 tracking-tight text-center">
              Not Just Websites, Real Systems
            </h2>
            <p className="font-heading text-muted-foreground text-base md:text-lg leading-relaxed text-center mb-10 max-w-xl mx-auto">
              Most agencies focus on design.
              <br />
              <span className="text-foreground font-medium">We focus on performance.</span>
            </p>
            <p className="font-heading text-muted-foreground text-base md:text-lg leading-relaxed text-center mb-10">
              Everything we build is designed to capture leads, improve
              conversion, automate follow up, and create a cleaner path from
              traffic to customer.
            </p>
            <ul className="space-y-3 max-w-md mx-auto">
              {[
                "Built for conversion, not just appearance",
                "Focused on real business outcomes",
                "Designed to scale with your growth",
              ].map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-3 font-heading text-foreground text-sm md:text-base"
                >
                  <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Experience / positioning */}
        <section className={`container mx-auto px-4 ${brandSectionY}`}>
          <div className="max-w-2xl mx-auto text-center md:text-left">
            <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-6 tracking-tight">
              Built by Someone Who Understands Sales
            </h2>
            <div className="space-y-5 font-heading text-muted-foreground text-base md:text-lg leading-relaxed">
              <p className="text-foreground font-medium">This is not built from theory.</p>
              <p>
                It comes from real experience working with customers, handling
                leads, and understanding what actually drives revenue.
              </p>
              <p>
                The systems are designed around how people buy, not just how
                websites look.
              </p>
            </div>
          </div>
        </section>

        {/* Who we work with */}
        <section className={`container mx-auto px-4 ${brandSectionY}`}>
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display font-bold text-2xl md:text-3xl lg:text-4xl text-center text-foreground mb-10 md:mb-14 tracking-tight">
              Who We Work With
            </h2>
            <div className="grid sm:grid-cols-2 gap-5 md:gap-6">
              {whoWeWorkWith.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className={`${brandCard} ${brandCardHover} flex flex-col items-start p-7 text-left md:p-8`}
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

        {/* Final CTA */}
        <section className="container mx-auto px-4 pb-28 pt-8 md:pb-32">
          <div className="mx-auto max-w-2xl rounded-2xl border border-cyan-300/24 bg-cyan-400/[0.08] px-6 py-12 text-center backdrop-blur-sm md:px-10 md:py-14">
            <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-5 tracking-tight">
              Let&apos;s Build the Right System for Your Business
            </h2>
            <p className="font-heading text-muted-foreground text-base md:text-lg leading-relaxed mb-10 max-w-lg mx-auto">
              If your current setup is costing you leads or slowing growth, the
              next step is a quick strategy call.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center">
              <Button
                size="lg"
                className={brandPrimaryButton}
                type="button"
                onClick={onTelegramCta("about")}
              >
                Book Your Strategy Call
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className={`${brandBreakdownButton} h-auto px-8 py-6 text-base md:text-lg`}
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
