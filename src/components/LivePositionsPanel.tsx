import React from "react";
import { ArrowRightLeft, PackageOpen, Receipt, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { usePositions, useOrders, useTrades } from "@/hooks/useTradingApi";
import type { Position } from "@/lib/api-types";
import { ApiState } from "./ApiState";

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);

const pnlClass = (n: number) => (n > 0 ? "profit-text" : n < 0 ? "loss-text" : "text-trading-text");

/** Unrealised PnL for an open position, marked to its last traded price. */
function unrealized(p: Position): number {
  if (p.Quantity === 0 || !p.LastPrice) return 0;
  return (p.LastPrice - p.AveragePrice) * p.Quantity;
}

const sideLabel = (qty: number) => (qty > 0 ? "LONG" : qty < 0 ? "SHORT" : "FLAT");

export function LivePositionsPanel() {
  const positions = usePositions();
  const orders = useOrders(50);
  const trades = useTrades(50);

  return (
    <ApiState
      isLoading={positions.isLoading}
      error={positions.error}
      onRetry={() => positions.refetch()}
      disabledTitle="Paper trading is not enabled"
      disabledHint="Set engine.enabled: true in configs/strategy.yaml and restart the server."
    >
      {positions.data && (
        <div className="space-y-6">
          {/* Summary tiles */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryTile
              icon={<Wallet className="h-5 w-5" />}
              label="Realised P&L"
              value={inr(positions.data.realized_pnl)}
              valueClass={pnlClass(positions.data.realized_pnl)}
            />
            <SummaryTile
              icon={<ArrowRightLeft className="h-5 w-5" />}
              label="Unrealised P&L"
              value={inr(positions.data.unrealized_pnl)}
              valueClass={pnlClass(positions.data.unrealized_pnl)}
            />
            <SummaryTile
              icon={<Receipt className="h-5 w-5" />}
              label="Fees paid"
              value={inr(positions.data.fees_paid)}
              valueClass="text-trading-text"
            />
            <SummaryTile
              icon={<PackageOpen className="h-5 w-5" />}
              label="Net P&L"
              /* Net is realised + unrealised minus fees, so it is the only
                 number that reflects what the account actually made. */
              value={inr(positions.data.net_pnl)}
              valueClass={pnlClass(positions.data.net_pnl)}
            />
          </div>

          <Tabs defaultValue="positions">
            <TabsList>
              <TabsTrigger value="positions">
                Positions ({positions.data.positions.length})
              </TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="trades">Trades</TabsTrigger>
            </TabsList>

            <TabsContent value="positions">
              <Card className="trading-card border-trading-bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-trading-text">Open positions</CardTitle>
                  <Badge variant="outline" className="border-trading-info text-trading-info">
                    {positions.data.mode}
                  </Badge>
                </CardHeader>
                <CardContent>
                  {positions.data.positions.length === 0 ? (
                    <Empty message="No open positions." />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Symbol</TableHead>
                          <TableHead>Side</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Avg</TableHead>
                          <TableHead className="text-right">LTP</TableHead>
                          <TableHead className="text-right">Unrealised</TableHead>
                          <TableHead className="text-right">Realised</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {positions.data.positions.map((p) => {
                          const u = unrealized(p);
                          return (
                            <TableRow key={p.InstrumentToken}>
                              <TableCell className="font-medium">
                                {p.Symbol || p.InstrumentToken}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    p.Quantity > 0
                                      ? "border-trading-profit text-trading-profit"
                                      : "border-trading-loss text-trading-loss"
                                  }
                                >
                                  {sideLabel(p.Quantity)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {Math.abs(p.Quantity)}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {inr(p.AveragePrice)}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {p.LastPrice ? inr(p.LastPrice) : "—"}
                              </TableCell>
                              <TableCell className={`text-right font-mono ${pnlClass(u)}`}>
                                {inr(u)}
                              </TableCell>
                              <TableCell
                                className={`text-right font-mono ${pnlClass(p.RealizedPnL)}`}
                              >
                                {inr(p.RealizedPnL)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card className="trading-card border-trading-bg-card">
                <CardHeader>
                  <CardTitle className="text-trading-text">Recent orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {!orders.data || orders.data.length === 0 ? (
                    <Empty message="No orders yet." />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>Strategy</TableHead>
                          <TableHead>Side</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Mode</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.data.map((o) => (
                          <TableRow key={o.id}>
                            <TableCell className="font-mono text-xs">
                              {new Date(o.placed_at).toLocaleTimeString()}
                            </TableCell>
                            <TableCell>{o.strategy_name}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  o.transaction_type === "BUY"
                                    ? "border-trading-profit text-trading-profit"
                                    : "border-trading-loss text-trading-loss"
                                }
                              >
                                {o.transaction_type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono">{o.quantity}</TableCell>
                            <TableCell className="text-right font-mono">{inr(o.price)}</TableCell>
                            <TableCell className="text-xs">{o.status}</TableCell>
                            <TableCell className="text-xs">{o.trade_type}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trades">
              <Card className="trading-card border-trading-bg-card">
                <CardHeader>
                  <CardTitle className="text-trading-text">Recent trades</CardTitle>
                </CardHeader>
                <CardContent>
                  {!trades.data || trades.data.length === 0 ? (
                    <Empty message="No trades yet." />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>Trade ID</TableHead>
                          <TableHead>Side</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead>Mode</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trades.data.map((t) => (
                          <TableRow key={t.id}>
                            <TableCell className="font-mono text-xs">
                              {new Date(t.trade_time).toLocaleTimeString()}
                            </TableCell>
                            <TableCell className="font-mono text-xs">{t.trade_id}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  t.transaction_type === "BUY"
                                    ? "border-trading-profit text-trading-profit"
                                    : "border-trading-loss text-trading-loss"
                                }
                              >
                                {t.transaction_type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono">{t.quantity}</TableCell>
                            <TableCell className="text-right font-mono">{inr(t.price)}</TableCell>
                            <TableCell className="text-xs">{t.trade_type}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </ApiState>
  );
}

function SummaryTile({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass: string;
}) {
  return (
    <Card className="trading-card border-trading-bg-card">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="text-trading-text/50">{icon}</div>
        <div className="min-w-0">
          <p className="truncate text-xs text-trading-text/60">{label}</p>
          <p className={`font-mono text-lg ${valueClass}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Empty({ message }: { message: string }) {
  return <p className="py-8 text-center text-sm text-trading-text/50">{message}</p>;
}

export default LivePositionsPanel;
