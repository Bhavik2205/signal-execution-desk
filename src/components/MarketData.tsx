"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  LineChart,
  LayoutGrid,
  PieChart,
  Globe,
  DollarSign,
  Newspaper,
  CalendarDays,
  ListPlus,
  Gauge,
  Activity,
  Zap,
  BarChart2,
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// --- Mock Data (Replace with real KiteConnect API data) ---
const indices = [
  { name: "NIFTY 50", price: 22845.6, change: +112.5, percentChange: "+0.49%", trend: [1, 2, 1, 3, 2, 4, 3] },
  { name: "BANK NIFTY", price: 48235.2, change: -88.4, percentChange: "-0.18%", trend: [4, 3, 4, 2, 3, 1, 2] },
  { name: "FINNIFTY", price: 22467.9, change: +45.1, percentChange: "+0.20%", trend: [2, 1, 3, 2, 4, 3, 5] },
  { name: "SENSEX", price: 75520.1, change: +350.2, percentChange: "+0.47%", trend: [1, 2, 2, 3, 2, 4, 3] },
];

const globalIndices = [
  { name: "Dow Jones", price: 39150.3, change: "+25.7", percentChange: "+0.07%" },
  { name: "NASDAQ", price: 17200.5, change: "+88.1", percentChange: "+0.51%" },
  { name: "DAX", price: 18500.2, change: "-45.3", percentChange: "-0.24%" },
  { name: "Nikkei 225", price: 38800.7, change: "+120.4", percentChange: "+0.31%" },
];

const topGainers = [
  { symbol: "RELIANCE", ltp: 3052, change: "+71.20", percentChange: "+2.34%", volume: 521000 },
  { symbol: "TCS", ltp: 3822, change: "+74.40", percentChange: "+1.98%", volume: 343200 },
  { symbol: "HDFCBANK", ltp: 1550, change: "+25.50", percentChange: "+1.67%", volume: 780000 },
  { symbol: "ICICIBANK", ltp: 1100, change: "+16.80", percentChange: "+1.55%", volume: 610000 },
];

const topLosers = [
  { symbol: "INFY", ltp: 1478, change: "-18.50", percentChange: "-1.23%", volume: 293500 },
  { symbol: "WIPRO", ltp: 526, change: "-4.60", percentChange: "-0.88%", volume: 183400 },
  { symbol: "BAJFINANCE", ltp: 7050, change: "-55.00", percentChange: "-0.78%", volume: 210000 },
  { symbol: "ASIANPAINT", ltp: 2850, change: "-20.00", percentChange: "-0.70%", volume: 150000 },
];

const mostActiveByVolume = [
  { symbol: "SBIN", ltp: 820, change: "+5.00", percentChange: "+0.61%", volume: 1200000 },
  { symbol: "RELIANCE", ltp: 3052, change: "+71.20", percentChange: "+2.34%", volume: 950000 },
  { symbol: "HDFCBANK", ltp: 1550, change: "+25.50", percentChange: "+1.67%", volume: 780000 },
  { symbol: "ICICIBANK", ltp: 1100, change: "+16.80", percentChange: "+1.55%", volume: 700000 },
];

const detailedQuotes = [
  {
    symbol: "RELIANCE",
    ltp: 3052,
    open: 2980,
    high: 3060,
    low: 2972,
    close: 3002,
    volume: 521000,
    bid: 3051.5,
    ask: 3052.5,
    '52W H': 3100,
    '52W L': 2200,
  },
  {
    symbol: "TCS",
    ltp: 3822,
    open: 3770,
    high: 3840,
    low: 3760,
    close: 3780,
    volume: 343200,
    bid: 3821.0,
    ask: 3823.0,
    '52W H': 4000,
    '52W L': 3200,
  },
  {
    symbol: "HDFCBANK",
    ltp: 1550,
    open: 1530,
    high: 1555,
    low: 1525,
    close: 1535,
    volume: 780000,
    bid: 1549.5,
    ask: 1550.5,
    '52W H': 1750,
    '52W L': 1300,
  },
];

