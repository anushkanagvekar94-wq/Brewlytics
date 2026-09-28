import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { Sidebar, NavItem } from './components/Sidebar.tsx';
import { TopHeader } from './components/TopHeader.tsx';
import { OverviewPage } from './pages/OverviewPage.tsx';
import { SalesPage } from './pages/SalesPage.tsx';
import { ProductsPage } from './pages/ProductsPage.tsx';
import { CustomersPage } from './pages/CustomersPage.tsx';
import { ExpensesPage } from './pages/ExpensesPage.tsx';
import { AnalyticsPage } from './pages/AnalyticsPage.tsx';
import { AiAnalystPage } from './pages/AiAnalystPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { DemoDataModal } from './components/DemoDataModal.tsx';
import { api } from './services/api.ts';
import { Coffee } from 'lucide-react';

const DashboardApp: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavItem>('overview');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [period, setPeriod] = useState<'today' | '7d' | '30d' | '90d' | 'all'>('30d');
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  // Quick navigation triggers
  const [quickAddSale, setQuickAddSale] = useState(false);
  const [quickAddProduct, setQuickAddProduct] = useState(false);
  const [quickAddExpense, setQuickAddExpense] = useState(false);

  const fetchDashboardMetrics = async () => {
    try {
      setAnalyticsLoading(true);
      const data = await api.analytics.getDashboard({ period });
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch dashboard metrics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardMetrics();
    }
  }, [user, period]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F7F1E8] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#6F4E37] text-white flex items-center justify-center shadow-lg animate-pulse">
          <Coffee className="w-6 h-6" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="font-bold font-display text-base text-[#241812]">Brewlytics</span>
          <span className="text-xs text-[#9B8778]">Connecting to PostgreSQL roastery intelligence...</span>
        </div>
      </div>
    );
  }

  // Unauthenticated user -> Landing Page
  if (!user) {
    return <LandingPage />;
  }

  // Quick action helpers
  const handleOpenAddSale = () => {
    setActiveTab('sales');
    setQuickAddSale(true);
  };

  const handleOpenAddProduct = () => {
    setActiveTab('products');
    setQuickAddProduct(true);
  };

  const handleOpenAddExpense = () => {
    setActiveTab('expenses');
    setQuickAddExpense(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F1E8] flex text-[#241812]">
      {/* Demo / State Manager Modal */}
      <DemoDataModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onSuccess={() => fetchDashboardMetrics()}
      />

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onOpenDemoModal={() => setIsDemoModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 min-h-screen">
        <TopHeader
          period={period}
          setPeriod={setPeriod}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          onQuickAddSale={handleOpenAddSale}
          onOpenDemoModal={() => setIsDemoModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-8">
          {activeTab === 'overview' && (
            <OverviewPage
              analytics={analytics}
              loading={analyticsLoading}
              onOpenAddSale={handleOpenAddSale}
              onOpenAddProduct={handleOpenAddProduct}
              onOpenAddExpense={handleOpenAddExpense}
              onOpenDemoModal={() => setIsDemoModalOpen(true)}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'sales' && (
            <SalesPage
              onRefreshAnalytics={fetchDashboardMetrics}
              quickOpenAdd={quickAddSale}
              onResetQuickOpen={() => setQuickAddSale(false)}
            />
          )}

          {activeTab === 'products' && (
            <ProductsPage
              onRefreshAnalytics={fetchDashboardMetrics}
              quickOpenAdd={quickAddProduct}
              onResetQuickOpen={() => setQuickAddProduct(false)}
            />
          )}

          {activeTab === 'customers' && <CustomersPage />}

          {activeTab === 'expenses' && (
            <ExpensesPage
              onRefreshAnalytics={fetchDashboardMetrics}
              quickOpenAdd={quickAddExpense}
              onResetQuickOpen={() => setQuickAddExpense(false)}
            />
          )}

          {activeTab === 'analytics' && <AnalyticsPage />}

          {activeTab === 'ai' && (
            <AiAnalystPage 
              onOpenDemoModal={() => setIsDemoModalOpen(true)} 
              onRefreshAnalytics={fetchDashboardMetrics}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              onOpenDemoModal={() => setIsDemoModalOpen(true)}
              onRefreshAnalytics={fetchDashboardMetrics}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DashboardApp />
    </AuthProvider>
  );
}
