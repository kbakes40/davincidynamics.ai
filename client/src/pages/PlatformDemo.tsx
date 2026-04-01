/**
 * Pricing page — cyberpunk luxury theme (matches site).
 */

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useLgPricingHover } from "@/hooks/useLgPricingHover";
import { useScrollFade } from "@/hooks/useScrollFade";
import { Helmet } from "react-helmet-async";
import { trackButtonClick } from "@/lib/analytics";
import { onTelegramCta, openVinciBot } from "@/lib/telegramCtas";
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
} from "@/lib/brandStyles";

export default function PlatformDemo() {

  const pricingSection = useScrollFade();
  const { growthHovered, onGrowthEnter, onGrowthLeave } = useLgPricingHover();

  return (
    <div className={brandPageRoot}>
      <Helmet>
        <title>Pricing - DaVinci Dynamics</title>
        <meta name="description" content="Choose the system that fits your growth stage. Conversion-focused websites, automation, and follow-up systems from DaVinci Dynamics." />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.davincidynamics.ai/pricing" />
        <meta property="og:title" content="Pricing - DaVinci Dynamics" />
        <meta property="og:description" content="Choose the system that fits your growth stage. Conversion-focused websites, automation, and follow-up systems from DaVinci Dynamics." />
        <meta property="og:image" content="https://files.manuscdn.com/user_upload_by_module/session_file/310519663317811544/PXfURBFNVBolMqns.png" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://www.davincidynamics.ai/pricing" />
        <meta property="twitter:title" content="Pricing - DaVinci Dynamics" />
        <meta property="twitter:description" content="Choose the system that fits your growth stage. Conversion-focused websites, automation, and follow-up systems from DaVinci Dynamics." />
        <meta property="twitter:image" content="https://files.manuscdn.com/user_upload_by_module/session_file/310519663317811544/PXfURBFNVBolMqns.png" />
      </Helmet>
      <Navigation />
      <div className={brandBackdrop}>
        <div className={brandBackdropLayerA} />
        <div className={brandBackdropLayerB} />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-6 lg:py-8">
        {/* Pricing Cards - Horizontal Layout for Desktop */}
        <div
          ref={pricingSection.ref}
          className={`relative max-w-6xl mx-auto scroll-fade-section px-4 sm:px-6 pt-24 pb-24 md:pt-28 md:pb-28 lg:pt-32 lg:pb-32 ${pricingSection.isVisible ? "visible" : ""}`}
        >
          {/* Subtle atmospheric glow — grounds the tier cards */}
          <div
            className="pointer-events-none absolute left-1/2 top-[38%] h-[min(440px,58vh)] w-[min(880px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_72%_65%_at_50%_50%,rgba(0,200,255,0.09),transparent_70%)] blur-[72px] opacity-70"
            aria-hidden
          />

          <div className="relative z-[1]">
          <div className="text-center mb-12 md:mb-14 lg:mb-16 max-w-3xl mx-auto">
            <h2 className="mb-4 font-display text-2xl font-black leading-[1.12] tracking-tight text-white/92 md:mb-5 md:text-3xl lg:text-[2.25rem]">
              Choose the System That Fits Your Growth Stage
            </h2>
            <p className="font-heading text-base md:text-lg text-muted-foreground/80 font-normal max-w-2xl mx-auto leading-relaxed">
              Every build is designed to convert, automate, and scale your business, not just launch a website.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 lg:gap-10 mb-10 lg:mb-12">
          {/* Card 1: Starter */}
          <div 
            className={cn(
              "group/starter relative flex flex-col overflow-hidden rounded-xl p-7 lg:p-8",
              brandGrayPanel,
              brandGrayPanelHover,
              "before:pointer-events-none before:absolute before:inset-x-4 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/18 before:to-transparent",
              "transition-all duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
              "lg:hover:-translate-y-1.5",
              growthHovered && "lg:opacity-[0.68] lg:scale-[0.985]"
            )}
            style={{
              backgroundImage: "linear-gradient(160deg, rgba(60,74,96,0.56) 0%, rgba(42,54,73,0.7) 46%, rgba(21,30,47,0.9) 100%), url('https://private-us-east-1.manuscdn.com/sessionFile/dCGapd5ewVrrofgrkY54Ge/sandbox/MDz8hgGj6z586IAHhYtAJw-img-3_1770941425000_na1fn_Y2FyZC10ZXh0dXJl.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZENHYXBkNWV3VnJyb2ZncmtZNTRHZS9zYW5kYm94L01EejhoZ0dqNno1ODZJQUhoWXRBSnctaW1nLTNfMTc3MDk0MTQyNTAwMF9uYTFmbl9ZMkZ5WkMxMFpYaDBkWEpsLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=NwbO2hSlXZECY4hHxTgt3pwhEz65-RQLXrytXjEqXQcsiu-Naffa03ArEh0nCy0~-o0PVVV6hck6UbEKtR1kFbiII-i9EyI-Vphqpjpg4ZrjiiorMcpC6VNglSA0iVfO4s6VUDYmuxw9EUFhFNdpTx3DnSXUsdQBwMuLUthgKoxBZ~jdP8QcKeiY1rSAEiDquOAf~eV1OD5~aBaCbyYS1JZuTUKRbjYYjt4NbNo4SdL~6efi1BH~PjBhlV3qA9cFh-djHmYi2YGWJUvnBR-lfx49JO6W2Aqa1DT3bu~f8cAggept1WFo~jzOiF0qmt9Xw7tgm68f3i4RycvS-iPgsQ__')",
              backgroundBlendMode: "normal, soft-light",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: "rgba(15,23,42,0.9)",
              animationDelay: '0.2s'
            }}
          >
            <h3 className="font-heading text-lg font-bold tracking-tight text-foreground md:text-xl lg:text-xl mb-3">
              Starter
            </h3>
            <div className="mb-4">
              <p className="font-display text-3xl font-black tracking-tight text-accent drop-shadow-[0_0_24px_rgba(0,217,255,0.12)] lg:text-4xl">
                $1,500
              </p>
            </div>
            <p className="mb-6 text-sm font-heading leading-relaxed text-muted-foreground/90">
              Perfect for businesses that need a clean, conversion-ready foundation.
            </p>
            
            <ul className="mb-6 flex-grow space-y-3">
              {[
                "Conversion-focused website",
                "Lead capture setup",
                "Basic automation",
                "Mobile optimized design",
              ].map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm leading-snug text-foreground/95">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent/90" strokeWidth={2} />
                  <span className="font-heading">{feature}</span>
                </li>
              ))}
            </ul>

            <p className="mb-0 text-center text-[11px] font-heading leading-relaxed text-muted-foreground/65">
              Built to launch fast and start capturing leads
            </p>
            
            <Button 
              type="button"
              variant="outline" 
              className={`${brandSecondaryButton} mt-6 h-12 w-full rounded-lg px-6 py-0 text-sm`}
              onClick={onTelegramCta("pricing")}
            >
              Book Your Strategy Call
            </Button>
          </div>

          {/* Card 2: Growth (Featured) */}
          <div 
            className={cn(
              "group/growth relative z-[2] flex flex-col overflow-visible rounded-xl px-7 pb-7 pt-10 animate-fade-in-up lg:px-8 lg:pb-8 lg:pt-11",
              brandGrayPanel,
              brandGrayPanelHover,
              "border-cyan-300/34",
              "shadow-[0_0_0_1px_rgba(34,211,238,0.12),0_12px_42px_rgba(0,0,0,0.48),0_0_90px_-30px_rgba(34,211,238,0.16),inset_0_1px_0_rgba(255,255,255,0.09)]",
              "before:pointer-events-none before:absolute before:inset-x-4 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-cyan-400/45 before:to-transparent",
              "transition-all duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
              "lg:scale-[1.035]",
              "lg:hover:-translate-y-2 lg:hover:scale-[1.055] lg:hover:border-cyan-400/65",
              "lg:hover:shadow-[0_0_0_1px_rgba(34,211,238,0.22),0_22px_56px_rgba(0,0,0,0.55),0_0_120px_-24px_rgba(34,211,238,0.2),inset_0_1px_0_rgba(255,255,255,0.11)]"
            )}
            onMouseEnter={onGrowthEnter}
            onMouseLeave={onGrowthLeave}
            style={{
              backgroundImage: "linear-gradient(160deg, rgba(64,78,100,0.58) 0%, rgba(45,58,79,0.72) 46%, rgba(23,33,52,0.88) 100%), url('https://private-us-east-1.manuscdn.com/sessionFile/dCGapd5ewVrrofgrkY54Ge/sandbox/MDz8hgGj6z586IAHhYtAJw-img-3_1770941425000_na1fn_Y2FyZC10ZXh0dXJl.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZENHYXBkNWV3VnJyb2ZncmtZNTRHZS9zYW5kYm94L01EejhoZ0dqNno1ODZJQUhoWXRBSnctaW1nLTNfMTc3MDk0MTQyNTAwMF9uYTFmbl9ZMkZ5WkMxMFpYaDBkWEpsLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=NwbO2hSlXZECY4hHxTgt3pwhEz65-RQLXrytXjEqXQcsiu-Naffa03ArEh0nCy0~-o0PVVV6hck6UbEKtR1kFbiII-i9EyI-Vphqpjpg4ZrjiiorMcpC6VNglSA0iVfO4s6VUDYmuxw9EUFhFNdpTx3DnSXUsdQBwMuLUthgKoxBZ~jdP8QcKeiY1rSAEiDquOAf~eV1OD5~aBaCbyYS1JZuTUKRbjYYjt4NbNo4SdL~6efi1BH~PjBhlV3qA9cFh-djHmYi2YGWJUvnBR-lfx49JO6W2Aqa1DT3bu~f8cAggept1WFo~jzOiF0qmt9Xw7tgm68f3i4RycvS-iPgsQ__')",
              backgroundBlendMode: "normal, soft-light",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: "rgba(17,27,45,0.88)",
              animationDelay: '0.3s'
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-b from-[rgba(0,200,255,0.07)] via-transparent to-transparent opacity-0 transition-opacity duration-500 ease-out lg:group-hover/growth:opacity-100"
              aria-hidden
            />
            {/* Most Popular Badge — centered, overlaps top edge */}
            <div
              className="absolute left-1/2 top-[-11px] z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/20 px-4 py-1.5 text-[11px] font-heading font-semibold tracking-wide text-white/95 shadow-[0_2px_16px_rgba(0,200,255,0.35),0_0_32px_rgba(0,200,255,0.12)]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0,214,255,0.92) 0%, rgba(0,165,230,0.88) 50%, rgba(0,130,210,0.9) 100%)",
              }}
            >
              Most Popular
            </div>
            
            <h3 className="font-heading text-lg font-bold tracking-tight text-foreground md:text-xl lg:text-xl mb-3">Growth</h3>
            <div className="mb-4">
              <p className="font-display text-3xl font-black tracking-tight text-accent drop-shadow-[0_0_28px_rgba(0,217,255,0.18)] lg:text-4xl">
                $3,000
              </p>
            </div>
            <p className="mb-6 text-sm font-heading leading-relaxed text-muted-foreground/90">
              For businesses ready to scale with better systems and follow-up.
            </p>
            
            <ul className="mb-6 flex-grow space-y-3">
              {[
                "Everything in Starter",
                "Funnel structure",
                "Automated follow-up system",
                "Lead routing logic",
                "Conversion optimization",
              ].map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm leading-snug text-foreground/95">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent/90" strokeWidth={2} />
                  <span className="font-heading">{feature}</span>
                </li>
              ))}
            </ul>

            <p className="mb-0 text-center text-[11px] font-heading leading-relaxed text-muted-foreground/65">
              Designed to turn traffic into consistent customers
            </p>
            
            <Button 
              type="button"
              className={`${brandPrimaryButton} relative z-10 mt-6 h-12 w-full rounded-lg px-6 py-0 text-sm`}
              onClick={onTelegramCta("pricing")}
            >
              Book Your Strategy Call
            </Button>
          </div>

          {/* Card 3: Scale */}
          <div 
            className={cn(
              "group/scale relative flex flex-col overflow-hidden rounded-xl p-7 lg:p-8",
              brandGrayPanel,
              brandGrayPanelHover,
              "before:pointer-events-none before:absolute before:inset-x-4 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/18 before:to-transparent",
              "transition-all duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
              "lg:hover:-translate-y-1.5",
              growthHovered && "lg:opacity-[0.68] lg:scale-[0.985]"
            )}
            style={{
              backgroundImage: "linear-gradient(160deg, rgba(60,74,96,0.56) 0%, rgba(42,54,73,0.7) 46%, rgba(21,30,47,0.9) 100%), url('https://private-us-east-1.manuscdn.com/sessionFile/dCGapd5ewVrrofgrkY54Ge/sandbox/MDz8hgGj6z586IAHhYtAJw-img-3_1770941425000_na1fn_Y2FyZC10ZXh0dXJl.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZENHYXBkNWV3VnJyb2ZncmtZNTRHZS9zYW5kYm94L01EejhoZ0dqNno1ODZJQUhoWXRBSnctaW1nLTNfMTc3MDk0MTQyNTAwMF9uYTFmbl9ZMkZ5WkMxMFpYaDBkWEpsLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=NwbO2hSlXZECY4hHxTgt3pwhEz65-RQLXrytXjEqXQcsiu-Naffa03ArEh0nCy0~-o0PVVV6hck6UbEKtR1kFbiII-i9EyI-Vphqpjpg4ZrjiiorMcpC6VNglSA0iVfO4s6VUDYmuxw9EUFhFNdpTx3DnSXUsdQBwMuLUthgKoxBZ~jdP8QcKeiY1rSAEiDquOAf~eV1OD5~aBaCbyYS1JZuTUKRbjYYjt4NbNo4SdL~6efi1BH~PjBhlV3qA9cFh-djHmYi2YGWJUvnBR-lfx49JO6W2Aqa1DT3bu~f8cAggept1WFo~jzOiF0qmt9Xw7tgm68f3i4RycvS-iPgsQ__')",
              backgroundBlendMode: "normal, soft-light",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: "rgba(15,23,42,0.9)",
              animationDelay: '0.4s'
            }}
          >
            <h3 className="font-heading text-lg font-bold tracking-tight text-foreground md:text-xl lg:text-xl mb-3">
              Scale
            </h3>
            <div className="mb-4">
              <p className="font-display text-3xl font-black tracking-tight text-accent drop-shadow-[0_0_24px_rgba(0,217,255,0.12)] lg:text-4xl">
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
              ].map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm leading-snug text-foreground/95">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent/90" strokeWidth={2} />
                  <span className="font-heading">{feature}</span>
                </li>
              ))}
            </ul>

            <p className="mb-0 text-center text-[11px] font-heading leading-relaxed text-muted-foreground/65">
              Built for performance, automation, and long-term growth
            </p>
            
            <Button 
              type="button"
              variant="outline" 
              className={`${brandSecondaryButton} mt-6 h-12 w-full rounded-lg px-6 py-0 text-sm`}
              onClick={onTelegramCta("pricing")}
            >
              Book Your Strategy Call
            </Button>
          </div>
          </div>

          <div className="mx-auto mt-4 max-w-3xl border-t border-white/[0.06] px-4 pt-10 md:pt-12">
            <p className="text-center text-sm font-heading leading-relaxed text-muted-foreground/85">
              Every system is customized based on your business. Final scope and pricing may vary depending on complexity and goals.
            </p>
          </div>
          </div>
        </div>

        {/* Bottom Section */}
        <footer className="text-center space-y-6 animate-fade-in-up max-w-2xl mx-auto" style={{ animationDelay: '0.5s' }}>
          <p className="text-sm text-muted-foreground font-heading mb-2">
            Own your customer data. Automate fulfillment. Scale smarter.
          </p>
          <p className="text-xs text-accent/80 font-heading mb-4">
            💬 Get your custom platform recommendation instantly
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              type="button"
              size="lg"
              className={`${brandPrimaryButton} w-full text-base lg:w-auto lg:px-16 lg:text-lg`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                trackButtonClick('Book Your System Walkthrough', { location: 'platform_demo' });
                openVinciBot("demo");
              }}
            >
              Book Your System Walkthrough
            </Button>
            <Button 
              type="button"
              size="lg"
              variant="outline"
              className={`${brandSecondaryButton} w-full text-base lg:w-auto lg:px-16 lg:text-lg`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                trackButtonClick('Book Demo', { location: 'platform_demo' });
                openVinciBot("demo");
              }}
            >
              Book a Demo
            </Button>
          </div>
        </footer>
      </main>
    </div>
  );
}
