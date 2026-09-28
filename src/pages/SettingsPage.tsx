import React, { useState } from 'react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  Settings, 
  User, 
  Store, 
  Lock, 
  Database, 
  LogOut, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Trash2
} from 'lucide-react';

interface SettingsPageProps {
  onOpenDemoModal: () => void;
  onRefreshAnalytics: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onOpenDemoModal,
  onRefreshAnalytics,
}) => {
  const { user, updateUser, logout } = useAuth();

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [cafeName, setCafeName] = useState(user?.cafeName || '');
  const [currency, setCurrency] = useState(user?.currency || '$');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileErr, setProfileErr] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordErr, setPasswordErr] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileErr(null);
    setProfileLoading(true);

    try {
      const updated = await api.auth.updateProfile({
        name,
        cafeName,
        currency,
        timezone,
      });
      updateUser(updated);
      setProfileMsg('Café settings updated successfully');
      onRefreshAnalytics();
    } catch (err: any) {
      setProfileErr(err.message || 'Failed to update settings');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    setPasswordErr(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordErr('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordErr('Password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.auth.changePassword({
        currentPassword,
        newPassword,
      });
      setPasswordMsg('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setPasswordErr(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-[#241812]">
          Settings & Café Configuration
        </h2>
        <p className="text-xs text-[#9B8778]">
          Manage your roastery branding, currency, account credentials, and database options
        </p>
      </div>

      {/* Café & Business Information */}
      <div className="bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#EADBCE]">
          <div className="w-10 h-10 rounded-2xl bg-[#6F4E37]/10 text-[#6F4E37] flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-[#241812]">
              Café & Business Details
            </h3>
            <p className="text-xs text-[#9B8778]">
              Customize your coffee bar branding and display currency
            </p>
          </div>
        </div>

        {profileMsg && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{profileMsg}</span>
          </div>
        )}

        {profileErr && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{profileErr}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#241812] mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#EADBCE] rounded-xl text-[#241812] focus:outline-hidden focus:border-[#6F4E37]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#241812] mb-1">
                Café / Roastery Name
              </label>
              <input
                type="text"
                required
                value={cafeName}
                onChange={(e) => setCafeName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#EADBCE] rounded-xl text-[#241812] focus:outline-hidden focus:border-[#6F4E37]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#241812] mb-1">
                Currency Symbol
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#EADBCE] rounded-xl text-[#241812] focus:outline-hidden"
              >
                <option value="$">$ (USD / CAD / AUD)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
                <option value="₹">₹ (INR)</option>
                <option value="¥">¥ (JPY / CNY)</option>
                <option value="A$">A$ (AUD)</option>
                <option value="CHF">CHF (Swiss Franc)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#241812] mb-1">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#EADBCE] rounded-xl text-[#241812] focus:outline-hidden"
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Chicago">America/Chicago (CST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="Europe/Paris">Europe/Paris (CET)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={profileLoading}
              className="px-5 py-2.5 bg-[#241812] hover:bg-[#38261c] text-white text-xs font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {profileLoading ? 'Saving...' : 'Save Business Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Account Security (Password) */}
      <div className="bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#EADBCE]">
          <div className="w-10 h-10 rounded-2xl bg-[#6F4E37]/10 text-[#6F4E37] flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-[#241812]">
              Security & Password
            </h3>
            <p className="text-xs text-[#9B8778]">
              Registered email: <span className="font-semibold text-[#241812]">{user?.email}</span>
            </p>
          </div>
        </div>

        {passwordMsg && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{passwordMsg}</span>
          </div>
        )}

        {passwordErr && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{passwordErr}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-[#241812] mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#EADBCE] rounded-xl text-[#241812] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#241812] mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#EADBCE] rounded-xl text-[#241812] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#241812] mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Repeat new password"
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#EADBCE] rounded-xl text-[#241812] focus:outline-hidden"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={passwordLoading || !newPassword}
              className="px-5 py-2.5 bg-[#241812] hover:bg-[#38261c] text-white text-xs font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Dataset & Database State */}
      <div className="bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-[#EADBCE]">
          <div className="w-10 h-10 rounded-2xl bg-[#6F4E37]/10 text-[#6F4E37] flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-[#241812]">
              Database State & Testing
            </h3>
            <p className="text-xs text-[#9B8778]">
              Easily toggle between a realistic coffee shop dataset and a blank production slate
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-[#F7F1E8] border border-[#EADBCE] rounded-2xl">
          <div>
            <p className="text-xs font-bold text-[#241812]">Manage Demo & Empty States</p>
            <p className="text-[11px] text-[#9B8778] mt-0.5">
              Load realistic specialty café sales records or reset your database to 0 records.
            </p>
          </div>
          <button
            onClick={onOpenDemoModal}
            className="px-4 py-2 bg-[#6F4E37] hover:bg-[#5a3e2b] text-white text-xs font-bold rounded-xl transition-colors shadow-xs shrink-0"
          >
            Open Data Manager
          </button>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={logout}
            className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log out of Brewlytics</span>
          </button>
        </div>
      </div>
    </div>
  );
};
