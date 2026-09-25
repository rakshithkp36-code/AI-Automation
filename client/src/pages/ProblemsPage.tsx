import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Lightbulb,
  Plus,
  ArrowRight,
  Sparkles,
  Clock,
  DollarSign,
  Users,
  Search,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { api } from '../services/api';

export const ProblemsPage: React.FC = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api.getProblems();
        setProblems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const departments = ['All', 'Finance', 'Operations', 'IT', 'HR', 'Sales', 'Customer Support'];

  const filtered = problems.filter((p) => {
    const matchesDept = selectedDept === 'All' || p.department.toLowerCase() === selectedDept.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Lightbulb className="w-6 h-6 text-amber-400" />
            <span>Problem Discovery Registry</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Capture operational friction, analyze bottlenecks with AI, and generate automated workflow pipelines.
          </p>
        </div>

        <Link
          to="/problems/new"
          className="px-4 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-md shadow-primary-600/30 flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Discover New Problem</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex-shrink-0 ${
                selectedDept === dept
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-200 text-slate-300 hover:bg-surface-300'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems..."
            className="w-full pl-9 pr-3 py-1.5 bg-surface-200 border border-surface-300 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500"
          />
        </div>
      </div>

      {/* Problem Cards List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading problem records...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl border border-surface-300">
          <Lightbulb className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No problem workflows found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Create a new problem discovery record to describe repetitive manual operations.
          </p>
          <Link
            to="/problems/new"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Problem</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((p) => {
            const statusBadge: Record<string, { label: string; color: string }> = {
              DRAFT: { label: 'Draft', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
              ANALYZED: { label: 'AI Analyzed', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
              WORKFLOW_GENERATED: {
                label: 'Workflow Generated',
                color: 'bg-accent-emerald/20 text-accent-emerald border-accent-emerald/30',
              },
              RESOLVED: { label: 'Resolved', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
            };

            const analysis = typeof p.ai_analysis === 'string' ? JSON.parse(p.ai_analysis) : p.ai_analysis;
            const timeSaved = analysis?.estimated_time_saved_percent;

            return (
              <div
                key={p.id}
                className="glass-card p-5 rounded-xl border border-surface-300/80 hover:border-primary-500/40 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-300 text-primary-300">
                      {p.department}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        statusBadge[p.status]?.color || 'bg-surface-300 text-slate-300'
                      }`}
                    >
                      {statusBadge[p.status]?.label || p.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-primary-300 transition">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-surface-200/50 text-[11px] text-slate-300">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Latency</span>
                      <span className="font-semibold text-rose-400">{p.average_processing_time}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Frequency</span>
                      <span className="font-semibold text-slate-200 truncate block">{p.frequency}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Potential</span>
                      <span className="font-semibold text-accent-emerald">
                        {timeSaved ? `${timeSaved}% Saved` : 'High ROI'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-surface-300/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    By {p.creator_name || 'Team member'}
                  </span>
                  <Link
                    to={`/problems/${p.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary-400 hover:text-primary-300 transition"
                  >
                    <span>Analyze & Generate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
