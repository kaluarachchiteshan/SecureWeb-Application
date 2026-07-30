import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Cpu,
  ArrowUpRight,
  RefreshCw,
  FileText,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { scanAPI, alertAPI } from '../services/api';
import { StatCard } from '../components/StatCard';
import { ScoreGauge } from '../components/ScoreGauge';
import { VulnerabilityBadge } from '../components/VulnerabilityBadge';
import { useToast } from '../context/ToastContext';

export const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await scanAPI.getMetrics();
      if (res.data.success) {
        setMetrics(res.data.metrics);
      }
    } catch (err) {
      console.error('Error loading dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  // Vulnerability Distribution Chart Data
  const pieData = [
    { name: 'Critical', value: metrics?.criticalCount || 1, color: '#ef4444' },
    { name: 'High', value: metrics?.highCount || 2, color: '#f97316' },
    { name: 'Medium', value: metrics?.mediumCount || 3, color: '#eab308' },
    { name: 'Low', value: metrics?.lowCount || 1, color: '#3b82f6' },
  ];

  // Demo Score Comparison Bar Chart Data
  const barData = [
    { site: 'Production API', score: 92 },
    { site: 'Admin Portal', score: 48 },
    { site: 'Customer App', score: 85 },
    { site: 'Payment Gateway', score: 95 },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-cyber-border">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Security Operations Center <Activity className="w-5 h-5 text-cyber-cyan animate-pulse" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">Real-time web application security status and threat monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchMetrics}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all text-xs flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/scanner"
            className="px-4 py-2.5 rounded-xl bg-cyber-cyan text-slate-950 font-bold text-xs flex items-center gap-2 hover:bg-cyan-400 shadow-cyber-glow transition-all"
          >
            <Cpu className="w-4 h-4" />
            <span>New Security Scan</span>
          </Link>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monitored Websites"
          value={metrics?.totalWebsites ?? 0}
          icon={Globe}
          color="cyan"
          subtext="Active HTTP/SSL monitors"
        />
        <StatCard
          title="Average Security Score"
          value={`${metrics?.avgSecurityScore ?? 85}/100`}
          icon={ShieldCheck}
          color={metrics?.avgSecurityScore < 60 ? 'red' : 'green'}
          subtext="Weighted health index"
        />
        <StatCard
          title="Total Vulnerabilities"
          value={metrics?.totalVulnerabilities ?? 0}
          icon={ShieldAlert}
          color="amber"
          subtext={`${metrics?.criticalCount ?? 0} Critical issues`}
        />
        <StatCard
          title="Active System Alerts"
          value={metrics?.activeAlertsCount ?? 0}
          icon={AlertTriangle}
          color="purple"
          subtext="Pending resolution"
        />
      </div>

      {/* Visual Analytics Graphs Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Overall Security Score Radial Gauge */}
        <div className="glass-panel p-6 rounded-3xl border border-cyber-border flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-bold text-white mb-2 self-start">Overall Security Health</h3>
          <p className="text-[11px] text-slate-400 mb-4 self-start">Aggregated security score across all websites</p>
          <ScoreGauge score={metrics?.avgSecurityScore ?? 78} size={170} />
          <div className="mt-4 pt-4 border-t border-slate-800 w-full flex justify-around text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">STATUS</span>
              <span className="text-emerald-400 font-bold">MONITORED</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">RISK INDEX</span>
              <span className="text-amber-300 font-bold">LOW-MED</span>
            </div>
          </div>
        </div>

        {/* Vulnerabilities Breakdown Pie Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-cyber-border flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Vulnerabilities by Severity</h3>
            <p className="text-[11px] text-slate-400 mb-4">Categorized OWASP & Header security findings</p>
          </div>
          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#070b15" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0e1626', borderColor: '#1e293d', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-4 gap-1 text-center font-mono text-[10px] pt-2 border-t border-slate-800">
            {pieData.map((p) => (
              <div key={p.name}>
                <span className="block font-bold" style={{ color: p.color }}>{p.value}</span>
                <span className="text-slate-400">{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Score Distribution Bar Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-cyber-border flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Site Security Scores</h3>
            <p className="text-[11px] text-slate-400 mb-4">Comparative score by monitored domain</p>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293d" vertical={false} />
                <XAxis dataKey="site" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: '#0e1626', borderColor: '#1e293d', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="score" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Scans & Recent Alerts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Security Scans List */}
        <div className="glass-panel p-6 rounded-3xl border border-cyber-border space-y-4">
          <div className="flex items-center justify-between border-b border-cyber-border pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyber-cyan" />
              <span>Recent Security Audits</span>
            </h3>
            <Link to="/websites" className="text-xs text-cyber-cyan hover:underline font-mono">View All</Link>
          </div>

          <div className="space-y-2.5">
            {metrics?.recentScans && metrics.recentScans.length > 0 ? (
              metrics.recentScans.map((scan) => (
                <div
                  key={scan._id}
                  className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-white">
                      {scan.websiteId?.websiteName || 'Custom Target Scan'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {scan.websiteId?.websiteURL || 'Target URL'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <VulnerabilityBadge severity={scan.riskLevel} />
                    <span className="text-xs font-bold text-cyber-cyan font-mono">{scan.securityScore}/100</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-slate-500 font-mono">
                No recent security scans recorded. Launch a scan to inspect target sites.
              </div>
            )}
          </div>
        </div>

        {/* Recent Alerts List */}
        <div className="glass-panel p-6 rounded-3xl border border-cyber-border space-y-4">
          <div className="flex items-center justify-between border-b border-cyber-border pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Recent Security Alerts</span>
            </h3>
            <Link to="/alerts" className="text-xs text-cyber-cyan hover:underline font-mono">Alert Console</Link>
          </div>

          <div className="space-y-2.5">
            {metrics?.activeAlerts && metrics.activeAlerts.length > 0 ? (
              metrics.activeAlerts.map((alert) => (
                <div
                  key={alert._id}
                  className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <VulnerabilityBadge severity={alert.severity} />
                      <span className="text-xs font-semibold text-white">{alert.title}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{alert.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-slate-500 font-mono">
                All clear! No active security alerts detected.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
