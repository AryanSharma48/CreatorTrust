"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Sparkles, BarChart3, Fingerprint, Activity, AlertCircle, RefreshCw, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreatorInput {
  followers: number;
  avg_likes: number;
  avg_comments: number;
  follower_growth_std: number;
  comment_uniqueness_ratio: number;
  fake_follower_ratio: number;
}

interface CreatorInputControlsProps {
  onPredict: (data: CreatorInput) => void;
  isLoading: boolean;
}

export const DEFAULT_INPUTS: CreatorInput = {
  followers: 500000,
  avg_likes: 25000,
  avg_comments: 1200,
  follower_growth_std: 500,
  comment_uniqueness_ratio: 0.85,
  fake_follower_ratio: 0.05
};

const PRESETS = {
  HIGH_QUALITY: {
    label: "High Quality Creator",
    icon: Sparkles,
    color: "text-emerald-500",
    bg: "hover:bg-emerald-500/10 hover:border-emerald-500/30",
    values: {
      followers: 850000,
      avg_likes: 42000,
      avg_comments: 1800,
      follower_growth_std: 200,
      comment_uniqueness_ratio: 0.92,
      fake_follower_ratio: 0.02
    }
  },
  AVERAGE: {
    label: "Average Creator",
    icon: BarChart3,
    color: "text-blue-500",
    bg: "hover:bg-blue-500/10 hover:border-blue-500/30",
    values: {
      followers: 320000,
      avg_likes: 12000,
      avg_comments: 450,
      follower_growth_std: 600,
      comment_uniqueness_ratio: 0.75,
      fake_follower_ratio: 0.08
    }
  },
  SUSPICIOUS: {
    label: "Suspicious Creator",
    icon: AlertCircle,
    color: "text-red-500",
    bg: "hover:bg-red-500/10 hover:border-red-500/30",
    values: {
      followers: 1200000,
      avg_likes: 4500,
      avg_comments: 80,
      follower_growth_std: 3500,
      comment_uniqueness_ratio: 0.35,
      fake_follower_ratio: 0.32
    }
  }
};