const sectorPerformance = [
  { name: "IT", change: "+1.56%" },
  { name: "FMCG", change: "-0.94%" },
  { name: "AUTO", change: "+0.84%" },
  { name: "PHARMA", change: "-1.12%" },
  { name: "FINANCIAL", change: "+0.75%" },
  { name: "ENERGY", change: "+1.20%" },
  { name: "METAL", change: "-0.50%" },
  { name: "REALTY", change: "+0.98%" },
];

const marketBreadth = {
  advancers: 892,
  decliners: 624,
  unchanged: 54,
};

const forexCommodities = [
  { name: "USD/INR", price: 83.45, change: "+0.05", percentChange: "+0.06%" },
  { name: "Gold (MCX)", price: 72500, change: "-150", percentChange: "-0.21%" },
  { name: "Crude Oil (MCX)", price: 6500, change: "+45", percentChange: "+0.70%" },
];

const niftyFutures = [
  { expiry: "30 May 2025", ltp: 22900, change: "+120" },
  { expiry: "27 Jun 2025", ltp: 22950, change: "+115" },
  { expiry: "25 Jul 2025", ltp: 23000, change: "+110" },
];

const marketNews = [
  { id: 1, title: "Nifty hits fresh all-time high, led by banking stocks.", source: "Economic Times", time: "10:15 AM" },
  { id: 2, title: "RBI to announce monetary policy next week.", source: "Livemint", time: "09:45 AM" },
  { id: 3, title: "Reliance AGM details released, focus on green energy.", source: "Business Standard", time: "09:00 AM" },
];

const economicCalendar = [
  { id: 1, date: "June 03, 2025", event: "India Manufacturing PMI", impact: "High" },
  { id: 2, date: "June 07, 2025", event: "RBI Monetary Policy Meeting", impact: "Very High" },
  { id: 3, date: "June 14, 2025", event: "India WPI Inflation", impact: "Medium" },
];

const userWatchlist = [
  { symbol: "TATAMOTORS", ltp: 950, change: "+5.00", percentChange: "+0.53%" },
  { symbol: "AXISBANK", ltp: 1180, change: "-3.50", percentChange: "-0.30%" },
  { symbol: "SBIN", ltp: 820, change: "+5.00", percentChange: "+0.61%" },
];
// --- End Mock Data ---

