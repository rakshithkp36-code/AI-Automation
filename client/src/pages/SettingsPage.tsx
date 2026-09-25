import React, { useState, useEffect } from 'react';
import {
  Settings,
  Cpu,
  Key,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Sliders,
  History,
} from 'lucide-react';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [savingKey, setSavingKey] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(true);

  // Thresholds state
  const [tier1, setTier1] = useState('1000');
  const [tier2, setTier2] = useState('10000');

  const fetchStatusAndAudit = async () => {
    try {
      const [status, logs] = await Promise.all([
        api.getAiStatus(),
        api.getAuditLogs(),
      ]);
      setAiStatus(status);
      setAuditLogs(logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAudit(false);
    }
  };

  useEffect(() => {
    fetchStatusAndAudit();
  }, []);

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    setSavingKey(true);
    setMessage(null);
    try {
      const res = await api.updateSettings({ geminiApiKey: apiKey });
      setMessage('Gemini API key updated successfully! AI Engine is live.');
      setAiStatus({
        ...aiStatus,
        hasApiKey: res.hasApiKey,
        mode: res.mode,
      });
      setApiKey('');
    } catch (err: any) {
      setMessage('Failed to update API key: ' + err.message);
    } finally {
      setSavingKey(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-primary-400" />
          <span>Platform & Automation Governance</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure server-side AI model credentials, financial approval gates, and review immutable audit records.
        </p>
      </div>

      {/* 1. Gemini AI Configuration Card */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl border-primary-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-300 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-cyan flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Google Gemini GenAI Service</h2>
              <p className="text-xs text-slate-400">Server-side secure connection via @google/genai</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                aiStatus?.hasApiKey
                  ? 'bg-accent-emerald/20 text-accent-emerald border-accent-emerald/30'
                  : 'bg-primary-500/20 text-primary-300 border-primary-500/30'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
              <span>{aiStatus?.hasApiKey ? 'Live GenAI Active (Gemini 2.5 Flash)' : 'Intelligent Heuristic Engine Active'}</span>
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          FlowPilot AI operates securely on the server. If a live <code className="text-accent-cyan">GEMINI_API_KEY</code> is configured, all problem analyses, workflow architectures, and routing decisions are evaluated dynamically by Google Gemini. In the absence of an API key or during network disruptions, our zero-dependency heuristic engine guarantees continuous hackathon operation.
        </p>

        {message && (
          <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-accent-emerald text-xs">
            {message}
          </div>
        )}

        <form onSubmit={handleSaveApiKey} className="pt-2 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste GEMINI_API_KEY (AIzaSy...)"
              className="w-full pl-9 pr-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={savingKey || !apiKey.trim()}
            className="px-5 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-primary-600/30 transition flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{savingKey ? 'Verifying...' : 'Save & Connect Live Gemini'}</span>
          </button>
        </form>
      </div>

      {/* 2. Financial Approval Threshold Governance */}
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-surface-300 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-surface-300">
          <Sliders className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Dynamic Financial Approval Thresholds</h3>
            <p className="text-xs text-slate-400">
              Deterministic governance gates applied by AI routing rules
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-surface-200/50 border border-surface-300/60 space-y-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-accent-emerald border border-emerald-500/30">
              Tier 1: Standard
            </span>
            <p className="font-bold text-white">&lt; ${Number(tier1).toLocaleString()}</p>
            <p className="text-slate-400 text-[11px]">
              Direct Single Manager Review. Auto-escalates after 24 hours.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-200/50 border border-surface-300/60 space-y-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Tier 2: Escalated
            </span>
            <p className="font-bold text-white">
              ${Number(tier1).toLocaleString()} - ${Number(tier2).toLocaleString()}
            </p>
            <p className="text-slate-400 text-[11px]">
              Requires Department Head sign-off + Finance verification.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-200/50 border border-surface-300/60 space-y-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Tier 3: Executive Gate
            </span>
            <p className="font-bold text-white">&gt; ${Number(tier2).toLocaleString()}</p>
            <p className="text-slate-400 text-[11px]">
              Mandatory dual-approval from Finance Director + Executive Lead.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Immutable Security & Execution Audit Trail */}
      <div className="glass-card p-6 rounded-2xl border border-surface-300 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-surface-300">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-accent-cyan" />
            <h3 className="text-sm font-bold text-white">System Security & Audit Trail</h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Last 50 Events</span>
        </div>

        {loadingAudit ? (
          <div className="py-6 text-center text-xs text-slate-500">Loading audit trail...</div>
        ) : auditLogs.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">No audit events recorded yet.</div>
        ) : (
          <div className="overflow-x-auto max-h-72">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-surface-300 text-slate-500 uppercase text-[10px]">
                  <th className="pb-2">Timestamp</th>
                  <th className="pb-2">Action</th>
                  <th className="pb-2">Entity</th>
                  <th className="pb-2">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-300/30">
                {auditLogs.slice(0, 15).map((log) => (
                  <tr key={log.id} className="hover:bg-surface-200/20">
                    <td className="py-2 text-slate-400 text-[11px]">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </td>
                    <td className="py-2 text-primary-300 font-semibold">{log.action}</td>
                    <td className="py-2 text-slate-300">{log.entity_type}</td>
                    <td className="py-2 text-slate-400">{log.user_name || 'System'}</td>
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
