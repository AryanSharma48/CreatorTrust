"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Zap, Eye, Target, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const formatINR = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number) => {
  if (value >= 100000) {
    return (value / 100000).toFixed(1) + "L";
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + "K";
  }
  return value.toLocaleString("en-IN");
};

type CampaignType = "awareness" | "engagement" | "conversion";

interface SimulatorPanelProps {
  score?: number;
  followers?: number;
  engagementRate?: number;
}

export function SimulatorPanel({ 
  score = 75, 
  followers = 500000, 
  engagementRate = 0.05 
}: SimulatorPanelProps) {
  const [budget, setBudget] = useState(10000);
  const [campaignType, setCampaignType] = useState<CampaignType>("awareness");
  const [isUpdating, setIsUpdating] = useState(false);

  const output = useMemo(() => {
    // Dynamic calculation based on ML outputs
    const baseReach = followers * (score / 100);
    const baseEngagement = baseReach * engagementRate;

    // Budget scaling logic (assuming $10k is baseline for full potential)
    const budgetFactor = Math.min(budget / 10000, 2.5);

    switch (campaignType) {
      case "awareness":
        return {
          reach: baseReach * budgetFactor * 1.5,
          engagement: baseEngagement * budgetFactor * 0.5,
          risk: score >= 75 ? "Low" : score >= 50 ? "Medium" : "High",
          riskColor: score >= 75 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-red-400",
          riskBg: score >= 75 ? "bg-emerald-500/10" : score >= 50 ? "bg-amber-500/10" : "bg-red-400/10",
          reachDelta: "+12% vs avg",
        };
      case "engagement":
        return {
          reach: baseReach * budgetFactor * 0.8,
          engagement: baseEngagement * budgetFactor * 2.5,
          risk: score >= 75 ? "Low" : score >= 50 ? "Medium" : "High",
          riskColor: score >= 75 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-red-400",
          riskBg: score >= 75 ? "bg-emerald-500/10" : score >= 50 ? "bg-amber-500/10" : "bg-red-400/10",
          reachDelta: "+5% vs avg",
        };
      case "conversion":
        return {
          reach: baseReach * budgetFactor * 0.5,
          engagement: baseEngagement * budgetFactor * 1.2,
          risk: score >= 60 ? "Medium" : "High",
          riskColor: score >= 60 ? "text-amber-500" : "text-red-400",
          riskBg: score >= 60 ? "bg-amber-500/10" : "bg-red-400/10",
          reachDelta: "-3% vs avg",
        };
      default:
        return {
          reach: 0,
          engagement: 0,
          risk: "Unknown",
          riskColor: "text-muted-foreground",
          riskBg: "bg-muted",
          reachDelta: "",
        };
    }
  }, [budget, campaignType, score, followers, engagementRate]);

  const handleSliderChange = (value: number | readonly number[]) => {
    const newVal = Array.isArray(value) ? value[0] : value;
    if (newVal !== budget) {
      setBudget(newVal ?? 10000);
      setIsUpdating(true);
      setTimeout(() => setIsUpdating(false), 400);
    }
  };

  const handleSelectChange = (value: string | null) => {
    if (value) {
      setCampaignType(value as CampaignType);
      setIsUpdating(true);
      setTimeout(() => setIsUpdating(false), 400);
    }
  };

  const insight = useMemo(() => {
    if (score >= 75) {
      if (campaignType === "awareness") return "Highly recommended. Excellent organic reach potential with minimal bot risk.";
      if (campaignType === "engagement") return "Exceptional interaction quality from a verified authentic audience.";
      return "Strong conversion potential backed by high audience trust scores.";
    } else if (score >= 50) {
      return `Moderate authenticity — expect a ${output.risk.toLowerCase()} risk profile for ${campaignType} objectives.`;
    }
    return "Caution: Significant markers of inorganic engagement detected. Proceed with performance-linked contracts.";
  }, [score, campaignType, output.risk]);

  const recommendedBudget = useMemo(() => {
    // Base cost: $15 - $45 per 1,000 followers, adjusted by score
    const qualityMultiplier = score / 100;
    const min = (followers / 1000) * 15 * qualityMultiplier;
    const max = (followers / 1000) * 45 * qualityMultiplier;
    return { min: Math.max(1000, min), max: Math.max(2500, max) };
  }, [followers, score]);

  return (
    <Card className="col-span-full border-border/40 shadow-sm transition-all hover:shadow-md bg-card/60 backdrop-blur-sm overflow-hidden flex flex-col md:flex-row">
      {/* Inputs Section */}
      <div className="w-full md:w-5/12 p-6 md:p-8 border-b md:border-b-0 md:border-r border-border/40 space-y-8 bg-muted/20">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 mb-2">
            <Calculator className="w-5 h-5 text-primary" /> What-If Simulator
          </h2>
          <CardDescription>
            Predict campaign outcomes dynamically based on live ML insights.
          </CardDescription>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Budget Investment</Label>
              <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-md font-mono">
                {formatINR(budget)}
              </span>
            </div>
            <Slider
              defaultValue={[10000]}
              max={200000}
              min={1000}
              step={1000}
              value={[budget]}
              onValueChange={handleSliderChange}
              className="py-2 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground font-mono">
              <span>{formatINR(1000)}</span>
              <span>{formatINR(200000)}</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Label className="text-sm font-medium">Campaign Objective</Label>
            <Select value={campaignType} onValueChange={handleSelectChange}>
              <SelectTrigger className="h-12 w-full bg-background/50 border-border/60">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="awareness">Awareness (Maximize Reach)</SelectItem>
                <SelectItem value="engagement">Engagement (Maximize Interaction)</SelectItem>
                <SelectItem value="conversion">Conversion (Direct Response)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-primary/5 rounded-lg p-4 flex items-start gap-3 border border-primary/20">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-primary/80">
            Dynamic budget range for this profile:{" "}
            <span className="font-semibold text-primary">
              {formatINR(recommendedBudget.min)} – {formatINR(recommendedBudget.max)}
            </span>
          </p>
        </div>
      </div>

      {/* Outputs Section */}
      <div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col justify-center">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-muted-foreground">
          <Zap className="w-4 h-4" /> Projected Outcomes
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className={cn(
            "bg-background/40 border-border/40 shadow-none hover:bg-background/60 transition-all duration-300",
            isUpdating && "ring-2 ring-emerald-500/30 bg-emerald-500/5"
          )}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-500" /> Expected Reach
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-3xl font-bold font-mono tracking-tight transition-all duration-300",
                isUpdating && "scale-105 text-emerald-500"
              )}>
                {formatNumber(output.reach)}
              </div>
              <p className="text-xs text-emerald-500 mt-1 font-medium">
                {output.reachDelta}
              </p>
            </CardContent>
          </Card>

          <Card className={cn(
            "bg-background/40 border-border/40 shadow-none hover:bg-background/60 transition-all duration-300",
            isUpdating && "ring-2 ring-primary/30 bg-primary/5"
          )}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" /> Est. Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-3xl font-bold font-mono tracking-tight transition-all duration-300",
                isUpdating && "scale-105 text-primary"
              )}>
                {formatNumber(output.engagement)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Likes, comments, shares
              </p>
            </CardContent>
          </Card>

          <Card className="bg-background/40 border-border/40 shadow-none hover:bg-background/60 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className={cn("w-4 h-4", output.riskColor)} />{" "}
                Risk Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold",
                  output.riskBg,
                  output.riskColor
                )}
              >
                {output.risk}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 pt-6 border-t border-border/40">
          <div className="flex items-center gap-3 text-muted-foreground italic">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <p className="text-sm leading-relaxed">
              {insight}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
