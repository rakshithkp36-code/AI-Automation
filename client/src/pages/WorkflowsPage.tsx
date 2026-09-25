import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Workflow,
  Plus,
  Play,
  ArrowRight,
  Clock,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Search,
  Filter,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const WorkflowsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [executeModalWf, setExecuteModalWf] = useState<any | null>(null);
  const [claimAmount, setClaimAmount] = useState('850');
  const [claimTitle, setClaimTitle] = useState('Q3 Cloud Hosting & Domain Invoices');
  const [executing, setExecuting] = useState(false);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const data = await api.getWorkflows();
      setWorkflows(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleToggleActive = async (wf: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.toggleWorkflowActive(wf.id, !wf.active);
      setWorkflows((prev) =>
        prev.map((w) => (w.id === wf.id ? { ...w, active: !w.active } : w))
      );
    } catch (err: any) {
      alert('Error updating workflow status: ' + err.message);
    }
  };

  const handleExecute = async () => {
    if (!executeModalWf) return;
    setExecuting(true);
    try {
      const res = await api.executeWorkflow(executeModalWf.id, {
        expense_title: claimTitle,
        amount: parseFloat(claimAmount) || 500,
        currency: 'USD',
        vendor: 'Corporate Expense Service',
        department: user?.department || 'Operations',
      });
      setExecuteModalWf(null);
      navigate(`/executions/${res.executionId}`);
    } catch (err: any) {
      alert('Execution failed: ' + err.message);
    } finally {
      setExecuting(false);
    }
  };

  const categories = ['All', 'Finance', 'Operations', 'IT', 'HR', 'Procurement'];

  const filtered = workflows.filter((w) => {
    const matchesCat = selectedCategory === 'All' || w.category === selectedCategory;
    const matchesSearch =
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.description?.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Workflow className="w-6 h-6 text-primary-400" />
            <span>Automated Workflows</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Enterprise automation pipelines with AI decision routing, step execution, and audit logging.
          </p>
        </div>

        <Link
          to="/workflows/new"
          className="px-4 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-md shadow-primary-600/30 flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Workflow</span>
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex-shrink-0 ${
                selectedCategory === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-200 text-slate-300 hover:bg-surface-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workflows..."
            className="w-full pl-9 pr-3 py-1.5 bg-surface-200 border border-surface-300 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500"
          />
        </div>
      </div>

      {/* Workflow Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading workflows...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl border border-surface-300">
          <Workflow className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No workflows found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Build your first workflow or generate one from problem discovery.
          </p>
          <Link
            to="/workflows/new"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Create Workflow</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((w) => {
            const priorityColors: Record<string, string> = {
              critical: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
              high: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
              medium: 'bg-primary-500/20 text-primary-300 border-primary-500/30',
              low: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
            };

            return (
              <div
                key={w.id}
                className="glass-card p-5 rounded-xl border border-surface-300/80 hover:border-primary-500/40 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-300 text-slate-300">
                      {w.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.2 rounded text-[10px] font-bold border uppercase ${
                          priorityColors[w.priority] || ''
                        }`}
                      >
                        {w.priority}
                      </span>
                      <button
                        onClick={(e) => handleToggleActive(w, e)}
                        title={w.active ? 'Click to deactivate' : 'Click to activate'}
                        className="text-slate-400 hover:text-white transition"
                      >
                        {w.active ? (
                          <ToggleRight className="w-5 h-5 text-accent-emerald" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-slate-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Link to={`/workflows/${w.id}`}>
                    <h3 className="text-base font-bold text-white hover:text-primary-300 transition">
                      {w.name}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {w.description || 'No description provided.'}
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-surface-200/50 text-[11px] text-slate-300 text-center">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Steps</span>
                      <span className="font-bold text-slate-200">{w.step_count || 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">SLA</span>
                      <span className="font-bold text-slate-200">{w.sla_hours}h</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Runs</span>
                      <span className="font-bold text-primary-300">{w.execution_count || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-surface-300/60 flex items-center justify-between gap-2">
                  <Link
                    to={`/workflows/${w.id}/builder`}
                    className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 transition"
                  >
                    <Layers className="w-3.5 h-3.5 text-primary-400" />
                    <span>Visual Builder</span>
                  </Link>

                  <button
                    onClick={() => setExecuteModalWf(w)}
                    className="px-3 py-1.5 rounded-lg bg-primary-600/30 hover:bg-primary-600 text-primary-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 border border-primary-500/40"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Execute</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Execute Workflow Modal */}
      {executeModalWf && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel p-6 rounded-2xl border border-surface-300 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-surface-300">
              <div className="w-9 h-9 rounded-xl bg-primary-600/30 text-primary-400 flex items-center justify-center">
                <Play className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Execute Workflow</h3>
                <p className="text-xs text-slate-400 truncate max-w-xs">{executeModalWf.name}</p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Request / Expense Title
                </label>
                <input
                  type="text"
                  value={claimTitle}
                  onChange={(e) => setClaimTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Transaction Amount ($)
                </label>
                <input
                  type="number"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-primary-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  AI routing evaluates amounts: &lt; $1,000 (Manager), &gt; $1,000 (Dept Head), &gt; $10,000 (Director).
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setExecuteModalWf(null)}
                className="px-4 py-2 rounded-lg bg-surface-200 hover:bg-surface-300 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={executing}
                onClick={handleExecute}
                className="px-5 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-primary-600/30 flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{executing ? 'Starting Run...' : 'Launch Execution'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
