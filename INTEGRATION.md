# Backend integration

This dashboard talks to the Go trading backend
([Go-project](https://github.com/Bhavik2205/Go-project), module
`github.com/Bhavik2205/ML-Bot`), branch `feature/strategy-engine`.

## Ports

| Service | Port |
| --- | --- |
| Go API | `8080` (`configs/app.yaml` → `server.http_port`) |
| Vite dev server | `5173` |

Both used to be on 8080, which meant they could not run at the same time. The
dev server now uses 5173 and proxies `/api` and `/ws` to the backend, so the
browser stays same-origin and the Go server needs no CORS configuration.

## Running the two together

```bash
# terminal 1 — backend
cd Go-project
go run ./cmd/server

# terminal 2 — frontend
cd signal-execution-desk
npm install
npm run dev          # http://localhost:5173
```

Point the proxy somewhere else with `VITE_BACKEND_ORIGIN`:

```bash
VITE_BACKEND_ORIGIN=http://192.168.1.50:8080 npm run dev
```

For a production build served from a different origin, set the API base URL
at build time instead:

```bash
VITE_API_BASE_URL=https://api.example.com npm run build
```

## Authentication

All trading endpoints sit behind auth middleware. `src/lib/api.ts` attaches
`Authorization: Bearer <token>` from `localStorage` and exposes `login()` /
`logout()`.

Create a user with the seeder (`cd Go-project && go run ./cmd/seed`) and sign
in as `demo1@example.com` / `Password123!`.

If you see **"Not authorised"** in a panel, the token is missing or expired —
log in again.

## Endpoints consumed

| Hook | Endpoint | Poll |
| --- | --- | --- |
| `useStrategies` | `GET /api/v1/strategies` | 5s |
| `usePositions` | `GET /api/v1/positions` | 2s |
| `usePnL` | `GET /api/v1/pnl` | 2s |
| `useOrders` | `GET /api/v1/orders?limit=` | 5s |
| `useTrades` | `GET /api/v1/trades?limit=` | 5s |
| `useExecutionStatus` | `GET /api/v1/execution/status` | 2s |
| `useInstruments` | `GET /api/v1/market/instruments` | on demand |
| `useCandles` | `GET /api/v1/market/candles` | 15s |
| `useKillSwitch` | `POST /api/v1/execution/kill` | — |
| `useResumeTrading` | `POST /api/v1/execution/resume` | — |

Positions and execution state poll fastest because they drive decisions;
candles only change when a bar finalises, so polling them as often would be
wasted work.

## Response shape

Every successful response is wrapped:

```json
{ "data": { ... }, "meta": { "requestId": "...", "serverTime": "...", "version": "v1" } }
```

and errors are:

```json
{ "error": { "code": "SERVICE_UNAVAILABLE", "message": "..." }, "meta": { ... } }
```

`apiGet`/`apiPost` unwrap `data` for you and convert failures into `ApiError`,
which carries the backend `code` so the UI can branch on it.

## The three non-success states

`<ApiState>` distinguishes them deliberately:

1. **Loading** — spinner.
2. **Disabled (503)** — the strategy engine is off in config. This is a normal
   configuration state, not a failure; showing it as an error sends people
   hunting for a bug that is not there.
3. **Error** — network unreachable, unauthorised, or a real server error, with
   a retry button.

Enable the engine in the backend's `configs/strategy.yaml`:

```yaml
engine:
  enabled: true
```

## Kill switch

**Execution → Halt trading** stops all order placement immediately. It does
**not** close open positions — you exit those yourself.

Resuming clears the daily order and notional counters, so it is a deliberate
action behind a confirmation dialog. The dialog warns explicitly when the
account is in `LIVE` mode.

## Paper vs live

The backend defaults to paper trading. Live requires **two** environment
switches, and the second is a phrase rather than a boolean so a copied `.env`
cannot start trading real money:

```bash
TRADING_MODE=live
LIVE_TRADING_CONFIRM=I_UNDERSTAND_THIS_PLACES_REAL_ORDERS
```

The header badge in the Execution panel shows `PAPER` or
`LIVE — REAL MONEY` accordingly.

## Still on mock data

These panels were not part of this integration and still render static data:
`MarketOverview`, `MLModelsPanel`, `SentimentPanel`, `BrokerIntegration`,
`MarketData`, `Settings`. The original `PositionsPanel` and `StrategyPanel`
are kept as mock references; the dashboard routes to `LivePositionsPanel` and
`LiveStrategyPanel` instead.

`DashboardHeader` still hardcodes `http://localhost:8000` for its quote lookup
and websocket, which does not match the backend's port 8080 — it needs the
same treatment.
