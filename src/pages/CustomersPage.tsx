import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Mail, 
  Phone, 
  Calendar, 
  Receipt,
  Eye,
  AlertCircle
} from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { user } = useAuth();
  const currency = user?.currency || '$';

  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await api.customers.getAll({ search: search || undefined });
      setCustomers(data);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setName('');
    setEmail('');
    setPhone('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: any) => {
    setEditingCustomer(c);
    setName(c.name);
    setEmail(c.email || '');
    setPhone(c.phone || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleViewDetail = async (id: number) => {
    try {
      setDetailLoading(true);
      const detail = await api.customers.getById(id);
      setSelectedCustomerDetail(detail);
    } catch (err) {
      console.error('Error fetching customer detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Customer name is required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCustomer) {
        await api.customers.update(editingCustomer.id, {
          name: name.trim(),
          email: email ? email.trim() : null,
          phone: phone ? phone.trim() : null,
        });
      } else {
        await api.customers.create({
          name: name.trim(),
          email: email ? email.trim() : null,
          phone: phone ? phone.trim() : null,
        });
      }

      setIsModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this customer profile? Their past sales will remain recorded.')) {
      return;
    }
    try {
      await api.customers.delete(id);
      fetchCustomers();
      if (selectedCustomerDetail?.id === id) {
        setSelectedCustomerDetail(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete customer');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-[#241812]">
            Customer Profiles & Loyalty
          </h2>
          <p className="text-xs text-[#9B8778]">
            Track regular patrons, lifetime spend, order frequency, and contact records
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-[#241812] hover:bg-[#38261c] text-[#FFFCF7] text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-[#FFFCF7] border border-[#EADBCE] rounded-2xl p-4 shadow-xs">
        <form onSubmit={(e) => { e.preventDefault(); fetchCustomers(); }} className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B8778]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by name..."
            className="w-full pl-10 pr-4 py-2 bg-[#F7F1E8] border border-[#EADBCE] rounded-xl text-xs text-[#241812] placeholder-[#9B8778] focus:outline-hidden focus:border-[#6F4E37]"
          />
        </form>
      </div>

      {/* Customers Table / Empty State */}
      <div className="bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl p-6 shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#9B8778]">
            Loading customer accounts...
          </div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#6F4E37]/10 text-[#6F4E37] flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[#241812]">No customers registered</p>
            <p className="text-xs text-[#9B8778] max-w-sm mx-auto">
              {search 
                ? 'No customers matched your search query.' 
                : 'Create customer profiles to attach to orders and monitor café regulars.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EADBCE] text-[#9B8778] font-bold uppercase text-[10px]">
                  <th className="pb-3">Customer Name</th>
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">Member Since</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADBCE]/50">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F7F1E8]/40 transition-colors">
                    <td className="py-3.5 font-bold text-[#241812]">
                      <button
                        onClick={() => handleViewDetail(c.id)}
                        className="hover:text-[#6F4E37] hover:underline text-left font-bold"
                      >
                        {c.name}
                      </button>
                    </td>
                    <td className="py-3.5 text-[#6F4E37]">
                      {c.email || <span className="text-[#9B8778] italic">—</span>}
                    </td>
                    <td className="py-3.5 text-[#241812]">
                      {c.phone || <span className="text-[#9B8778] italic">—</span>}
                    </td>
                    <td className="py-3.5 text-[#9B8778]">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewDetail(c.id)}
                          className="p-1.5 text-[#9B8778] hover:text-[#6F4E37] hover:bg-[#F7F1E8] rounded-lg transition-colors"
                          title="View Order History"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 text-[#9B8778] hover:text-[#6F4E37] hover:bg-[#F7F1E8] rounded-lg transition-colors"
                          title="Edit Customer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 text-[#9B8778] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Customer"
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

      {/* CREATE / EDIT CUSTOMER MODAL */}
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
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-display text-[#241812]">
                  {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                </h3>
                <p className="text-xs text-[#9B8778]">
                  Keep patron information organized for order receipts
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
                  Customer Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#EADBCE] rounded-xl text-[#241812] focus:outline-hidden focus:border-[#6F4E37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#241812] mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maya@example.com"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#EADBCE] rounded-xl text-[#241812] focus:outline-hidden focus:border-[#6F4E37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#241812] mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#EADBCE] rounded-xl text-[#241812] focus:outline-hidden focus:border-[#6F4E37]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#241812] hover:bg-[#38261c] text-[#FFFCF7] text-xs font-bold rounded-xl transition-all shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingCustomer ? 'Update Profile' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW CUSTOMER DETAIL & PURCHASE HISTORY MODAL */}
      {selectedCustomerDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#241812]/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCustomerDetail(null)}
              className="absolute top-5 right-5 p-2 text-[#9B8778] hover:text-[#241812] rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-[#EADBCE] pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#6F4E37] text-white flex items-center justify-center text-lg font-bold font-display shadow-md">
                  {selectedCustomerDetail.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold font-display text-[#241812]">
                    {selectedCustomerDetail.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-[#9B8778] mt-0.5">
                    {selectedCustomerDetail.email && <span>{selectedCustomerDetail.email}</span>}
                    {selectedCustomerDetail.phone && <span>• {selectedCustomerDetail.phone}</span>}
                  </div>
                </div>
              </div>

              {/* Patron stats */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-3 bg-[#F7F1E8] rounded-xl border border-[#EADBCE]">
                  <span className="text-[10px] uppercase font-bold text-[#9B8778]">Lifetime Spend</span>
                  <p className="text-lg font-bold font-display text-[#6F4E37]">
                    {currency}{Number(selectedCustomerDetail.totalSpend || 0).toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-[#F7F1E8] rounded-xl border border-[#EADBCE]">
                  <span className="text-[10px] uppercase font-bold text-[#9B8778]">Total Visits</span>
                  <p className="text-lg font-bold font-display text-[#241812]">
                    {selectedCustomerDetail.totalOrders || 0} Orders
                  </p>
                </div>
              </div>
            </div>

            {/* Purchase History */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#241812]">
                Order History ({selectedCustomerDetail.sales?.length || 0})
              </h4>

              {(!selectedCustomerDetail.sales || selectedCustomerDetail.sales.length === 0) ? (
                <p className="text-xs text-[#9B8778] italic py-4 text-center">
                  No orders attached to this customer yet.
                </p>
              ) : (
                <div className="divide-y divide-[#EADBCE]/60">
                  {selectedCustomerDetail.sales.map((s: any) => (
                    <div key={s.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#241812]">Order #{s.id}</span>
                        <p className="text-[10px] text-[#9B8778]">
                          {new Date(s.saleDate).toLocaleDateString()} • {s.paymentMethod}
                        </p>
                      </div>
                      <span className="font-bold text-[#6F4E37]">
                        {currency}{Number(s.totalAmount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#EADBCE]">
              <button
                onClick={() => setSelectedCustomerDetail(null)}
                className="w-full py-2.5 bg-[#F7F1E8] hover:bg-[#EADBCE] text-[#241812] text-xs font-bold rounded-xl transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
