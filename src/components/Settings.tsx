"use client";

import React from "react";
import {
  Bell,
  Code,
  Cpu,
  Database,
  ExternalLink,
  Key,
  MessageSquare,
  RefreshCcw,
  Save,
  Send,
  Shield,
  TestTube2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "signal-execution-desk-settings";

type SettingsState = {
  zerodha: {
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    redirectUrl: string;
    brokerageType: string;
    environment: string;
  };
  notifications: {
    frequency: string;
    telegramEnabled: boolean;
    telegramBotToken: string;
    telegramChatId: string;
    whatsappEnabled: boolean;
    whatsappApiUrl: string;
    whatsappPhoneNumber: string;
    notifyTradeExecution: boolean;
    notifyPnlThreshold: boolean;
    pnlThresholdValue: string;
    notifyErrorAlerts: boolean;
  };
  general: {
    riskPerTrade: string;
    maxDailyLoss: string;
    maxOpenPositions: string;
    slippageTolerance: string;
    orderTypePreference: string;
    defaultExchange: string;
    tradingHoursStart: string;
    tradingHoursEnd: string;
    logLevel: string;
    tradingMode: string;
  };
  strategy: {
    enableAutoRetrain: boolean;
    retrainFrequency: string;
    backtestingFrequency: string;
    deploymentMethod: string;
    dataRetentionDays: string;
    modelVersionControlEnabled: boolean;
    modelVersionControlSystem: string;
  };
  data: {
    dataSource: string;
    dataRefreshRate: string;
    dataStorageLocation: string;
    candleInterval: string;
    websocketMode: string;
  };
  performance: {
    enableGpuAcceleration: boolean;
    parallelProcessingCores: string;
    memoryLimitGB: string;
    websocketBufferSize: string;
    dbBatchSize: string;
  };
};

type SectionKey = keyof SettingsState;
type FieldConfig = {
  key: string;
  label: string;
  type: "text" | "password" | "url" | "tel" | "number" | "time" | "select";
  placeholder?: string;
  step?: string;
  readOnly?: boolean;
  hint?: string;
  options?: Array<{ value: string; label: string }>;
};
type SwitchConfig = {
  key: string;
  label: string;
  icon?: React.ElementType;
  hint?: string;
};

const defaultSettings: SettingsState = {
  zerodha: {
    apiKey: "",
    apiSecret: "",
    accessToken: "",
    redirectUrl: "http://localhost:8000/api/auth/zerodha/callback",
    brokerageType: "Flat",
    environment: "Paper",
  },
  notifications: {
    frequency: "Instant",
    telegramEnabled: true,
    telegramBotToken: "",
    telegramChatId: "",
    whatsappEnabled: false,
    whatsappApiUrl: "",
    whatsappPhoneNumber: "",
    notifyTradeExecution: true,
    notifyPnlThreshold: false,
    pnlThresholdValue: "1000",
    notifyErrorAlerts: true,
  },
  general: {
    riskPerTrade: "1.0",
    maxDailyLoss: "5000",
    maxOpenPositions: "10",
    slippageTolerance: "0.1",
    orderTypePreference: "Market",
    defaultExchange: "NSE",
    tradingHoursStart: "09:15",
    tradingHoursEnd: "15:30",
    logLevel: "INFO",
    tradingMode: "Paper",
  },
  strategy: {
    enableAutoRetrain: true,
    retrainFrequency: "Daily",
    backtestingFrequency: "Weekly",
    deploymentMethod: "Paper Trading",
    dataRetentionDays: "30",
    modelVersionControlEnabled: true,
    modelVersionControlSystem: "Git",
  },
  data: {
    dataSource: "KiteConnect",
    dataRefreshRate: "5",
    dataStorageLocation: "/data/historical/",
    candleInterval: "1m",
    websocketMode: "Ticks + Candles + Indicators",
  },
  performance: {
    enableGpuAcceleration: false,
    parallelProcessingCores: "4",
    memoryLimitGB: "8",
    websocketBufferSize: "20000",
    dbBatchSize: "1000",
  },
};

const tabClass =
  "min-h-12 gap-2 rounded-md text-xs text-gray-300 hover:bg-gray-800 hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white sm:text-sm";
const inputClass =
  "h-11 border-gray-700 bg-gray-950 text-gray-100 placeholder:text-gray-600 focus-visible:ring-blue-500";
const selectContentClass = "z-[100] border-gray-700 bg-gray-950 text-gray-100";

const mergeSettings = (saved: Partial<SettingsState>): SettingsState => ({
  zerodha: { ...defaultSettings.zerodha, ...saved.zerodha },
  notifications: { ...defaultSettings.notifications, ...saved.notifications },
  general: { ...defaultSettings.general, ...saved.general },
  strategy: { ...defaultSettings.strategy, ...saved.strategy },
  data: { ...defaultSettings.data, ...saved.data },
  performance: { ...defaultSettings.performance, ...saved.performance },
});

const readSettings = () => {
  if (typeof window === "undefined") return defaultSettings;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? mergeSettings(JSON.parse(raw)) : defaultSettings;
  } catch {
    return defaultSettings;
  }
};

