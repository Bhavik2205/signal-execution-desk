
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function DashboardHeader() {
  const [connectionStatus, setConnectionStatus] = React.useState<'connected' | 'disconnected' | 'connecting'>('connected');
  const [tradingMode, setTradingMode] = React.useState<'live' | 'paper'>('paper');

  return (
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
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge 
            variant={connectionStatus === 'connected' ? 'default' : 'destructive'}
            className={`${
              connectionStatus === 'connected' 
                ? 'bg-trading-profit text-white' 
                : 'bg-trading-loss text-white'
            }`}
          >
            <div className={`w-2 h-2 rounded-full mr-2 ${
              connectionStatus === 'connected' ? 'bg-white animate-pulse-green' : 'bg-white'
            }`} />
            {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
          </Badge>
          
          <Badge 
            variant="outline"
            className={`${
              tradingMode === 'live' 
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
        </div>
      </div>
    </header>
  );
}
