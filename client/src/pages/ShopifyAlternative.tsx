import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, CircleDollarSign, PlugZap, ShieldCheck, Workflow } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";
import { onTelegramCta } from "@/lib/telegramCtas";
import { cn } from "@/lib/utils";
import {
  brandBackdrop,
  brandBackdropLayerA,
  brandBackdropLayerB,
  brandGrayPanel,
  brandGrayPanelHover,
  brandPageRoot,
  brandPrimaryButton,
  brandSecondaryButton,
  brandSectionY,
} from "@/lib/brandStyles";

const PAGE_TITLE = "Own Your Ecommerce Stack | Shopify Alternative";
const PAGE_DESCRIPTION =
  "Stop renting your business from Shopify, TikTok, and Facebook. We build custom ecommerce systems that give you more control, better margins, and real ownership.";
const PAGE_URL = "https://www.davincidynamics.ai/shopify";
const OG_IMAGE = "https://www.davincidynamics.ai/social-preview.svg";

const CARD_BG =
  "https://private-us-east-1.manuscdn.com/sessionFile/dCGapd5ewVrrofgrkY54Ge/sandbox/MDz8hgGj6z586IAHhYtAJw-img-3_1770941425000_na1fn_Y2FyZC10ZXh0dXJl.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZENHYXBkNWV3VnJyb2ZncmtZNTRHZS9zYW5kYm94L01EejhoZ0dqNno1ODZJQUhoWXRBSnctaW1nLTNfMTc3MDk0MTQyNTAwMF9uYTFmbl9ZMkZ5WkMxMFpYaDBkWEpsLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=NwbO2hSlXZECY4hHxTgt3pwhEz65-RQLXrytXjEqXQcsiu-Naffa03ArEh0nCy0~-o0PVVV6hck6UbEKtR1kFbiII-i9EyI-Vphqpjpg4ZrjiiorMcpC6VNglSA0iVfO4s6VUDYmuxw9EUFhFNdpTx3DnSXUsdQBwMuLUthgKoxBZ~jdP8QcKeiY1rSAEiDquOAf~eV1OD5~aBaCbyYS1JZuTUKRbjYYjt4NbNo4SdL~6efi1BH~PjBhlV3qA9cFh-djHmYi2YGWJUvnBR-lfx49JO6W2Aqa1DT3bu~f8cAggept1WFo~jzOiF0qmt9Xw7tgm68f3i4RycvS-iPgsQ__";

const grayPanelStyle = {
  backgroundImage: `linear-gradient(160deg, rgba(68,84,108,0.58) 0%, rgba(49,64,88,0.72) 46%, rgba(26,37,58,0.88) 100%), url('${CARD_BG}')`,
  backgroundBlendMode: "normal, soft-light" as const,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundColor: "rgba(24,35,54,0.85)",
};

const feeCards = [
  {
    icon: CircleDollarSign,
    title: "Platform Plan + Extensions",
    amount: "$400-$2,800/mo",
    text: "Core platform fees, paid add-ons, and recurring tooling stack up quickly.",
  },
  {
    icon: PlugZap,
    title: "App and Integration Sprawl",
    amount: "$250-$1,200/mo",
    text: "Email, reviews, upsells, automation, bundles, and sync tools compound fast.",
  },
  {
    icon: Workflow,
    title: "Operational Friction Cost",
    amount: "$500+/mo",
    text: "Disconnected systems create manual work, slower fulfillment, and missed conversions.",
  },
];

const outcomes = [
  "Own your full storefront stack and customer data",
  "Cut recurring platform and app overhead",
  "Consolidate tools into one cohesive commerce system",
  "Scale with custom automation instead of plugin sprawl",
];

const migrationSteps = [
  {
    step: "01",
    title: "Audit and Strategy",
    text: "We map your stack, fee burden, conversion leaks, and migration scope.",
  },
  {
    step: "02",
    title: "Build and Validate",
    text: "Your new system is built in parallel with conversion paths, automation, and reporting.",
  },
  {
    step: "03",
    title: "Migrate and Launch",
    text: "Products, customers, orders, and SEO signals transfer cleanly with minimal disruption.",
  },
];

const faqs = [
  {
    q: "Will migration hurt SEO or sales momentum?",
    a: "No. We preserve critical structure, implement redirects, and launch with verification checkpoints.",
  },
  {
    q: "How quickly can we move off Shopify?",
    a: "Most brands move in 2-5 weeks depending on catalog complexity and integration requirements.",
  },
  {
    q: "Is this only for larger brands?",
    a: "No. This is built for operators who want healthier margins and full control as they scale.",
  },
];