const buildBackendPayload = (settings: SettingsState) => ({
  zerodha: settings.zerodha,
  notifications: {
    telegram: {
      enabled: settings.notifications.telegramEnabled,
      botToken: settings.notifications.telegramBotToken,
      chatId: settings.notifications.telegramChatId,
    },
    whatsapp: {
      enabled: settings.notifications.whatsappEnabled,
      apiUrl: settings.notifications.whatsappApiUrl,
      phoneNumber: settings.notifications.whatsappPhoneNumber,
    },
    frequency: settings.notifications.frequency,
    notifyTradeExecution: settings.notifications.notifyTradeExecution,
    notifyPnlThreshold: settings.notifications.notifyPnlThreshold,
    pnlThresholdValue: Number(settings.notifications.pnlThresholdValue || 0),
    notifyErrorAlerts: settings.notifications.notifyErrorAlerts,
  },
  trading: {
    riskPerTrade: Number(settings.general.riskPerTrade || 0),
    maxDailyLoss: Number(settings.general.maxDailyLoss || 0),
    maxOpenPositions: Number(settings.general.maxOpenPositions || 0),
    slippageTolerance: Number(settings.general.slippageTolerance || 0),
    orderTypePreference: settings.general.orderTypePreference,
    defaultExchange: settings.general.defaultExchange,
    tradingHours: {
      start: settings.general.tradingHoursStart,
      end: settings.general.tradingHoursEnd,
    },
    logLevel: settings.general.logLevel,
    tradingMode: settings.general.tradingMode,
  },
  strategy: {
    ...settings.strategy,
    dataRetentionDays: Number(settings.strategy.dataRetentionDays || 0),
  },
  data: {
    ...settings.data,
    dataRefreshRate: Number(settings.data.dataRefreshRate || 0),
  },
  performance: {
    enableGpuAcceleration: settings.performance.enableGpuAcceleration,
    parallelProcessingCores: Number(settings.performance.parallelProcessingCores || 0),
    memoryLimitGB: Number(settings.performance.memoryLimitGB || 0),
    websocketBufferSize: Number(settings.performance.websocketBufferSize || 0),
    dbBatchSize: Number(settings.performance.dbBatchSize || 0),
  },
});

const tabItems = [
  { value: "zerodha", label: "Zerodha", shortLabel: "Broker", icon: Key },
  { value: "notifications", label: "Notifications", shortLabel: "Alerts", icon: Bell },
  { value: "general", label: "General Trading", shortLabel: "Rules", icon: Shield },
  { value: "strategy", label: "Strategy & Models", shortLabel: "Models", icon: Code },
  { value: "data", label: "Data Management", shortLabel: "Data", icon: Database },
  { value: "performance", label: "Performance", shortLabel: "Perf", icon: Cpu },
];

