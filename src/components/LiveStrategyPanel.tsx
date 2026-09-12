import React from "react";
import { AlertTriangle, Ban, Brain, CheckCircle2, Signal, Target } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { useStrategies } from "@/hooks/useTradingApi";
import { ApiState } from "./ApiState";

export function LiveStrategyPanel() {
  const { data, isLoading, error, refetch } = useStrategies();

  return (
    <ApiState
      isLoading={isLoading}
      error={error}
      onRetry={() => refetch()}
      disabledTitle="Strategy engine is not enabled"
      disabledHint="Set engine.enabled: true in configs/strategy.yaml and restart the server."
    >
      {data && (
        <div className="space-y-6">
          {/* The engine can be built but switched off in config; say so plainly
              rather than showing zeroes that look like a dead feed. */}
          {!data.enabled && (
            <Card className="trading-card border-trading-bg-card">
              <CardContent className="flex items-center gap-3 py-4">
                <Ban className="h-5 w-5 text-trading-text/40" />
                <p className="text-sm text-trading-text/70">
                  The strategy engine is registered but disabled. Enable it in{" "}
                  <span className="font-mono">configs/strategy.yaml</span> to start evaluating.
                </p>
              </CardContent>
            </Card>
          )}

          {data.engine && (
            <>
              {/* A panic means a strategy threw. It is always a bug. */}
              {data.engine.panics > 0 && (
                <Card className="trading-card border-trading-loss/40">
                  <CardContent className="flex items-start gap-3 py-4">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-trading-loss" />
                    <div className="text-sm">
                      <p className="loss-text">
                        {data.engine.panics} strategy panic
                        {data.engine.panics === 1 ? "" : "s"} recovered
                      </p>
                      <p className="text-trading-text/70">
                        The engine survived, but a strategy is throwing. Check the server logs.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Tile
                  icon={<Signal className="h-5 w-5" />}
                  label="Candles evaluated"
                  value={data.engine.evaluated}
                />
                <Tile
                  icon={<Target className="h-5 w-5" />}
                  label="Signals"
                  value={data.engine.signals}
                />
                <Tile
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  label="Orders emitted"
                  value={data.engine.orders}
                />
                <Tile
                  icon={<Ban className="h-5 w-5" />}
                  label="Risk rejections"
                  value={data.engine.rejects}
                  tone={data.engine.rejects > 0 ? "info" : undefined}
                />
              </div>

              <Card className="trading-card border-trading-bg-card">
                <CardHeader>
                  <CardTitle className="text-trading-text">Risk state</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <Tile label="Trades today" value={data.engine.risk.trades_today} bare />
                  <Tile label="Open positions" value={data.engine.risk.open_positions} bare />
                  <Tile
                    label="Realised P&L"
                    value={data.engine.risk.realized_pnl.toFixed(2)}
                    bare
                    tone={
                      data.engine.risk.realized_pnl > 0
                        ? "profit"
                        : data.engine.risk.realized_pnl < 0
                          ? "loss"
                          : undefined
                    }
                  />
                </CardContent>
              </Card>
            </>
          )}

          <Card className="trading-card border-trading-bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-trading-text">
                <Brain className="h-5 w-5" />
                Registered strategies
              </CardTitle>
              {data.engine && (
                <Badge variant="outline" className="border-trading-info text-trading-info">
                  {data.engine.slots} active slot{data.engine.slots === 1 ? "" : "s"}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              {data.registered.length === 0 ? (
                <p className="py-6 text-center text-sm text-trading-text/50">
                  No strategies registered.
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {data.registered.map((s) => (
                    <div
                      key={s.name}
                      className="flex items-center justify-between rounded-md border border-trading-bg-card px-3 py-2"
                    >
                      <span className="font-mono text-sm text-trading-text">{s.name}</span>
                      <Badge
                        variant="outline"
                        className="border-trading-profit text-trading-profit"
                      >
                        registered
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-4 text-xs text-trading-text/50">
                A strategy appears here once it calls strategy.Register in its init(). Whether it
                actually runs is decided by configs/strategy.yaml.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </ApiState>
  );
}

function Tile({
  icon,
  label,
  value,
  tone,
  bare,
}: {
  icon?: React.ReactNode;
  label: string;
  value: number | string;
  tone?: "profit" | "loss" | "info";
  bare?: boolean;
}) {
  const cls =
    tone === "profit"
      ? "profit-text"
      : tone === "loss"
        ? "loss-text"
        : tone === "info"
          ? "info-text"
          : "text-trading-text";

  const body = (
    <div className="flex items-center gap-3">
      {icon && <div className="text-trading-text/50">{icon}</div>}
      <div className="min-w-0">
        <p className="truncate text-xs text-trading-text/60">{label}</p>
        <p className={`font-mono text-lg ${cls}`}>{value}</p>
      </div>
    </div>
  );

  if (bare) return body;

  return (
    <Card className="trading-card border-trading-bg-card">
      <CardContent className="p-4">{body}</CardContent>
    </Card>
  );
}

export default LiveStrategyPanel;
