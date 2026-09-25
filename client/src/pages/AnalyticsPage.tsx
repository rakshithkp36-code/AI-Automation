import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  DollarSign,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { api } from '../services/api';

export const AnalyticsPage: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [monthlyVolume, setMonthlyVolume] = useState(150);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await api.getAnalyticsOverview();
      setOverview(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const departmentData = [
    { department: 'Finance', beforeHours: 60, afterHours: 9.8, savedPercent: 83 },
    { department: 'Operations', beforeHours: 96, afterHours: 18.2, savedPercent: 81 },
    { department: 'IT Provisioning', beforeHours: 48, afterHours: 4.5, savedPercent: 90 },
    { department: 'HR Intake', beforeHours: 36, afterHours: 7.2, savedPercent: 80 },
    { department: 'Procurement', beforeHours: 72, afterHours: 12.0, savedPercent: 83 },
  ];

  const weeklyTrendData = [
    { week: 'Week 1', completed: 24, failed: 1, automated: 22 },
    { week: 'Week 2', completed: 38, failed: 0, automated: 35 },
    { week: 'Week 3', completed: 45, failed: 1, automated: 42 },
    { week: 'Week 4', completed: 62, failed: 2, automated: 58 },
  ];

  const bottleneckData = [
    { stage: 'Manager Approval Review', delayShare: 64 },
    { stage: 'Manual Data Transcription', delayShare: 18 },
    { stage: 'Document Compliance Check', delayShare: 11 },
    { stage: 'Third-party API Webhooks', delayShare: 7 },
  ];

  // Dynamic ROI calculation
  const hoursReclaimedPerMonth = Math.round(monthlyVolume * 2.8);
  const dollarsSavedPerMonth = Math.round(hoursReclaimedPerMonth * 65);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-accent-cyan" />
            <span>Operational Automation Analytics</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time throughput metrics, cost reduction benchmarks, and AI bottleneck diagnoses.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="p-2 rounded-lg bg-surface-200 hover:bg-surface-300 text-slate-300 transition self-start sm:self-auto"
          title="Refresh Metrics"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-xl border border-surface-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Automation Rate</span>
            <div className="w-8 h-8 rounded-lg bg-accent-emerald/20 text-accent-emerald flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-accent-emerald">85.4%</div>
          <p className="text-[11px] text-slate-400 mt-1">Hands-off autonomous execution</p>
        </div>

        <div className="glass-card p-5 rounded-xl border border-surface-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Turnaround Time</span>
            <div className="w-8 h-8 rounded-lg bg-primary-500/20 text-primary-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">4.2 Hours</div>
          <p className="text-[11px] text-slate-400 mt-1">Reduced from 2.5 days (83% reduction)</p>
        </div>

        <div className="glass-card p-5 rounded-xl border border-surface-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Reclaimed Hours</span>
            <div className="w-8 h-8 rounded-lg bg-accent-cyan/20 text-accent-cyan flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-accent-cyan">384 Hours</div>
          <p className="text-[11px] text-slate-400 mt-1">Re-allocated to strategic operations</p>
        </div>

        <div className="glass-card p-5 rounded-xl border border-surface-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Estimated Savings</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-purple-300">$24,800</div>
          <p className="text-[11px] text-slate-400 mt-1">In operational overhead saved</p>
        </div>
      </div>

      {/* Two Columns Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Processing Time Before vs After per Department */}
        <div className="glass-card p-6 rounded-2xl border border-surface-300">
          <h3 className="text-sm font-bold text-white mb-1">
            Department Processing Duration (Hours)
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Comparison between legacy manual procedures and FlowPilot AI
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232D3F" />
                <XAxis dataKey="department" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141A24', borderColor: '#232D3F', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="beforeHours" name="Manual Duration (Hours)" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="afterHours" name="FlowPilot AI (Hours)" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Weekly Execution Volumes */}
        <div className="glass-card p-6 rounded-2xl border border-surface-300">
          <h3 className="text-sm font-bold text-white mb-1">Weekly Execution Throughput</h3>
          <p className="text-xs text-slate-400 mb-4">
            Completed vs autonomously executed workflow volume
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAutomated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#232D3F" />
                <XAxis dataKey="week" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141A24', borderColor: '#232D3F', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="completed" stroke="#10B981" fillOpacity={1} fill="url(#colorCompleted)" name="Total Completed" />
                <Area type="monotone" dataKey="automated" stroke="#6366F1" fillOpacity={1} fill="url(#colorAutomated)" name="Autonomous Runs" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottlenecks and Interactive ROI Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identified Bottlenecks */}
        <div className="glass-card p-6 rounded-2xl border border-surface-300">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>AI Bottleneck Share Diagnostics</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Percentage breakdown of where operational processes spend the most idle time.
          </p>

          <div className="space-y-3">
            {bottleneckData.map((b, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{b.stage}</span>
                  <span className="font-bold text-amber-400">{b.delayShare}% of latency</span>
                </div>
                <div className="w-full bg-surface-300 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                    style={{ width: `${b.delayShare}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 p-3 rounded-xl bg-surface-200/60 border border-surface-300/60 text-xs text-slate-300">
            <span className="font-bold text-accent-cyan block mb-1">AI Recommendation</span>
            Approver wait times can be reduced by 50% by enabling auto-approval thresholds for repeat vendors under $500.
          </div>
        </div>

        {/* Interactive ROI Calculator */}
        <div className="glass-panel p-6 rounded-2xl border-primary-500/30 bg-gradient-to-br from-surface-100 to-primary-950/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-accent-cyan" />
            <h3 className="text-sm font-bold text-white">Interactive Operational ROI Calculator</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Adjust monthly transaction volume to forecast organizational capacity savings.
          </p>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300">Monthly Workflow Executions:</span>
                <span className="font-bold text-primary-400 font-mono text-sm">{monthlyVolume} requests</span>
              </div>
              <input
                type="range"
                min={20}
                max={1000}
                step={10}
                value={monthlyVolume}
                onChange={(e) => setMonthlyVolume(Number(e.target.value))}
                className="w-full accent-primary-500 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-surface-200/80 border border-surface-300">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Capacity Reclaimed / Month
                </span>
                <span className="text-xl font-extrabold text-accent-cyan mt-1 block">
                  {hoursReclaimedPerMonth} Hours
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-200/80 border border-surface-300">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Estimated Cost Savings / Month
                </span>
                <span className="text-xl font-extrabold text-accent-emerald mt-1 block">
                  ${dollarsSavedPerMonth.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 leading-relaxed italic">
              Based on standard benchmark of 2.8 manual hours saved per multi-stage execution at $65/hr fully loaded operational cost.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
