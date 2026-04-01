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
  "Calculating credibility score..."
];

export default function DashboardClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [handle, setHandle] = useState<string>("@unknown");
  const [loading, setLoading] = useState(true);
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const handleParam = searchParams.get("handle");
    if (handleParam) {
      setHandle(handleParam);
    }
    
    // Rotate messages
    const msgInterval = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % messages.length);
    }, 600); // changes every 600ms

    // Finish loading after 1.8s
    const timer = setTimeout(() => {
      setLoading(false);
      clearInterval(msgInterval);
    }, 1800);

    return () => {
      clearTimeout(timer);
      clearInterval(msgInterval);
    };
  }, [searchParams]);

  const LoadingSkeleton = () => (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      
      {/* Header Skeleton */}
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
      
      {/* Loading Overlay with Text */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/40 backdrop-blur-md rounded-xl mt-[100px] h-[600px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xl font-medium text-primary animate-pulse transition-opacity duration-300">
            {messages[msgIdx]}
          </p>
        </div>
      </div>
      
      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 opacity-30">
        <div className="col-span-1 lg:col-span-12">
          <Skeleton className="h-[400px] w-full rounded-xl bg-background/50" />
        </div>
        <div className="col-span-1 lg:col-span-4">
          <Skeleton className="h-[250px] w-full rounded-xl bg-background/50" />
        </div>
        <div className="col-span-1 lg:col-span-8">
          <Skeleton className="h-[250px] w-full rounded-xl bg-background/50" />
        </div>
        <div className="col-span-1 lg:col-span-12">
          <Skeleton className="h-[350px] w-full rounded-xl bg-background/50" />
        </div>
      </div>
      
    </div>
  );

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

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="space-y-6 lg:space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-700">
          
          {/* Creator Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-border/40">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
                {handle}
                <BadgeCheck className="w-8 h-8 text-blue-500 fill-blue-500/10" />
              </h1>
              <p className="text-lg text-muted-foreground mt-1 flex items-center gap-2">
                Instagram <span className="text-border">•</span> 1.2M Followers
              </p>
            </div>
            
            <div className="flex gap-3 mt-4 md:mt-0">
              <div className="px-4 py-2 border border-border/50 rounded-lg bg-card/30 flex flex-col items-center justify-center">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Avg Likes</span>
                <span className="text-lg font-mono font-bold">45.2K</span>
              </div>
              <div className="px-4 py-2 border border-border/50 rounded-lg bg-card/30 flex flex-col items-center justify-center">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Er. Rate</span>
                <span className="text-lg font-mono font-bold text-emerald-500">3.8%</span>
              </div>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="col-span-1 lg:col-span-12">
              <CreatorDNA />
            </div>
            
            <div className="col-span-1 lg:col-span-4">
              <ScoreCard score={78} />
            </div>
            
            <div className="col-span-1 lg:col-span-8">
              <InsightList />
            </div>
            
            <div className="col-span-1 lg:col-span-12">
              <SimulatorPanel score={78} />
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
