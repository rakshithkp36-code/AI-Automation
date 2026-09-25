import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  Plus,
  Clock,
  User,
  Filter,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newRole, setNewRole] = useState('Employee');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await api.getTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      if (newStatus === 'COMPLETED') {
        await api.completeTask(taskId, 'Completed from Task Board');
      } else {
        await api.updateTask(taskId, { status: newStatus });
      }
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err: any) {
      alert('Error updating task: ' + err.message);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const created = await api.createTask({
        title: newTitle,
        description: newDesc,
        priority: newPriority,
        assigned_role: newRole,
      });
      setTasks((prev) => [created, ...prev]);
      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
    } catch (err: any) {
      alert('Failed to create task: ' + err.message);
    }
  };

  const filtered = tasks.filter((t) => {
    if (statusFilter === 'ALL') return true;
    return t.status === statusFilter;
  });

  const priorityColors: Record<string, string> = {
    critical: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    high: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    medium: 'bg-primary-500/20 text-primary-300 border-primary-500/30',
    low: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-primary-400" />
            <span>Task Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track operational tasks generated automatically by workflow executions and manual assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTasks}
            className="p-2 rounded-lg bg-surface-200 hover:bg-surface-300 text-slate-300 transition"
            title="Refresh Tasks"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-md shadow-primary-600/30 flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 border-b border-surface-300 pb-2">
        {['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === s
                ? 'bg-primary-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-surface-200'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Task List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading task items...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl border border-surface-300">
          <CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No tasks in this view</h3>
          <p className="text-xs text-slate-400 mt-1">All clear or no tasks match this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="glass-card p-5 rounded-xl border border-surface-300/80 hover:border-surface-200 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`px-2 py-0.2 rounded text-[10px] font-bold border uppercase ${
                      priorityColors[t.priority] || ''
                    }`}
                  >
                    {t.priority}
                  </span>
                  <select
                    value={t.status}
                    onChange={(e) => handleUpdateStatus(t.id, e.target.value)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-300 text-slate-200 border border-surface-400 focus:outline-none"
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>

                <h3 className="text-sm font-bold text-white mb-1">{t.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {t.description || 'No description provided.'}
                </p>

                <div className="mt-4 pt-3 border-t border-surface-300/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-slate-300">
                    <User className="w-3 h-3 text-primary-400" />
                    <span>Role: {t.assigned_role}</span>
                  </span>

                  {t.workflow_name && (
                    <span className="text-[10px] text-primary-300 truncate max-w-[130px]">
                      {t.workflow_name}
                    </span>
                  )}
                </div>
              </div>

              {t.status !== 'COMPLETED' && (
                <div className="mt-3 pt-2 flex justify-end">
                  <button
                    onClick={() => handleUpdateStatus(t.id, 'COMPLETED')}
                    className="px-3 py-1 rounded bg-accent-emerald/20 hover:bg-accent-emerald text-accent-emerald hover:text-slate-950 text-[11px] font-bold transition flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Complete Task</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel p-6 rounded-2xl border border-surface-300 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">Create Operational Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Task title"
                  className="w-full px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Task instructions..."
                  className="w-full px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                    <option value="Automation Operator">Automation Operator</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-surface-200 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-md"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
