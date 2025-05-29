
import React, { useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { TradingSidebar } from './TradingSidebar';
import { DashboardHeader } from './DashboardHeader';
import { MarketOverview } from './MarketOverview';
import { PositionsPanel } from './PositionsPanel';
import { OrdersPanel } from './OrdersPanel';
import { StrategyPanel } from './StrategyPanel';
import { MLModelsPanel } from './MLModelsPanel';
import { SentimentPanel } from './SentimentPanel';

export type DashboardSection = 'overview' | 'market' | 'positions' | 'orders' | 'strategies' | 'ml-models' | 'sentiment' | 'backtest' | 'settings';

const TradingDashboard = () => {
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <MarketOverview />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PositionsPanel />
              <OrdersPanel />
            </div>
          </div>
        );
      case 'market':
        return <MarketOverview />;
      case 'positions':
        return <PositionsPanel />;
      case 'orders':
        return <OrdersPanel />;
      case 'strategies':
        return <StrategyPanel />;
      case 'ml-models':
        return <MLModelsPanel />;
      case 'sentiment':
        return <SentimentPanel />;
      case 'backtest':
        return <div className="trading-card">Backtesting Module Coming Soon</div>;
      case 'settings':
        return <div className="trading-card">Settings Panel Coming Soon</div>;
      default:
        return <MarketOverview />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-trading-bg">
        <TradingSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <div className="flex-1 overflow-auto p-6">
            {renderActiveSection()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default TradingDashboard;
