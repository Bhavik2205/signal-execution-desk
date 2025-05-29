
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const orders = [
  { 
    id: 'ORD001', 
    symbol: 'INFY', 
    type: 'BUY', 
    qty: 100, 
    price: 1450.00, 
    status: 'PENDING',
    time: '10:45:23'
  },
  { 
    id: 'ORD002', 
    symbol: 'WIPRO', 
    type: 'SELL', 
    qty: 75, 
    price: 425.50, 
    status: 'FILLED',
    time: '10:32:15'
  },
  { 
    id: 'ORD003', 
    symbol: 'TCS', 
    type: 'BUY', 
    qty: 25, 
    price: 3540.00, 
    status: 'REJECTED',
    time: '10:28:45'
  },
];

export function OrdersPanel() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FILLED':
        return 'border-trading-profit text-trading-profit';
      case 'PENDING':
        return 'border-trading-warning text-trading-warning';
      case 'REJECTED':
        return 'border-trading-loss text-trading-loss';
      default:
        return 'border-trading-text-muted text-trading-text-muted';
    }
  };

  return (
    <Card className="trading-card">
      <CardHeader>
        <CardTitle className="text-trading-text">Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="p-3 bg-trading-bg rounded-lg border border-trading-bg-card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <p className="font-semibold text-trading-text">{order.symbol}</p>
                  <Badge 
                    variant="outline"
                    className={`text-xs ${
                      order.type === 'BUY' 
                        ? 'border-trading-profit text-trading-profit' 
                        : 'border-trading-loss text-trading-loss'
                    }`}
                  >
                    {order.type}
                  </Badge>
                </div>
                <Badge 
                  variant="outline"
                  className={`text-xs ${getStatusColor(order.status)}`}
                >
                  {order.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-trading-text-muted">
                  <p>Qty: {order.qty} @ ₹{order.price.toFixed(2)}</p>
                  <p>Time: {order.time}</p>
                </div>
                {order.status === 'PENDING' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-trading-loss text-trading-loss hover:bg-trading-loss hover:text-white"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
