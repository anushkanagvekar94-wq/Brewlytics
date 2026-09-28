import React from 'react';
import { Menu, Plus, Calendar, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface TopHeaderProps {
  period: 'today' | '7d' | '30d' | '90d' | 'all';
  setPeriod: (period: 'today' | '7d' | '30d' | '90d' | 'all') => void;
  onOpenMobileMenu: () => void;
  onQuickAddSale?: () => void;
  onOpenDemoModal?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  period,
  setPeriod,
  onOpenMobileMenu,
  onQuickAddSale,
  onOpenDemoModal,
}) => {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const periodOptions: { id: 'today' | '7d' | '30d' | '90d' | 'all'; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
    { id: 'all', label: 'All Time' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#F7F1E8]/95 backdrop-blur-md border-b border-[#EADBCE] px-4 sm:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      {/* Left: Mobile trigger & Greeting */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-[#241812] bg-[#FFFCF7] border border-[#EADBCE] rounded-xl hover:bg-white"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold font-display text-[#241812] leading-tight">
            {getGreeting()}, {user?.name ? user.name.split(' ')[0] : 'Partner'}
          </h1>
          <p className="text-[11px] text-[#9B8778] hidden sm:block">
            {user?.cafeName || 'Specialty Coffee Bar'} • Real-Time Database Metrics
          </p>
        </div>
      </div>

      {/* Right: Date Range Filter & Actions */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {/* Date Filter Pills */}
        <div className="flex items-center p-1 bg-[#FFFCF7] border border-[#EADBCE] rounded-xl shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-[#9B8778] ml-2 mr-1 hidden sm:inline" />
          {periodOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setPeriod(opt.id)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                period === opt.id
                  ? 'bg-[#241812] text-[#FFFCF7] shadow-xs'
                  : 'text-[#9B8778] hover:text-[#241812]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Demo Data button */}
        {onOpenDemoModal && (
          <button
            type="button"
            onClick={onOpenDemoModal}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFCF7] hover:bg-[#F2E8DC] border border-[#EADBCE] text-[#6F4E37] text-xs font-bold rounded-xl transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#6F4E37]" />
            <span>Dataset</span>
          </button>
        )}

        {/* Quick Add Sale button */}
        {onQuickAddSale && (
          <button
            onClick={onQuickAddSale}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#6F4E37] hover:bg-[#5a3e2b] text-[#FFFCF7] text-xs font-bold rounded-xl transition-all shadow-sm shadow-[#6F4E37]/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Sale</span>
          </button>
        )}
      </div>
    </header>
  );
};
