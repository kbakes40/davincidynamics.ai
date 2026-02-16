import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getLoginUrl } from "@/const";
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";

export default function ProfitDashboard() {
  const { user, loading } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const [formData, setFormData] = useState({
    industry: "e-commerce" as "e-commerce" | "saas" | "service",
    revenue: "",
    cogs: "",
    platformCost: "",
    adSpend: "",
    fulfillmentCost: "",
    otherCosts: "",
  });

  const { data: history, refetch: refetchHistory } =
    trpc.profitTracking.getTrackingHistory.useQuery({ limit: 12 });
  const { data: stats, refetch: refetchStats } =
    trpc.profitTracking.getProgressStats.useQuery();
  const saveData = trpc.profitTracking.saveMonthlyData.useMutation();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = getLoginUrl();
    }
  }, [user, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await saveData.mutateAsync({
        month: selectedMonth,
        industry: formData.industry,
        revenue: parseFloat(formData.revenue),
        cogs: parseFloat(formData.cogs),
        platformCost: parseFloat(formData.platformCost),
        adSpend: parseFloat(formData.adSpend),
        fulfillmentCost: parseFloat(formData.fulfillmentCost),
        otherCosts: parseFloat(formData.otherCosts || "0"),
      });

      // Refetch data
      refetchHistory();
      refetchStats();

      // Reset form
      setFormData({
        ...formData,
        revenue: "",
        cogs: "",
        platformCost: "",
        adSpend: "",
        fulfillmentCost: "",
        otherCosts: "",
      });

      alert("Monthly data saved successfully!");
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save data. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display font-black text-3xl md:text-4xl mb-2 text-neon">
            Profit Tracking Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track your monthly profit and monitor improvements over time
          </p>
        </div>

        {/* Progress Stats */}
        {stats && stats.totalMonths > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Profit</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${stats.avgProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-neon" />
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Margin</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.avgMargin.toFixed(1)}%
                  </p>
                </div>
                <Percent className="w-8 h-8 text-neon" />
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Profit Growth</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.profitGrowth > 0 ? "+" : ""}
                    {stats.profitGrowth.toFixed(1)}%
                  </p>
                </div>
                {stats.profitGrowth >= 0 ? (
                  <TrendingUp className="w-8 h-8 text-green-500" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-red-500" />
                )}
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Margin Change</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.marginImprovement > 0 ? "+" : ""}
                    {stats.marginImprovement.toFixed(1)}%
                  </p>
                </div>
                {stats.marginImprovement >= 0 ? (
                  <TrendingUp className="w-8 h-8 text-green-500" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-red-500" />
                )}
              </div>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Data Entry Form */}
          <Card className="p-6 bg-card border-border">
            <h2 className="font-heading font-bold text-xl mb-4 text-foreground">
              Add Monthly Data
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="month">Month</Label>
                <Input
                  id="month"
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  required
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value: "e-commerce" | "saas" | "service") =>
                    setFormData({ ...formData, industry: value })
                  }
                >
                  <SelectTrigger className="bg-background border-border text-foreground">
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
                <Label htmlFor="revenue">Monthly Revenue ($)</Label>
                <Input
                  id="revenue"
                  type="number"
                  step="0.01"
                  value={formData.revenue}
                  onChange={(e) =>
                    setFormData({ ...formData, revenue: e.target.value })
                  }
                  required
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div>
                <Label htmlFor="cogs">COGS ($)</Label>
                <Input
                  id="cogs"
                  type="number"
                  step="0.01"
                  value={formData.cogs}
                  onChange={(e) =>
                    setFormData({ ...formData, cogs: e.target.value })
                  }
                  required
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div>
                <Label htmlFor="platformCost">Platform/App Cost ($)</Label>
                <Input
                  id="platformCost"
                  type="number"
                  step="0.01"
                  value={formData.platformCost}
                  onChange={(e) =>
                    setFormData({ ...formData, platformCost: e.target.value })
                  }
                  required
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div>
                <Label htmlFor="adSpend">Ad Spend ($)</Label>
                <Input
                  id="adSpend"
                  type="number"
                  step="0.01"
                  value={formData.adSpend}
                  onChange={(e) =>
                    setFormData({ ...formData, adSpend: e.target.value })
                  }
                  required
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div>
                <Label htmlFor="fulfillmentCost">Fulfillment/Ops Cost ($)</Label>
                <Input
                  id="fulfillmentCost"
                  type="number"
                  step="0.01"
                  value={formData.fulfillmentCost}
                  onChange={(e) =>
                    setFormData({ ...formData, fulfillmentCost: e.target.value })
                  }
                  required
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div>
                <Label htmlFor="otherCosts">Other Costs ($)</Label>
                <Input
                  id="otherCosts"
                  type="number"
                  step="0.01"
                  value={formData.otherCosts}
                  onChange={(e) =>
                    setFormData({ ...formData, otherCosts: e.target.value })
                  }
                  className="bg-background border-border text-foreground"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-neon text-background hover:bg-neon/90"
                disabled={saveData.isPending}
              >
                {saveData.isPending ? "Saving..." : "Save Monthly Data"}
              </Button>
            </form>
          </Card>

          {/* History Table */}
          <Card className="p-6 bg-card border-border">
            <h2 className="font-heading font-bold text-xl mb-4 text-foreground">
              Monthly History
            </h2>

            {history && history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground">Month</th>
                      <th className="text-right py-2 text-muted-foreground">Revenue</th>
                      <th className="text-right py-2 text-muted-foreground">Profit</th>
                      <th className="text-right py-2 text-muted-foreground">Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((entry) => (
                      <tr key={entry.id} className="border-b border-border/50">
                        <td className="py-2 text-foreground">{entry.month}</td>
                        <td className="text-right py-2 text-foreground">
                          ${entry.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="text-right py-2 text-foreground">
                          ${entry.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="text-right py-2 text-foreground">
                          {entry.profitMargin.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No data yet. Add your first month to start tracking!
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
