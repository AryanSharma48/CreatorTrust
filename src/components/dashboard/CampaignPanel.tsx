"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Wallet, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Zap,
  FileCheck,
  Banknote
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ContractState {
  funds_locked: boolean;
  condition_met: boolean;
  status: string;
  budget: number;
  engagement_threshold: number;
  transaction_hash: string | null;
  created_at: number | null;
  verified_at: number | null;
  released_at: number | null;
}

interface CampaignPanelProps {
  mlScore?: number;
  engagementRate?: number;
  followers?: number;
}

const formatINR = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

const truncateHash = (hash: string | null) => {
  if (!hash) return "—";
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "Funds Locked":
      return { 
        color: "text-blue-400", 
        bg: "bg-blue-500/10", 
        border: "border-blue-500/30",
        icon: Lock,
        glow: ""
      };
    case "Conditions Not Met":
      return { 
        color: "text-amber-400", 
        bg: "bg-amber-500/10", 
        border: "border-amber-500/30",
        icon: XCircle,
        glow: ""
      };
    case "Ready for Release":
      return { 
        color: "text-emerald-400", 
        bg: "bg-emerald-500/10", 
        border: "border-emerald-500/30",
        icon: CheckCircle2,
        glow: ""
      };
    case "Payment Released":
      return { 
        color: "text-emerald-400", 
        bg: "bg-emerald-500/20", 
        border: "border-emerald-500/50",
        icon: Unlock,
        glow: "shadow-[0_0_30px_rgba(16,185,129,0.3)]"
      };
    default:
      return { 
        color: "text-muted-foreground", 
        bg: "bg-muted/20", 
        border: "border-border/40",
        icon: Wallet,
        glow: ""
      };
  }
};

