/**
 * Design Philosophy: Cyberpunk Luxury
 * - High-contrast neon blue (#00D9FF) against pure black
 * - Horizontal three-column layout for desktop, stacked for mobile
 * - Electric glow effects and deep shadows
 * - Orbitron Bold for headlines, Rajdhani for subheadings
 */

import { Button } from "@/components/ui/button";
import { Check, Upload, Video } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [mobileVideoUrl, setMobileVideoUrl] = useState("");
  const [desktopVideoUrl, setDesktopVideoUrl] = useState("");
  const [mobileVideoFile, setMobileVideoFile] = useState<File | null>(null);
  const [desktopVideoFile, setDesktopVideoFile] = useState<File | null>(null);

  const handleMobileFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMobileVideoFile(file);
      setMobileVideoUrl(""); // Clear URL if file is uploaded
    }
  };

  const handleDesktopFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDesktopVideoFile(file);
      setDesktopVideoUrl(""); // Clear URL if file is uploaded
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background glow effects */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url('https://private-us-east-1.manuscdn.com/sessionFile/dCGapd5ewVrrofgrkY54Ge/sandbox/MDz8hgGj6z586IAHhYtAJw-img-1_1770941420000_na1fn_aGVyby1iZy1nbG93.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZENHYXBkNWV3VnJyb2ZncmtZNTRHZS9zYW5kYm94L01EejhoZ0dqNno1ODZJQUhoWXRBSnctaW1nLTFfMTc3MDk0MTQyMDAwMF9uYTFmbl9hR1Z5YnkxaVp5MW5iRzkzLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=dHPo7BMuVgOtAoVJlcG3ePx0xJCKglhBmAGlrGpzU5C29BHU2Ou1j~Z4Up2-lVV~hyfGgiaBXsyzcq2tEPvV6FK3Aw7fv2iGswyOP912OHtzOUdsoJ8S4KXVz0NWnU70KqCAdLluLzKHtUSMadP4l3f-VkfwBT6zuixZdWffTAIh2IaqnI20EUfwfqX9sa5xHdluauJw7CbWsmZRqZqVM0r3YX2vNsLZFGlvF13LJYjBWOdDjhRmBVWArqoRYWH5bRBd6Xaheb9ar73zVwC7g8MhBuC5AvfG0NTXQh-p-roW2HlHjRMz7uidb4QbyqyZy39UDy91wrD8iL-7eEAUGA__')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <main className="relative z-10 container mx-auto px-4 py-8 lg:py-12">
        {/* Header Section */}
        <header className="text-center mb-8 lg:mb-12 animate-fade-in-up">
          <h1 className="font-display font-black text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-4 leading-tight tracking-tight text-foreground">
            Turn Your Business Into a{" "}
            <span className="text-neon">Revenue Machine</span>
          </h1>
          <p className="font-heading text-sm md:text-base lg:text-lg text-muted-foreground mb-6 lg:mb-8 font-medium max-w-3xl mx-auto">
            This platform would cost $3,500 to $8,000 per month if built and managed yourself.
          </p>
          
          {/* Glowing divider */}
          <div className="relative h-px w-full max-w-md mx-auto mb-2">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent to-transparent neon-glow" />
          </div>
        </header>

        {/* Video Upload Section */}
        <section className="mb-12 max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="bg-card rounded-xl p-6 lg:p-8 border border-accent/30 shadow-2xl"
            style={{
              backgroundImage: `url('https://private-us-east-1.manuscdn.com/sessionFile/dCGapd5ewVrrofgrkY54Ge/sandbox/MDz8hgGj6z586IAHhYtAJw-img-3_1770941425000_na1fn_Y2FyZC10ZXh0dXJl.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZENHYXBkNWV3VnJyb2ZncmtZNTRHZS9zYW5kYm94L01EejhoZ0dqNno1ODZJQUhoWXRBSnctaW1nLTNfMTc3MDk0MTQyNTAwMF9uYTFmbl9ZMkZ5WkMxMFpYaDBkWEpsLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=NwbO2hSlXZECY4hHxTgt3pwhEz65-RQLXrytXjEqXQcsiu-Naffa03ArEh0nCy0~-o0PVVV6hck6UbEKtR1kFbiII-i9EyI-Vphqpjpg4ZrjiiorMcpC6VNglSA0iVfO4s6VUDYmuxw9EUFhFNdpTx3DnSXUsdQBwMuLUthgKoxBZ~jdP8QcKeiY1rSAEiDquOAf~eV1OD5~aBaCbyYS1JZuTUKRbjYYjt4NbNo4SdL~6efi1BH~PjBhlV3qA9cFh-djHmYi2YGWJUvnBR-lfx49JO6W2Aqa1DT3bu~f8cAggept1WFo~jzOiF0qmt9Xw7tgm68f3i4RycvS-iPgsQ__')`,
              backgroundSize: 'cover',
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Video className="w-6 h-6 text-accent" />
              <h2 className="font-heading font-bold text-2xl text-foreground">Upload Promo Videos</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mobile Video Upload (9:16) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-semibold text-lg text-foreground">Mobile Video (9:16)</h3>
                  <span className="text-xs text-muted-foreground font-heading">Max 10GB</span>
                </div>
                
                {/* Google Drive Link Input */}
                <div>
                  <label className="block text-sm font-heading text-muted-foreground mb-2">
                    Google Drive Link
                  </label>
                  <input
                    type="text"
                    placeholder="Paste Google Drive link..."
                    value={mobileVideoUrl}
                    onChange={(e) => {
                      setMobileVideoUrl(e.target.value);
                      setMobileVideoFile(null); // Clear file if URL is entered
                    }}
                    className="w-full px-4 py-3 bg-background/50 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent transition-colors font-heading text-sm"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border/50" />
                  <span className="text-xs text-muted-foreground font-heading">OR</span>
                  <div className="flex-1 h-px bg-border/50" />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-heading text-muted-foreground mb-2">
                    Upload Video File
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleMobileFileUpload}
                      className="hidden"
                      id="mobile-video-upload"
                    />
                    <label
                      htmlFor="mobile-video-upload"
                      className="flex items-center justify-center gap-2 w-full px-4 py-6 bg-background/50 border-2 border-dashed border-accent/30 rounded-lg cursor-pointer hover:border-accent/60 hover:bg-accent/5 transition-all"
                    >
                      <Upload className="w-5 h-5 text-accent" />
                      <span className="font-heading text-sm text-foreground">
                        {mobileVideoFile ? mobileVideoFile.name : "Click to upload"}
                      </span>
                    </label>
                  </div>
                  {mobileVideoFile && (
                    <p className="text-xs text-accent mt-2 font-heading">
                      ✓ {(mobileVideoFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  )}
                </div>
              </div>

              {/* Desktop Video Upload (16:9) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-semibold text-lg text-foreground">Desktop Video (16:9)</h3>
                  <span className="text-xs text-muted-foreground font-heading">Max 10GB</span>
                </div>
                
                {/* Google Drive Link Input */}
                <div>
                  <label className="block text-sm font-heading text-muted-foreground mb-2">
                    Google Drive Link
                  </label>
                  <input
                    type="text"
                    placeholder="Paste Google Drive link..."
                    value={desktopVideoUrl}
                    onChange={(e) => {
                      setDesktopVideoUrl(e.target.value);
                      setDesktopVideoFile(null); // Clear file if URL is entered
                    }}
                    className="w-full px-4 py-3 bg-background/50 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent transition-colors font-heading text-sm"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border/50" />
                  <span className="text-xs text-muted-foreground font-heading">OR</span>
                  <div className="flex-1 h-px bg-border/50" />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-heading text-muted-foreground mb-2">
                    Upload Video File
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleDesktopFileUpload}
                      className="hidden"
                      id="desktop-video-upload"
                    />
                    <label
                      htmlFor="desktop-video-upload"
                      className="flex items-center justify-center gap-2 w-full px-4 py-6 bg-background/50 border-2 border-dashed border-accent/30 rounded-lg cursor-pointer hover:border-accent/60 hover:bg-accent/5 transition-all"
                    >
                      <Upload className="w-5 h-5 text-accent" />
                      <span className="font-heading text-sm text-foreground">
                        {desktopVideoFile ? desktopVideoFile.name : "Click to upload"}
                      </span>
                    </label>
                  </div>
                  {desktopVideoFile && (
                    <p className="text-xs text-accent mt-2 font-heading">
                      ✓ {(desktopVideoFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border/30">
              <p className="text-xs text-muted-foreground font-heading text-center">
                Videos will be displayed above the pricing cards. Mobile video shows on portrait devices, desktop video on landscape.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards - Horizontal Layout for Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8 lg:mb-12 max-w-7xl mx-auto">
          {/* Card 1: Starter Launch */}
          <div 
            className="bg-card rounded-xl p-6 lg:p-8 border border-border/50 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,217,255,0.15)] animate-fade-in-up flex flex-col"
            style={{
              backgroundImage: `url('https://private-us-east-1.manuscdn.com/sessionFile/dCGapd5ewVrrofgrkY54Ge/sandbox/MDz8hgGj6z586IAHhYtAJw-img-3_1770941425000_na1fn_Y2FyZC10ZXh0dXJl.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZENHYXBkNWV3VnJyb2ZncmtZNTRHZS9zYW5kYm94L01EejhoZ0dqNno1ODZJQUhoWXRBSnctaW1nLTNfMTc3MDk0MTQyNTAwMF9uYTFmbl9ZMkZ5WkMxMFpYaDBkWEpsLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=NwbO2hSlXZECY4hHxTgt3pwhEz65-RQLXrytXjEqXQcsiu-Naffa03ArEh0nCy0~-o0PVVV6hck6UbEKtR1kFbiII-i9EyI-Vphqpjpg4ZrjiiorMcpC6VNglSA0iVfO4s6VUDYmuxw9EUFhFNdpTx3DnSXUsdQBwMuLUthgKoxBZ~jdP8QcKeiY1rSAEiDquOAf~eV1OD5~aBaCbyYS1JZuTUKRbjYYjt4NbNo4SdL~6efi1BH~PjBhlV3qA9cFh-djHmYi2YGWJUvnBR-lfx49JO6W2Aqa1DT3bu~f8cAggept1WFo~jzOiF0qmt9Xw7tgm68f3i4RycvS-iPgsQ__')`,
              backgroundSize: 'cover',
              animationDelay: '0.2s'
            }}
          >
            <h3 className="font-heading font-bold text-xl lg:text-2xl mb-3 text-foreground">Starter Launch</h3>
            <div className="mb-4">
              <p className="text-muted-foreground text-xs lg:text-sm font-heading">Setup: <span className="text-foreground font-semibold">$2,500</span></p>
              <p className="text-accent text-2xl lg:text-3xl font-display font-black">$500<span className="text-sm lg:text-base text-muted-foreground font-heading font-normal">/month</span></p>
            </div>
            
            <ul className="space-y-2 mb-6 flex-grow">
              {[
                "Full ecommerce website",
                "In store pickup and shipping",
                "Zelle integration",
                "Live order dashboard",
                "Text notifications",
                "Basic support"
              ].map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs lg:text-sm text-foreground/90">
                  <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span className="font-heading">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              variant="outline" 
              className="w-full border-accent/50 text-accent hover:bg-accent/10 hover:border-accent font-heading font-semibold transition-all duration-300"
              onClick={() => window.open('https://www.davincidynamics.ai', '_blank')}
            >
              Chat to Get Started
            </Button>
          </div>

          {/* Card 2: Growth System (Featured) */}
          <div 
            className="bg-card rounded-xl p-6 lg:p-8 border-2 border-accent shadow-2xl relative transition-all duration-300 hover:scale-[1.02] neon-glow animate-fade-in-up flex flex-col lg:scale-105"
            style={{
              backgroundImage: `url('https://private-us-east-1.manuscdn.com/sessionFile/dCGapd5ewVrrofgrkY54Ge/sandbox/MDz8hgGj6z586IAHhYtAJw-img-3_1770941425000_na1fn_Y2FyZC10ZXh0dXJl.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZENHYXBkNWV3VnJyb2ZncmtZNTRHZS9zYW5kYm94L01EejhoZ0dqNno1ODZJQUhoWXRBSnctaW1nLTNfMTc3MDk0MTQyNTAwMF9uYTFmbl9ZMkZ5WkMxMFpYaDBkWEpsLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=NwbO2hSlXZECY4hHxTgt3pwhEz65-RQLXrytXjEqXQcsiu-Naffa03ArEh0nCy0~-o0PVVV6hck6UbEKtR1kFbiII-i9EyI-Vphqpjpg4ZrjiiorMcpC6VNglSA0iVfO4s6VUDYmuxw9EUFhFNdpTx3DnSXUsdQBwMuLUthgKoxBZ~jdP8QcKeiY1rSAEiDquOAf~eV1OD5~aBaCbyYS1JZuTUKRbjYYjt4NbNo4SdL~6efi1BH~PjBhlV3qA9cFh-djHmYi2YGWJUvnBR-lfx49JO6W2Aqa1DT3bu~f8cAggept1WFo~jzOiF0qmt9Xw7tgm68f3i4RycvS-iPgsQ__')`,
              backgroundSize: 'cover',
              animationDelay: '0.3s'
            }}
          >
            {/* Most Popular Badge */}
            <div className="absolute -top-3 right-4 bg-accent text-background px-3 py-1 rounded-full text-xs font-heading font-bold shadow-lg">
              Most Popular
            </div>
            
            <h3 className="font-heading font-bold text-xl lg:text-2xl mb-3 text-foreground">Growth System</h3>
            <div className="mb-4">
              <p className="text-muted-foreground text-xs lg:text-sm font-heading">Setup: <span className="text-foreground font-semibold">$3,500 to $5,000</span></p>
              <p className="text-accent text-2xl lg:text-3xl font-display font-black">$1,000 to $1,500<span className="text-sm lg:text-base text-muted-foreground font-heading font-normal">/month</span></p>
            </div>
            
            <ul className="space-y-2 mb-6 flex-grow">
              {[
                "Everything in Starter",
                "Authorize.net card processing",
                "Cleaner checkout flows",
                "Saved customer accounts",
                "Stored ID verification",
                "Email marketing setup",
                "Conversion optimization",
                "Ongoing management"
              ].map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs lg:text-sm text-foreground/90">
                  <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span className="font-heading">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              className="w-full bg-accent text-background hover:bg-accent/90 font-heading font-bold transition-all duration-300 neon-glow-intense"
              onClick={() => window.open('https://www.davincidynamics.ai', '_blank')}
            >
              Chat With Us Now
            </Button>
          </div>

          {/* Card 3: Scale Partner */}
          <div 
            className="bg-card rounded-xl p-6 lg:p-8 border border-border/50 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,217,255,0.15)] animate-fade-in-up flex flex-col"
            style={{
              backgroundImage: `url('https://private-us-east-1.manuscdn.com/sessionFile/dCGapd5ewVrrofgrkY54Ge/sandbox/MDz8hgGj6z586IAHhYtAJw-img-3_1770941425000_na1fn_Y2FyZC10ZXh0dXJl.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZENHYXBkNWV3VnJyb2ZncmtZNTRHZS9zYW5kYm94L01EejhoZ0dqNno1ODZJQUhoWXRBSnctaW1nLTNfMTc3MDk0MTQyNTAwMF9uYTFmbl9ZMkZ5WkMxMFpYaDBkWEpsLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=NwbO2hSlXZECY4hHxTgt3pwhEz65-RQLXrytXjEqXQcsiu-Naffa03ArEh0nCy0~-o0PVVV6hck6UbEKtR1kFbiII-i9EyI-Vphqpjpg4ZrjiiorMcpC6VNglSA0iVfO4s6VUDYmuxw9EUFhFNdpTx3DnSXUsdQBwMuLUthgKoxBZ~jdP8QcKeiY1rSAEiDquOAf~eV1OD5~aBaCbyYS1JZuTUKRbjYYjt4NbNo4SdL~6efi1BH~PjBhlV3qA9cFh-djHmYi2YGWJUvnBR-lfx49JO6W2Aqa1DT3bu~f8cAggept1WFo~jzOiF0qmt9Xw7tgm68f3i4RycvS-iPgsQ__')`,
              backgroundSize: 'cover',
              animationDelay: '0.4s'
            }}
          >
            <h3 className="font-heading font-bold text-xl lg:text-2xl mb-3 text-foreground">Scale Partner</h3>
            <div className="mb-4">
              <p className="text-muted-foreground text-xs lg:text-sm font-heading">Setup: <span className="text-foreground font-semibold">$5,000+</span></p>
              <p className="text-accent text-2xl lg:text-3xl font-display font-black">$2,000+<span className="text-sm lg:text-base text-muted-foreground font-heading font-normal">/month or revenue share</span></p>
            </div>
            
            <ul className="space-y-2 mb-6 flex-grow">
              {[
                "Full ad management",
                "Google and social strategy",
                "SMS campaigns",
                "Backend automation",
                "Reporting dashboards",
                "Aggressive growth strategy"
              ].map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs lg:text-sm text-foreground/90">
                  <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span className="font-heading">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              variant="outline" 
              className="w-full border-accent/50 text-accent hover:bg-accent/10 hover:border-accent font-heading font-semibold transition-all duration-300"
              onClick={() => window.open('https://www.davincidynamics.ai', '_blank')}
            >
              Chat About Scaling
            </Button>
          </div>
        </div>

        {/* Bottom Section */}
        <footer className="text-center space-y-6 animate-fade-in-up max-w-2xl mx-auto" style={{ animationDelay: '0.5s' }}>
          <p className="text-sm text-muted-foreground font-heading mb-2">
            Own your customer data. Automate fulfillment. Scale smarter.
          </p>
          <p className="text-xs text-accent/80 font-heading mb-4">
            💬 Click below to chat instantly with our team
          </p>
          
          <Button 
            size="lg"
            className="w-full lg:w-auto lg:px-16 bg-accent text-background hover:bg-accent/90 font-heading font-bold text-base lg:text-lg py-6 transition-all duration-300 neon-glow-intense"
            onClick={() => window.open('https://www.davincidynamics.ai', '_blank')}
          >
            Start Chat Now
          </Button>
        </footer>
      </main>
    </div>
  );
}
