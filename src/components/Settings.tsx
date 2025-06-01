"use client";

import React, { useState } from "react";
import {
  Settings,
  Key,
  Bell,
  MessageSquare,
  Send,
  Save,
  Info,
  ExternalLink,
  RefreshCw,
  Shield,
  Code,
  Database, // New icon for Data Management
  Cpu, // New icon for Performance Optimization
  Wallet, // Existing, but good for general trading
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function SettingsPage() {
  // --- State for Zerodha Integration ---
  const [zerodhaApiKey, setZerodhaApiKey] = useState("YOUR_ZERODHA_API_KEY_MOCK");
  const [zerodhaApiSecret, setZerodhaApiSecret] = useState("YOUR_ZERODHA_API_SECRET_MOCK");
  const [zerodhaAccessToken, setZerodhaAccessToken] = useState("YOUR_ZERODHA_ACCESS_TOKEN_MOCK");
  const [zerodhaRedirectUrl, setZerodhaRedirectUrl] = useState("https://yourbot.com/auth/callback");
  const [zerodhaBrokerageType, setZerodhaBrokerageType] = useState("Flat"); // New setting

  // --- State for Notification Settings ---
  const [telegramNotificationsEnabled, setTelegramNotificationsEnabled] = useState(true);
  const [telegramBotToken, setTelegramBotToken] = useState("YOUR_TELEGRAM_BOT_TOKEN_MOCK");
  const [telegramChatId, setTelegramChatId] = useState("YOUR_TELEGRAM_CHAT_ID_MOCK");
  const [whatsappNotificationsEnabled, setWhatsappNotificationsEnabled] = useState(false);
  const [whatsappApiUrl, setWhatsappApiUrl] = useState("https://api.whatsapp.com/send?phone="); // Mock API URL
  const [whatsappPhoneNumber, setWhatsappPhoneNumber] = useState("91XXXXXXXXXX"); // Mock phone number
  const [notificationFrequency, setNotificationFrequency] = useState("Instant"); // New setting
  const [notifyTradeExecution, setNotifyTradeExecution] = useState(true); // New setting
  const [notifyPnlThreshold, setNotifyPnlThreshold] = useState(false); // New setting
  const [pnlThresholdValue, setPnlThresholdValue] = useState("1000"); // New setting
  const [notifyErrorAlerts, setNotifyErrorAlerts] = useState(true); // New setting

  // --- State for General Trading Settings ---
  const [riskPerTrade, setRiskPerTrade] = useState("1.0"); // Percentage
  const [maxDailyLoss, setMaxDailyLoss] = useState("5000.00"); // INR
  const [tradingHoursStart, setTradingHoursStart] = useState("09:15");
  const [tradingHoursEnd, setTradingHoursEnd] = useState("15:30");
  const [defaultExchange, setDefaultExchange] = useState("NSE");
  const [logLevel, setLogLevel] = useState("INFO");
  const [maxOpenPositions, setMaxOpenPositions] = useState("10"); // New setting
  const [slippageTolerance, setSlippageTolerance] = useState("0.1"); // New setting (%)
  const [orderTypePreference, setOrderTypePreference] = useState("Market"); // New setting

  // --- State for Strategy Management ---
  const [enableAutoRetrain, setEnableAutoRetrain] = useState(true);
  const [retrainFrequency, setRetrainFrequency] = useState("Daily");
  const [dataRetentionDays, setDataRetentionDays] = useState("30");
  const [backtestingFrequency, setBacktestingFrequency] = useState("Weekly"); // New setting
  const [deploymentMethod, setDeploymentMethod] = useState("Paper Trading"); // New setting
  const [modelVersionControlEnabled, setModelVersionControlEnabled] = useState(true); // New setting
  const [modelVersionControlSystem, setModelVersionControlSystem] = useState("Git"); // New setting

  // --- State for Data Management --- (New Section)
  const [dataSource, setDataSource] = useState("KiteConnect");
  const [dataRefreshRate, setDataRefreshRate] = useState("5"); // Seconds
  const [dataStorageLocation, setDataStorageLocation] = useState("/data/historical/");

  // --- State for Performance Optimization --- (New Section)
  const [enableGpuAcceleration, setEnableGpuAcceleration] = useState(false);
  const [parallelProcessingCores, setParallelProcessingCores] = useState("4");
  const [memoryLimitGB, setMemoryLimitGB] = useState("8");

  // --- State for active tab ---
  const [activeTab, setActiveTab] = useState("zerodha"); // Default active tab

  // --- Save Settings Handler ---
  const handleSaveSettings = () => {
    const settings = {
      zerodha: {
        apiKey: zerodhaApiKey,
        apiSecret: zerodhaApiSecret,
        accessToken: zerodhaAccessToken,
        redirectUrl: zerodhaRedirectUrl,
        brokerageType: zerodhaBrokerageType, // New
      },
      notifications: {
        telegram: { enabled: telegramNotificationsEnabled, botToken: telegramBotToken, chatId: telegramChatId },
        whatsapp: { enabled: whatsappNotificationsEnabled, apiUrl: whatsappApiUrl, phoneNumber: whatsappPhoneNumber },
        frequency: notificationFrequency, // New
        notifyTradeExecution: notifyTradeExecution, // New
        notifyPnlThreshold: notifyPnlThreshold, // New
        pnlThresholdValue: parseFloat(pnlThresholdValue), // New
        notifyErrorAlerts: notifyErrorAlerts, // New
      },
      generalTrading: {
        riskPerTrade: parseFloat(riskPerTrade),
        maxDailyLoss: parseFloat(maxDailyLoss),
        tradingHours: { start: tradingHoursStart, end: tradingHoursEnd },
        defaultExchange: defaultExchange,
        logLevel: logLevel,
        maxOpenPositions: parseInt(maxOpenPositions), // New
        slippageTolerance: parseFloat(slippageTolerance), // New
        orderTypePreference: orderTypePreference, // New
      },
      strategyManagement: {
        enableAutoRetrain: enableAutoRetrain,
        retrainFrequency: retrainFrequency,
        dataRetentionDays: parseInt(dataRetentionDays),
        backtestingFrequency: backtestingFrequency, // New
        deploymentMethod: deploymentMethod, // New
        modelVersionControlEnabled: modelVersionControlEnabled, // New
        modelVersionControlSystem: modelVersionControlSystem, // New
      },
      dataManagement: { // New Section
        dataSource: dataSource,
        dataRefreshRate: parseInt(dataRefreshRate),
        dataStorageLocation: dataStorageLocation,
      },
      performanceOptimization: { // New Section
        enableGpuAcceleration: enableGpuAcceleration,
        parallelProcessingCores: parseInt(parallelProcessingCores),
        memoryLimitGB: parseInt(memoryLimitGB),
      }
    };

    console.log("Saving settings:", settings);
    alert("Settings saved! (Mock action - check console for data)");
    // In a real application, you would send these settings to your backend
    // for secure storage and application.
  };

  return (
    <div className="p-4 sm:p-6 bg-black text-gray-100 min-h-screen font-sans">

      <Tabs defaultValue="zerodha" onValueChange={setActiveTab} className="w-full max-w-4xl mx-auto"> {/* Centered and max-width */}
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6 bg-gray-800 border border-gray-700 rounded-lg p-2 shadow-lg"> {/* More columns, shadow */}
          <TabsTrigger
            value="zerodha"
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-blue-500 rounded-md transition-all duration-200 hover:text-gray-100 py-2 px-2 text-sm sm:text-base"
          >
            <Key className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Zerodha</span><span className="sm:hidden">Broker</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-blue-500 rounded-md transition-all duration-200 hover:text-gray-100 py-2 px-2 text-sm sm:text-base"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Notifications</span><span className="sm:hidden">Alerts</span>
          </TabsTrigger>
          <TabsTrigger
            value="general"
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-blue-500 rounded-md transition-all duration-200 hover:text-gray-100 py-2 px-2 text-sm sm:text-base"
          >
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">General Trading</span><span className="sm:hidden">Rules</span>
          </TabsTrigger>
          <TabsTrigger
            value="strategy"
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-blue-500 rounded-md transition-all duration-200 hover:text-gray-100 py-2 px-2 text-sm sm:text-base"
          >
            <Code className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Strategy & Models</span><span className="sm:hidden">ML Models</span>
          </TabsTrigger>
          <TabsTrigger
            value="data"
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-blue-500 rounded-md transition-all duration-200 hover:text-gray-100 py-2 px-2 text-sm sm:text-base"
          >
            <Database className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Data Management</span><span className="sm:hidden">Data</span>
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-blue-500 rounded-md transition-all duration-200 hover:text-gray-100 py-2 px-2 text-sm sm:text-base"
          >
            <Cpu className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Performance</span><span className="sm:hidden">Perf. Opt.</span>
          </TabsTrigger>
        </TabsList>

        {/* Zerodha Integration Tab Content */}
        <TabsContent value="zerodha">
          <Card className="bg-gray-900 border border-gray-700 shadow-xl"> {/* Added shadow-xl */}
            <CardHeader className="pb-4"> {/* Increased padding */}
              <CardTitle className="text-2xl font-bold text-blue-400 flex items-center gap-3">
                <Key className="w-6 h-6" /> Zerodha API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4"> {/* Increased space-y and pt */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5"> {/* Two columns for inputs */}
                <div>
                  <Label htmlFor="apiKey" className="text-gray-300 text-sm mb-2 block">API Key</Label>
                  <Input
                    id="apiKey"
                    type="text"
                    value={zerodhaApiKey}
                    onChange={(e) => setZerodhaApiKey(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-gray-200 focus:border-blue-500 text-base h-11 px-4"
                    placeholder="Your Zerodha API Key"
                  />
                </div>
                <div>
                  <Label htmlFor="apiSecret" className="text-gray-300 text-sm mb-2 block">API Secret</Label>
                  <Input
                    id="apiSecret"
                    type="password"
                    value={zerodhaApiSecret}
                    onChange={(e) => setZerodhaApiSecret(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-gray-200 focus:border-blue-500 text-base h-11 px-4"
                    placeholder="Your Zerodha API Secret"
                  />
                </div>
                <div className="md:col-span-2"> {/* Full width for Access Token */}
                  <Label htmlFor="accessToken" className="text-gray-300 text-sm mb-2 block">Access Token</Label>
                  <Input
                    id="accessToken"
                    type="text"
                    value={zerodhaAccessToken}
                    onChange={(e) => setZerodhaAccessToken(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-gray-200 focus:border-blue-500 text-base h-11 px-4"
                    placeholder="Generated Access Token"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    This token is generated after successful authentication. Do not share.
                  </p>
                </div>
                <div className="md:col-span-2"> {/* Full width for Redirect URL */}
                  <Label htmlFor="redirectUrl" className="text-gray-300 text-sm mb-2 block">Redirect URL</Label>
                  <Input
                    id="redirectUrl"
                    type="url"
                    value={zerodhaRedirectUrl}
                    onChange={(e) => setZerodhaRedirectUrl(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-gray-200 focus:border-blue-500 text-base h-11 px-4"
                    placeholder="https://yourbot.com/auth/callback"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Ensure this matches your registered URL on the Kite Connect Developer Console.
                  </p>
                </div>
                <div> {/* New setting */}
                  <Label htmlFor="brokerageType" className="text-gray-300 text-sm mb-2 block">Brokerage Type</Label>
                  <Select value={zerodhaBrokerageType} onValueChange={setZerodhaBrokerageType}>
                    <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-gray-200 focus:border-blue-500 h-11 px-4">
                      <SelectValue placeholder="Select brokerage type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600 text-gray-200">
                      <SelectItem value="Flat">Flat Fee</SelectItem>
                      <SelectItem value="Percentage">Percentage-based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator className="bg-gray-700 my-6" />
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  className="border-blue-500 text-blue-400 hover:bg-blue-900/50 hover:text-blue-300 h-11 px-6 text-base font-semibold transition-colors"
                  onClick={() => alert("Redirecting to Zerodha for authentication... (Mock)")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" /> Re-authenticate Zerodha
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings Tab Content */}
        <TabsContent value="notifications">
          <Card className="bg-gray-900 border border-gray-700 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-purple-400 flex items-center gap-3">
                <Bell className="w-6 h-6" /> Notification Channels & Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {/* Notification Frequency */}
              <div>
                <Label htmlFor="notificationFrequency" className="text-gray-300 text-sm mb-2 block">Notification Frequency</Label>
                <Select value={notificationFrequency} onValueChange={setNotificationFrequency}>
                  <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-gray-200 focus:border-blue-500 h-11 px-4">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 text-gray-200">
                    <SelectItem value="Instant">Instant (Real-time)</SelectItem>
                    <SelectItem value="Hourly">Hourly Summary</SelectItem>
                    <SelectItem value="Daily">Daily Summary</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-2">
                  Choose how often you receive updates from the bot.
                </p>
              </div>

              <Separator className="bg-gray-700 my-6" />

              {/* Telegram Notifications */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="telegram-switch" className="text-gray-300 text-base flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-cyan-400" /> Enable Telegram Notifications
                  </Label>
                  <Switch
                    id="telegram-switch"
                    checked={telegramNotificationsEnabled}
                    onCheckedChange={setTelegramNotificationsEnabled}
                    className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-600"
                  />
                </div>
                {telegramNotificationsEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 border-t border-gray-800 pt-4">
                    <div>
                      <Label htmlFor="telegramBotToken" className="text-gray-400 text-sm mb-2 block">Telegram Bot Token</Label>
                      <Input
                        id="telegramBotToken"
                        type="password"
                        value={telegramBotToken}
                        onChange={(e) => setTelegramBotToken(e.target.value)}
                        className="bg-gray-800 border-gray-600 text-gray-200 focus:border-blue-500 text-base h-11 px-4"
                        placeholder="e.g., 123456:ABC-DEF1234ghIkl-zyx57W2v1u12345"
                      />
                    </div>
                    <div>
                      <Label htmlFor="telegramChatId" className="text-gray-400 text-sm mb-2 block">Telegram Chat ID</Label>
                      <Input
                        id="telegramChatId"
                        type="text"
                        value={telegramChatId}
                        onChange={(e) => setTelegramChatId(e.target.value)}
                        className="bg-gray-800 border-gray-600 text-gray-200 focus:border-blue-500 text-base h-11 px-4"
                        placeholder="e.g., -1234567890 (for groups) or user ID"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        This is where your bot will send messages. For groups, use a negative ID.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="bg-gray-700 my-6" />

              {/* WhatsApp Notifications */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="whatsapp-switch" className="text-gray-300 text-base flex items-center gap-2">
                    <Send className="w-5 h-5 text-green-400" /> Enable WhatsApp Notifications
                  </Label>
                  <Switch
                    id="whatsapp-switch"
                    checked={whatsappNotificationsEnabled}
                    onCheckedChange={setWhatsappNotificationsEnabled}
                    className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-600"
                  />
                </div>
                {whatsappNotificationsEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 border-t border-gray-800 pt-4">
                    <div>
                      <Label htmlFor="whatsappApiUrl" className="text-gray-400 text-sm mb-2 block">WhatsApp API URL (e.g., Twilio/MessageBird)</Label>
                      <Input
                        id="whatsappApiUrl"
                        type="url"
                        value={whatsappApiUrl}
                        onChange={(e) => setWhatsappApiUrl(e.target.value)}
                        className="bg-gray-800 border-gray-600 text-gray-200 focus:border-blue-500 text-base h-11 px-4"
                        placeholder="e.g., https://api.twilio.com/2010-04-01/Accounts/ACxxxxxxxx/Messages.json"
                      />
                    </div>
                    <div>
                      <Label htmlFor="whatsappPhoneNumber" className="text-gray-400 text-sm mb-2 block">Recipient Phone Number (with country code)</Label>
                      <Input
                        id="whatsappPhoneNumber"
                        type="tel"
                        value={whatsappPhoneNumber}
                        onChange={(e) => setWhatsappPhoneNumber(e.target.value)}
                        className="bg-gray-800 border-gray-600 text-gray-200 focus:border-blue-500 text-base h-11 px-4"
                        placeholder="e.g., 919876543210"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 md:col-span-2">
                      Requires a WhatsApp Business API provider (e.g., Twilio, MessageBird).
                    </p>
                  </div>
                )}
              </div>

              <Separator className="bg-gray-700 my-6" />

              {/* Specific Event Notifications */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-300">Specific Event Alerts</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifyTradeExecution" className="text-gray-400 text-base">Trade Execution</Label>
                  <Switch
                    id="notifyTradeExecution"
                    checked={notifyTradeExecution}
                    onCheckedChange={setNotifyTradeExecution}
                    className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-600"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifyPnlThreshold" className="text-gray-400 text-base">P&L Threshold Alert</Label>
                  <Switch
                    id="notifyPnlThreshold"
                    checked={notifyPnlThreshold}
                    onCheckedChange={setNotifyPnlThreshold}
                    className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-600"
                  />
                </div>
                {notifyPnlThreshold && (
                  <div>
                    <Label htmlFor="pnlThresholdValue" className="text-gray-400 text-sm mb-2 block">P&L Threshold (INR)</Label>
                    <Input
                      id="pnlThresholdValue"
                      type="number"
                      step="100"
                      value={pnlThresholdValue}
                      onChange={(e) => setPnlThresholdValue(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-gray-200 focus:border-blue-500 text-base h-11 px-4"
                      placeholder="e.g., 1000"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Receive an alert when daily P&L crosses this value (positive or negative).
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifyErrorAlerts" className="text-gray-400 text-base">Critical Error Alerts</Label>
                  <Switch
                    id="notifyErrorAlerts"
                    checked={notifyErrorAlerts}
                    onCheckedChange={setNotifyErrorAlerts}
                    className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Trading Settings Tab Content */}
        <TabsContent value="general">
          <Card className="bg-gray-900 border border-gray-700 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-yellow-400 flex items-center gap-3">
                <Shield className="w-6 h-6" /> General Trading Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {/* Risk Management */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-300">Risk Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <div>
                    <Label htmlFor="riskPerTrade" className="text-gray-300 text-sm mb-2 block">Risk Per Trade (%)</Label>
                    <Input
                      id="riskPerTrade"
                      type="number"
                      step="0.1"
                      value={riskPerTrade}
                      onChange={(e) => setRiskPerTrade(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-gray-200 focus:border-blue-500 text-base h-11 px-4"
                      placeholder="e.g., 1.0"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Percentage of total capital to risk per trade.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="maxDailyLoss" className="text-gray-300 text-sm mb-2 block">Maximum Daily Loss (INR)</Label>
                    <Input
                      id="maxDailyLoss"
                      type="number"
                      step="100"
                      value={maxDailyLoss}
                      onChange={(e) => setMaxDailyLoss(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-gray-200 focus:border-blue-500 text-base h-11 px-4"
                      placeholder="e.g., 5000.00"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Bot will stop trading if daily loss exceeds this amount.
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-700 my-6" />

              {/* Order & Execution Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-300">Order & Execution Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <div>
                    <Label htmlFor="maxOpenPositions" className="text-gray-300 text-sm mb-2 block">Max Open Positions</Label>
                    <Input
                      id="maxOpenPositions"
                      type="number"
                      value={maxOpenPositions}
                      onChange={(e) => setMaxOpenPositions(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-gray-200 focus:border-blue-500 text-base h-11 px-4"
                      placeholder="e.g., 10"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Maximum number of concurrent open positions.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="slippageTolerance" className="text-gray-300 text-sm mb-2 block">Slippage Tolerance (%)</Label>
                    <Input
                      id="slippageTolerance"
                      type="number"
                      step="0.01"
                      value={slippageTolerance}
                      onChange={(e) => setSlippageTolerance(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-gray-200 focus:border-blue-500 text-base h-11 px-4"
                      placeholder="e.g., 0.1"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Max acceptable price deviation from expected fill price.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="orderTypePreference" className="text-gray-300 text-sm mb-2 block">Default Order Type</Label>
                    <Select value={orderTypePreference} onValueChange={setOrderTypePreference}>
                      <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-gray-200 focus:border-blue-500 h-11 px-4">
                        <SelectValue placeholder="Select order type" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600 text-gray-200">
                        <SelectItem value="Market">Market Order</SelectItem>
                        <SelectItem value="Limit">Limit Order</SelectItem>
                        <SelectItem value="Stop">Stop Order</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="defaultExchange" className="text-gray-300 text-sm mb-2 block">Default Exchange</Label>
                    <Select value={defaultExchange} onValueChange={setDefaultExchange}>
                      <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-gray-200 focus:border-blue-500 h-11 px-4">
                        <SelectValue placeholder="Select an exchange" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600 text-gray-200">
                        <SelectItem value="NSE">NSE</SelectItem>
                        <SelectItem value="BSE">BSE</SelectItem>
                        <SelectItem value="MCX">MCX</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-700 my-6" />

              {/* Operational Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-300">Operational Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <div>
                    <Label htmlFor="tradingHoursStart" className="text-gray-300 text-sm mb-2 block">Trading Hours (Start)</Label>
                    <Input
                      id="tradingHoursStart"
                      type="time"
                      value={tradingHoursStart}
                      onChange={(e) => setTradingHoursStart(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-gray-200 focus:border-blue-500 text-base h-11 px-4"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tradingHoursEnd" className="text-gray-300 text-sm mb-2 block">Trading Hours (End)</Label>
                    <Input
                      id="tradingHoursEnd"
                      type="time"
                      value={tradingHoursEnd}
                      onChange={(e) => setTradingHoursEnd(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-gray-200 focus:border-blue-500 text-base h-11 px-4"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="logLevel" className="text-gray-300 text-sm mb-2 block">Logging Level</Label>
                    <Select value={logLevel} onValueChange={setLogLevel}>
                      <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-gray-200 focus:border-blue-500 h-11 px-4">
                        <SelectValue placeholder="Select log level" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600 text-gray-200">
                        <SelectItem value="DEBUG">DEBUG</SelectItem>
                        <SelectItem value="INFO">INFO</SelectItem>
                        <SelectItem value="WARNING">WARNING</SelectItem>
                        <SelectItem value="ERROR">ERROR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Strategy Management Settings Tab Content */}
        <TabsContent value="strategy">
          <Card className="bg-gray-900 border border-gray-700 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-teal-400 flex items-center gap-3">
                <Code className="w-6 h-6" /> Strategy & Model Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {/* Auto-Retraining */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-300">Model Retraining</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-retrain-switch" className="text-gray-300 text-base flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-blue-400" /> Enable Auto-Retraining
                  </Label>
                  <Switch
                    id="auto-retrain-switch"
                    checked={enableAutoRetrain}
                    onCheckedChange={setEnableAutoRetrain}
                    className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-600"
                  />
                </div>
                {enableAutoRetrain && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 border-t border-gray-800 pt-4">
                    <div>
                      <Label htmlFor="retrainFrequency" className="text-gray-400 text-sm mb-2 block">Retraining Frequency</Label>
                      <Select value={retrainFrequency} onValueChange={setRetrainFrequency}>
                        <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-gray-200 focus:border-blue-500 h-11 px-4">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600 text-gray-200">
                          <SelectItem value="Daily">Daily</SelectItem>
                          <SelectItem value="Weekly">Weekly</SelectItem>
                          <SelectItem value="Monthly">Monthly</SelectItem>
                          <SelectItem value="On Signal">On Specific Signal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="backtestingFrequency" className="text-gray-400 text-sm mb-2 block">Backtesting Frequency</Label>
                      <Select value={backtestingFrequency} onValueChange={setBacktestingFrequency}>
                        <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-gray-200 focus:border-blue-500 h-11 px-4">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600 text-gray-200">
                          <SelectItem value="Daily">Daily</SelectItem>
                          <SelectItem value="Weekly">Weekly</SelectItem>
                          <SelectItem value="On Data Update">On New Data</SelectItem>
                          <SelectItem value="Manual">Manual</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-2">
                        Frequency for re-evaluating model performance.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="bg-gray-700 my-6" />

              {/* Deployment & Version Control */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-300">Deployment & Version Control</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <div>
                    <Label htmlFor="deploymentMethod" className="text-gray-400 text-sm mb-2 block">Deployment Method</Label>
                    <Select value={deploymentMethod} onValueChange={setDeploymentMethod}>
                      <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-gray-200 focus:border-blue-500 h-11 px-4">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600 text-gray-200">
                        <SelectItem value="Live">Live Trading</SelectItem>
                        <SelectItem value="Paper Trading">Paper Trading</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-2">
                      Choose between real-money or simulated trading.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="dataRetentionDays" className="text-gray-400 text-sm mb-2 block">Data Retention for Training (Days)</Label>
                    <Input
                      id="dataRetentionDays"
                      type="number"
                      value={dataRetentionDays}
                      onChange={(e) => setDataRetentionDays(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-gray-200 focus:border-blue-500 text-base h-11 px-4"
                      placeholder="e.g., 30"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Number of days of historical data to retain for model retraining.
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="modelVersionControlEnabled" className="text-gray-300 text-base flex items-center gap-2">
                        Enable Model Version Control
                      </Label>
                      <Switch
                        id="modelVersionControlEnabled"
                        checked={modelVersionControlEnabled}
                        onCheckedChange={setModelVersionControlEnabled}
                        className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-600"
                      />
                    </div>
                    {modelVersionControlEnabled && (
                      <div>
                        <Label htmlFor="modelVersionControlSystem" className="text-gray-400 text-sm mb-2 block">Version Control System</Label>
                        <Select value={modelVersionControlSystem} onValueChange={setModelVersionControlSystem}>
                          <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-gray-200 focus:border-blue-500 h-11 px-4">
                            <SelectValue placeholder="Select system" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600 text-gray-200">
                            <SelectItem value="Git">Git</SelectItem>
                            <SelectItem value="DVC">DVC (Data Version Control)</SelectItem>
                            <SelectItem value="Custom">Custom System</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Management Tab Content */}
        <TabsContent value="data">
          <Card className="bg-gray-900 border border-gray-700 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-orange-400 flex items-center gap-3">
                <Database className="w-6 h-6" /> Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <Label htmlFor="dataSource" className="text-gray-300 text-sm mb-2 block">Data Source</Label>
                  <Select value={dataSource} onValueChange={setDataSource}>
                    <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-gray-200 focus:border-blue-500 h-11 px-4">
                      <SelectValue placeholder="Select data source" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600 text-gray-200">
                      <SelectItem value="KiteConnect">KiteConnect API</SelectItem>
                      <SelectItem value="CustomAPI">Custom Data API</SelectItem>
                      <SelectItem value="LocalFiles">Local Files</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-2">
                    Primary source for market data.
                  </p>
                </div>
                <div>
                  <Label htmlFor="dataRefreshRate" className="text-gray-300 text-sm mb-2 block">Data Refresh Rate (seconds)</Label>
                  <Input
                    id="dataRefreshRate"
                    type="number"
                    value={dataRefreshRate}
                    onChange={(e) => setDataRefreshRate(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-gray-200 focus:border-blue-500 text-base h-11 px-4"
                    placeholder="e.g., 5"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    How frequently to fetch new market data.
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="dataStorageLocation" className="text-gray-300 text-sm mb-2 block">Historical Data Storage Location</Label>
                  <Input
                    id="dataStorageLocation"
                    type="text"
                    value={dataStorageLocation}
                    onChange={(e) => setDataStorageLocation(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-gray-200 focus:border-blue-500 text-base h-11 px-4"
                    placeholder="/data/historical/"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Path or URL to your stored historical data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Optimization Tab Content */}
        <TabsContent value="performance">
          <Card className="bg-gray-900 border border-gray-700 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-pink-400 flex items-center gap-3">
                <Cpu className="w-6 h-6" /> Performance Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enableGpuAcceleration" className="text-gray-300 text-base flex items-center gap-2">
                  Enable GPU Acceleration
                </Label>
                <Switch
                  id="enableGpuAcceleration"
                  checked={enableGpuAcceleration}
                  onCheckedChange={setEnableGpuAcceleration}
                  className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-600"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 border-t border-gray-800 pt-4">
                <div>
                  <Label htmlFor="parallelProcessingCores" className="text-gray-300 text-sm mb-2 block">Parallel Processing Cores</Label>
                  <Input
                    id="parallelProcessingCores"
                    type="number"
                    value={parallelProcessingCores}
                    onChange={(e) => setParallelProcessingCores(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-gray-200 focus:border-blue-500 text-base h-11 px-4"
                    placeholder="e.g., 4"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Number of CPU cores to utilize for parallel computations.
                  </p>
                </div>
                <div>
                  <Label htmlFor="memoryLimitGB" className="text-gray-300 text-sm mb-2 block">Memory Limit (GB)</Label>
                  <Input
                    id="memoryLimitGB"
                    type="number"
                    value={memoryLimitGB}
                    onChange={(e) => setMemoryLimitGB(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-gray-200 focus:border-blue-500 text-base h-11 px-4"
                    placeholder="e.g., 8"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Maximum RAM (in GB) the bot is allowed to consume.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Settings Button - outside tabs as it applies to all */}
      <div className="flex justify-center mt-8">
        <Button
          variant="default"
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold transition-colors"
          onClick={handleSaveSettings}
        >
          <Save className="w-5 h-5 mr-2" /> Save All Settings
        </Button>
      </div>

      <div className="text-center text-sm text-gray-600 py-6 mt-8">
        ML Trading Bot Configuration | Data for demonstration purposes only.
      </div>
    </div>
  );
}