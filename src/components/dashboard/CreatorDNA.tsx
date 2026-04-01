"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Activity, Star, AlertCircle } from "lucide-react";

interface CreatorDNAProps {
  topFactors: string[];
  processedFeatures: Record<string, number>;
  score: number;
}

export function CreatorDNA({ topFactors, processedFeatures, score }: CreatorDNAProps) {
  // Mapping API features to DNA subjects
  const chartData = [
    { subject: 'Authenticity', A: score, fullMark: 100 },
    { subject: 'Engagement', A: Math.min(processedFeatures.engagement_rate * 1000, 100), fullMark: 100 },
    { subject: 'Audience', A: processedFeatures.comment_uniqueness_ratio * 100, fullMark: 100 },
    { subject: 'Stability', A: Math.max(100 - (processedFeatures.growth_variance / 50), 0), fullMark: 100 },
  ];

  const coreStrength = score >= 75 ? "Audience Trust" : "Niche Utility";
  const riskFactor = score < 50 ? "Inorganic Growth" : score < 75 ? "Growth Velocity" : "None Detected";

  return (
    <Card className="col-span-full border-border/40 shadow-sm transition-all hover:shadow-md bg-card/60 backdrop-blur-sm overflow-hidden group">
      <div className="flex flex-col md:flex-row h-full">
        <div className="p-6 md:p-8 md:w-1/3 flex flex-col justify-center space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary/60 flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" /> Creator DNA
            </h2>
            <CardDescription className="text-base text-muted-foreground leading-relaxed">
              A multidimensional breakdown of the creator's true influence footprint. High variance in subjects indicates potential metrics manipulation.
            </CardDescription>
          </div>
          
          <div className="pt-4 grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                <Star className="w-3 h-3 fill-emerald-500" /> Strength
              </p>
              <p className="text-xl font-bold">{coreStrength}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="w-3 h-3 fill-amber-500" /> Risk
              </p>
              <p className="text-xl font-bold">{riskFactor}</p>
            </div>
          </div>

          <div className="pt-6 flex flex-wrap gap-2">
            {topFactors.map((tag) => (
              <span 
                key={tag}
                className="px-2.5 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold text-primary uppercase tracking-wide animate-in fade-in zoom-in duration-500"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="h-[300px] md:h-[400px] w-full md:w-2/3 p-4 md:p-8 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-bl from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none transition-opacity group-hover:opacity-100" />
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
              <PolarGrid stroke="var(--color-border)" strokeDasharray="3 3"/>
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 13, fontWeight: 500 }} 
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-card)', 
                  borderColor: 'var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-foreground)'
                }}
                itemStyle={{ color: 'var(--color-primary)' }}
              />
              <Radar 
                name="DNA Profile" 
                dataKey="A" 
                stroke="var(--color-primary)" 
                fill="var(--color-primary)" 
                fillOpacity={0.4} 
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
