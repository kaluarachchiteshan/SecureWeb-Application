import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setLoading(true);
    const res = await register(name, email, password, role);
    setLoading(false);
    if (res?.success) {
      navigate('/dashboard');
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
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Create SecureWeb Account</h2>
          <p className="text-xs text-slate-400">Join the website security monitoring portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300">Full Name</label>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-900/80 rounded-xl border border-slate-800 focus-within:border-cyber-cyan transition-colors">
              <User className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300">Email Address</label>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-900/80 rounded-xl border border-slate-800 focus-within:border-cyber-cyan transition-colors">
              <Mail className="w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="alex@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300">Password</label>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-900/80 rounded-xl border border-slate-800 focus-within:border-cyber-cyan transition-colors">
              <Lock className="w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300">Account Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  role === 'user'
                    ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                Security User
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  role === 'admin'
                    ? 'bg-purple-900/30 border-purple-500 text-purple-300 font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                System Admin
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-cyber-cyan text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all shadow-cyber-glow disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-cyber-border">
          Already registered?{' '}
          <Link to="/login" className="text-cyber-cyan font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
