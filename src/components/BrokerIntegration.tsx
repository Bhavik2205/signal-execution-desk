import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Unlink, Clock } from "lucide-react";

// Add this logo to your `public` folder or import locally
const zerodhaLogo = "/public/ZerodhaLogo.svg"; // Update path if needed

export function BrokerIntegrationPanel() {
  const isConnected = true; // Replace with real auth state
  const lastSynced = "2025-05-31 09:45 AM"; // Replace dynamically

  return (
    <div className="p-6 space-y-6">
      {/* Zerodha Integration */}
      <Card className="trading-card border-trading-bg-card">
        <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex flex-col gap-2">
            <img
              src={zerodhaLogo}
              alt="Zerodha Logo"
              className="h-auto w-auto max-w-[100px] sm:max-w-[150px] rounded-lg shadow-sm"
            />
            <div>
              <CardTitle className="text-lg text-trading-text">Zerodha Integration</CardTitle>
              <p className="text-sm text-trading-text-muted">
                Connect your Zerodha account to start trading.
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className={`text-xs ${isConnected
              ? 'border-trading-profit text-trading-profit'
              : 'border-trading-loss text-trading-loss'
              }`}
          >
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </CardHeader>


        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <ShieldCheck className="w-6 h-6 text-trading-profit" />
            ) : (
              <Unlink className="w-6 h-6 text-trading-loss" />
            )}
            <span className="text-trading-text">
              {isConnected
                ? "Your Zerodha account is securely connected."
                : "You are not connected to Zerodha."}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Clock className="w-5 h-5 text-trading-text-muted" />
            <p className="text-trading-text-muted text-sm">
              Last synced: {lastSynced}
            </p>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
              onClick={() => {
                alert("Redirecting to Zerodha login...");
              }}
            >
              {isConnected ? "Reconnect Zerodha" : "Connect Zerodha"}
            </button>

            {isConnected && (
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
                onClick={() => {
                  alert("Disconnected from Zerodha");
                }}
              >
                Disconnect
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* API Configuration */}
      <Card className="trading-card border-trading-bg-card">
        <CardHeader>
          <CardTitle className="text-lg text-trading-text">API Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-trading-text-muted">
            Ensure your Kite Connect API credentials are configured correctly.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-trading-text">API Key</label>
              <input
                type="text"
                placeholder="Enter your API Key"
                className="w-full mt-1 px-3 py-2 border rounded-md bg-trading-bg-light text-trading-text focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-trading-text">API Secret</label>
              <input
                type="password"
                placeholder="Enter your API Secret"
                className="w-full mt-1 px-3 py-2 border rounded-md bg-trading-bg-light text-trading-text focus:outline-none"
              />
            </div>
          </div>

          <button
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
            onClick={() => {
              alert("Saved API credentials (mock)");
            }}
          >
            Save Settings
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