export function CampaignPanel({ 
  mlScore = 0, 
  engagementRate = 0,
  followers = 0
}: CampaignPanelProps) {
  const [contractState, setContractState] = useState<ContractState | null>(null);
  const [budget, setBudget] = useState<string>("50000");
  const [threshold, setThreshold] = useState<string>("5000");
  const [isStarting, setIsStarting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_ML_API_URL || "http://localhost:8000";

  // Fetch contract status on mount
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${apiUrl}/contract/status`);
      if (response.ok) {
        const data = await response.json();
        setContractState(data);
      }
    } catch (err) {
      console.error("Failed to fetch contract status:", err);
    }
  };

  const handleStartCampaign = async () => {
    setIsStarting(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/contract/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budget: parseFloat(budget),
          engagement_threshold: parseFloat(threshold)
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to start contract");
      }

      const data = await response.json();
      setContractState(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsStarting(false);
    }
  };

  const handleVerifyResults = async () => {
    setIsVerifying(true);
    setError(null);
    try {
      // Calculate expected engagement based on followers and engagement rate
      const expectedEngagement = followers * engagementRate;
      
      const response = await fetch(`${apiUrl}/contract/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: mlScore,
          engagement: expectedEngagement
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to verify contract");
      }

      const data = await response.json();
      setContractState(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReleasePayment = async () => {
    setIsReleasing(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/contract/release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to release payment");
      }

      const data = await response.json();
      setContractState(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsReleasing(false);
    }
  };

  const handleReset = async () => {
    try {
      const response = await fetch(`${apiUrl}/contract/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        const data = await response.json();
        setContractState(data);
        setError(null);
      }
    } catch (err) {
      console.error("Failed to reset contract:", err);
    }
  };

  const status = contractState?.status || "Not Started";
  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  const isContractActive = contractState?.funds_locked || false;
  const canVerify = isContractActive && status === "Funds Locked";
  const canRelease = contractState?.condition_met || false;
  const isCompleted = status === "Payment Released";

  return (
    <Card className={cn(
      "col-span-full border-border/40 shadow-sm transition-all bg-card/60 backdrop-blur-sm overflow-hidden",
      statusConfig.glow
    )}>
      <CardHeader className="pb-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-primary" />
              Campaign Execution
            </CardTitle>
            <CardDescription className="mt-1">
              Smart contract simulation for performance-linked payments
            </CardDescription>
          </div>
          {isContractActive && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleReset}
              className="text-muted-foreground hover:text-destructive"
            >
              Reset
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Contract Setup */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-primary" />
                  Campaign Budget (₹)
                </Label>
                <Input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  disabled={isContractActive}
                  className="h-12 text-lg font-mono bg-background/50 border-border/60"
                  placeholder="50000"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Engagement Threshold
                </Label>
                <Input
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  disabled={isContractActive}
                  className="h-12 text-lg font-mono bg-background/50 border-border/60"
                  placeholder="5000"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum engagement required for payment release
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <Button
                onClick={handleStartCampaign}
                disabled={isStarting || isContractActive}
                className={cn(
                  "h-12 text-base font-semibold rounded-xl transition-all",
                  !isContractActive && "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {isStarting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Locking Funds...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Start Campaign
                  </>
                )}
              </Button>

              <Button
                onClick={handleVerifyResults}
                disabled={isVerifying || !canVerify}
                variant="outline"
                className={cn(
                  "h-12 text-base font-semibold rounded-xl transition-all border-2",
                  canVerify && "border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                )}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4 mr-2" />
                    Verify Results
                  </>
                )}
              </Button>

              <Button
                onClick={handleReleasePayment}
                disabled={isReleasing || !canRelease || isCompleted}
                className={cn(
                  "h-12 text-base font-semibold rounded-xl transition-all",
                  canRelease && !isCompleted && "bg-emerald-600 hover:bg-emerald-700",
                  isCompleted && "bg-emerald-600/50"
                )}
              >
                {isReleasing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Releasing...
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4 mr-2" />
                    Release Payment
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Right: Contract Status Display */}
          <div className="lg:col-span-7 space-y-4">
            {/* Status Badge */}
            <div className={cn(
              "p-6 rounded-2xl border-2 transition-all duration-500",
              statusConfig.bg,
              statusConfig.border,
              statusConfig.glow
            )}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                  Contract Status
                </span>
                <StatusIcon className={cn("w-6 h-6", statusConfig.color)} />
              </div>
              <div className={cn(
                "text-3xl font-black tracking-tight",
                statusConfig.color
              )}>
                {status}
              </div>
              {isCompleted && (
                <p className="text-sm text-emerald-400/80 mt-2 font-medium animate-pulse">
                  ✓ Recorded on-chain (simulated)
                </p>
              )}
            </div>

            {/* Contract Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-background/40 border border-border/40">
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold block mb-1">
                  Locked Budget
                </span>
                <span className="text-2xl font-mono font-bold text-primary">
                  {contractState?.budget ? formatINR(contractState.budget) : "—"}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-background/40 border border-border/40">
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold block mb-1">
                  Threshold
                </span>
                <span className="text-2xl font-mono font-bold text-amber-400">
                  {contractState?.engagement_threshold?.toLocaleString() || "—"}
                </span>
              </div>
            </div>

            {/* Transaction Hash */}
            {contractState?.transaction_hash && (
              <div className="p-4 rounded-xl bg-background/40 border border-border/40">
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold block mb-2">
                  Transaction Hash
                </span>
                <code className="text-sm font-mono text-primary/80 bg-primary/5 px-3 py-2 rounded-lg block overflow-hidden text-ellipsis">
                  {truncateHash(contractState.transaction_hash)}
                </code>
              </div>
            )}

            {/* ML Score Context */}
            {isContractActive && (
              <div className="p-4 rounded-xl bg-muted/20 border border-border/40">
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold block mb-3">
                  Verification Parameters
                </span>
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="text-muted-foreground">ML Score: </span>
                    <span className={cn(
                      "font-bold",
                      mlScore >= 70 ? "text-emerald-400" : "text-amber-400"
                    )}>
                      {mlScore.toFixed(1)}
                    </span>
                    <span className="text-muted-foreground/60"> (needs ≥70)</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expected Engagement: </span>
                    <span className="font-bold text-primary">
                      {Math.round(followers * engagementRate).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
