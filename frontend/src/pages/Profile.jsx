import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Shield, Key, CheckCircle2, Copy, Check, RefreshCw, Trash2, Code } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

export const Profile = () => {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [keyLoading, setKeyLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await authAPI.getProfile();
        if (res.data.success && res.data.user) {
          if (res.data.user.apiKey) {
            setApiKey(res.data.user.apiKey);
          }
        }
      } catch (e) {
        // Fallback
      }
    };
    fetchProfileData();
  }, []);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      addToast('Password must be at least 6 characters', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.resetPassword({ email: user.email, newPassword });
      if (res.data.success) {
        addToast('Password updated successfully!', 'success');
        setNewPassword('');
      }
    } catch (err) {
      addToast('Failed to update password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateApiKey = async () => {
    setKeyLoading(true);
    try {
      const res = await authAPI.generateApiKey();
      if (res.data.success) {
        setApiKey(res.data.apiKey);
        addToast('New Developer API Key generated!', 'success');
      }
    } catch (err) {
      addToast('Failed to generate API Key', 'error');
    } finally {
      setKeyLoading(false);
    }
  };

  const handleRevokeApiKey = async () => {
    setKeyLoading(true);
    try {
      const res = await authAPI.revokeApiKey();
      if (res.data.success) {
        setApiKey('');
        addToast('API Key revoked successfully', 'info');
      }
    } catch (err) {
      addToast('Failed to revoke API Key', 'error');
    } finally {
      setKeyLoading(false);
    }
  };

  const copyApiKey = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    addToast('API Key copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-cyber-border">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          User Account Profile <User className="w-5 h-5 text-cyber-cyan" />
        </h1>
        <p className="text-xs text-slate-400 mt-1">Manage security credentials, view active sessions, and access Developer API keys</p>
      </div>

      {/* Account Info Card */}
      <div className="glass-panel p-6 rounded-3xl border border-cyber-border space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyber-cyan to-indigo-600 flex items-center justify-center font-extrabold text-2xl text-white shadow-cyber-glow">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{user?.name}</h2>
            <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
              user?.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-blue-500/20 text-blue-300'
            }`}>
              {user?.role} ROLE
            </span>
          </div>
        </div>
      </div>

      {/* Developer API Key Generator Card */}
      <div className="glass-panel p-6 rounded-3xl border border-cyber-border space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 font-sans">
            <Code className="w-4 h-4 text-cyber-cyan" />
            <span>Developer REST API Access Keys</span>
          </h3>
          <span className="text-[10px] text-emerald-400 font-bold">X-API-KEY AUTH</span>
        </div>
        <p className="text-slate-400 text-xs font-sans">
          Use developer API keys to trigger security scans programmatically from your GitHub Actions or CI/CD pipelines.
        </p>

        {apiKey ? (
          <div className="space-y-3">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
              <span className="text-cyber-cyan font-bold break-all">{apiKey}</span>
              <button
                onClick={copyApiKey}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 text-xs flex items-center gap-1.5 transition-all shrink-0 font-sans font-bold"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleGenerateApiKey}
                disabled={keyLoading}
                className="px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl flex items-center gap-1.5 transition-all font-sans font-bold text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${keyLoading ? 'animate-spin' : ''}`} />
                <span>Regenerate Key</span>
              </button>

              <button
                onClick={handleRevokeApiKey}
                disabled={keyLoading}
                className="px-3 py-2 bg-red-950/40 border border-red-500/40 hover:bg-red-900/60 text-red-300 rounded-xl flex items-center gap-1.5 transition-all font-sans font-bold text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Revoke Key</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleGenerateApiKey}
            disabled={keyLoading}
            className="px-4 py-2.5 bg-cyber-cyan text-slate-950 rounded-xl font-bold font-sans text-xs flex items-center gap-2 hover:bg-cyan-400 shadow-cyber-glow transition-all disabled:opacity-50"
          >
            <Key className="w-4 h-4" />
            <span>{keyLoading ? 'Generating Key...' : 'Generate New API Key'}</span>
          </button>
        )}
      </div>

      {/* Security Credentials Update Form */}
      <div className="glass-panel p-6 rounded-3xl border border-cyber-border space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-cyber-cyan" />
          <span>Update Security Password</span>
        </h3>

        <form onSubmit={handlePasswordReset} className="space-y-4 max-w-md">
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300">New Password</label>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-900 rounded-xl border border-slate-800 focus-within:border-cyber-cyan">
              <Lock className="w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-transparent text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-cyber-cyan text-slate-950 font-bold text-xs hover:bg-cyan-400 shadow-cyber-glow transition-all"
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* JWT Session Token Box */}
      <div className="glass-panel p-6 rounded-3xl border border-cyber-border space-y-3 font-mono text-xs">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 font-sans">
          <Key className="w-4 h-4 text-emerald-400" />
          <span>Active JWT Session Token</span>
        </h3>
        <p className="text-[11px] text-slate-400 font-sans">
          Used by client requests for Bearer Authorization header verification
        </p>
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-400 break-all text-[11px]">
          {localStorage.getItem('secureweb_token') || 'Token active in session memory'}
        </div>
      </div>
    </div>
  );
};
