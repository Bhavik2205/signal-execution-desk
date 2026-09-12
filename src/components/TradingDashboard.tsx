
import React, { useRef, useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { TradingSidebar } from './TradingSidebar';
import { DashboardHeader } from './DashboardHeader';
import { MarketOverview } from './MarketOverview';
import { PositionsPanel } from './PositionsPanel';
import { StrategyPanel } from './StrategyPanel';
import { MLModelsPanel } from './MLModelsPanel';
import { SentimentPanel } from './SentimentPanel';
import { BrokerIntegrationPanel } from './BrokerIntegration';
import MarketDataPage from './MarketData';
import { SettingsPage } from './Settings';
import { LivePositionsPanel } from './LivePositionsPanel';
import { LiveStrategyPanel } from './LiveStrategyPanel';
import { ExecutionPanel } from './ExecutionPanel';
import { LiveMarketOverview } from './LiveMarketOverview';
import { LiveSentimentPanel } from './LiveSentimentPanel';
import { LiveModelsPanel } from './LiveModelsPanel';
import { LiveBrokerPanel } from './LiveBrokerPanel';
import { LiveMarketData } from './LiveMarketData';
import { BacktestPanel } from './BacktestPanel';
import { NotificationsPanel } from './NotificationsPanel';
import { LiveSettingsPanel } from './LiveSettingsPanel';

export type DashboardSection = 'overview' | 'broker-integration' | 'market' | 'positions' | 'strategies' | 'execution' | 'notifications' | 'ml-models' | 'sentiment' | 'backtest' | 'settings';

const TradingDashboard = () => {
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview');
  const [brokerConnectionStatus, setBrokerConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const brokerConnectRef = useRef<() => void>(() => {});

  // Every section below is backed by the Go API. The original mock-data
  // components (MarketOverview, PositionsPanel, StrategyPanel, MLModelsPanel,
  // SentimentPanel, BrokerIntegrationPanel, MarketDataPage) are kept in the
  // tree as references but are no longer routed to.
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return <LiveMarketOverview />;
      case 'broker-integration':
        return <LiveBrokerPanel />;
      case 'market':
        return <LiveMarketData />;
      case 'positions':
        return <LivePositionsPanel />;
      case 'strategies':
        return <LiveStrategyPanel />;
      case 'execution':
        return <ExecutionPanel />;
      case 'ml-models':
        return <LiveModelsPanel />;
      case 'sentiment':
        return <LiveSentimentPanel />;
      case 'backtest':
        return <BacktestPanel />;
      case 'notifications':
        return <NotificationsPanel />;
      case 'settings':
        return <LiveSettingsPanel />;
      default:
        return <LiveMarketOverview />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-trading-bg">
        <TradingSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader
            brokerConnectionStatus={brokerConnectionStatus}
            setBrokerConnectionStatus={setBrokerConnectionStatus}
            brokerConnectRef={brokerConnectRef}
          />
          <div className="flex-1 overflow-auto p-6">
            {renderActiveSection()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default TradingDashboard;
