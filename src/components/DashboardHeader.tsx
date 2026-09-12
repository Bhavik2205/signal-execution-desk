
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PauseCircle, PlayCircle } from 'lucide-react';
import axios from 'axios';
import { apiGet, websocketURL } from '@/lib/api';
import type { Quote } from '@/lib/api-types';

interface DashboardHeaderProps {
  brokerConnectionStatus: 'connected' | 'disconnected' | 'connecting';
  setBrokerConnectionStatus: React.Dispatch<React.SetStateAction<'connected' | 'disconnected' | 'connecting'>>;
  brokerConnectRef: React.MutableRefObject<() => void>;
}


interface MarketSymbolData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

const SYMBOL_MAP: Record<string, string> = {
  'NIFTY 50 (NSE)': 'NIFTY 50 (NSE)',
  'NIFTY BANK (NSE)': 'NIFTY BANK (NSE)',
  'RELIANCE (NSE)': 'RELIANCE (NSE)',
  'TCS (NSE)': 'TCS (NSE)',
};

const SYMBOL_MAP1: Record<string, string> = {
  'NIFTY 50 (NSE)': 'NIFTY 50',
  'NIFTY BANK (NSE)': 'NIFTY BANK',
  'RELIANCE (NSE)': 'RELIANCE',
  'TCS (NSE)': 'TCS',
};

