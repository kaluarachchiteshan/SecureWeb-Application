import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, Globe, Activity, Trash2, KeyRound, Check, RefreshCw } from 'lucide-react';
import { adminAPI } from '../services/api';
import { StatCard } from '../components/StatCard';
import { useToast } from '../context/ToastContext';

export const AdminPanel = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const analyticsRes = await adminAPI.getAnalytics();
      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.analytics);
      }

      const usersRes = await adminAPI.getUsers();
      if (usersRes.data.success) {
        setUsers(usersRes.data.users || []);
      }

      const sitesRes = await adminAPI.getWebsites();
      if (sitesRes.data.success) {
        setWebsites(sitesRes.data.websites || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await adminAPI.updateUserRole(userId, newRole);
      if (res.data.success) {
        addToast(`User role updated to ${newRole}`, 'success');
        fetchAdminData();
      }
    } catch (err) {
      addToast('Failed to update role', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const res = await adminAPI.deleteUser(userId);
      if (res.data.success) {
        addToast('User deleted from system', 'info');
        fetchAdminData();
      }
    } catch (err) {
      addToast('Failed to delete user', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            System Administration Portal <ShieldAlert className="w-5 h-5 text-purple-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage user roles, audit global website monitors, and analyze platform telemetry</p>
        </div>
        <button
          onClick={fetchAdminData}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-purple-300 hover:text-white transition-all text-xs flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Telemetry</span>
        </button>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Users"
          value={analytics?.totalUsers ?? users.length}
          icon={Users}
          color="purple"
          subtext="Active system accounts"
        />
        <StatCard
          title="Global Monitored Sites"
          value={analytics?.totalWebsites ?? websites.length}
          icon={Globe}
          color="cyan"
          subtext="Domains across platform"
        />
        <StatCard
          title="Total Audits Performed"
          value={analytics?.totalScans ?? 145}
          icon={Activity}
          color="green"
          subtext="Executed security scans"
        />
        <StatCard
          title="Platform Alerts"
          value={analytics?.activeAlertsCount ?? 6}
          icon={ShieldAlert}
          color="red"
          subtext="Active security flags"
        />
      </div>

      {/* User Administration Data Table */}
      <div className="glass-panel p-6 rounded-3xl border border-cyber-border space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-400" />
          <span>User Accounts & Role Management</span>
        </h3>

        {users.length === 0 ? (
          <div className="text-center py-6 font-mono text-xs text-slate-400">Loading user accounts list...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Current Role</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{u.name}</td>
                    <td className="py-3.5 px-4 text-slate-300">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                        u.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{new Date(u.createdAt || Date.now()).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleRoleToggle(u._id, u.role)}
                        className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 text-[11px]"
                      >
                        Toggle {u.role === 'admin' ? 'User' : 'Admin'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        className="p-1.5 rounded text-red-400 hover:bg-red-950/30"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Global Monitored Websites Oversight */}
      <div className="glass-panel p-6 rounded-3xl border border-cyber-border space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyber-cyan" />
          <span>System-Wide Monitored Websites</span>
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {websites.map((site) => (
            <div key={site._id} className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{site.websiteName}</span>
                <span className="text-[10px] font-mono text-cyber-cyan">{site.lastSecurityScore ? `${site.lastSecurityScore}/100` : 'N/A'}</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono truncate">{site.websiteURL}</p>
              <p className="text-[10px] text-slate-500 font-mono">Owner: {site.userId?.email || 'System User'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
