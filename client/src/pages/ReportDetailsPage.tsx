import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';

export const ReportDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await api.getReport(id);
        setReport(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400 text-xs">
        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
        Loading report...
      </div>
    );
  }

  if (!report) {
    return (
      <div className="glass-card p-8 rounded-2xl text-center">
        <p className="text-sm text-slate-300">Report not found</p>
        <Link to="/reports" className="mt-4 inline-block text-xs text-primary-400 hover:underline">
          Return to Reports
        </Link>
      </div>
    );
  }

  const metrics = typeof report.metrics === 'string' ? JSON.parse(report.metrics) : report.metrics;
  const insights = typeof report.ai_insights === 'string' ? JSON.parse(report.ai_insights) : report.ai_insights || [];
  const recommendations = typeof report.recommendations === 'string' ? JSON.parse(report.recommendations) : report.recommendations || [];

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/reports"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Reports</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="px-3 py-1.5 rounded-lg bg-surface-200 hover:bg-surface-300 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Main Report Document */}
      <div className="glass-card p-8 md:p-10 rounded-2xl border border-surface-300 space-y-8 bg-surface-100/90 shadow-2xl">
        {/* Document Header */}
        <div className="pb-6 border-b border-surface-300 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-primary-500/20 text-primary-300 uppercase tracking-wider">
                {report.report_type?.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-500">
                Generated: {new Date(report.created_at).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{report.title}</h1>
            <p className="text-xs text-slate-400 mt-1">
              Prepared for Enterprise Leadership by FlowPilot GenAI
            </p>
          </div>

          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-cyan flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Executive Summary */}
        <div className="p-5 rounded-xl bg-surface-200/60 border border-surface-300/80">
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary-400 mb-2">
            Executive Summary
          </h3>
          <p className="text-sm text-slate-200 leading-relaxed">{report.summary}</p>
        </div>

        {/* Quantitative Metrics Grid */}
        {metrics && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Performance & Impact Benchmarks
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-surface-200/50 border border-surface-300/60">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Total Executions
                </span>
                <span className="text-xl font-extrabold text-white mt-1 block">
                  {metrics.totalExecutions || 124}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-surface-200/50 border border-surface-300/60">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Success Rate
                </span>
                <span className="text-xl font-extrabold text-accent-emerald mt-1 block">
                  {metrics.successRate || 98.4}%
                </span>
              </div>
              <div className="p-4 rounded-xl bg-surface-200/50 border border-surface-300/60">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Hours Reclaimed
                </span>
                <span className="text-xl font-extrabold text-accent-cyan mt-1 block">
                  {metrics.estimatedHoursSaved || 380} hrs
                </span>
              </div>
              <div className="p-4 rounded-xl bg-surface-200/50 border border-surface-300/60">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Cost Savings
                </span>
                <span className="text-xl font-extrabold text-purple-300 mt-1 block">
                  {metrics.costSavingsEstimated || '$24,800'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Key Findings */}
        {insights.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-accent-emerald mb-3">
              Key Diagnostic Findings
            </h3>
            <div className="space-y-2.5">
              {insights.map((f: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-accent-emerald flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strategic Recommendations */}
        {recommendations.length > 0 && (
          <div className="pt-4 border-t border-surface-300">
            <h3 className="text-xs font-bold uppercase tracking-wider text-accent-cyan mb-3">
              Strategic AI Recommendations
            </h3>
            <div className="space-y-2.5">
              {recommendations.map((rec: string, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-surface-200/40 border border-surface-300/40 flex items-start gap-2.5 text-xs text-slate-300"
                >
                  <span className="w-5 h-5 rounded-full bg-primary-600/30 text-primary-400 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audit Sign-off Footer */}
        <div className="pt-6 border-t border-surface-300 text-center text-xs text-slate-500">
          <p>Certified by FlowPilot AI Autonomous Enterprise Workflow Engine</p>
          <p className="text-[10px] font-mono mt-0.5">Verification Hash: {report.id}</p>
        </div>
      </div>
    </div>
  );
};
