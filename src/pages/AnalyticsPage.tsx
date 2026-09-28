import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  TrendingUp, 
  BarChart3, 
  DollarSign, 
  Percent, 
  Layers, 
  Calendar,
  AlertTriangle,
  Award,
  ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const CHART_COLORS = ['#6F4E37', '#7A9E65', '#241812', '#9B8778', '#D4A373', '#A5A58D'];

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const currency = user?.currency || '$';

  const [period, setPeriod] = useState<'today' | '7d' | '30d' | '90d' | 'all'>('30d');
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.analytics.getDashboard({ period });
      setData(res);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const hasNoData = !data || (data.totalOrders === 0 && data.totalExpenses === 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-[#241812]">
            Comprehensive Café Intelligence
          </h2>
          <p className="text-xs text-[#9B8778]">
            SQL-driven aggregations, unit profitability analysis, and expense ratios
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center p-1 bg-[#FFFCF7] border border-[#EADBCE] rounded-xl self-start sm:self-auto shadow-2xs">
          {(['today', '7d', '30d', '90d', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                period === p
                  ? 'bg-[#241812] text-white shadow-xs'
                  : 'text-[#9B8778] hover:text-[#241812]'
              }`}
            >
              {p === 'today' ? 'Today' : p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : p === '90d' ? '90 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-[#9B8778]">
          Aggregating financial metrics from PostgreSQL database...
        </div>
      ) : hasNoData ? (
        <div className="bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl p-12 text-center space-y-3">
          <BarChart3 className="w-10 h-10 text-[#9B8778] mx-auto" />
          <h3 className="text-base font-bold text-[#241812]">No sales or expense data for this time period</h3>
          <p className="text-xs text-[#9B8778] max-w-md mx-auto">
            Once transactions and operational costs are recorded, full comparative financial charts and profitability breakdowns will render automatically.
          </p>
        </div>
      ) : (
        <>
          {/* TOP METRICS SUMMARY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl p-5 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#9B8778]">Gross Sales Revenue</span>
              <p className="text-2xl font-bold font-display text-[#241812] mt-1">
                {currency}{Number(data.totalRevenue).toFixed(2)}
              </p>
              <p className="text-[11px] text-[#9B8778] mt-1">{data.totalOrders} total tickets</p>
            </div>

            <div className="bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl p-5 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#9B8778]">Total Product Cost</span>
              <p className="text-2xl font-bold font-display text-[#6F4E37] mt-1">
                {currency}{Number(data.totalProductCost).toFixed(2)}
              </p>
              <p className="text-[11px] text-[#9B8778] mt-1">Direct ingredients cost</p>
            </div>

            <div className="bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl p-5 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#9B8778]">Gross Margin</span>
              <p className="text-2xl font-bold font-display text-[#628250] mt-1">
                {data.grossProfitMargin}%
              </p>
              <p className="text-[11px] text-[#9B8778] mt-1">{currency}{Number(data.grossProfit).toFixed(2)} gross profit</p>
            </div>

            <div className="bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl p-5 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#9B8778]">Net Café Profit</span>
              <p className={`text-2xl font-bold font-display mt-1 ${data.netProfit >= 0 ? 'text-[#628250]' : 'text-red-600'}`}>
                {currency}{Number(data.netProfit).toFixed(2)}
              </p>
              <p className="text-[11px] text-[#9B8778] mt-1">{data.netProfitMargin}% net margin</p>
            </div>
          </div>

          {/* MAIN CHARTS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Daily Velocity Chart */}
            <div className="lg:col-span-8 bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl p-6 shadow-xs">
              <h3 className="text-base font-bold font-display text-[#241812] mb-1">
                Daily Sales Revenue
              </h3>
              <p className="text-xs text-[#9B8778] mb-4">
                Daily revenue timeline computed from verified transactions
              </p>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="analyticsRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7A9E65" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#7A9E65" stopOpacity={0.0} />
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
                        borderRadius: '16px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                      formatter={(val: any) => [`${currency}${Number(val).toFixed(2)}`, 'Revenue']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#7A9E65" 
                      strokeWidth={2.5} 
                      fillOpacity={1} 
                      fill="url(#analyticsRev)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Operating Expense Breakdown */}
            <div className="lg:col-span-4 bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold font-display text-[#241812] mb-1">
                  Expense Distribution
                </h3>
                <p className="text-xs text-[#9B8778] mb-4">
                  Operating costs by category
                </p>

                {(!data.expenseBreakdown || data.expenseBreakdown.length === 0) ? (
                  <p className="text-xs text-[#9B8778] italic py-8 text-center">
                    No expenses recorded in this period.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.expenseBreakdown}
                            dataKey="amount"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={4}
                          >
                            {data.expenseBreakdown.map((_e: any, index: number) => (
                              <Cell key={`cell-exp-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#241812',
                              borderRadius: '12px',
                              color: '#fff',
                              fontSize: '11px',
                            }}
                            formatter={(val: any) => [`${currency}${Number(val).toFixed(2)}`, 'Expense']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[#EADBCE]/60">
                      {data.expenseBreakdown.slice(0, 4).map((exp: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-2.5 h-2.5 rounded-full" 
                              style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} 
                            />
                            <span className="font-medium text-[#241812]">{exp.category}</span>
                          </div>
                          <span className="font-bold text-[#241812]">
                            {currency}{Number(exp.amount).toFixed(2)} ({exp.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PRODUCT PROFITABILITY RANKINGS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Most Profitable Products */}
            <div className="bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-[#7A9E65]" />
                <h3 className="text-base font-bold font-display text-[#241812]">
                  Top Profit Generators
                </h3>
              </div>
              <p className="text-xs text-[#9B8778] mb-4">
                Products contributing the highest cumulative gross dollar profit
              </p>

              {(!data.mostProfitableProducts || data.mostProfitableProducts.length === 0) ? (
                <p className="text-xs text-[#9B8778] italic py-6 text-center">No sales data yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.mostProfitableProducts.map((p: any, idx: number) => (
                    <div key={p.id} className="flex items-center justify-between p-3.5 bg-[#F7F1E8]/60 border border-[#EADBCE] rounded-2xl text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#6F4E37] text-white flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-[#241812]">{p.name}</p>
                          <p className="text-[10px] text-[#9B8778]">{p.category} • {p.quantitySold} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#628250]">{currency}{p.profit.toFixed(2)}</p>
                        <p className="text-[10px] text-[#9B8778]">{p.margin}% margin</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lowest Performing Products */}
            <div className="bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-1">
                <ArrowDownRight className="w-4 h-4 text-amber-600" />
                <h3 className="text-base font-bold font-display text-[#241812]">
                  Underperforming Menu Items
                </h3>
              </div>
              <p className="text-xs text-[#9B8778] mb-4">
                Items with lowest unit velocity — candidates for promotion or re-pricing
              </p>

              {(!data.lowestPerformingProducts || data.lowestPerformingProducts.length === 0) ? (
                <p className="text-xs text-[#9B8778] italic py-6 text-center">No catalog items found.</p>
              ) : (
                <div className="space-y-3">
                  {data.lowestPerformingProducts.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between p-3.5 bg-white border border-[#EADBCE] rounded-2xl text-xs">
                      <div>
                        <p className="font-bold text-[#241812]">{p.name}</p>
                        <p className="text-[10px] text-[#9B8778]">{p.category} • {p.stock} units in stock</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-md bg-[#F7F1E8] font-bold text-[10px] text-[#241812]">
                          {p.quantitySold} sold
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
