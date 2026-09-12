import React from "react";
import { Activity, Database, Radio, TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { useHealth, useMarketOverview, usePnL } from "@/hooks/useTradingApi";
import type { MarketOverviewItem } from "@/lib/api-types";
import { ApiState } from "./ApiState";

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);

const pnlClass = (n: number) => (n > 0 ? "profit-text" : n < 0 ? "loss-text" : "text-trading-text");

function depTone(status: string) {
  return status?.toLowerCase() === "ok" || status?.toLowerCase() === "up"
    ? "border-trading-profit text-trading-profit"
    : "border-trading-loss text-trading-loss";
}

export function LiveMarketOverview() {
  const overview = useMarketOverview();
  const health = useHealth();
  const pnl = usePnL();

  return (
    <div className="space-y-6">
      {/* System health first: if a dependency is down, every number below it
          is suspect and the operator should know that before reading them. */}
      <Card className="trading-card border-trading-bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-trading-text">
            <Activity className="h-5 w-5" />
            System
          </CardTitle>
          {health.data && (
            <Badge variant="outline" className="border-trading-info text-trading-info">
              {health.data.mode} · up {Math.floor(health.data.uptimeSeconds / 60)}m
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {health.isLoading ? (
            <p className="text-sm text-trading-text/60">Checking…</p>
          ) : health.error || !health.data ? (
            <p className="loss-text text-sm">Cannot reach the API.</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <Dep label="Postgres" status={health.data.dependencies.postgres?.status} icon={<Database className="h-4 w-4" />} />
              <Dep label="Redis" status={health.data.dependencies.redis?.status} icon={<Radio className="h-4 w-4" />} />
              <Dep label="Zerodha" status={health.data.dependencies.zerodha?.status} icon={<Activity className="h-4 w-4" />} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trading P&L, when the engine is on. */}
      {pnl.data && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Tile label="Realised P&L" value={inr(pnl.data.realized_pnl)} cls={pnlClass(pnl.data.realized_pnl)} />
          <Tile label="Unrealised P&L" value={inr(pnl.data.unrealized_pnl)} cls={pnlClass(pnl.data.unrealized_pnl)} />
          <Tile label="Net P&L" value={inr(pnl.data.net_pnl)} cls={pnlClass(pnl.data.net_pnl)} />
        </div>
      )}

      <ApiState
        isLoading={overview.isLoading}
        error={overview.error}
        onRetry={() => overview.refetch()}
        disabledTitle="Market overview is unavailable"
      >
        {overview.data && (
          <div className="space-y-6">
            {overview.data.breadth && (
              <Card className="trading-card border-trading-bg-card">
                <CardHeader>
                  <CardTitle className="text-trading-text">Market breadth</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  <Tile label="Advancing" value={String(overview.data.breadth.advancers)} cls="profit-text" />
                  <Tile label="Declining" value={String(overview.data.breadth.decliners)} cls="loss-text" />
                  <Tile label="Unchanged" value={String(overview.data.breadth.unchanged)} cls="text-trading-text" />
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              <MoverList title="Top gainers" items={overview.data.topGainers} up />
              <MoverList title="Top losers" items={overview.data.topLosers} up={false} />
            </div>

            {overview.data.indices?.length > 0 && (
              <MoverList title="Indices" items={overview.data.indices} up />
            )}

            {overview.data.mostActiveByVolume?.length > 0 && (
              <MoverList title="Most active by volume" items={overview.data.mostActiveByVolume} up />
            )}
          </div>
        )}
      </ApiState>
    </div>
  );
}

function MoverList({
  title,
  items,
  up,
}: {
  title: string;
  items: MarketOverviewItem[];
  up: boolean;
}) {
  return (
    <Card className="trading-card border-trading-bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-trading-text">
          {up ? (
            <TrendingUp className="h-5 w-5 text-trading-profit" />
          ) : (
            <TrendingDown className="h-5 w-5 text-trading-loss" />
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!items || items.length === 0 ? (
          <p className="py-6 text-center text-sm text-trading-text/50">
            No data yet — the feed may not be running.
          </p>
        ) : (
          <div className="space-y-2">
            {items.slice(0, 8).map((it) => (
              <div
                key={it.symbol}
                className="flex items-center justify-between rounded-md border border-trading-bg-card px-3 py-2"
              >
                <span className="font-medium text-trading-text">{it.symbol}</span>
                <div className="text-right">
                  <p className="font-mono text-sm text-trading-text">{it.lastPrice.toFixed(2)}</p>
                  <p className={`font-mono text-xs ${pnlClass(it.percentChange)}`}>
                    {it.percentChange > 0 ? "+" : ""}
                    {it.percentChange.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Dep({ label, status, icon }: { label: string; status?: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-trading-text/50">{icon}</div>
      <div className="min-w-0">
        <p className="truncate text-xs text-trading-text/60">{label}</p>
        <Badge variant="outline" className={depTone(status ?? "")}>
          {status ?? "unknown"}
        </Badge>
      </div>
    </div>
  );
}

function Tile({ label, value, cls }: { label: string; value: string; cls: string }) {
  return (
    <Card className="trading-card border-trading-bg-card">
      <CardContent className="p-4">
        <p className="truncate text-xs text-trading-text/60">{label}</p>
        <p className={`font-mono text-lg ${cls}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

export default LiveMarketOverview;
