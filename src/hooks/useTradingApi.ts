import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import type {
  CandlesResponse,
  ExecutionStatus,
  Instrument,
  Order,
  PaperStats,
  PositionsResponse,
  StrategiesResponse,
  Trade,
} from "@/lib/api-types";

/**
 * Poll intervals.
 *
 * Positions and execution state drive trading decisions, so they refresh
 * fastest. Candles only change when a bar finalises, so polling them at the
 * same rate would be wasted work.
 */
export const POLL = {
  fast: 2_000,
  normal: 5_000,
  slow: 15_000,
} as const;

export const queryKeys = {
  strategies: ["strategies"] as const,
  positions: ["positions"] as const,
  pnl: ["pnl"] as const,
  orders: (limit: number) => ["orders", limit] as const,
  trades: (limit: number) => ["trades", limit] as const,
  execution: ["execution", "status"] as const,
  instruments: ["instruments"] as const,
  candles: (token?: number, interval?: string, limit?: number) =>
    ["candles", token, interval, limit] as const,
};

export function useStrategies() {
  return useQuery({
    queryKey: queryKeys.strategies,
    queryFn: () => apiGet<StrategiesResponse>("/strategies"),
    refetchInterval: POLL.normal,
  });
}

export function usePositions(includeFlat = false) {
  return useQuery({
    queryKey: [...queryKeys.positions, includeFlat],
    queryFn: () =>
      apiGet<PositionsResponse>("/positions", includeFlat ? { include_flat: "true" } : undefined),
    refetchInterval: POLL.fast,
  });
}

export function usePnL() {
  return useQuery({
    queryKey: queryKeys.pnl,
    queryFn: () => apiGet<PaperStats>("/pnl"),
    refetchInterval: POLL.fast,
  });
}

export function useOrders(limit = 50) {
  return useQuery({
    queryKey: queryKeys.orders(limit),
    queryFn: () => apiGet<Order[]>("/orders", { limit }),
    refetchInterval: POLL.normal,
  });
}

export function useTrades(limit = 50) {
  return useQuery({
    queryKey: queryKeys.trades(limit),
    queryFn: () => apiGet<Trade[]>("/trades", { limit }),
    refetchInterval: POLL.normal,
  });
}

export function useExecutionStatus() {
  return useQuery({
    queryKey: queryKeys.execution,
    queryFn: () => apiGet<ExecutionStatus>("/execution/status"),
    refetchInterval: POLL.fast,
  });
}

export function useInstruments(limit = 200) {
  return useQuery({
    queryKey: [...queryKeys.instruments, limit],
    queryFn: () => apiGet<Instrument[]>("/market/instruments", { limit }),
    // Instruments change about once a day; there is no point polling them.
    staleTime: 5 * 60_000,
  });
}

export function useCandles(instrumentToken?: number, interval = "1m", limit = 200) {
  return useQuery({
    queryKey: queryKeys.candles(instrumentToken, interval, limit),
    queryFn: () =>
      apiGet<CandlesResponse>("/market/candles", {
        instrument_token: instrumentToken,
        interval,
        limit,
      }),
    enabled: instrumentToken !== undefined,
    refetchInterval: POLL.slow,
  });
}

/**
 * Kill switch. Halts all order placement immediately.
 *
 * Invalidates execution and position queries on success so the UI reflects the
 * halt without waiting for the next poll.
 */
export function useKillSwitch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiPost<unknown>("/execution/kill"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.execution });
      qc.invalidateQueries({ queryKey: queryKeys.positions });
    },
  });
}

/** Re-arms order placement after a trip and clears the daily counters. */
export function useResumeTrading() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiPost<unknown>("/execution/resume"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.execution });
    },
  });
}
