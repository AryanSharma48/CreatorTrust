"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search } from "lucide-react";

export default function Home() {
  const [handle, setHandle] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (handle.trim()) {
      router.push(`/dashboard?handle=${encodeURIComponent(handle.trim())}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8 sm:space-y-12 px-2">
      <div className="space-y-4 sm:space-y-6 max-w-3xl">
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/60">
          Verify Influence. <br className="hidden sm:block"/> Pay for Performance.
        </h1>
        <p className="text-base sm:text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto px-2">
          Analyze creator authenticity, simulate campaign outcomes, and ensure fair pricing with AI-driven insights.
        </p>
      </div>

      <div className="w-full max-w-md mx-auto px-2">
        <form onSubmit={handleSubmit} className="relative flex items-center group">
          <div className="absolute left-3 sm:left-3.5 text-muted-foreground group-focus-within:text-primary transition-colors">
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <Input 
            type="text" 
            placeholder="@username" 
            className="w-full pl-9 sm:pl-11 pr-24 sm:pr-32 h-12 sm:h-14 text-base sm:text-lg rounded-full border-border/60 bg-background/50 backdrop-blur-sm focus-visible:ring-primary shadow-sm transition-all placeholder:text-ellipsis"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
          />
          <Button 
            type="submit" 
            className="absolute right-1 sm:right-1.5 h-9 sm:h-11 rounded-full px-3 sm:px-5 text-sm sm:text-base transition-transform hover:scale-105"
            disabled={!handle.trim()}
          >
            Analyze <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
          </Button>
        </form>
      </div>
      
      <div className="pt-8 sm:pt-16 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl text-left border-t border-border/30 w-full opacity-70 px-2">
        <div>
          <h3 className="font-semibold text-lg mb-2">Authenticity Scoring</h3>
          <p className="text-muted-foreground">Detect fake followers, engagement pods, and irregular growth spikes.</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">Campaign Simulation</h3>
          <p className="text-muted-foreground">Project expected reach, engagement, and conversion before you spend.</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">Fair Pricing</h3>
          <p className="text-muted-foreground">Get benchmarked budget recommendations based on absolute data.</p>
        </div>
      </div>
    </div>
  );
}
