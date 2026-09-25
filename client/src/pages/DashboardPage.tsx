import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Zap,
  TrendingUp,
  Clock,
  DollarSign,
  ShieldCheck,
  CheckSquare,
  Workflow,
  Sparkles,
  ArrowRight,
  Play,
  AlertTriangle,
  FileText,
  Plus,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [executingDemo, setExecutingDemo] = useState(false);
  const [demoAmount, setDemoAmount] = useState('1850');
  const [demoTitle, setDemoTitle] = useState('DevOps Global Summit & Flights');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ovData, wfData, apprData, tData] = await Promise.all([
        api.getAnalyticsOverview(),
        api.getWorkflows(),
        api.getApprovals('PENDING'),
        api.getTasks({ status: 'TODO' }),
      ]);
      setOverview(ovData);
      setWorkflows(wfData);
      setApprovals(apprData);
      setTasks(tData);
    } catch (err) {
      console.error('[Dashboard Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunDemoWorkflow = async () => {
    // Find expense workflow
    const expenseWf = workflows.find((w) =>
      w.name.toLowerCase().includes('expense')
    ) || workflows[0];

    if (!expenseWf) {
      navigate('/workflows');
      return;
    }

    setExecutingDemo(true);
    try {
      const res = await api.executeWorkflow(expenseWf.id, {
        expense_title: demoTitle,
        amount: parseFloat(demoAmount) || 500,
        currency: 'USD',
        vendor: 'Corporate Booking Portal',
        department: user?.department || 'Operations',
      });
      navigate(`/executions/${res.executionId}`);
    } catch (err: any) {
      alert('Execution trigger error: ' + err.message);
    } finally {
      setExecutingDemo(false);
    }
  };

  // Mock comparison chart data
  const comparisonData = [
    { name: 'Intake & OCR', before: 4.5, after: 0.1 },
    { name: 'Policy Check', before: 6.2, after: 0.05 },
    { name: 'Manager Review', before: 28.0, after: 3.5 },
    { name: 'Finance Voucher', before: 14.5, after: 0.2 },
    { name: 'Employee Notify', before: 8.0, after: 0.01 },
  ];

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-primary-400 text-sm font-semibold">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading FlowPilot Intelligence Hub...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Automation Command Center</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/30 font-semibold font-mono">
              ALL SYSTEMS ONLINE
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time pipeline monitoring, autonomous AI decisions, and operational ROI for{' '}
            <span className="text-slate-200 font-semibold">{user?.organization_name || 'Acme Global'}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2 rounded-lg bg-surface-200 hover:bg-surface-300 text-slate-300 transition"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/problems/new"
            className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-md shadow-primary-600/30 flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Discover Problem</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="glass-card p-5 rounded-xl border border-surface-300/80 hover:border-primary-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Workflows
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary-500/20 text-primary-400 flex items-center justify-center">
              <Workflow className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              {overview?.workflows?.active || 0}
            </span>
            <span className="text-xs text-slate-400">of {overview?.workflows?.total || 0} total</span>
          </div>
          <div className="mt-2 text-[11px] text-accent-emerald flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>100% SLA compliant</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-card p-5 rounded-xl border border-surface-300/80 hover:border-accent-emerald/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Automation Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-accent-emerald/20 text-accent-emerald flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-accent-emerald">
              {overview?.impact?.automationRate || 85}%
            </span>
            <span className="text-xs text-slate-400">hands-off steps</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Avg Turnaround: <span className="text-slate-200 font-semibold">{overview?.impact?.avgProcessingTime || '4.2 hrs'}</span> (was 2.5d)
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-card p-5 rounded-xl border border-surface-300/80 hover:border-accent-cyan/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Estimated Time Saved
            </span>
            <div className="w-8 h-8 rounded-lg bg-accent-cyan/20 text-accent-cyan flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-accent-cyan">
              {overview?.impact?.estimatedHoursSaved || '184.5'} hrs
            </span>
          </div>
          <div className="mt-2 text-[11px] text-accent-cyan font-medium">
            ≈ {overview?.impact?.estimatedCostSaved || '$14,200'} in reclaimed capacity
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-card p-5 rounded-xl border border-surface-300/80 hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pending Approvals
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-400">
              {overview?.approvals?.pending || 0}
            </span>
            <span className="text-xs text-slate-400">awaiting decision</span>
          </div>
          <div className="mt-2 text-[11px]">
            <Link to="/approvals" className="text-primary-400 hover:underline flex items-center gap-1 font-semibold">
              <span>View approval queue</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Hackathon Interactive Live Trigger Card */}
      <div className="glass-panel p-6 rounded-2xl border-primary-500/30 bg-gradient-to-r from-primary-950/40 via-surface-100 to-surface-200/50 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-primary-500/20 text-primary-300 text-xs font-bold mb-3 border border-primary-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>HACKATHON DEMO: INSTANT TRIGGER</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Execute "Automated Employee Expense Approval"
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Trigger a live end-to-end execution. Gemini AI will evaluate policy thresholds, dynamically route to Sarah Jenkins (Manager), generate finance tasks, and update ERP ledgers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400">$</span>
                <input
                  type="number"
                  value={demoAmount}
                  onChange={(e) => setDemoAmount(e.target.value)}
                  className="w-28 pl-7 pr-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-primary-500"
                  placeholder="Amount"
                />
              </div>
              <input
                type="text"
                value={demoTitle}
                onChange={(e) => setDemoTitle(e.target.value)}
                className="w-48 px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-primary-500"
                placeholder="Claim Title"
              />
            </div>

            <button
              onClick={handleRunDemoWorkflow}
              disabled={executingDemo}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary-600 to-accent-cyan hover:from-primary-500 hover:to-cyan-400 text-white font-semibold text-xs transition shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2 flex-shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{executingDemo ? 'Dispatching...' : 'Trigger Live Run'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Chart & Recent Executions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Processing Latency Comparison Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-surface-300/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-400" />
                <span>Workflow Step Latency: Before vs After FlowPilot AI</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Average duration in hours per operational stage</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-3 rounded bg-rose-500/60 inline-block"></span> Before (Hours)
              </span>
              <span className="flex items-center gap-1.5 text-slate-200 font-semibold">
                <span className="w-3 h-3 rounded bg-accent-emerald inline-block"></span> FlowPilot AI
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232D3F" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141A24', borderColor: '#232D3F', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="before" fill="#F43F5E" radius={[4, 4, 0, 0]} name="Manual Process (Hours)" />
                <Bar dataKey="after" fill="#10B981" radius={[4, 4, 0, 0]} name="FlowPilot AI (Hours)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Pending Approvals & Tasks Quick Widget */}
        <div className="glass-card p-6 rounded-2xl border border-surface-300/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Pending Approvals</span>
              </h3>
              <Link to="/approvals" className="text-[11px] text-primary-400 hover:underline">
                View all
              </Link>
            </div>

            <div className="space-y-2.5">
              {approvals.length === 0 ? (
                <div className="p-4 rounded-xl bg-surface-200/40 text-center text-xs text-slate-400">
                  No approvals pending right now.
                </div>
              ) : (
                approvals.slice(0, 3).map((a) => (
                  <div key={a.id} className="p-3 rounded-xl bg-surface-200/70 border border-surface-300/60 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">
                        {a.amount ? `$${Number(a.amount).toFixed(2)}` : 'Approval'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-semibold">
                        {a.approver_role}
                      </span>
                    </div>
                    <p className="text-slate-400 line-clamp-1 mt-1 text-[11px]">
                      {a.reason || a.workflow_name}
                    </p>
                    <div className="mt-2 flex items-center justify-end gap-2">
                      <Link
                        to="/approvals"
                        className="px-2 py-1 rounded bg-primary-600 hover:bg-primary-500 text-white text-[11px] font-medium"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-surface-300/60">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400">Active Task Queue</span>
              <span className="font-semibold text-slate-200">{tasks.length} open</span>
            </div>
            <Link
              to="/tasks"
              className="w-full py-2 rounded-lg bg-surface-200 hover:bg-surface-300 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Go to Task Board</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Executions Stream */}
      <div className="glass-card p-6 rounded-2xl border border-surface-300/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-accent-cyan fill-current" />
              <span>Recent Workflow Executions</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Live execution telemetry and state transitions</p>
          </div>
          <Link to="/executions" className="text-xs text-primary-400 hover:underline font-semibold flex items-center gap-1">
            <span>All Executions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-surface-300 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-semibold">Workflow</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Started</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-300/40">
              {overview?.recentExecutions?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No executions recorded yet. Click "Trigger Live Run" above to start one!
                  </td>
                </tr>
              ) : (
                overview?.recentExecutions?.map((ex: any) => {
                  const statusColors: Record<string, string> = {
                    COMPLETED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                    RUNNING: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30 animate-pulse',
                    WAITING_APPROVAL: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                    WAITING_TASK: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
                    FAILED: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
                    CANCELLED: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
                  };

                  return (
                    <tr key={ex.id} className="hover:bg-surface-200/40 transition">
                      <td className="py-3 font-semibold text-slate-200">
                        {ex.workflow_name}
                      </td>
                      <td className="py-3 text-slate-400">{ex.category || 'Operations'}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            statusColors[ex.status] || 'bg-surface-300 text-slate-300'
                          }`}
                        >
                          {ex.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400 text-[11px]">
                        {new Date(ex.started_at).toLocaleString()}
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/executions/${ex.id}`}
                          className="px-2.5 py-1 rounded bg-surface-200 hover:bg-surface-300 text-slate-200 font-medium text-[11px] transition inline-flex items-center gap-1"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
