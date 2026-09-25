import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Workflow,
  Play,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  Cpu,
  ShieldCheck,
  Bell,
  Database,
  FileCheck,
} from 'lucide-react';
import { api } from '../services/api';

export const WorkflowDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [workflow, setWorkflow] = useState<any>(null);
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflow = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [wf, allExecs] = await Promise.all([
        api.getWorkflow(id),
        api.getExecutions(),
      ]);
      setWorkflow(wf);
      setExecutions(allExecs.filter((e) => e.workflow_id === id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflow();
  }, [id]);

  const handleExecute = async () => {
    if (!id) return;
    setExecuting(true);
    try {
      const res = await api.executeWorkflow(id, {
        expense_title: 'Manual Workflow Run - ' + new Date().toLocaleTimeString(),
        amount: 450,
        currency: 'USD',
      });
      navigate(`/executions/${res.executionId}`);
    } catch (err: any) {
      alert('Execution failed: ' + err.message);
    } finally {
      setExecuting(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await api.deleteWorkflow(id);
      navigate('/workflows');
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400 text-xs">
        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
        Loading workflow...
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="glass-card p-8 rounded-2xl text-center">
        <p className="text-sm text-slate-300">Workflow not found</p>
        <Link to="/workflows" className="mt-4 inline-block text-xs text-primary-400 hover:underline">
          Return to Workflows
        </Link>
      </div>
    );
  }

  const stepIcons: Record<string, any> = {
    trigger: Play,
    ai_decision: Cpu,
    approval: ShieldCheck,
    task: CheckCircle2,
    data_update: Database,
    notification: Bell,
    report: FileCheck,
    end: CheckCircle2,
  };

  const stepColors: Record<string, string> = {
    trigger: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    ai_decision: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    approval: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    task: 'bg-primary-500/20 text-primary-400 border-primary-500/30',
    data_update: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    notification: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    report: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    end: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          to="/workflows"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Workflows</span>
        </Link>
        <span className="text-[11px] text-slate-500 font-mono">Version {workflow.version || 1}</span>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Header Card */}
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-surface-300">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-surface-300 text-primary-300">
                {workflow.category}
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-primary-500/20 text-primary-300 border border-primary-500/30">
                Trigger: {workflow.trigger_type}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  workflow.active
                    ? 'bg-accent-emerald/20 text-accent-emerald'
                    : 'bg-slate-500/20 text-slate-400'
                }`}
              >
                {workflow.active ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white">{workflow.name}</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
              {workflow.description}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap md:flex-col gap-2 flex-shrink-0">
            <Link
              to={`/workflows/${workflow.id}/builder`}
              className="px-4 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-md shadow-primary-600/30 flex items-center justify-center gap-2 transition"
            >
              <Layers className="w-4 h-4" />
              <span>Open Visual Builder</span>
            </Link>

            <button
              onClick={handleExecute}
              disabled={executing}
              className="px-4 py-2.5 rounded-lg bg-surface-200 hover:bg-surface-300 border border-surface-300 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <Play className="w-4 h-4 fill-current text-accent-emerald" />
              <span>{executing ? 'Executing...' : 'Run Workflow Now'}</span>
            </button>

            <button
              onClick={handleDelete}
              className="px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Info stats */}
        <div className="mt-6 pt-6 border-t border-surface-300/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-surface-200/50">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Steps</span>
            <span className="font-bold text-slate-200 mt-0.5 block">{workflow.steps?.length || 0} nodes</span>
          </div>
          <div className="p-3 rounded-xl bg-surface-200/50">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Priority</span>
            <span className="font-bold text-amber-400 mt-0.5 block uppercase">{workflow.priority}</span>
          </div>
          <div className="p-3 rounded-xl bg-surface-200/50">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">SLA Commitment</span>
            <span className="font-bold text-accent-cyan mt-0.5 block">{workflow.sla_hours} Hours</span>
          </div>
          <div className="p-3 rounded-xl bg-surface-200/50">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Runs</span>
            <span className="font-bold text-accent-emerald mt-0.5 block">{executions.length} recorded</span>
          </div>
        </div>
      </div>

      {/* Steps Sequence List */}
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-surface-300">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-surface-300">
          <div>
            <h2 className="text-base font-bold text-white">Step Sequence Pipeline</h2>
            <p className="text-xs text-slate-400">Deterministic workflow nodes and autonomous AI decisions</p>
          </div>
          <Link
            to={`/workflows/${workflow.id}/builder`}
            className="text-xs font-semibold text-primary-400 hover:underline flex items-center gap-1"
          >
            <span>Edit in Graph Builder</span>
          </Link>
        </div>

        <div className="space-y-3">
          {workflow.steps?.map((step: any, idx: number) => {
            const Icon = stepIcons[step.step_type] || CheckCircle2;
            const color = stepColors[step.step_type] || 'bg-surface-300 text-slate-300';

            return (
              <div
                key={step.id || idx}
                className="p-4 rounded-xl bg-surface-200/50 border border-surface-300/60 flex items-start gap-4 hover:border-surface-300 transition"
              >
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-surface-300 text-xs font-bold text-slate-300 flex-shrink-0 mt-0.5">
                  {step.order_index}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-bold text-white text-sm">{step.name}</span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-bold border uppercase ${color}`}>
                      {step.step_type}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Assignee: <span className="text-slate-200 font-semibold">{step.assignee_role || 'Employee'}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>
                </div>

                {step.next_step_order && (
                  <div className="text-[10px] text-slate-500 font-mono hidden sm:block flex-shrink-0">
                    Next: Step {step.next_step_order}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Execution History */}
      <div className="glass-card p-6 rounded-2xl border border-surface-300">
        <h3 className="text-sm font-bold text-white mb-4">Workflow Execution History</h3>
        {executions.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No runs recorded for this workflow yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-surface-300 text-slate-400 uppercase text-[10px]">
                  <th className="pb-2">Execution ID</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Started At</th>
                  <th className="pb-2">Triggered By</th>
                  <th className="pb-2 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-300/40">
                {executions.map((e) => (
                  <tr key={e.id} className="hover:bg-surface-200/30">
                    <td className="py-2.5 font-mono text-[11px] text-slate-300">{e.id.substring(0, 8)}...</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-300 text-slate-200">
                        {e.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-400 text-[11px]">{new Date(e.started_at).toLocaleString()}</td>
                    <td className="py-2.5 text-slate-300">{e.triggerer_name || 'System'}</td>
                    <td className="py-2.5 text-right">
                      <Link to={`/executions/${e.id}`} className="text-primary-400 hover:underline font-semibold">
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
