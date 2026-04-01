import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface InsightListProps {
  explanations: string[];
  topFactors: string[];
}

export function InsightList({ explanations, topFactors }: InsightListProps) {
  const getIcon = (text: string) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes("positively") || (lowerText.includes("higher than average") && !lowerText.includes("negatively"))) {
      return <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />;
    }
    if (lowerText.includes("negatively") || lowerText.includes("lower than expected") || lowerText.includes("unstable")) {
      return <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />;
    }
    return <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />;
  };

  return (
    <Card className="h-full border-border/40 shadow-sm transition-all hover:shadow-md bg-card/60 backdrop-blur-sm flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Behavioral Insights
          </CardTitle>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {topFactors.slice(0, 3).map((factor) => (
              <span key={factor} className="px-2 py-0.5 rounded-md bg-primary/10 text-[10px] font-bold text-primary uppercase tracking-tighter whitespace-nowrap">
                {factor}
              </span>
            ))}
          </div>
        </div>
        <CardDescription>Automated detection of audience quality and growth anomalies</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-4">
          {explanations.map((text, idx) => (
            <li key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-border/40 bg-background/40 hover:bg-muted/50 transition-all hover:translate-x-1">
              {getIcon(text)}
              <div className="space-y-1">
                <p className="text-sm font-medium leading-relaxed text-foreground">
                  {text}
                </p>
                <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-widest opacity-60">
                  ML-Inferred Factor
                </p>
              </div>
            </li>
          ))}
        </ul>
        
        {explanations.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-12">
            <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm italic">No significant anomalies detected in this profile.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
