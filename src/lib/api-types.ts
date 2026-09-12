// Types mirroring the Go API DTOs. Field names match the JSON tags exactly;
// where the backend uses snake_case, so does this file, so that a response can
// be used without a translation layer.

export interface Meta {
  requestId: string;
  serverTime: string;
  version: string;
}

/** Every successful response from the Go API is wrapped in this envelope. */
export interface SuccessResponse<T> {
  data: T;
  meta: Meta;
}

export interface ApiErrorBody {
  error: { code: string; message: string; details?: unknown };
  meta: Meta;
}

// --- Strategies -----------------------------------------------------------

export interface RiskStats {
  trades_today: number;
  open_positions: number;
  realized_pnl: number;
}

export interface EngineStats {
  evaluated: number;
  signals: number;
  orders: number;
  rejects: number;
  /** Non-zero means a strategy panicked. Surface this loudly. */
  panics: number;
  slots: number;
  risk: RiskStats;
}

export interface StrategyInfo {
  name: string;
  registered: boolean;
}

export interface StrategiesResponse {
  registered: StrategyInfo[];
  engine?: EngineStats;
  enabled: boolean;
  mode: string;
}

// --- Positions and PnL ----------------------------------------------------

export interface Position {
  InstrumentToken: number;
  Symbol: string;
  Quantity: number;
  AveragePrice: number;
  LastPrice: number;
  RealizedPnL: number;
  UpdatedAt: string;
}

export interface PositionsResponse {
  mode: string;
  positions: Position[];
  realized_pnl: number;
  unrealized_pnl: number;
  fees_paid: number;
  net_pnl: number;
}

export interface PaperStats {
  mode: string;
  fills: number;
  fees_paid: number;
  realized_pnl: number;
  unrealized_pnl: number;
  net_pnl: number;
  open_positions: Position[];
}

// --- Orders and trades ----------------------------------------------------

export interface Order {
  id: number;
  broker_order_id: string;
  instrument_token: number;
  strategy_name: string;
  transaction_type: "BUY" | "SELL";
  order_type: string;
  quantity: number;
  price: number;
  filled_quantity: number;
  filled_price: number;
  status: string;
  product: string;
  trade_type: "PAPER" | "LIVE";
  placed_at: string;
}

export interface Trade {
  id: number;
  order_id: number;
  trade_id: string;
  instrument_token: number;
  transaction_type: "BUY" | "SELL";
  quantity: number;
  price: number;
  trade_type: "PAPER" | "LIVE";
  trade_time: string;
}

// --- Execution ------------------------------------------------------------

export interface GuardStats {
  tripped: boolean;
  reason?: string;
  tripped_at?: string;
  orders_today: number;
  notional_today: number;
  placed: number;
  refused: number;
  max_orders_per_day: number;
  max_notional_per_day: number;
  max_notional_per_order: number;
}

export interface ExecutorStats {
  mode: string;
  placed: number;
  failed: number;
}

export interface SinkStats {
  written: number;
  dropped: number;
  failed: number;
  queued: number;
}

export interface ExecutionStatus {
  mode: string;
  enabled: boolean;
  guard?: GuardStats;
  executor?: ExecutorStats;
  persistence?: SinkStats;
  paper?: PaperStats;
}

// --- Market data ----------------------------------------------------------

export interface Candle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CandlesResponse {
  instrument_token: number;
  interval: string;
  count: number;
  candles: Candle[];
}

export interface Instrument {
  instrument_token: number;
  exchange: string;
  trading_symbol: string;
  name: string;
  instrument_type: string;
  tick_size: number;
  lot_size: number;
}

// --- Quotes and market overview ------------------------------------------

export interface QuoteOHLC {
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface Quote {
  symbol: string;
  instrumentToken: number;
  lastPrice: number;
  netChange: number;
  percentChange: number;
  volumeTraded: number;
  ohlc: QuoteOHLC;
  updatedAt: string;
}

export interface MarketOverviewItem {
  symbol: string;
  lastPrice: number;
  percentChange: number;
  volume: number;
  bid: number;
  ask: number;
  updatedAt: string;
}

export interface MarketBreadth {
  advancers: number;
  decliners: number;
  unchanged: number;
}

export interface MarketOverview {
  indices: MarketOverviewItem[];
  topGainers: MarketOverviewItem[];
  topLosers: MarketOverviewItem[];
  mostActiveByVolume: MarketOverviewItem[];
  breadth?: MarketBreadth;
  updatedAt?: string;
}

// --- Health and broker ----------------------------------------------------

export interface DependencyStatus {
  status: string;
  latencyMs?: number;
  message?: string;
}

export interface Health {
  status: string;
  service: string;
  version: string;
  uptimeSeconds: number;
  mode: string;
  dependencies: {
    postgres: DependencyStatus;
    redis: DependencyStatus;
    zerodha: DependencyStatus;
  };
}

export interface BrokerStatus {
  broker: string;
  connected: boolean;
  lastSyncedAt?: string;
  tradingEnabled: boolean;
  userId?: string;
  userName?: string;
  email?: string;
}

// --- Sentiment ------------------------------------------------------------

export interface SentimentArticle {
  id: number;
  source: string;
  title: string;
  description: string;
  url: string;
  image_url: string;
  published_at: string;
  sentiment_score: number;
  sentiment_label: string;
  analyzed: boolean;
}

export interface SentimentSummary {
  total: number;
  analyzed: number;
  positive: number;
  neutral: number;
  negative: number;
  avg_score: number;
  window_hours: number;
}

export interface SentimentResponse {
  summary: SentimentSummary;
  articles: SentimentArticle[];
}

// --- ML models ------------------------------------------------------------

export interface ModelFile {
  name: string;
  size_bytes: number;
  modified_at: string;
  present: boolean;
}

export interface ModelPipeline {
  total_articles: number;
  scored_articles: number;
  coverage_pct: number;
  last_analyzed_at?: string | null;
  last_article_at?: string | null;
}

export interface ModelsResponse {
  inference_available: boolean;
  inference_note: string;
  model_dir: string;
  files: ModelFile[];
  pipeline: ModelPipeline;
}

// --- Backtest -------------------------------------------------------------

export interface BacktestRequest {
  strategy_name: string;
  instruments: number[];
  interval: string;
  from: string;
  to: string;
  initial_capital: number;
  slippage_bps?: number;
  fee_bps?: number;
  params?: Record<string, number>;
}

export interface BacktestTrade {
  timestamp: string;
  instrument_token: number;
  symbol: string;
  action: string;
  side: string;
  reason: string;
  quantity: number;
  price: number;
}

export interface EquityPoint {
  timestamp: string;
  equity: number;
}

export interface BacktestResult {
  strategy_name: string;
  interval: string;
  from: string;
  to: string;
  initial_capital: number;
  final_equity: number;
  candles_replayed: number;
  total_trades: number;
  round_trips: number;
  wins: number;
  losses: number;
  realized_pnl: number;
  unrealized_pnl: number;
  fees_paid: number;
  net_pnl: number;
  return_pct: number;
  win_rate_pct: number;
  max_drawdown_pct: number;
  sharpe: number;
  trades: BacktestTrade[];
  equity_curve: EquityPoint[];
  duration_ms: number;
}

// --- Watchlist ------------------------------------------------------------

export interface WatchlistItem {
  id: number;
  instrument_token: number;
  symbol: string;
}

export interface Watchlist {
  id: number;
  name: string;
  items: WatchlistItem[];
}
