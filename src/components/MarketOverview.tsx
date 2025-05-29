import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, CheckCircle, XCircle, Bot, HeartPulse, HardDrive, CircleDot, ChartLine } from "lucide-react";
import { SystemHealthPanel } from './ui/systemHealthPanel';
import { PositionsPanel } from './PositionsPanel';
import { OrdersPanel } from './OrdersPanel';

interface MetricData {
  symbol: string;
  value: number | string;
  type: 'currency' | 'percentage' | 'count' | 'status' | 'health';
  change?: number;
  changePercent?: number;
  status?: 'active' | 'inactive' | 'good' | 'warning' | 'critical';
}

const dashboardMetrics: MetricData[] = [
  { symbol: 'Total P&L', value: 19485.25, type: 'currency', change: +125.80, changePercent: +0.65 },
  { symbol: `Today's P&L`, value: 6595.48, type: 'currency', change: +398.22, changePercent: +0.61 },
  { symbol: 'Success Rate', value: 78.5, type: 'percentage', change: +1.2, changePercent: +1.55 },
  { symbol: 'Open Positions', value: 7, type: 'count' },
  { symbol: 'Bot Status', value: 'Running', type: 'status', status: 'active' },
  { symbol: 'System Health', value: 'Optimal', type: 'health', status: 'good' },
];

export function MarketOverview() {
  const [metrics, setMetrics] = React.useState<MetricData[]>(dashboardMetrics);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev =>
        prev.map(metric => {
          if (metric.type === 'currency' && typeof metric.value === 'number') {
            const fluctuation = (Math.random() - 0.5) * 50;
            const newPrice = parseFloat((metric.value + fluctuation).toFixed(2));
            const newChange = parseFloat((newPrice - metric.value).toFixed(2));
            const newChangePercent = parseFloat(((newChange / metric.value) * 100).toFixed(2));
            return { ...metric, value: newPrice, change: newChange, changePercent: newChangePercent };
          }
          if (metric.symbol === 'Success Rate' && typeof metric.value === 'number') {
            const fluctuation = (Math.random() - 0.5) * 0.5;
            const newValue = Math.min(100, Math.max(0, parseFloat((metric.value + fluctuation).toFixed(2))));
            const newChange = parseFloat((newValue - metric.value).toFixed(2));
            const newChangePercent = parseFloat(((newChange / metric.value) * 100).toFixed(2));
            return { ...metric, value: newValue, change: newChange, changePercent: newChangePercent };
          }
          if (metric.symbol === 'Bot Status' && Math.random() < 0.1) {
            return {
              ...metric,
              value: metric.value === 'Running' ? 'Stopped' : 'Running',
              status: metric.status === 'active' ? 'inactive' : 'active'
            };
          }
          if (metric.symbol === 'System Health' && Math.random() < 0.05) {
            const healthStates = ['Optimal', 'Warning', 'Critical'];
            const statusStates: MetricData['status'][] = ['good', 'warning', 'critical'];
            const i = Math.floor(Math.random() * 3);
            return { ...metric, value: healthStates[i], status: statusStates[i] };
          }
          return metric;
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getIconForMetric = (metric: MetricData) => {
    if (metric.type === 'currency' || metric.type === 'percentage') {
      return metric.change && metric.change > 0
        ? <TrendingUp className="w-5 h-5 text-trading-profit" />
        : <TrendingDown className="w-5 h-5 text-trading-loss" />;
    }
    if (metric.type === 'status') {
      return metric.status === 'active'
        ? <CheckCircle className="w-5 h-5 text-trading-profit" />
        : <XCircle className="w-5 h-5 text-trading-loss" />;
    }
    if (metric.type === 'health') {
      if (metric.status === 'good') return <HeartPulse className="w-5 h-5 text-trading-profit" />;
      if (metric.status === 'warning') return <CircleDot className="w-5 h-5 text-trading-info" />;
      return <XCircle className="w-5 h-5 text-trading-loss" />;
    }
    if (metric.symbol === 'Open Positions') return <Bot className="w-5 h-5 text-trading-text-muted" />;
    return <ChartLine className="w-5 h-5 text-trading-text-muted" />;
  };

  const getTextColorForMetric = (metric: MetricData) => {
    if (metric.type === 'currency' || metric.type === 'percentage') {
      return metric.change && metric.change > 0 ? 'text-trading-profit' : 'text-trading-loss';
    }
    if (metric.type === 'status') return metric.status === 'active' ? 'text-trading-profit' : 'text-trading-loss';
    if (metric.type === 'health') {
      if (metric.status === 'good') return 'text-trading-profit';
      if (metric.status === 'warning') return 'text-trading-info';
      return 'text-trading-loss';
    }
    return 'text-trading-text';
  };

  const formatMetricValue = (metric: MetricData) => {
    if (typeof metric.value === 'number') {
      if (metric.type === 'currency') return `₹${metric.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      if (metric.type === 'percentage') return `${metric.value.toFixed(2)}%`;
      if (metric.type === 'count') return metric.value.toLocaleString();
    }
    return metric.value;
  };

  const systemHealth = metrics.find(m => m.symbol === 'System Health');

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map(item => (
          <Card key={item.symbol} className="trading-card border-trading-bg-card">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-trading-text text-base">{item.symbol}</h3>
                {getIconForMetric(item)}
              </div>
              <div className="flex flex-col flex-grow justify-end">
                <p className={`text-2xl font-bold ${getTextColorForMetric(item)}`}>
                  {formatMetricValue(item)}
                </p>
                {(item.type === 'currency' || item.type === 'percentage') && item.change !== undefined && item.changePercent !== undefined && (
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-sm font-medium ${getTextColorForMetric(item)}`}>
                      {item.change > 0 ? '+' : ''}{item.change.toFixed(2)}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${item.change > 0
                        ? 'border-trading-profit text-trading-profit'
                        : 'border-trading-loss text-trading-loss'
                        }`}
                    >
                      {item.change > 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <SystemHealthPanel/>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PositionsPanel />
              <OrdersPanel />
            </div>
    </div>
  );
}