export function CreatorInputControls({ onPredict, isLoading }: CreatorInputControlsProps) {
  const [inputs, setInputs] = useState<CreatorInput>(DEFAULT_INPUTS);

  const handleInputChange = (field: keyof CreatorInput, value: string | number) => {
    let numVal = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numVal)) numVal = 0;
    
    // Non-negative validation for numbers
    if (field !== "comment_uniqueness_ratio" && field !== "fake_follower_ratio") {
      numVal = Math.max(0, numVal);
    }

    setInputs(prev => ({ ...prev, [field]: numVal }));
  };

  const applyPreset = (preset: keyof typeof PRESETS) => {
    setInputs(PRESETS[preset].values);
  };

  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden relative group">
      {/* Animated Gradient Border */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <CardHeader className="pb-4 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Fingerprint className="w-6 h-6 text-primary" /> Creator Input Controls
            </CardTitle>
            <CardDescription className="text-muted-foreground font-medium">
              Manually calibrate creator metrics for dynamic ML-driven authenticity analysis.
            </CardDescription>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map((key) => {
              const PresetIcon = PRESETS[key].icon;
              return (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset(key)}
                  className={cn(
                    "h-9 rounded-full border-border/60 bg-background/40 backdrop-blur-sm transition-all duration-300",
                    PRESETS[key].bg
                  )}
                  disabled={isLoading}
                >
                  <PresetIcon className={cn("w-3.5 h-3.5 mr-2", PRESETS[key].color)} />
                  <span className="text-xs font-semibold">{PRESETS[key].label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Section 1: Audience & Reach */}
          <div className="space-y-5">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 px-1">
              <Layers className="w-3 h-3" /> Audience Metrics
            </h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="followers" className="text-sm font-semibold opacity-80">Followers</Label>
                <div className="relative">
                  <Input
                    id="followers"
                    type="number"
                    value={inputs.followers}
                    onChange={(e) => handleInputChange("followers", e.target.value)}
                    className="h-11 bg-background/50 border-border/60 focus:ring-primary/20 transition-all font-mono font-bold pl-4"
                    disabled={isLoading}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground pointer-events-none">
                    COUNT
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avg_likes" className="text-sm font-semibold opacity-80">Average Likes</Label>
                <div className="relative">
                  <Input
                    id="avg_likes"
                    type="number"
                    value={inputs.avg_likes}
                    onChange={(e) => handleInputChange("avg_likes", e.target.value)}
                    className="h-11 bg-background/50 border-border/60 focus:ring-primary/20 transition-all font-mono font-bold pl-4"
                    disabled={isLoading}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground pointer-events-none">
                    / POST
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Engagement Behavior */}
          <div className="space-y-5">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 px-1">
              <Activity className="w-3 h-3" /> Interaction Dynamics
            </h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="avg_comments" className="text-sm font-semibold opacity-80">Average Comments</Label>
                <div className="relative">
                  <Input
                    id="avg_comments"
                    type="number"
                    value={inputs.avg_comments}
                    onChange={(e) => handleInputChange("avg_comments", e.target.value)}
                    className="h-11 bg-background/50 border-border/60 focus:ring-primary/20 transition-all font-mono font-bold pl-4"
                    disabled={isLoading}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground pointer-events-none">
                    / POST
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="follower_growth_std" className="text-sm font-semibold opacity-80">Follower Growth Volatility</Label>
                <div className="relative">
                  <Input
                    id="follower_growth_std"
                    type="number"
                    value={inputs.follower_growth_std}
                    onChange={(e) => handleInputChange("follower_growth_std", e.target.value)}
                    className="h-11 bg-background/50 border-border/60 focus:ring-primary/20 transition-all font-mono font-bold pl-4"
                    disabled={isLoading}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground pointer-events-none">
                    STD DEV
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: AI Confidence & Ratios */}
          <div className="space-y-5">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 px-1">
              <RefreshCw className="w-3 h-3" /> Integrity Ratios
            </h4>
            
            <div className="space-y-6 pt-2">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold opacity-80">Comment Uniqueness</Label>
                  <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 bg-primary/10 rounded">
                    {(inputs.comment_uniqueness_ratio * 100).toFixed(0)}%
                  </span>
                </div>
                <Slider
                  defaultValue={[inputs.comment_uniqueness_ratio * 100]}
                  max={100}
                  min={0}
                  step={1}
                  value={[inputs.comment_uniqueness_ratio * 100]}
                  onValueChange={(val) => handleInputChange("comment_uniqueness_ratio", val[0] / 100)}
                  disabled={isLoading}
                  className="py-1"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold opacity-80">Fake Follower Ratio</Label>
                  <span className={cn(
                    "text-xs font-mono font-bold px-2 py-0.5 rounded",
                    inputs.fake_follower_ratio > 0.2 ? "text-red-500 bg-red-500/10" : "text-emerald-500 bg-emerald-500/10"
                  )}>
                    {(inputs.fake_follower_ratio * 100).toFixed(0)}%
                  </span>
                </div>
                <Slider
                  defaultValue={[inputs.fake_follower_ratio * 100]}
                  max={100}
                  min={0}
                  step={1}
                  value={[inputs.fake_follower_ratio * 100]}
                  onValueChange={(val) => handleInputChange("fake_follower_ratio", val[0] / 100)}
                  disabled={isLoading}
                  className="py-1"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border/40 flex justify-end">
          <Button 
            onClick={() => {
              console.log("ANALYSIS TRIGGERED WITH:", inputs);
              onPredict(inputs);
            }}
            disabled={isLoading}
            className="h-12 px-10 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20 relative overflow-hidden"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Processing Engine...
              </>
            ) : (
              <>
                Run Advanced Analysis
                <Sparkles className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