const fieldGroups: Record<SectionKey, Array<{ title: string; fields: FieldConfig[]; switches?: SwitchConfig[] }>> = {
  zerodha: [
    {
      title: "Kite Connect",
      fields: [
        { key: "apiKey", label: "API Key", type: "text", placeholder: "Kite Connect API key" },
        { key: "apiSecret", label: "API Secret", type: "password", placeholder: "Kite Connect API secret" },
        { key: "accessToken", label: "Access Token", type: "password", placeholder: "Generated after OAuth callback" },
        {
          key: "redirectUrl",
          label: "Redirect URL",
          type: "url",
          placeholder: "http://localhost:8000/api/auth/zerodha/callback",
          hint: "This must match the callback configured in the Kite Connect developer console.",
        },
        {
          key: "brokerageType",
          label: "Brokerage Type",
          type: "select",
          options: [
            { value: "Flat", label: "Flat Fee" },
            { value: "Percentage", label: "Percentage Based" },
          ],
        },
        {
          key: "environment",
          label: "Execution Environment",
          type: "select",
          options: [
            { value: "Paper", label: "Paper Trading" },
            { value: "Live", label: "Live Trading" },
          ],
        },
      ],
    },
  ],
  notifications: [
    {
      title: "Delivery Rules",
      fields: [
        {
          key: "frequency",
          label: "Notification Frequency",
          type: "select",
          options: [
            { value: "Instant", label: "Instant" },
            { value: "Hourly", label: "Hourly Summary" },
            { value: "Daily", label: "Daily Summary" },
          ],
        },
      ],
      switches: [
        { key: "notifyTradeExecution", label: "Trade Execution Alerts" },
        { key: "notifyPnlThreshold", label: "P&L Threshold Alerts" },
        { key: "notifyErrorAlerts", label: "Critical Error Alerts" },
      ],
    },
    {
      title: "Telegram",
      fields: [
        { key: "telegramBotToken", label: "Bot Token", type: "password", placeholder: "123456:ABC-DEF..." },
        { key: "telegramChatId", label: "Chat ID", type: "text", placeholder: "-1234567890 or user ID" },
      ],
      switches: [{ key: "telegramEnabled", label: "Enable Telegram", icon: MessageSquare }],
    },
    {
      title: "WhatsApp",
      fields: [
        { key: "whatsappApiUrl", label: "Provider API URL", type: "url", placeholder: "Twilio or WhatsApp Business endpoint" },
        { key: "whatsappPhoneNumber", label: "Recipient Phone", type: "tel", placeholder: "919876543210" },
        { key: "pnlThresholdValue", label: "P&L Threshold (INR)", type: "number", step: "100", placeholder: "1000" },
      ],
      switches: [{ key: "whatsappEnabled", label: "Enable WhatsApp", icon: Send }],
    },
  ],
  general: [
    {
      title: "Risk Management",
      fields: [
        { key: "riskPerTrade", label: "Risk Per Trade (%)", type: "number", step: "0.1", placeholder: "1.0" },
        { key: "maxDailyLoss", label: "Maximum Daily Loss (INR)", type: "number", step: "100", placeholder: "5000" },
        { key: "maxOpenPositions", label: "Max Open Positions", type: "number", placeholder: "10" },
        { key: "slippageTolerance", label: "Slippage Tolerance (%)", type: "number", step: "0.01", placeholder: "0.1" },
      ],
    },
    {
      title: "Execution",
      fields: [
        {
          key: "orderTypePreference",
          label: "Default Order Type",
          type: "select",
          options: [
            { value: "Market", label: "Market" },
            { value: "Limit", label: "Limit" },
            { value: "Stop", label: "Stop" },
          ],
        },
        {
          key: "defaultExchange",
          label: "Default Exchange",
          type: "select",
          options: [
            { value: "NSE", label: "NSE" },
            { value: "BSE", label: "BSE" },
            { value: "MCX", label: "MCX" },
          ],
        },
        { key: "tradingHoursStart", label: "Trading Start", type: "time" },
        { key: "tradingHoursEnd", label: "Trading End", type: "time" },
        {
          key: "logLevel",
          label: "Log Level",
          type: "select",
          options: [
            { value: "DEBUG", label: "DEBUG" },
            { value: "INFO", label: "INFO" },
            { value: "WARNING", label: "WARNING" },
            { value: "ERROR", label: "ERROR" },
          ],
        },
        {
          key: "tradingMode",
          label: "Trading Mode",
          type: "select",
          options: [
            { value: "Paper", label: "Paper" },
            { value: "Live", label: "Live" },
          ],
        },
      ],
    },
  ],
  strategy: [
    {
      title: "Model Lifecycle",
      fields: [
        {
          key: "retrainFrequency",
          label: "Retraining Frequency",
          type: "select",
          options: [
            { value: "Daily", label: "Daily" },
            { value: "Weekly", label: "Weekly" },
            { value: "Monthly", label: "Monthly" },
            { value: "On Signal", label: "On Signal" },
          ],
        },
        {
          key: "backtestingFrequency",
          label: "Backtesting Frequency",
          type: "select",
          options: [
            { value: "Daily", label: "Daily" },
            { value: "Weekly", label: "Weekly" },
            { value: "On Data Update", label: "On Data Update" },
            { value: "Manual", label: "Manual" },
          ],
        },
        {
          key: "deploymentMethod",
          label: "Deployment Method",
          type: "select",
          options: [
            { value: "Paper Trading", label: "Paper Trading" },
            { value: "Live", label: "Live Trading" },
          ],
        },
        { key: "dataRetentionDays", label: "Training Data Retention (Days)", type: "number", placeholder: "30" },
        {
          key: "modelVersionControlSystem",
          label: "Version Control System",
          type: "select",
          options: [
            { value: "Git", label: "Git" },
            { value: "DVC", label: "DVC" },
            { value: "Custom", label: "Custom" },
          ],
        },
      ],
      switches: [
        { key: "enableAutoRetrain", label: "Enable Auto-Retraining" },
        { key: "modelVersionControlEnabled", label: "Enable Model Version Control" },
      ],
    },
  ],
  data: [
    {
      title: "Market Data",
      fields: [
        {
          key: "dataSource",
          label: "Primary Data Source",
          type: "select",
          options: [
            { value: "KiteConnect", label: "Kite Connect" },
            { value: "CustomAPI", label: "Custom API" },
            { value: "LocalFiles", label: "Local Files" },
          ],
        },
        { key: "dataRefreshRate", label: "Refresh Rate (Seconds)", type: "number", placeholder: "5" },
        { key: "dataStorageLocation", label: "Historical Data Location", type: "text", placeholder: "/data/historical/" },
        {
          key: "candleInterval",
          label: "Default Candle Interval",
          type: "select",
          options: [
            { value: "1m", label: "1 Minute" },
            { value: "5m", label: "5 Minutes" },
            { value: "15m", label: "15 Minutes" },
            { value: "1h", label: "1 Hour" },
            { value: "1d", label: "1 Day" },
          ],
        },
        {
          key: "websocketMode",
          label: "Frontend Stream Mode",
          type: "select",
          options: [
            { value: "Ticks Only", label: "Ticks Only" },
            { value: "Ticks + Candles", label: "Ticks + Candles" },
            { value: "Ticks + Candles + Indicators", label: "Ticks + Candles + Indicators" },
          ],
        },
      ],
    },
  ],
  performance: [
    {
      title: "Runtime Limits",
      fields: [
        { key: "parallelProcessingCores", label: "Parallel Processing Cores", type: "number", placeholder: "4" },
        { key: "memoryLimitGB", label: "Memory Limit (GB)", type: "number", placeholder: "8" },
        { key: "websocketBufferSize", label: "WebSocket Buffer Size", type: "number", placeholder: "20000" },
        { key: "dbBatchSize", label: "DB Batch Size", type: "number", placeholder: "1000" },
      ],
      switches: [{ key: "enableGpuAcceleration", label: "Enable GPU Acceleration" }],
    },
  ],
};

