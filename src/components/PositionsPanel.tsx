
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const positions = [
  { 
    symbol: 'TCS', 
    qty: 50, 
    avgPrice: 3520.25, 
    ltp: 3542.80, 
    pnl: 1127.50, 
    pnlPercent: 0.64 
  },
  { 
    symbol: 'RELIANCE', 
    qty: 25, 
    avgPrice: 2470.00, 
    ltp: 2456.75, 
    pnl: -331.25, 
    pnlPercent: -0.54 
  },
  { 
    symbol: 'HDFC', 
    qty: 30, 
    avgPrice: 2750.80, 
    ltp: 2789.45, 
    pnl: 1159.50, 
    pnlPercent: 1.40 
  },
];

export function PositionsPanel() {
  const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0);

  return (
    <Card className="trading-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-trading-text">Positions</CardTitle>
        <Badge 
          variant="outline"
          className={`${
            totalPnL >= 0 
              ? 'border-trading-profit text-trading-profit' 
              : 'border-trading-loss text-trading-loss'
          }`}
        >
          Total P&L: {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toFixed(2)}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {positions.map((position) => (
            <div key={position.symbol} className="p-3 bg-trading-bg rounded-lg border border-trading-bg-card">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold text-trading-text">{position.symbol}</p>
                  <p className="text-sm text-trading-text-muted">Qty: {position.qty}</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    position.pnl >= 0 ? 'text-trading-profit' : 'text-trading-loss'
                  }`}>
                    {position.pnl >= 0 ? '+' : ''}₹{position.pnl.toFixed(2)}
                  </p>
                  <p className={`text-sm ${
                    position.pnl >= 0 ? 'text-trading-profit' : 'text-trading-loss'
                  }`}>
                    {position.pnl >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                  </p>
                </div>
              </div>
              <div className="flex justify-between text-sm text-trading-text-muted">
                <span>Avg: ₹{position.avgPrice.toFixed(2)}</span>
                <span>LTP: ₹{position.ltp.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
