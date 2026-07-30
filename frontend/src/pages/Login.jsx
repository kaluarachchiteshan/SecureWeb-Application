import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, UserCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res?.success) {
      navigate('/dashboard');
    }
  };

  const handleDemoFill = (type) => {
    if (type === 'user') {
      setEmail('user@secureweb.com');
      setPassword('user123Password!');
    } else if (type === 'admin') {
      setEmail('admin@secureweb.com');
      setPassword('admin123Password!');
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-cyber-border shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyber-cyan to-blue-600 p-0.5 mx-auto flex items-center justify-center shadow-cyber-glow">
            <div className="w-full h-full bg-[#070b15] rounded-[14px] flex items-center justify-center">
              <Shield className="w-6 h-6 text-cyber-cyan" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Sign In to SecureWeb</h2>
          <p className="text-xs text-slate-400">Access your web application security monitoring dashboard</p>
        </div>

        {/* Quick Demo Account Buttons */}
        <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block text-center font-bold">
            ⚡ Quick Demo Accounts
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('user')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <UserCheck className="w-3.5 h-3.5 text-cyber-cyan" />
              <span>Standard User</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('admin')}
              className="px-3 py-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5 border border-purple-500/30"
            >
              <KeyRound className="w-3.5 h-3.5 text-purple-400" />
              <span>Admin Account</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300">Email Address</label>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-900/80 rounded-xl border border-slate-800 focus-within:border-cyber-cyan transition-colors">
              <Mail className="w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-mono text-slate-300">Password</label>
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-900/80 rounded-xl border border-slate-800 focus-within:border-cyber-cyan transition-colors">
              <Lock className="w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-cyber-cyan text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all shadow-cyber-glow disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Authenticate Session</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-cyber-border">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-cyber-cyan font-semibold hover:underline">
            Register Account
          </Link>
        </div>
      </div>
    </div>
  );
};
