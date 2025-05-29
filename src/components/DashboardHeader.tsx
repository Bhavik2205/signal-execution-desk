
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PauseCircle, PlayCircle } from 'lucide-react';

interface MarketSymbolData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export function DashboardHeader() {
  const [connectionStatus, setConnectionStatus] = React.useState<'connected' | 'disconnected' | 'connecting'>('connected');
  const [tradingMode, setTradingMode] = React.useState<'live' | 'paper'>('paper');
  // State to hold the current date and time, which will be updated every second
  const [currentTime, setCurrentTime] = React.useState(new Date());
  // --- New State for Portfolio Value ---
  const [portfolioValue, setPortfolioValue] = React.useState(1234567.89); // Initial portfolio value
  const [livePrices, setLivePrices] = React.useState<MarketSymbolData[]>([
    { symbol: 'NIFTY 50 (NSE)', price: 22500.50, change: 123.45, changePercent: 0.55 },
    { symbol: 'NIFTY BANK (NSE)', price: 48000.75, change: -75.20, changePercent: -0.16 },
    { symbol: 'RELIANCE (NSE)', price: 2950.20, change: 15.30, changePercent: 0.52 },
    { symbol: 'TCS (NSE)', price: 3900.10, change: -20.50, changePercent: -0.52 },
  ]);

  const wsRef = useRef<WebSocket | null>(null);

  // useEffect hook to update the time every second
  React.useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date()); // Update the state with the new current time
    }, 1000); // Update every 1000 milliseconds (1 second)

    return () => clearInterval(timerId);
  }, []); // Empty dependency array means this effect runs only once after the initial render

  // Establish WebSocket connection
  React.useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;
  
    const connect = () => {
      ws = new WebSocket('ws://localhost:8000/ws');
      wsRef.current = ws;
  
      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setConnectionStatus('connected');
      };
  
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received symbol data:', data);
      
          setLivePrices((prevPrices) =>
            prevPrices.map((item) => {
              if (item.symbol === data.symbol) {
                const lastPrice = data.tick.LastPrice;
                const netChange = data.tick.NetChange;
                // Calculate changePercent = (NetChange / (LastPrice - NetChange)) * 100
                const changePercent = lastPrice && netChange ? (netChange / (lastPrice - netChange)) * 100 : 0;
      
                console.log(`Updating ${item.symbol} with price ${lastPrice}`);
      
                return {
                  ...item,
                  price: lastPrice,
                  change: netChange,
                  changePercent: changePercent,
                };
              }
              return item;
            })
          );
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
  
      ws.onclose = (event) => {
        console.log(`❌ WebSocket disconnected. Reconnecting in 3s...`, event.reason);
        setConnectionStatus('disconnected');
        reconnectTimeout = setTimeout(() => {
          connect();
        }, 3000);
      };
  
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        // The socket will close after an error, so no need to explicitly reconnect here.
      };
    };
  
    connect(); // initiate the first connection
  
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
          </div>
        </div>
      </header>

      <div className="bg-trading-bg-card border-t border-trading-bg-card-border py-2 px-8 flex items-center justify-start flex-wrap text-trading-text-muted text-sm">
        {livePrices.map((data) => (
          <div key={data.symbol} className="flex items-center mr-6 mb-1">
            <span className="font-semibold text-trading-text">{data.symbol}:</span>
            <span className="ml-2">₹{data.price.toLocaleString('en-IN')}</span>
            <span
              className={`ml-2 font-medium ${
                data.change >= 0 ? 'text-trading-profit' : 'text-trading-loss'
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
