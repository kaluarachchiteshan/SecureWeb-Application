import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Cpu,
  Globe,
  Terminal,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Download,
  ArrowRight,
  Server,
  Zap,
  Copy,
  Check,
  Code2,
  Mail,
  Network,
} from 'lucide-react';
import { scanAPI, websiteAPI } from '../services/api';
import { ScoreGauge } from '../components/ScoreGauge';
import { VulnerabilityBadge } from '../components/VulnerabilityBadge';
import { useToast } from '../context/ToastContext';
import { getRemediationSnippets } from '../../../backend/utils/remediationGuide.js';

export const SecurityScanner = () => {
  const [targetUrl, setTargetUrl] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [websites, setWebsites] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanResult, setScanResult] = useState(null);
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'remediation'
  const [remediationTab, setRemediationTab] = useState('nginx'); // 'nginx' | 'apache' | 'express' | 'cloudflare'
  const [copiedKey, setCopiedKey] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    const loadSites = async () => {
      try {
        const res = await websiteAPI.getWebsites({ limit: 50 });
        if (res.data.success) {
          setWebsites(res.data.websites || []);
        }
      } catch (e) {
        // Continue
      }
    };
    loadSites();
  }, []);

  const handleSelectSite = (e) => {
    const siteId = e.target.value;
    setSelectedSiteId(siteId);
    if (siteId) {
      const site = websites.find((w) => w._id === siteId);
      if (site) setTargetUrl(site.websiteURL);
    }
  };

  const handleScanSubmit = async (e) => {
    e.preventDefault();
    if (!targetUrl) return;

    setScanning(true);
    setScanResult(null);
    setScanStep(1);

    setTimeout(() => setScanStep(2), 600);
    setTimeout(() => setScanStep(3), 1200);

    try {
      const res = await scanAPI.triggerScan({
        websiteId: selectedSiteId || undefined,
        websiteURL: targetUrl,
      });

      if (res.data.success) {
        setTimeout(() => {
          setScanStep(4);
          setScanResult(res.data.scan);
          setScanning(false);
          addToast(`Security audit completed for ${targetUrl}!`, 'success');
        }, 1800);
      }
    } catch (err) {
      setTimeout(() => {
        setScanning(false);
        addToast(err.response?.data?.message || 'Scan error occurred', 'error');
      }, 1800);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    addToast('Remediation code snippet copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(''), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-cyber-border">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          Security Scanner Engine <Cpu className="w-5 h-5 text-cyber-cyan" />
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Perform multi-layer security audits: HTTP Security Headers, SSL/TLS, DNS/Email Spoofing, & Network Port Probing
        </p>
      </div>

      {/* Target URL Input Panel */}
      <div className="glass-panel p-6 rounded-3xl border border-cyber-border space-y-4">
        <form onSubmit={handleScanSubmit} className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-mono text-slate-300">Target Website URL</label>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-900 rounded-xl border border-slate-800 focus-within:border-cyber-cyan">
                <Globe className="w-4 h-4 text-cyber-cyan" />
                <input
                  type="text"
                  required
                  placeholder="https://example.com"
                  value={targetUrl}
                  onChange={(e) => {
                    setTargetUrl(e.target.value);
                    setSelectedSiteId('');
                  }}
                  className="w-full bg-transparent text-xs text-white font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-300">Or Pick Monitored Site</label>
              <select
                value={selectedSiteId}
                onChange={handleSelectSite}
                className="w-full px-3 py-2.5 bg-slate-900 rounded-xl border border-slate-800 text-xs text-white focus:outline-none font-mono"
              >
                <option value="">-- Select Saved Site --</option>
                {websites.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.websiteName} ({w.websiteURL})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={scanning}
            className="w-full py-3 rounded-xl bg-cyber-cyan text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:bg-cyan-400 shadow-cyber-glow transition-all disabled:opacity-50"
          >
            {scanning ? (
              <>
                <Cpu className="w-4 h-4 animate-spin" />
                <span>Executing Multi-Probe Security Audit Engine...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Initiate Full Security Scan</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Live Scan Step Terminal Simulator */}
      {scanning && (
        <div className="glass-panel p-6 rounded-3xl border border-cyber-cyan/40 space-y-3 font-mono text-xs animate-in fade-in">
          <div className="flex items-center gap-2 text-cyber-cyan border-b border-slate-800 pb-2">
            <Terminal className="w-4 h-4" />
            <span>SECUREWEB MULTI-PROBE LOG</span>
          </div>

          <div className="space-y-2 pt-1 text-slate-300">
            <div className={`flex items-center gap-2 ${scanStep >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
              {scanStep >= 1 ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-slate-700" />}
              <span>[1/4] Resolving host, checking SSL/TLS certificates and TLS handshake parameters...</span>
            </div>

            <div className={`flex items-center gap-2 ${scanStep >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
              {scanStep >= 2 ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-slate-700" />}
              <span>[2/4] Auditing HTTP Response Headers (HSTS, CSP, X-Frame-Options, MIME-Sniffing)...</span>
            </div>

            <div className={`flex items-center gap-2 ${scanStep >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
              {scanStep >= 3 ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-slate-700" />}
              <span>[3/4] Resolving DNS records & evaluating SPF / DMARC email spoofing protection...</span>
            </div>

            <div className={`flex items-center gap-2 ${scanStep >= 4 ? 'text-emerald-400' : 'text-slate-500'}`}>
              {scanStep >= 4 ? <CheckCircle2 className="w-4 h-4 animate-pulse" /> : <div className="w-4 h-4 rounded-full border border-slate-700" />}
              <span>[4/4] Probing network ports (SSH, FTP, MySQL, Postgres, MongoDB, Redis) for exposures...</span>
            </div>
          </div>
        </div>
      )}

      {/* Scan Results Display */}
      {scanResult && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
          {/* Navigation Bar between Audit Results and Remediation Snippets */}
          <div className="flex border-b border-cyber-border gap-6 text-xs font-bold font-mono">
            <button
              onClick={() => setActiveTab('audit')}
              className={`pb-3 transition-colors ${
                activeTab === 'audit'
                  ? 'text-cyber-cyan border-b-2 border-cyber-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Audit Findings & Metrics
            </button>
            <button
              onClick={() => setActiveTab('remediation')}
              className={`pb-3 transition-colors flex items-center gap-1.5 ${
                activeTab === 'remediation'
                  ? 'text-cyber-cyan border-b-2 border-cyber-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Remediation Playbooks & Fix Snippets</span>
            </button>
          </div>

          {activeTab === 'audit' && (
            <>
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Score Radial */}
                <div className="glass-panel p-6 rounded-3xl border border-cyber-border flex flex-col items-center justify-center text-center">
                  <h3 className="text-sm font-bold text-white mb-2 self-start">Audit Security Score</h3>
                  <ScoreGauge score={scanResult.securityScore} size={170} />
                  <div className="mt-4 pt-3 border-t border-slate-800 w-full text-xs font-mono">
                    Risk Level: <VulnerabilityBadge severity={scanResult.riskLevel} />
                  </div>
                </div>

                {/* Header Matrix */}
                <div className="glass-panel p-6 rounded-3xl border border-cyber-border space-y-3 font-mono text-xs">
                  <h3 className="text-sm font-bold text-white font-sans">HTTP Headers Audit</h3>
                  
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span>HSTS Header</span>
                    <span className={scanResult.headerAudit?.hsts ? 'text-emerald-400' : 'text-red-400'}>
                      {scanResult.headerAudit?.hsts ? 'PASS' : 'MISSING'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span>Content-Security-Policy</span>
                    <span className={scanResult.headerAudit?.csp ? 'text-emerald-400' : 'text-red-400'}>
                      {scanResult.headerAudit?.csp ? 'PASS' : 'MISSING'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span>X-Frame-Options</span>
                    <span className={scanResult.headerAudit?.xFrameOptions ? 'text-emerald-400' : 'text-amber-400'}>
                      {scanResult.headerAudit?.xFrameOptions ? 'PASS' : 'MISSING'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span>X-Content-Type-Options</span>
                    <span className={scanResult.headerAudit?.xContentTypeOptions ? 'text-emerald-400' : 'text-amber-400'}>
                      {scanResult.headerAudit?.xContentTypeOptions ? 'PASS' : 'MISSING'}
                    </span>
                  </div>
                </div>

                {/* SSL & DNS Card */}
                <div className="glass-panel p-6 rounded-3xl border border-cyber-border space-y-3 font-mono text-xs">
                  <h3 className="text-sm font-bold text-white font-sans flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-cyber-cyan" />
                    <span>DNS & Email Security</span>
                  </h3>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span>SPF Record</span>
                    <span className={scanResult.dnsAudit?.hasSpf ? 'text-emerald-400' : 'text-red-400'}>
                      {scanResult.dnsAudit?.hasSpf ? 'CONFIGURED' : 'MISSING'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span>DMARC Policy</span>
                    <span className={scanResult.dnsAudit?.hasDmarc ? 'text-emerald-400' : 'text-red-400'}>
                      {scanResult.dnsAudit?.hasDmarc ? 'CONFIGURED' : 'MISSING'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">HTTPS & SSL ISSUER</span>
                    <span className="text-white font-bold truncate block">
                      {scanResult.sslDetails?.issuer || 'Unknown'} ({scanResult.sslDetails?.daysRemaining ?? 0} days remaining)
                    </span>
                  </div>
                </div>
              </div>

              {/* Network Port Probe Section */}
              <div className="glass-panel p-6 rounded-3xl border border-cyber-border space-y-4 font-mono text-xs">
                <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                  <Network className="w-4 h-4 text-purple-400" />
                  <span>Network Port Probe Results ({scanResult.portAudit?.scannedPortsCount || 10} Probed Ports)</span>
                </h3>

                <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { port: 21, service: 'FTP' },
                    { port: 22, service: 'SSH' },
                    { port: 80, service: 'HTTP' },
                    { port: 443, service: 'HTTPS' },
                    { port: 3306, service: 'MySQL' },
                    { port: 5432, service: 'Postgres' },
                    { port: 27017, service: 'MongoDB' },
                    { port: 6379, service: 'Redis' },
                    { port: 8080, service: 'Dev 8080' },
                    { port: 8443, service: 'Dev 8443' },
                  ].map((p) => {
                    const isOpen = scanResult.portAudit?.openPorts?.some((op) => op.port === p.port);
                    return (
                      <div
                        key={p.port}
                        className={`p-3 rounded-xl border flex flex-col justify-between ${
                          isOpen
                            ? [80, 443].includes(p.port)
                              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                              : 'bg-red-950/40 border-red-500/50 text-red-300'
                            : 'bg-slate-900/60 border-slate-800 text-slate-500'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-bold">{p.service} (:{p.port})</span>
                        <span className="font-bold text-xs mt-1">
                          {isOpen ? ([80, 443].includes(p.port) ? 'OPEN (Normal)' : 'EXPOSED ⚠️') : 'CLOSED'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Vulnerabilities List */}
              <div className="glass-panel p-6 rounded-3xl border border-cyber-border space-y-4">
                <h3 className="text-sm font-bold text-white">Vulnerability Findings ({scanResult.vulnerabilities?.length || 0})</h3>
                {scanResult.vulnerabilities?.map((v, idx) => (
                  <div key={idx} className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{v.name}</span>
                      <VulnerabilityBadge severity={v.severity} />
                    </div>
                    <p className="text-xs text-slate-300">{v.description}</p>
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-cyber-cyan flex items-center justify-between">
                      <span>Fix: {v.recommendation}</span>
                      <button
                        onClick={() => setActiveTab('remediation')}
                        className="text-[10px] px-2 py-1 bg-cyber-cyan/10 hover:bg-cyber-cyan/20 border border-cyber-cyan/30 rounded text-cyber-cyan font-bold transition-all"
                      >
                        View Code Snippet &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'remediation' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-3xl border border-cyber-border space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Actionable Remediation Playbooks</h3>
                    <p className="text-xs text-slate-400">Copy-paste production hardening configurations for your backend web server</p>
                  </div>

                  {/* Web Server Selector Tabs */}
                  <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 font-mono text-xs">
                    {['nginx', 'apache', 'express', 'cloudflare'].map((tech) => (
                      <button
                        key={tech}
                        onClick={() => setRemediationTab(tech)}
                        className={`px-3 py-1.5 rounded-lg font-bold uppercase transition-all ${
                          remediationTab === tech
                            ? 'bg-cyber-cyan text-slate-950 shadow-cyber-glow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {tech}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Remediation Cards for each Vulnerability */}
                <div className="space-y-4">
                  {(scanResult.vulnerabilities || []).map((vuln, index) => {
                    const snippets = getRemediationSnippets(vuln.name, targetUrl.replace(/^https?:\/\//, ''));
                    const codeText = snippets[remediationTab] || snippets.nginx;

                    return (
                      <div key={index} className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white">{snippets.title}</h4>
                          <button
                            onClick={() => copyToClipboard(codeText, `code_${index}`)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-mono text-slate-300 flex items-center gap-1.5 transition-all"
                          >
                            {copiedKey === `code_${index}` ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Code</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto">
                          <code>{codeText}</code>
                        </pre>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
