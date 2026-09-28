import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  Plus, 
  Search, 
  Filter, 
  Receipt, 
  Trash2, 
  Eye, 
  X, 
  Calendar, 
  CreditCard, 
  User, 
  ShoppingBag, 
  AlertCircle 
} from 'lucide-react';

interface SalesPageProps {
  onRefreshAnalytics: () => void;
  quickOpenAdd?: boolean;
  onResetQuickOpen?: () => void;
}

export const SalesPage: React.FC<SalesPageProps> = ({
  onRefreshAnalytics,
  quickOpenAdd = false,
  onResetQuickOpen,
}) => {
  const { user } = useAuth();
  const currency = user?.currency || '$';

  const [salesList, setSalesList] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedSaleDetail, setSelectedSaleDetail] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Add Sale Form State
  const [customerId, setCustomerId] = useState('');
  const [salePaymentMethod, setSalePaymentMethod] = useState('Card');
  const [saleDate, setSaleDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: '', quantity: 1 }
  ]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const data = await api.sales.getAll({
        search: search || undefined,
        paymentMethod: paymentMethod !== 'All' ? paymentMethod : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setSalesList(data);
    } catch (err) {
      console.error('Error fetching sales:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [prods, custs] = await Promise.all([
        api.products.getAll(),
        api.customers.getAll(),
      ]);
      setProductsList(prods);
      setCustomersList(custs);
      if (prods.length > 0 && items[0].productId === '') {
        setItems([{ productId: prods[0].id.toString(), quantity: 1 }]);
      }
    } catch (err) {
      console.error('Error fetching dependencies:', err);
    }
  };

  useEffect(() => {
    fetchSales();
    fetchDependencies();
  }, [paymentMethod, startDate, endDate]);

  useEffect(() => {
    if (quickOpenAdd) {
      setIsAddOpen(true);
      if (onResetQuickOpen) onResetQuickOpen();
    }
  }, [quickOpenAdd]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSales();
  };

  const handleAddItemRow = () => {
    const defaultProdId = productsList.length > 0 ? productsList[0].id.toString() : '';
    setItems([...items, { productId: defaultProdId, quantity: 1 }]);
  };

  const handleRemoveItemRow = (idx: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: 'productId' | 'quantity', val: any) => {
    const next = [...items];
    next[idx] = { ...next[idx], [field]: val };
    setItems(next);
  };

  // Preview estimated subtotal
  const estimatedSubtotal = items.reduce((acc, row) => {
    const p = productsList.find(x => x.id.toString() === row.productId);
    return acc + (p ? p.price * (Number(row.quantity) || 1) : 0);
  }, 0);

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validItems = items.filter(it => it.productId && Number(it.quantity) > 0);
    if (validItems.length === 0) {
      setFormError('Please select at least one product with quantity >= 1');
      return;
    }

    setSubmitting(true);
    try {
      await api.sales.create({
        customerId: customerId ? parseInt(customerId, 10) : null,
        paymentMethod: salePaymentMethod,
        saleDate,
        notes,
        items: validItems.map(it => ({
          productId: parseInt(it.productId, 10),
          quantity: parseInt(it.quantity.toString(), 10),
        })),
      });

      setIsAddOpen(false);
      // Reset form
      setCustomerId('');
      setNotes('');
      setItems([{ productId: productsList[0]?.id.toString() || '', quantity: 1 }]);
      fetchSales();
      onRefreshAnalytics();
    } catch (err: any) {
      setFormError(err.message || 'Failed to record sale');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetail = async (id: number) => {
    try {
      setDetailLoading(true);
      const detail = await api.sales.getById(id);
      setSelectedSaleDetail(detail);
    } catch (err) {
      console.error('Error fetching sale detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDeleteSale = async (id: number) => {
    if (!window.confirm('Delete this sale record? Product stock will be automatically restored.')) {
      return;
    }
    try {
      await api.sales.delete(id);
      fetchSales();
      onRefreshAnalytics();
      if (selectedSaleDetail?.id === id) {
        setSelectedSaleDetail(null);
      }
    } catch (err) {
      console.error('Failed to delete sale:', err);
    }
  };

  const handleQuickSaleWithProduct = (prodId: number) => {
    setCustomerId('');
    setNotes('');
    setItems([{ productId: prodId.toString(), quantity: 1 }]);
    setFormError(null);
    setIsAddOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-[#241812]">
            Sales Management
          </h2>
          <p className="text-xs text-[#9B8778]">
            Real-time coffee tickets recorded in PostgreSQL with verified inventory deduction
          </p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setIsAddOpen(true);
          }}
          className="px-4 py-2.5 bg-[#241812] hover:bg-[#38261c] text-[#FFFCF7] text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Sale</span>
        </button>
      </div>

      {/* QUICK TAP BARISTA SHELF */}
      {productsList.length > 0 && (
        <div className="bg-[#FFFCF7] border border-[#EADBCE] rounded-2xl p-4 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">☕</span>
              <span className="text-xs font-bold text-[#241812]">Barista Quick-Tap Shelf</span>
              <span className="text-[10px] text-[#9B8778] hidden sm:inline">— Tap drink to open pre-filled ticket</span>
            </div>
            <span className="text-[10px] font-bold text-[#6F4E37]">{productsList.length} items ready</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {productsList.slice(0, 6).map((prod) => (
              <button
                key={prod.id}
                onClick={() => handleQuickSaleWithProduct(prod.id)}
                className="shrink-0 p-2.5 bg-[#F7F1E8] hover:bg-[#EADBCE] border border-[#EADBCE] rounded-xl text-left transition-all hover:scale-102 flex items-center gap-2.5 shadow-2xs"
              >
                <div className="w-8 h-8 rounded-lg bg-[#6F4E37] text-white flex items-center justify-center text-xs font-bold">
                  {prod.category === 'Espresso' ? '☕' : prod.category === 'Cold Brew' ? '🧊' : prod.category === 'Pastry' ? '🥐' : '🫘'}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#241812] max-w-[130px] truncate">{prod.name}</p>
                  <p className="text-[10px] text-[#6F4E37] font-semibold">{currency}{Number(prod.price).toFixed(2)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-[#FFFCF7] border border-[#EADBCE] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B8778]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, order # or notes..."
            className="w-full pl-10 pr-4 py-2 bg-[#F7F1E8] border border-[#EADBCE] rounded-xl text-xs text-[#241812] placeholder-[#9B8778] focus:outline-hidden focus:border-[#6F4E37]"
          />
        </form>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-[#F7F1E8] border border-[#EADBCE] rounded-xl px-2.5 py-1.5 text-xs text-[#6F4E37]">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="bg-transparent font-semibold focus:outline-hidden text-xs"
            >
              <option value="All">All Payment Methods</option>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
              <option value="Mobile / Apple Pay">Mobile / Apple Pay</option>
              <option value="Other">Other</option>
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

          {(search || paymentMethod !== 'All' || startDate || endDate) && (
            <button
              onClick={() => {
                setSearch('');
                setPaymentMethod('All');
                setStartDate('');
                setEndDate('');
              }}
              className="p-2 text-xs text-[#9B8778] hover:text-[#241812]"
              title="Reset Filters"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Sales Table / Empty State */}
      <div className="bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl p-6 shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#9B8778]">
            Loading sales transactions...
          </div>
        ) : salesList.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#6F4E37]/10 text-[#6F4E37] flex items-center justify-center mx-auto">
              <Receipt className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[#241812]">No sales found</p>
            <p className="text-xs text-[#9B8778] max-w-sm mx-auto">
              {search || paymentMethod !== 'All' || startDate || endDate
                ? 'Try adjusting your search criteria or date filters.'
                : 'No sales records exist in your database yet. Click "Record New Sale" to log your first coffee transaction.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EADBCE] text-[#9B8778] font-bold uppercase text-[10px]">
                  <th className="pb-3">Sale ID</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Payment</th>
                  <th className="pb-3 text-right">Total Amount</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADBCE]/50">
                {salesList.map((sale) => (
                  <tr key={sale.id} className="hover:bg-[#F7F1E8]/40 transition-colors">
                    <td className="py-3.5 font-bold text-[#6F4E37]">#{sale.id}</td>
                    <td className="py-3.5 text-[#241812]">
                      {new Date(sale.saleDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 font-medium text-[#241812]">
                      {sale.customerName ? (
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#9B8778]" />
                          <span>{sale.customerName}</span>
                        </span>
                      ) : (
                        <span className="text-[#9B8778] italic">Walk-in Guest</span>
                      )}
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-[#F7F1E8] text-[10px] font-semibold text-[#241812] border border-[#EADBCE]">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-bold text-sm text-[#241812]">
                      {currency}{Number(sale.totalAmount).toFixed(2)}
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewDetail(sale.id)}
                          className="p-1.5 text-[#9B8778] hover:text-[#6F4E37] hover:bg-[#F7F1E8] rounded-lg transition-colors"
                          title="View Receipt"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSale(sale.id)}
                          className="p-1.5 text-[#9B8778] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Sale"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* ADD SALE MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#241812]/70 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-5 right-5 p-2 text-[#9B8778] hover:text-[#241812] rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#6F4E37] text-white flex items-center justify-center shadow-md">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-display text-[#241812]">Record New Sale</h3>
                <p className="text-xs text-[#9B8778]">
                  Backend calculates exact prices & decrements product stock dynamically
                </p>
              </div>
            </div>

            {formError && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSale} className="space-y-4">
              {/* Customer Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#241812] mb-1">
                  Customer (Optional)
                </label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#EADBCE] rounded-xl text-[#241812] focus:outline-hidden focus:border-[#6F4E37]"
                >
                  <option value="">Walk-in Guest</option>
                  {customersList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Items Section */}
              <div className="border border-[#EADBCE] rounded-2xl p-4 bg-[#F7F1E8]/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#241812] uppercase tracking-wider">
                    Drink & Item Basket
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs font-bold text-[#6F4E37] hover:text-[#241812] flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                {productsList.length === 0 ? (
                  <p className="text-xs text-red-600">
                    No products found. Please add products first before recording sales.
                  </p>
                ) : (
                  items.map((row, idx) => {
                    const selProd = productsList.find(p => p.id.toString() === row.productId);
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <select
                          value={row.productId}
                          onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                          className="flex-1 px-3 py-2 text-xs bg-white border border-[#EADBCE] rounded-xl text-[#241812] focus:outline-hidden focus:border-[#6F4E37]"
                        >
                          {productsList.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} — {currency}{p.price.toFixed(2)} (Stock: {p.stock})
                            </option>
                          ))}
                        </select>

                        <input
                          type="number"
                          min="1"
                          max={selProd ? selProd.stock : 999}
                          value={row.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-16 px-2.5 py-2 text-xs bg-white border border-[#EADBCE] rounded-xl text-[#241812] text-center"
                        />

                        <span className="w-16 text-right text-xs font-bold text-[#241812]">
                          {currency}{selProd ? (selProd.price * row.quantity).toFixed(2) : '0.00'}
                        </span>

                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            className="p-1.5 text-[#9B8778] hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}

                <div className="pt-2 border-t border-[#EADBCE] flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#9B8778]">Estimated Subtotal:</span>
                  <span className="text-sm font-bold text-[#241812]">
                    {currency}{estimatedSubtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Method & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#241812] mb-1">
                    Payment Method
                  </label>
                  <select
                    value={salePaymentMethod}
                    onChange={(e) => setSalePaymentMethod(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-white border border-[#EADBCE] rounded-xl text-[#241812] focus:outline-hidden"
                  >
                    <option value="Card">Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Mobile / Apple Pay">Mobile / Apple Pay</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#241812] mb-1">
                    Sale Date
                  </label>
                  <input
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-white border border-[#EADBCE] rounded-xl text-[#241812] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#241812] mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Extra hot, oat milk substitute, morning rush"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#EADBCE] rounded-xl text-[#241812] placeholder-[#9B8778]/70 focus:outline-hidden focus:border-[#6F4E37]"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={submitting || productsList.length === 0}
                  className="w-full py-3 bg-[#241812] hover:bg-[#38261c] text-[#FFFCF7] text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>{submitting ? 'Calculating & Saving...' : 'Record & Finalize Sale'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW SALE DETAIL MODAL */}
      {selectedSaleDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#241812]/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setSelectedSaleDetail(null)}
              className="absolute top-5 right-5 p-2 text-[#9B8778] hover:text-[#241812] rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-dashed border-[#EADBCE] pb-4 mb-4 text-center">
              <span className="text-[10px] uppercase font-bold text-[#6F4E37] tracking-widest">
                Specialty Coffee Receipt
              </span>
              <h3 className="text-xl font-bold font-display text-[#241812] mt-0.5">
                Ticket #{selectedSaleDetail.id}
              </h3>
              <p className="text-xs text-[#9B8778]">
                {new Date(selectedSaleDetail.saleDate).toLocaleString()}
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between py-1 border-b border-[#EADBCE]/50">
                <span className="text-[#9B8778]">Customer:</span>
                <span className="font-semibold text-[#241812]">
                  {selectedSaleDetail.customerName || 'Walk-in Guest'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EADBCE]/50">
                <span className="text-[#9B8778]">Payment Method:</span>
                <span className="font-semibold text-[#241812]">
                  {selectedSaleDetail.paymentMethod}
                </span>
              </div>

              {selectedSaleDetail.notes && (
                <div className="py-1 border-b border-[#EADBCE]/50">
                  <span className="text-[#9B8778] block">Notes:</span>
                  <span className="font-medium text-[#241812]">{selectedSaleDetail.notes}</span>
                </div>
              )}

              {/* Items List */}
              <div className="pt-2">
                <span className="block font-bold text-[#241812] uppercase text-[10px] tracking-wider mb-2">
                  Purchased Items
                </span>
                <div className="space-y-2">
                  {selectedSaleDetail.items?.map((it: any) => (
                    <div key={it.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-[#241812]">{it.productName}</p>
                        <p className="text-[10px] text-[#9B8778]">
                          {it.quantity} × {currency}{Number(it.unitPrice).toFixed(2)}
                        </p>
                      </div>
                      <span className="font-bold text-[#241812]">
                        {currency}{Number(it.totalPrice).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t-2 border-dashed border-[#EADBCE] flex justify-between items-center text-sm">
                <span className="font-bold text-[#241812]">Grand Total:</span>
                <span className="text-lg font-bold font-display text-[#6F4E37]">
                  {currency}{Number(selectedSaleDetail.totalAmount).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setSelectedSaleDetail(null)}
                className="flex-1 py-2.5 bg-[#F7F1E8] hover:bg-[#EADBCE] text-[#241812] text-xs font-bold rounded-xl transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleDeleteSale(selectedSaleDetail.id)}
                className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