export default function MarketDataPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("gainers");

  const filteredDetailedQuotes = detailedQuotes.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mock Sparkline Component - In a real app, you'd use a charting library like Recharts or Nivo
  const Sparkline = ({ data }) => {
    if (!data || data.length < 2) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min === 0 ? 1 : max - min; // Avoid division by zero
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = ((d - min) / range) * 100;
      return `${x},${100 - y}`; // Invert Y for typical chart representation
    }).join(" ");

    return (
      <svg viewBox="0 0 100 100" className="h-6 w-16" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={data[data.length - 1] > data[0] ? "#22C55E" : "#EF4444"} // Green for up, Red for down
          strokeWidth="8" // Thicker stroke for visibility
          points={points}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  // Mock Pie Chart for Market Breadth - In a real app, use a charting library
  const MarketBreadthPie = ({ advancers, decliners, unchanged }) => {
    const total = advancers + decliners + unchanged;
    const data = [
      { name: "Advancers", value: advancers, color: "#22C55E" },
      { name: "Decliners", value: decliners, color: "#EF4444" },
      { name: "Unchanged", value: unchanged, color: "#6B7280" },
    ];

    return (
      <div className="flex flex-col items-center">
        {/* Simple textual representation, replace with a real chart */}
        <div className="w-24 h-24 rounded-full border-2 border-gray-200 flex items-center justify-center text-xs font-semibold">
          {Math.round((advancers / total) * 100)}% ▲
        </div>
        <div className="mt-2 text-sm space-y-1">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
              {item.name}: <span className="font-semibold">{item.value}</span> ({((item.value / total) * 100).toFixed(1)}%)
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-8 bg-background min-h-screen text-foreground">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area (Left/Center Column) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Major Indian Indices */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <LineChart className="text-blue-600" /> Major Indian Indices
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {indices.map((index) => (
                <Card key={index.name} className="hover:shadow-lg transition-shadow duration-200 ease-in-out">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">{index.name}</CardTitle>
                    {index.change >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">₹{index.price.toFixed(2)}</div>
                    <div className={`flex items-center gap-1 text-sm font-medium ${index.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {index.change >= 0 ? "+" : ""}{index.change.toFixed(2)} ({index.percentChange})
                      <Sparkline data={index.trend} /> {/* Enhanced with Sparkline */}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <hr className="my-6 border-t border-muted" />

          {/* Top Movers */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="text-purple-600" /> Top Movers
            </h2>
            <Tabs defaultValue="gainers" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="gainers" onClick={() => setActiveTab("gainers")}>Gainers</TabsTrigger>
                <TabsTrigger value="losers" onClick={() => setActiveTab("losers")}>Losers</TabsTrigger>
                <TabsTrigger value="volume" onClick={() => setActiveTab("volume")}>Volume</TabsTrigger>
              </TabsList>
              <TabsContent value="gainers">
                <Card className="shadow-sm">
                  <CardContent className="pt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Symbol</TableHead>
                          <TableHead>LTP</TableHead>
                          <TableHead>Change (%)</TableHead>
                          <TableHead className="text-right">Volume</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topGainers.map((stock) => (
                          <TableRow key={stock.symbol} className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <TableCell className="font-medium">{stock.symbol}</TableCell>
                            <TableCell>₹{stock.ltp}</TableCell>
                            <TableCell className="text-green-600 font-medium">{stock.percentChange}</TableCell>
                            <TableCell className="text-right">{stock.volume.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="losers">
                <Card className="shadow-sm">
                  <CardContent className="pt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Symbol</TableHead>
                          <TableHead>LTP</TableHead>
                          <TableHead>Change (%)</TableHead>
                          <TableHead className="text-right">Volume</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topLosers.map((stock) => (
                          <TableRow key={stock.symbol} className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <TableCell className="font-medium">{stock.symbol}</TableCell>
                            <TableCell>₹{stock.ltp}</TableCell>
                            <TableCell className="text-red-600 font-medium">{stock.percentChange}</TableCell>
                            <TableCell className="text-right">{stock.volume.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="volume">
                <Card className="shadow-sm">
                  <CardContent className="pt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Symbol</TableHead>
                          <TableHead>LTP</TableHead>
                          <TableHead>Change (%)</TableHead>
                          <TableHead className="text-right">Volume</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mostActiveByVolume.map((stock) => (
                          <TableRow key={stock.symbol} className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <TableCell className="font-medium">{stock.symbol}</TableCell>
                            <TableCell>₹{stock.ltp}</TableCell>
                            <TableCell className={`${stock.change >= 0 ? "text-green-600" : "text-red-600"} font-medium`}>
                              {stock.percentChange}
                            </TableCell>
                            <TableCell className="text-right">{stock.volume.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>

          <hr className="my-6 border-t border-muted" />

          {/* Live Market Watch */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Gauge className="text-green-600" /> Live Market Watch
            </h2>
            <Input
              type="text"
              placeholder="Search by symbol..."
              className="mb-4 w-full md:w-1/3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="overflow-x-auto rounded border">
              <Table>
                <TableHeader className="bg-muted text-muted-foreground">
                  <TableRow>
                    <TableHead className="px-4 py-2">Symbol</TableHead>
                    <TableHead>LTP</TableHead>
                    <TableHead>Open</TableHead>
                    <TableHead>High</TableHead>
                    <TableHead>Low</TableHead>
                    <TableHead>Prev. Close</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead>Bid</TableHead>
                    <TableHead>Ask</TableHead>
                    <TableHead className="text-right">52W H/L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDetailedQuotes.map((stock) => (
                    <TableRow key={stock.symbol} className="border-t hover:bg-muted/50 transition-colors cursor-pointer">
                      <TableCell className="px-4 py-2 font-medium">{stock.symbol}</TableCell>
                      <TableCell>₹{stock.ltp}</TableCell>
                      <TableCell>₹{stock.open}</TableCell>
                      <TableCell>₹{stock.high}</TableCell>
                      <TableCell>₹{stock.low}</TableCell>
                      <TableCell>₹{stock.close}</TableCell>
                      <TableCell>{stock.volume.toLocaleString()}</TableCell>
                      <TableCell>₹{stock.bid}</TableCell>
                      <TableCell>₹{stock.ask}</TableCell>
                      <TableCell className="text-right">
                        ₹{stock['52W H']}/₹{stock['52W L']}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredDetailedQuotes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                        No results found for "{searchTerm}"
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Real KiteConnect integration would involve streaming data here */}
          </section>

          <hr className="my-6 border-t border-muted" />

          {/* Futures & Options Data */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Zap className="text-orange-600" /> F&O Insights
            </h2>
            <Tabs defaultValue="futures" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="futures">Nifty Futures</TabsTrigger>
                <TabsTrigger value="option-chain">Nifty Option Chain (Mock)</TabsTrigger>
              </TabsList>
              <TabsContent value="futures">
                <Card className="shadow-sm">
                  <CardContent className="pt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Expiry</TableHead>
                          <TableHead>LTP</TableHead>
                          <TableHead className="text-right">Change</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {niftyFutures.map((future, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{future.expiry}</TableCell>
                            <TableCell>₹{future.ltp}</TableCell>
                            <TableCell className={`${future.change >= 0 ? "text-green-600" : "text-red-600"} text-right`}>
                              {future.change >= 0 ? "+" : ""}{future.change}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="option-chain">
                <Card className="shadow-sm">
                  <CardContent className="pt-4 text-sm">
                    <p className="mb-2 text-muted-foreground">
                      *This is a simplified mock. A real option chain requires extensive data and interactive features with KiteConnect.
                    </p>
                    <div className="overflow-x-auto">
                      <Table className="min-w-full">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-center" colSpan="4">Calls</TableHead>
                            <TableHead className="text-center w-[120px]">Strike</TableHead>
                            <TableHead className="text-center" colSpan="4">Puts</TableHead>
                          </TableRow>
                          <TableRow>
                            <TableHead>Bid Price</TableHead>
                            <TableHead>Ask Price</TableHead>
                            <TableHead>LTP</TableHead>
                            <TableHead>OI</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>OI</TableHead>
                            <TableHead>LTP</TableHead>
                            <TableHead>Bid Price</TableHead>
                            <TableHead>Ask Price</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {/* Mock Option Chain Data */}
                          {[22500, 22600, 22700, 22800, 22900, 23000].map(strike => (
                            <TableRow key={strike}>
                              {/* Calls */}
                              <TableCell>₹150.00</TableCell>
                              <TableCell>₹151.00</TableCell>
                              <TableCell>₹150.50</TableCell>
                              <TableCell>1.2M</TableCell>
                              {/* Strike */}
                              <TableCell className="font-bold text-center bg-gray-50 dark:bg-gray-800">
                                ₹{strike}
                              </TableCell>
                              {/* Puts */}
                              <TableCell>0.8M</TableCell>
                              <TableCell>₹80.50</TableCell>
                              <TableCell>₹80.00</TableCell>
                              <TableCell>₹81.00</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>
        </div>

        {/* Right Column (Side Panel) */}
        <div className="lg:col-span-1 space-y-8">
          {/* User Watchlist */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ListPlus className="text-indigo-600" /> My Watchlist
            </h2>
            <Card className="shadow-sm">
              <CardContent className="pt-4">
                {userWatchlist.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>LTP</TableHead>
                        <TableHead className="text-right">Change (%)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userWatchlist.map((stock) => (
                        <TableRow key={stock.symbol} className="hover:bg-muted/50 cursor-pointer">
                          <TableCell className="font-medium">{stock.symbol}</TableCell>
                          <TableCell>₹{stock.ltp}</TableCell>
                          <TableCell className={`${stock.change >= 0 ? "text-green-600" : "text-red-600"} text-right`}>
                            {stock.percentChange}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground text-center py-4">Your watchlist is empty. Add stocks to track them!</p>
                )}
              </CardContent>
            </Card>
          </section>

          <hr className="my-6 border-t border-muted" />

          {/* Market Breadth */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <PieChart className="text-teal-600" /> Market Breadth
            </h2>
            <Card className="shadow-sm">
              <CardContent className="pt-6 flex flex-col items-center justify-center">
                <MarketBreadthPie
                  advancers={marketBreadth.advancers}
                  decliners={marketBreadth.decliners}
                  unchanged={marketBreadth.unchanged}
                />
              </CardContent>
            </Card>
          </section>

          <hr className="my-6 border-t border-muted" />

          {/* Sector Performance */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <LayoutGrid className="text-cyan-600" /> Sector Performance
            </h2>
            <Card className="shadow-sm">
              <CardContent className="pt-4 grid grid-cols-2 gap-3 text-sm">
                {sectorPerformance.map((sector) => {
                  const isPositive = sector.change.includes("+");
                  return (
                    <div key={sector.name} className="flex justify-between items-center px-3 py-2 rounded-md bg-muted/30">
                      <span className="font-medium">{sector.name}</span>
                      <Badge
                        variant="outline"
                        className={`text-xs px-2 py-0.5 ${
                          isPositive ? "text-green-600 border-green-600" : "text-red-600 border-red-600"
                        }`}
                      >
                        {sector.change}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
            {/* In a real app, clicking a sector could show stocks in that sector */}
          </section>

          <hr className="my-6 border-t border-muted" />

          {/* Global Markets */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Globe className="text-orange-500" /> Global Markets
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {globalIndices.map((index) => (
                <Card key={index.name} className="shadow-sm">
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-md font-medium">{index.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <p className="text-lg font-bold">
                      {index.price.toFixed(2)}
                    </p>
                    <p className={`text-sm ${index.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {index.change >= 0 ? "+" : ""}{index.change} ({index.percentChange})
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <hr className="my-6 border-t border-muted" />

          {/* Forex & Commodities */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="text-lime-600" /> Forex & Commodities
            </h2>
            <Card className="shadow-sm">
              <CardContent className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Change (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {forexCommodities.map((item) => (
                      <TableRow key={item.name}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.price.toLocaleString()}</TableCell>
                        <TableCell className={`${item.change >= 0 ? "text-green-600" : "text-red-600"} text-right`}>
                          {item.percentChange}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      {/* --- Further Enhancements (Comments for future integration) --- */}
      
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart2 className="text-orange-700" /> Advanced Charting (e.g., TradingView Integration)
        </h2>
        <Card className="min-h-[400px] flex items-center justify-center text-muted-foreground">
          <p>Integrate interactive charts for detailed analysis (e.g., with TradingView Library).</p>
        </Card>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <LayoutGrid className="text-pink-600" /> Market Heatmap
        </h2>
        <Card className="min-h-[300px] flex items-center justify-center text-muted-foreground">
          <p>Visual representation of market performance by market cap and price change.</p>
        </Card>
      </section>
     

      {/* Footer / Credits */}
      <div className="text-center text-sm text-muted-foreground py-6">
        Data powered by KiteConnect API (mock data shown). All data is for demonstration purposes only.
      </div>
    </div>
  );
}