import React, { useState } from "react";
import {
  AlertTriangle,
  Activity,
  Ban,
  CheckCircle2,
  Database,
  Gauge,
  Play,
  ShieldAlert,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

import { useExecutionStatus, useKillSwitch, useResumeTrading } from "@/hooks/useTradingApi";
import { ApiError } from "@/lib/api";
import { ApiState } from "./ApiState";

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);

/** Percentage of a daily cap consumed, clamped for the progress bar. */
const pct = (used: number, cap: number) => (cap > 0 ? Math.min(100, (used / cap) * 100) : 0);

export function ExecutionPanel() {
  const { data, isLoading, error, refetch } = useExecutionStatus();
  const kill = useKillSwitch();
  const resume = useResumeTrading();
  const { toast } = useToast();

  const [confirmKill, setConfirmKill] = useState(false);
  const [confirmResume, setConfirmResume] = useState(false);

  const onKill = async () => {
    setConfirmKill(false);
    try {
      await kill.mutateAsync();
      toast({
        title: "Trading halted",
        description: "Order placement is stopped until you resume it.",
      });
    } catch (e) {
      toast({
        title: "Could not halt trading",
        description: e instanceof ApiError ? e.message : "Unexpected error",
        variant: "destructive",
      });
    }
  };

  const onResume = async () => {
    setConfirmResume(false);
    try {
      await resume.mutateAsync();
      toast({
        title: "Trading re-armed",
        description: "Order placement is live again and daily counters were cleared.",
      });
    } catch (e) {
      toast({
        title: "Could not resume trading",
        description: e instanceof ApiError ? e.message : "Unexpected error",
        variant: "destructive",
      });
    }
  };

  return (
    <ApiState
      isLoading={isLoading}
      error={error}
      onRetry={() => refetch()}
      disabledTitle="Execution is not enabled"
      disabledHint="Set engine.enabled: true in configs/strategy.yaml and restart the server."
    >
      {data && (
        <div className="space-y-6">
          {/* Kill switch */}
          <Card className="trading-card border-trading-bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-trading-text">
                <ShieldAlert className="w-5 h-5" />
                Execution control
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={
                    data.mode === "LIVE"
                      ? "border-trading-loss text-trading-loss"
                      : "border-trading-info text-trading-info"
                  }
                >
                  {data.mode === "LIVE" ? "LIVE — REAL MONEY" : "PAPER"}
                </Badge>
                {data.guard?.tripped ? (
                  <Badge variant="outline" className="border-trading-loss text-trading-loss">
                    HALTED
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-trading-profit text-trading-profit">
                    ARMED
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {data.guard?.tripped && (
                <div className="flex items-start gap-3 rounded-md border border-trading-loss/40 bg-trading-loss/10 p-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-trading-loss" />
                  <div className="text-sm">
                    <p className="loss-text">Order placement is halted.</p>
                    <p className="text-trading-text/70">
                      Reason: <span className="font-mono">{data.guard.reason || "unknown"}</span>
                      {data.guard.tripped_at && (
                        <> · since {new Date(data.guard.tripped_at).toLocaleTimeString()}</>
                      )}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="destructive"
                  onClick={() => setConfirmKill(true)}
                  disabled={kill.isPending || data.guard?.tripped}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  {data.guard?.tripped ? "Already halted" : "Halt trading"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setConfirmResume(true)}
                  disabled={resume.isPending || !data.guard?.tripped}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Resume trading
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Daily caps */}
          {data.guard && (
            <Card className="trading-card border-trading-bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-trading-text">
                  <Gauge className="w-5 h-5" />
                  Daily limits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-trading-text/70">Orders today</span>
                    <span className="font-mono">
                      {data.guard.orders_today} / {data.guard.max_orders_per_day}
                    </span>
                  </div>
                  <Progress value={pct(data.guard.orders_today, data.guard.max_orders_per_day)} />
                </div>

                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-trading-text/70">Notional today</span>
                    <span className="font-mono">
                      {inr(data.guard.notional_today)} / {inr(data.guard.max_notional_per_day)}
                    </span>
                  </div>
                  <Progress value={pct(data.guard.notional_today, data.guard.max_notional_per_day)} />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
                  <Stat label="Placed" value={data.guard.placed} />
                  <Stat label="Refused" value={data.guard.refused} tone={data.guard.refused > 0 ? "warn" : undefined} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Executor + persistence health */}
          <div className="grid gap-4 md:grid-cols-2">
            {data.executor && (
              <Card className="trading-card border-trading-bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-trading-text">
                    <Activity className="w-5 h-5" />
                    Executor
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <Stat label="Placed" value={data.executor.placed} />
                  <Stat
                    label="Failed"
                    value={data.executor.failed}
                    tone={data.executor.failed > 0 ? "bad" : undefined}
                  />
                </CardContent>
              </Card>
            )}

            {data.persistence && (
              <Card className="trading-card border-trading-bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-trading-text">
                    <Database className="w-5 h-5" />
                    Trade persistence
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <Stat label="Written" value={data.persistence.written} />
                  <Stat label="Queued" value={data.persistence.queued} />
                  {/* Dropped and failed mean trade history is incomplete. */}
                  <Stat
                    label="Dropped"
                    value={data.persistence.dropped}
                    tone={data.persistence.dropped > 0 ? "bad" : undefined}
                  />
                  <Stat
                    label="Failed"
                    value={data.persistence.failed}
                    tone={data.persistence.failed > 0 ? "bad" : undefined}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      <AlertDialog open={confirmKill} onOpenChange={setConfirmKill}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Halt all order placement?</AlertDialogTitle>
            <AlertDialogDescription>
              Strategies keep evaluating, but no further orders will be placed until you resume.
              Positions already open are <strong>not</strong> closed — you must exit them yourself.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onKill}>Halt trading</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmResume} onOpenChange={setConfirmResume}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resume order placement?</AlertDialogTitle>
            <AlertDialogDescription>
              {data?.mode === "LIVE"
                ? "This account is in LIVE mode. Resuming means real orders can be placed again."
                : "Paper trading will resume."}{" "}
              Daily order and notional counters will be reset to zero. Make sure whatever caused the
              halt is actually fixed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onResume}>Resume</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ApiState>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone?: "warn" | "bad";
}) {
  const cls =
    tone === "bad" ? "loss-text" : tone === "warn" ? "text-trading-info font-semibold" : "text-trading-text font-semibold";
  return (
    <div>
      <p className="text-trading-text/60">{label}</p>
      <p className={`font-mono text-lg ${cls}`}>{value}</p>
    </div>
  );
}

export default ExecutionPanel;
