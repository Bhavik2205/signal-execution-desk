import React, { useMemo, useState } from "react";
import { FlaskConical, Loader2, Play, TrendingDown, TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useInstruments, useRunBacktest, useStrategies } from "@/hooks/useTradingApi";
import { ApiError } from "@/lib/api";
import type { BacktestResult } from "@/lib/api-types";

const INTERVALS = ["1m", "5m", "15m", "1h"];

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const pnlClass = (n: number) => (n > 0 ? "profit-text" : n < 0 ? "loss-text" : "text-trading-text");

/** Default window: the last 30 days, formatted for <input type="date">. */
function defaultDates() {
  const to = new Date();
  const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { from: iso(from), to: iso(to) };
}

export function BacktestPanel() {
  const dates = useMemo(defaultDates, []);
  const strategies = useStrategies();
  const instruments = useInstruments(500);
  const run = useRunBacktest();

  const [strategyName, setStrategyName] = useState("");
  const [instrumentToken, setInstrumentToken] = useState("");
  const [interval, setInterval] = useState("5m");
  const [from, setFrom] = useState(dates.from);
  const [to, setTo] = useState(dates.to);
  const [capital, setCapital] = useState("1000000");
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const canRun = strategyName !== "" && instrumentToken !== "" && !run.isPending;

  const onRun = async () => {
    setErrMsg(null);
    setResult(null);
    try {
      const res = await run.mutateAsync({
        strategy_name: strategyName,
        instruments: [Number(instrumentToken)],
        interval,
        // Send the whole day: a date-only "to" would otherwise cut the
        // final session off at midnight.
        from: new Date(`${from}T00:00:00`).toISOString(),
        to: new Date(`${to}T23:59:59`).toISOString(),
        initial_capital: Number(capital) || 1_000_000,
      });
      setResult(res);
    } catch (e) {
      setErrMsg(e instanceof ApiError ? e.message : "Unexpected error");
    }
  };

  const chartData = useMemo(
    () =>
      (result?.equity_curve ?? []).map((p) => ({
        t: new Date(p.timestamp).getTime(),
        equity: p.equity,
      })),
    [result],
  );

  return (
    <div className="space-y-6">
      <Card className="trading-card border-trading-bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-trading-text">
            <FlaskConical className="h-5 w-5" />
            Run a backtest
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Strategy</Label>
              <Select value={strategyName} onValueChange={setStrategyName}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a strategy" />
                </SelectTrigger>
                <SelectContent>
                  {(strategies.data?.registered ?? []).map((s) => (
                    <SelectItem key={s.name} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Instrument</Label>
              <Select value={instrumentToken} onValueChange={setInstrumentToken}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an instrument" />
                </SelectTrigger>
                <SelectContent>
                  {(instruments.data ?? []).map((i) => (
                    <SelectItem key={i.instrument_token} value={String(i.instrument_token)}>
                      {i.trading_symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Interval</Label>
              <Select value={interval} onValueChange={setInterval}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTERVALS.map((iv) => (
                    <SelectItem key={iv} value={iv}>
                      {iv}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bt-from">From</Label>
              <Input id="bt-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bt-to">To</Label>
              <Input id="bt-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bt-capital">Initial capital</Label>
              <Input
                id="bt-capital"
                type="number"
                value={capital}
                onChange={(e) => setCapital(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={onRun} disabled={!canRun}>
              {run.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              {run.isPending ? "Replaying…" : "Run backtest"}
            </Button>
            {instruments.data?.length === 0 && (
              <p className="text-xs text-trading-text/60">
                No instruments found — run the seeder or ingest market data first.
              </p>
            )}
          </div>

          {errMsg && (
            <div className="rounded-md border border-trading-loss/40 bg-trading-loss/10 p-3 text-sm">
              <p className="loss-text">Backtest failed</p>
              <p className="text-trading-text/70">{errMsg}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Tile
              label="Net P&L"
              value={inr(result.net_pnl)}
              cls={pnlClass(result.net_pnl)}
              icon={
                result.net_pnl >= 0 ? (
                  <TrendingUp className="h-5 w-5" />
                ) : (
                  <TrendingDown className="h-5 w-5" />
                )
              }
            />
            <Tile
              label="Return"
              value={`${result.return_pct.toFixed(2)}%`}
              cls={pnlClass(result.return_pct)}
            />
            <Tile
              label="Max drawdown"
              value={`${result.max_drawdown_pct.toFixed(2)}%`}
              cls={result.max_drawdown_pct > 0 ? "loss-text" : "text-trading-text"}
            />
            <Tile
              label="Win rate"
              value={`${result.win_rate_pct.toFixed(1)}%`}
              cls="text-trading-text"
            />
          </div>

          <Card className="trading-card border-trading-bg-card">
            <CardHeader>
              <CardTitle className="text-trading-text">Equity curve</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis
                      dataKey="t"
                      type="number"
                      domain={["dataMin", "dataMax"]}
                      tickFormatter={(v) => new Date(v).toLocaleDateString()}
                      fontSize={11}
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                      fontSize={11}
                    />
                    <Tooltip
                      labelFormatter={(v) => new Date(Number(v)).toLocaleString()}
                      formatter={(v: number) => [inr(v), "Equity"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="equity"
                      dot={false}
                      strokeWidth={2}
                      stroke="currentColor"
                      className={result.net_pnl >= 0 ? "text-trading-profit" : "text-trading-loss"}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="trading-card border-trading-bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-trading-text">Run detail</CardTitle>
              <Badge variant="outline" className="border-trading-info text-trading-info">
                {result.candles_replayed.toLocaleString()} candles in {result.duration_ms}ms
              </Badge>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <Detail label="Final equity" value={inr(result.final_equity)} />
              <Detail label="Realised" value={inr(result.realized_pnl)} />
              <Detail label="Unrealised" value={inr(result.unrealized_pnl)} />
              <Detail label="Fees" value={inr(result.fees_paid)} />
              <Detail label="Fills" value={result.total_trades} />
              <Detail label="Round trips" value={result.round_trips} />
              <Detail label="Wins / losses" value={`${result.wins} / ${result.losses}`} />
              <Detail label="Sharpe" value={result.sharpe.toFixed(2)} />
            </CardContent>
          </Card>

          <Card className="trading-card border-trading-bg-card">
            <CardHeader>
              <CardTitle className="text-trading-text">
                Trades ({result.trades.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.trades.length === 0 ? (
                <p className="py-8 text-center text-sm text-trading-text/50">
                  The strategy produced no trades over this window.
                </p>
              ) : (
                <div className="max-h-96 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Side</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.trades.map((t, i) => (
                        <TableRow key={`${t.timestamp}-${i}`}>
                          <TableCell className="font-mono text-xs">
                            {new Date(t.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>{t.symbol || t.instrument_token}</TableCell>
                          <TableCell className="text-xs">{t.action}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                t.side === "LONG"
                                  ? "border-trading-profit text-trading-profit"
                                  : "border-trading-loss text-trading-loss"
                              }
                            >
                              {t.side}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-trading-text/60">
                            {t.reason}
                          </TableCell>
                          <TableCell className="text-right font-mono">{t.quantity}</TableCell>
                          <TableCell className="text-right font-mono">
                            {t.price.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-xs text-trading-text/50">
            Fills cross the spread and pay fees, and results assume every signalled quantity is
            filled at the bar price. Real execution will differ; treat this as a filter for bad
            strategies, not a forecast.
          </p>
        </>
      )}
    </div>
  );
}

function Tile({
  label,
  value,
  cls,
  icon,
}: {
  label: string;
  value: string;
  cls: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card className="trading-card border-trading-bg-card">
      <CardContent className="flex items-center gap-3 p-4">
        {icon && <div className="text-trading-text/50">{icon}</div>}
        <div className="min-w-0">
          <p className="truncate text-xs text-trading-text/60">{label}</p>
          <p className={`font-mono text-lg ${cls}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-trading-text/60">{label}</p>
      <p className="font-mono text-trading-text">{value}</p>
    </div>
  );
}

export default BacktestPanel;
