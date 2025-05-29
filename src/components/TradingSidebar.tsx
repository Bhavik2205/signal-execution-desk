
import React from 'react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarHeader
} from "@/components/ui/sidebar";
import { 
  BarChart3, 
  TrendingUp, 
  Settings, 
  LogIn,
  Star,
  Search,
  FileText,
  ChartLine
} from "lucide-react";
import type { DashboardSection } from './TradingDashboard';

interface TradingSidebarProps {
  activeSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
}

const menuItems = [
  {
    title: "Dashboard",
    section: 'overview' as DashboardSection,
    icon: BarChart3,
  },
  {
    title: "Market Data",
    section: 'market' as DashboardSection,
    icon: ChartLine,
  },
  {
    title: "Positions",
    section: 'positions' as DashboardSection,
    icon: TrendingUp,
  },
  {
    title: "Orders",
    section: 'orders' as DashboardSection,
    icon: FileText,
  },
  {
    title: "Strategies",
    section: 'strategies' as DashboardSection,
    icon: Star,
  },
  {
    title: "ML Models",
    section: 'ml-models' as DashboardSection,
    icon: Search,
  },
  {
    title: "Sentiment",
    section: 'sentiment' as DashboardSection,
    icon: TrendingUp,
  },
  {
    title: "Backtest",
    section: 'backtest' as DashboardSection,
    icon: BarChart3,
  },
  {
    title: "Settings",
    section: 'settings' as DashboardSection,
    icon: Settings,
  },
];

export function TradingSidebar({ activeSection, onSectionChange }: TradingSidebarProps) {
  return (
    <Sidebar className="bg-trading-bg-light border-r border-trading-bg-card">
      <SidebarHeader className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-trading-text">AlgoTrader</h1>
            <p className="text-xs text-trading-text-muted">ML-Powered Trading</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-trading-text-muted text-xs uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.section}>
                  <SidebarMenuButton 
                    onClick={() => onSectionChange(item.section)}
                    className={`w-full justify-start text-trading-text hover:bg-trading-bg-card transition-colors ${
                      activeSection === item.section ? 'bg-trading-bg-card border-l-2 border-blue-500' : ''
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
