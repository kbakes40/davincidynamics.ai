import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Percent,
  Users,
  RefreshCcw,
  Check,
  ArrowRight,
  BarChart3,
  Target,
  Zap,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useScrollFade } from '@/hooks/useScrollFade';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function ProfitCrmDemo() {
  // Scroll fade animations
  const heroSection = useScrollFade();
  const kpiSection = useScrollFade();
  const calculatorSection = useScrollFade();
  const crmSection = useScrollFade();
  const comparisonSection = useScrollFade();
  const demoCardsSection = useScrollFade();
  const faqSection = useScrollFade();
  const finalCtaSection = useScrollFade();

  // Calculator state
  const [industry, setIndustry] = useState<'e-commerce' | 'saas' | 'service'>('e-commerce');
  const [revenue, setRevenue] = useState('10000');
  const [cogs, setCogs] = useState('30');
  const [platformCost, setPlatformCost] = useState('500');
  const [adSpend, setAdSpend] = useState('2000');
  const [fulfillmentCost, setFulfillmentCost] = useState('1000');

  // Lead form state
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    monthlyRevenue: '',
    currentTools: '',
    name: '',
    email: '',
    phone: '',
    selectedDemoCard: ''
  });

  // CRM pipeline state
  const [selectedStage, setSelectedStage] = useState('new-lead');

  const submitLead = trpc.leads.capture.useMutation();

  // Calculate profit metrics
  const revenueNum = parseFloat(revenue) || 0;
  const cogsPercent = parseFloat(cogs) || 0;
  const platformNum = parseFloat(platformCost) || 0;
  const adNum = parseFloat(adSpend) || 0;
  const fulfillmentNum = parseFloat(fulfillmentCost) || 0;

  const cogsAmount = revenueNum * (cogsPercent / 100);
  const grossProfit = revenueNum - cogsAmount;
  const totalCosts = platformNum + adNum + fulfillmentNum;
  const netProfit = grossProfit - totalCosts;
  const profitMargin = revenueNum > 0 ? (netProfit / revenueNum) * 100 : 0;
  
  // Optimized projections (15% cost reduction, 10% revenue increase from better CRM)
  const optimizedCosts = totalCosts * 0.85;
  const optimizedRevenue = revenueNum * 1.10;
  const optimizedGrossProfit = optimizedRevenue - (optimizedRevenue * (cogsPercent / 100));
  const optimizedNetProfit = optimizedGrossProfit - optimizedCosts;
  const optimizedMargin = optimizedRevenue > 0 ? (optimizedNetProfit / optimizedRevenue) * 100 : 0;
  const annualImpact = (optimizedNetProfit - netProfit) * 12;

  const getFadeClass = (isVisible: boolean) => {
    return isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8';
  };

  const handleLeadSubmit = async () => {
    if (formStep === 1) {
      if (!formData.monthlyRevenue || !formData.currentTools) {
        toast.error('Please fill in all fields');
        return;
      }
      setFormStep(2);
    } else {
      if (!formData.name || !formData.email || !formData.phone) {
        toast.error('Please fill in all fields');
        return;
      }

      try {
        await submitLead.mutateAsync({
          sourcePage: '/profit-crm-demo',
          storeUrl: '',
          monthlySpend: parseFloat(formData.monthlyRevenue) || undefined,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          utmParams: {},
          metadata: {
            currentTools: formData.currentTools,
            selectedDemoCard: formData.selectedDemoCard
          }
        });

        toast.success('Demo request submitted! We\'ll contact you within 24 hours.');
        setShowLeadForm(false);
        setFormStep(1);
        setFormData({
          monthlyRevenue: '',
          currentTools: '',
          name: '',
          email: '',
          phone: '',
          selectedDemoCard: ''
        });
      } catch (error) {
        toast.error('Failed to submit. Please try again.');
      }
    }
  };

  const crmStages = [
    {
      id: 'new-lead',
      name: 'New Lead',
      count: 24,
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      description: 'Leads captured from website, social, or referrals'
    },
    {
      id: 'qualified',
      name: 'Qualified',
      count: 18,
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      description: 'Qualified leads with confirmed budget and timeline'
    },
    {
      id: 'proposal',
      name: 'Proposal/Demo',
      count: 12,
      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      description: 'Active proposals or scheduled demos'
    },
    {
      id: 'won',
      name: 'Won',
      count: 8,
      color: 'bg-green-500/20 text-green-400 border-green-500/30',
      description: 'Closed deals and active customers'
    },
    {
      id: 'follow-up',
      name: 'Follow-up',
      count: 6,
      color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      description: 'Nurture campaigns and re-engagement'
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section ref={heroSection.ref} className={`container mx-auto px-4 py-16 lg:py-24 transition-all duration-1000 ${getFadeClass(heroSection.isVisible)}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
            See Your Numbers. <span className="text-neon">Scale Your Profit.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-heading mb-8 max-w-3xl mx-auto">
            Track revenue, cost leaks, follow-up performance, and CRM pipeline in one system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-accent text-background hover:bg-accent/90 font-heading font-bold text-lg px-8 py-6 neon-glow"
              onClick={() => {
                const calc = document.getElementById('profit-calculator');
                calc?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              See My Profit Breakdown
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-accent/50 text-accent hover:bg-accent/10 font-heading font-bold text-lg px-8 py-6"
              onClick={() => setShowLeadForm(true)}
            >
              Book CRM Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Profit Snapshot KPI Cards */}
      <section ref={kpiSection.ref} className={`container mx-auto px-4 py-16 transition-all duration-1000 ${getFadeClass(kpiSection.isVisible)}`}>
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-center mb-12">
            Your <span className="text-neon">Profit Snapshot</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: DollarSign,
                label: 'Monthly Revenue',
                value: `$${revenueNum.toLocaleString()}`,
                color: 'text-blue-400'
              },
              {
                icon: TrendingUp,
                label: 'Gross Profit',
                value: `$${grossProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
                color: 'text-green-400'
              },
              {
                icon: DollarSign,
                label: 'Net Profit',
                value: `$${netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
                color: netProfit >= 0 ? 'text-green-400' : 'text-red-400'
              },
              {
                icon: Percent,
                label: 'Profit Margin',
                value: `${profitMargin.toFixed(1)}%`,
                color: profitMargin >= 20 ? 'text-green-400' : profitMargin >= 10 ? 'text-yellow-400' : 'text-red-400'
              },
              {
                icon: TrendingDown,
                label: 'Cost Leakage',
                value: `${((totalCosts / revenueNum) * 100).toFixed(1)}%`,
                color: 'text-orange-400'
              },
              {
                icon: RefreshCcw,
                label: 'Repeat Customer Rate',
                value: '32%',
                color: 'text-cyan-400'
              }
            ].map((kpi, idx) => (
              <Card key={idx} className="bg-card border-border p-6 hover:border-accent/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <kpi.icon className={`w-10 h-10 ${kpi.color}`} />
                </div>
                <p className="text-sm text-muted-foreground font-heading mb-2">{kpi.label}</p>
                <p className={`text-3xl font-display font-bold ${kpi.color}`}>{kpi.value}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Profit Calculator */}
      <section 
        id="profit-calculator"
        ref={calculatorSection.ref} 
        className={`container mx-auto px-4 py-16 transition-all duration-1000 ${getFadeClass(calculatorSection.isVisible)}`}
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-center mb-4">
            Calculate Your <span className="text-neon">Profit Potential</span>
          </h2>
          <p className="text-center text-muted-foreground font-heading text-lg mb-12">
            See how much you could save with optimized operations and better CRM
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Calculator Inputs */}
            <Card className="bg-card border-border p-8">
              <h3 className="font-heading font-bold text-xl mb-6">Your Current Numbers</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-heading text-muted-foreground mb-2">Industry Type</label>
                  <Select value={industry} onValueChange={(value: 'e-commerce' | 'saas' | 'service') => setIndustry(value)}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="e-commerce">E-Commerce</SelectItem>
                      <SelectItem value="saas">SaaS</SelectItem>
                      <SelectItem value="service">Service Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-heading text-muted-foreground mb-2">Monthly Revenue ($)</label>
                  <Input
                    type="number"
                    value={revenue}
                    onChange={(e) => setRevenue(e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-heading text-muted-foreground mb-2">
                    {industry === 'e-commerce' ? 'COGS (%)' : industry === 'saas' ? 'Server/Infrastructure Costs (%)' : 'Service Delivery Costs (%)'}
                  </label>
                  <Input
                    type="number"
                    value={cogs}
                    onChange={(e) => setCogs(e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-heading text-muted-foreground mb-2">
                    {industry === 'e-commerce' ? 'Platform/App Cost ($)' : industry === 'saas' ? 'Software/Tool Stack ($)' : 'Business Software ($)'}
                  </label>
                  <Input
                    type="number"
                    value={platformCost}
                    onChange={(e) => setPlatformCost(e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-heading text-muted-foreground mb-2">
                    {industry === 'e-commerce' ? 'Ad Spend ($)' : industry === 'saas' ? 'Marketing/CAC ($)' : 'Marketing/Outreach ($)'}
                  </label>
                  <Input
                    type="number"
                    value={adSpend}
                    onChange={(e) => setAdSpend(e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-heading text-muted-foreground mb-2">
                    {industry === 'e-commerce' ? 'Fulfillment/Ops Cost ($)' : industry === 'saas' ? 'Support/Ops Cost ($)' : 'Labor/Ops Cost ($)'}
                  </label>
                  <Input
                    type="number"
                    value={fulfillmentCost}
                    onChange={(e) => setFulfillmentCost(e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
              </div>
            </Card>

            {/* Calculator Outputs */}
            <Card className="bg-card border-border p-8">
              <h3 className="font-heading font-bold text-xl mb-6">Your Optimized Potential</h3>
              <div className="space-y-6">
                <div className="border-b border-border pb-4">
                  <p className="text-sm text-muted-foreground font-heading mb-1">Current Net Profit</p>
                  <p className="text-2xl font-display font-bold text-foreground">
                    ${netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="border-b border-border pb-4">
                  <p className="text-sm text-muted-foreground font-heading mb-1">Current Margin</p>
                  <p className="text-2xl font-display font-bold text-foreground">
                    {profitMargin.toFixed(1)}%
                  </p>
                </div>
                <div className="border-b border-border pb-4">
                  <p className="text-sm text-muted-foreground font-heading mb-1">Optimized Net Profit</p>
                  <p className="text-2xl font-display font-bold text-green-400">
                    ${optimizedNetProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-green-400 font-heading mt-1">
                    +${(optimizedNetProfit - netProfit).toLocaleString(undefined, { maximumFractionDigits: 0 })} monthly
                  </p>
                </div>
                <div className="border-b border-border pb-4">
                  <p className="text-sm text-muted-foreground font-heading mb-1">Optimized Margin</p>
                  <p className="text-2xl font-display font-bold text-green-400">
                    {optimizedMargin.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground font-heading mb-1">Estimated Annual Impact</p>
                  <p className="text-3xl font-display font-bold text-accent">
                    ${annualImpact.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CRM Pipeline Demo */}
      <section ref={crmSection.ref} className={`container mx-auto px-4 py-16 transition-all duration-1000 ${getFadeClass(crmSection.isVisible)}`}>
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-center mb-4">
            Your <span className="text-neon">CRM Pipeline</span>
          </h2>
          <p className="text-center text-muted-foreground font-heading text-lg mb-12">
            Track every lead from first contact to closed deal
          </p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            {crmStages.map((stage, idx) => (
              <div key={stage.id}>
                <button
                  onClick={() => setSelectedStage(stage.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    selectedStage === stage.id
                      ? stage.color + ' neon-glow'
                      : 'bg-card border-border hover:border-accent/50'
                  }`}
                >
                  <p className="font-heading font-bold text-lg mb-1">{stage.name}</p>
                  <p className="text-3xl font-display font-bold">{stage.count}</p>
                </button>
                {idx < crmStages.length - 1 && (
                  <div className="hidden md:flex justify-center my-4">
                    <ChevronRight className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <Card className="bg-card border-border p-8">
            <p className="text-muted-foreground font-heading text-lg">
              {crmStages.find(s => s.id === selectedStage)?.description}
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div className="flex items-start gap-3">
                <Target className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                <div>
                  <p className="font-heading font-semibold mb-1">Lead Source Tracking</p>
                  <p className="text-sm text-muted-foreground">Know exactly where every lead came from</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                <div>
                  <p className="font-heading font-semibold mb-1">Follow-up Automations</p>
                  <p className="text-sm text-muted-foreground">Never miss a follow-up opportunity</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                <div>
                  <p className="font-heading font-semibold mb-1">Response-Time KPI</p>
                  <p className="text-sm text-muted-foreground">Track and optimize response speed</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Before vs After Comparison */}
      <section ref={comparisonSection.ref} className={`container mx-auto px-4 py-16 transition-all duration-1000 ${getFadeClass(comparisonSection.isVisible)}`}>
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-center mb-12">
            Before vs <span className="text-neon">After</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Before */}
            <Card className="bg-card border-border p-8">
              <h3 className="font-heading font-bold text-xl mb-6 text-red-400">Manual Operations</h3>
              <div className="space-y-4">
                {[
                  'Scattered data across multiple tools',
                  'Slow follow-up (24-48 hours average)',
                  'Lost leads due to missed follow-ups',
                  'No visibility into profit margins',
                  'Manual reporting takes hours',
                  'Lower close rates (15-20%)'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-muted-foreground font-heading">{item}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* After */}
            <Card className="bg-card border-accent/30 p-8">
              <h3 className="font-heading font-bold text-xl mb-6 text-green-400">Automated Flow</h3>
              <div className="space-y-4">
                {[
                  'All data unified in one dashboard',
                  'Instant automated follow-up',
                  'Zero missed opportunities',
                  'Real-time profit tracking',
                  'Automated reports generated daily',
                  'Higher close rates (30-35%)'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-foreground font-heading">{item}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Preview Cards */}
      <section ref={demoCardsSection.ref} className={`container mx-auto px-4 py-16 transition-all duration-1000 ${getFadeClass(demoCardsSection.isVisible)}`}>
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-center mb-12">
            Preview Your <span className="text-neon">Setup</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BarChart3,
                title: 'Profit Dashboard',
                desc: 'Real-time revenue, costs, and margin tracking'
              },
              {
                icon: Target,
                title: 'Lead Pipeline',
                desc: 'Visual pipeline with drag-and-drop stages'
              },
              {
                icon: Zap,
                title: 'Follow-up Automation',
                desc: 'Automated sequences based on lead behavior'
              },
              {
                icon: RefreshCcw,
                title: 'Retention/Repeat Sales',
                desc: 'Track customer lifetime value and repeat rates'
              }
            ].map((demo, idx) => (
              <Card key={idx} className="bg-card border-border p-6 hover:border-accent/50 transition-all group">
                <demo.icon className="w-12 h-12 text-accent mb-4" />
                <h3 className="font-heading font-bold text-lg mb-2 group-hover:text-accent transition-colors">
                  {demo.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">{demo.desc}</p>
                <Button
                  variant="outline"
                  className="w-full border-accent/30 text-accent hover:bg-accent/10 font-heading font-semibold"
                  onClick={() => {
                    setFormData({ ...formData, selectedDemoCard: demo.title });
                    setShowLeadForm(true);
                  }}
                >
                  Use This Setup
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section ref={faqSection.ref} className={`container mx-auto px-4 py-16 transition-all duration-1000 ${getFadeClass(faqSection.isVisible)}`}>
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-center mb-12">
            Frequently Asked <span className="text-neon">Questions</span>
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'How accurate are the projections?',
                a: 'Our projections are based on average improvements from 200+ clients. Actual results vary based on your current setup, but most clients see 10-20% margin improvement within 90 days.'
              },
              {
                q: 'Can this connect to my current tools?',
                a: 'Yes. We integrate with Shopify, WooCommerce, Stripe, QuickBooks, and 50+ other platforms. If you have a custom tool, we can build a custom integration.'
              },
              {
                q: 'How fast can we launch?',
                a: 'Most clients are fully operational within 2-3 weeks. We handle data migration, setup, training, and testing to ensure a smooth transition.'
              },
              {
                q: 'Will this work for small businesses?',
                a: 'Absolutely. Our system scales from $10K/month to $10M/month businesses. The automation and insights are valuable at any revenue level.'
              }
            ].map((faq, idx) => (
              <Card key={idx} className="bg-card border-border p-6">
                <h3 className="font-heading font-bold text-lg mb-3">{faq.q}</h3>
                <p className="text-muted-foreground font-heading">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section ref={finalCtaSection.ref} className={`container mx-auto px-4 py-16 transition-all duration-1000 ${getFadeClass(finalCtaSection.isVisible)}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-6">
            Ready to See Your <span className="text-neon">Numbers</span>?
          </h2>
          <p className="text-lg text-muted-foreground font-heading mb-8">
            Book a 30-minute demo and we'll show you exactly how much profit you're leaving on the table.
          </p>
          <Button
            size="lg"
            className="bg-accent text-background hover:bg-accent/90 font-heading font-bold text-lg px-12 py-6 neon-glow"
            onClick={() => setShowLeadForm(true)}
          >
            Book Your Profit + CRM Demo
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Lead Capture Modal */}
      {showLeadForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-card border-border p-8 max-w-md w-full">
            <h3 className="font-heading font-bold text-2xl mb-6">
              {formStep === 1 ? 'Tell Us About Your Business' : 'Your Contact Information'}
            </h3>
            
            {formStep === 1 ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-heading text-muted-foreground mb-2">
                    Monthly Revenue ($)
                  </label>
                  <Input
                    type="text"
                    value={formData.monthlyRevenue}
                    onChange={(e) => setFormData({ ...formData, monthlyRevenue: e.target.value })}
                    placeholder="e.g., 50000"
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-heading text-muted-foreground mb-2">
                    Current Tools/Platforms
                  </label>
                  <Input
                    type="text"
                    value={formData.currentTools}
                    onChange={(e) => setFormData({ ...formData, currentTools: e.target.value })}
                    placeholder="e.g., Shopify, HubSpot, QuickBooks"
                    className="bg-background border-border"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-heading text-muted-foreground mb-2">Name</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-heading text-muted-foreground mb-2">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-heading text-muted-foreground mb-2">Phone</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="bg-background border-border"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1 border-border"
                onClick={() => {
                  setShowLeadForm(false);
                  setFormStep(1);
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-accent text-background hover:bg-accent/90 font-heading font-semibold"
                onClick={handleLeadSubmit}
                disabled={submitLead.isPending}
              >
                {formStep === 1 ? 'Next' : submitLead.isPending ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