export function DashboardHeader({ brokerConnectionStatus, setBrokerConnectionStatus, brokerConnectRef }: DashboardHeaderProps) {
  const [connectionStatus, setConnectionStatus] = React.useState<'connected' | 'disconnected' | 'connecting'>('connected');
  const [tradingMode, setTradingMode] = React.useState<'live' | 'paper'>('paper');
  const [username, setUsername] = React.useState<string | null>('Demo');
  // State to hold the current date and time, which will be updated every second
  const [currentTime, setCurrentTime] = React.useState(new Date());
  // --- New State for Portfolio Value ---
  const [portfolioValue, setPortfolioValue] = React.useState(1234567.89); // Initial portfolio value
  const [livePrices, setLivePrices] = React.useState<MarketSymbolData[]>([
    { symbol: 'NIFTY 50 (NSE)', price: 0, change: 0, changePercent: 0 },
    { symbol: 'NIFTY BANK (NSE)', price: 0, change: 0, changePercent: 0 },
    { symbol: 'RELIANCE (NSE)', price: 0, change: 0, changePercent: 0 },
    { symbol: 'TCS (NSE)', price: 0, change: 0, changePercent: 0 },
  ]);

  const wsRef = useRef<WebSocket | null>(null);

  const isMarketOpen = () => {
    const now = new Date();
    const istNow = new Date(
      now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
    );
    const hours = istNow.getHours();
    const minutes = istNow.getMinutes();
    const day = istNow.getDay();

    if (day === 0 || day === 6) return false;
    const totalMinutes = hours * 60 + minutes;
    return totalMinutes >= 555 && totalMinutes <= 930;
  };

  // Fetch fallback data using the REST API.
  //
  // Uses the shared API client rather than a hardcoded origin: requests go to
  // /api/v1/... on the dev server, which proxies them to the Go backend on
  // 8080. The old http://localhost:8000/api/instrument endpoint does not
  // exist on this backend.
  const fetchLatestTick = async (symbolDisplay: string) => {
    const symbolApi = SYMBOL_MAP1[symbolDisplay];
    try {
      const quotes = await apiGet<Quote[]>('/quotes', { symbols: `NSE:${symbolApi}` });
      const info = quotes?.[0];
      if (!info) throw new Error('Symbol data not found in response');

      setLivePrices(prev =>
        prev.map(p =>
          p.symbol === symbolDisplay
            ? {
                ...p,
                price: info.lastPrice,
                change: info.netChange,
                changePercent: info.percentChange,
              }
            : p
        )
      );
    } catch (err) {
      console.error(`Error fetching quote for ${symbolDisplay}:`, err);
    }
  };

  // Fetch all symbols initially or when fallback is needed
  const fetchAllPricesFallback = async () => {
    await Promise.all(
      Object.keys(SYMBOL_MAP).map(symbol => fetchLatestTick(symbol))
    );
  };

  // useEffect hook to update the time every second
  React.useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date()); // Update the state with the new current time
    }, 1000); // Update every 1000 milliseconds (1 second)

    return () => clearInterval(timerId);
  }, []); // Empty dependency array means this effect runs only once after the initial render

  const connectRef = React.useRef<() => void>(() => { });
  // Establish WebSocket connection
  React.useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      // Same-origin so the Vite proxy (and any reverse proxy in production)
      // forwards it, and so the scheme follows the page: wss:// under HTTPS.
      ws = new WebSocket(websocketURL());
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setConnectionStatus('connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const lastPrice = data.tick.LastPrice;
          const netChange = data.tick.NetChange;
          const changePercent = (netChange / (lastPrice - netChange)) * 100;

          console.log('Received symbol data:', data);

          setLivePrices(prev =>
            prev.map(p =>
              SYMBOL_MAP[p.symbol] === data.symbol
                ? { ...p, price: lastPrice, change: netChange, changePercent }
                : p
            )
          );
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log(`❌ WebSocket disconnected. Reconnecting in 3s...`, event.reason);
        setConnectionStatus('disconnected');

        if (!isMarketOpen()) {
          console.log("🔕 Market closed - Using fallback prices");
          fetchAllPricesFallback();
        }

        reconnectTimeout = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        // The socket will close after an error, so no need to explicitly reconnect here.
      };
    };
    // expose connect to outside
    connectRef.current = connect;

    connect(); // initiate the first connection
    fetchAllPricesFallback(); // fetch on start

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, []);

  // Format the time using the currentTime state
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false // Set to false for 24-hour format
  });

  // --- New Handler for Connection Button ---
  const toggleConnection = () => {
    setConnectionStatus(prevStatus =>
      prevStatus === 'connected' ? 'disconnected' : 'connected'
    );
    if (connectionStatus === 'connected') {
      wsRef.current?.close();
    } else {
      connectRef.current?.();
    }
  };

  return (
    <>
      <header className="bg-trading-bg-light border-b border-trading-bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-2xl font-bold text-trading-text">Trading Dashboard</h2>
              <p className="text-sm text-trading-text-muted">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                {`  ${formattedTime}`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span
              className={`
    inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
    ${brokerConnectionStatus === 'connected'
                  ? 'bg-green-100 text-green-700'
                  : brokerConnectionStatus === 'connecting'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'}
  `}
            >
              <span
                className={`
      w-2 h-2 rounded-full
      ${brokerConnectionStatus === 'connected'
                    ? 'bg-green-500'
                    : brokerConnectionStatus === 'connecting'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'}
    `}
              />
              {brokerConnectionStatus === 'connected'
                ? 'Broker Connected'
                : brokerConnectionStatus === 'connecting'
                  ? 'Connecting...'
                  : 'Broker Disconnected'}
            </span>

            {/* --- Portfolio Value Badge (Now Bigger!) --- */}
            <Badge
              variant="outline"
              className={`
              border-trading-text-muted
              font-bold text-sm py-2 px-4 rounded-md // Make it bigger: larger font, more padding, rounded corners
            `}
            >
              Portfolio: ₹{portfolioValue.toLocaleString('en-IN')}
            </Badge>
            <Badge
              variant="outline"
              className={`${tradingMode === 'live'
                ? 'border-trading-loss text-trading-loss'
                : 'border-trading-info text-trading-info'
                }`}
            >
              {tradingMode === 'live' ? 'LIVE TRADING' : 'PAPER TRADING'}
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setTradingMode(tradingMode === 'live' ? 'paper' : 'live')}
              className="border-trading-bg-card text-trading-text hover:bg-trading-bg-card"
            >
              Switch to {tradingMode === 'live' ? 'Paper' : 'Live'}
            </Button>
            <Button
              variant={connectionStatus === 'connected' ? 'destructive' : 'default'} // Red for stop, default for start
              size="sm"
              onClick={toggleConnection}
              className={`
    ${connectionStatus === 'connected'
                  ? 'bg-trading-loss hover:bg-red-700 text-white' // Stop button color
                  : 'bg-trading-profit hover:bg-green-700 text-white' // Start button color
                }
    flex items-center
  `}
            >
              {connectionStatus === 'connected' ? (
                <>
                  {/* Moved the icon here, alongside the text */}
                  <PauseCircle className="h-4 w-4" />
                  <span>Stop Bot</span>
                </>
              ) : (
                <>
                  {/* Moved the icon here, alongside the text */}
                  <PlayCircle className="h-4 w-4" />
                  <span>Start Bot</span>
                </>
              )}
            </Button>
            {username && (
              <Badge variant="outline" className="border-trading-text-muted font-bold text-sm py-2 px-4 rounded-md">
                {username}
              </Badge>
            )}
          </div>
        </div>
      </header>

      <div className="bg-trading-bg-card border-t border-trading-bg-card-border py-2 px-8 flex items-center justify-start flex-wrap text-trading-text-muted text-sm">
        {livePrices.map((data) => (
          <div key={data.symbol} className="flex items-center mr-6 mb-1">
            <span className="font-semibold text-trading-text">{data.symbol}:</span>
            <span className="ml-2">₹{data.price.toLocaleString('en-IN')}</span>
            <span
              className={`ml-2 font-medium ${data.change >= 0 ? 'text-trading-profit' : 'text-trading-loss'
                }`}
            >
              ({data.change >= 0 ? '+' : ''}
              {data.change.toFixed(2)} / {data.changePercent >= 0 ? '+' : ''}
              {data.changePercent.toFixed(2)}%)
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
