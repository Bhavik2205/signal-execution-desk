import React, { useEffect, useMemo, useState } from "react";
import { CandlestickChart, Star } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

import {
  useAddToWatchlist,
  useCandles,
  useInstruments,
  useWatchlist,
} from "@/hooks/useTradingApi";
import { ApiState } from "./ApiState";

const INTERVALS = ["1m", "5m", "15m", "1h"];

export function LiveMarketData() {
  const instruments = useInstruments(500);
  const watchlist = useWatchlist();
  const addToWatchlist = useAddToWatchlist();
  const { toast } = useToast();

  const [token, setToken] = useState<number | undefined>(undefined);
  const [interval, setInterval] = useState("5m");

  // Default to the first instrument once the list arrives, so the chart is
  // never an empty frame waiting on a selection.
  useEffect(() => {
    if (token === undefined && instruments.data && instruments.data.length > 0) {
      setToken(instruments.data[0].instrument_token);
    }
  }, [instruments.data, token]);

  const candles = useCandles(token, interval, 300);

  const selected = useMemo(
    () => instruments.data?.find((i) => i.instrument_token === token),
    [instruments.data, token],
  );

  const chartData = useMemo(
    () =>
      (candles.data?.candles ?? []).map((c) => ({
        t: new Date(c.timestamp).getTime(),
        close: c.close,
        high: c.high,
        low: c.low,
        volume: c.volume,
      })),
    [candles.data],
  );

  const inWatchlist = useMemo(
    () => watchlist.data?.items?.some((i) => i.instrument_token === token) ?? false,
    [watchlist.data, token],
  );

  const onAdd = async () => {
    if (!selected) return;
    try {
      await addToWatchlist.mutateAsync({
        instrument_token: selected.instrument_token,
        symbol: selected.trading_symbol,
      });
      toast({ title: "Added to watchlist", description: selected.trading_symbol });
    } catch {
      toast({ title: "Could not add to watchlist", variant: "destructive" });
    }
  };

  const last = chartData.at(-1);
  const first = chartData.at(0);
  const changePct = first && last && first.close !== 0
    ? ((last.close - first.close) / first.close) * 100
    : 0;

  return (
    <div className="space-y-6">
      <Card className="trading-card border-trading-bg-card">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <CardTitle className="flex items-center gap-2 text-trading-text">
            <CandlestickChart className="h-5 w-5" />
            {selected?.trading_symbol ?? "Market data"}
            {last && (
              <span className="ml-2 font-mono text-base">
                {last.close.toFixed(2)}
                <span className={changePct >= 0 ? "profit-text ml-2" : "loss-text ml-2"}>
                  {changePct >= 0 ? "+" : ""}
                  {changePct.toFixed(2)}%
                </span>
              </span>
            )}
          </CardTitle>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={token !== undefined ? String(token) : ""}
              onValueChange={(v) => setToken(Number(v))}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Instrument" />
              </SelectTrigger>
              <SelectContent>
                {(instruments.data ?? []).map((i) => (
                  <SelectItem key={i.instrument_token} value={String(i.instrument_token)}>
                    {i.trading_symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={interval} onValueChange={setInterval}>
              <SelectTrigger className="w-24">
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

            <Button
              variant="outline"
              size="sm"
              onClick={onAdd}
              disabled={!selected || inWatchlist || addToWatchlist.isPending}
            >
              <Star className={`mr-2 h-4 w-4 ${inWatchlist ? "fill-current" : ""}`} />
              {inWatchlist ? "In watchlist" : "Watch"}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <ApiState
            isLoading={candles.isLoading}
            error={candles.error}
            onRetry={() => candles.refetch()}
            disabledTitle="Candle data is unavailable"
          >
            {chartData.length === 0 ? (
              <p className="py-12 text-center text-sm text-trading-text/50">
                No candles for this instrument and interval. Run the seeder or start the market
                data feed.
              </p>
            ) : (
              <>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="currentColor" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="currentColor" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis
                        dataKey="t"
                        type="number"
                        domain={["dataMin", "dataMax"]}
                        tickFormatter={(v) => new Date(v).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        fontSize={11}
                      />
                      <YAxis domain={["auto", "auto"]} fontSize={11} />
                      <Tooltip
                        labelFormatter={(v) => new Date(Number(v)).toLocaleString()}
                        formatter={(v: number) => [v.toFixed(2), "Close"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="close"
                        strokeWidth={2}
                        stroke="currentColor"
                        fill="url(#priceFill)"
                        className={changePct >= 0 ? "text-trading-profit" : "text-trading-loss"}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 h-28 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="t" hide />
                      <YAxis hide />
                      <Tooltip
                        labelFormatter={(v) => new Date(Number(v)).toLocaleString()}
                        formatter={(v: number) => [v.toLocaleString(), "Volume"]}
                      />
                      <Bar dataKey="volume" className="fill-trading-info" opacity={0.6} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <p className="mt-2 text-xs text-trading-text/50">
                  {candles.data?.count} candles · {interval}
                </p>
              </>
            )}
          </ApiState>
        </CardContent>
      </Card>

      <Card className="trading-card border-trading-bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-trading-text">
            <Star className="h-5 w-5" />
            Watchlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!watchlist.data || watchlist.data.items.length === 0 ? (
            <p className="py-6 text-center text-sm text-trading-text/50">
              Watchlist is empty. Use the Watch button above to add an instrument.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {watchlist.data.items.map((i) => (
                <Badge
                  key={i.id}
                  variant="outline"
                  className="cursor-pointer border-trading-info text-trading-info"
                  onClick={() => setToken(i.instrument_token)}
                >
                  {i.symbol}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default LiveMarketData;
