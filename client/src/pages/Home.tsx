/**
 * DaVinci Dynamics - Main Home Page
 * Cyberpunk theme targeting small business owners and private sellers
 */

import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Zap, Shield, TrendingUp, Bot } from "lucide-react";
import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import CostSavingsCalculator from "@/components/CostSavingsCalculator";
import { useEffect, useRef } from "react";
import { useChat } from "@/contexts/ChatContext";
import { useScrollFade } from "@/hooks/useScrollFade";

export default function Home() {
  const [, setLocation] = useLocation();
  const { openChat } = useChat();
  
  // Scroll fade hooks for each section
  const calculatorSection = useScrollFade();
  const problemSection = useScrollFade();
  const whoSection = useScrollFade();
  const ctaSection = useScrollFade();

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <Navigation />
      {/* Background glow effects */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 lg:py-24">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-block px-4 py-2 bg-accent/10 border border-accent/30 rounded-full mb-6 animate-fade-in-up">
              <span className="text-accent font-heading font-semibold text-sm">
                Stop Paying Platform Fees • Own Your Business
              </span>
            </div>
            
            <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl xl:text-7xl mb-6 leading-tight tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Turn Your{" "}
              <span className="text-neon">Facebook & TikTok</span>
              <br />
              Sales Into a Real Business
            </h1>
            
            <p className="font-heading text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Stop losing 60%+ of your profits to Shopify, Square, and payment processors. 
              We build you a <span className="text-accent font-semibold">custom e-commerce platform</span> that you own—
              with in-store pickup, shipping, and payment processing that actually works for small sellers.
            </p>
            
            {/* Bot Automation Highlight */}
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/30 rounded-xl px-6 py-4 mb-8 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
              <Bot className="w-6 h-6 text-accent flex-shrink-0" />
              <p className="font-heading text-base text-foreground">
                <span className="text-accent font-bold">Bots handle the heavy lifting</span> — automated SMS, Telegram & WhatsApp notifications so you focus on profits
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Button
                size="lg"
                className="bg-accent text-background hover:bg-accent/90 font-heading font-bold text-lg px-8 py-6 neon-glow"
                onClick={() => setLocation('/booking')}
              >
                See Pricing & Book Demo
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-accent/50 text-accent hover:bg-accent/10 hover:border-accent font-heading font-semibold text-lg px-8 py-6"
                onClick={() => setLocation('/solutions')}
              >
                How It Works
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground font-heading animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-accent" />
                <span>No monthly platform fees</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-accent" />
                <span>Lower payment processing</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-accent" />
                <span>You own everything</span>
              </div>
            </div>
          </div>
        </section>

        {/* Cost Savings Calculator Section */}
        <section 
          ref={calculatorSection.ref as React.RefObject<HTMLElement>}
          className={`container mx-auto px-4 py-16 scroll-fade-section ${calculatorSection.isVisible ? 'visible' : ''}`}
        >
          <div className="max-w-4xl mx-auto">
            <CostSavingsCalculator />
          </div>
        </section>

        {/* Problem Section */}
        <section 
          ref={problemSection.ref as React.RefObject<HTMLElement>}
          className={`container mx-auto px-4 py-16 scroll-fade-section ${problemSection.isVisible ? 'visible' : ''}`}
        >
          <div className="max-w-4xl mx-auto">
            <div className="glass-card-intense rounded-xl p-8 lg:p-12"
              style={{
                backgroundImage: `url('https://private-us-east-1.manuscdn.com/sessionFile/dCGapd5ewVrrofgrkY54Ge/sandbox/MDz8hgGj6z586IAHhYtAJw-img-3_1770941425000_na1fn_Y2FyZC10ZXh0dXJl.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZENHYXBkNWV3VnJyb2ZncmtZNTRHZS9zYW5kYm94L01EejhoZ0dqNno1ODZJQUhoWXRBSnctaW1nLTNfMTc3MDk0MTQyNTAwMF9uYTFmbl9ZMkZ5WkMxMFpYaDBkWEpsLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=NwbO2hSlXZECY4hHxTgt3pwhEz65-RQLXrytXjEqXQcsiu-Naffa03ArEh0nCy0~-o0PVVV6hck6UbEKtR1kFbiII-i9EyI-Vphqpjpg4ZrjiiorMcpC6VNglSA0iVfO4s6VUDYmuxw9EUFhFNdpTx3DnSXUsdQBwMuLUthgKoxBZ~jdP8QcKeiY1rSAEiDquOAf~eV1OD5~aBaCbyYS1JZuTUKRbjYYjt4NbNo4SdL~6efi1BH~PjBhlV3qA9cFh-djHmYi2YGWJUvnBR-lfx49JO6W2Aqa1DT3bu~f8cAggept1WFo~jzOiF0qmt9Xw7tgm68f3i4RycvS-iPgsQ__')`,
                backgroundSize: 'cover',
              }}
            >
              <h2 className="font-display font-bold text-3xl lg:text-4xl text-neon mb-6 text-center">
                Tired of Losing Money to Platforms?
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <h3 className="font-heading font-bold text-xl text-foreground">What You're Paying Now:</h3>
                  <ul className="space-y-3">
                    {[
                      "Shopify: $79-$299/month",
                      "Square: 2.9% + 30¢ per transaction",
                      "Stripe: 2.9% + 30¢ per transaction",
                      "Email marketing: $50-$300/month",
                      "Inventory apps: $30-$100/month",
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-muted-foreground font-heading">
                        <span className="text-red-500 mt-1">✗</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="font-heading font-bold text-lg text-foreground pt-4 border-t border-accent/30">
                    Total: $3,500-$8,000/month
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-heading font-bold text-xl text-accent">With DaVinci Dynamics:</h3>
                  <ul className="space-y-3">
                    {[
                      "One-time setup: $2,500-$5,000",
                      "Monthly: $500-$1,500",
                      "Lower payment processing fees",
                      "All features included",
                      "You own the platform",
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-foreground font-heading">
                        <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="font-heading font-bold text-lg text-accent pt-4 border-t border-accent/30">
                    Save 60-80% Every Month
                  </p>
                </div>
              </div>

              <div className="text-center">
                <Button
                  size="lg"
                  className="bg-accent text-background hover:bg-accent/90 font-heading font-bold"
                  onClick={() => setLocation('/booking')}
                >
                  Calculate Your Savings
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Who This Is For */}
        <section 
          ref={whoSection.ref as React.RefObject<HTMLElement>}
          className={`container mx-auto px-4 py-16 scroll-fade-section ${whoSection.isVisible ? 'visible' : ''}`}
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-center text-neon mb-12">
              Perfect For Small Sellers & Private Retailers
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Zap className="w-8 h-8 text-accent" />,
                  title: "Facebook & TikTok Sellers",
                  description: "Turn your social media sales into a professional e-commerce business with your own branded platform"
                },
                {
                  icon: <Shield className="w-8 h-8 text-accent" />,
                  title: "Vape, CBD & Specialty Shops",
                  description: "Handle age verification, in-store pickup, and shipping without paying enterprise platform fees"
                },
                {
                  icon: <TrendingUp className="w-8 h-8 text-accent" />,
                  title: "Boutiques & Local Retailers",
                  description: "Compete with big brands while keeping more profit—no monthly subscriptions eating your margins"
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="glass-card rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(0,217,255,0.25)] hover:border-accent/40"
                  style={{
                    backgroundImage: `url('https://private-us-east-1.manuscdn.com/sessionFile/dCGapd5ewVrrofgrkY54Ge/sandbox/MDz8hgGj6z586IAHhYtAJw-img-3_1770941425000_na1fn_Y2FyZC10ZXh0dXJl.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZENHYXBkNWV3VnJyb2ZncmtZNTRHZS9zYW5kYm94L01EejhoZ0dqNno1ODZJQUhoWXRBSnctaW1nLTNfMTc3MDk0MTQyNTAwMF9uYTFmbl9ZMkZ5WkMxMFpYaDBkWEpsLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=NwbO2hSlXZECY4hHxTgt3pwhEz65-RQLXrytXjEqXQcsiu-Naffa03ArEh0nCy0~-o0PVVV6hck6UbEKtR1kFbiII-i9EyI-Vphqpjpg4ZrjiiorMcpC6VNglSA0iVfO4s6VUDYmuxw9EUFhFNdpTx3DnSXUsdQBwMuLUthgKoxBZ~jdP8QcKeiY1rSAEiDquOAf~eV1OD5~aBaCbyYS1JZuTUKRbjYYjt4NbNo4SdL~6efi1BH~PjBhlV3qA9cFh-djHmYi2YGWJUvnBR-lfx49JO6W2Aqa1DT3bu~f8cAggept1WFo~jzOiF0qmt9Xw7tgm68f3i4RycvS-iPgsQ__')`,
                    backgroundSize: 'cover',
                  }}
                >
                  <div className="mb-4">{item.icon}</div>
                  <h3 className="font-heading font-bold text-xl text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground font-heading">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section 
          ref={ctaSection.ref as React.RefObject<HTMLElement>}
          className={`container mx-auto px-4 py-16 mb-24 scroll-fade-section ${ctaSection.isVisible ? 'visible' : ''}`}
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="glass-card-intense rounded-xl p-8 lg:p-12 neon-glow"
              style={{
                backgroundImage: `url('https://private-us-east-1.manuscdn.com/sessionFile/dCGapd5ewVrrofgrkY54Ge/sandbox/MDz8hgGj6z586IAHhYtAJw-img-3_1770941425000_na1fn_Y2FyZC10ZXh0dXJl.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZENHYXBkNWV3VnJyb2ZncmtZNTRHZS9zYW5kYm94L01EejhoZ0dqNno1ODZJQUhoWXRBSnctaW1nLTNfMTc3MDk0MTQyNTAwMF9uYTFmbl9ZMkZ5WkMxMFpYaDBkWEplLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=NwbO2hSlXZECY4hHxTgt3pwhEz65-RQLXrytXjEqXQcsiu-Naffa03ArEh0nCy0~-o0PVVV6hck6UbEKtR1kFbiII-i9EyI-Vphqpjpg4ZrjiiorMcpC6VNglSA0iVfO4s6VUDYmuxw9EUFhFNdpTx3DnSXUsdQBwMuLUthgKoxBZ~jdP8QcKeiY1rSAEiDquOAf~eV1OD5~aBaCbyYS1JZuTUKRbjYYjt4NbNo4SdL~6efi1BH~PjBhlV3qA9cFh-djHmYi2YGWJUvnBR-lfx49JO6W2Aqa1DT3bu~f8cAggept1WFo~jzOiF0qmt9Xw7tgm68f3i4RycvS-iPgsQ__')`,
                backgroundSize: 'cover',
              }}
            >
              <h2 className="font-display font-bold text-3xl lg:text-4xl text-neon mb-4">
                Ready to Stop Paying Platform Fees?
              </h2>
              <p className="font-heading text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Book a demo and see exactly how much you'll save every month. 
                We'll show you the platform, walk through your specific needs, and give you a custom quote.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-accent text-background hover:bg-accent/90 font-heading font-bold text-lg px-8 py-6"
                  onClick={() => setLocation('/booking')}
                >
                  Book Your Demo Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-accent/50 text-accent hover:bg-accent/10 hover:border-accent font-heading font-semibold text-lg px-8 py-6"
                  onClick={openChat}
                >
                  Chat with Sophia
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
