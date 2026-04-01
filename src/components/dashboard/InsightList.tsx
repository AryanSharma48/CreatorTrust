import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

export function InsightList() {
  const insights = [
    {
      id: 1,
      type: "positive",
      text: "High engagement consistency",
      description: "Likes and comments follow a stable, organic pattern relative to follower growth.",
    },
    {
      id: 2,
      type: "negative",
      text: "Suspicious follower spike detected",
      description: "Sudden influx of 25%+ followers over a 48-hour period with low interaction.",
    },
    {
      id: 3,
      type: "warning",
      text: "Repetitive comments pattern",
      description: "15% of comments consist of single emojis or identical phrases from bot-like clusters.",
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "positive":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />;
      case "negative":
        return <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <Card className="h-full border-border/40 shadow-sm transition-all hover:shadow-md bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold tracking-tight text-foreground">AI Output Insights</CardTitle>
        <CardDescription>Behavioral anomalies and quality indicators</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-5">
          {insights.map((insight) => (
            <li key={insight.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              {getIcon(insight.type)}
              <div className="space-y-1">
                <p className="text-sm font-semibold leading-none">{insight.text}</p>
                <p className="text-sm text-muted-foreground leading-snug">{insight.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
