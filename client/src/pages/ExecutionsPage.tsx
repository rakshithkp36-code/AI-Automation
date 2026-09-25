import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlayCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Hourglass,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';

export const ExecutionsPage: React.FC = () => {
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchExecutions = async () => {
    try {
      setLoading(true);
      const data = await api.getExecutions();
      setExecutions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
  }, []);

  const statuses = ['ALL', 'RUNNING', 'WAITING_APPROVAL', 'WAITING_TASK', 'COMPLETED', 'FAILED'];

  const filtered = executions.filter((e) => {
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    const matchesSearch =
      e.workflow_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusBadges: Record<string, { label: string; color: string; icon: any }> = {
    RUNNING: { label: 'Running', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 animate-pulse', icon: RefreshCw },
    WAITING_APPROVAL: { label: 'Waiting Approval', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: Hourglass },
    WAITING_TASK: { label: 'Waiting Task', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: Hourglass },
    COMPLETED: { label: 'Completed', color: 'bg-accent-emerald/20 text-accent-emerald border-accent-emerald/30', icon: CheckCircle2 },
    FAILED: { label: 'Failed', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30', icon: AlertCircle },
    CANCELLED: { label: 'Cancelled', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: AlertCircle },
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <PlayCircle className="w-6 h-6 text-accent-cyan" />
            <span>Workflow Executions</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time execution telemetry, active approval wait states, and step audit histories.
          </p>
        </div>

        <button
          onClick={fetchExecutions}
          className="p-2 rounded-lg bg-surface-200 hover:bg-surface-300 text-slate-300 transition self-start sm:self-auto"
          title="Refresh Executions"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex-shrink-0 ${
                statusFilter === s
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-200 text-slate-300 hover:bg-surface-300'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search execution..."
            className="w-full pl-9 pr-3 py-1.5 bg-surface-200 border border-surface-300 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl border border-surface-300 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading execution telemetry...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No matching executions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-surface-200/50 border-b border-surface-300 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 font-semibold">Workflow</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Step Progress</th>
                  <th className="py-3 px-4 font-semibold">Started At</th>
                  <th className="py-3 px-4 font-semibold">Triggered By</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-300/40">
                {filtered.map((e) => {
                  const badge = statusBadges[e.status] || {
                    label: e.status,
                    color: 'bg-surface-300 text-slate-300',
                    icon: Hourglass,
                  };
                  const Icon = badge.icon;
                  const totalSteps = e.total_steps || 8;
                  const curr = e.status === 'COMPLETED' ? totalSteps : e.current_step_index || 1;
                  const pct = Math.min(100, Math.round((curr / totalSteps) * 100));

                  return (
                    <tr key={e.id} className="hover:bg-surface-200/40 transition">
                      <td className="py-3 px-4">
                        <Link to={`/executions/${e.id}`} className="font-bold text-slate-200 hover:text-primary-300">
                          {e.workflow_name}
                        </Link>
                        <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                          {e.id.substring(0, 13)}...
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold border ${badge.color}`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="w-32">
                          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                            <span>Step {curr} of {totalSteps}</span>
                            <span>{pct}%</span>
                          </div>
                          <div className="w-full bg-surface-300 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                e.status === 'COMPLETED'
                                  ? 'bg-accent-emerald'
                                  : e.status === 'FAILED'
                                  ? 'bg-rose-500'
                                  : 'bg-primary-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(e.started_at).toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        {e.triggerer_name || 'System Operator'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/executions/${e.id}`}
                          className="px-3 py-1 rounded bg-surface-200 hover:bg-surface-300 text-slate-200 font-medium text-xs transition inline-flex items-center gap-1"
                        >
                          <span>Track</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
