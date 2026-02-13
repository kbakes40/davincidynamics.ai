/**
 * Booking Page - Matches promo theme exactly
 * Dark space background, neon cyan accents, futuristic design
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useBooking } from "@/contexts/BookingContext";
import { useChat } from "@/contexts/ChatContext";

type PackageTier = "starter" | "growth" | "scale" | null;

export default function Booking() {
  const { setBookingData } = useBooking();
  const { openChat } = useChat();
  const [selectedTier, setSelectedTier] = useState<PackageTier>(null);
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    cityState: "",
    meetingType: "Phone",
    notes: "",
  });


  const bookingUrl = import.meta.env.VITE_BOOKING_URL || "";

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleTierSelect = (tier: PackageTier) => {
    setSelectedTier(tier);
    scrollToSection("booking-section");
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)})${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)})${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const submitBooking = trpc.booking.submit.useMutation({
    onSuccess: () => {
      toast.success("Demo Request Submitted!", {
        description: "We'll contact you within 24 hours to schedule your demo.",
      });
      
      // Set booking context for chat widget
      setBookingData({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        package: selectedTier ? getTierName(selectedTier) : "Not selected",
        message: formData.notes,
      });
      
      // Reset form
      setFormData({
        name: "",
        businessName: "",
        email: "",
        phone: "",
        cityState: "",
        meetingType: "Phone",
        notes: "",
      });
      setSelectedTier(null);
    },
    onError: (error) => {
      toast.error("Submission Failed", {
        description: error.message || "Please try again later.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.businessName || !formData.email || !formData.phone || !formData.cityState) {
      toast.error("Missing Information", {
        description: "Please fill in all required fields.",
      });
      return;
    }

    // Submit to backend
    submitBooking.mutate({
      ...formData,
      preferredPackage: selectedTier ? getTierName(selectedTier) : "Not selected",
    });
  };

  const getTierName = (tier: PackageTier) => {
    switch (tier) {
      case "starter":
        return "Starter Launch";
      case "growth":
        return "Growth System";
      case "scale":
        return "Scale Partner";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden pb-32">
      {/* Background glow effects */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <main className="relative z-10 container mx-auto px-4 py-8 lg:py-12">
        {/* Packages Section - Now Hero */}
        <section id="packages-section" className="mb-16 max-w-7xl mx-auto">
          <h2 className="font-display font-bold text-2xl lg:text-3xl text-center text-neon mb-8">
            Choose Your Package
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Tier 1: Starter Launch */}
            <div
              className={`bg-card rounded-xl p-6 lg:p-8 border shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                selectedTier === "starter"
                  ? "border-accent neon-glow"
                  : "border-border/50 hover:shadow-[0_0_30px_rgba(0,217,255,0.15)]"
              }`}
              style={{
                backgroundImage: `url('https://private-us-east-1.manuscdn.com/sessionFile/dCGapd5ewVrrofgrkY54Ge/sandbox/MDz8hgGj6z586IAHhYtAJw-img-3_1770941425000_na1fn_Y2FyZC10ZXh0dXJl.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZENHYXBkNWV3VnJyb2ZncmtZNTRHZS9zYW5kYm94L01EejhoZ0dqNno1ODZJQUhoWXRBSnctaW1nLTNfMTc3MDk0MTQyNTAwMF9uYTFmbl9ZMkZ5WkMxMFpYaDBkWEpsLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=NwbO2hSlXZECY4hHxTgt3pwhEz65-RQLXrytXjEqXQcsiu-Naffa03ArEh0nCy0~-o0PVVV6hck6UbEKtR1kFbiII-i9EyI-Vphqpjpg4ZrjiiorMcpC6VNglSA0iVfO4s6VUDYmuxw9EUFhFNdpTx3DnSXUsdQBwMuLUthgKoxBZ~jdP8QcKeiY1rSAEiDquOAf~eV1OD5~aBaCbyYS1JZuTUKRbjYYjt4NbNo4SdL~6efi1BH~PjBhlV3qA9cFh-djHmYi2YGWJUvnBR-lfx49JO6W2Aqa1DT3bu~f8cAggept1WFo~jzOiF0qmt9Xw7tgm68f3i4RycvS-iPgsQ__')`,
                backgroundSize: "cover",
              }}
              onClick={() => handleTierSelect("starter")}
            >
              <h3 className="font-heading font-bold text-xl lg:text-2xl mb-3 text-foreground">
                Starter Launch
              </h3>
              <div className="mb-4">
                <p className="text-muted-foreground text-xs lg:text-sm font-heading">
                  Setup: <span className="text-foreground font-semibold">$2,500</span>
                </p>
                <p className="text-accent text-2xl lg:text-3xl font-display font-black">
                  $500
                  <span className="text-sm lg:text-base text-muted-foreground font-heading font-normal">
                    /month
                  </span>
                </p>
              </div>

              <ul className="space-y-2 mb-6">
                {[
                  "Full e-commerce site",
                  "In store pickup and shipping setup",
                  "Zelle integration",
                  "Dashboard access",
                  "Text notifications",
                  "Basic support",
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs lg:text-sm text-foreground/90">
                    <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="font-heading">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={selectedTier === "starter" ? "default" : "outline"}
                className={
                  selectedTier === "starter"
                    ? "w-full bg-accent text-background hover:bg-accent/90 font-heading font-bold"
                    : "w-full border-accent/50 text-accent hover:bg-accent/10 hover:border-accent font-heading font-semibold"
                }
                onClick={(e) => {
                  e.stopPropagation();
                  handleTierSelect("starter");
                }}
              >
                {selectedTier === "starter" ? "Selected ✓" : "Select Starter"}
              </Button>
            </div>

            {/* Tier 2: Growth System */}
            <div
              className={`bg-card rounded-xl p-6 lg:p-8 border shadow-2xl relative transition-all duration-300 hover:scale-[1.02] cursor-pointer lg:scale-105 ${
                selectedTier === "growth"
                  ? "border-accent neon-glow"
                  : "border-accent/50 hover:shadow-[0_0_30px_rgba(0,217,255,0.2)]"
              }`}
              style={{
                backgroundImage: `url('https://private-us-east-1.manuscdn.com/sessionFile/dCGapd5ewVrrofgrkY54Ge/sandbox/MDz8hgGj6z586IAHhYtAJw-img-3_1770941425000_na1fn_Y2FyZC10ZXh0dXJl.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZENHYXBkNWV3VnJyb2ZncmtZNTRHZS9zYW5kYm94L01EejhoZ0dqNno1ODZJQUhoWXRBSnctaW1nLTNfMTc3MDk0MTQyNTAwMF9uYTFmbl9ZMkZ5WkMxMFpYaDBkWEpsLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=NwbO2hSlXZECY4hHxTgt3pwhEz65-RQLXrytXjEqXQcsiu-Naffa03ArEh0nCy0~-o0PVVV6hck6UbEKtR1kFbiII-i9EyI-Vphqpjpg4ZrjiiorMcpC6VNglSA0iVfO4s6VUDYmuxw9EUFhFNdpTx3DnSXUsdQBwMuLUthgKoxBZ~jdP8QcKeiY1rSAEiDquOAf~eV1OD5~aBaCbyYS1JZuTUKRbjYYjt4NbNo4SdL~6efi1BH~PjBhlV3qA9cFh-djHmYi2YGWJUvnBR-lfx49JO6W2Aqa1DT3bu~f8cAggept1WFo~jzOiF0qmt9Xw7tgm68f3i4RycvS-iPgsQ__')`,
                backgroundSize: "cover",
              }}
              onClick={() => handleTierSelect("growth")}
            >
              {/* Most Popular Badge */}
              <div className="absolute -top-3 right-4 bg-accent text-background px-3 py-1 rounded-full text-xs font-heading font-bold shadow-lg">
                Most Popular
              </div>

              <h3 className="font-heading font-bold text-xl lg:text-2xl mb-3 text-foreground">
                Growth System
              </h3>
              <div className="mb-4">
                <p className="text-muted-foreground text-xs lg:text-sm font-heading">
                  Setup: <span className="text-foreground font-semibold">$3,500 to $5,000</span>
                </p>
                <p className="text-accent text-2xl lg:text-3xl font-display font-black">
                  $1,000 to $1,500
                  <span className="text-sm lg:text-base text-muted-foreground font-heading font-normal">
                    /month
                  </span>
                </p>
              </div>

              <ul className="space-y-2 mb-6">
                {[
                  "Everything in Starter",
                  "Authorize.net card processing",
                  "Cleaner payment flows",
                  "Saved customer accounts",
                  "Stored ID verification",
                  "Email marketing setup",
                  "Conversion optimization",
                  "Ongoing management",
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs lg:text-sm text-foreground/90">
                    <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="font-heading">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={selectedTier === "growth" ? "default" : "default"}
                className="w-full bg-accent text-background hover:bg-accent/90 font-heading font-bold neon-glow-intense"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTierSelect("growth");
                }}
              >
                {selectedTier === "growth" ? "Selected ✓" : "Select Growth"}
              </Button>
            </div>

            {/* Tier 3: Scale Partner */}
            <div
              className={`bg-card rounded-xl p-6 lg:p-8 border shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                selectedTier === "scale"
                  ? "border-accent neon-glow"
                  : "border-border/50 hover:shadow-[0_0_30px_rgba(0,217,255,0.15)]"
              }`}
              style={{
                backgroundImage: `url('https://private-us-east-1.manuscdn.com/sessionFile/dCGapd5ewVrrofgrkY54Ge/sandbox/MDz8hgGj6z586IAHhYtAJw-img-3_1770941425000_na1fn_Y2FyZC10ZXh0dXJl.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZENHYXBkNWV3VnJyb2ZncmtZNTRHZS9zYW5kYm94L01EejhoZ0dqNno1ODZJQUhoWXRBSnctaW1nLTNfMTc3MDk0MTQyNTAwMF9uYTFmbl9ZMkZ5WkMxMFpYaDBkWEpsLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=NwbO2hSlXZECY4hHxTgt3pwhEz65-RQLXrytXjEqXQcsiu-Naffa03ArEh0nCy0~-o0PVVV6hck6UbEKtR1kFbiII-i9EyI-Vphqpjpg4ZrjiiorMcpC6VNglSA0iVfO4s6VUDYmuxw9EUFhFNdpTx3DnSXUsdQBwMuLUthgKoxBZ~jdP8QcKeiY1rSAEiDquOAf~eV1OD5~aBaCbyYS1JZuTUKRbjYYjt4NbNo4SdL~6efi1BH~PjBhlV3qA9cFh-djHmYi2YGWJUvnBR-lfx49JO6W2Aqa1DT3bu~f8cAggept1WFo~jzOiF0qmt9Xw7tgm68f3i4RycvS-iPgsQ__')`,
                backgroundSize: "cover",
              }}
              onClick={() => handleTierSelect("scale")}
            >
              <h3 className="font-heading font-bold text-xl lg:text-2xl mb-3 text-foreground">
                Scale Partner
              </h3>
              <div className="mb-4">
                <p className="text-muted-foreground text-xs lg:text-sm font-heading">
                  Setup: <span className="text-foreground font-semibold">$5,000+</span>
                </p>
                <p className="text-accent text-2xl lg:text-3xl font-display font-black">
                  $2,000+
                  <span className="text-sm lg:text-base text-muted-foreground font-heading font-normal">
                    /month or revenue share
                  </span>
                </p>
              </div>

              <ul className="space-y-2 mb-6">
                {[
                  "Full ad management",
                  "Google and social ads strategy",
                  "Funnel optimization",
                  "SMS campaigns",
                  "Backend automation",
                  "Reporting dashboards",
                  "Aggressive growth strategy",
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs lg:text-sm text-foreground/90">
                    <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="font-heading">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={selectedTier === "scale" ? "default" : "outline"}
                className={
                  selectedTier === "scale"
                    ? "w-full bg-accent text-background hover:bg-accent/90 font-heading font-bold"
                    : "w-full border-accent/50 text-accent hover:bg-accent/10 hover:border-accent font-heading font-semibold"
                }
                onClick={(e) => {
                  e.stopPropagation();
                  handleTierSelect("scale");
                }}
              >
                {selectedTier === "scale" ? "Selected ✓" : "Select Scale"}
              </Button>
            </div>
          </div>
        </section>

        {/* Booking Section */}
        <section id="booking-section" className="mb-16 max-w-4xl mx-auto">
          <div
            className="bg-card rounded-xl p-6 lg:p-8 border border-accent/30 shadow-2xl"
            style={{
              backgroundImage: `url('https://private-us-east-1.manuscdn.com/sessionFile/dCGapd5ewVrrofgrkY54Ge/sandbox/MDz8hgGj6z586IAHhYtAJw-img-3_1770941425000_na1fn_Y2FyZC10ZXh0dXJl.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZENHYXBkNWV3VnJyb2ZncmtZNTRHZS9zYW5kYm94L01EejhoZ0dqNno1ODZJQUhoWXRBSnctaW1nLTNfMTc3MDk0MTQyNTAwMF9uYTFmbl9ZMkZ5WkMxMFpYaDBkWEplLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=NwbO2hSlXZECY4hHxTgt3pwhEz65-RQLXrytXjEqXQcsiu-Naffa03ArEh0nCy0~-o0PVVV6hck6UbEKtR1kFbiII-i9EyI-Vphqpjpg4ZrjiiorMcpC6VNglSA0iVfO4s6VUDYmuxw9EUFhFNdpTx3DnSXUsdQBwMuLUthgKoxBZ~jdP8QcKeiY1rSAEiDquOAf~eV1OD5~aBaCbyYS1JZuTUKRbjYYjt4NbNo4SdL~6efi1BH~PjBhlV3qA9cFh-djHmYi2YGWJUvnBR-lfx49JO6W2Aqa1DT3bu~f8cAggept1WFo~jzOiF0qmt9Xw7tgm68f3i4RycvS-iPgsQ__')`,
              backgroundSize: "cover",
            }}
          >
            <h2 className="font-display font-bold text-2xl lg:text-3xl text-neon mb-2 text-center">
              {selectedTier ? `Selected Package: ${getTierName(selectedTier)}` : "Schedule Your Demo"}
            </h2>
            <p className="text-muted-foreground text-center mb-6 font-heading">
              Choose how you'd like to connect with us
            </p>

            {/* Bot Chat Option */}
            <div className="mb-8 p-6 bg-accent/10 border border-accent/30 rounded-lg">
              <h3 className="font-heading font-bold text-lg text-accent mb-3 text-center">
                💬 Prefer to Chat? Talk to Our AI Assistant
              </h3>
              <p className="text-muted-foreground text-sm text-center mb-4 font-heading">
                Get instant answers about pricing, demos, and scaling options
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  variant="default"
                  className="bg-accent text-background hover:bg-accent/90 font-heading font-bold"
                  onClick={openChat}
                >
                  Chat with Sophia
                </Button>
                <Button
                  variant="outline"
                  className="border-accent/50 text-accent hover:bg-accent/10 hover:border-accent font-heading font-semibold"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  View Pricing
                </Button>
                <Button
                  variant="outline"
                  className="border-accent/50 text-accent hover:bg-accent/10 hover:border-accent font-heading font-semibold"
                  onClick={() => window.location.href = '/platform-demo'}
                >
                  Watch Demo
                </Button>
              </div>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-accent/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground font-heading">Or fill out the form below</span>
              </div>
            </div>

            {bookingUrl ? (
              <div className="w-full h-[600px] rounded-lg overflow-hidden">
                <iframe
                  src={bookingUrl}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  className="rounded-lg"
                  title="Booking Calendar"
                />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-heading font-semibold text-foreground mb-2">
                      Name *
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-background/50 border-accent/30 text-foreground"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-heading font-semibold text-foreground mb-2">
                      Business Name
                    </label>
                    <Input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="bg-background/50 border-accent/30 text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-heading font-semibold text-foreground mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-background/50 border-accent/30 text-foreground"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-heading font-semibold text-foreground mb-2">
                      Phone Number * (xxx)xxx-xxxx
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      placeholder="(555)555-5555"
                      maxLength={13}
                      className="bg-background/50 border-accent/30 text-foreground"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-heading font-semibold text-foreground mb-2">
                    City and State
                  </label>
                  <Input
                    type="text"
                    value={formData.cityState}
                    onChange={(e) => setFormData({ ...formData, cityState: e.target.value })}
                    placeholder="e.g., Los Angeles, CA"
                    className="bg-background/50 border-accent/30 text-foreground"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-heading font-semibold text-foreground mb-2">
                      Preferred Package
                    </label>
                    <div className="relative">
                      <select
                        value={selectedTier || ""}
                        onChange={(e) => setSelectedTier(e.target.value as PackageTier)}
                        className="w-full bg-background/50 border border-accent/30 text-foreground rounded-md px-3 py-2 font-heading appearance-none"
                      >
                        <option value="">Select a package</option>
                        <option value="starter">Starter Launch</option>
                        <option value="growth">Growth System</option>
                        <option value="scale">Scale Partner</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-heading font-semibold text-foreground mb-2">
                      Preferred Meeting Type
                    </label>
                    <div className="relative">
                      <select
                        value={formData.meetingType}
                        onChange={(e) => setFormData({ ...formData, meetingType: e.target.value })}
                        className="w-full bg-background/50 border border-accent/30 text-foreground rounded-md px-3 py-2 font-heading appearance-none"
                      >
                        <option value="Phone">Phone</option>
                        <option value="Google Meet">Google Meet</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-heading font-semibold text-foreground mb-2">
                    Notes
                  </label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Tell us about your business and what you're looking for..."
                    className="bg-background/50 border-accent/30 text-foreground min-h-[100px]"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-accent text-background hover:bg-accent/90 font-heading font-bold neon-glow-intense"
                >
                  Request Demo
                </Button>
              </form>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16 max-w-4xl mx-auto">
          <h2 className="font-display font-bold text-2xl lg:text-3xl text-center text-neon mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {[
              {
                q: "How long does setup take?",
                a: "Starter Launch typically takes 2-3 weeks. Growth System takes 3-4 weeks. Scale Partner timelines are customized based on your needs.",
              },
              {
                q: "Do you offer payment plans?",
                a: "Yes! We offer flexible payment plans for the setup fee. Monthly fees are billed at the beginning of each month.",
              },
              {
                q: "Can I upgrade my package later?",
                a: "Absolutely. You can upgrade at any time. We'll credit your current setup fee toward the new tier.",
              },
              {
                q: "What if I need custom features?",
                a: "We specialize in custom builds. Schedule a demo to discuss your specific requirements and we'll provide a tailored quote.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-card rounded-lg p-6 border border-accent/20"
                style={{
                  backgroundImage: `url('https://private-us-east-1.manuscdn.com/sessionFile/dCGapd5ewVrrofgrkY54Ge/sandbox/MDz8hgGj6z586IAHhYtAJw-img-3_1770941425000_na1fn_Y2FyZC10ZXh0dXJl.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZENHYXBkNWV3VnJyb2ZncmtZNTRHZS9zYW5kYm94L01EejhoZ0dqNno1ODZJQUhoWXRBSnctaW1nLTNfMTc3MDk0MTQyNTAwMF9uYTFmbl9ZMkZ5WkMxMFpYaDBkWEplLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=NwbO2hSlXZECY4hHxTgt3pwhEz65-RQLXrytXjEqXQcsiu-Naffa03ArEh0nCy0~-o0PVVV6hck6UbEKtR1kFbiII-i9EyI-Vphqpjpg4ZrjiiorMcpC6VNglSA0iVfO4s6VUDYmuxw9EUFhFNdpTx3DnSXUsdQBwMuLUthgKoxBZ~jdP8QcKeiY1rSAEiDquOAf~eV1OD5~aBaCbyYS1JZuTUKRbjYYjt4NbNo4SdL~6efi1BH~PjBhlV3qA9cFh-djHmYi2YGWJUvnBR-lfx49JO6W2Aqa1DT3bu~f8cAggept1WFo~jzOiF0qmt9Xw7tgm68f3i4RycvS-iPgsQ__')`,
                  backgroundSize: "cover",
                }}
              >
                <h3 className="font-heading font-bold text-lg text-neon mb-2">{faq.q}</h3>
                <p className="text-muted-foreground font-heading text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center">
          <div
            className="bg-card rounded-xl p-8 lg:p-12 border border-accent/30 shadow-2xl max-w-3xl mx-auto"
            style={{
              backgroundImage: `url('https://private-us-east-1.manuscdn.com/sessionFile/dCGapd5ewVrrofgrkY54Ge/sandbox/MDz8hgGj6z586IAHhYtAJw-img-3_1770941425000_na1fn_Y2FyZC10ZXh0dXJl.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZENHYXBkNWV3VnJyb2ZncmtZNTRHZS9zYW5kYm94L01EejhoZ0dqNno1ODZJQUhoWXRBSnctaW1nLTNfMTc3MDk0MTQyNTAwMF9uYTFmbl9ZMkZ5WkMxMFpYaDBkWEplLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=NwbO2hSlXZECY4hHxTgt3pwhEz65-RQLXrytXjEqXQcsiu-Naffa03ArEh0nCy0~-o0PVVV6hck6UbEKtR1kFbiII-i9EyI-Vphqpjpg4ZrjiiorMcpC6VNglSA0iVfO4s6VUDYmuxw9EUFhFNdpTx3DnSXUsdQBwMuLUthgKoxBZ~jdP8QcKeiY1rSAEiDquOAf~eV1OD5~aBaCbyYS1JZuTUKRbjYYjt4NbNo4SdL~6efi1BH~PjBhlV3qA9cFh-djHmYi2YGWJUvnBR-lfx49JO6W2Aqa1DT3bu~f8cAggept1WFo~jzOiF0qmt9Xw7tgm68f3i4RycvS-iPgsQ__')`,
              backgroundSize: "cover",
            }}
          >
            <h2 className="font-display font-bold text-2xl lg:text-3xl text-neon mb-4">
              Ready to Transform Your Retail Business?
            </h2>
            <p className="text-muted-foreground font-heading mb-6">
              Join dozens of store owners who've cut their monthly platform fees by 60%+ while owning their customer data and automating operations.
            </p>
            <Button
              size="lg"
              className="bg-accent text-background hover:bg-accent/90 font-heading font-bold neon-glow-intense"
              onClick={() => scrollToSection("booking-section")}
            >
              Book Your Demo Now
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