function SettingsField({
  section,
  field,
  settings,
  onChange,
}: {
  section: SectionKey;
  field: FieldConfig;
  settings: SettingsState;
  onChange: (section: SectionKey, key: string, value: string | boolean) => void;
}) {
  const value = String(settings[section][field.key] ?? "");
  const fieldId = `${section}-${field.key}`;

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className="text-sm text-gray-300">
        {field.label}
      </Label>
      {field.type === "select" ? (
        <Select value={value} onValueChange={(next) => onChange(section, field.key, next)}>
          <SelectTrigger id={fieldId} className={inputClass}>
            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent className={selectContentClass}>
            {(field.options ?? []).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={fieldId}
          type={field.type}
          step={field.step}
          value={value}
          readOnly={field.readOnly}
          placeholder={field.placeholder}
          onChange={(event) => onChange(section, field.key, event.target.value)}
          className={inputClass}
        />
      )}
      {field.hint ? <p className="text-xs leading-5 text-gray-500">{field.hint}</p> : null}
    </div>
  );
}

function SettingsSwitch({
  section,
  item,
  settings,
  onChange,
}: {
  section: SectionKey;
  item: SwitchConfig;
  settings: SettingsState;
  onChange: (section: SectionKey, key: string, value: string | boolean) => void;
}) {
  const Icon = item.icon;
  const switchId = `${section}-${item.key}`;

  return (
    <div className="flex min-h-11 items-center justify-between gap-4 rounded-md border border-gray-800 bg-gray-950/70 px-3 py-2">
      <Label htmlFor={switchId} className="flex items-center gap-2 text-sm text-gray-300">
        {Icon ? <Icon className="h-4 w-4 text-blue-400" /> : null}
        {item.label}
      </Label>
      <Switch
        id={switchId}
        checked={Boolean(settings[section][item.key])}
        onCheckedChange={(checked) => onChange(section, item.key, checked)}
        className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-700"
      />
    </div>
  );
}

