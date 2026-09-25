import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  Workflow,
  Shield,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';

export const ProblemDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProblem = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await api.getProblem(id);
      setProblem(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblem();
  }, [id]);

  const handleRunAnalysis = async () => {
    if (!id) return;
    setAnalyzing(true);
    setError(null);
    try {
      const res = await api.analyzeProblem(id);
      setProblem((prev: any) => ({
        ...prev,
        status: 'ANALYZED',
        ai_analysis: res.analysis,
      }));
    } catch (err: any) {
      setError(err.message || 'AI Process Analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateWorkflow = async () => {
    if (!id) return;
    setGenerating(true);
    setError(null);
    try {
      const newWf = await api.generateWorkflowFromProblem(id);
      navigate(`/workflows/${newWf.id}/builder`);
    } catch (err: any) {
      setError(err.message || 'Failed to generate workflow.');
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400 text-xs">
        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
        Loading problem details...
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="glass-card p-8 rounded-2xl text-center">
        <p className="text-sm text-slate-300">Problem not found</p>
        <Link to="/problems" className="mt-4 inline-block text-xs text-primary-400 hover:underline">
          Return to Problem Registry
        </Link>
      </div>
    );
  }

  const analysis = typeof problem.ai_analysis === 'string'
    ? JSON.parse(problem.ai_analysis)
    : problem.ai_analysis;

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          to="/problems"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Problem Registry</span>
        </Link>
        <span className="text-[11px] text-slate-500 font-mono">ID: {problem.id}</span>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Problem Header Card */}
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-surface-300">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-surface-300 text-primary-300 border border-surface-400">
                {problem.department}
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {problem.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{problem.title}</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
              {problem.description}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 flex-shrink-0">
            <button
              onClick={handleRunAnalysis}
              disabled={analyzing}
              className="px-4 py-2.5 rounded-lg bg-surface-200 hover:bg-surface-300 border border-surface-300 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <Cpu className="w-4 h-4 text-primary-400" />
              <span>{analyzing ? 'Analyzing Process...' : analysis ? 'Re-run AI Analysis' : 'Run AI Process Analysis'}</span>
            </button>

            <button
              onClick={handleGenerateWorkflow}
              disabled={generating}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary-600 via-primary-500 to-accent-emerald hover:from-primary-500 hover:to-emerald-400 text-white text-xs font-bold shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>{generating ? 'Architecting Workflow...' : 'Generate Automated Workflow'}</span>
            </button>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="mt-6 pt-6 border-t border-surface-300/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-surface-200/50">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Frequency</span>
            <span className="font-semibold text-slate-200 mt-0.5 block truncate">{problem.frequency}</span>
          </div>
          <div className="p-3 rounded-xl bg-surface-200/50">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Processing Time</span>
            <span className="font-semibold text-rose-400 mt-0.5 block">{problem.average_processing_time}</span>
          </div>
          <div className="p-3 rounded-xl bg-surface-200/50">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">People Involved</span>
            <span className="font-semibold text-slate-200 mt-0.5 block truncate">{problem.people_involved}</span>
          </div>
          <div className="p-3 rounded-xl bg-surface-200/50">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Estimated Cost</span>
            <span className="font-semibold text-accent-cyan mt-0.5 block truncate">{problem.estimated_cost}</span>
          </div>
        </div>
      </div>

      {/* Manual Process & Desired Outcome Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5 rounded-xl border border-surface-300">
          <h3 className="text-xs uppercase font-bold text-rose-400 tracking-wider mb-2">
            Current Manual Process
          </h3>
          <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed bg-surface-200/60 p-3 rounded-lg border border-surface-300/60">
            {problem.current_process}
          </p>
          <div className="mt-3 text-[11px] text-slate-400">
            <span className="text-slate-500 font-semibold">Current Tools:</span> {problem.current_tools}
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-surface-300">
          <h3 className="text-xs uppercase font-bold text-accent-emerald tracking-wider mb-2">
            Desired Automated Outcome
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed bg-surface-200/60 p-3 rounded-lg border border-surface-300/60">
            {problem.desired_outcome}
          </p>
          <div className="mt-3 text-[11px] text-slate-400">
            <span className="text-slate-500 font-semibold">Identified Pain Points:</span> {problem.pain_points}
          </div>
        </div>
      </div>

      {/* AI PROCESS ANALYZER DASHBOARD */}
      {analyzing ? (
        <div className="glass-panel p-8 rounded-2xl border-primary-500/40 text-center space-y-4">
          <Sparkles className="w-8 h-8 text-primary-400 animate-spin mx-auto" />
          <h3 className="text-base font-bold text-white">Gemini AI Process Analyzer in Progress</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Deconstructing operational stages, detecting human handoff bottlenecks, and calculating automation ROI...
          </p>
        </div>
      ) : analysis ? (
        <div className="glass-panel p-6 md:p-8 rounded-2xl border-primary-500/30 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-300 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-cyan flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">AI Process Diagnostic Report</h2>
                <p className="text-xs text-slate-400">
                  Automated operational decomposition powered by FlowPilot GenAI
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Time Saved</span>
                <span className="text-lg font-extrabold text-accent-emerald">
                  {analysis.estimated_time_saved_percent || 68}%
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-primary-500/10 border border-primary-500/20 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Recommended Mode</span>
                <span className="text-xs font-bold text-primary-300 capitalize">
                  {analysis.recommended_automation_level || 'High'}
                </span>
              </div>
            </div>
          </div>

          {/* Diagnostic Summary */}
          <div className="p-4 rounded-xl bg-surface-200/60 border border-surface-300/80 text-xs text-slate-200 leading-relaxed">
            <span className="font-bold text-primary-300 block mb-1">Executive Summary</span>
            {analysis.summary}
          </div>

          {/* Bottlenecks Grid */}
          <div>
            <h3 className="text-xs uppercase font-bold tracking-wider text-rose-400 mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Identified Operational Bottlenecks</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {analysis.bottlenecks?.map((b: any, idx: number) => {
                const severityColors: Record<string, string> = {
                  high: 'border-rose-500/40 bg-rose-500/5 text-rose-300',
                  medium: 'border-amber-500/40 bg-amber-500/5 text-amber-300',
                  low: 'border-slate-500/40 bg-surface-200/50 text-slate-300',
                };
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border text-xs ${severityColors[b.severity] || ''}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-200 text-xs">{b.title}</span>
                      <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-surface-300">
                        {b.severity}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{b.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Manual Tasks & Automation Opportunities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-3">
                Repetitive Manual Tasks
              </h3>
              <div className="space-y-2">
                {analysis.manual_tasks?.map((m: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-surface-200/50 border border-surface-300/60 flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-300">{m.task}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        m.automationPotential === 'high'
                          ? 'bg-accent-emerald/20 text-accent-emerald'
                          : 'bg-surface-300 text-slate-400'
                      }`}
                    >
                      {m.automationPotential} potential
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase font-bold tracking-wider text-accent-cyan mb-3">
                Automation Opportunities
              </h3>
              <div className="space-y-2">
                {analysis.automation_opportunities?.map((opp: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-cyan-500/5 border border-cyan-500/20 text-xs"
                  >
                    <p className="font-bold text-slate-200">{opp.title}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">{opp.description}</p>
                    <span className="text-[10px] text-accent-cyan font-semibold block mt-1">
                      Impact: {opp.expectedImpact}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations & Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-surface-300/60">
            <div>
              <h4 className="text-xs font-bold text-slate-300 mb-2">AI Strategic Recommendations</h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {analysis.recommendations?.map((r: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary-400 flex-shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-300 mb-2">Operational Risks to Monitor</h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {analysis.risks?.map((r: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Generation CTA */}
          <div className="pt-6 border-t border-surface-300/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              Ready to automate this workflow? Click below to generate and edit steps in the visual builder.
            </div>
            <button
              onClick={handleGenerateWorkflow}
              disabled={generating}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-accent-emerald hover:from-primary-500 hover:to-emerald-400 text-white text-xs font-bold shadow-xl shadow-primary-600/30 flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>{generating ? 'Architecting Workflow...' : 'Generate Automated Workflow'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-8 rounded-2xl border-surface-300 text-center space-y-4">
          <Cpu className="w-10 h-10 text-primary-400 mx-auto" />
          <h3 className="text-base font-bold text-white">AI Diagnostic Engine Ready</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click the button below to run Gemini AI process diagnosis on this problem. The engine will identify bottlenecks, manual handoffs, and calculate time saved.
          </p>
          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="px-6 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-lg shadow-primary-600/30 inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Analyze Problem Now</span>
          </button>
        </div>
      )}
    </div>
  );
};
