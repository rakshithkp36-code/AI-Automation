import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Lightbulb, Sparkles, AlertCircle, Wand2 } from 'lucide-react';
import { api } from '../services/api';

export const NewProblemPage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('Finance');
  const [currentProcess, setCurrentProcess] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const [averageProcessingTime, setAverageProcessingTime] = useState('2.5 days');
  const [peopleInvolved, setPeopleInvolved] = useState('4-5 people');
  const [currentTools, setCurrentTools] = useState('Email, Excel, Paper Invoices');
  const [painPoints, setPainPoints] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('$8,500 / month');
  const [desiredOutcome, setDesiredOutcome] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fillDemoExample = () => {
    setTitle('Automated Employee Expense Reimbursement');
    setDescription(
      'Employees submit expense claims manually via email spreadsheets. Handoffs between department managers and finance take days and lack automated policy threshold validation.'
    );
    setDepartment('Finance');
    setCurrentProcess(
      'Employee creates spreadsheet -> emails manager -> manager checks email -> forwards to finance -> finance reconciles budget sheet -> manual spreadsheet update -> employee notified'
    );
    setFrequency('Daily (25-30 claims/day)');
    setAverageProcessingTime('2.5 days');
    setPeopleInvolved('4-5 people (Employee, Manager, Finance Analyst, Director)');
    setCurrentTools('Outlook Email, Microsoft Excel, Paper Receipts');
    setPainPoints(
      'Reimbursements take 2.5 days on average. 8 manual touchpoints. Lost paper receipts. No budget threshold checks. High frustration.'
    );
    setEstimatedCost('$8,500 / month in manual hours');
    setDesiredOutcome(
      'Turnaround under 4.5 hours. Automated receipt verification. Automatic threshold routing (< $1,000 auto-assign to Manager; > $1,000 multi-stage sign-off). ERP auto-sync.'
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const created = await api.createProblem({
        title,
        description,
        department,
        currentProcess,
        frequency,
        averageProcessingTime,
        peopleInvolved,
        currentTools,
        painPoints,
        estimatedCost,
        desiredOutcome,
      });

      // Automatically navigate to the problem details page to run AI analysis
      navigate(`/problems/${created.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create problem record.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Link
          to="/problems"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Problem Registry</span>
        </Link>

        <button
          type="button"
          onClick={fillDemoExample}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-200 hover:bg-surface-300 border border-surface-300 text-xs text-primary-300 font-semibold transition"
        >
          <Wand2 className="w-3.5 h-3.5 text-primary-400" />
          <span>Autofill Demo Scenario</span>
        </button>
      </div>

      <div className="glass-card p-6 md:p-8 rounded-2xl border border-surface-300">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-300">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Problem Discovery Intake</h1>
            <p className="text-xs text-slate-400">
              Document manual friction points for AI bottleneck diagnosis and automated workflow generation.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Problem Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Automated Employee Expense Approval"
                className="w-full px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Department <span className="text-rose-400">*</span>
              </label>
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
                <option value="Customer Support">Customer Support</option>
                <option value="Sales">Sales</option>
                <option value="General Administration">General Administration</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Problem Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the operational challenge, who experiences it, and why it is a bottleneck..."
              className="w-full px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Current Manual Process (Step-by-step) <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={currentProcess}
              onChange={(e) => setCurrentProcess(e.target.value)}
              placeholder="Step 1: Employee emails manager... Step 2: Manager reviews... Step 3: Finance checks budget..."
              className="w-full px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Frequency</label>
              <input
                type="text"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="e.g. Daily (20-30/day)"
                className="w-full px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Avg Processing Time
              </label>
              <input
                type="text"
                value={averageProcessingTime}
                onChange={(e) => setAverageProcessingTime(e.target.value)}
                placeholder="e.g. 2.5 days"
                className="w-full px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                People Involved
              </label>
              <input
                type="text"
                value={peopleInvolved}
                onChange={(e) => setPeopleInvolved(e.target.value)}
                placeholder="e.g. 4-5 people"
                className="w-full px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Current Tools Used
              </label>
              <input
                type="text"
                value={currentTools}
                onChange={(e) => setCurrentTools(e.target.value)}
                placeholder="e.g. Outlook Email, Spreadsheets"
                className="w-full px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Estimated Operational Cost
              </label>
              <input
                type="text"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder="e.g. $8,500 / month"
                className="w-full px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Key Pain Points <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={painPoints}
              onChange={(e) => setPainPoints(e.target.value)}
              placeholder="e.g. 2.5-day reimbursement turnaround, lost receipts, no policy checks..."
              className="w-full px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Desired Automation Outcome <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={desiredOutcome}
              onChange={(e) => setDesiredOutcome(e.target.value)}
              placeholder="e.g. Sub-5 hour turnaround, automated threshold validation, automated ledger sync..."
              className="w-full px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <Link
              to="/problems"
              className="px-4 py-2 rounded-lg bg-surface-200 hover:bg-surface-300 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-primary-600/30 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? 'Saving Problem...' : 'Submit & Run AI Analysis'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
