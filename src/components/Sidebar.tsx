import React from 'react';
import { 
  Coffee, 
  LayoutDashboard, 
  Receipt, 
  Package, 
  Users, 
  CreditCard, 
  TrendingUp, 
  Sparkles, 
  Settings, 
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export type NavItem = 
  | 'overview' 
  | 'sales' 
  | 'products' 
  | 'customers' 
  | 'expenses' 
  | 'analytics' 
  | 'ai' 
  | 'settings';

interface SidebarProps {
  activeTab: NavItem;
  setActiveTab: (tab: NavItem) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onOpenDemoModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileOpen,
  setIsMobileOpen,
  onOpenDemoModal,
}) => {
  const { user, logout } = useAuth();

  const navItems: { id: NavItem; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'sales', label: 'Sales', icon: <Receipt className="w-4 h-4" /> },
    { id: 'products', label: 'Products', icon: <Package className="w-4 h-4" /> },
    { id: 'customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
    { id: 'expenses', label: 'Expenses', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'ai', label: 'AI Analyst', icon: <Sparkles className="w-4 h-4" />, badge: 'Gemini' },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleSelect = (tab: NavItem) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-[#241812]/50 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#241812] text-[#FFFCF7] flex flex-col transition-transform duration-300 ease-in-out border-r border-[#38261c]
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo & Cafe Header */}
        <div className="p-6 border-b border-[#38261c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#6F4E37] flex items-center justify-center text-[#FFFCF7] shadow-md shadow-[#6F4E37]/30">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight font-display text-white">Brewlytics</span>
              <span className="block text-[10px] text-[#9B8778] uppercase tracking-wider font-semibold">Specialty Intel</span>
            </div>
          </div>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 text-[#9B8778] hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Café Banner */}
        <div className="px-6 py-4 bg-[#1b120d] border-b border-[#38261c]/50">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <p className="text-[11px] uppercase tracking-wider text-[#9B8778] font-bold">Active Roastery</p>
              <p className="text-xs font-semibold text-white truncate">{user?.cafeName || 'Specialty Coffee Bar'}</p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#7A9E65]/20 text-[#7A9E65] border border-[#7A9E65]/30">
              Live
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`
                  w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all
                  ${isActive 
                    ? 'bg-[#6F4E37] text-white shadow-sm shadow-[#6F4E37]/40' 
                    : 'text-[#c5b4a4] hover:text-white hover:bg-[#2f2018]'}
                `}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-[#9B8778]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    isActive ? 'bg-[#241812] text-[#7A9E65]' : 'bg-[#7A9E65]/20 text-[#7A9E65]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Demo Data Quick Action */}
        <div className="px-4 py-3 border-t border-[#38261c]">
          <button
            type="button"
            onClick={onOpenDemoModal}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#2d1e16] hover:bg-[#3d2a1f] border border-[#4d3527] rounded-xl text-[11px] font-semibold text-[#e0cfbe] transition-colors"
          >
            <span>Demo Data / Reset</span>
          </button>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-[#38261c] flex items-center justify-between bg-[#1f150f]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#6F4E37] text-white text-xs font-bold flex items-center justify-center shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'B'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Barista'}</p>
              <p className="text-[10px] text-[#9B8778] truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 text-[#9B8778] hover:text-red-400 hover:bg-[#2d1e16] rounded-lg transition-colors shrink-0"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
