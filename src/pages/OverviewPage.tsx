import React from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Percent, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight,
  Package, 
  Plus, 
  Receipt,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { StatCard } from '../components/StatCard.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface OverviewPageProps {
  analytics: any;
  loading: boolean;
  onOpenAddSale: () => void;
  onOpenAddProduct: () => void;
  onOpenAddExpense: () => void;
  onOpenDemoModal: () => void;
  onNavigateTab: (tab: any) => void;
}

const CATEGORY_COLORS = ['#6F4E37', '#7A9E65', '#241812', '#9B8778', '#D4A373', '#CCD5AE'];

export const OverviewPage: React.FC<OverviewPageProps> = ({
  analytics,
  loading,
  onOpenAddSale,
  onOpenAddProduct,
  onOpenAddExpense,
  onOpenDemoModal,
  onNavigateTab,
}) => {
  const { user } = useAuth();
  const currency = user?.currency || '$';

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#6F4E37] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#9B8778]">Computing real SQL analytics...</p>
        </div>
      </div>
    );
  }

  const isDatabaseEmpty = !analytics || (analytics.totalOrders === 0 && analytics.totalProductsCount === 0 && analytics.totalExpenses === 0);
  const hasNoSales = !analytics || analytics.totalOrders === 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* EMPTY DATABASE BANNER (Section 18 requirement) */}
      {isDatabaseEmpty && (
        <div className="bg-[#FFFCF7] border-2 border-dashed border-[#EADBCE] rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-[#6F4E37]/10 text-[#6F4E37] flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-2xl font-bold font-display text-[#241812]">
              Welcome to Brewlytics
            </h2>
            <p className="text-xs sm:text-sm text-[#9B8778] leading-relaxed">
              Your analytics will appear here once you add your first sales record. Start by adding products, recording a sale, or loading our sample dataset.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenAddSale}
              className="px-5 py-2.5 bg-[#241812] hover:bg-[#38261c] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Sale</span>
            </button>
            <button
              onClick={onOpenAddProduct}
              className="px-5 py-2.5 bg-white border border-[#EADBCE] hover:border-[#6F4E37] text-[#241812] text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-2"
            >
              <Package className="w-4 h-4 text-[#6F4E37]" />
              <span>Add Product</span>
            </button>
            <button
              onClick={onOpenAddExpense}
              className="px-5 py-2.5 bg-white border border-[#EADBCE] hover:border-[#6F4E37] text-[#241812] text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4 text-[#6F4E37]" />
              <span>Add Expense</span>
            </button>
            <button
              onClick={onOpenDemoModal}
              className="px-5 py-2.5 bg-[#6F4E37] hover:bg-[#5a3e2b] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Load Demo Café Data</span>
            </button>
          </div>
        </div>
      )}

      {/* AI INSIGHT CARD (Section 28 requirement) */}
      <div className="bg-[#241812] text-white border border-[#38261c] rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#6F4E37]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#7A9E65]/20 text-[#7A9E65] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#7A9E65]">
                Brewlytics Insight
              </span>
            </div>
            <p className="text-sm sm:text-base text-[#e0cfbe] leading-relaxed">
              {analytics?.aiInsight || "Add more sales data to generate real-time café business intelligence."}
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('ai')}
            className="shrink-0 px-4 py-2.5 bg-[#6F4E37] hover:bg-[#8A6447] text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2 self-start md:self-center"
          >
            <span>Ask AI Analyst</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* FRIENDLY DECORATIVE BARISTA QUICK ACTIONS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onOpenAddSale}
          className="p-3.5 bg-linear-to-b from-[#FFFDF9] to-[#F7F1E8] hover:from-[#F7F1E8] hover:to-[#EADBCE] border border-[#EADBCE] rounded-2xl flex items-center gap-3 transition-all shadow-2xs group text-left"
        >
          <span className="w-9 h-9 rounded-xl bg-[#6F4E37] text-white flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform">
            ☕
          </span>
          <div className="min-w-0">
            <span className="block text-xs font-bold text-[#241812] truncate">Record Ticket</span>
            <span className="block text-[10px] text-[#9B8778] truncate">Quick coffee sale</span>
          </div>
        </button>

        <button
          onClick={onOpenAddProduct}
          className="p-3.5 bg-linear-to-b from-[#FFFDF9] to-[#F7F1E8] hover:from-[#F7F1E8] hover:to-[#EADBCE] border border-[#EADBCE] rounded-2xl flex items-center gap-3 transition-all shadow-2xs group text-left"
        >
          <span className="w-9 h-9 rounded-xl bg-[#7A9E65] text-white flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform">
            🫘
          </span>
          <div className="min-w-0">
            <span className="block text-xs font-bold text-[#241812] truncate">New Recipe</span>
            <span className="block text-[10px] text-[#9B8778] truncate">Drink & bean cost</span>
          </div>
        </button>

        <button
          onClick={onOpenAddExpense}
          className="p-3.5 bg-linear-to-b from-[#FFFDF9] to-[#F7F1E8] hover:from-[#F7F1E8] hover:to-[#EADBCE] border border-[#EADBCE] rounded-2xl flex items-center gap-3 transition-all shadow-2xs group text-left"
        >
          <span className="w-9 h-9 rounded-xl bg-[#8A6447] text-white flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform">
            🧾
          </span>
          <div className="min-w-0">
            <span className="block text-xs font-bold text-[#241812] truncate">Log Expense</span>
            <span className="block text-[10px] text-[#9B8778] truncate">Milk, lease, bills</span>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('ai')}
          className="p-3.5 bg-linear-to-b from-[#FFFDF9] to-[#F7F1E8] hover:from-[#F7F1E8] hover:to-[#EADBCE] border border-[#EADBCE] rounded-2xl flex items-center gap-3 transition-all shadow-2xs group text-left"
        >
          <span className="w-9 h-9 rounded-xl bg-[#241812] text-[#7A9E65] flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform">
            ✨
          </span>
          <div className="min-w-0">
            <span className="block text-xs font-bold text-[#241812] truncate">AI Analyst</span>
            <span className="block text-[10px] text-[#9B8778] truncate">Consult metrics</span>
          </div>
        </button>
      </div>

      {/* 4 CORE KPI CARDS (Section 8 requirement) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Revenue"
          value={`${currency}${analytics ? Number(analytics.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}`}
          subtitle={`${analytics?.totalOrders || 0} order(s)`}
          icon={<DollarSign className="w-5 h-5" />}
          isEmpty={hasNoSales}
          trend={{
            label: hasNoSales ? 'No data' : 'Verified SQL',
            isPositive: true,
          }}
        />

        <StatCard
          title="Total Orders"
          value={analytics ? analytics.totalOrders || 0 : 0}
          subtitle="Completed tickets"
          icon={<ShoppingBag className="w-5 h-5" />}
          isEmpty={hasNoSales}
        />

        <StatCard
          title="Gross Profit"
          value={`${currency}${analytics ? Number(analytics.grossProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}`}
          subtitle={`${analytics?.grossProfitMargin || 0}% gross margin`}
          icon={<TrendingUp className="w-5 h-5" />}
          isEmpty={hasNoSales}
          trend={{
            label: `${analytics?.grossProfitMargin || 0}% margin`,
            isPositive: (analytics?.grossProfitMargin || 0) >= 40,
          }}
        />

        <StatCard
          title="Average Order Value"
          value={`${currency}${analytics ? Number(analytics.averageOrderValue || 0).toFixed(2) : '0.00'}`}
          subtitle="Basket size average"
          icon={<Percent className="w-5 h-5" />}
          isEmpty={hasNoSales}
        />
      </div>

      {/* SECONDARY ROW: Operating Expenses & Net Profit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl p-5 sm:p-6 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9B8778]">
              Operating Expenses
            </span>
            <p className="text-2xl font-bold font-display text-[#241812] mt-1">
              {currency}{analytics ? Number(analytics.totalExpenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
            </p>
            <p className="text-xs text-[#9B8778] mt-0.5">
              Rent, dairy, green beans, utilities, payroll
            </p>
          </div>
          <button
            onClick={onOpenAddExpense}
            className="px-3.5 py-1.5 bg-[#F7F1E8] hover:bg-[#EADBCE] text-[#6F4E37] text-xs font-bold rounded-xl transition-colors"
          >
            + Add Expense
          </button>
        </div>

        <div className="bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl p-5 sm:p-6 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9B8778]">
              Net Profit
            </span>
            <p className={`text-2xl font-bold font-display mt-1 ${
              (analytics?.netProfit || 0) >= 0 ? 'text-[#628250]' : 'text-red-600'
            }`}>
              {currency}{analytics ? Number(analytics.netProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
            </p>
            <p className="text-xs text-[#9B8778] mt-0.5">
              Gross profit minus total operating expenses
            </p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            (analytics?.netProfit || 0) >= 0 ? 'bg-[#7A9E65]/15 text-[#628250]' : 'bg-red-100 text-red-700'
          }`}>
            {analytics?.netProfitMargin || 0}% Net Margin
          </span>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-8 bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold font-display text-[#241812]">
                Revenue Trend
              </h3>
              <p className="text-xs text-[#9B8778]">
                Daily sales trajectory calculated from PostgreSQL sales records
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('sales')}
              className="text-xs font-bold text-[#6F4E37] hover:text-[#241812] flex items-center gap-1"
            >
              <span>View All Sales</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {hasNoSales || !analytics?.revenueTrend || analytics.revenueTrend.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#EADBCE] rounded-2xl">
              <Receipt className="w-8 h-8 text-[#9B8778] mb-2" />
              <p className="text-xs font-semibold text-[#241812]">No sales recorded for this period</p>
              <p className="text-[11px] text-[#9B8778] mt-1 max-w-xs">
                Log customer tickets to render real-time revenue and profit trend lines.
              </p>
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="coffeeRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6F4E37" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6F4E37" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EADBCE" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fill: '#9B8778' }} 
                    axisLine={{ stroke: '#EADBCE' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#9B8778' }} 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `${currency}${val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#241812',
                      borderColor: '#38261c',
                      borderRadius: '16px',
                      color: '#FFFCF7',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${currency}${Number(val).toFixed(2)}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#6F4E37" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#coffeeRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Category Share Breakdown */}
        <div className="lg:col-span-4 bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold font-display text-[#241812]">
              Sales by Category
            </h3>
            <p className="text-xs text-[#9B8778] mb-4">
              Category contribution to gross revenue
            </p>

            {hasNoSales || !analytics?.salesByCategory || analytics.salesByCategory.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-xs text-[#9B8778] italic">
                No category data yet
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.salesByCategory}
                        dataKey="revenue"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                      >
                        {analytics.salesByCategory.map((_entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#241812',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '11px',
                        }}
                        formatter={(val: any) => [`${currency}${Number(val).toFixed(2)}`, 'Sales']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#EADBCE]/60">
                  {analytics.salesByCategory.slice(0, 4).map((cat: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }} 
                        />
                        <span className="font-medium text-[#241812]">{cat.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#241812]">{currency}{cat.revenue.toFixed(2)}</span>
                        <span className="text-[10px] text-[#9B8778] ml-1.5">({cat.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Top Performing Products & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Selling Products */}
        <div className="lg:col-span-8 bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold font-display text-[#241812]">
                Top Products by Volume
              </h3>
              <p className="text-xs text-[#9B8778]">
                Drinks & retail goods driving the highest order volume
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs font-bold text-[#6F4E37] hover:text-[#241812] flex items-center gap-1"
            >
              <span>Manage Products</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {hasNoSales || !analytics?.topProducts || analytics.topProducts.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#9B8778] italic">
              No product sales recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#EADBCE] text-[#9B8778] font-bold uppercase text-[10px]">
                    <th className="pb-3">Product</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3 text-right">Units Sold</th>
                    <th className="pb-3 text-right">Revenue</th>
                    <th className="pb-3 text-right">Profit Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADBCE]/50">
                  {analytics.topProducts.map((p: any) => (
                    <tr key={p.id} className="hover:bg-[#F7F1E8]/50 transition-colors">
                      <td className="py-3 font-semibold text-[#241812]">{p.name}</td>
                      <td className="py-3 text-[#9B8778]">
                        <span className="px-2 py-0.5 rounded-md bg-[#F7F1E8] text-[10px] font-semibold text-[#6F4E37]">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 text-right font-bold text-[#241812]">{p.quantitySold}</td>
                      <td className="py-3 text-right font-bold text-[#241812]">{currency}{p.revenue.toFixed(2)}</td>
                      <td className="py-3 text-right">
                        <span className="font-bold text-[#628250]">{p.margin}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-4 bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <h3 className="text-base font-bold font-display text-[#241812]">
                Inventory Alerts
              </h3>
            </div>
            <p className="text-xs text-[#9B8778] mb-4">
              Items with 5 or fewer units remaining
            </p>

            {!analytics?.lowStockProducts || analytics.lowStockProducts.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#7A9E65] bg-emerald-50 rounded-2xl border border-emerald-100 font-semibold">
                ✓ All inventory items are adequately stocked.
              </div>
            ) : (
              <div className="space-y-2.5">
                {analytics.lowStockProducts.slice(0, 5).map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200/80 rounded-2xl text-xs">
                    <div>
                      <p className="font-bold text-[#241812]">{item.name}</p>
                      <p className="text-[10px] text-amber-800">{item.category}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-200 text-amber-900 rounded-lg text-xs font-bold">
                      {item.stock} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigateTab('products')}
            className="w-full mt-4 py-2 px-3 bg-[#F7F1E8] hover:bg-[#EADBCE] text-[#6F4E37] text-xs font-bold rounded-xl transition-colors text-center"
          >
            Update Inventory Stock
          </button>
        </div>
      </div>
    </div>
  );
};
