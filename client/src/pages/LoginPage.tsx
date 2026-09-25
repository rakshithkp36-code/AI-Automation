import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, quickLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuick = async (role: any) => {
    setError(null);
    setIsLoading(true);
    try {
      await quickLogin(role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-cyan/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full glass-card p-8 rounded-2xl border border-surface-300 relative z-10 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-cyan mx-auto flex items-center justify-center shadow-lg shadow-primary-500/30 mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome to FlowPilot AI</h1>
          <p className="text-xs text-slate-400 mt-1">Sign in to your organization workspace</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Demo Accounts */}
        <div className="mb-6 p-3 rounded-xl bg-surface-200/60 border border-surface-300/80">
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary-300 flex items-center gap-1.5 mb-2">
            <Shield className="w-3.5 h-3.5" /> 1-Click Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuick('Admin')}
              className="px-2.5 py-1.5 rounded-lg bg-surface-300/80 hover:bg-primary-600 text-slate-200 hover:text-white text-xs font-medium transition text-left"
            >
              <span className="font-bold block">Admin</span>
              <span className="text-[10px] text-slate-400 block truncate">Elena Rostova</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuick('Manager')}
              className="px-2.5 py-1.5 rounded-lg bg-surface-300/80 hover:bg-primary-600 text-slate-200 hover:text-white text-xs font-medium transition text-left"
            >
              <span className="font-bold block">Manager</span>
              <span className="text-[10px] text-slate-400 block truncate">Sarah Jenkins</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuick('Employee')}
              className="px-2.5 py-1.5 rounded-lg bg-surface-300/80 hover:bg-primary-600 text-slate-200 hover:text-white text-xs font-medium transition text-left"
            >
              <span className="font-bold block">Employee</span>
              <span className="text-[10px] text-slate-400 block truncate">Alex Rivera</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuick('Automation Operator')}
              className="px-2.5 py-1.5 rounded-lg bg-surface-300/80 hover:bg-primary-600 text-slate-200 hover:text-white text-xs font-medium transition text-left"
            >
              <span className="font-bold block">Operator</span>
              <span className="text-[10px] text-slate-400 block truncate">Marcus Vance</span>
            </button>
          </div>
        </div>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-surface-300"></div>
          <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-500">Or sign in manually</span>
          <div className="flex-grow border-t border-surface-300"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@flowpilot.ai"
                className="w-full pl-9 pr-3 py-2 bg-surface-200/80 border border-surface-300 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-surface-200/80 border border-surface-300 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-semibold text-sm transition shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? <span>Signing In...</span> : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Don't have an organization account?{' '}
          <Link to="/signup" className="text-primary-400 hover:underline font-semibold">
            Create Organization
          </Link>
        </p>
      </div>
    </div>
  );
};
