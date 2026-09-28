import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { X, Coffee, Lock, Mail, User, AlertCircle, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, register, googleSignIn, demoLogin } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        await register(name, email, password, confirmPassword);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      await googleSignIn();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      await demoLogin();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to start demo session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#241812]/70 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-md bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#9B8778] hover:text-[#241812] hover:bg-[#F7F1E8] rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#6F4E37] flex items-center justify-center text-[#FFFCF7] shadow-md shadow-[#6F4E37]/20">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <h2 id="auth-modal-title" className="text-xl font-bold font-display text-[#241812]">
              {mode === 'login' ? 'Welcome Back' : 'Get Started with Brewlytics'}
            </h2>
            <p className="text-xs text-[#9B8778]">
              {mode === 'login' ? 'Log in to your café intelligence dashboard' : 'Create an account to turn café data into decisions'}
            </p>
          </div>
        </div>

        {/* 1-Click Instant Demo Access */}
        <div className="mb-5 p-3.5 bg-linear-to-r from-[#FAF3EA] to-[#F3E8DB] border border-[#E0D2C0] rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">☕</span>
            <div>
              <p className="text-xs font-bold text-[#241812]">Instant Barista Demo</p>
              <p className="text-[11px] text-[#6F4E37]">Explore full roastery data in 1 click</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDemoAuth}
            disabled={loading}
            className="px-3.5 py-1.5 bg-[#6F4E37] hover:bg-[#5a3e2b] text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 disabled:opacity-50"
          >
            Launch Demo
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex p-1 bg-[#F7F1E8] rounded-xl mb-6 border border-[#EADBCE]/50">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-[#FFFCF7] text-[#241812] shadow-xs'
                : 'text-[#9B8778] hover:text-[#241812]'
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-[#FFFCF7] text-[#241812] shadow-xs'
                : 'text-[#9B8778] hover:text-[#241812]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Google Sign-In */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-[#EADBCE] hover:border-[#6F4E37] rounded-xl text-xs font-semibold text-[#241812] transition-colors shadow-2xs hover:shadow-xs disabled:opacity-50 mb-4"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="relative flex items-center justify-center my-4">
          <div className="w-full border-t border-[#EADBCE]"></div>
          <span className="absolute bg-[#FFFCF7] px-3 text-[11px] text-[#9B8778] uppercase tracking-wider">
            Or with email
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-[#241812] mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B8778]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Velo"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-[#EADBCE] rounded-xl text-[#241812] placeholder-[#9B8778]/60 focus:outline-hidden focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#241812] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B8778]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@specialtycafe.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-[#EADBCE] rounded-xl text-[#241812] placeholder-[#9B8778]/60 focus:outline-hidden focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#241812] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B8778]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-[#EADBCE] rounded-xl text-[#241812] placeholder-[#9B8778]/60 focus:outline-hidden focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37]"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-[#241812] mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B8778]" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-[#EADBCE] rounded-xl text-[#241812] placeholder-[#9B8778]/60 focus:outline-hidden focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-[#241812] hover:bg-[#38261c] text-[#FFFCF7] text-xs font-bold rounded-xl transition-all shadow-md shadow-[#241812]/15 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Processing...' : mode === 'login' ? 'Sign In to Dashboard' : 'Create My Account'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="mt-5 text-center text-[11px] text-[#9B8778]">
          Protected by AES token authentication & PostgreSQL row security.
        </p>
      </div>
    </div>
  );
};
