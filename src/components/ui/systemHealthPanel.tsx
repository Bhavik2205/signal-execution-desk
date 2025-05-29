import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Gauge,
  Cpu,
  Server,
  Network,
  Activity,
  Clock,
  HardDrive,
  AlertCircle,
  Database,
  Zap,
  Layers,
  Wifi,
  RefreshCw,
  TrendingUp,
  Sliders,
  LineChart as LineChartIcon, // Renamed to avoid conflict with Recharts LineChart
} from "lucide-react";

// Import Recharts components
import { LineChart, Line, ResponsiveContainer } from 'recharts';

// --- Sparkline Component ---
interface SparklineProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

const Sparkline: React.FC<SparklineProps> = ({ data, color, width = 60, height = 20 }) => {
  // Map data to an array of objects for Recharts, where each object has a 'value' key
  const chartData = data.map((d, index) => ({ id: index, value: d }));

  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
// --- End Sparkline Component ---

interface SystemMetric {
  label: string;
  value: number | string;
  unit?: string;
  status: "normal" | "warning" | "critical";
  icon: JSX.Element;
  description?: string;
  thresholds?: { warning: number; critical: number };
  history?: number[];
}

export function SystemHealthPanel() {
  const [metrics, setMetrics] = React.useState<SystemMetric[]>([]);

  React.useEffect(() => {
    const random = (min: number, max: number) =>
      +(Math.random() * (max - min) + min).toFixed(2);
    const status = (
      v: number,
      warning: number,
      critical: number
    ): "normal" | "warning" | "critical" =>
      v >= critical ? "critical" : v >= warning ? "warning" : "normal";

    const generateHistoricalData = (baseValue: number, fluctuation: number, length: number = 10) =>
      Array.from({ length }, (_, i) => {
        const change = (Math.random() - 0.5) * fluctuation;
        return parseFloat((baseValue + change).toFixed(2));
      });

    const generateMetrics = (): SystemMetric[] => {
      const apiLatency = random(20, 250);
      const memoryUsage = random(4, 16);
      const cpuLoad = random(10, 95);
      const diskIO = random(50, 800);
      const networkIO = random(20, 1000);
      const gcPause = random(0, 100);
      const threadCount = random(50, 200);
      const threadPoolQueue = random(0, 100);
      const tcpRetransmitRate = random(0, 5);
      const packetLoss = random(0, 3);
      const diskLatency = random(1, 10);
      const ordersPerSec = random(500, 5000);
      const orderRejectRate = random(0, 5);
      const slippage = random(0, 3);
      const fillRate = random(85, 100);
      const quoteToFillRatio = random(0, 3);
      const pAndLDrift = random(0, 5);
      const modelLatency = random(5, 50);

      return [
        // Latency & Performance Metrics
        {
          label: "API Latency",
          value: apiLatency,
          unit: "ms",
          status: status(apiLatency, 100, 200),
          icon: <Network className="w-4 h-4" />,
          description: "Time taken for API requests to be processed.",
          thresholds: { warning: 100, critical: 200 },
          history: generateHistoricalData(apiLatency, 50),
        },
        {
          label: "Market Data Feed Latency",
          value: random(1, 20),
          unit: "ms",
          status: status(random(1, 20), 10, 15),
          icon: <Activity className="w-4 h-4" />,
          description: "Delay in receiving real-time market data.",
          thresholds: { warning: 10, critical: 15 },
          history: generateHistoricalData(random(1,20), 5),
        },
        {
          label: "Signal Processing Time",
          value: random(1, 10),
          unit: "ms",
          status: status(random(1, 10), 7, 9),
          icon: <Zap className="w-4 h-4" />,
          description: "Time required to process trading signals.",
          thresholds: { warning: 7, critical: 9 },
          history: generateHistoricalData(random(1,10), 2),
        },
        {
          label: "Order Routing Latency",
          value: random(1, 25),
          unit: "ms",
          status: status(random(1, 25), 15, 20),
          icon: <Layers className="w-4 h-4" />,
          description: "Time taken to route orders to exchanges.",
          thresholds: { warning: 15, critical: 20 },
          history: generateHistoricalData(random(1,25), 5),
        },
        {
          label: "ML Inference Latency",
          value: modelLatency,
          unit: "ms",
          status: status(modelLatency, 30, 45),
          icon: <Sliders className="w-4 h-4" />,
          description: "Latency for machine learning model predictions.",
          thresholds: { warning: 30, critical: 45 },
          history: generateHistoricalData(modelLatency, 10),
        },

        // System Resource Metrics
        {
          label: "Memory Usage",
          value: memoryUsage,
          unit: "GB",
          status: status(memoryUsage, 12, 14),
          icon: <HardDrive className="w-4 h-4" />,
          description: "Current memory consumption of the system.",
          thresholds: { warning: 12, critical: 14 },
          history: generateHistoricalData(memoryUsage, 2),
        },
        {
          label: "CPU Load",
          value: cpuLoad,
          unit: "%",
          status: status(cpuLoad, 70, 90),
          icon: <Cpu className="w-4 h-4" />,
          description: "Percentage of CPU being utilized.",
          thresholds: { warning: 70, critical: 90 },
          history: generateHistoricalData(cpuLoad, 10),
        },
        {
          label: "Garbage Collection Pause",
          value: gcPause,
          unit: "ms",
          status: status(gcPause, 50, 75),
          icon: <RefreshCw className="w-4 h-4" />,
          description: "Time spent in garbage collection pauses.",
          thresholds: { warning: 50, critical: 75 },
          history: generateHistoricalData(gcPause, 15),
        },

        // Application & Threading Metrics
        {
          label: "Active Threads",
          value: threadCount,
          unit: "count",
          status: status(threadCount, 150, 180),
          icon: <Gauge className="w-4 h-4" />,
          description: "Number of active threads in the application.",
          thresholds: { warning: 150, critical: 180 },
          history: generateHistoricalData(threadCount, 20),
        },
        {
          label: "Thread Pool Queue Depth",
          value: threadPoolQueue,
          unit: "count",
          status: status(threadPoolQueue, 70, 90),
          icon: <Database className="w-4 h-4" />,
          description: "Number of tasks waiting in the thread pool queue.",
          thresholds: { warning: 70, critical: 90 },
          history: generateHistoricalData(threadPoolQueue, 10),
        },

        // Network Health Metrics
        {
          label: "TCP Retransmission Rate",
          value: tcpRetransmitRate,
          unit: "%",
          status: status(tcpRetransmitRate, 2, 4),
          icon: <Wifi className="w-4 h-4" />,
          description: "Percentage of TCP packets retransmitted.",
          thresholds: { warning: 2, critical: 4 },
          history: generateHistoricalData(tcpRetransmitRate, 1),
        },
        {
          label: "Packet Loss Rate",
          value: packetLoss,
          unit: "%",
          status: status(packetLoss, 1, 2),
          icon: <AlertCircle className="w-4 h-4" />,
          description: "Percentage of data packets lost during transmission.",
          thresholds: { warning: 1, critical: 2 },
          history: generateHistoricalData(packetLoss, 0.5),
        },

        // Storage & Disk Metrics
        {
          label: "Disk I/O",
          value: diskIO,
          unit: "MB/s",
          status: status(diskIO, 600, 750),
          icon: <Server className="w-4 h-4" />,
          description: "Read/write speed of the disk.",
          thresholds: { warning: 600, critical: 750 },
          history: generateHistoricalData(diskIO, 100),
        },
        {
          label: "Disk Latency",
          value: diskLatency,
          unit: "ms",
          status: status(diskLatency, 7, 9),
          icon: <HardDrive className="w-4 h-4" />,
          description: "Time taken for disk to respond to requests.",
          thresholds: { warning: 7, critical: 9 },
          history: generateHistoricalData(diskLatency, 2),
        },

        // Operational & Trading Metrics
        {
          label: "Uptime",
          value: `${Math.floor(random(1, 72))} hrs`,
          status: "normal",
          icon: <Clock className="w-4 h-4" />,
          description: "Total time the system has been continuously running.",
        },
        {
          label: "Orders Submitted / sec",
          value: ordersPerSec,
          unit: "orders/s",
          status: status(ordersPerSec, 4000, 4800),
          icon: <TrendingUp className="w-4 h-4" />,
          description: "Rate of new orders submitted per second.",
          thresholds: { warning: 4000, critical: 4800 },
          history: generateHistoricalData(ordersPerSec, 500),
        },
        {
          label: "Order Rejection Rate",
          value: orderRejectRate,
          unit: "%",
          status: status(orderRejectRate, 3, 4),
          icon: <AlertCircle className="w-4 h-4" />,
          description: "Percentage of submitted orders that are rejected.",
          thresholds: { warning: 3, critical: 4 },
          history: generateHistoricalData(orderRejectRate, 1),
        },
        {
          label: "Slippage",
          value: slippage,
          unit: "%",
          status: status(slippage, 1.5, 2.5),
          icon: <Sliders className="w-4 h-4" />,
          description: "Difference between expected and executed trade price.",
          thresholds: { warning: 1.5, critical: 2.5 },
          history: generateHistoricalData(slippage, 0.5),
        },
        {
          label: "Fill Rate",
          value: fillRate,
          unit: "%",
          status: status(100 - fillRate, 10, 15), // Inverted for fill rate warning
          icon: <Gauge className="w-4 h-4" />,
          description: "Percentage of orders that are successfully filled.",
          thresholds: { warning: 90, critical: 85 },
          history: generateHistoricalData(fillRate, 2),
        },
        {
          label: "Quote-to-Fill Ratio",
          value: quoteToFillRatio,
          unit: "ratio",
          status: status(quoteToFillRatio, 2, 3),
          icon: <Layers className="w-4 h-4" />,
          description: "Ratio of quotes provided to actual filled orders.",
          thresholds: { warning: 2, critical: 3 },
          history: generateHistoricalData(quoteToFillRatio, 0.5),
        },
        {
          label: "P&L Drift",
          value: pAndLDrift,
          unit: "%",
          status: status(pAndLDrift, 3, 4),
          icon: <TrendingUp className="w-4 h-4" />,
          description: "Deviation of actual Profit & Loss from expected.",
          thresholds: { warning: 3, critical: 4 },
          history: generateHistoricalData(pAndLDrift, 1),
        },
      ];
    };

    setMetrics(generateMetrics());

    const interval = setInterval(() => {
      setMetrics(generateMetrics());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: SystemMetric["status"]) => {
    switch (status) {
      case "critical":
        return "bg-red-500"; // Use Tailwind color directly
      case "warning":
        return "bg-yellow-500";
      case "normal":
      default:
        return "bg-green-500";
    }
  };

  const getProgressColorClass = (status: SystemMetric["status"]) => {
    switch (status) {
      case "critical":
        return "data-[state=complete]:bg-red-500";
      case "warning":
        return "data-[state=complete]:bg-yellow-500";
      case "normal":
      default:
        return "data-[state=complete]:bg-green-500";
    }
  };

  const getChartLineColor = (status: SystemMetric["status"]) => {
    switch (status) {
      case "critical":
        return "#EF4444"; // Red-500
      case "warning":
        return "#F59E0B"; // Yellow-500
      case "normal":
      default:
        return "#22C55E"; // Green-500
    }
  };


  // Helper to group metrics
  const groupMetrics = (metrics: SystemMetric[]) => {
    const grouped: { [key: string]: SystemMetric[] } = {
      "Latency & Performance": [],
      "System Resources": [],
      "Application & Threading": [],
      "Network Health": [],
      "Storage & Disk": [],
      "Operational & Trading": [],
    };

    metrics.forEach((metric) => {
      if (
        ["API Latency", "Market Data Feed Latency", "Signal Processing Time", "Order Routing Latency", "ML Inference Latency"].includes(metric.label)
      ) {
        grouped["Latency & Performance"].push(metric);
      } else if (
        ["Memory Usage", "CPU Load", "Garbage Collection Pause"].includes(metric.label)
      ) {
        grouped["System Resources"].push(metric);
      } else if (
        ["Active Threads", "Thread Pool Queue Depth"].includes(metric.label)
      ) {
        grouped["Application & Threading"].push(metric);
      } else if (
        ["TCP Retransmission Rate", "Packet Loss Rate"].includes(metric.label)
      ) {
        grouped["Network Health"].push(metric);
      } else if (["Disk I/O", "Disk Latency"].includes(metric.label)) {
        grouped["Storage & Disk"].push(metric);
      } else {
        grouped["Operational & Trading"].push(metric);
      }
    });

    return grouped;
  };

  const groupedMetrics = groupMetrics(metrics);

  return (
    <Card className="trading-card border-trading-bg-card mt-6 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-trading-text text-2xl font-bold flex items-center">
          <LineChartIcon className="w-6 h-6 mr-2 text-trading-info" /> System Performance Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedMetrics).map(([groupName, groupMetrics]) => (
          <div key={groupName} className="border rounded-lg p-4 bg-trading-bg-secondary shadow-sm">
            <h3 className="text-lg font-semibold text-trading-text-heading mb-4 border-b pb-2 border-trading-border-light">
              {groupName}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              {groupMetrics.map((metric) => (
                <div key={metric.label} className="flex flex-col space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-trading-text">
                      <span className="text-trading-info">{metric.icon}</span>
                      <span className="font-medium">{metric.label}</span>
                    </div>
                    <Badge className={`${getStatusColor(metric.status)} text-white`}> {/* Added text-white for better contrast */}
                      {metric.value} {metric.unit || ""}
                    </Badge>
                  </div>

                  {/* Render Progress Bar for Percentage Metrics with Sparkline */}
                  {typeof metric.value === "number" && metric.unit === "%" && (
                    <div className="flex items-center space-x-2 mt-1">
                      <Progress
                        value={metric.value as number}
                        className={`h-2 flex-grow ${getProgressColorClass(metric.status)}`}
                      />
                      <span className="text-xs text-trading-text-muted">
                        {metric.value.toFixed(1)}%
                      </span>
                      {metric.history && metric.history.length > 0 && (
                        <div className="w-16 h-6 ml-2"> {/* Removed border and flex props, Sparkline handles rendering */}
                          <Sparkline
                            data={metric.history}
                            color={getChartLineColor(metric.status)}
                            width={60}
                            height={20}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Render standalone Sparkline for non-percentage number metrics */}
                  {typeof metric.value === "number" && metric.unit !== "%" && metric.history && metric.history.length > 0 && (
                    <div className="flex items-center justify-between mt-1">
                      {metric.description && (
                        <p className="text-sm text-trading-text-muted leading-tight w-1/2">
                          {metric.description}
                        </p>
                      )}
                      <div className="w-24 h-8 ml-2">
                        <Sparkline
                          data={metric.history}
                          color={getChartLineColor(metric.status)}
                          width={96} // Tailwind w-24 is 96px
                          height={32} // Tailwind h-8 is 32px
                        />
                      </div>
                    </div>
                  )}

                  {/* Description for other metrics that don't have a progress bar or separate chart row */}
                  {typeof metric.value !== "number" && metric.description && (
                    <p className="text-sm text-trading-text-muted mt-1 leading-tight">
                      {metric.description}
                    </p>
                  )}

                  {/* Thresholds for number-based metrics */}
                  {metric.thresholds && typeof metric.value === "number" && (
                    <p className="text-xs text-trading-text-muted mt-0.5">
                      <span className="text-yellow-400">Warn: {metric.thresholds.warning}{metric.unit}</span> |{" "}
                      <span className="text-red-400">Critical: {metric.thresholds.critical}{metric.unit}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}