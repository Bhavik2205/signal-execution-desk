
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trending-up, trending-down } from "lucide-react";

const marketData = [
  { symbol: 'NIFTY 50', price: 19485.25, change: +125.80, changePercent: +0.65 },
  { symbol: 'SENSEX', price: 65953.48, change: +398.22, changePercent: +0.61 },
  { symbol: 'BANKNIFTY', price: 44125.15, change: -85.30, changePercent: -0.19 },
  { symbol: 'RELIANCE', price: 2456.75, change: +15.25, changePercent: +0.62 },
];

const watchlistStocks = [
  { symbol: 'TCS', price: 3542.80, change: +12.45, volume: '1.2M' },
  { symbol: 'INFY', price: 1456.20, change: -8.90, volume: '2.1M' },
  { symbol: 'HDFC', price: 2789.45, change: +22.15, volume: '965K' },
  { symbol: 'ICICIBANK', price: 945.30, change: +5.75, volume: '3.2M' },
];

export function MarketOverview() {
  return (
    <div className="space-y-6">
      {/* Market Indices */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketData.map((item) => (
          <Card key={item.symbol} className="trading-card border-trading-bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-trading-text">{item.symbol}</h3>
                {item.change > 0 ? (
                  <trending-up className="w-4 h-4 text-trading-profit" />
                ) : (
                  <trending-down className="w-4 h-4 text-trading-loss" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-trading-text">
                  ₹{item.price.toLocaleString()}
                </p>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${
                    item.change > 0 ? 'text-trading-profit' : 'text-trading-loss'
                  }`}>
                    {item.change > 0 ? '+' : ''}₹{item.change.toFixed(2)}
                  </span>
                  <Badge 
                    variant="outline"
                    className={`text-xs ${
                      item.change > 0 
                        ? 'border-trading-profit text-trading-profit' 
                        : 'border-trading-loss text-trading-loss'
                    }`}
                  >
                    {item.change > 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Chart Area */}
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="text-trading-text">Live Market Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-trading-bg rounded-lg flex items-center justify-center border border-trading-bg-card">
            <div className="text-center">
              <chart-line className="w-12 h-12 text-trading-text-muted mx-auto mb-2" />
              <p className="text-trading-text-muted">Interactive Chart Component</p>
              <p className="text-sm text-trading-text-muted">Real-time data visualization will be implemented here</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Watchlist */}
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="text-trading-text">Watchlist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {watchlistStocks.map((stock) => (
              <div key={stock.symbol} className="flex items-center justify-between p-3 bg-trading-bg rounded-lg border border-trading-bg-card hover:border-trading-info transition-colors">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="font-semibold text-trading-text">{stock.symbol}</p>
                    <p className="text-sm text-trading-text-muted">Vol: {stock.volume}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-trading-text">₹{stock.price}</p>
                  <p className={`text-sm ${
                    stock.change > 0 ? 'text-trading-profit' : 'text-trading-loss'
                  }`}>
                    {stock.change > 0 ? '+' : ''}₹{stock.change.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
