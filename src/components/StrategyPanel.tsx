import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { DollarSign, BarChart2, Activity, Zap, HardDrive, Cpu } from 'lucide-react'; // Added more icons for metrics

// --- MOCK DATA (Embedded directly) ---
const mockStrategies = [
  {
    id: 'deep_reinforcement_learning',
    name: 'Deep RL Hedger',
    description: 'Adapts to market regimes using Q-learning for optimal hedging and risk management.',
    status: 'active',
    performance: 0.125, // Using decimal for easier calculation
    trades: 875,
    winRate: 0.72, // Decimal for win rate
    capitalAllocated: 500000.00, // INR
    dailyPnl: 1500.75, // INR
    lastActivity: '2025-05-31 22:45:30 IST',
    riskLevel: 'High',
    latency: '25ms',
    modelVersion: 'DRL_v2.1'
  },
  {
    id: 'ensemble_tree_classifier',
    name: 'Ensemble Trend Follower',
    description: 'Combines multiple tree-based models for robust trend identification and signal generation.',
    status: 'active',
    performance: 0.082,
    trades: 621,
    winRate: 0.68,
    capitalAllocated: 300000.00,
    dailyPnl: 650.20,
    lastActivity: '2025-05-31 22:46:15 IST',
    riskLevel: 'Medium',
    latency: '40ms',
    modelVersion: 'Ensemble_v1.5'
  },
  {
    id: 'lstm_volatility_predictor',
    name: 'LSTM Volatility Scalper',
    description: 'Predicts short-term volatility bursts using LSTM networks for quick scalping opportunities.',
    status: 'inactive',
    performance: -0.021,
    trades: 310,
    winRate: 0.48,
    capitalAllocated: 200000.00,
    dailyPnl: -200.50,
    lastActivity: '2025-05-30 23:15:00 IST',
    riskLevel: 'Low',
    latency: '60ms',
    modelVersion: 'LSTM_v3.0'
  },
  {
    id: 'bayesian_sentiment_analyzer',
    name: 'Bayesian News Trader',
    description: 'Analyzes real-time news sentiment with Bayesian inference for event-driven trading signals.',
    status: 'active',
    performance: 0.057,
    trades: 155,
    winRate: 0.75,
    capitalAllocated: 150000.00,
    dailyPnl: 300.90,
    lastActivity: '2025-05-31 22:40:00 IST',
    riskLevel: 'Medium',
    latency: '80ms',
    modelVersion: 'Bayes_v1.0'
  },
];

const mockSystemMetrics = {
  cpuUsage: '45%',
  memoryUsage: '68%',
  diskUsage: '75%',
  networkLatency: '35ms',
  apiCallsPerMin: '1200',
  lastHealthCheck: '2025-05-31 22:47:00 IST'
};
// --- END MOCK DATA ---

export function StrategyPanel() {
  const [strategies, setStrategies] = useState(mockStrategies);

  const handleToggleStrategy = (id) => {
    setStrategies(prevStrategies =>
      prevStrategies.map(s =>
        s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s
      )
    );
  };

  const getPnlColorClass = (pnl) => {
    if (pnl > 0) return "text-green-500";
    if (pnl < 0) return "text-red-500";
    return "text-gray-400";
  };

  const totalPerformance = useMemo(() => {
    return strategies.reduce((sum, s) => sum + (s.status === 'active' ? s.performance : 0), 0);
  }, [strategies]);

  const totalDailyPnl = useMemo(() => {
    return strategies.reduce((sum, s) => sum + (s.status === 'active' ? s.dailyPnl : 0), 0);
  }, [strategies]);

  const activeStrategiesCount = useMemo(() => {
    return strategies.filter(s => s.status === 'active').length;
  }, [strategies]);

  return (
    <div className="p-4 sm:p-6 bg-black text-gray-100 min-h-screen"> {/* Removed font-mono here */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gray-900 border border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Bot P&L</CardTitle>
            <BarChart2 className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPnlColorClass(totalPerformance)}`}>
              {totalPerformance >= 0 ? "+" : ""}{(totalPerformance * 100).toFixed(2)}%
            </div>
            <p className="text-xs text-gray-500">
              Across all active strategies
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Daily P&L</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPnlColorClass(totalDailyPnl)}`}>
              {totalDailyPnl >= 0 ? "+" : ""}{totalDailyPnl.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
            </div>
            <p className="text-xs text-gray-500">
              For today ({new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })})
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Active Strategies</CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-100">{activeStrategiesCount} / {strategies.length}</div>
            <p className="text-xs text-gray-500">
              Currently deployed algorithms
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">System Health</CardTitle>
            <Cpu className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-100">Optimal</div>
            <p className="text-xs text-gray-500">
              Last check: {mockSystemMetrics.lastHealthCheck.split(' ')[1]}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {strategies.map((strategy) => (
          <Card key={strategy.id} className="bg-gray-900 border border-gray-700 hover:border-blue-500 transition-colors duration-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-indigo-300 flex items-center gap-2">
                    {strategy.name}
                    <Badge variant="outline" className={`ml-2 text-xs border ${
                      strategy.status === 'active'
                        ? 'bg-green-700 text-white border-green-800'
                        : 'bg-red-700 text-white border-red-800'
                    }`}>
                      {strategy.status.toUpperCase()}
                    </Badge>
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">{strategy.description}</p>
                </div>
                <div className="flex flex-col items-end">
                  <Switch
                    checked={strategy.status === 'active'}
                    onCheckedChange={() => handleToggleStrategy(strategy.id)}
                    className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-600"
                  />
                  <span className="text-xs text-gray-500 mt-1">Toggle Status</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-y-3 gap-x-4 text-sm mt-4 border-t border-gray-800 pt-4">
                <div>
                  <p className="text-gray-500">Total P&L</p>
                  <p className={`font-bold ${getPnlColorClass(strategy.performance)}`}>
                    {strategy.performance >= 0 ? "+" : ""}{(strategy.performance * 100).toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Trades Executed</p>
                  <p className="font-bold text-gray-200">{strategy.trades}</p>
                </div>
                <div>
                  <p className="text-gray-500">Win Rate</p>
                  <p className="font-bold text-gray-200">{(strategy.winRate * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-gray-500">Capital Allocated</p>
                  <p className="font-bold text-blue-400">
                    ₹{strategy.capitalAllocated.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Daily P&L</p>
                  <p className={`font-bold ${getPnlColorClass(strategy.dailyPnl)}`}>
                    {strategy.dailyPnl >= 0 ? "+" : ""}{strategy.dailyPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Last Activity</p>
                  <p className="font-bold text-gray-300 text-xs">{strategy.lastActivity}</p>
                </div>
                <div className="col-span-2 sm:col-span-3 lg:col-span-2">
                  <p className="text-gray-500">Risk Level</p>
                  <Badge variant="outline" className={`font-bold text-xs ${
                    strategy.riskLevel === 'High' ? 'bg-red-700 text-white border-red-800' :
                    strategy.riskLevel === 'Medium' ? 'bg-yellow-700 text-white border-yellow-800' :
                    'bg-green-700 text-white border-green-800'
                  }`}>
                    {strategy.riskLevel.toUpperCase()}
                  </Badge>
                </div>
                 <div>
                  <p className="text-gray-500">Latency</p>
                  <p className="font-bold text-cyan-400">{strategy.latency}</p>
                </div>
                <div>
                  <p className="text-gray-500">Model Version</p>
                  <p className="font-bold text-gray-300">{strategy.modelVersion}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-gray-600 py-6 mt-8">
        ML Trading Bot Interface | Data sourced from live backend (mock data shown).
      </div>
    </div>
  );
}