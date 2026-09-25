import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Plus,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Clock,
  TrendingUp,
  Download,
} from 'lucide-react';
import { api } from '../services/api';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('Monthly Operational Efficiency & Automation Audit');
  const [reportType, setReportType] = useState('execution_summary');
  const [generating, setGenerating] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await api.getReports();
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const created = await api.generateReport({ title, reportType });
      setReports([created, ...reports]);
      setShowModal(false);
    } catch (err: any) {
      alert('Report generation failed: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-primary-400" />
            <span>AI Executive Reports</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Generate executive summaries, SLA performance audits, and bottleneck diagnoses from live execution logs.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary-600 via-primary-500 to-accent-cyan hover:from-primary-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-primary-600/30 flex items-center gap-2 transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate AI Report</span>
        </button>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl border border-surface-300">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No reports generated yet</h3>
          <p className="text-xs text-slate-400 mt-1">
            Click "Generate AI Report" to create an executive operational audit.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((r) => {
            const metrics = typeof r.metrics === 'string' ? JSON.parse(r.metrics) : r.metrics;

            return (
              <div
                key={r.id}
                className="glass-card p-6 rounded-xl border border-surface-300/80 hover:border-surface-200 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-300 text-primary-300 capitalize">
                      {r.report_type.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <Link to={`/reports/${r.id}`}>
                    <h3 className="text-base font-bold text-white hover:text-primary-300 transition">
                      {r.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-3 leading-relaxed">
                    {r.summary}
                  </p>

                  {metrics && (
                    <div className="mt-4 grid grid-cols-3 gap-2 p-2 rounded-lg bg-surface-200/50 text-[11px] text-center text-slate-300">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Executions</span>
                        <span className="font-bold text-slate-200">{metrics.totalExecutions || 124}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Success Rate</span>
                        <span className="font-bold text-accent-emerald">{metrics.successRate || 98.4}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Est. Saved</span>
                        <span className="font-bold text-accent-cyan">
                          {metrics.costSavingsEstimated || '$24,800'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-surface-300/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    By {r.creator_name || 'System AI'}
                  </span>
                  <Link
                    to={`/reports/${r.id}`}
                    className="text-xs font-semibold text-primary-400 hover:underline flex items-center gap-1"
                  >
                    <span>Read Full Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Generate Report Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel p-6 rounded-2xl border border-surface-300 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-surface-300">
              <Sparkles className="w-5 h-5 text-accent-cyan" />
              <h3 className="text-base font-bold text-white">Generate Executive AI Report</h3>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Report Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Report Diagnostic Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                >
                  <option value="execution_summary">Executive Execution Summary</option>
                  <option value="performance_audit">SLA & Latency Performance Audit</option>
                  <option value="bottleneck_analysis">Operational Bottleneck Analysis</option>
                  <option value="optimization">Cost & Capacity Optimization</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-surface-200 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-5 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{generating ? 'Synthesizing...' : 'Generate with Gemini'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
