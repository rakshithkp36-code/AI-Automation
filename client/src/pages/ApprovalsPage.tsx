import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ApprovalsPage: React.FC = () => {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [activeModalAppr, setActiveModalAppr] = useState<any | null>(null);
  const [decisionType, setDecisionType] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const data = await api.getApprovals(statusFilter === 'ALL' ? undefined : statusFilter);
      setApprovals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [statusFilter]);

  const handleOpenDecision = (appr: any, type: 'APPROVED' | 'REJECTED') => {
    setActiveModalAppr(appr);
    setDecisionType(type);
    setComment(
      type === 'APPROVED'
        ? 'Approved. Transaction conforms to corporate operational and financial budget guidelines.'
        : 'Rejected. Please revise line items or attach updated purchase documentation.'
    );
  };

  const handleConfirmDecision = async () => {
    if (!activeModalAppr) return;
    setSubmitting(true);
    try {
      if (decisionType === 'APPROVED') {
        await api.approveApproval(activeModalAppr.id, comment);
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } else {
        await api.rejectApproval(activeModalAppr.id, comment);
      }
      setActiveModalAppr(null);
      await fetchApprovals();
    } catch (err: any) {
      alert('Decision error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <span>Approvals Authorization Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review threshold-evaluated requests, grant sign-offs, and track compliance audit histories.
          </p>
        </div>

        <button
          onClick={fetchApprovals}
          className="p-2 rounded-lg bg-surface-200 hover:bg-surface-300 text-slate-300 transition self-start sm:self-auto"
          title="Refresh Approvals"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-300 pb-2">
        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === tab
                ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
                : 'text-slate-400 hover:text-white hover:bg-surface-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Approvals List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading approvals queue...</div>
      ) : approvals.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl border border-surface-300">
          <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No approvals found</h3>
          <p className="text-xs text-slate-400 mt-1">
            {statusFilter === 'PENDING'
              ? 'Great work! There are no pending requests waiting for your authorization.'
              : 'No records matching the selected status.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {approvals.map((a) => {
            const isPending = a.status === 'PENDING';
            const isApproved = a.status === 'APPROVED';
            const isRejected = a.status === 'REJECTED';

            return (
              <div
                key={a.id}
                className="glass-card p-5 rounded-xl border border-surface-300/80 hover:border-surface-200 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-300 text-slate-300">
                      Role: {a.approver_role}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                        isPending
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : isApproved
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-base font-bold text-white">
                      {a.amount ? `$${Number(a.amount).toFixed(2)}` : 'Approval Sign-off'}
                    </h3>
                    {a.threshold_applied && (
                      <span className="text-[10px] text-amber-300 font-mono truncate max-w-[200px]">
                        {a.threshold_applied}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {a.reason || 'Operational request requiring review'}
                  </p>

                  <div className="mt-3 p-2.5 rounded-lg bg-surface-200/50 text-[11px] text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Workflow:</span>
                      <span className="text-slate-200 font-medium truncate max-w-[200px]">
                        {a.workflow_name || 'Standard Pipeline'}
                      </span>
                    </div>
                    {a.deadline && (
                      <div className="flex justify-between">
                        <span>Deadline:</span>
                        <span className="text-rose-400 font-medium">
                          {new Date(a.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {a.comments && (
                      <div className="pt-1 border-t border-surface-300/40 text-slate-300 italic">
                        "{a.comments}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-surface-300/60 flex items-center justify-between gap-2">
                  {a.execution_id ? (
                    <Link
                      to={`/executions/${a.execution_id}`}
                      className="text-xs font-semibold text-primary-400 hover:underline flex items-center gap-1"
                    >
                      <span>Track Run</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : <div />}

                  {isPending && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenDecision(a, 'REJECTED')}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition border border-rose-500/30"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleOpenDecision(a, 'APPROVED')}
                        className="px-4 py-1.5 rounded-lg bg-accent-emerald hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-md shadow-emerald-500/30 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Decision Modal */}
      {activeModalAppr && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel p-6 rounded-2xl border border-surface-300 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-surface-300">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  decisionType === 'APPROVED'
                    ? 'bg-accent-emerald/20 text-accent-emerald'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {decisionType === 'APPROVED' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {decisionType === 'APPROVED' ? 'Authorize Approval' : 'Reject Request'}
                </h3>
                <p className="text-xs text-slate-400">
                  {activeModalAppr.amount ? `$${Number(activeModalAppr.amount).toFixed(2)}` : 'Approval'}
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <p className="text-xs text-slate-300">{activeModalAppr.reason}</p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Audit Comment / Rationale
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveModalAppr(null)}
                className="px-4 py-2 rounded-lg bg-surface-200 hover:bg-surface-300 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmDecision}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition shadow-md ${
                  decisionType === 'APPROVED'
                    ? 'bg-accent-emerald hover:bg-emerald-400 text-slate-950'
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
              >
                {submitting ? 'Submitting...' : decisionType === 'APPROVED' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
