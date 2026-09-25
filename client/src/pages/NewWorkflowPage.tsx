import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Workflow, AlertCircle, Wand2, Layers } from 'lucide-react';
import { api } from '../services/api';

export const NewWorkflowPage: React.FC = () => {
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState('');
  const [department, setDepartment] = useState('Operations');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual fallback fields
  const [manualMode, setManualMode] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [slaHours, setSlaHours] = useState(24);

  const demoPrompts = [
    'Automated Vendor Invoicing, Duplicate Detection & Payment Authorization',
    'Customer Onboarding KYC Verification & Account Provisioning Pipeline',
    'Urgent Security Incident Triage, On-Call Escalation & Post-Mortem',
    'Employee Hardware Request, Manager Sign-off & IT Asset Dispatch',
  ];

  const handleAiGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Call AI workflow generation
      const generated = await api.generateWorkflowFromProblem ? (
        // Call AI direct workflow generation
        await fetch('/api/ai/generate-workflow', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('flowpilot_token')}`,
          },
          body: JSON.stringify({
            problemTitle: prompt,
            department,
            description: prompt,
          }),
        }).then((r) => r.json())
      ) : null;

      if (!generated || generated.error) {
        throw new Error(generated?.error || 'Generation failed');
      }

      // 2. Save generated workflow into database
      const created = await api.createWorkflow({
        name: generated.workflowName,
        description: generated.description,
        category: department,
        trigger_type: generated.trigger?.type || 'form_submission',
        priority: 'high',
        approval_required: true,
        sla_hours: 24,
        active: true,
        steps: generated.steps.map((s: any, idx: number) => ({
          order_index: s.order || idx + 1,
          step_type: s.type,
          name: s.name,
          description: s.description || '',
          assignee_role: s.assigneeRole || 'Employee',
          config: { conditions: s.conditions || [] },
          next_step_order: s.nextStep || (idx + 2 <= generated.steps.length ? idx + 2 : null),
        })),
      });

      navigate(`/workflows/${created.id}/builder`);
    } catch (err: any) {
      setError(err.message || 'Workflow generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const created = await api.createWorkflow({
        name,
        description,
        category: department,
        trigger_type: 'manual',
        priority,
        approval_required: true,
        sla_hours: Number(slaHours),
        active: true,
        steps: [
          {
            order_index: 1,
            step_type: 'trigger',
            name: 'Initial Trigger',
            description: 'Workflow starts when triggered manually or via API',
            assignee_role: 'Employee',
            config: {},
            next_step_order: 2,
          },
          {
            order_index: 2,
            step_type: 'approval',
            name: 'Manager Review',
            description: 'Manager reviews request and approves',
            assignee_role: 'Manager',
            config: {},
            next_step_order: 3,
          },
          {
            order_index: 3,
            step_type: 'end',
            name: 'Completed',
            description: 'Process concluded',
            assignee_role: 'Employee',
            config: {},
            next_step_order: null,
          },
        ],
      });

      navigate(`/workflows/${created.id}/builder`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <Link
        to="/workflows"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Workflows</span>
      </Link>

      <div className="glass-card p-6 md:p-8 rounded-2xl border border-surface-300">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-surface-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600/20 text-primary-400 flex items-center justify-center">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Create Automated Workflow</h1>
              <p className="text-xs text-slate-400">
                Use Gemini GenAI to architect a complete pipeline or construct steps manually
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setManualMode(!manualMode)}
            className="text-xs text-primary-400 hover:underline font-semibold"
          >
            {manualMode ? 'Switch to AI Generator' : 'Manual Setup'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!manualMode ? (
          /* AI Generator Mode */
          <form onSubmit={handleAiGenerate} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-primary-950/30 border border-primary-500/30 text-xs text-primary-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-0.5" />
              <span>
                Gemini will architect an end-to-end pipeline: intake triggers, AI routing logic, human approvals, task assignments, and ERP sync.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Describe the Workflow or Goal <span className="text-rose-400">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Automated Employee Travel Expense: Evaluate receipt amount, auto-approve under $1,000 via Manager, require Department Head for higher values, and sync to accounting ledger."
                className="w-full px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Suggested Scenarios (Click to test):
              </label>
              <div className="space-y-1.5">
                {demoPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(p)}
                    className="w-full text-left p-2 rounded-lg bg-surface-200/50 hover:bg-surface-200 text-xs text-slate-300 border border-surface-300/40 transition truncate block"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-primary-500"
              >
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="IT">IT</option>
                <option value="HR">Human Resources</option>
                <option value="Procurement">Procurement</option>
                <option value="Sales">Sales</option>
              </select>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary-600 via-primary-500 to-accent-emerald hover:from-primary-500 hover:to-emerald-400 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-primary-600/30 flex items-center gap-2 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? 'AI Generating Architecture...' : 'Generate & Open Builder'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Manual Setup Mode */
          <form onSubmit={handleManualCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Workflow Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Employee Offboarding Process"
                className="w-full px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of pipeline purpose..."
                className="w-full px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-primary-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">SLA (Hours)</label>
                <input
                  type="number"
                  value={slaHours}
                  onChange={(e) => setSlaHours(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-primary-600/30 flex items-center gap-2"
              >
                <Layers className="w-4 h-4" />
                <span>Create & Open Visual Builder</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
