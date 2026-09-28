import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  X, 
  TrendingUp, 
  AlertCircle,
  Tag
} from 'lucide-react';

interface ProductsPageProps {
  onRefreshAnalytics: () => void;
  quickOpenAdd?: boolean;
  onResetQuickOpen?: () => void;
}

const CATEGORIES = [
  'All',
  'Espresso',
  'Cold Brew',
  'Filter Coffee',
  'Tea & Alternatives',
  'Pastry',
  'Food',
  'Retail Beans',
  'Merchandise',
  'Other'
];

export const ProductsPage: React.FC<ProductsPageProps> = ({
  onRefreshAnalytics,
  quickOpenAdd = false,
  onResetQuickOpen,
}) => {
  const { user } = useAuth();
  const currency = user?.currency || '$';

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Espresso');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [stock, setStock] = useState('50');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await api.products.getAll({
        search: search || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
      });
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  useEffect(() => {
    if (quickOpenAdd) {
      handleOpenCreate();
      if (onResetQuickOpen) onResetQuickOpen();
    }
  }, [quickOpenAdd]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Espresso');
    setPrice('');
    setCost('');
    setStock('50');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: any) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setPrice(p.price.toString());
    setCost(p.cost.toString());
    setStock(p.stock.toString());
    setFormError(null);
    setIsModalOpen(true);
  };

  // Dynamic preview calculations
  const numPrice = parseFloat(price) || 0;
  const numCost = parseFloat(cost) || 0;
  const previewProfit = numPrice - numCost;
  const previewMargin = numPrice > 0 ? ((previewProfit / numPrice) * 100).toFixed(1) : '0.0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Product name is required');
      return;
    }
    if (isNaN(numPrice) || numPrice < 0) {
      setFormError('Selling price must be a valid non-negative number');
      return;
    }
    if (isNaN(numCost) || numCost < 0) {
      setFormError('Ingredient cost must be a valid non-negative number');
      return;
    }

    setSubmitting(true);
    try {
      if (editingProduct) {
        await api.products.update(editingProduct.id, {
          name: name.trim(),
          category,
          price: numPrice,
          cost: numCost,
          stock: parseInt(stock, 10) || 0,
        });
      } else {
        await api.products.create({
          name: name.trim(),
          category,
          price: numPrice,
          cost: numCost,
          stock: parseInt(stock, 10) || 0,
        });
      }

      setIsModalOpen(false);
      fetchProducts();
      onRefreshAnalytics();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product? All associated records will be removed.')) {
      return;
    }
    try {
      await api.products.delete(id);
      fetchProducts();
      onRefreshAnalytics();
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Create */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-[#241812]">
            Product & Menu Intelligence
          </h2>
          <p className="text-xs text-[#9B8778]">
            Manage prices, track ingredient costs, and calculate dynamic gross profit margins
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-[#241812] hover:bg-[#38261c] text-[#FFFCF7] text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FFFCF7] border border-[#EADBCE] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form onSubmit={(e) => { e.preventDefault(); fetchProducts(); }} className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B8778]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name..."
            className="w-full pl-10 pr-4 py-2 bg-[#F7F1E8] border border-[#EADBCE] rounded-xl text-xs text-[#241812] placeholder-[#9B8778] focus:outline-hidden focus:border-[#6F4E37]"
          />
        </form>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 bg-[#F7F1E8] border border-[#EADBCE] rounded-xl px-2.5 py-1.5 text-xs text-[#6F4E37] shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent font-semibold focus:outline-hidden text-xs"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {(search || selectedCategory !== 'All') && (
            <button
              onClick={() => { setSearch(''); setSelectedCategory('All'); }}
              className="text-xs text-[#9B8778] hover:text-[#241812] px-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Product List / Cards */}
      <div className="bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl p-6 shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#9B8778]">
            Loading product inventory...
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#6F4E37]/10 text-[#6F4E37] flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[#241812]">No products cataloged</p>
            <p className="text-xs text-[#9B8778] max-w-sm mx-auto">
              {search || selectedCategory !== 'All'
                ? 'No products matched your search or category filter.'
                : 'Your menu is currently empty. Add your drinks, beans, or bakery items to start tracking margin analytics.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EADBCE] text-[#9B8778] font-bold uppercase text-[10px]">
                  <th className="pb-3">Product Name</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3 text-right">Selling Price</th>
                  <th className="pb-3 text-right">Cost</th>
                  <th className="pb-3 text-right">Profit / Unit</th>
                  <th className="pb-3 text-right">Margin %</th>
                  <th className="pb-3 text-center">Stock</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADBCE]/50">
                {products.map((p) => {
                  const isLowStock = p.stock <= 5;
                  return (
                    <tr key={p.id} className="hover:bg-[#F7F1E8]/40 transition-colors">
                      <td className="py-3.5 font-bold text-[#241812]">{p.name}</td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-[#F7F1E8] text-[10px] font-semibold text-[#6F4E37] border border-[#EADBCE]">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-semibold text-[#241812]">
                        {currency}{Number(p.price).toFixed(2)}
                      </td>
                      <td className="py-3.5 text-right text-[#9B8778]">
                        {currency}{Number(p.cost).toFixed(2)}
                      </td>
                      <td className="py-3.5 text-right font-bold text-[#6F4E37]">
                        {currency}{Number(p.profitPerUnit).toFixed(2)}
                      </td>
                      <td className="py-3.5 text-right font-bold text-[#628250]">
                        {p.profitMargin}%
                      </td>
                      <td className="py-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isLowStock
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-white text-[#241812] border border-[#EADBCE]'
                        }`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-[#9B8778] hover:text-[#6F4E37] hover:bg-[#F7F1E8] rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 text-[#9B8778] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
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
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-display text-[#241812]">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <p className="text-xs text-[#9B8778]">
                  Set recipe costs and monitor unit margin in real time
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
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Oat Milk Flat White"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#EADBCE] rounded-xl text-[#241812] placeholder-[#9B8778]/70 focus:outline-hidden focus:border-[#6F4E37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#241812] mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#EADBCE] rounded-xl text-[#241812] focus:outline-hidden"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#241812] mb-1">
                    Selling Price ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="5.50"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#EADBCE] rounded-xl text-[#241812] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#241812] mb-1">
                    Ingredient Cost ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="1.40"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#EADBCE] rounded-xl text-[#241812] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#241812] mb-1">
                  Current Stock Units
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="50"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#EADBCE] rounded-xl text-[#241812] focus:outline-hidden"
                />
              </div>

              {/* Live Margin Calculation Preview */}
              <div className="p-3.5 bg-[#F7F1E8] border border-[#EADBCE] rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#9B8778] block text-[10px] uppercase font-bold">Calculated Unit Profit</span>
                  <span className="font-bold text-[#6F4E37] text-sm">
                    {currency}{previewProfit.toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[#9B8778] block text-[10px] uppercase font-bold">Gross Margin</span>
                  <span className="font-bold text-[#628250] text-sm">
                    {previewMargin}%
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#241812] hover:bg-[#38261c] text-[#FFFCF7] text-xs font-bold rounded-xl transition-all shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving Product...' : editingProduct ? 'Update Product' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
