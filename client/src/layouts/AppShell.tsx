import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Lightbulb,
  Workflow,
  PlayCircle,
  CheckSquare,
  ShieldCheck,
  BarChart3,
  FileText,
  Building2,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  User,
  PlusCircle,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const AppShell: React.FC = () => {
  const { user, logout, quickLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [aiStatus, setAiStatus] = useState<{ hasApiKey: boolean; mode: string } | null>(null);

  useEffect(() => {
    async function fetchHeaderData() {
      try {
        const notifRes = await api.getNotifications();
        setNotifications(notifRes.notifications || []);
        setUnreadCount(notifRes.unreadCount || 0);

        const apprRes = await api.getApprovals('PENDING');
        setPendingApprovals(apprRes.length || 0);

        const statusRes = await api.getAiStatus();
        setAiStatus(statusRes);
      } catch (err) {
        // Silent
      }
    }
    fetchHeaderData();
    const interval = setInterval(fetchHeaderData, 20000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Problem Discovery', path: '/problems', icon: Lightbulb },
    { label: 'Workflows', path: '/workflows', icon: Workflow },
    { label: 'Executions', path: '/executions', icon: PlayCircle },
    { label: 'Tasks', path: '/tasks', icon: CheckSquare },
    {
      label: 'Approvals',
      path: '/approvals',
      icon: ShieldCheck,
      badge: pendingApprovals > 0 ? pendingApprovals : null,
      badgeColor: 'bg-amber-500',
    },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'AI Reports', path: '/reports', icon: FileText },
    { label: 'Organization', path: '/organization', icon: Building2 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const roleColors: Record<string, string> = {
    Admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    Manager: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Employee: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Automation Operator': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  };

  const handleRoleSwitch = async (role: any) => {
    setProfileDropdownOpen(false);
    await quickLogin(role);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-slate-100 font-sans selection:bg-primary-500 selection:text-white">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-surface-100/90 border-r border-surface-300/80 p-4 sticky top-0 h-screen z-30">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 py-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 via-primary-500 to-accent-cyan flex items-center justify-center shadow-lg shadow-primary-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              FlowPilot <span className="text-primary-400">AI</span>
            </span>
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <span>Smart Automation</span>
            </div>
          </div>
        </div>

        {/* Organization Badge */}
        <div className="px-3 py-2 bg-surface-200/80 rounded-lg border border-surface-300/60 mb-5 flex items-center justify-between">
          <div className="truncate">
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Workspace</p>
            <p className="text-xs font-bold text-slate-200 truncate">
              {user?.organization_name || 'Acme Global'}
            </p>
          </div>
          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary-500/20 text-primary-300 border border-primary-500/40 rounded">
            ENTERPRISE
          </span>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-surface-200/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-slate-900 ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Card & Role Switcher */}
        <div className="pt-3 mt-2 border-t border-surface-300/60">
          <div className="flex items-center justify-between p-2 rounded-lg bg-surface-200/60 border border-surface-300/40">
            <div className="flex items-center gap-2 truncate">
              <div className="w-8 h-8 rounded-full bg-surface-300 flex items-center justify-center text-xs font-bold text-primary-300 border border-surface-400 overflow-hidden">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                ) : (
                  user?.full_name?.charAt(0) || 'U'
                )}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.full_name}</p>
                <span
                  className={`inline-block text-[10px] px-1.5 py-0.2 rounded border font-medium ${
                    roleColors[user?.role || 'Employee']
                  }`}
                >
                  {user?.role}
                </span>
              </div>
            </div>
            <button
              onClick={() => logout().then(() => navigate('/login'))}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-surface-100/80 border-b border-surface-300/80 backdrop-blur-md px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-slate-500">FlowPilot</span>
              <span>/</span>
              <span className="text-slate-200 font-medium capitalize">
                {location.pathname.replace('/', '') || 'Dashboard'}
              </span>
            </div>
          </div>

          {/* Right Topbar actions */}
          <div className="flex items-center gap-3">
            {/* AI Engine Status indicator */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-200/80 border border-surface-300/80 text-xs">
              <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse"></span>
              <Cpu className="w-3.5 h-3.5 text-primary-400" />
              <span className="text-slate-300 text-[11px] font-mono">
                {aiStatus?.hasApiKey ? 'Gemini 2.5 Flash (Live)' : 'GenAI Engine Active'}
              </span>
            </div>

            {/* Quick Action */}
            <button
              onClick={() => navigate('/problems/new')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-md shadow-primary-600/30 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Discover Problem</span>
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 text-slate-400 hover:text-slate-100 hover:bg-surface-200 rounded-lg relative transition"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
                )}
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-surface-100 border border-surface-300 rounded-xl shadow-2xl z-50 p-3">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-surface-300">
                    <span className="text-xs font-bold text-slate-200">Notifications</span>
                    <button
                      onClick={() => api.markAllNotificationsRead().then(() => setUnreadCount(0))}
                      className="text-[10px] text-primary-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 py-3 text-center">No notifications</p>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            setNotifDropdownOpen(false);
                            if (n.link) navigate(n.link);
                          }}
                          className={`p-2 rounded-lg text-xs cursor-pointer transition ${
                            !n.read ? 'bg-primary-500/10 border border-primary-500/30' : 'bg-surface-200/40 hover:bg-surface-200'
                          }`}
                        >
                          <p className="font-semibold text-slate-200">{n.title}</p>
                          <p className="text-slate-400 text-[11px] line-clamp-2 mt-0.5">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Demo Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg bg-surface-200/60 hover:bg-surface-200 border border-surface-300/60 transition"
              >
                <div className="w-6 h-6 rounded-full bg-primary-600/30 flex items-center justify-center text-xs font-bold text-primary-300">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <span className="hidden sm:inline text-xs font-medium text-slate-300">{user?.full_name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-surface-100 border border-surface-300 rounded-xl shadow-2xl z-50 p-2">
                  <div className="p-2 border-b border-surface-300/60">
                    <p className="text-xs font-bold text-slate-200">{user?.full_name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    <p className="text-[10px] text-primary-400 font-mono mt-0.5">{user?.department}</p>
                  </div>

                  {/* Hackathon Demo Quick Role Switcher */}
                  <div className="p-2 border-b border-surface-300/60">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                      Demo Role Switcher
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['Admin', 'Manager', 'Employee', 'Automation Operator'] as const).map((r) => (
                        <button
                          key={r}
                          onClick={() => handleRoleSwitch(r)}
                          className={`text-[11px] px-2 py-1 rounded text-left font-medium transition ${
                            user?.role === r
                              ? 'bg-primary-600 text-white font-bold'
                              : 'bg-surface-200 text-slate-300 hover:bg-surface-300'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate('/profile');
                      }}
                      className="w-full text-left px-2 py-1.5 text-xs text-slate-300 hover:bg-surface-200 rounded transition flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>User Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout().then(() => navigate('/login'));
                      }}
                      className="w-full text-left px-2 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded transition flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-surface-100 border-b border-surface-300 p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-surface-200"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-900">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        )}

        {/* Body Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
