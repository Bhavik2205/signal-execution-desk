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