function SettingsSection({
  section,
  title,
  icon: Icon,
  settings,
  onChange,
}: {
  section: SectionKey;
  title: string;
  icon: React.ElementType;
  settings: SettingsState;
  onChange: (section: SectionKey, key: string, value: string | boolean) => void;
}) {
  return (
    <Card className="border-gray-800 bg-gray-900 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-100">
          <Icon className="h-5 w-5 text-blue-400" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {fieldGroups[section].map((group, index) => (
          <div key={group.title} className="space-y-4">
            {index > 0 ? <Separator className="bg-gray-800" /> : null}
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{group.title}</h3>
            {group.switches?.length ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {group.switches.map((item) => (
                  <SettingsSwitch
                    key={item.key}
                    section={section}
                    item={item}
                    settings={settings}
                    onChange={onChange}
                  />
                ))}
              </div>
            ) : null}
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              {group.fields.map((field) => (
                <SettingsField
                  key={field.key}
                  section={section}
                  field={field}
                  settings={settings}
                  onChange={onChange}
                />
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<SectionKey>("zerodha");
  const [settings, setSettings] = React.useState<SettingsState>(readSettings);
  const [lastSavedAt, setLastSavedAt] = React.useState<string | null>(null);

  const updateSetting = React.useCallback((section: SectionKey, key: string, value: string | boolean) => {
    setSettings((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [key]: value,
      },
    }));
  }, []);

  const handleSaveSettings = () => {
    const payload = buildBackendPayload(settings);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setLastSavedAt(new Date().toLocaleTimeString("en-IN", { hour12: false }));
    console.info("Prepared backend settings payload:", payload);
    toast({
      title: "Settings saved",
      description: "Saved locally. The backend settings API still needs to be wired.",
    });
  };

  const handleResetSettings = () => {
    setSettings(defaultSettings);
    window.localStorage.removeItem(STORAGE_KEY);
    setLastSavedAt(null);
    toast({
      title: "Settings reset",
      description: "Defaults restored for all settings tabs.",
    });
  };

  const handleTestCurrentTab = () => {
    toast({
      title: `${tabItems.find((item) => item.value === activeTab)?.label} checked`,
      description: "The controls are responding. Backend validation is listed in the integration document.",
    });
  };

  const handleZerodhaAuth = () => {
    const apiKey = settings.zerodha.apiKey.trim();
    if (!apiKey) {
      toast({
        title: "API key required",
        description: "Enter your Kite Connect API key before starting authentication.",
        variant: "destructive",
      });
      return;
    }

    window.open(`https://kite.trade/connect/login?api_key=${encodeURIComponent(apiKey)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-black p-4 text-gray-100 sm:p-6">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 border-b border-gray-800 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Settings</h2>
            <p className="mt-1 text-sm text-gray-500">
              Configure broker access, execution limits, data streams, notifications, and runtime tuning.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeTab === "zerodha" ? (
              <Button
                variant="outline"
                onClick={handleZerodhaAuth}
                className="border-blue-500 text-blue-300 hover:bg-blue-950 hover:text-blue-100"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Authenticate
              </Button>
            ) : null}
            <Button
              variant="outline"
              onClick={handleTestCurrentTab}
              className="border-gray-700 text-gray-200 hover:bg-gray-800 hover:text-white"
            >
              <TestTube2 className="mr-2 h-4 w-4" />
              Test Tab
            </Button>
            <Button
              variant="outline"
              onClick={handleResetSettings}
              className="border-gray-700 text-gray-200 hover:bg-gray-800 hover:text-white"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button onClick={handleSaveSettings} className="bg-green-600 text-white hover:bg-green-700">
              <Save className="mr-2 h-4 w-4" />
              Save All
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SectionKey)} className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-lg border border-gray-800 bg-gray-950 p-2 sm:grid-cols-3 xl:grid-cols-6">
            {tabItems.map((item) => {
              const Icon = item.icon;
              return (
                <TabsTrigger key={item.value} value={item.value} className={tabClass}>
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden">{item.shortLabel}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {tabItems.map((item) => (
            <TabsContent key={item.value} value={item.value} className="mt-6">
              <SettingsSection
                section={item.value as SectionKey}
                title={item.label}
                icon={item.icon}
                settings={settings}
                onChange={updateSetting}
              />
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex flex-col justify-between gap-2 border-t border-gray-900 pt-4 text-xs text-gray-600 sm:flex-row">
          <span>Prepared for Go-project integration. Secrets are local only until a secure backend settings API exists.</span>
          {lastSavedAt ? <span>Last saved at {lastSavedAt}</span> : <span>Not saved in this session</span>}
        </div>
      </div>
    </div>
  );
}
