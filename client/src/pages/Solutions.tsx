/**
 * Solutions Page - E-commerce Platform Features
 */

import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Bot, MessageSquare, Zap } from "lucide-react";
import { useLocation } from "wouter";

export default function Solutions() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="container mx-auto px-4 py-16 mb-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display font-black text-4xl lg:text-5xl text-neon mb-6 text-center">
            Your Complete E-commerce Solution
          </h1>
          <p className="font-heading text-lg text-muted-foreground mb-12 text-center max-w-2xl mx-auto">
            Everything you need to run a professional online store—without the monthly platform fees
          </p>

          {/* Core Features */}
          <div className="space-y-8 mb-16">
            {[
              {
                title: "Full E-commerce Website",
                features: [
                  "Custom branded storefront",
                  "Product catalog with categories",
                  "Shopping cart and checkout",
                  "Mobile-responsive design",
                  "SEO optimized pages"
                ]
              },
              {
                title: "Payment Processing",
                features: [
                  "Zelle integration (no fees)",
                  "Authorize.net card processing",
                  "Lower transaction fees than Shopify/Square",
                  "Secure payment handling",
                  "Multiple payment options"
                ]
              },
              {
                title: "Order Management",
                features: [
                  "In-store pickup scheduling",
                  "Shipping integration",
                  "Order tracking",
                  "Customer notifications (SMS & email)",
                  "Inventory management"
                ]
              },
              {
                title: "Customer Features",
                features: [
                  "Account creation and login",
                  "Order history",
                  "Saved addresses",
                  "ID verification (for age-restricted products)",
                  "Wishlist and favorites"
                ]
              },
              {
                title: "Business Tools",
                features: [
                  "Admin dashboard",
                  "Sales analytics",
                  "Customer database",
                  "Email marketing integration",
                  "Automated workflows"
                ]
              }
            ].map((section, idx) => (
              <div
                key={idx}
                className="bg-card rounded-xl p-6 lg:p-8 border border-accent/30 shadow-xl"
                style={{
                  backgroundImage: `url('https://private-us-east-1.manuscdn.com/sessionFile/dCGapd5ewVrrofgrkY54Ge/sandbox/MDz8hgGj6z586IAHhYtAJw-img-3_1770941425000_na1fn_Y2FyZC10ZXh0dXJl.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZENHYXBkNWV3VnJyb2ZncmtZNTRHZS9zYW5kYm94L01EejhoZ0dqNno1ODZJQUhoWXRBSnctaW1nLTNfMTc3MDk0MTQyNTAwMF9uYTFmbl9ZMkZ5WkMxMFpYaDBkWEpsLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=NwbO2hSlXZECY4hHxTgt3pwhEz65-RQLXrytXjEqXQcsiu-Naffa03ArEh0nCy0~-o0PVVV6hck6UbEKtR1kFbiII-i9EyI-Vphqpjpg4ZrjiiorMcpC6VNglSA0iVfO4s6VUDYmuxw9EUFhFNdpTx3DnSXUsdQBwMuLUthgKoxBZ~jdP8QcKeiY1rSAEiDquOAf~eV1OD5~aBaCbyYS1JZuTUKRbjYYjt4NbNo4SdL~6efi1BH~PjBhlV3qA9cFh-djHmYi2YGWJUvnBR-lfx49JO6W2Aqa1DT3bu~f8cAggept1WFo~jzOiF0qmt9Xw7tgm68f3i4RycvS-iPgsQ__')`,
                  backgroundSize: 'cover',
                }}
              >
                <h3 className="font-heading font-bold text-2xl text-accent mb-4">{section.title}</h3>
                <ul className="space-y-2">
                  {section.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-start gap-2 text-foreground font-heading">
                      <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bot Automation Section */}
          <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl p-8 lg:p-12 border-2 border-accent/50 mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Bot className="w-10 h-10 text-accent" />
              <h2 className="font-display font-black text-3xl lg:text-4xl text-accent">Bot Automation</h2>
            </div>
            <p className="font-heading text-xl text-center text-foreground mb-8 max-w-3xl mx-auto">
              Bots handle all the heavy lifting so you can focus on what's most important: <span className="text-accent font-bold">the profit</span>
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-card/80 rounded-xl p-6 border border-accent/30">
                <MessageSquare className="w-8 h-8 text-accent mb-4" />
                <h4 className="font-heading font-bold text-lg text-accent mb-2">SMS Updates</h4>
                <p className="text-muted-foreground font-heading text-sm">
                  Automated text notifications for order confirmations, shipping updates, and delivery alerts
                </p>
              </div>
              
              <div className="bg-card/80 rounded-xl p-6 border border-accent/30">
                <MessageSquare className="w-8 h-8 text-accent mb-4" />
                <h4 className="font-heading font-bold text-lg text-accent mb-2">Telegram Integration</h4>
                <p className="text-muted-foreground font-heading text-sm">
                  Instant order notifications to your phone, customer support bot, and automated responses
                </p>
              </div>
              
              <div className="bg-card/80 rounded-xl p-6 border border-accent/30">
                <MessageSquare className="w-8 h-8 text-accent mb-4" />
                <h4 className="font-heading font-bold text-lg text-accent mb-2">WhatsApp Business</h4>
                <p className="text-muted-foreground font-heading text-sm">
                  Reach customers on their preferred platform with order updates and support messages
                </p>
              </div>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-accent/50">
              <div className="flex items-start gap-3 mb-4">
                <Zap className="w-6 h-6 text-accent mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-heading font-bold text-lg text-accent mb-2">What Gets Automated:</h4>
                  <ul className="space-y-2 text-foreground font-heading">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Order confirmations sent instantly to customers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Shipping and delivery status updates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Abandoned cart recovery messages</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Customer support inquiries and FAQs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>New product announcements and promotions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>Owner notifications for new orders (Telegram)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button
              size="lg"
              className="bg-accent text-background hover:bg-accent/90 font-heading font-bold text-lg px-8 py-6 neon-glow"
              onClick={() => setLocation('/booking')}
            >
              See Pricing & Book Demo
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
