"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, ShieldAlert, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreCard } from "@/components/dashboard/ScoreCard";
import { CreatorDNA } from "@/components/dashboard/CreatorDNA";
import { InsightList } from "@/components/dashboard/InsightList";
import { SimulatorPanel } from "@/components/dashboard/SimulatorPanel";

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
  const [error, setError] = useState<string | null>(null);
  const [mlResult, setMlResult] = useState<PredictResponse | null>(null);
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const handleParam = searchParams.get("handle");
    if (handleParam) {
      setHandle(handleParam);
    }
    
    // Rotate messages
    const msgInterval = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % messages.length);
    }, 1200);

    // Dynamic Fetch from ML Backend
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Mocking inputs for now as requested
        const payload = {
          followers: 550000,
          avg_likes: 28000,
          avg_comments: 1100,
          follower_growth_std: 450,
          comment_uniqueness_ratio: 0.88,
          fake_follower_ratio: 0.04
        };

        const response = await fetch("http://localhost:8000/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error("Unable to analyze creator. Please try again.");
        }

        const data: PredictResponse = await response.json();
        setMlResult(data);
        
        // Brief delay to ensure smooth transition
        setTimeout(() => setLoading(false), 800);
        
      } catch (err: any) {
        console.error("Dashboard Fetch Error:", err);
        setError("Unable to analyze creator. Please try again.");
        setLoading(false);
      } finally {
        clearInterval(msgInterval);
      }
    };

    fetchData();

    return () => clearInterval(msgInterval);
  }, [searchParams]);

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
      
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/40 backdrop-blur-md rounded-xl mt-[100px] h-[600px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="h-8 flex items-center justify-center">
            <p className="text-xl font-medium text-primary animate-pulse transition-opacity duration-300 text-center px-4">
              {messages[msgIdx]}
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 opacity-30">
        <div className="col-span-1 lg:col-span-12"><Skeleton className="h-[400px] w-full rounded-xl bg-background/50" /></div>
        <div className="col-span-1 lg:col-span-4"><Skeleton className="h-[250px] w-full rounded-xl bg-background/50" /></div>
        <div className="col-span-1 lg:col-span-8"><Skeleton className="h-[250px] w-full rounded-xl bg-background/50" /></div>
      </div>
    </div>
  );

  const ErrorMessage = () => (
    <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4 border border-destructive/20 bg-destructive/5 rounded-xl p-8 mt-12 w-full max-w-2xl mx-auto shadow-sm">
      <ShieldAlert className="w-16 h-16 text-destructive" />
      <h2 className="text-2xl font-extrabold text-destructive tracking-tight">Analysis Inference Failed</h2>
      <p className="text-muted-foreground text-center max-w-md font-medium leading-relaxed">{error}</p>
      <Button 
        onClick={() => window.location.reload()} 
        variant="outline" 
        className="mt-6 h-11 px-8 rounded-full border-destructive/30 hover:bg-destructive/10 hover:text-destructive transition-all"
      >
        Retry Diagnostic
      </Button>
    </div>
  );

  if (error) return <ErrorMessage />;

  return (
    <div className="w-full relative">
      <Button 
        variant="ghost" 
        className="mb-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 -ml-4"
        onClick={() => router.push("/")}
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Search
      </Button>

      {loading || !mlResult ? (
        <LoadingSkeleton />
      ) : (
        <div className="space-y-6 lg:space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-700">
          
          {/* Creator Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-border/40">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
                {handle}
                {mlResult.score >= 75 && <BadgeCheck className="w-8 h-8 text-blue-500 fill-blue-500/10" />}
              </h1>
              <p className="text-lg text-muted-foreground mt-1 flex items-center gap-2">
                Instagram <span className="text-border">•</span> {(mlResult.raw_features.followers || 550000).toLocaleString()} Followers
              </p>
            </div>
            
            <div className="flex gap-3 mt-4 md:mt-0">
              <div className="px-4 py-2 border border-border/50 rounded-lg bg-card/30 flex flex-col items-center justify-center">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Avg Likes</span>
                <span className="text-lg font-mono font-bold">
                  {(mlResult.raw_features.avg_likes / 1000).toFixed(1)}K
                </span>
              </div>
              <div className="px-4 py-2 border border-border/50 rounded-lg bg-card/30 flex flex-col items-center justify-center">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Er. Rate</span>
                <span className="text-lg font-mono font-bold text-emerald-500">
                  {(mlResult.processed_features.engagement_rate * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="col-span-1 lg:col-span-12">
              <CreatorDNA 
                topFactors={mlResult.top_factors} 
                processedFeatures={mlResult.processed_features}
                score={mlResult.score}
              />
            </div>
            
            <div className="col-span-1 lg:col-span-4">
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
            
            <div className="col-span-1 lg:col-span-8">
              <InsightList 
                explanations={mlResult.explanation} 
                topFactors={mlResult.top_factors} 
              />
            </div>
            
            <div className="col-span-1 lg:col-span-12">
              <SimulatorPanel score={mlResult.score} />
            </div>
          </div>

          {/* Latency / Debug Indicator */}
          <div className="pt-8 text-center">
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.2em] opacity-40">
              ML INFERENCE ENGINE V5.3 LOCKED (REF: {mlResult.latency_ms}MS)
            </p>
          </div>
          
        </div>
      )}
    </div>
  );
}
