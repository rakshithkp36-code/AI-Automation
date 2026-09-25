import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock, Mail, User, Building2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Admin' | 'Manager' | 'Employee' | 'Automation Operator'>('Admin');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await register({
        fullName,
        organizationName,
        email,
        password,
        role,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-emerald/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full glass-card p-8 rounded-2xl border border-surface-300 relative z-10 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-emerald mx-auto flex items-center justify-center shadow-lg shadow-primary-500/30 mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Organization Workspace</h1>
          <p className="text-xs text-slate-400 mt-1">Get started with AI-driven smart automation</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Organization Name</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Acme Global Inc"
                className="w-full pl-9 pr-3 py-2 bg-surface-200/80 border border-surface-300 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Elena Rostova"
                className="w-full pl-9 pr-3 py-2 bg-surface-200/80 border border-surface-300 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="elena@acme.com"
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-9 pr-3 py-2 bg-surface-200/80 border border-surface-300 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full px-3 py-2 bg-surface-200/80 border border-surface-300 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-primary-500 transition"
            >
              <option value="Admin">Admin (Full Control)</option>
              <option value="Manager">Manager (Approver & Lead)</option>
              <option value="Employee">Employee (Task Specialist)</option>
              <option value="Automation Operator">Automation Operator (AI Supervisor)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-semibold text-sm transition shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? <span>Creating Account...</span> : <><span>Create Organization</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
