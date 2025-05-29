
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const strategies = [
  { 
    id: 'rsi_strategy', 
    name: 'RSI Reversal', 
    description: 'RSI oversold/overbought reversal strategy',
    status: 'active',
    performance: '+12.5%',
    trades: 45,
    winRate: 68.9
  },
  { 
    id: 'macd_strategy', 
    name: 'MACD Crossover', 
    description: 'MACD signal line crossover strategy',
    status: 'active',
    performance: '+8.2%',
    trades: 32,
    winRate: 62.5
  },
  { 
    id: 'bollinger_strategy', 
    name: 'Bollinger Bands', 
    description: 'Bollinger band squeeze and breakout',
    status: 'inactive',
    performance: '-2.1%',
    trades: 18,
    winRate: 44.4
  },
];

export function StrategyPanel() {
  return (
    <Card className="trading-card">
      <CardHeader>
        <CardTitle className="text-trading-text">Active Strategies</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {strategies.map((strategy) => (
            <div key={strategy.id} className="p-4 bg-trading-bg rounded-lg border border-trading-bg-card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-trading-text">{strategy.name}</h3>
                  <p className="text-sm text-trading-text-muted">{strategy.description}</p>
                </div>
                <Switch 
                  checked={strategy.status === 'active'}
                  className="data-[state=checked]:bg-trading-profit"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-trading-text-muted">Performance</p>
                  <p className={`font-semibold ${
                    strategy.performance.startsWith('+') 
                      ? 'text-trading-profit' 
                      : 'text-trading-loss'
                  }`}>
                    {strategy.performance}
                  </p>
                </div>
                <div>
                  <p className="text-trading-text-muted">Trades</p>
                  <p className="font-semibold text-trading-text">{strategy.trades}</p>
                </div>
                <div>
                  <p className="text-trading-text-muted">Win Rate</p>
                  <p className="font-semibold text-trading-text">{strategy.winRate}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
