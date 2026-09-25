import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  Workflow,
  Shield,
  Plus,
  ArrowRight,
  RefreshCw,
  Mail,
  User,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const OrganizationPage: React.FC = () => {
  const { user } = useAuth();
  const [org, setOrg] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Employee');
  const [newDept, setNewDept] = useState('Operations');

  const fetchOrgData = async () => {
    try {
      setLoading(true);
      const [o, m] = await Promise.all([
        api.getOrganization(),
        api.getOrganizationMembers(),
      ]);
      setOrg(o);
      setMembers(m);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgData();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const added = await api.addOrganizationMember({
        email: newEmail,
        fullName: newName,
        role: newRole,
        department: newDept,
      });
      setMembers([...members, added]);
      setShowInviteModal(false);
      setNewEmail('');
      setNewName('');
    } catch (err: any) {
      alert('Failed to add member: ' + err.message);
    }
  };

  const roleColors: Record<string, string> = {
    Admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    Manager: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Employee: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Automation Operator': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-primary-400" />
            <span>Organization Workspace</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage organization members, workspace isolation settings, and role-based permissions.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-md shadow-primary-600/30 flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Org Info Card */}
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-surface-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-surface-300 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-white">{org?.name || 'Acme Global'}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-500/20 text-primary-300 border border-primary-500/40 uppercase">
                {org?.plan || 'Enterprise'} Plan
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Workspace Slug: {org?.slug}</p>
          </div>

          <div className="flex items-center gap-4 text-center">
            <div className="p-3 rounded-xl bg-surface-200/60 border border-surface-300 min-w-[100px]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Members</span>
              <span className="text-lg font-extrabold text-white mt-0.5 block">{members.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-200/60 border border-surface-300 min-w-[100px]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Workflows</span>
              <span className="text-lg font-extrabold text-accent-cyan mt-0.5 block">
                {org?.workflowCount || 3}
              </span>
            </div>
          </div>
        </div>

        {/* Security & Isolation Status */}
        <div className="mt-6 flex items-center justify-between text-xs text-slate-300 bg-surface-200/50 p-4 rounded-xl border border-surface-300/60">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-accent-emerald flex-shrink-0" />
            <div>
              <span className="font-bold text-white block">Multi-Tenant Row-Level Isolation Active</span>
              <span className="text-slate-400 text-[11px]">
                Organization data is strictly partitioned on all backend endpoints and queries.
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-accent-emerald/20 text-accent-emerald text-[11px] font-bold border border-accent-emerald/30">
            ENFORCED
          </span>
        </div>
      </div>

      {/* Members Directory */}
      <div className="glass-card p-6 rounded-2xl border border-surface-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-primary-400" />
            <span>Organization Members ({members.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-surface-300 text-slate-400 uppercase text-[10px]">
                <th className="pb-3 font-semibold">User</th>
                <th className="pb-3 font-semibold">Role</th>
                <th className="pb-3 font-semibold">Department</th>
                <th className="pb-3 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-300/40">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-surface-200/40 transition">
                  <td className="py-3 font-medium text-slate-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-surface-300 flex items-center justify-center font-bold text-primary-300 text-xs">
                        {m.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <span className="block font-semibold text-slate-200">{m.full_name}</span>
                        <span className="block text-[10px] text-slate-400">{m.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        roleColors[m.role] || 'bg-surface-300 text-slate-300'
                      }`}
                    >
                      {m.role}
                    </span>
                  </td>
                  <td className="py-3 text-slate-300">{m.department || 'Operations'}</td>
                  <td className="py-3 text-slate-400 text-[11px]">
                    {new Date(m.created_at || Date.now()).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel p-6 rounded-2xl border border-surface-300 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">Add Organization Member</h3>
            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. David Kim"
                  className="w-full px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="david@company.com"
                  className="w-full px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Employee">Employee</option>
                    <option value="Automation Operator">Automation Operator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    placeholder="e.g. Finance"
                    className="w-full px-3 py-2 bg-surface-200 border border-surface-300 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-surface-200 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-md"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
