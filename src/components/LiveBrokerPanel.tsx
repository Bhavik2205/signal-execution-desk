import React from "react";
import { CheckCircle2, Link2, Link2Off, ShieldCheck, XCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { useBrokerStatus, useExecutionStatus } from "@/hooks/useTradingApi";
import { ApiState } from "./ApiState";

export function LiveBrokerPanel() {
  const broker = useBrokerStatus();
  const execution = useExecutionStatus();

  return (
    <ApiState
      isLoading={broker.isLoading}
      error={broker.error}
      onRetry={() => broker.refetch()}
      disabledTitle="Broker status is unavailable"
    >
      {broker.data && (
        <div className="space-y-6">
          <Card className="trading-card border-trading-bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-trading-text">
                {broker.data.connected ? (
                  <Link2 className="h-5 w-5 text-trading-profit" />
                ) : (
                  <Link2Off className="h-5 w-5 text-trading-loss" />
                )}
                {broker.data.broker || "ZERODHA"}
              </CardTitle>
              <Badge
                variant="outline"
                className={
                  broker.data.connected
                    ? "border-trading-profit text-trading-profit"
                    : "border-trading-loss text-trading-loss"
                }
              >
                {broker.data.connected ? "CONNECTED" : "DISCONNECTED"}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-4">
              {!broker.data.connected && (
                <p className="text-sm text-trading-text/70">
                  No live broker session. The server runs in simulation mode unless
                  <span className="font-mono"> market.simulate </span>
                  is false and the ZERODHA_* environment variables hold a valid session.
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                <Detail label="User ID" value={broker.data.userId || "—"} />
                <Detail label="Name" value={broker.data.userName || "—"} />
                <Detail label="Email" value={broker.data.email || "—"} />
                <Detail
                  label="Last synced"
                  value={
                    broker.data.lastSyncedAt
                      ? new Date(broker.data.lastSyncedAt).toLocaleTimeString()
                      : "—"
                  }
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                {broker.data.tradingEnabled ? (
                  <CheckCircle2 className="h-5 w-5 text-trading-profit" />
                ) : (
                  <XCircle className="h-5 w-5 text-trading-text/40" />
                )}
                <span className="text-sm text-trading-text/70">
                  Broker-side trading {broker.data.tradingEnabled ? "enabled" : "disabled"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Broker connectivity and the bot's own trading mode are separate
              things: a connected broker does not mean orders will be placed. */}
          {execution.data && (
            <Card className="trading-card border-trading-bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-trading-text">
                  <ShieldCheck className="h-5 w-5" />
                  Bot trading mode
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={
                      execution.data.mode === "LIVE"
                        ? "border-trading-loss text-trading-loss"
                        : "border-trading-info text-trading-info"
                    }
                  >
                    {execution.data.mode === "LIVE" ? "LIVE — REAL MONEY" : "PAPER"}
                  </Badge>
                  {execution.data.guard?.tripped && (
                    <Badge variant="outline" className="border-trading-loss text-trading-loss">
                      HALTED
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-trading-text/60">
                  {execution.data.mode === "LIVE"
                    ? "Orders from strategies are sent to the exchange."
                    : "Orders are simulated. Live trading requires TRADING_MODE=live plus the LIVE_TRADING_CONFIRM phrase on the server."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </ApiState>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-trading-text/60">{label}</p>
      <p className="truncate font-mono text-trading-text">{value}</p>
    </div>
  );
}

export default LiveBrokerPanel;
