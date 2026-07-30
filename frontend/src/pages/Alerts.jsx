import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Trash2, Filter, Bell, ShieldAlert, Check } from 'lucide-react';
import { alertAPI } from '../services/api';
import { VulnerabilityBadge } from '../components/VulnerabilityBadge';
import { useToast } from '../context/ToastContext';

export const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { addToast } = useToast();

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await alertAPI.getAlerts({ severity: severityFilter, status: statusFilter });
      if (res.data.success) {
        setAlerts(res.data.alerts || []);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [severityFilter, statusFilter]);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await alertAPI.updateStatus(id, status);
      if (res.data.success) {
        addToast(`Alert status updated to ${status}`, 'success');
        fetchAlerts();
      }
    } catch (err) {
      addToast('Failed to update alert', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await alertAPI.deleteAlert(id);
      if (res.data.success) {
        addToast('Alert deleted', 'info');
        fetchAlerts();
      }
    } catch (err) {
      addToast('Failed to delete alert', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-cyber-border">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          Security Alert Console <Bell className="w-5 h-5 text-amber-400" />
        </h1>
        <p className="text-xs text-slate-400 mt-1">Real-time alerts for expired SSL certificates, missing security headers, and high-risk vulnerabilities</p>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-cyber-border flex flex-wrap items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <Filter className="w-4 h-4 text-cyber-cyan" />
          <span>Filters:</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-800 text-white focus:outline-none"
          >
            <option value="">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-800 text-white focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="text-center py-12 font-mono text-xs text-slate-400">Loading alerts log...</div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl border border-cyber-border space-y-2">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No Security Alerts</h3>
          <p className="text-xs text-slate-400">All target domains are currently operating without active alert flags.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert._id}
              className={`glass-panel p-5 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                alert.status === 'resolved'
                  ? 'border-emerald-500/20 opacity-70'
                  : alert.severity === 'Critical'
                  ? 'border-red-500/40 shadow-cyber-red'
                  : 'border-cyber-border'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <VulnerabilityBadge severity={alert.severity} />
                  <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                    alert.status === 'active' ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {alert.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{alert.message}</p>
                <p className="text-[10px] text-slate-500 font-mono">
                  Site: {alert.websiteId?.websiteName || 'Target Site'} • Created: {new Date(alert.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                {alert.status === 'active' && (
                  <button
                    onClick={() => handleUpdateStatus(alert._id, 'resolved')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 text-xs font-mono flex items-center gap-1.5 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Resolve</span>
                  </button>
                )}

                <button
                  onClick={() => handleDelete(alert._id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                  title="Delete Alert"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