export default function ShopifyAlternative() {
  const [, setLocation] = useLocation();

  return (
    <div className={brandPageRoot}>
      <Navigation />
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={PAGE_URL} />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESCRIPTION} />
        <meta name="twitter:image" content={OG_IMAGE} />
      </Helmet>

      <div className={brandBackdrop}>
        <div className={brandBackdropLayerA} />
        <div className={brandBackdropLayerB} />
      </div>

      <main className="relative z-10">
        <section className="container mx-auto px-4 pb-24 pt-24 md:pb-28 md:pt-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto mb-10 h-px w-20 bg-gradient-to-r from-transparent via-cyan-300/85 to-transparent" />
            <p className="mb-6 font-heading text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/90">
              Shopify Alternative for Growth Operators
            </p>
            <h1 className="font-display text-4xl font-black leading-[1.05] tracking-tight text-white/92 sm:text-5xl md:text-6xl lg:text-[4rem]">
              Stop Renting Your Storefront.
              <br />
              <span className="bg-gradient-to-r from-cyan-200 via-cyan-300 to-sky-300 bg-clip-text text-transparent">
                Own the Commerce Stack.
              </span>
            </h1>
            <p className="mx-auto mt-8 max-w-3xl font-heading text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
              We help store owners reduce platform overhead and move into an owned ecommerce system
              built for conversion, automation, and stronger margins.
            </p>
            <ul className="mx-auto mt-10 inline-block space-y-3 text-left font-heading text-muted-foreground/95">
              {["Lower recurring cost", "Full data ownership", "Migration support included"].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyan-300/35 bg-cyan-400/15 text-cyan-200">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                  <span className="text-base md:text-lg">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-12 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
              <Button size="lg" className={brandPrimaryButton} type="button" onClick={onTelegramCta("audit")}>
                Get My Savings Plan
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className={brandSecondaryButton} onClick={() => setLocation("/pricing")}>
                See Pricing
              </Button>
            </div>
          </div>
        </section>

        <section className={cn("border-y border-cyan-300/12 bg-card/[0.06]", brandSectionY)}>
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-[2.5rem]">
                Where the Margin Gets Eaten
              </h2>
              <p className="mt-5 font-heading text-base leading-relaxed text-muted-foreground md:text-lg">
                The issue is rarely one fee. It is the full stack cost plus operational drag.
              </p>
            </div>
            <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3 lg:gap-8">
              {feeCards.map((card) => (
                <div key={card.title} className={`${brandGrayPanel} ${brandGrayPanelHover} p-8 text-center`} style={grayPanelStyle}>
                  <card.icon className="mx-auto mb-5 h-7 w-7 text-accent" strokeWidth={1.6} />
                  <h3 className="mb-3 font-heading text-xl font-bold text-foreground">{card.title}</h3>
                  <p className="mb-3 font-display text-3xl font-black tracking-tight text-accent">{card.amount}</p>
                  <p className="font-heading text-sm leading-relaxed text-muted-foreground">{card.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={cn("container mx-auto px-4", brandSectionY)}>
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-[2.5rem]">
              Why Brands Switch
            </h2>
            <p className="mt-5 font-heading text-base leading-relaxed text-muted-foreground md:text-lg">
              This is not a theme refresh. It is a strategic move to better economics and cleaner execution.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:gap-8">
            <div className={`${brandGrayPanel} ${brandGrayPanelHover} p-8 text-center`} style={grayPanelStyle}>
              <h3 className="mb-5 font-heading text-2xl font-bold text-cyan-100">What You Keep</h3>
              <ul className="space-y-3">
                {["Brand equity and customer trust", "Product catalog and order history", "Sales momentum during transition"].map((item) => (
                  <li key={item} className="flex items-start justify-center gap-3 text-left font-heading text-sm text-foreground/90">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={`${brandGrayPanel} ${brandGrayPanelHover} p-8 text-center`} style={grayPanelStyle}>
              <h3 className="mb-5 font-heading text-2xl font-bold text-cyan-100">What You Gain</h3>
              <ul className="space-y-3">
                {outcomes.map((item) => (
                  <li key={item} className="flex items-start justify-center gap-3 text-left font-heading text-sm text-foreground/90">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className={cn("border-y border-cyan-300/12 bg-card/[0.05]", brandSectionY)}>
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-[2.5rem]">
                Migration Without Chaos
              </h2>
              <p className="mt-5 font-heading text-base leading-relaxed text-muted-foreground md:text-lg">
                We run a controlled process that keeps your business running while the new stack is built.
              </p>
            </div>
            <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3 lg:gap-8">
              {migrationSteps.map((step) => (
                <div key={step.step} className={`${brandGrayPanel} ${brandGrayPanelHover} p-8 text-center`} style={grayPanelStyle}>
                  <p className="mb-4 font-display text-lg font-black tracking-[0.12em] text-cyan-200/90">{step.step}</p>
                  <h3 className="mb-3 font-heading text-xl font-bold text-foreground">{step.title}</h3>
                  <p className="font-heading text-sm leading-relaxed text-muted-foreground">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={cn("container mx-auto px-4", brandSectionY)}>
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-10 text-center font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Common Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((item) => (
                <details key={item.q} className={`${brandGrayPanel} ${brandGrayPanelHover} rounded-xl p-6`} style={grayPanelStyle}>
                  <summary className="cursor-pointer list-none font-heading text-lg font-bold text-foreground">
                    {item.q}
                  </summary>
                  <p className="mt-4 font-heading text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-28 pt-8 md:pb-36">
          <div className={`${brandGrayPanel} ${brandGrayPanelHover} mx-auto max-w-4xl rounded-2xl px-8 py-14 text-center md:px-12 md:py-16`} style={grayPanelStyle}>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-[2.8rem]">
              Ready to Stop Paying Platform Tax?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl font-heading text-base leading-relaxed text-muted-foreground md:text-lg">
              Book a focused strategy call and we will map your stack, likely savings, and migration path.
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
              <Button size="lg" className={brandPrimaryButton} type="button" onClick={onTelegramCta("audit")}>
                Get My Savings Plan
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className={brandSecondaryButton} type="button" onClick={onTelegramCta("audit")}>
                Book Demo
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
