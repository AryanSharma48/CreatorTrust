"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, AlertTriangle, XCircle, ChevronDown, ChevronUp, Info, BadgeCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoreCardProps {
  score: number;
}

export function ScoreCard({ score }: ScoreCardProps) {
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

  let colorClass = "text-red-400";
  let Icon = XCircle;
  let statusText = "High Risk";
  let bgClass = "bg-red-400/10";
  let BadgeIcon = ShieldAlert;

  if (score >= 75) {
    colorClass = "text-emerald-500";
    Icon = ShieldCheck;
    statusText = "Verified Creator";
    bgClass = "bg-emerald-500/10";
    BadgeIcon = BadgeCheck;
  } else if (score >= 50) {
    colorClass = "text-amber-500";
    Icon = AlertTriangle;
    statusText = "Moderate Risk";
    bgClass = "bg-amber-500/10";
    BadgeIcon = Info;
  }

  const breakdown = [
    { label: "Engagement Quality", value: 82, desc: "Strong", color: "text-emerald-500" },
    { label: "Growth Consistency", value: 94, desc: "Normal", color: "text-emerald-500" },
    { label: "Comment Authenticity", value: 88, desc: "High", color: "text-emerald-500" },
  ];

  return (
    <Card className="h-full border-border/40 shadow-sm transition-all hover:shadow-md bg-card/60 backdrop-blur-sm flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
          <span>Authenticity Score</span>
          <div className={cn("p-2 rounded-full", bgClass)}>
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
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
              score >= 75 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
              score >= 50 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
              "bg-red-400/10 text-red-400 border-red-400/20"
            )}>
              <BadgeIcon className="w-3 h-3" />
              {statusText}
            </div>
          </div>
          <CardDescription className="mt-3 text-xs leading-relaxed">
            AI-driven analysis of overall credibility based on audience quality and growth.
          </CardDescription>
        </div>

        <div className="mt-6 pt-4 border-t border-border/40">
          <button 
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex items-center justify-between w-full text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <span className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5" />
              Why this score?
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
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className={cn("font-bold", item.color)}>{item.value} — {item.desc}</span>
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
