import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  PlayCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Hourglass,
  RefreshCw,
  Cpu,
  Sparkles,
  Database,
  Bell,
  FileCheck,
  RotateCcw,
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { api } from '../services/api';

export const ExecutionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [execution, setExecution] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [taskComment, setTaskComment] = useState('');
  const [showPayloads, setShowPayloads] = useState(false);

  const fetchExecution = async () => {
    if (!id) return;
    try {
      const data = await api.getExecution(id);
      setExecution(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecution();
    // Poll while running or waiting
    const interval = setInterval(() => {
      if (execution?.status === 'RUNNING' || execution?.status === 'WAITING_APPROVAL' || execution?.status === 'WAITING_TASK') {
        fetchExecution();
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [id, execution?.status]);

  const handleApprove = async (approvalId: string) => {
    setActionLoading(true);
    try {
      await api.approveApproval(approvalId, approvalComment);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      await fetchExecution();
    } catch (err: any) {
      alert('Approval failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (approvalId: string) => {
    setActionLoading(true);
    try {
      await api.rejectApproval(approvalId, approvalComment);
      await fetchExecution();
    } catch (err: any) {
      alert('Reject failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    setActionLoading(true);
    try {
      await api.completeTask(taskId, taskComment);
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      await fetchExecution();
    } catch (err: any) {
      alert('Complete task failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await api.retryExecution(id);
      await fetchExecution();
    } catch (err: any) {
      alert('Retry failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await api.cancelExecution(id);
      await fetchExecution();
    } catch (err: any) {
      alert('Cancel failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400 text-xs">
        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
        Loading execution tracker...
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="glass-card p-8 rounded-2xl text-center">
        <p className="text-sm text-slate-300">Execution record not found</p>
        <Link to="/executions" className="mt-4 inline-block text-xs text-primary-400 hover:underline">
          Return to Executions
        </Link>
      </div>
    );
  }

  const stepExecutions = execution.step_executions || [];
  const pendingApproval = execution.approvals?.find((a: any) => a.status === 'PENDING');
  const activeTask = execution.tasks?.find((t: any) => t.status === 'TODO' || t.status === 'IN_PROGRESS');

  const statusColors: Record<string, string> = {
    COMPLETED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    RUNNING: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 animate-pulse',
    WAITING_APPROVAL: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    WAITING_TASK: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    FAILED: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    CANCELLED: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  const stepIcons: Record<string, any> = {
    trigger: PlayCircle,
    ai_decision: Cpu,
    approval: ShieldCheck,
    task: CheckCircle2,
    data_update: Database,
    notification: Bell,
    report: FileCheck,
    end: CheckCircle2,
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/executions"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Executions</span>
        </Link>
        <button
          onClick={fetchExecution}
          className="p-1.5 rounded-lg bg-surface-200 hover:bg-surface-300 text-slate-300 transition"
          title="Refresh"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Execution Header Card */}
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-surface-300">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${statusColors[execution.status] || ''}`}>
                {execution.status}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Execution ID: {execution.id}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">{execution.workflow_name}</h1>
            <p className="text-xs text-slate-400 mt-1">
              Triggered by <span className="text-slate-200 font-medium">{execution.triggerer_name || 'System'}</span> on{' '}
              {new Date(execution.started_at).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {execution.status === 'FAILED' && (
              <button
                onClick={handleRetry}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Run</span>
              </button>
            )}

            {(execution.status === 'RUNNING' || execution.status === 'WAITING_APPROVAL' || execution.status === 'WAITING_TASK') && (
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="px-3 py-2 rounded-lg bg-surface-200 hover:bg-surface-300 text-slate-400 hover:text-rose-400 text-xs font-medium transition flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel Run</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ACTIVE ACTION INTERACTION BANNER */}
      {/* 1. If WAITING_APPROVAL */}
      {execution.status === 'WAITING_APPROVAL' && pendingApproval && (
        <div className="glass-panel p-6 rounded-2xl border-amber-500/50 bg-amber-950/20 glow-effect space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-amber-500/30">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Manual Approval Required</h3>
                <p className="text-xs text-amber-300/80">
                  Workflow is paused awaiting manager review & authorization.
                </p>
              </div>
            </div>
            {pendingApproval.amount && (
              <span className="text-lg font-extrabold text-white bg-amber-500/30 px-3 py-1 rounded-lg border border-amber-500/40">
                ${Number(pendingApproval.amount).toFixed(2)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-surface-200/60 border border-surface-300/60">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Role</span>
              <span className="font-semibold text-slate-200 mt-0.5 block">{pendingApproval.approver_role}</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-200/60 border border-surface-300/60">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Policy Threshold Applied</span>
              <span className="font-semibold text-amber-300 mt-0.5 block truncate">
                {pendingApproval.threshold_applied || 'Standard Threshold Rule'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-200/60 border border-surface-300/60 text-xs">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Reason / Request Description</span>
            <p className="text-slate-200 mt-1 leading-relaxed">{pendingApproval.reason}</p>
          </div>

          <div className="pt-2">
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Approver Comments (Optional)
            </label>
            <input
              type="text"
              value={approvalComment}
              onChange={(e) => setApprovalComment(e.target.value)}
              placeholder="e.g. Approved. Expenditure verified against Q3 marketing travel budget."
              className="w-full px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 mb-3"
            />

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => handleReject(pendingApproval.id)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition"
              >
                Reject Request
              </button>
              <button
                onClick={() => handleApprove(pendingApproval.id)}
                disabled={actionLoading}
                className="px-6 py-2 rounded-lg bg-accent-emerald hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/30 transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Continue Pipeline</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. If WAITING_TASK */}
      {execution.status === 'WAITING_TASK' && activeTask && (
        <div className="glass-panel p-6 rounded-2xl border-purple-500/50 bg-purple-950/20 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/30">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Actionable Human Task</h3>
                <p className="text-xs text-purple-300/80">Workflow is waiting for task fulfillment.</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/30 text-purple-300 border border-purple-500/40">
              Role: {activeTask.assigned_role}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-200/60 border border-surface-300/60 text-xs">
            <h4 className="font-bold text-slate-200 text-sm mb-1">{activeTask.title}</h4>
            <p className="text-slate-300">{activeTask.description}</p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <input
              type="text"
              value={taskComment}
              onChange={(e) => setTaskComment(e.target.value)}
              placeholder="Fulfillment note (e.g. Ledger voucher ACME-420 verified)"
              className="flex-1 px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500"
            />
            <button
              onClick={() => handleCompleteTask(activeTask.id)}
              disabled={actionLoading}
              className="px-5 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-md shadow-primary-600/30 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Completed</span>
            </button>
          </div>
        </div>
      )}

      {/* Stepper Timeline */}
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-surface-300">
        <h3 className="text-sm font-bold text-white mb-6">Step Execution Telemetry</h3>

        <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-300/80">
          {stepExecutions.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">Initializing step pipeline...</p>
          ) : (
            stepExecutions.map((step: any, idx: number) => {
              const Icon = stepIcons[step.step_type] || CheckCircle2;
              const isCompleted = step.status === 'COMPLETED';
              const isRunning = step.status === 'RUNNING';
              const isFailed = step.status === 'FAILED';

              return (
                <div key={step.id || idx} className="flex items-start gap-4 relative z-10">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold border transition ${
                      isCompleted
                        ? 'bg-accent-emerald text-slate-950 border-accent-emerald'
                        : isRunning
                        ? 'bg-primary-600 text-white border-primary-500 animate-pulse'
                        : isFailed
                        ? 'bg-rose-600 text-white border-rose-500'
                        : 'bg-surface-300 text-slate-400 border-surface-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.step_order}
                  </div>

                  <div className="flex-1 p-3.5 rounded-xl bg-surface-200/50 border border-surface-300/60 hover:border-surface-300 transition">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{step.step_name}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-surface-300 text-slate-300">
                          {step.step_type}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-accent-emerald'
                            : isRunning
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : isFailed
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-surface-300 text-slate-400'
                        }`}
                      >
                        {step.status}
                      </span>
                    </div>

                    {step.error_message && (
                      <p className="text-xs text-rose-400 mt-1 font-mono">{step.error_message}</p>
                    )}

                    {step.output_data && (
                      <div className="mt-2 text-[11px] text-slate-400 font-mono bg-surface-300/40 p-2 rounded truncate">
                        {typeof step.output_data === 'string'
                          ? step.output_data
                          : JSON.stringify(step.output_data)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* AI Decisions Log Card */}
      {execution.ai_decisions && execution.ai_decisions.length > 0 && (
        <div className="glass-card p-6 rounded-2xl border border-purple-500/30 bg-purple-950/10 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-surface-300">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white">AI Autonomous Decision Telemetry</h3>
          </div>

          <div className="space-y-3">
            {execution.ai_decisions.map((ai: any) => {
              const output = typeof ai.decision_output === 'string'
                ? JSON.parse(ai.decision_output)
                : ai.decision_output;

              return (
                <div key={ai.id} className="p-4 rounded-xl bg-surface-200/60 border border-surface-300 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary-300 capitalize">
                      {ai.decision_type.replace(/_/g, ' ')}
                    </span>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-slate-400">Confidence: {(Number(ai.confidence_score) * 100).toFixed(0)}%</span>
                      <span className="px-1.5 py-0.5 rounded bg-surface-300 text-slate-300 font-mono">
                        {ai.latency_ms}ms
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-300 leading-relaxed italic bg-surface-300/30 p-2.5 rounded-lg border border-surface-300/40">
                    "{ai.reasoning}"
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                    <div className="p-2 rounded bg-surface-300/50">
                      <span className="text-slate-400 block text-[10px]">Priority</span>
                      <span className="font-bold text-amber-400 uppercase">{output?.priority || 'medium'}</span>
                    </div>
                    <div className="p-2 rounded bg-surface-300/50">
                      <span className="text-slate-400 block text-[10px]">Assigned Role</span>
                      <span className="font-bold text-slate-200">{output?.recommendedAssigneeRole || output?.assigned_role || 'Manager'}</span>
                    </div>
                    <div className="p-2 rounded bg-surface-300/50">
                      <span className="text-slate-400 block text-[10px]">Approval Gate</span>
                      <span className="font-bold text-accent-emerald">
                        {output?.approvalRequired ? 'Enforced' : 'Auto-Approved'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Input / Output Payloads Dropdown */}
      <div className="glass-card rounded-2xl border border-surface-300 overflow-hidden">
        <button
          onClick={() => setShowPayloads(!showPayloads)}
          className="w-full p-4 flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white"
        >
          <span>Raw Execution Payload Telemetry</span>
          {showPayloads ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showPayloads && (
          <div className="p-4 pt-0 border-t border-surface-300 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 font-semibold block mb-1">Input Data:</span>
              <pre className="p-3 rounded-lg bg-surface-200 overflow-x-auto text-[11px] text-slate-300">
                {JSON.stringify(
                  typeof execution.input_data === 'string'
                    ? JSON.parse(execution.input_data)
                    : execution.input_data,
                  null,
                  2
                )}
              </pre>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block mb-1">Output Data:</span>
              <pre className="p-3 rounded-lg bg-surface-200 overflow-x-auto text-[11px] text-accent-emerald">
                {JSON.stringify(
                  typeof execution.output_data === 'string'
                    ? JSON.parse(execution.output_data)
                    : execution.output_data,
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
