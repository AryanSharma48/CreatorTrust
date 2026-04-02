"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, ShieldAlert, BadgeCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreCard } from "@/components/dashboard/ScoreCard";
import { CreatorDNA } from "@/components/dashboard/CreatorDNA";
import { InsightList } from "@/components/dashboard/InsightList";
import { SimulatorPanel } from "@/components/dashboard/SimulatorPanel";
import { CreatorInputControls, DEFAULT_INPUTS } from "@/components/dashboard/CreatorInputControls";

const messages = [
  "Analyzing audience authenticity...",
  "Detecting engagement anomalies...",
  "Calculating credibility score...",
  "Benchmarking against industry standards...",
  "Generating suitability insights..."
];

interface PredictResponse {
  score: number;
  score_label: string;
  confidence: number;
  confidence_label: string;
  risk_level: string;
  verdict: string;
  key_takeaway: string;
  suitability_insight: string;
  raw_features: Record<string, number>;
  processed_features: Record<string, number>;
  explanation: string[];
  top_factors: string[];
  latency_ms: number;
}

export default function DashboardClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [handle, setHandle] = useState<string>("@unknown");
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mlResult, setMlResult] = useState<PredictResponse | null>(null);
  const [msgIdx, setMsgIdx] = useState(0);

  const handlePredict = useCallback(async (inputs: any = DEFAULT_INPUTS) => {
    try {
      setIsAnalyzing(true);
      setError(null);
      
      console.log("SENDING PREDICT REQUEST:", inputs);
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs)
      });

      if (!response.ok) {
        throw new Error("Unable to analyze creator. Please check if ML Engine is running.");
      }

      const data: PredictResponse = await response.json();
      setMlResult(data);
      
      // Artificial delay for smooth UX transition
      setTimeout(() => {
        setLoading(false);
        setIsAnalyzing(false);
      }, 600);
      
    } catch (err: any) {
      console.error("Dashboard Predict Error:", err);
      setError(err.message || "Unable to analyze creator. Please try again.");
      setLoading(false);
      setIsAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    const handleParam = searchParams.get("handle");
    if (handleParam) {
      setHandle(handleParam);
    }
    
    // Rotate messages for initial loading
    const msgInterval = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % messages.length);
    }, 1200);

    // Initial Auto-run with defaults
    handlePredict(DEFAULT_INPUTS).finally(() => {
      clearInterval(msgInterval);
    });

    return () => clearInterval(msgInterval);
  }, [searchParams, handlePredict]);

  const LoadingSkeleton = () => (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 w-full relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-border/40">
        <div className="space-y-2">
          <Skeleton className="h-10 w-[250px] bg-background/50" />
          <Skeleton className="h-5 w-[150px] bg-background/50" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-[120px] bg-background/50" />
          <Skeleton className="h-10 w-[120px] bg-background/50" />
        </div>
      </div>
      
      <div className="absolute inset-x-0 z-10 flex flex-col items-center justify-center bg-background/40 backdrop-blur-md rounded-xl mt-[100px] h-[500px]">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="h-20 w-20 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute top-0 h-20 w-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="h-8 flex items-center justify-center">
            <p className="text-2xl font-bold text-primary animate-pulse transition-opacity duration-300 text-center px-4 tracking-tight">
              {messages[msgIdx]}
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 opacity-30 mt-12">
        <div className="col-span-1 lg:col-span-12"><Skeleton className="h-[200px] w-full rounded-xl bg-background/50" /></div>
        <div className="col-span-1 lg:col-span-12"><Skeleton className="h-[300px] w-full rounded-xl bg-background/50" /></div>
        <div className="col-span-1 lg:col-span-4"><Skeleton className="h-[400px] w-full rounded-xl bg-background/50" /></div>
        <div className="col-span-1 lg:col-span-8"><Skeleton className="h-[400px] w-full rounded-xl bg-background/50" /></div>
      </div>
    </div>
  );

  const ErrorMessage = () => (
    <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4 border border-destructive/20 bg-destructive/5 rounded-xl p-8 mt-12 w-full max-w-2xl mx-auto shadow-xl backdrop-blur-sm">
      <div className="bg-destructive/10 p-4 rounded-full">
        <ShieldAlert className="w-12 h-12 text-destructive" />
      </div>
      <h2 className="text-2xl font-extrabold text-destructive tracking-tight">Inference System Offline</h2>
      <p className="text-muted-foreground text-center max-w-md font-medium leading-relaxed">{error}</p>
      <div className="flex gap-4 mt-6">
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline" 
          className="h-11 px-8 rounded-full border-destructive/30 hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          Check Engine Status
        </Button>
        <Button 
          onClick={() => router.push("/")} 
          variant="ghost"
          className="h-11 px-8 rounded-full"
        >
          Return Home
        </Button>
      </div>
    </div>
  );

  if (error) return <ErrorMessage />;

  return (
    <div className="w-full relative pb-20">
      <Button 
        variant="ghost" 
        className="mb-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 -ml-4 rounded-full transition-all"
        onClick={() => router.push("/")}
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Research
      </Button>

      {loading || !mlResult ? (
        <LoadingSkeleton />
      ) : (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-1000">
          
          {/* Creator Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-border/40">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                  {handle}
                </h1>
                {mlResult.score >= 75 && (
                  <div className="bg-blue-500/10 p-1 rounded-full border border-blue-500/20">
                    <BadgeCheck className="w-8 h-8 text-blue-500 fill-blue-500/10" />
                  </div>
                )}
              </div>
              <p className="text-xl text-muted-foreground font-medium flex items-center gap-2">
                Instagram Profile <span className="text-border/60 text-sm">•</span> {(mlResult.raw_features.followers || 0).toLocaleString()} Followers
              </p>
            </div>
            
            <div className="flex gap-4">
              <div className="px-6 py-3 border border-border/50 rounded-2xl bg-card/30 backdrop-blur-sm flex flex-col items-center justify-center min-w-[120px] transition-all hover:bg-card/50">
                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1 opacity-60">Avg Likes</span>
                <span className="text-2xl font-mono font-black text-primary">
                  {(mlResult.raw_features.avg_likes / 1000).toFixed(1)}K
                </span>
              </div>
              <div className="px-6 py-3 border border-border/50 rounded-2xl bg-card/30 backdrop-blur-sm flex flex-col items-center justify-center min-w-[120px] transition-all hover:bg-card/50">
                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1 opacity-60">Er. Rate</span>
                <span className="text-2xl font-mono font-black text-emerald-400">
                  {(mlResult.processed_features.engagement_rate * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* New Creator Input Controls Panel */}
          <div className="relative group">
            {isAnalyzing && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/40 backdrop-blur-sm rounded-xl transition-all duration-300">
                <div className="flex flex-col items-center gap-3 scale-110">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <span className="text-sm font-black uppercase tracking-widest text-primary animate-pulse">Analyzing...</span>
                </div>
              </div>
            )}
            <CreatorInputControls 
              onPredict={handlePredict} 
              isLoading={isAnalyzing} 
            />
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="col-span-1 lg:col-span-12">
              <CreatorDNA 
                topFactors={mlResult.top_factors} 
                processedFeatures={mlResult.processed_features}
                score={mlResult.score}
              />
            </div>
            
            <div className="col-span-1 lg:col-span-4 h-full">
              <ScoreCard 
                score={mlResult.score} 
                scoreLabel={mlResult.score_label}
                confidence={mlResult.confidence}
                confidenceLabel={mlResult.confidence_label}
                riskLevel={mlResult.risk_level}
                verdict={mlResult.verdict}
                keyTakeaway={mlResult.key_takeaway}
                suitabilityInsight={mlResult.suitability_insight}
                processedFeatures={mlResult.processed_features}
              />
            </div>
            
            <div className="col-span-1 lg:col-span-8 h-full">
              <InsightList 
                explanations={mlResult.explanation} 
                topFactors={mlResult.top_factors} 
              />
            </div>
            
            <div className="col-span-1 lg:col-span-12">
              <SimulatorPanel 
                score={mlResult.score} 
                followers={mlResult.raw_features.followers}
                engagementRate={mlResult.processed_features.engagement_rate}
              />
            </div>
          </div>

          {/* Latency / Debug Indicator */}
          <div className="pt-12 text-center">
            <div className="inline-flex items-center gap-4 px-4 py-2 bg-muted/20 border border-border/40 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.3em] font-bold">
                Inference Protocol: 0x7E3...{mlResult.latency_ms.toFixed(0)}ms latency
              </p>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
