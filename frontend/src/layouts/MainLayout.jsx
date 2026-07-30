import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { LayoutDashboard, Globe, ShieldCheck, FileText, AlertTriangle, BookOpen } from 'lucide-react';

export const MainLayout = () => {
  const mobileNav = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/websites', label: 'Sites', icon: Globe },
    { path: '/scanner', label: 'Scan', icon: ShieldCheck },
    { path: '/reports', label: 'Reports', icon: FileText },
    { path: '/alerts', label: 'Alerts', icon: AlertTriangle },
    { path: '/knowledge', label: 'Learn', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-cyber-bg text-slate-100">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Floating Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#070b15]/95 backdrop-blur-md border-t border-cyber-border z-40 px-3 flex items-center justify-around">
        {mobileNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-cyber-cyan' : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
