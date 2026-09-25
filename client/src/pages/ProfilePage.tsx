import React from 'react';
import { User, Shield, Building2, Mail, Calendar, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user, quickLogin } = useAuth();

  const roleColors: Record<string, string> = {
    Admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    Manager: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Employee: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Automation Operator': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <User className="w-6 h-6 text-primary-400" />
          <span>User Profile</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Personal account identity, assigned role credentials, and organization workspace context.
        </p>
      </div>

      <div className="glass-card p-6 md:p-8 rounded-2xl border border-surface-300 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-surface-300">
          <div className="w-16 h-16 rounded-full bg-surface-300 flex items-center justify-center text-xl font-bold text-primary-300 border-2 border-primary-500/40 overflow-hidden shadow-lg shadow-primary-500/20">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
            ) : (
              user?.full_name?.charAt(0) || 'U'
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.full_name}</h2>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <span
              className={`inline-block mt-2 px-2.5 py-0.5 rounded text-[11px] font-bold border uppercase ${
                roleColors[user?.role || 'Employee']
              }`}
            >
              Role: {user?.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-surface-200/50 border border-surface-300/60 flex items-center gap-3">
            <Building2 className="w-4 h-4 text-primary-400 flex-shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Organization</span>
              <span className="font-semibold text-slate-200">{user?.organization_name || 'Acme Global Innovations'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-200/50 border border-surface-300/60 flex items-center gap-3">
            <Shield className="w-4 h-4 text-accent-cyan flex-shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Department</span>
              <span className="font-semibold text-slate-200">{user?.department || 'Executive Leadership'}</span>
            </div>
          </div>
        </div>

        {/* Demo Role Switcher in Profile */}
        <div className="pt-6 border-t border-surface-300">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
            Switch Persona for Demo Testing
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Toggle instantly between personas to experience different permission tiers.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['Admin', 'Manager', 'Employee', 'Automation Operator'] as const).map((r) => (
              <button
                key={r}
                onClick={async () => {
                  await quickLogin(r);
                  window.location.reload();
                }}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition text-left ${
                  user?.role === r
                    ? 'bg-primary-600 text-white border-primary-500 shadow-md shadow-primary-600/30'
                    : 'bg-surface-200 text-slate-300 hover:bg-surface-300 border-surface-300'
                }`}
              >
                <span className="block">{r}</span>
                <span className="text-[10px] opacity-75 font-normal block mt-0.5">
                  {r === 'Admin' ? 'All Permissions' : r === 'Manager' ? 'Approval Lead' : r === 'Employee' ? 'Task Specialist' : 'AI Supervisor'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
