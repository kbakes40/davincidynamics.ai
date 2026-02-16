/**
 * Shopify Alternative Landing Page
 * Uses existing DaVinci Dynamics design system
 */

import { Button } from "@/components/ui/button";
import { Check, ArrowRight, DollarSign, Zap, Shield, TrendingUp, Package, Clock, HelpCircle } from "lucide-react";
import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import { useEffect, useState, useRef } from "react";
import { useChat } from "@/contexts/ChatContext";
import { useScrollFade } from "@/hooks/useScrollFade";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ShopifyAlternative() {
  const [, setLocation] = useLocation();
  const { openChat } = useChat();
  
  // Set SEO-optimized page title
  useEffect(() => {
    document.title = "Shopify Alternative for Growing Stores | DaVinci Dynamics";
    
    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Stop losing 60%+ of profits to Shopify fees. Own your e-commerce platform with custom automation, lower costs, and full control. Migration support included.');
    }
  }, []);
  
  // Scroll fade hooks
  const costSection = useScrollFade();
  const valueSection = useScrollFade();
  const calculatorSection = useScrollFade();
  const migrationSection = useScrollFade();
  const faqSection = useScrollFade();
  const finalCtaSection = useScrollFade();
  
  // Helper to get fade class
  const getFadeClass = (isVisible: boolean) => 
    isVisible ? 'animate-fade-in-up' : 'opacity-0';
  
  // Savings calculator state
  const [shopifyPlan, setShopifyPlan] = useState("");
  const [appStack, setAppStack] = useState("");
  const [processing, setProcessing] = useState("");
  const [showResults, setShowResults] = useState(false);
  
  // Lead capture state
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadStep, setLeadStep] = useState(1);
  const [storeUrl, setStoreUrl] = useState("");
  const [monthlySpend, setMonthlySpend] = useState("");
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  
  // Sticky CTA state
  const [showStickyCta, setShowStickyCta] = useState(false);
  
  // Template showcase state
  const [selectedAudience, setSelectedAudience] = useState<'all' | 'women' | 'men' | 'unisex'>('all');
  const templateSection = useScrollFade();
  
  const leadCaptureMutation = trpc.leads.capture.useMutation();
  
  // Calculate savings
  const calculateSavings = () => {
    const plan = parseFloat(shopifyPlan) || 0;
    const apps = parseFloat(appStack) || 0;
    const proc = parseFloat(processing) || 0;
    
    const currentTotal = plan + apps + proc;
    const optimizedLow = currentTotal * 0.3; // 70% savings
    const optimizedHigh = currentTotal * 0.5; // 50% savings
    
    return {
      currentTotal,
      optimizedLow,
      optimizedHigh,
      savingsLow: currentTotal - optimizedHigh,
      savingsHigh: currentTotal - optimizedLow
    };
  };
  
  const handleCalculate = () => {
    if (!shopifyPlan || !appStack || !processing) {
      toast.error("Please fill in all fields");
      return;
    }
    setShowResults(true);
  };
  
  const savings = calculateSavings();
  
  // Handle lead capture
  const handleLeadSubmit = async () => {
    if (leadStep === 1) {
      if (!storeUrl || !monthlySpend) {
        toast.error("Please fill in all fields");
        return;
      }
      setLeadStep(2);
    } else {
      if (!leadName || !leadEmail || !leadPhone) {
        toast.error("Please fill in all fields");
        return;
      }
      
      try {
        await leadCaptureMutation.mutateAsync({
          name: leadName,
          email: leadEmail,
          phone: leadPhone,
          storeUrl,
          monthlySpend: parseFloat(monthlySpend),
          sourcePage: "/shopify-alternative",
          utmParams: {
            source: new URLSearchParams(window.location.search).get('utm_source') || undefined,
            medium: new URLSearchParams(window.location.search).get('utm_medium') || undefined,
            campaign: new URLSearchParams(window.location.search).get('utm_campaign') || undefined,
          }
        });
        
        toast.success("Thanks! We'll reach out within 24 hours.");
        setShowLeadForm(false);
        setLeadStep(1);
        // Reset form
        setStoreUrl("");
        setMonthlySpend("");
        setLeadName("");
        setLeadEmail("");
        setLeadPhone("");
      } catch (error) {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };
  
  // Sticky CTA on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 800) {
        setShowStickyCta(true);
      } else {
        setShowStickyCta(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const faqs = [
    {
      question: "What are the migration risks?",
      answer: "We handle data migration with zero downtime. Your store stays live during the entire process. We migrate products, customers, orders, and all historical data with full verification."
    },
    {
      question: "Will my SEO rankings drop?",
      answer: "No. We implement proper 301 redirects, maintain URL structures where possible, and preserve all meta data. Most clients see SEO improvements within 30 days due to faster load times."
    },
    {
      question: "How long does migration take?",
      answer: "Typical migration takes 2-4 weeks from kickoff to launch. We work in parallel with your existing store, so there's no disruption to your business."
    },
    {
      question: "How much does it cost compared to Shopify?",
      answer: "Most clients save 50-70% monthly. Instead of $300-2000/month in Shopify + apps, you pay a one-time build fee and minimal hosting (~$50-100/month). ROI typically hits in 3-6 months."
    }
  ];

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
                For Shopify Store Owners
              </span>
            </div>
            
            <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl xl:text-7xl mb-6 leading-tight tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Shopify Fees{" "}
              <span className="text-neon">Eating Your Margin?</span>
              <br />
              Own Your Stack.
            </h1>
            
            <p className="font-heading text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Stop losing 60%+ of your profits to platform fees, app subscriptions, and processing overhead. 
              We build you a <span className="text-accent font-semibold">custom e-commerce system</span> that you own—
              with migration support, automation, and costs that actually make sense.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Button
                size="lg"
                className="bg-accent text-background hover:bg-accent/90 font-heading font-bold text-lg px-8 py-6 neon-glow"
                onClick={() => setShowLeadForm(true)}
              >
                Get My Savings Plan
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-accent/50 text-accent hover:bg-accent/10 hover:border-accent font-heading font-semibold text-lg px-8 py-6"
                onClick={() => setLocation('/booking')}
              >
                Book Demo
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground font-heading animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-accent" />
                <span>Zero monthly platform fees</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-accent" />
                <span>Full data migration included</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-accent" />
                <span>50-70% cost reduction</span>
              </div>
            </div>
          </div>
        </section>

        {/* Cost Breakdown Section */}
        <section ref={costSection.ref} className={`container mx-auto px-4 py-16 ${getFadeClass(costSection.isVisible)}`}>
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-center mb-4">
              Where Your <span className="text-neon">Money Goes</span>
            </h2>
            <p className="text-center text-muted-foreground font-heading text-lg mb-12">
              The real cost of Shopify adds up fast
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: DollarSign, title: "Shopify Plan", cost: "$29-$2,000/mo", desc: "Base platform fee" },
                { icon: Package, title: "App Stack", cost: "$200-$800/mo", desc: "Email, reviews, upsells, etc." },
                { icon: TrendingUp, title: "Processing Fees", cost: "2.9% + 30¢", desc: "Per transaction" },
                { icon: Clock, title: "Operational Overhead", cost: "$500+/mo", desc: "Managing integrations" }
              ].map((item, idx) => (
                <div key={idx} className="bg-card border border-border rounded-xl p-6 hover:border-accent/50 transition-all">
                  <item.icon className="w-10 h-10 text-accent mb-4" />
                  <h3 className="font-heading font-bold text-xl mb-2">{item.title}</h3>
                  <p className="text-2xl font-display font-bold text-accent mb-2">{item.cost}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 bg-destructive/10 border border-destructive/30 rounded-xl p-6 text-center">
              <p className="font-heading text-lg">
                <span className="font-bold text-destructive">Typical Total:</span> $800-$3,500/month + 2.9% of every sale
              </p>
            </div>
          </div>
        </section>

        {/* Value Proposition Section */}
        <section ref={valueSection.ref} className={`container mx-auto px-4 py-16 ${getFadeClass(valueSection.isVisible)}`}>
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-center mb-4">
              What You Get <span className="text-neon">Instead</span>
            </h2>
            <p className="text-center text-muted-foreground font-heading text-lg mb-12">
              A platform built for your business, not theirs
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: Shield,
                  title: "Custom Owned E-commerce System",
                  desc: "Your platform, your rules. No vendor lock-in, no arbitrary limits, no surprise fee increases."
                },
                {
                  icon: Zap,
                  title: "Built-in Automation",
                  desc: "SMS, Telegram, WhatsApp notifications. Inventory sync. Order management. All included, no app fees."
                },
                {
                  icon: TrendingUp,
                  title: "Simplified Operations",
                  desc: "One system instead of 15 apps. One login. One support contact. Everything works together."
                },
                {
                  icon: Package,
                  title: "Migration Support",
                  desc: "We handle the entire migration. Products, customers, orders, SEO. Zero downtime, full verification."
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-card border border-border rounded-xl p-8 hover:border-accent/50 transition-all">
                  <item.icon className="w-12 h-12 text-accent mb-4" />
                  <h3 className="font-heading font-bold text-2xl mb-3">{item.title}</h3>
                  <p className="text-muted-foreground font-heading">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Template Showcase Section */}
        <section ref={templateSection.ref} className={`container mx-auto px-4 py-16 ${getFadeClass(templateSection.isVisible)}`}>
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-center mb-4">
              Built for <span className="text-neon">Your Audience</span>
            </h2>
            <p className="text-center text-muted-foreground font-heading text-lg mb-8">
              Choose from audience-optimized templates designed to convert
            </p>
            
            {/* Audience Filters */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {[
                { value: 'all' as const, label: 'All Templates' },
                { value: 'women' as const, label: 'Women' },
                { value: 'men' as const, label: 'Men' },
                { value: 'unisex' as const, label: 'Unisex' }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedAudience(filter.value)}
                  className={`px-6 py-3 rounded-lg font-heading font-semibold transition-all ${
                    selectedAudience === filter.value
                      ? 'bg-accent text-background neon-glow'
                      : 'bg-card border border-border hover:border-accent/50 text-foreground'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            
            {/* Template Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                // Women-focused templates
                {
                  audience: 'women',
                  name: 'Beauty & Skincare',
                  desc: 'Hero product focus, ingredient storytelling, before/after galleries, quiz-based product finder',
                  features: ['Product quiz', 'Ingredient glossary', 'Routine builder', 'Subscription upsells'],
                  image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663317811544/jfOVVKlIdaUaRJkU.png'
                },
                {
                  audience: 'women',
                  name: "Women's Fashion",
                  desc: 'Lookbook-style layout, outfit bundling, size guide integration, style quiz, wishlist',
                  features: ['Lookbook grid', 'Outfit bundles', 'Virtual stylist', 'Size recommendations'],
                  image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663317811544/scXgWShWRxduEmdi.png'
                },
                {
                  audience: 'women',
                  name: 'Jewelry & Accessories',
                  desc: 'High-res zoom, customization options, gift messaging, occasion-based filtering',
                  features: ['360° product view', 'Engraving options', 'Gift packaging', 'Occasion filters'],
                  image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663317811544/qHFwUwzyGuChZEqi.png'
                },
                {
                  audience: 'women',
                  name: 'Wellness/Self-Care',
                  desc: 'Editorial content, wellness quiz, subscription boxes, community features, education hub',
                  features: ['Wellness quiz', 'Subscription boxes', 'Content library', 'Community forum'],
                  image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663317811544/dNixKOxvDADpEHKi.png'
                },
                // Men-focused templates
                {
                  audience: 'men',
                  name: "Men's Grooming",
                  desc: 'Problem-solution layout, routine builder, subscription model, educational content',
                  features: ['Routine builder', 'Auto-replenish', 'Grooming guides', 'Product comparisons'],
                  image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663317811544/waIgqYCszsKAKqho.png'
                },
                {
                  audience: 'men',
                  name: "Men's Streetwear",
                  desc: 'Drop-style releases, countdown timers, limited edition badges, hype-driven copy',
                  features: ['Drop calendar', 'Countdown timers', 'Limited badges', 'Waitlist signup'],
                  image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663317811544/IgmbyaNhxyfKsmfw.png'
                },
                {
                  audience: 'men',
                  name: 'Fitness/Supplements',
                  desc: 'Goal-based product finder, stack builder, progress tracking, educational content',
                  features: ['Goal selector', 'Stack builder', 'Progress tracker', 'Nutrition guides'],
                  image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663317811544/isJeIbKzVdqHcBkQ.png'
                },
                {
                  audience: 'men',
                  name: 'Watches/Accessories',
                  desc: 'Luxury presentation, detailed specs, comparison tool, authentication guarantee',
                  features: ['Spec sheets', 'Side-by-side compare', 'Authentication', 'Warranty info'],
                  image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663317811544/dNNBebWyucaNbVzt.png'
                },
                // Unisex templates
                {
                  audience: 'unisex',
                  name: 'Minimal DTC',
                  desc: 'Clean single-product focus, benefits-driven copy, social proof, simple checkout',
                  features: ['Single product', 'Benefits focus', 'Social proof', 'One-click checkout'],
                  image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663317811544/CASVovFoLTwzhcWQ.png'
                },
                {
                  audience: 'unisex',
                  name: 'Bundle/Upsell',
                  desc: 'Bundle builder, volume discounts, "Complete the set" prompts, cart upsells',
                  features: ['Bundle builder', 'Volume pricing', 'Cart upsells', 'Gift sets'],
                  image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663317811544/fieGEuaZBoXVLpWX.png'
                },
                {
                  audience: 'unisex',
                  name: 'Social-Proof UGC',
                  desc: 'Customer photo gallery, video reviews, Instagram feed, community highlights',
                  features: ['UGC gallery', 'Video reviews', 'Instagram feed', 'Community stories'],
                  image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663317811544/unNwnuYiDnnfoQRv.png'
                },
                {
                  audience: 'unisex',
                  name: 'One-Product Funnel',
                  desc: 'Long-form sales page, video hero, testimonials, urgency elements, guarantee',
                  features: ['Video sales letter', 'Testimonial wall', 'Urgency timer', 'Money-back guarantee'],
                  image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663317811544/iRxNelwIbhmJcsxW.png'
                }
              ]
                .filter(template => selectedAudience === 'all' || template.audience === selectedAudience)
                .map((template, idx) => (
                  <div
                    key={idx}
                    className="bg-card border border-border rounded-xl overflow-hidden hover:border-accent/50 transition-all group"
                  >
                    {/* Template Preview Image */}
                    {template.image && (
                      <div className="relative w-full h-48 bg-muted overflow-hidden">
                        <img
                          src={template.image}
                          alt={`${template.name} template preview`}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    
                    <div className="p-6">
                    <div className="mb-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-heading font-semibold mb-3 ${
                        template.audience === 'women' ? 'bg-pink-500/20 text-pink-400' :
                        template.audience === 'men' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {template.audience === 'women' ? 'Women' : template.audience === 'men' ? 'Men' : 'Unisex'}
                      </span>
                      <h3 className="font-heading font-bold text-xl mb-2 group-hover:text-accent transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">{template.desc}</p>
                    </div>
                    
                    <div className="space-y-2">
                      {template.features.map((feature, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-sm font-heading">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button
                      variant="outline"
                      className="w-full mt-6 border-accent/30 text-accent hover:bg-accent/10 hover:border-accent font-heading font-semibold"
                      onClick={() => setShowLeadForm(true)}
                    >
                      Get This Template
                    </Button>
                    </div>
                  </div>
                ))}
            </div>
            
            <div className="mt-12 text-center">
              <p className="text-muted-foreground font-heading mb-6">
                All templates include full migration support, custom branding, and built-in automation
              </p>
              <Button
                size="lg"
                className="bg-accent text-background hover:bg-accent/90 font-heading font-bold text-lg px-8 py-6 neon-glow"
                onClick={() => setLocation('/booking')}
              >
                Book Strategy Call
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Savings Calculator Section */}
        <section ref={calculatorSection.ref} className={`container mx-auto px-4 py-16 ${getFadeClass(calculatorSection.isVisible)}`}>         <div className="max-w-3xl mx-auto">
            <div className="bg-card border border-accent/30 rounded-2xl p-8 md:p-12 neon-glow">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-center mb-4">
                Calculate Your <span className="text-neon">Savings</span>
              </h2>
              <p className="text-center text-muted-foreground font-heading mb-8">
                See how much you could save by owning your platform
              </p>
              
              <div className="space-y-6 mb-8">
                <div>
                  <label className="block font-heading font-semibold mb-2">Monthly Shopify Plan Cost</label>
                  <input
                    type="number"
                    placeholder="e.g., 79"
                    value={shopifyPlan}
                    onChange={(e) => setShopifyPlan(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 font-heading focus:border-accent focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block font-heading font-semibold mb-2">Monthly App Stack Total</label>
                  <input
                    type="number"
                    placeholder="e.g., 450"
                    value={appStack}
                    onChange={(e) => setAppStack(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 font-heading focus:border-accent focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block font-heading font-semibold mb-2">Monthly Processing Estimate</label>
                  <input
                    type="number"
                    placeholder="e.g., 300"
                    value={processing}
                    onChange={(e) => setProcessing(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 font-heading focus:border-accent focus:outline-none"
                  />
                </div>
              </div>
              
              <Button
                size="lg"
                className="w-full bg-accent text-background hover:bg-accent/90 font-heading font-bold text-lg py-6"
                onClick={handleCalculate}
              >
                Calculate Savings
              </Button>
              
              {showResults && (
                <div className="mt-8 space-y-4 animate-fade-in-up">
                  <div className="bg-background border border-border rounded-lg p-6">
                    <p className="text-sm text-muted-foreground font-heading mb-1">Current Monthly Total</p>
                    <p className="text-3xl font-display font-bold text-destructive">
                      ${savings.currentTotal.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="bg-accent/10 border border-accent/30 rounded-lg p-6">
                    <p className="text-sm text-accent font-heading mb-1">Projected Optimized Range</p>
                    <p className="text-3xl font-display font-bold text-accent">
                      ${savings.optimizedLow.toFixed(2)} - ${savings.optimizedHigh.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="bg-card border border-border rounded-lg p-6">
                    <p className="text-sm text-muted-foreground font-heading mb-1">Monthly Savings</p>
                    <p className="text-3xl font-display font-bold text-neon">
                      ${savings.savingsLow.toFixed(2)} - ${savings.savingsHigh.toFixed(2)}
                    </p>
                  </div>
                  
                  <Button
                    size="lg"
                    className="w-full bg-neon text-background hover:bg-neon/90 font-heading font-bold text-lg py-6 neon-glow"
                    onClick={() => setShowLeadForm(true)}
                  >
                    Get My Custom Savings Plan
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Migration Reassurance */}
        <section ref={migrationSection.ref} className={`container mx-auto px-4 py-16 ${getFadeClass(migrationSection.isVisible)}`}>
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-center mb-4">
              Migration <span className="text-neon">Made Simple</span>
            </h2>
            <p className="text-center text-muted-foreground font-heading text-lg mb-12">
              We handle everything so you can focus on running your business
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Data Migration Support",
                  desc: "Products, customers, orders, and all historical data transferred with full verification"
                },
                {
                  title: "Minimal Downtime",
                  desc: "Your store stays live during migration. We work in parallel and switch when ready"
                },
                {
                  title: "Onboarding & Training",
                  desc: "Full training on your new system. Documentation, videos, and ongoing support"
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-card border border-border rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-accent/10 border border-accent/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-accent font-display font-bold text-xl">{idx + 1}</span>
                  </div>
                  <h3 className="font-heading font-bold text-xl mb-3">{item.title}</h3>
                  <p className="text-muted-foreground font-heading">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section ref={faqSection.ref} className={`container mx-auto px-4 py-16 ${getFadeClass(faqSection.isVisible)}`}>
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-center mb-4">
              Common <span className="text-neon">Questions</span>
            </h2>
            <p className="text-center text-muted-foreground font-heading text-lg mb-12">
              Everything you need to know about switching from Shopify
            </p>
            
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <details key={idx} className="bg-card border border-border rounded-xl p-6 group">
                  <summary className="font-heading font-bold text-lg cursor-pointer flex items-center justify-between">
                    <span>{faq.question}</span>
                    <HelpCircle className="w-5 h-5 text-accent group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="mt-4 text-muted-foreground font-heading leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-muted-foreground font-heading mb-4">
                Have more questions?
              </p>
              <Button
                variant="outline"
                className="border-accent/50 text-accent hover:bg-accent/10 hover:border-accent font-heading font-semibold"
                onClick={() => setLocation('/contact')}
              >
                Contact Us
              </Button>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section ref={finalCtaSection.ref} className={`container mx-auto px-4 py-16 lg:py-24 ${getFadeClass(finalCtaSection.isVisible)}`}>
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/30 rounded-2xl p-12 neon-glow">
              <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl mb-6">
                Book Your Shopify <span className="text-neon">Savings Demo</span>
              </h2>
              <p className="font-heading text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                See exactly how much you'll save and what your custom platform will look like. 
                30-minute demo, zero pressure.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-accent text-background hover:bg-accent/90 font-heading font-bold text-lg px-8 py-6 neon-glow"
                  onClick={() => setShowLeadForm(true)}
                >
                  Get My Savings Plan
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-accent/50 text-accent hover:bg-accent/10 hover:border-accent font-heading font-semibold text-lg px-8 py-6"
                  onClick={() => setLocation('/booking')}
                >
                  Book Demo
                </Button>
              </div>
              
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground font-heading">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  <span>Free cost analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  <span>Response within 24 hours</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky CTA */}
      {showStickyCta && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-accent/30 p-4 z-50 animate-fade-in-up">
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-heading font-bold text-lg">Ready to own your platform?</p>
              <p className="text-sm text-muted-foreground">Save 50-70% on monthly costs</p>
            </div>
            <div className="flex gap-3">
              <Button
                className="bg-accent text-background hover:bg-accent/90 font-heading font-bold"
                onClick={() => setShowLeadForm(true)}
              >
                Get Savings Plan
              </Button>
              <Button
                variant="outline"
                className="border-accent/50 text-accent hover:bg-accent/10 hover:border-accent font-heading font-semibold"
                onClick={() => setLocation('/booking')}
              >
                Book Demo
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Capture Modal */}
      {showLeadForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-accent/30 rounded-2xl p-8 max-w-md w-full neon-glow animate-fade-in-up">
            <h3 className="font-display font-bold text-2xl mb-2">
              {leadStep === 1 ? "Get Your Savings Plan" : "Almost There"}
            </h3>
            <p className="text-muted-foreground font-heading mb-6">
              {leadStep === 1 ? "Tell us about your store" : "How can we reach you?"}
            </p>
            
            {leadStep === 1 ? (
              <div className="space-y-4">
                <div>
                  <label className="block font-heading font-semibold mb-2 text-sm">Store URL</label>
                  <input
                    type="url"
                    placeholder="yourstore.myshopify.com"
                    value={storeUrl}
                    onChange={(e) => setStoreUrl(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 font-heading focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-heading font-semibold mb-2 text-sm">Monthly Shopify + Apps Spend</label>
                  <input
                    type="number"
                    placeholder="e.g., 800"
                    value={monthlySpend}
                    onChange={(e) => setMonthlySpend(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 font-heading focus:border-accent focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block font-heading font-semibold mb-2 text-sm">Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 font-heading focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-heading font-semibold mb-2 text-sm">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 font-heading focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-heading font-semibold mb-2 text-sm">Phone</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 font-heading focus:border-accent focus:outline-none"
                  />
                </div>
              </div>
            )}
            
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1 border-border hover:bg-secondary font-heading"
                onClick={() => {
                  setShowLeadForm(false);
                  setLeadStep(1);
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-accent text-background hover:bg-accent/90 font-heading font-bold"
                onClick={handleLeadSubmit}
                disabled={leadCaptureMutation.isPending}
              >
                {leadCaptureMutation.isPending ? "Submitting..." : leadStep === 1 ? "Next" : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* FAQ Schema for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        })}
      </script>
    </div>
  );
}
