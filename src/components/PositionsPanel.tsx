// src/app/positions-orders/page.jsx (or wherever your page components reside)

"use client";

import React, { useState, useMemo } from "react";
import {
  PieChart,
  ClipboardList,
  CheckCircle,
  XCircle,
  Zap,
  PackageOpen,
  ArrowRightLeft, // For overall P&L
  Wallet,
  ListPlus, // For portfolio value
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator"; // Assuming you have Separator from shadcn/ui


// src/data/mockPositionsOrders.js

export const mockEquityPositions = [
  {
    symbol: "INFY",
    qty: 10,
    buyAvg: 1450.00,
    ltp: 1478.50,
    currentValue: 14785.00,
    dayPnl: 28.50, // Change from previous day's close
    totalPnl: 285.00, // Change from buyAvg
    pnlPercent: "1.97%",
  },
  {
    symbol: "TATACHEM",
    qty: 5,
    buyAvg: 1100.00,
    ltp: 1090.00,
    currentValue: 5450.00,
    dayPnl: -10.00,
    totalPnl: -50.00,
    pnlPercent: "-0.91%",
  },
  {
    symbol: "SBIN",
    qty: 20,
    buyAvg: 800.00,
    ltp: 820.00,
    currentValue: 16400.00,
    dayPnl: 20.00,
    totalPnl: 400.00,
    pnlPercent: "5.00%",
  },
];

export const mockFnOPositions = [
  {
    symbol: "NIFTY24MAY22500CE",
    qty: 50, // 1 lot
    buyAvg: 150.00,
    ltp: 165.00,
    currentValue: 8250.00,
    dayPnl: 15.00,
    totalPnl: 750.00,
    pnlPercent: "10.00%",
    instrumentType: "CE",
  },
  {
    symbol: "BANKNIFTY24JUN48000PE",
    qty: 25, // 1 lot
    buyAvg: 200.00,
    ltp: 180.00,
    currentValue: 4500.00,
    dayPnl: -20.00,
    totalPnl: -500.00,
    pnlPercent: "-10.00%",
    instrumentType: "PE",
  },
];

export const mockOpenOrders = [
  {
    orderId: "ORD1001",
    time: "10:30 AM",
    symbol: "RELIANCE",
    type: "BUY",
    product: "CNC",
    qty: 5,
    filledQty: 0,
    price: 3000.00,
    triggerPrice: "-",
    status: "PENDING",
  },
  {
    orderId: "ORD1002",
    time: "10:35 AM",
    symbol: "HDFCBANK",
    type: "SELL",
    product: "MIS",
    qty: 10,
    filledQty: 0,
    price: 1540.00,
    triggerPrice: 1550.00,
    status: "PENDING (SL-M)",
  },
];

export const mockExecutedOrders = [
  {
    orderId: "ORD0998",
    time: "09:15 AM",
    symbol: "TCS",
    type: "BUY",
    product: "CNC",
    qty: 2,
    filledQty: 2,
    price: 3800.00,
    triggerPrice: "-",
    status: "COMPLETE",
  },
  {
    orderId: "ORD0999",
    time: "09:30 AM",
    symbol: "INFY",
    type: "SELL",
    product: "MIS",
    qty: 5,
    filledQty: 5,
    price: 1480.00,
    triggerPrice: "-",
    status: "COMPLETE",
  },
  {
    orderId: "ORD1000",
    time: "10:00 AM",
    symbol: "SBIN",
    type: "BUY",
    product: "CNC",
    qty: 20,
    filledQty: 20,
    price: 820.00,
    triggerPrice: "-",
    status: "COMPLETE",
  },
];

export const mockRejectedOrders = [
  {
    orderId: "ORD1003",
    time: "10:40 AM",
    symbol: "WIPRO",
    type: "BUY",
    product: "MIS",
    qty: 15,
    filledQty: 0,
    price: 530.00,
    triggerPrice: "-",
    status: "REJECTED",
    reason: "Insufficient funds",
  },
];

export const mockGTTOrders = [
  {
    orderId: "GTT001",
    time: "Apr 15, 2025",
    symbol: "BHARTIARTL",
    type: "SELL (Target)",
    condition: "Last price > 1200",
    qty: 10,
    price: 1200.00,
    status: "ACTIVE",
  },
  {
    orderId: "GTT002",
    time: "May 10, 2025",
    symbol: "TECHM",
    type: "BUY (Stoploss)",
    condition: "Last price < 1300",
    qty: 5,
    price: 1300.00,
    status: "ACTIVE",
  },
];

export function PositionsPanel() {
  const [activePositionsTab, setActivePositionsTab] = useState("equity");
  const [activeOrdersTab, setActiveOrdersTab] = useState("open");

  // Calculate portfolio summary
  const totalEquityPnl = useMemo(() =>
    mockEquityPositions.reduce((sum, pos) => sum + pos.totalPnl, 0),
    [mockEquityPositions]
  );
  const totalFnOPnl = useMemo(() =>
    mockFnOPositions.reduce((sum, pos) => sum + pos.totalPnl, 0),
    [mockFnOPositions]
  );
  const totalDayPnl = useMemo(() =>
    mockEquityPositions.reduce((sum, pos) => sum + pos.dayPnl, 0) +
    mockFnOPositions.reduce((sum, pos) => sum + pos.dayPnl, 0),
    [mockEquityPositions, mockFnOPositions]
  );
  const totalCurrentValue = useMemo(() =>
    mockEquityPositions.reduce((sum, pos) => sum + pos.currentValue, 0) +
    mockFnOPositions.reduce((sum, pos) => sum + pos.currentValue, 0),
    [mockEquityPositions, mockFnOPositions]
  );

  const overallTotalPnl = totalEquityPnl + totalFnOPnl;

  const getPnlColorClass = (pnl) => {
    if (pnl > 0) return "text-green-600";
    if (pnl < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  return (
    <div className="p-4 sm:p-6 space-y-8 bg-background min-h-screen text-foreground">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Summary (Left Column) */}
        <div className="lg:col-span-1 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ArrowRightLeft className="text-blue-600" /> Overall Summary
            </h2>
            <Card className="shadow-sm">
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-medium">Total Portfolio Value:</span>
                  <span className="text-2xl font-bold flex items-center gap-1">
                    <Wallet className="w-5 h-5" />₹{totalCurrentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Day's P&L:</span>
                  <span className={`text-xl font-bold ${getPnlColorClass(totalDayPnl)}`}>
                    {totalDayPnl >= 0 ? "+" : ""}{totalDayPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Overall P&L:</span>
                  <span className={`text-xl font-bold ${getPnlColorClass(overallTotalPnl)}`}>
                    {overallTotalPnl >= 0 ? "+" : ""}{overallTotalPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* <hr className="my-6 border-t border-muted" />

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ListPlus className="text-indigo-600" /> My Watchlist (Quick View)
            </h2>
            <Card className="shadow-sm">
              <CardContent className="pt-4">
                {mockEquityPositions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>LTP</TableHead>
                        <TableHead className="text-right">Day P&L</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockEquityPositions.slice(0,3).map((stock) => (
                        <TableRow key={stock.symbol} className="hover:bg-muted/50 cursor-pointer">
                          <TableCell className="font-medium">{stock.symbol}</TableCell>
                          <TableCell>₹{stock.ltp}</TableCell>
                          <TableCell className={`${getPnlColorClass(stock.dayPnl)} text-right`}>
                            {stock.dayPnl >= 0 ? "+" : ""}{stock.dayPnl.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground text-center py-4">Your watchlist is empty.</p>
                )}
              </CardContent>
            </Card>
          </section> */}

        </div>

        {/* Positions and Orders Details (Right/Main Column) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Current Positions */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <PieChart className="text-teal-600" /> Current Positions
            </h2>
            <Tabs value={activePositionsTab} onValueChange={setActivePositionsTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="equity">Equity</TabsTrigger>
                <TabsTrigger value="fno">F&O</TabsTrigger>
              </TabsList>
              <TabsContent value="equity">
                <Card className="shadow-sm">
                  <CardContent className="pt-4">
                    {mockEquityPositions.length > 0 ? (
                      <div className="overflow-x-auto rounded border">
                        <Table>
                          <TableHeader className="bg-muted text-muted-foreground">
                            <TableRow>
                              <TableHead>Symbol</TableHead>
                              <TableHead>Qty</TableHead>
                              <TableHead>Buy Avg</TableHead>
                              <TableHead>LTP</TableHead>
                              <TableHead>Current Value</TableHead>
                              <TableHead>Day P&L</TableHead>
                              <TableHead className="text-right">Total P&L (%)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {mockEquityPositions.map((position) => (
                              <TableRow key={position.symbol} className="hover:bg-muted/50 transition-colors cursor-pointer">
                                <TableCell className="font-medium">{position.symbol}</TableCell>
                                <TableCell>{position.qty}</TableCell>
                                <TableCell>₹{position.buyAvg.toFixed(2)}</TableCell>
                                <TableCell>₹{position.ltp.toFixed(2)}</TableCell>
                                <TableCell>₹{position.currentValue.toLocaleString()}</TableCell>
                                <TableCell className={getPnlColorClass(position.dayPnl)}>
                                  {position.dayPnl >= 0 ? "+" : ""}{position.dayPnl.toFixed(2)}
                                </TableCell>
                                <TableCell className={`${getPnlColorClass(position.totalPnl)} text-right`}>
                                  {position.totalPnl >= 0 ? "+" : ""}{position.totalPnl.toFixed(2)} ({position.pnlPercent})
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No open equity positions.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="fno">
                <Card className="shadow-sm">
                  <CardContent className="pt-4">
                    {mockFnOPositions.length > 0 ? (
                      <div className="overflow-x-auto rounded border">
                        <Table>
                          <TableHeader className="bg-muted text-muted-foreground">
                            <TableRow>
                              <TableHead>Symbol</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Qty</TableHead>
                              <TableHead>Buy Avg</TableHead>
                              <TableHead>LTP</TableHead>
                              <TableHead>Current Value</TableHead>
                              <TableHead>Day P&L</TableHead>
                              <TableHead className="text-right">Total P&L (%)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {mockFnOPositions.map((position) => (
                              <TableRow key={position.symbol} className="hover:bg-muted/50 transition-colors cursor-pointer">
                                <TableCell className="font-medium">{position.symbol}</TableCell>
                                <TableCell>{position.instrumentType}</TableCell>
                                <TableCell>{position.qty}</TableCell>
                                <TableCell>₹{position.buyAvg.toFixed(2)}</TableCell>
                                <TableCell>₹{position.ltp.toFixed(2)}</TableCell>
                                <TableCell>₹{position.currentValue.toLocaleString()}</TableCell>
                                <TableCell className={getPnlColorClass(position.dayPnl)}>
                                  {position.dayPnl >= 0 ? "+" : ""}{position.dayPnl.toFixed(2)}
                                </TableCell>
                                <TableCell className={`${getPnlColorClass(position.totalPnl)} text-right`}>
                                  {position.totalPnl >= 0 ? "+" : ""}{position.totalPnl.toFixed(2)} ({position.pnlPercent})
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No open F&O positions.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>

          <hr className="my-6 border-t border-muted" />

          {/* Orders */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ClipboardList className="text-purple-600" /> Order History
            </h2>
            <Tabs value={activeOrdersTab} onValueChange={setActiveOrdersTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="open">
                  <PackageOpen className="w-4 h-4 mr-2" /> Open
                </TabsTrigger>
                <TabsTrigger value="executed">
                  <CheckCircle className="w-4 h-4 mr-2" /> Executed
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  <XCircle className="w-4 h-4 mr-2" /> Rejected
                </TabsTrigger>
                <TabsTrigger value="gtt">
                  <Zap className="w-4 h-4 mr-2" /> GTT
                </TabsTrigger>
              </TabsList>

              {/* Open Orders Tab */}
              <TabsContent value="open">
                <Card className="shadow-sm">
                  <CardContent className="pt-4">
                    {mockOpenOrders.length > 0 ? (
                      <div className="overflow-x-auto rounded border">
                        <Table>
                          <TableHeader className="bg-muted text-muted-foreground">
                            <TableRow>
                              <TableHead>Time</TableHead>
                              <TableHead>Symbol</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Qty</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Product</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {mockOpenOrders.map((order) => (
                              <TableRow key={order.orderId} className="hover:bg-muted/50 transition-colors cursor-pointer">
                                <TableCell className="font-medium">{order.time}</TableCell>
                                <TableCell>{order.symbol}</TableCell>
                                <TableCell>
                                  <Badge variant={order.type === "BUY" ? "default" : "destructive"}>{order.type}</Badge>
                                </TableCell>
                                <TableCell>{order.qty}</TableCell>
                                <TableCell>₹{order.price.toFixed(2)}</TableCell>
                                <TableCell>{order.status}</TableCell>
                                <TableCell className="text-right">{order.product}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No open orders.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Executed Orders Tab */}
              <TabsContent value="executed">
                <Card className="shadow-sm">
                  <CardContent className="pt-4">
                    {mockExecutedOrders.length > 0 ? (
                      <div className="overflow-x-auto rounded border">
                        <Table>
                          <TableHeader className="bg-muted text-muted-foreground">
                            <TableRow>
                              <TableHead>Time</TableHead>
                              <TableHead>Symbol</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Qty</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Product</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {mockExecutedOrders.map((order) => (
                              <TableRow key={order.orderId} className="hover:bg-muted/50 transition-colors cursor-pointer">
                                <TableCell className="font-medium">{order.time}</TableCell>
                                <TableCell>{order.symbol}</TableCell>
                                <TableCell>
                                  <Badge variant={order.type === "BUY" ? "default" : "destructive"}>{order.type}</Badge>
                                </TableCell>
                                <TableCell>{order.filledQty} / {order.qty}</TableCell>
                                <TableCell>₹{order.price.toFixed(2)}</TableCell>
                                <TableCell>{order.status}</TableCell>
                                <TableCell className="text-right">{order.product}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No executed orders found.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Rejected Orders Tab */}
              <TabsContent value="rejected">
                <Card className="shadow-sm">
                  <CardContent className="pt-4">
                    {mockRejectedOrders.length > 0 ? (
                      <div className="overflow-x-auto rounded border">
                        <Table>
                          <TableHeader className="bg-muted text-muted-foreground">
                            <TableRow>
                              <TableHead>Time</TableHead>
                              <TableHead>Symbol</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Qty</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Reason</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {mockRejectedOrders.map((order) => (
                              <TableRow key={order.orderId} className="hover:bg-muted/50 transition-colors cursor-pointer">
                                <TableCell className="font-medium">{order.time}</TableCell>
                                <TableCell>{order.symbol}</TableCell>
                                <TableCell>
                                  <Badge variant={order.type === "BUY" ? "default" : "destructive"}>{order.type}</Badge>
                                </TableCell>
                                <TableCell>{order.qty}</TableCell>
                                <TableCell>₹{order.price.toFixed(2)}</TableCell>
                                <TableCell>{order.status}</TableCell>
                                <TableCell className="text-right text-red-500">{order.reason}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No rejected orders found.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* GTT Orders Tab */}
              <TabsContent value="gtt">
                <Card className="shadow-sm">
                  <CardContent className="pt-4">
                    {mockGTTOrders.length > 0 ? (
                      <div className="overflow-x-auto rounded border">
                        <Table>
                          <TableHeader className="bg-muted text-muted-foreground">
                            <TableRow>
                              <TableHead>Created On</TableHead>
                              <TableHead>Symbol</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Condition</TableHead>
                              <TableHead>Qty</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {mockGTTOrders.map((order) => (
                              <TableRow key={order.orderId} className="hover:bg-muted/50 transition-colors cursor-pointer">
                                <TableCell className="font-medium">{order.time}</TableCell>
                                <TableCell>{order.symbol}</TableCell>
                                <TableCell>
                                  <Badge variant="secondary">{order.type}</Badge>
                                </TableCell>
                                <TableCell>{order.condition}</TableCell>
                                <TableCell>{order.qty}</TableCell>
                                <TableCell>₹{order.price.toFixed(2)}</TableCell>
                                <TableCell className="text-right">{order.status}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No GTT orders found.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </div>

      {/* Footer / Credits */}
      <div className="text-center text-sm text-muted-foreground py-6 mt-8">
        Data powered by KiteConnect API (mock data shown). All data is for demonstration purposes only.
      </div>
    </div>
  );
}