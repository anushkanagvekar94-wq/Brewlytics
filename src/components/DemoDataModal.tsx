import React, { useState } from 'react';
import { api } from '../services/api.ts';
import { Database, AlertTriangle, CheckCircle2, Trash2, X, Sparkles } from 'lucide-react';

interface DemoDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DemoDataModal: React.FC<DemoDataModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSeed = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await api.demo.seed();
      setMessage(res.message);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to populate demo data');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await api.demo.clear();
      setMessage(res.message);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to clear data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#241812]/70 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-lg bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl p-6 sm:p-8 shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#9B8778] hover:text-[#241812] hover:bg-[#F7F1E8] rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#6F4E37]/10 border border-[#6F4E37]/20 flex items-center justify-center text-[#6F4E37]">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-display text-[#241812]">
                Database State Manager
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                Optional
              </span>
            </div>
            <p className="text-xs text-[#9B8778]">
              Manage test datasets or reset to an empty production database
            </p>
          </div>
        </div>

        {message && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4 my-6">
          {/* Option A: Seed Demo Data */}
          <div className="p-4 bg-[#F7F1E8] border border-[#EADBCE] rounded-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#241812]">Load DEMO Café Data</h3>
                  <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-[#6F4E37] text-white rounded-md">
                    DEMO DATA
                  </span>
                </div>
                <p className="text-xs text-[#9B8778] mt-1 leading-relaxed">
                  Populates realistic specialty coffee shop records: 12 curated products (Oat Flat White, Geisha Pour Over, Retail Beans), 5 customers, 15 recent sales, and 7 categorized expenses.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSeed}
                disabled={loading}
                className="shrink-0 px-3.5 py-2 bg-[#6F4E37] hover:bg-[#5a3e2b] text-[#FFFCF7] text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Demo</span>
              </button>
            </div>
          </div>

          {/* Option B: Clean Empty Database */}
          <div className="p-4 bg-white border border-[#EADBCE] rounded-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-[#241812]">Reset to Empty Database</h3>
                <p className="text-xs text-[#9B8778] mt-1 leading-relaxed">
                  Removes all sales, products, expenses, and chat history for your account so you can test the pristine empty database state or enter your own café data.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClear}
                disabled={loading}
                className="shrink-0 px-3.5 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Empty</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#9B8778] hover:text-[#241812] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
