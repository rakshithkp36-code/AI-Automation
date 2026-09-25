import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Clock,
  TrendingUp,
  Cpu,
  Workflow,
  BarChart3,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, quickLogin } = useAuth();

  const handleLaunchDemo = async (role: any = 'Admin') => {
    await quickLogin(role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 selection:bg-primary-500 selection:text-white relative overflow-hidden">
      {/* Background ambient glowing gradients */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-accent-cyan/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-accent-emerald/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Navigation */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 via-primary-500 to-accent-cyan flex items-center justify-center shadow-lg shadow-primary-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            FlowPilot <span className="text-primary-400">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold transition flex items-center gap-2 shadow-lg shadow-primary-600/30"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-slate-300 hover:text-white transition px-3 py-2"
              >
                Sign In
              </Link>
              <button
                onClick={() => handleLaunchDemo('Admin')}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white text-sm font-semibold transition shadow-lg shadow-primary-600/30"
              >
                1-Click Live Demo
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-200/80 border border-surface-300/80 mb-6 text-xs text-primary-300">
          <Cpu className="w-3.5 h-3.5" />
          <span className="font-semibold uppercase tracking-wider text-[11px]">Powered by Google Gemini 2.5</span>
          <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-ping" />
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
          Turn Manual Operations into{' '}
          <span className="bg-gradient-to-r from-primary-400 via-accent-cyan to-accent-emerald bg-clip-text text-transparent">
            Self-Driving Workflows
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          FlowPilot AI analyzes repetitive organizational bottlenecks, generates optimal end-to-end pipelines, and orchestrates intelligent routing, approvals, and system updates autonomously.
        </p>

        {/* Quick Launch Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => handleLaunchDemo('Admin')}
            className="px-8 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold shadow-xl shadow-primary-600/30 flex items-center gap-2 text-base transition transform hover:-translate-y-0.5"
          >
            <span>Launch Hackathon Demo</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/problems/new')}
            className="px-7 py-3.5 rounded-xl bg-surface-200/80 hover:bg-surface-300 border border-surface-300 text-slate-200 font-semibold transition text-base"
          >
            Submit a Workflow Problem
          </button>
        </div>

        {/* Hackathon Demo Quick Role Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
          <span>Test as:</span>
          {(['Admin', 'Manager', 'Employee', 'Automation Operator'] as const).map((role) => (
            <button
              key={role}
              onClick={() => handleLaunchDemo(role)}
              className="px-2.5 py-1 rounded-md bg-surface-200/70 hover:bg-surface-300 text-slate-300 border border-surface-300/80 transition font-medium"
            >
              {role}
            </button>
          ))}
        </div>
      </section>

      {/* Hackathon Demo Scenario: Before vs After */}
      <section className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        <div className="text-center mb-10">
          <span className="text-xs uppercase font-bold tracking-wider text-accent-cyan">
            Hackathon Showcase Scenario
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-white mt-1">
            Automated Employee Expense Approval
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            See the measurable transformation from slow manual handoffs to AI-driven straight-through processing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Before */}
          <div className="glass-card p-6 rounded-2xl border-rose-500/20 bg-surface-100/60">
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
                BEFORE FLOWPILOT (MANUAL)
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-rose-400" /> 2.5 Days Latency
              </span>
            </div>
            <div className="space-y-3">
              {[
                'Employee fills spreadsheet and manually attaches receipts',
                'Email sent to manager; sits unread in inbox for 36 hours',
                'Manager manually reviews spreadsheet policy compliance',
                'Finance receives email forward and checks budget rows',
                'Finance manually keys transaction into ERP ledger',
                'Employee repeatedly asks in Slack about reimbursement date',
              ].map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-surface-300 grid grid-cols-2 gap-3 text-center">
              <div className="p-2 rounded bg-surface-200/50">
                <p className="text-[11px] text-slate-400">Manual Steps</p>
                <p className="text-lg font-bold text-rose-400">8 handoffs</p>
              </div>
              <div className="p-2 rounded bg-surface-200/50">
                <p className="text-[11px] text-slate-400">Processing Time</p>
                <p className="text-lg font-bold text-rose-400">2.5 Days</p>
              </div>
            </div>
          </div>

          {/* After */}
          <div className="glass-card p-6 rounded-2xl border-accent-emerald/30 bg-surface-100/80 glow-emerald">
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded bg-accent-emerald/20 text-accent-emerald text-xs font-bold border border-accent-emerald/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> AFTER FLOWPILOT AI
              </span>
              <span className="text-xs text-accent-emerald font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> 4.2 Hours (85% Automated)
              </span>
            </div>
            <div className="space-y-3">
              {[
                'Employee submits claim form with receipt upload',
                'Gemini AI categorizes items & evaluates < $1k threshold rule',
                'Manager instantly receives mobile approval push notification',
                'Automated ERP ledger voucher posted upon manager sign-off',
                'Submitter receives real-time confirmation with payout date',
                'AI generates audit compliance report and logs time saved',
              ].map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-accent-emerald flex-shrink-0 mt-0.5" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-surface-300 grid grid-cols-3 gap-3 text-center">
              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-[10px] text-slate-400 uppercase">Automation Rate</p>
                <p className="text-base font-bold text-accent-emerald">85%</p>
              </div>
              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-[10px] text-slate-400 uppercase">Processing Time</p>
                <p className="text-base font-bold text-accent-emerald">4.2 Hours</p>
              </div>
              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-[10px] text-slate-400 uppercase">Time Saved</p>
                <p className="text-base font-bold text-accent-emerald">68%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Capabilities Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="text-center mb-12">
          <span className="text-xs uppercase font-bold tracking-wider text-primary-400">
            End-To-End Architecture
          </span>
          <h2 className="text-3xl font-bold text-white mt-1">
            Engineered for Autonomous Execution
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl hover:border-primary-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Process Analyzer</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Describe your current operational friction. Gemini detects bottlenecks, manual steps, and calculates estimated hours and cost savings.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl hover:border-primary-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-accent-cyan/20 text-accent-cyan flex items-center justify-center mb-4">
              <Workflow className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Visual React Flow Builder</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Interactive node graph supporting Triggers, Tasks, Approvals, AI Decisions, Notifications, and System Data Updates with real-time validation.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl hover:border-primary-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-accent-emerald/20 text-accent-emerald flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Smart Multi-Tier Approvals</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Configurable financial threshold matrices with automatic role escalation, deadline timers, and timestamped immutable audit logs.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-300 py-8 px-6 text-center text-xs text-slate-500 relative z-10">
        <p>FlowPilot AI - Enterprise Smart Automation Platform</p>
      </footer>
    </div>
  );
};
