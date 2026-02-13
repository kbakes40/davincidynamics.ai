/**
 * Cost Savings Calculator Component
 * Allows users to input current monthly fees and see projected savings
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingDown, DollarSign, Calculator } from "lucide-react";

export default function CostSavingsCalculator() {
  const [currentMonthlyFee, setCurrentMonthlyFee] = useState<string>("");
  const [showResults, setShowResults] = useState(false);

  // DaVinci Dynamics average monthly cost (middle of the range)
  const davinciMonthlyAvg = 1000; // $500-$1,500 range, using $1,000 as average

  const handleCalculate = () => {
    if (currentMonthlyFee && parseFloat(currentMonthlyFee) > 0) {
      setShowResults(true);
    }
  };

  const handleInputChange = (value: string) => {
    // Only allow numbers and decimal point
    const sanitized = value.replace(/[^0-9.]/g, '');
    setCurrentMonthlyFee(sanitized);
    setShowResults(false);
  };

  const currentFee = parseFloat(currentMonthlyFee) || 0;
  const monthlySavings = currentFee - davinciMonthlyAvg;
  const savings12Months = monthlySavings * 12;
  const savings24Months = monthlySavings * 24;
  const savingsPercentage = currentFee > 0 ? ((monthlySavings / currentFee) * 100) : 0;

  return (
    <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl p-8 lg:p-10 border-2 border-accent/50">
      <div className="flex items-center justify-center gap-3 mb-6">
        <Calculator className="w-8 h-8 text-accent" />
        <h3 className="font-display font-black text-2xl lg:text-3xl text-accent">
          Calculate Your Savings
        </h3>
      </div>

      <p className="font-heading text-center text-foreground mb-6 text-lg">
        See exactly how much you'll save by switching to DaVinci Dynamics
      </p>

      {/* Input Section */}
      <div className="max-w-md mx-auto mb-6">
        <label className="block font-heading font-semibold text-foreground mb-2">
          What are you paying monthly now?
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            inputMode="decimal"
            placeholder="3500"
            value={currentMonthlyFee}
            onChange={(e) => handleInputChange(e.target.value)}
            className="pl-10 text-lg font-heading bg-background border-accent/30 focus:border-accent"
          />
        </div>
        <p className="text-sm text-muted-foreground font-heading mt-2">
          Include platform fees, payment processing, apps, and marketing tools
        </p>
      </div>

      <div className="text-center mb-6">
        <Button
          size="lg"
          onClick={handleCalculate}
          disabled={!currentMonthlyFee || parseFloat(currentMonthlyFee) <= 0}
          className="bg-accent text-background hover:bg-accent/90 font-heading font-bold text-lg px-8 py-6 neon-glow"
        >
          Calculate Savings
        </Button>
      </div>

      {/* Results Section */}
      {showResults && monthlySavings > 0 && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-accent to-transparent mb-6" />
          
          {/* Monthly Savings */}
          <div className="bg-card/80 rounded-xl p-6 border border-accent/30">
            <div className="flex items-center justify-between mb-2">
              <span className="font-heading text-muted-foreground">Monthly Savings</span>
              <TrendingDown className="w-5 h-5 text-accent" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-black text-3xl text-accent">
                ${monthlySavings.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              <span className="font-heading text-lg text-foreground">
                ({savingsPercentage.toFixed(0)}% less)
              </span>
            </div>
          </div>

          {/* 12-Month Savings */}
          <div className="bg-card/80 rounded-xl p-6 border border-accent/30">
            <div className="flex items-center justify-between mb-2">
              <span className="font-heading text-muted-foreground">12-Month Savings</span>
              <span className="font-heading text-xs text-accent bg-accent/10 px-2 py-1 rounded">
                1 Year
              </span>
            </div>
            <div className="font-display font-black text-3xl text-neon">
              ${savings12Months.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </div>

          {/* 24-Month Savings */}
          <div className="bg-card/80 rounded-xl p-6 border border-accent/30">
            <div className="flex items-center justify-between mb-2">
              <span className="font-heading text-muted-foreground">24-Month Savings</span>
              <span className="font-heading text-xs text-accent bg-accent/10 px-2 py-1 rounded">
                2 Years
              </span>
            </div>
            <div className="font-display font-black text-3xl text-neon">
              ${savings24Months.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-card rounded-xl p-6 border border-accent/50 mt-6">
            <h4 className="font-heading font-bold text-lg text-accent mb-4">Your New Monthly Cost</h4>
            <div className="space-y-2 text-foreground font-heading">
              <div className="flex justify-between">
                <span className="text-muted-foreground">DaVinci Platform</span>
                <span className="font-semibold">$500 - $1,500/mo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">One-time Setup</span>
                <span className="font-semibold">$2,500 - $5,000</span>
              </div>
              <div className="pt-3 border-t border-accent/30">
                <p className="text-sm text-muted-foreground">
                  * Setup cost is recovered in {Math.ceil((3500) / monthlySavings)} months through monthly savings
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showResults && monthlySavings <= 0 && (
        <div className="bg-card/80 rounded-xl p-6 border border-accent/30 text-center animate-fade-in-up">
          <p className="font-heading text-foreground">
            Your current costs are already competitive! However, with DaVinci Dynamics you'll own your platform and have full control over your customer data.
          </p>
        </div>
      )}
    </div>
  );
}
