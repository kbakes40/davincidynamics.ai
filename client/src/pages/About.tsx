/**
 * About Page - DaVinci Dynamics Mission
 */

import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export default function About() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="container mx-auto px-4 py-16 mb-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display font-black text-4xl lg:text-5xl text-neon mb-6 text-center">
            About DaVinci Dynamics
          </h1>
          
          <div className="space-y-8">
            <div className="bg-card rounded-xl p-8 lg:p-12 border border-accent/30 shadow-xl"
              style={{
                backgroundImage: `url('https://private-us-east-1.manuscdn.com/sessionFile/dCGapd5ewVrrofgrkY54Ge/sandbox/MDz8hgGj6z586IAHhYtAJw-img-3_1770941425000_na1fn_Y2FyZC10ZXh0dXJl.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZENHYXBkNWV3VnJyb2ZncmtZNTRHZS9zYW5kYm94L01EejhoZ0dqNno1ODZJQUhoWXRBSnctaW1nLTNfMTc3MDk0MTQyNTAwMF9uYTFmbl9ZMkZ5WkMxMFpYaDBkWEpsLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=NwbO2hSlXZECY4hHxTgt3pwhEz65-RQLXrytXjEqXQcsiu-Naffa03ArEh0nCy0~-o0PVVV6hck6UbEKtR1kFbiII-i9EyI-Vphqpjpg4ZrjiiorMcpC6VNglSA0iVfO4s6VUDYmuxw9EUFhFNdpTx3DnSXUsdQBwMuLUthgKoxBZ~jdP8QcKeiY1rSAEiDquOAf~eV1OD5~aBaCbyYS1JZuTUKRbjYYjt4NbNo4SdL~6efi1BH~PjBhlV3qA9cFh-djHmYi2YGWJUvnBR-lfx49JO6W2Aqa1DT3bu~f8cAggept1WFo~jzOiF0qmt9Xw7tgm68f3i4RycvS-iPgsQ__')`,
                backgroundSize: 'cover',
              }}
            >
              <h2 className="font-heading font-bold text-2xl text-accent mb-4">Our Mission</h2>
              <p className="font-heading text-lg text-foreground mb-4">
                We built DaVinci Dynamics because we saw small business owners getting crushed by platform fees. 
                Facebook sellers, TikTok shops, and local retailers were losing 60-80% of their profits to Shopify, 
                Square, and payment processors—just to have a basic online store.
              </p>
              <p className="font-heading text-lg text-foreground">
                We knew there was a better way. We provide an all-in-one e-commerce service with transparent monthly pricing 
                that covers hosting, ad management, and platform maintenance. Lower fees, more control, and all the features you need 
                to compete with the big brands—without hidden costs or enterprise price tags.
              </p>
            </div>

            <div className="bg-card rounded-xl p-8 lg:p-12 border border-accent/30 shadow-xl"
              style={{
                backgroundImage: `url('https://private-us-east-1.manuscdn.com/sessionFile/dCGapd5ewVrrofgrkY54Ge/sandbox/MDz8hgGj6z586IAHhYtAJw-img-3_1770941425000_na1fn_Y2FyZC10ZXh0dXJl.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZENHYXBkNWV3VnJyb2ZncmtZNTRHZS9zYW5kYm94L01EejhoZ0dqNno1ODZJQUhoWXRBSnctaW1nLTNfMTc3MDk0MTQyNTAwMF9uYTFmbl9ZMkZ5WkMxMFpYaDBkWEplLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=NwbO2hSlXZECY4hHxTgt3pwhEz65-RQLXrytXjEqXQcsiu-Naffa03ArEh0nCy0~-o0PVVV6hck6UbEKtR1kFbiII-i9EyI-Vphqpjpg4ZrjiiorMcpC6VNglSA0iVfO4s6VUDYmuxw9EUFhFNdpTx3DnSXUsdQBwMuLUthgKoxBZ~jdP8QcKeiY1rSAEiDquOAf~eV1OD5~aBaCbyYS1JZuTUKRbjYYjt4NbNo4SdL~6efi1BH~PjBhlV3qA9cFh-djHmYi2YGWJUvnBR-lfx49JO6W2Aqa1DT3bu~f8cAggept1WFo~jzOiF0qmt9Xw7tgm68f3i4RycvS-iPgsQ__')`,
                backgroundSize: 'cover',
              }}
            >
              <h2 className="font-heading font-bold text-2xl text-accent mb-4">Why We're Different</h2>
              <ul className="space-y-3 font-heading text-lg text-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">→</span>
                  <span><strong>Transparent pricing:</strong> One monthly fee covers hosting, ads, and platform management</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">→</span>
                  <span><strong>Built for small sellers:</strong> Designed for Facebook/TikTok shops and local retailers, not enterprises</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">→</span>
                  <span><strong>Lower fees:</strong> Better payment processing rates than Shopify or Square</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">→</span>
                  <span><strong>Full service:</strong> We handle setup, hosting, ad management, and ongoing support</span>
                </li>
              </ul>
            </div>

            <div className="text-center">
              <Button
                size="lg"
                className="bg-accent text-background hover:bg-accent/90 font-heading font-bold text-lg px-8 py-6 neon-glow"
                onClick={() => setLocation('/booking')}
              >
                See How Much You'll Save
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
