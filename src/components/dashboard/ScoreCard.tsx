"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, AlertTriangle, XCircle, ChevronDown, ChevronUp, Info, BadgeCheck, ShieldAlert, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoreCardProps {
  score: number;
  scoreLabel: string;
  confidence: number;
  confidenceLabel: string;
  riskLevel: string;
  verdict: string;
  keyTakeaway: string;
  suitabilityInsight: string;
  processedFeatures: Record<string, number>;
}

export function ScoreCard({ 
  score,
  scoreLabel,
  confidence,
  confidenceLabel,
  riskLevel,
  verdict,
  keyTakeaway,
  suitabilityInsight,
  processedFeatures
}: ScoreCardProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    let start = 0;
    const end = score;
    const duration = 1000;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayScore(end);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [score]);

  // Derived styling based on ML risk level
  const isExcellent = score >= 75;
  const isAverage = score >= 45 && score < 75;
  
  let colorClass = isExcellent ? "text-emerald-500" : isAverage ? "text-amber-500" : "text-red-400";
  let bgClass = isExcellent ? "bg-emerald-500/10" : isAverage ? "bg-amber-500/10" : "bg-red-400/10";
  let borderClass = isExcellent ? "border-emerald-500/20" : isAverage ? "border-amber-500/20" : "border-red-400/20";
  let Icon = isExcellent ? ShieldCheck : isAverage ? AlertTriangle : XCircle;
  let BadgeIcon = isExcellent ? BadgeCheck : isAverage ? Info : ShieldAlert;

  const breakdown = [
    { label: "Engagement rate", value: Math.min(processedFeatures.engagement_rate * 100, 100), color: colorClass },
    { label: "Audience authenticity", value: processedFeatures.comment_uniqueness_ratio * 100, color: "text-primary" },
    { label: "Growth pattern stability", value: Math.max(100 - (processedFeatures.growth_variance / 50), 0), color: "text-blue-400" },
  ];

  return (
    <Card className="h-full border-border/40 shadow-sm transition-all hover:shadow-md bg-card/60 backdrop-blur-sm flex flex-col group">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
          <span>Authenticity Score</span>
          <div className={cn("p-2 rounded-full transition-transform group-hover:scale-110", bgClass)}>
            <Icon className={cn("w-4 h-4", colorClass)} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex flex-col gap-1 mt-2">
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-1">
              <span className={cn("text-5xl font-extrabold tracking-tighter transition-all duration-1000", colorClass)}>
                {displayScore}
              </span>
              <span className="text-xl text-muted-foreground font-medium">/100</span>
            </div>
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all",
              bgClass, colorClass, borderClass
            )}>
              <BadgeIcon className="w-3 h-3" />
              {scoreLabel}
            </div>
          </div>
          
          <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-sm font-bold text-primary flex items-center gap-2">
              <Zap className="w-4 h-4 fill-primary/20" />
              {keyTakeaway}
            </p>
          </div>

          <CardDescription className="mt-4 text-xs leading-relaxed font-medium">
            {suitabilityInsight}
          </CardDescription>
        </div>

        <div className="mt-auto pt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Inference Confidence</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${confidence}%` }} />
              </div>
              <span className="text-[10px] font-bold text-primary">{confidenceLabel}</span>
            </div>
          </div>

          <button 
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex items-center justify-between w-full text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <span className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5" />
              Technical Breakdown
            </span>
            {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          <div className={cn(
            "grid transition-all duration-300 ease-in-out",
            showBreakdown ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
          )}>
            <div className="overflow-hidden">
              <div className="space-y-4">
                {breakdown.map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground font-medium">{item.label}</span>
                      <span className={cn("font-bold font-mono", item.color)}>{Math.round(item.value)}%</span>
                    </div>
                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-1000 delay-300", item.color.replace('text', 'bg'))}
                        style={{ width: showBreakdown ? `${item.value}%` : '0%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
