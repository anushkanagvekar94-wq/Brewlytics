import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../../middleware/auth.ts';
import { getDashboardAnalytics, DateFilterOptions } from '../services/analyticsService.ts';

const router = Router();

// GET /api/analytics/dashboard
router.get('/dashboard', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const period = (req.query.period as DateFilterOptions['period']) || '30d';
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const data = await getDashboardAnalytics(userId, { period, startDate, endDate });
    res.json(data);
  } catch (error: any) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({ error: 'Failed to compute dashboard analytics' });
  }
});

// GET /api/analytics/revenue
router.get('/revenue', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const period = (req.query.period as DateFilterOptions['period']) || '30d';
    const data = await getDashboardAnalytics(userId, { period });
    res.json({
      totalRevenue: data.totalRevenue,
      totalOrders: data.totalOrders,
      averageOrderValue: data.averageOrderValue,
      revenueTrend: data.revenueTrend,
    });
  } catch (error: any) {
    console.error('Analytics revenue error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
  }
});

// GET /api/analytics/products
router.get('/products', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const period = (req.query.period as DateFilterOptions['period']) || 'all';
    const data = await getDashboardAnalytics(userId, { period });
    res.json({
      salesByProduct: data.salesByProduct,
      salesByCategory: data.salesByCategory,
      topProducts: data.topProducts,
      mostProfitableProducts: data.mostProfitableProducts,
      lowestPerformingProducts: data.lowestPerformingProducts,
      lowStockProducts: data.lowStockProducts,
    });
  } catch (error: any) {
    console.error('Analytics products error:', error);
    res.status(500).json({ error: 'Failed to fetch product analytics' });
  }
});

// GET /api/analytics/expenses
router.get('/expenses', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const period = (req.query.period as DateFilterOptions['period']) || '30d';
    const data = await getDashboardAnalytics(userId, { period });
    res.json({
      totalExpenses: data.totalExpenses,
      expenseBreakdown: data.expenseBreakdown,
      grossProfit: data.grossProfit,
      netProfit: data.netProfit,
      netProfitMargin: data.netProfitMargin,
    });
  } catch (error: any) {
    console.error('Analytics expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch expense analytics' });
  }
});

export default router;
