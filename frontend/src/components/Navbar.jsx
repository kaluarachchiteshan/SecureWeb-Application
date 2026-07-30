import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Bell, User, LogOut, Search, Activity, ShieldAlert, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-cyber-border bg-[#070b15]/90 backdrop-blur-md sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyber-cyan to-blue-600 p-0.5 flex items-center justify-center shadow-cyber-glow group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#070b15] rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyber-cyan" />
            </div>
          </div>
          <div>
            <span className="font-bold text-lg tracking-wider text-white flex items-center gap-1">
              SECURE<span className="text-cyber-cyan">WEB</span>
            </span>
            <span className="block text-[10px] text-slate-400 font-mono tracking-widest uppercase">
              Security Monitoring
            </span>
          </div>
        </Link>

        {/* Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 ml-6 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          SCANNER ACTIVE
        </div>
      </div>

      {/* Right Navigation & Controls */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            {/* Quick Trigger Scan Button */}
            <Link
              to="/scanner"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30 hover:bg-cyber-cyan/20 text-xs font-medium transition-all"
            >
              <Cpu className="w-4 h-4" />
              <span>Instant Scan</span>
            </Link>

            {/* Notifications Alert Link */}
            <Link
              to="/alerts"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 relative transition-colors"
              title="Security Alerts"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyber-red animate-ping"></span>
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-700"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyber-cyan to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-semibold text-white leading-none">{user.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono capitalize leading-tight mt-0.5">
                    {user.role}
                  </div>
                </div>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 glass-panel rounded-xl shadow-2xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-cyber-border">
                    <p className="font-medium text-white">{user.name}</p>
                    <p className="text-slate-400 text-[11px] truncate">{user.email}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                      isAdmin ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {user.role} account
                    </span>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-slate-300 hover:bg-cyber-hover hover:text-white transition-colors"
                  >
                    <User className="w-4 h-4 text-cyber-cyan" />
                    <span>Account Profile</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-purple-300 hover:bg-purple-950/30 transition-colors"
                    >
                      <ShieldAlert className="w-4 h-4 text-purple-400" />
                      <span>Admin Control Panel</span>
                    </Link>
                  )}

                  <div className="border-t border-cyber-border my-1"></div>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-400 hover:bg-red-950/30 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-cyber-cyan text-slate-950 hover:bg-cyan-400 shadow-cyber-glow transition-all"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
