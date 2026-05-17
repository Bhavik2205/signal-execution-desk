import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  TrendingUp,
  Settings,
  Star,
  ChartLine,
  Shield,
  Brain,
  Newspaper,
  Clock,
  UserCircle,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardSection } from './TradingDashboard';
import { getStoredUser } from '@/lib/auth';
import { logoutApi } from '@/lib/api';

interface TradingSidebarProps {
  activeSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
}

const menuItems = [
  { title: "Dashboard",          section: 'overview'          as DashboardSection, icon: BarChart3   },
  { title: "Broker Integration", section: 'broker-integration' as DashboardSection, icon: Shield      },
  { title: "Market Data",        section: 'market'            as DashboardSection, icon: ChartLine   },
  { title: "Positions & Orders", section: 'positions'         as DashboardSection, icon: TrendingUp  },
  { title: "Strategies",         section: 'strategies'        as DashboardSection, icon: Star        },
  { title: "ML Predictions",     section: 'ml-models'         as DashboardSection, icon: Brain       },
  { title: "Sentiment Analysis", section: 'sentiment'         as DashboardSection, icon: Newspaper   },
  { title: "Backtest",           section: 'backtest'          as DashboardSection, icon: Clock       },
  { title: "Settings",           section: 'settings'          as DashboardSection, icon: Settings    },
];

export function TradingSidebar({ activeSection, onSectionChange }: TradingSidebarProps) {
  const navigate = useNavigate();

  const user = getStoredUser();
  const displayName = user?.userName || user?.email || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await logoutApi();
    navigate('/login');
  };

  return (
    <Sidebar className="bg-trading-bg-light border-r border-trading-bg-card flex flex-col">
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

      <SidebarContent className="px-3 flex-1">
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

      <SidebarFooter className="p-3 border-t border-trading-bg-card">
        {/* User row — click to go to profile */}
        <button
          onClick={() => onSectionChange('profile')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-trading-bg-card ${
            activeSection === 'profile' ? 'bg-trading-bg-card border-l-2 border-blue-500' : ''
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-trading-text text-sm font-medium truncate">{displayName}</p>
            <p className="text-trading-text-muted text-xs truncate">{user?.email}</p>
          </div>
          <UserCircle className="w-4 h-4 text-trading-text-muted shrink-0" />
        </button>

        {/* Logout */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start mt-1 text-trading-loss hover:bg-red-500/10 hover:text-trading-loss"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
