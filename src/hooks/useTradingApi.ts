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

// ---------------------------------------------------------------------------
// Market, health, sentiment, models, backtest, watchlist
// ---------------------------------------------------------------------------

import type {
  BacktestRequest,
  BacktestResult,
  BrokerStatus,
  Health,
  MarketOverview,
  ModelsResponse,
  Quote,
  SentimentResponse,
  Watchlist,
} from "@/lib/api-types";

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => apiGet<Health>("/health"),
    refetchInterval: POLL.normal,
  });
}

export function useMarketOverview() {
  return useQuery({
    queryKey: ["market", "overview"],
    queryFn: () => apiGet<MarketOverview>("/market/overview"),
    refetchInterval: POLL.fast,
  });
}

export function useQuotes(symbols: string[]) {
  return useQuery({
    queryKey: ["quotes", symbols.join(",")],
    queryFn: () => apiGet<Quote[]>("/quotes", { symbols: symbols.join(",") }),
    enabled: symbols.length > 0,
    refetchInterval: POLL.fast,
  });
}

export function useBrokerStatus() {
  return useQuery({
    queryKey: ["broker", "status"],
    queryFn: () => apiGet<BrokerStatus>("/brokers/zerodha/status"),
    refetchInterval: POLL.slow,
  });
}

export function useSentiment(hours = 24, limit = 50) {
  return useQuery({
    queryKey: ["sentiment", hours, limit],
    queryFn: () => apiGet<SentimentResponse>("/sentiment", { hours, limit }),
    refetchInterval: 60_000,
  });
}

export function useModels() {
  return useQuery({
    queryKey: ["models"],
    queryFn: () => apiGet<ModelsResponse>("/models"),
    refetchInterval: 60_000,
  });
}

/**
 * Runs a backtest. Deliberately a mutation rather than a query: it is an
 * explicit, expensive action, not something to fire on render or refetch.
 */
export function useRunBacktest() {
  return useMutation({
    mutationFn: (req: BacktestRequest) => apiPost<BacktestResult>("/backtest/run", req),
  });
}

export function useWatchlist() {
  return useQuery({
    queryKey: ["watchlist"],
    queryFn: () => apiGet<Watchlist>("/watchlists/default"),
    refetchInterval: POLL.slow,
  });
}

export function useAddToWatchlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (item: { instrument_token: number; symbol: string }) =>
      apiPost<unknown>("/watchlists/default/items", item),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist"] }),
  });
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

import type {
  ChannelType,
  NotificationChannel,
  NotificationHistoryItem,
} from "@/lib/api-types";
import { apiDelete, apiPut } from "@/lib/api";

export function useNotificationChannels() {
  return useQuery({
    queryKey: ["notifications", "channels"],
    queryFn: () => apiGet<NotificationChannel[]>("/notifications/channels"),
    refetchInterval: POLL.slow,
  });
}

export function useNotificationHistory(limit = 50) {
  return useQuery({
    queryKey: ["notifications", "history", limit],
    queryFn: () => apiGet<NotificationHistoryItem[]>("/notifications/history", { limit }),
    refetchInterval: POLL.normal,
  });
}

export function useSaveNotificationChannel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { channel_type: ChannelType; is_enabled: boolean; config: Record<string, string> }) =>
      apiPut<NotificationChannel>("/notifications/channels", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useDeleteNotificationChannel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (channelType: ChannelType) =>
      apiDelete<unknown>("/notifications/channels", { channel_type: channelType }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useTestNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (channelType: ChannelType) =>
      apiPost<{ queued: boolean; note: string }>(`/notifications/test?channel_type=${channelType}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications", "history"] }),
  });
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

import { getSettingsSection, putSettingsSection } from "@/lib/api";

/** Known settings sections, matching what the backend accepts. */
export const SETTINGS_SECTIONS = [
  "general",
  "zerodha",
  "strategy",
  "data",
  "notifications",
  "performance",
] as const;

export type SettingsSectionName = (typeof SETTINGS_SECTIONS)[number];

export function useSettings(section: SettingsSectionName) {
  return useQuery({
    queryKey: ["settings", section],
    queryFn: () => getSettingsSection(section),
    // Settings change only when someone edits them; polling would be waste.
    staleTime: 30_000,
  });
}

export function useSaveSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { section: SettingsSectionName; data: Record<string, unknown> }) =>
      putSettingsSection(args.section, args.data),
    onSuccess: (_res, args) => {
      qc.invalidateQueries({ queryKey: ["settings", args.section] });
    },
  });
}
