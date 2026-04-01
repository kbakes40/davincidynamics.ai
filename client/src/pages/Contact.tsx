/**
 * Contact Page - Contact Information and Inquiry Form
 */

import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { onTelegramCta } from "@/lib/telegramCtas";
import {
  brandBackdrop,
  brandBackdropLayerA,
  brandBackdropLayerB,
  brandBreakdownButton,
  brandCard,
  brandCardHover,
  brandGrayPanel,
  brandGrayPanelHover,
  brandInput,
  brandPageRoot,
  brandPrimaryButton,
  brandSecondaryButton,
} from "@/lib/brandStyles";

export default function Contact() {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    company: string;
    department: "general" | "sales" | "projects" | "support" | "billing" | "";
    message: string;
  }>({
    name: "",
    email: "",
    company: "",
    department: "",
    message: "",
  });

  const submitInquiry = trpc.booking.submit.useMutation({
    onSuccess: () => {
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setFormData({ name: "", email: "", company: "", department: "", message: "" });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send message. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.department || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    submitInquiry.mutate({
      name: formData.name,
      email: formData.email,
      company: formData.company || undefined,
      department: formData.department as "general" | "sales" | "projects" | "support" | "billing",
      message: formData.message,
    });
  };

  return (
    <div className={brandPageRoot}>
      <Navigation />

      <div className={brandBackdrop}>
        <div className={brandBackdropLayerA} />
        <div className={brandBackdropLayerB} />
      </div>

      <main className="relative z-10 container mx-auto mb-24 px-4 py-16 md:py-20">
        <div className="max-w-5xl mx-auto">
          <h1 className="mb-6 text-center font-display text-4xl font-black text-white/92 lg:text-5xl">
            Get In Touch
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-center font-heading text-lg text-muted-foreground">
            Ready for transparent all-in-one pricing? Contact us for a free consultation.
          </p>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <div className={`${brandGrayPanel} ${brandGrayPanelHover} rounded-xl p-6`}
                style={{
                  backgroundImage: "linear-gradient(160deg, rgba(71,85,105,0.62) 0%, rgba(51,65,85,0.74) 46%, rgba(30,41,59,0.86) 100%), url('https://private-us-east-1.manuscdn.com/sessionFile/dCGapd5ewVrrofgrkY54Ge/sandbox/MDz8hgGj6z586IAHhYtAJw-img-3_1770941425000_na1fn_Y2FyZC10ZXh0dXJl.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZENHYXBkNWV3VnJyb2ZncmtZNTRHZS9zYW5kYm94L01EejhoZ0dqNno1ODZJQUhoWXRBSnctaW1nLTNfMTc3MDk0MTQyNTAwMF9uYTFmbl9ZMkZ5WkMxMFpYaDBkWEpsLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=NwbO2hSlXZECY4hHxTgt3pwhEz65-RQLXrytXjEqXQcsiu-Naffa03ArEh0nCy0~-o0PVVV6hck6UbEKtR1kFbiII-i9EyI-Vphqpjpg4ZrjiiorMcpC6VNglSA0iVfO4s6VUDYmuxw9EUFhFNdpTx3DnSXUsdQBwMuLUthgKoxBZ~jdP8QcKeiY1rSAEiDquOAf~eV1OD5~aBaCbyYS1JZuTUKRbjYYjt4NbNo4SdL~6efi1BH~PjBhlV3qA9cFh-djHmYi2YGWJUvnBR-lfx49JO6W2Aqa1DT3bu~f8cAggept1WFo~jzOiF0qmt9Xw7tgm68f3i4RycvS-iPgsQ__')",
                  backgroundBlendMode: "normal, soft-light",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundColor: "rgba(30,41,59,0.82)",
                }}
              >
                <h2 className="mb-6 font-heading text-2xl font-bold text-cyan-100">Contact Information</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-accent mt-1" />
                    <div>
                      <p className="font-heading font-semibold text-foreground">Phone</p>
                      <a href="tel:+18883211768" className="font-heading text-muted-foreground transition-colors hover:text-cyan-200">
                        +1 (888) 321-1768
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-accent mt-1" />
                    <div>
                      <p className="font-heading font-semibold text-foreground">Email</p>
                      <a href="mailto:info@davincidynamics.ai" className="font-heading text-muted-foreground transition-colors hover:text-cyan-200">
                        info@davincidynamics.ai
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-accent mt-1" />
                    <div>
                      <p className="font-heading font-semibold text-foreground">Address</p>
                      <p className="font-heading text-muted-foreground">
                        455 E Eisenhower Pkwy<br />
                        Suite 300 PMB1134<br />
                        Ann Arbor, MI 48108<br />
                        United States
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${brandGrayPanel} ${brandGrayPanelHover} rounded-xl p-6`}
                style={{
                  backgroundImage: "linear-gradient(160deg, rgba(71,85,105,0.62) 0%, rgba(51,65,85,0.74) 46%, rgba(30,41,59,0.86) 100%), url('https://private-us-east-1.manuscdn.com/sessionFile/dCGapd5ewVrrofgrkY54Ge/sandbox/MDz8hgGj6z586IAHhYtAJw-img-3_1770941425000_na1fn_Y2FyZC10ZXh0dXJl.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZENHYXBkNWV3VnJyb2ZncmtZNTRHZS9zYW5kYm94L01EejhoZ0dqNno1ODZJQUhoWXRBSnctaW1nLTNfMTc3MDk0MTQyNTAwMF9uYTFmbl9ZMkZ5WkMxMFpYaDBkWEplLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=NwbO2hSlXZECY4hHxTgt3pwhEz65-RQLXrytXjEqXQcsiu-Naffa03ArEh0nCy0~-o0PVVV6hck6UbEKtR1kFbiII-i9EyI-Vphqpjpg4ZrjiiorMcpC6VNglSA0iVfO4s6VUDYmuxw9EUFhFNdpTx3DnSXUsdQBwMuLUthgKoxBZ~jdP8QcKeiY1rSAEiDquOAf~eV1OD5~aBaCbyYS1JZuTUKRbjYYjt4NbNo4SdL~6efi1BH~PjBhlV3qA9cFh-djHmYi2YGWJUvnBR-lfx49JO6W2Aqa1DT3bu~f8cAggept1WFo~jzOiF0qmt9Xw7tgm68f3i4RycvS-iPgsQ__')",
                  backgroundBlendMode: "normal, soft-light",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundColor: "rgba(30,41,59,0.82)",
                }}
              >
                <h3 className="mb-3 font-heading text-lg font-bold text-cyan-100">Business Hours</h3>
                <p className="font-heading text-muted-foreground">
                  Monday - Friday: 9:00 AM - 6:00 PM EST<br />
                  Saturday - Sunday: Closed
                </p>
              </div>

              <Button
                type="button"
                className={`${brandBreakdownButton} w-full`}
                onClick={onTelegramCta("contact")}
              >
                Get a Breakdown
              </Button>
            </div>

            {/* Contact Form */}
            <div className={`${brandCard} rounded-xl p-6 lg:p-8`}
              style={{
                backgroundImage: `url('https://private-us-east-1.manuscdn.com/sessionFile/dCGapd5ewVrrofgrkY54Ge/sandbox/MDz8hgGj6z586IAHhYtAJw-img-3_1770941425000_na1fn_Y2FyZC10ZXh0dXJl.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZENHYXBkNWV3VnJyb2ZncmtZNTRHZS9zYW5kYm94L01EejhoZ0dqNno1ODZJQUhoWXRBSnctaW1nLTNfMTc3MDk0MTQyNTAwMF9uYTFmbl9ZMkZ5WkMxMFpYaDBkWEplLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=NwbO2hSlXZECY4hHxTgt3pwhEz65-RQLXrytXjEqXQcsiu-Naffa03ArEh0nCy0~-o0PVVV6hck6UbEKtR1kFbiII-i9EyI-Vphqpjpg4ZrjiiorMcpC6VNglSA0iVfO4s6VUDYmuxw9EUFhFNdpTx3DnSXUsdQBwMuLUthgKoxBZ~jdP8QcKeiY1rSAEiDquOAf~eV1OD5~aBaCbyYS1JZuTUKRbjYYjt4NbNo4SdL~6efi1BH~PjBhlV3qA9cFh-djHmYi2YGWJUvnBR-lfx49JO6W2Aqa1DT3bu~f8cAggept1WFo~jzOiF0qmt9Xw7tgm68f3i4RycvS-iPgsQ__')`,
                backgroundSize: 'cover',
              }}
            >
              <h2 className="mb-6 font-heading text-2xl font-bold text-cyan-100">Send Us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block font-heading font-semibold text-foreground mb-2">
                    Name *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={brandInput}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block font-heading font-semibold text-foreground mb-2">
                    Email *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={brandInput}
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block font-heading font-semibold text-foreground mb-2">
                    Company/Business Name
                  </label>
                  <Input
                    id="company"
                    type="text"
                    placeholder="Your business name"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className={brandInput}
                  />
                </div>

                <div>
                  <label htmlFor="department" className="block font-heading font-semibold text-foreground mb-2">
                    Department *
                  </label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value as "general" | "sales" | "projects" | "support" | "billing" })}
                    required
                  >
                    <SelectTrigger className={`${brandInput} font-heading`}>
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectContent className="border-cyan-300/24 bg-slate-950/96">
                      <SelectItem value="general" className="font-heading">General Inquiry</SelectItem>
                      <SelectItem value="sales" className="font-heading">Sales Inquiry</SelectItem>
                      <SelectItem value="projects" className="font-heading">Active Project</SelectItem>
                      <SelectItem value="support" className="font-heading">Technical Support</SelectItem>
                      <SelectItem value="billing" className="font-heading">Billing and invoices</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="message" className="block font-heading font-semibold text-foreground mb-2">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Tell us about your business and what you're looking for..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={`${brandInput} min-h-[120px]`}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button type="submit" size="lg" className={brandPrimaryButton} disabled={submitInquiry.isPending}>
                    {submitInquiry.isPending ? "Sending..." : "Send Message"}
                  </Button>
                  <Button type="button" size="lg" className={brandSecondaryButton} onClick={onTelegramCta("contact")}>
                    Book Strategy Call
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


