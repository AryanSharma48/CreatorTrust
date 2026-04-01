"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Activity } from "lucide-react";

const data = [
  { subject: 'Authenticity', A: 78, fullMark: 100 },
  { subject: 'Quality', A: 85, fullMark: 100 },
  { subject: 'Trust', A: 92, fullMark: 100 },
  { subject: 'Niche', A: 88, fullMark: 100 },
];

export function CreatorDNA() {
  return (
    <Card className="col-span-full border-border/40 shadow-sm transition-all hover:shadow-md bg-card/60 backdrop-blur-sm overflow-hidden group">
      <div className="flex flex-col md:flex-row h-full">
        <div className="p-6 md:p-8 md:w-1/3 flex flex-col justify-center space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary/60 flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" /> Creator DNA
            </h2>
            <CardDescription className="text-base text-muted-foreground leading-relaxed">
              A comprehensive multidimensional breakdown of the creator's true influence footprint versus their perceived public metrics. High variance indicates inorganic activity.
            </CardDescription>
          </div>
          <div className="pt-4 grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground text-emerald-500">Core Strength</p>
              <p className="text-xl font-bold">Audience Trust</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground text-amber-500">Risk Factor</p>
              <p className="text-xl font-bold">Authenticity</p>
            </div>
          </div>

          <div className="pt-6 flex flex-wrap gap-2">
            {[
              "Highly Authentic Audience",
              "Consistent Engagement",
              "Minor Growth Anomaly"
            ].map((tag) => (
              <span 
                key={tag}
                className="px-2.5 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold text-primary uppercase tracking-wide"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="h-[300px] md:h-[400px] w-full md:w-2/3 p-4 md:p-8 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-bl from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none transition-opacity group-hover:opacity-100" />
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
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
