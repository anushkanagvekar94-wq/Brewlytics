import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    label: string;
    isPositive?: boolean;
  };
  isEmpty?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  isEmpty = false,
}) => {
  return (
    <div className="group relative bg-[#FFFCF7] hover:bg-[#FFFDF9] border border-[#EADBCE] hover:border-[#D5C1AA] rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Subtle warm decorative corner blur */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#6F4E37]/5 rounded-full blur-2xl group-hover:bg-[#6F4E37]/10 transition-colors pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#9B8778]">
            {title}
          </span>
          <div className="w-10 h-10 rounded-2xl bg-[#F7F1E8] border border-[#EADBCE]/70 flex items-center justify-center text-[#6F4E37] shadow-2xs group-hover:scale-105 transition-transform">
            {icon}
          </div>
        </div>

        <div className="space-y-1">
          {isEmpty ? (
            <div className="text-sm font-semibold text-[#9B8778] italic py-1">
              No sales data yet
            </div>
          ) : (
            <div className="text-2xl sm:text-3xl font-extrabold font-display text-[#241812] tracking-tight">
              {value}
            </div>
          )}

          <div className="flex items-center justify-between text-xs pt-1">
            {subtitle && (
              <span className="text-[#9B8778]">{subtitle}</span>
            )}

            {trend && !isEmpty && (
              <span
                className={`font-bold px-2 py-0.5 rounded-lg text-[10px] ${
                  trend.isPositive
                    ? 'bg-[#7A9E65]/15 text-[#527742] border border-[#7A9E65]/25'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {trend.label}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
