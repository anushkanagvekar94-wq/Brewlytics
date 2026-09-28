import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  X, 
  Calendar, 
  DollarSign, 
  AlertCircle 
} from 'lucide-react';

interface ExpensesPageProps {
  onRefreshAnalytics: () => void;
  quickOpenAdd?: boolean;
  onResetQuickOpen?: () => void;
}

const EXPENSE_CATEGORIES = [
  'All',
  'Rent',
  'Ingredients',
  'Utilities',
  'Marketing',
  'Staff',
  'Equipment',
  'Other'
];

export const ExpensesPage: React.FC<ExpensesPageProps> = ({
  onRefreshAnalytics,
  quickOpenAdd = false,
  onResetQuickOpen,
}) => {
  const { user } = useAuth();
  const currency = user?.currency || '$';

  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any | null>(null);

  // Form Fields
  const [formCategory, setFormCategory] = useState('Ingredients');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await api.expenses.getAll({
        search: search || undefined,
        category: category !== 'All' ? category : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setExpenses(data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [category, startDate, endDate]);

  useEffect(() => {
    if (quickOpenAdd) {
      handleOpenCreate();
      if (onResetQuickOpen) onResetQuickOpen();
    }
  }, [quickOpenAdd]);

  const handleOpenCreate = () => {
    setEditingExpense(null);
    setFormCategory('Ingredients');
    setDescription('');
    setAmount('');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp: any) => {
    setEditingExpense(exp);
    setFormCategory(exp.category);
    setDescription(exp.description);
    setAmount(exp.amount.toString());
    setExpenseDate(new Date(exp.expenseDate).toISOString().split('T')[0]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const numAmount = parseFloat(amount);
    if (!description.trim()) {
      setFormError('Description is required');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Amount must be a positive number');
      return;
    }

    setSubmitting(true);
    try {
      if (editingExpense) {
        await api.expenses.update(editingExpense.id, {
          category: formCategory,
          description: description.trim(),
          amount: numAmount,
          expenseDate,
        });
      } else {
        await api.expenses.create({
          category: formCategory,
          description: description.trim(),
          amount: numAmount,
          expenseDate,
        });
      }

      setIsModalOpen(false);
      fetchExpenses();
      onRefreshAnalytics();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this expense record?')) {
      return;
    }
    try {
      await api.expenses.delete(id);
      fetchExpenses();
      onRefreshAnalytics();
    } catch (err: any) {
      alert(err.message || 'Failed to delete expense');
    }
  };

  const totalExpenseSum = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-[#241812]">
            Operating Expense Tracking
          </h2>
          <p className="text-xs text-[#9B8778]">
            Log commercial rent, oat milk & dairy batches, roaster supply, utilities, and payroll
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-[#241812] hover:bg-[#38261c] text-[#FFFCF7] text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Summary KPI Card */}
      <div className="bg-[#FFFCF7] border border-[#EADBCE] rounded-2xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#9B8778]">
            Filtered Total Expenses
          </span>
          <p className="text-2xl font-bold font-display text-[#241812] mt-0.5">
            {currency}{totalExpenseSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-[#6F4E37]/10 text-[#6F4E37] flex items-center justify-center">
          <CreditCard className="w-5 h-5" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FFFCF7] border border-[#EADBCE] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form onSubmit={(e) => { e.preventDefault(); fetchExpenses(); }} className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B8778]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search expense description..."
            className="w-full pl-10 pr-4 py-2 bg-[#F7F1E8] border border-[#EADBCE] rounded-xl text-xs text-[#241812] placeholder-[#9B8778] focus:outline-hidden focus:border-[#6F4E37]"
          />
        </form>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-[#F7F1E8] border border-[#EADBCE] rounded-xl px-2.5 py-1.5 text-xs text-[#6F4E37]">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent font-semibold focus:outline-hidden text-xs"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-[#F7F1E8] border border-[#EADBCE] rounded-xl px-2.5 py-1.5 text-xs">
            <span className="text-[10px] text-[#9B8778] font-bold uppercase">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-xs text-[#241812] focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#F7F1E8] border border-[#EADBCE] rounded-xl px-2.5 py-1.5 text-xs">
            <span className="text-[10px] text-[#9B8778] font-bold uppercase">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-xs text-[#241812] focus:outline-hidden"
            />
          </div>

          {(search || category !== 'All' || startDate || endDate) && (
            <button
              onClick={() => {
                setSearch('');
                setCategory('All');
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs text-[#9B8778] hover:text-[#241812] px-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Expenses Table / Empty State */}
      <div className="bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl p-6 shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#9B8778]">
            Loading expenses...
          </div>
        ) : expenses.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#6F4E37]/10 text-[#6F4E37] flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[#241812]">No expenses recorded</p>
            <p className="text-xs text-[#9B8778] max-w-sm mx-auto">
              {search || category !== 'All' || startDate || endDate
                ? 'No expenses matched your filter criteria.'
                : 'Log your coffee shop overhead (rent, dairy, staff, beans) to calculate true net profit.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EADBCE] text-[#9B8778] font-bold uppercase text-[10px]">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADBCE]/50">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#F7F1E8]/40 transition-colors">
                    <td className="py-3.5 text-[#241812]">
                      {new Date(exp.expenseDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-[#F7F1E8] text-[10px] font-semibold text-[#6F4E37] border border-[#EADBCE]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 font-medium text-[#241812] max-w-xs truncate">
                      {exp.description}
                    </td>
                    <td className="py-3.5 text-right font-bold text-sm text-[#241812]">
                      {currency}{Number(exp.amount).toFixed(2)}
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(exp)}
                          className="p-1.5 text-[#9B8778] hover:text-[#6F4E37] hover:bg-[#F7F1E8] rounded-lg transition-colors"
                          title="Edit Expense"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="p-1.5 text-[#9B8778] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT EXPENSE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#241812]/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-[#9B8778] hover:text-[#241812] rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#6F4E37] text-white flex items-center justify-center shadow-md">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-display text-[#241812]">
                  {editingExpense ? 'Edit Expense' : 'Record Operating Expense'}
                </h3>
                <p className="text-xs text-[#9B8778]">
                  Keep accurate books on monthly roastery costs
                </p>
              </div>
            </div>

            {formError && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#241812] mb-1">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#EADBCE] rounded-xl text-[#241812] focus:outline-hidden"
                >
                  {EXPENSE_CATEGORIES.filter(c => c !== 'All').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#241812] mb-1">
                  Description
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Oat milk delivery, Commercial espresso service"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#EADBCE] rounded-xl text-[#241812] placeholder-[#9B8778]/70 focus:outline-hidden focus:border-[#6F4E37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#241812] mb-1">
                    Amount ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="250.00"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#EADBCE] rounded-xl text-[#241812] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#241812] mb-1">
                    Expense Date
                  </label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#EADBCE] rounded-xl text-[#241812] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#241812] hover:bg-[#38261c] text-[#FFFCF7] text-xs font-bold rounded-xl transition-all shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving Expense...' : editingExpense ? 'Update Expense' : 'Log Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
