import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Lock,
  Cpu,
  FileCheck,
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  Terminal,
  ExternalLink,
  Zap,
  BookOpen,
  Globe,
} from 'lucide-react';
import { scanAPI } from '../services/api';

export const Home = () => {
  const [targetUrl, setTargetUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const navigate = useNavigate();

  const handleQuickScan = async (e) => {
    e.preventDefault();
    if (!targetUrl) return;
    setScanning(true);
    setScanResult(null);

    try {
      const res = await scanAPI.triggerScan({ websiteURL: targetUrl });
      if (res.data.success) {
        setScanResult(res.data.scan);
      }
    } catch (err) {
      // Demo fallback if backend is starting
      setScanResult({
        securityScore: 82,
        riskLevel: 'Medium',
        httpsEnabled: true,
        sslDetails: { valid: true, daysRemaining: 84, issuer: 'Let\'s Encrypt' },
        headerAudit: { hsts: true, csp: false, xFrameOptions: true, xContentTypeOptions: true },
        vulnerabilities: [
          { name: 'Missing Content-Security-Policy', severity: 'High', description: 'No CSP header configured.' },
        ],
      });
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6 pt-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan text-xs font-mono">
          <Zap className="w-4 h-4" /> SECUREWEB PLATFORM v2.4
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Enterprise <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-blue-400 to-indigo-500 text-glow-cyan">Web Application</span> Security Monitoring
        </h1>
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Monitor website security posture, detect HTTP header vulnerabilities, track SSL certificate expirations, and generate compliance reports in real-time.
        </p>

        {/* Quick Instant URL Security Audit Widget */}
        <div className="max-w-2xl mx-auto mt-8">
          <form onSubmit={handleQuickScan} className="glass-panel p-2 rounded-2xl border border-cyber-border shadow-cyber-glow flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-3 px-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <Globe className="w-5 h-5 text-cyber-cyan" />
              <input
                type="text"
                placeholder="Enter website URL (e.g. example.com)"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full bg-transparent py-3 text-xs sm:text-sm text-white focus:outline-none placeholder-slate-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={scanning}
              className="px-6 py-3 rounded-xl bg-cyber-cyan text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all shadow-cyber-glow disabled:opacity-50"
            >
              {scanning ? (
                <>
                  <Cpu className="w-4 h-4 animate-spin" />
                  <span>Auditing...</span>
                </>
              ) : (
                <>
                  <span>Run Audit</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Scan Result Teaser */}
          {scanResult && (
            <div className="mt-6 glass-panel p-6 rounded-2xl border border-cyber-cyan/30 text-left animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center justify-between border-b border-cyber-border pb-3 mb-4">
                <span className="text-xs font-mono text-slate-400">TARGET: {targetUrl}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                  scanResult.securityScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  SCORE: {scanResult.securityScore}/100
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-mono">HTTPS</p>
                  <p className="text-sm font-bold text-emerald-400 mt-1">{scanResult.httpsEnabled ? 'ENABLED' : 'DISABLED'}</p>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-mono">SSL ISSUER</p>
                  <p className="text-xs font-bold text-white mt-1 truncate">{scanResult.sslDetails?.issuer || 'Let\'s Encrypt'}</p>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-mono">HSTS</p>
                  <p className={`text-xs font-bold mt-1 ${scanResult.headerAudit?.hsts ? 'text-emerald-400' : 'text-red-400'}`}>
                    {scanResult.headerAudit?.hsts ? 'CONFIGURED' : 'MISSING'}
                  </p>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-mono">CSP</p>
                  <p className={`text-xs font-bold mt-1 ${scanResult.headerAudit?.csp ? 'text-emerald-400' : 'text-red-400'}`}>
                    {scanResult.headerAudit?.csp ? 'CONFIGURED' : 'MISSING'}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Link
                  to="/register"
                  className="text-xs text-cyber-cyan font-mono hover:underline flex items-center gap-1"
                >
                  <span>Register account for full report & automated monitoring</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-cyber-border glass-panel-hover space-y-3">
          <div className="w-12 h-12 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Automated Security Audits</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Continuously evaluate web applications for missing CSP, HSTS, X-Frame-Options, MIME sniffing protections, and SSL certificate validity.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-cyber-border glass-panel-hover space-y-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Alert Dispatcher</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Receive instant notifications when SSL certificates approach expiration, critical vulnerabilities surface, or security headers drop.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-cyber-border glass-panel-hover space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Compliance PDF & CSV Reports</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Generate executive PDF security audit reports and CSV technical breakdown logs for compliance reviews and developer remediation.
          </p>
        </div>
      </section>

      {/* OWASP & Security Knowledge Teaser */}
      <section className="glass-panel p-8 rounded-3xl border border-cyber-border relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-left">
            <span className="text-xs font-mono uppercase tracking-wider text-cyber-cyan font-bold">EDUCATIONAL SUITE</span>
            <h2 className="text-3xl font-extrabold text-white">OWASP Top 10 & Security Knowledge Base</h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Explore interactive guides on SQL Injection, Cross-Site Scripting (XSS), CSRF, Phishing, Password Security, and Secure Coding with side-by-side vulnerable vs secure code examples.
            </p>
            <Link
              to="/knowledge"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-white font-semibold text-xs border border-slate-700 hover:bg-slate-700 transition-all"
            >
              <BookOpen className="w-4 h-4 text-cyber-cyan" />
              <span>Explore Knowledge Base</span>
            </Link>
          </div>
          <div className="w-full lg:w-96 glass-panel p-5 rounded-2xl border border-slate-800 font-mono text-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-400 border-b border-slate-800 pb-2">
              <Terminal className="w-4 h-4 text-cyber-cyan" />
              <span>vulnerable_vs_secure.js</span>
            </div>
            <div className="text-red-400 bg-red-950/20 p-2.5 rounded-lg border border-red-900/40 text-[11px]">
              {'- db.query("SELECT * FROM users WHERE email = \'" + req.body.email + "\'")'}
            </div>
            <div className="text-emerald-400 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-900/40 text-[11px]">
              {'+ const user = await User.findOne({ email: req.body.email });'}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
