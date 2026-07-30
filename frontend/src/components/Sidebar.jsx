import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Globe,
  ShieldCheck,
  FileText,
  AlertTriangle,
  BookOpen,
  UserCheck,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const { isAdmin } = useAuth();

  const mainLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/websites', label: 'Monitored Sites', icon: Globe },
    { path: '/scanner', label: 'Security Scanner', icon: ShieldCheck },
    { path: '/reports', label: 'Audit Reports', icon: FileText },
    { path: '/alerts', label: 'Alert Center', icon: AlertTriangle },
    { path: '/knowledge', label: 'Knowledge Base', icon: BookOpen },
  ];

  const adminLinks = [
    { path: '/admin', label: 'Admin Control', icon: UserCheck },
  ];

  return (
    <aside className="w-64 bg-[#070b15] border-r border-cyber-border min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        <div>
          <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
            Main Operations
          </div>
          <nav className="space-y-1">
            {mainLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-cyber-cyan/20 to-blue-600/10 text-cyber-cyan border border-cyber-cyan/30 shadow-cyber-glow'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                </NavLink>
              );
            })}
          </nav>
        </div>

        {isAdmin && (
          <div>
            <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">
              Administration
            </div>
            <nav className="space-y-1">
              {adminLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-purple-950/40 text-purple-300 border border-purple-500/40'
                          : 'text-purple-400/70 hover:text-purple-200 hover:bg-purple-950/20'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Footer System Status Card */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium text-slate-400">Security Engine</span>
          <span className="text-[10px] font-mono text-emerald-400">v2.4.0</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div className="bg-cyber-cyan h-full w-[85%] rounded-full shadow-cyber-glow"></div>
        </div>
        <p className="text-[10px] text-slate-500 mt-2 font-mono">OWASP Scanner Ready</p>
      </div>
    </aside>
  );
};
