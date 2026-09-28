import React, { useState } from 'react';
import { 
  Coffee, 
  TrendingUp, 
  Sparkles, 
  DollarSign, 
  BarChart3, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  ChevronRight,
  Flame,
  Layers,
  MessageSquareCode
} from 'lucide-react';
import { AuthModal } from '../components/AuthModal.tsx';
import { useAuth } from '../context/AuthContext.tsx';

export const LandingPage: React.FC = () => {
  const { demoLogin } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [demoLoading, setDemoLoading] = useState(false);

  const handleExploreDemo = async () => {
    setDemoLoading(true);
    try {
      await demoLogin();
    } catch (_err) {
      handleOpenAuth('register');
    } finally {
      setDemoLoading(false);
    }
  };

  // Interactive AI sample questions
  const [activeQuestion, setActiveQuestion] = useState(0);
  const aiSamples = [
    {
      q: "Which product generated the highest profit margin this month?",
      a: "Your V60 Pour Over (Panama Geisha) yielded the highest margin at 66.3% ($6.30 profit per $9.50 cup), while Oat Milk Flat White drove the largest gross profit volume ($492 across 120 orders).",
      metric: "Top Margin: 66.3%",
    },
    {
      q: "Why did net profit decrease by 8% last week?",
      a: "Revenue remained stable (+1.2%), but operating expenses increased due to emergency espresso machine servicing ($165) and commercial oat milk restock ($320). Adjusting milk inventory orders will normalize margins next week.",
      metric: "Cost Spike: Equipment + Supplies",
    },
    {
      q: "What products are close to running out of stock?",
      a: "2 items have critically low stock: Colombia Pink Bourbon 250g Retail Beans (4 bags remaining) and Artisan Almond Croissants (8 units remaining). Reorder recommendation: 15 bags and 30 pastries.",
      metric: "Inventory Alert: 2 Items Critical",
    },
  ];

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F1E8] text-[#241812] selection:bg-[#6F4E37] selection:text-white">
      {/* Auth Modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
      />

      {/* 1. Navigation */}
      <header className="sticky top-0 z-40 bg-[#F7F1E8]/90 backdrop-blur-md border-b border-[#EADBCE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6F4E37] flex items-center justify-center text-[#FFFCF7] shadow-md shadow-[#6F4E37]/25">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight font-display text-[#241812]">Brewlytics</span>
              <span className="block text-[10px] text-[#6F4E37] font-bold uppercase tracking-widest">Specialty Coffee Intel</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#6F4E37]">
            <a href="#product" className="hover:text-[#241812] transition-colors">Product</a>
            <a href="#problem" className="hover:text-[#241812] transition-colors">The Dilemma</a>
            <a href="#features" className="hover:text-[#241812] transition-colors">Features</a>
            <a href="#ai-analyst" className="hover:text-[#241812] transition-colors">AI Analyst</a>
            <a href="#how-it-works" className="hover:text-[#241812] transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-[#241812] transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExploreDemo}
              disabled={demoLoading}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-[#F3EAE0] hover:bg-[#EADBCE] text-[#6F4E37] text-xs font-bold rounded-xl transition-colors border border-[#EADBCE]"
            >
              <span>☕</span>
              <span>{demoLoading ? 'Starting...' : 'Explore Live Demo'}</span>
            </button>
            <button
              onClick={() => handleOpenAuth('login')}
              className="px-3.5 py-2 text-xs font-bold text-[#6F4E37] hover:text-[#241812] transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => handleOpenAuth('register')}
              className="px-5 py-2.5 bg-[#241812] hover:bg-[#38261c] text-[#FFFCF7] text-xs font-bold rounded-xl transition-all shadow-md shadow-[#241812]/20 flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#6F4E37]/10 border border-[#6F4E37]/20 text-[#6F4E37] text-xs font-bold">
                <Flame className="w-3.5 h-3.5 text-[#6F4E37]" />
                <span>Specialty Coffee Business Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display text-[#241812] leading-[1.1] tracking-tight">
                Your café has the data.{' '}
                <span className="text-[#6F4E37] block mt-1">Brewlytics turns it into decisions.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#6F4E37] max-w-2xl leading-relaxed">
                Understand sales, profit, products, expenses and customer trends with intelligent analytics and an AI business analyst built for modern cafés.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <button
                  onClick={handleExploreDemo}
                  disabled={demoLoading}
                  className="px-7 py-3.5 bg-[#6F4E37] hover:bg-[#5a3e2b] text-white text-sm font-bold rounded-2xl transition-all shadow-md shadow-[#6F4E37]/30 flex items-center justify-center gap-2"
                >
                  <span>☕</span>
                  <span>{demoLoading ? 'Launching Roastery...' : 'Explore Live Café Demo'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenAuth('register')}
                  className="px-6 py-3.5 bg-[#241812] hover:bg-[#38261c] text-[#FFFCF7] text-sm font-bold rounded-2xl transition-all shadow-md shadow-[#241812]/20 flex items-center justify-center gap-2"
                >
                  <span>Start Free</span>
                </button>
                <a
                  href="#how-it-works"
                  className="px-5 py-3.5 bg-white/80 hover:bg-white border border-[#EADBCE] text-[#241812] text-sm font-semibold rounded-2xl transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <span>How It Works</span>
                  <ChevronRight className="w-4 h-4 text-[#9B8778]" />
                </a>
              </div>

              <div className="flex items-center gap-6 pt-4 text-xs text-[#9B8778]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#7A9E65]" />
                  <span>Real PostgreSQL Database</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#6F4E37]" />
                  <span>Server-Side Gemini LLM</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#7A9E65]" />
                  <span>Zero Mock Data</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Preview Card */}
            <div className="lg:col-span-5">
              <div className="relative bg-[#241812] text-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#38261c]">
                {/* Glow decor */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#6F4E37]/30 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-[#7A9E65]/20 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-[#38261c]">
                    <div>
                      <span className="text-[10px] font-bold text-[#7A9E65] uppercase tracking-wider">Live Café Intelligence</span>
                      <h3 className="text-base font-bold font-display text-white">Heartwood Coffee Roasters</h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#6F4E37] text-white">
                      Today: Active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#1b120d] p-3.5 rounded-2xl border border-[#38261c]">
                      <span className="text-[10px] text-[#9B8778] uppercase font-bold">Daily Revenue</span>
                      <p className="text-xl font-bold font-display text-white mt-0.5">$1,842.50</p>
                      <span className="text-[10px] text-[#7A9E65] font-semibold">+14.2% vs yesterday</span>
                    </div>
                    <div className="bg-[#1b120d] p-3.5 rounded-2xl border border-[#38261c]">
                      <span className="text-[10px] text-[#9B8778] uppercase font-bold">Gross Margin</span>
                      <p className="text-xl font-bold font-display text-white mt-0.5">71.8%</p>
                      <span className="text-[10px] text-[#7A9E65] font-semibold">$1,322 net item profit</span>
                    </div>
                  </div>

                  {/* AI Snippet Preview */}
                  <div className="bg-[#2d1e16] p-4 rounded-2xl border border-[#4d3527] space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#7A9E65]" />
                      <span className="text-xs font-bold text-[#e0cfbe]">Brewlytics AI Business Analyst</span>
                    </div>
                    <p className="text-xs text-[#c5b4a4] leading-relaxed">
                      "Your Oat Milk Flat White is your top volume driver today (42 units). However, your Geisha Pour Over delivers 3.2x more profit per order. Consider featuring it on your weekend board."
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-[#9B8778]">
                    <span>184 Cups Brewed Today</span>
                    <button 
                      onClick={() => handleOpenAuth('register')}
                      className="text-xs font-bold text-[#7A9E65] hover:text-white flex items-center gap-1"
                    >
                      <span>Explore Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Problem Section */}
      <section id="problem" className="py-20 bg-[#241812] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#7A9E65]">The Café Data Dilemma</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display">
              POS systems record transactions. They don't give you answers.
            </h2>
            <p className="text-sm sm:text-base text-[#c5b4a4]">
              You can see your end-of-day register tape, but when costs climb or margins shrink, raw receipts leave you guessing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1b120d] border border-[#38261c] rounded-3xl p-7 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-display text-white">Blind to True Profitability</h3>
              <p className="text-xs text-[#9B8778] leading-relaxed">
                A drink that rings up $6 might cost $3.50 in premium syrups and plant milks, while a $4.50 black drip coffee costs pennies. Without live unit costs, top sellers can drain your margin.
              </p>
            </div>

            <div className="bg-[#1b120d] border border-[#38261c] rounded-3xl p-7 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-display text-white">Untracked Expense Creep</h3>
              <p className="text-xs text-[#9B8778] leading-relaxed">
                Between bean shipments, dairy deliveries, electricity, rent, and packaging, overhead fluctuates weekly. Café owners rarely know their exact net profit until tax season.
              </p>
            </div>

            <div className="bg-[#1b120d] border border-[#38261c] rounded-3xl p-7 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-display text-white">No Actionable Advice</h3>
              <p className="text-xs text-[#9B8778] leading-relaxed">
                Spreadsheets require hours of pivot tables and formulas after a 12-hour bar shift. You need plain-English guidance: what to promote, what to reorder, and where money is leaking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Solution & 5. Features */}
      <section id="features" className="py-24 bg-[#FFFCF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#6F4E37]">Specialty Intelligence</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-[#241812]">
              Everything you need to run a high-margin coffee business.
            </h2>
            <p className="text-sm sm:text-base text-[#6F4E37]">
              Every metric, calculation, and recommendation is computed directly from your PostgreSQL database.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-[#F7F1E8] border border-[#EADBCE] rounded-3xl p-7 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#6F4E37] text-white flex items-center justify-center shadow-md shadow-[#6F4E37]/20">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-display text-[#241812]">Sales Intelligence</h3>
              <p className="text-xs text-[#6F4E37] leading-relaxed">
                Real-time tracking of orders, total volume, average ticket size, and payment preferences across days, weeks, and months.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#F7F1E8] border border-[#EADBCE] rounded-3xl p-7 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#7A9E65] text-white flex items-center justify-center shadow-md shadow-[#7A9E65]/20">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-display text-[#241812]">Product Profitability</h3>
              <p className="text-xs text-[#6F4E37] leading-relaxed">
                Dynamic calculations of price minus cost per unit and margin percentages. Instantly identify your highest-margin and underperforming menu items.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#F7F1E8] border border-[#EADBCE] rounded-3xl p-7 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#241812] text-white flex items-center justify-center shadow-md shadow-[#241812]/20">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-display text-[#241812]">Expense Tracking</h3>
              <p className="text-xs text-[#6F4E37] leading-relaxed">
                Log ingredients, dairy, rent, utilities, and wages into categorized accounts. Watch gross profit transition to real net profit.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#F7F1E8] border border-[#EADBCE] rounded-3xl p-7 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#6F4E37] text-white flex items-center justify-center shadow-md shadow-[#6F4E37]/20">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-display text-[#241812]">Inventory Insights</h3>
              <p className="text-xs text-[#6F4E37] leading-relaxed">
                Automated stock decrementing upon every sale recorded. Automated low-stock alerts prevent 86'ing your best-selling retail beans or pastries.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#F7F1E8] border border-[#EADBCE] rounded-3xl p-7 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#7A9E65] text-white flex items-center justify-center shadow-md shadow-[#7A9E65]/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-display text-[#241812]">AI Business Analyst</h3>
              <p className="text-xs text-[#6F4E37] leading-relaxed">
                Ask conversational questions in natural language. Powered by Google Gemini reasoning strictly over your PostgreSQL numbers.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[#F7F1E8] border border-[#EADBCE] rounded-3xl p-7 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#241812] text-white flex items-center justify-center shadow-md shadow-[#241812]/20">
                <Coffee className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-display text-[#241812]">Performance Analytics</h3>
              <p className="text-xs text-[#6F4E37] leading-relaxed">
                Clean interactive Recharts visualizations: Revenue Trends, Sales by Category, Product Profitability Matrix, and Expense breakdowns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. AI Section (Interactive Preview) */}
      <section id="ai-analyst" className="py-24 bg-[#241812] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7A9E65]/20 text-[#7A9E65] text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Grounded in Your Real Database</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight">
                Ask your café anything. Get real mathematical answers.
              </h2>

              <p className="text-sm text-[#c5b4a4] leading-relaxed">
                Unlike generic chatbots that hallucinate numbers, Brewlytics feeds your actual SQL totals, sales items, cost calculations, and expense logs into Google Gemini to provide actionable business intelligence.
              </p>

              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-[#9B8778] uppercase tracking-wider">Try sample questions:</p>
                {aiSamples.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveQuestion(idx)}
                    className={`w-full text-left p-3.5 rounded-2xl border text-xs font-semibold transition-all ${
                      activeQuestion === idx
                        ? 'bg-[#6F4E37] border-[#8A6447] text-white shadow-md'
                        : 'bg-[#1b120d] border-[#38261c] text-[#c5b4a4] hover:text-white hover:bg-[#251912]'
                    }`}
                  >
                    "{sample.q}"
                  </button>
                ))}
              </div>
            </div>

            {/* AI Chat Window Mockup */}
            <div className="lg:col-span-7">
              <div className="bg-[#1b120d] border border-[#38261c] rounded-3xl p-6 sm:p-8 shadow-2xl">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#38261c]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#6F4E37] flex items-center justify-center text-white">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white font-display">Brewlytics AI Business Analyst</h4>
                      <span className="text-[10px] text-[#7A9E65] font-semibold">Gemini LLM Connected</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#7A9E65]/15 text-[#7A9E65] border border-[#7A9E65]/30">
                    {aiSamples[activeQuestion].metric}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* User query */}
                  <div className="flex justify-end">
                    <div className="bg-[#6F4E37] text-white px-4 py-3 rounded-2xl rounded-tr-xs text-xs max-w-md shadow-sm">
                      {aiSamples[activeQuestion].q}
                    </div>
                  </div>

                  {/* Assistant response */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#2d1e16] border border-[#4d3527] flex items-center justify-center text-[#7A9E65] shrink-0 mt-0.5">
                      <Coffee className="w-3.5 h-3.5" />
                    </div>
                    <div className="bg-[#241812] border border-[#38261c] text-[#e0cfbe] p-4 rounded-2xl rounded-tl-xs text-xs leading-relaxed max-w-lg space-y-2">
                      <p>{aiSamples[activeQuestion].a}</p>
                      <div className="pt-2 border-t border-[#38261c] flex items-center justify-between text-[10px] text-[#9B8778]">
                        <span>Calculated from live PostgreSQL sale_items</span>
                        <span className="text-[#7A9E65] font-semibold">Verified Accurate</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#38261c] flex items-center justify-between">
                  <span className="text-xs text-[#9B8778]">Ready to converse with your café's data?</span>
                  <button
                    onClick={() => handleOpenAuth('register')}
                    className="px-4 py-2 bg-[#7A9E65] hover:bg-[#688a53] text-[#241812] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <span>Launch AI Analyst</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. How It Works */}
      <section id="how-it-works" className="py-24 bg-[#F7F1E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#6F4E37]">Operational Flow</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-[#241812]">
              From raw cups to clear strategy in 4 steps.
            </h2>
            <p className="text-sm sm:text-base text-[#6F4E37]">
              No complicated spreadsheets. Just clean, instant café intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl p-6 relative">
              <span className="text-4xl font-extrabold font-display text-[#EADBCE] absolute top-4 right-5">01</span>
              <div className="space-y-3 relative z-10 pt-4">
                <span className="inline-block px-2.5 py-1 bg-[#6F4E37]/10 text-[#6F4E37] text-xs font-bold rounded-lg">Step 1</span>
                <h3 className="text-base font-bold text-[#241812]">Connect Data</h3>
                <p className="text-xs text-[#6F4E37] leading-relaxed">
                  Log sales transactions, define menu prices and ingredient costs, and register operational expenses.
                </p>
              </div>
            </div>

            <div className="bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl p-6 relative">
              <span className="text-4xl font-extrabold font-display text-[#EADBCE] absolute top-4 right-5">02</span>
              <div className="space-y-3 relative z-10 pt-4">
                <span className="inline-block px-2.5 py-1 bg-[#6F4E37]/10 text-[#6F4E37] text-xs font-bold rounded-lg">Step 2</span>
                <h3 className="text-base font-bold text-[#241812]">Analyze Instantly</h3>
                <p className="text-xs text-[#6F4E37] leading-relaxed">
                  Automated SQL aggregations calculate gross profits, net margins, category shares, and ticket averages.
                </p>
              </div>
            </div>

            <div className="bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl p-6 relative">
              <span className="text-4xl font-extrabold font-display text-[#EADBCE] absolute top-4 right-5">03</span>
              <div className="space-y-3 relative z-10 pt-4">
                <span className="inline-block px-2.5 py-1 bg-[#6F4E37]/10 text-[#6F4E37] text-xs font-bold rounded-lg">Step 3</span>
                <h3 className="text-base font-bold text-[#241812]">Ask the AI</h3>
                <p className="text-xs text-[#6F4E37] leading-relaxed">
                  Query the AI Business Analyst about underperforming drinks, margin leaks, or weekly comparative trends.
                </p>
              </div>
            </div>

            <div className="bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl p-6 relative">
              <span className="text-4xl font-extrabold font-display text-[#EADBCE] absolute top-4 right-5">04</span>
              <div className="space-y-3 relative z-10 pt-4">
                <span className="inline-block px-2.5 py-1 bg-[#6F4E37]/10 text-[#6F4E37] text-xs font-bold rounded-lg">Step 4</span>
                <h3 className="text-base font-bold text-[#241812]">Take Action</h3>
                <p className="text-xs text-[#6F4E37] leading-relaxed">
                  Re-engineer high-margin drinks, trim supplier waste, reorder low-stock roasts, and grow café profit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Pricing Section */}
      <section id="pricing" className="py-24 bg-[#FFFCF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#6F4E37]">Transparent Pricing</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-[#241812]">
              Predictable plans built for indie cafés and roasteries.
            </h2>
            <p className="text-sm sm:text-base text-[#6F4E37]">
              Try with your real data. No locked-in contracts.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex p-1 bg-[#F7F1E8] border border-[#EADBCE] rounded-xl mt-4">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  billingCycle === 'monthly' ? 'bg-[#241812] text-white shadow-xs' : 'text-[#6F4E37]'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  billingCycle === 'yearly' ? 'bg-[#241812] text-white shadow-xs' : 'text-[#6F4E37]'
                }`}
              >
                Yearly (Save 20%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Tier 1 */}
            <div className="bg-[#F7F1E8] border border-[#EADBCE] rounded-3xl p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6F4E37]">Single Origin</span>
                <h3 className="text-xl font-bold font-display text-[#241812]">Starter Roaster</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold font-display text-[#241812]">
                    ${billingCycle === 'yearly' ? '24' : '29'}
                  </span>
                  <span className="text-xs text-[#9B8778]">/ month</span>
                </div>
                <p className="text-xs text-[#6F4E37]">Perfect for single-bar cafés and mobile espresso trailers.</p>
                <div className="border-t border-[#EADBCE] pt-4 space-y-2.5 text-xs text-[#241812]">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#7A9E65]" /> Up to 500 orders/month</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#7A9E65]" /> Full Sales & Product Profitability</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#7A9E65]" /> Expense & Net Profit Tracking</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#7A9E65]" /> 50 AI Business Analyst queries/mo</div>
                </div>
              </div>

              <button
                onClick={() => handleOpenAuth('register')}
                className="w-full py-3 bg-[#FFFCF7] hover:bg-white border border-[#EADBCE] text-[#241812] text-xs font-bold rounded-xl transition-all shadow-2xs"
              >
                Get Started
              </button>
            </div>

            {/* Tier 2 (Highlighted) */}
            <div className="bg-[#241812] text-white border-2 border-[#6F4E37] rounded-3xl p-8 space-y-6 flex flex-col justify-between relative shadow-xl">
              <span className="absolute -top-3.5 right-6 px-3 py-1 bg-[#7A9E65] text-[#241812] text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-md">
                Most Popular
              </span>

              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7A9E65]">Café Pro</span>
                <h3 className="text-xl font-bold font-display text-white">High Velocity</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold font-display text-white">
                    ${billingCycle === 'yearly' ? '55' : '69'}
                  </span>
                  <span className="text-xs text-[#9B8778]">/ month</span>
                </div>
                <p className="text-xs text-[#c5b4a4]">Designed for busy specialty coffee bars and micro-roasters.</p>
                <div className="border-t border-[#38261c] pt-4 space-y-2.5 text-xs text-[#e0cfbe]">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#7A9E65]" /> Unlimited orders & transactions</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#7A9E65]" /> Real-time Inventory Alerts</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#7A9E65]" /> Unlimited AI Analyst queries</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#7A9E65]" /> Customer Purchase History</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#7A9E65]" /> PostgreSQL database persistence</div>
                </div>
              </div>

              <button
                onClick={() => handleOpenAuth('register')}
                className="w-full py-3 bg-[#6F4E37] hover:bg-[#8A6447] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#6F4E37]/30"
              >
                Start Free Trial
              </button>
            </div>

            {/* Tier 3 */}
            <div className="bg-[#F7F1E8] border border-[#EADBCE] rounded-3xl p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6F4E37]">Multi-Location</span>
                <h3 className="text-xl font-bold font-display text-[#241812]">Roastery Chain</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold font-display text-[#241812]">
                    ${billingCycle === 'yearly' ? '119' : '149'}
                  </span>
                  <span className="text-xs text-[#9B8778]">/ month</span>
                </div>
                <p className="text-xs text-[#6F4E37]">For roasteries with multiple retail outlets or wholesale labs.</p>
                <div className="border-t border-[#EADBCE] pt-4 space-y-2.5 text-xs text-[#241812]">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#7A9E65]" /> Multiple café locations</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#7A9E65]" /> Multi-barista staff accounts</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#7A9E65]" /> Wholesale bean order management</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#7A9E65]" /> Dedicated coffee intelligence support</div>
                </div>
              </div>

              <button
                onClick={() => handleOpenAuth('register')}
                className="w-full py-3 bg-[#FFFCF7] hover:bg-white border border-[#EADBCE] text-[#241812] text-xs font-bold rounded-xl transition-all shadow-2xs"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="bg-[#241812] text-white border-t border-[#38261c] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#6F4E37] flex items-center justify-center text-white">
                  <Coffee className="w-4 h-4" />
                </div>
                <span className="font-bold text-lg font-display text-white">Brewlytics</span>
              </div>
              <p className="text-xs text-[#9B8778] leading-relaxed">
                Specialty Coffee Intelligence. Turn café sales, inventory, and expense data into smarter decisions.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Product</h4>
              <ul className="space-y-2 text-xs text-[#9B8778]">
                <li><a href="#features" className="hover:text-white transition-colors">Sales Intelligence</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Product Profitability</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Expense Tracking</a></li>
                <li><a href="#ai-analyst" className="hover:text-white transition-colors">AI Business Analyst</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Platform</h4>
              <ul className="space-y-2 text-xs text-[#9B8778]">
                <li><span className="text-white">PostgreSQL Cloud SQL</span></li>
                <li><span className="text-white">Google Gemini 2.5</span></li>
                <li><span className="text-white">Firebase Auth & JWT</span></li>
                <li><span className="text-white">Drizzle ORM Engine</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Account</h4>
              <div className="space-y-2">
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="w-full py-2 px-3 bg-[#38261c] hover:bg-[#4d3527] text-white text-xs font-bold rounded-xl transition-colors text-center"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleOpenAuth('register')}
                  className="w-full py-2 px-3 bg-[#7A9E65] hover:bg-[#688a53] text-[#241812] text-xs font-bold rounded-xl transition-colors text-center"
                >
                  Create Free Account
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[#38261c] flex flex-col sm:flex-row items-center justify-between text-xs text-[#9B8778]">
            <p>© {new Date().getFullYear()} Brewlytics. Built for specialty coffee bars & roasteries.</p>
            <p className="mt-2 sm:mt-0">Real SQL Data • No Hardcoded Statistics • Powered by Google AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
