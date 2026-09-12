
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

export type DashboardSection = 'overview' | 'broker-integration' | 'market' | 'positions' | 'strategies' | 'execution' | 'ml-models' | 'sentiment' | 'backtest' | 'settings';

const TradingDashboard = () => {
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview');
  const [brokerConnectionStatus, setBrokerConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const brokerConnectRef = useRef<() => void>(() => {});

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <MarketOverview />
          </div>
        );
      case 'broker-integration':
        return <BrokerIntegrationPanel/>;
      case 'market':
        return <MarketDataPage />;
      case 'positions':
        // Live data from the Go API. PositionsPanel is kept as the original
        // mock-data reference but is no longer routed to.
        return <LivePositionsPanel />;
      case 'strategies':
        return <LiveStrategyPanel />;
      case 'execution':
        return <ExecutionPanel />;
      case 'ml-models':
        return <MLModelsPanel />;
      case 'sentiment':
        return <SentimentPanel />;
      case 'backtest':
        return <div className="trading-card">Backtesting Module Coming Soon</div>;
      case 'settings':
        return <SettingsPage />;
      default:
        return <MarketOverview />;
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
