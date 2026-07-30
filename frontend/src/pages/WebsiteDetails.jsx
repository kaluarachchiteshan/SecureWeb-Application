import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Globe,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Cpu,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Server,
  AlertTriangle,
  Mail,
  Network,
  Copy,
  Check,
  Code2,
} from 'lucide-react';
import { websiteAPI, scanAPI, reportAPI } from '../services/api';
import { ScoreGauge } from '../components/ScoreGauge';
import { VulnerabilityBadge } from '../components/VulnerabilityBadge';
import { useToast } from '../context/ToastContext';

export const WebsiteDetails = () => {
  const { id } = useParams();
  const [website, setWebsite] = useState(null);
  const [latestScan, setLatestScan] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState('');
  const { addToast } = useToast();

  const fetchSiteData = async () => {
    setLoading(true);
    try {
      const siteRes = await websiteAPI.getWebsiteById(id);
      if (siteRes.data.success) {
        setWebsite(siteRes.data.website);
      }

      const scanRes = await scanAPI.getLatestScan(id);
      if (scanRes.data.success) {
        setLatestScan(scanRes.data.scan);
      }

      const historyRes = await scanAPI.getScanHistory(id);
      if (historyRes.data.success) {
        setScanHistory(historyRes.data.scans || []);
      }
    } catch (err) {
      console.error('Error loading site details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiteData();
  }, [id]);

  const handleRunScanNow = async () => {
    if (!website) return;
    setScanning(true);
    addToast(`Scanning ${website.websiteName}...`, 'info');
    try {
      const res = await scanAPI.triggerScan({ websiteId: website._id, websiteURL: website.websiteURL });
      if (res.data.success) {
        addToast('Security scan complete!', 'success');
        fetchSiteData();
      }
    } catch (err) {
      addToast('Scan failed', 'error');
    } fontally: {
      setScanning(false);
    }
  };

  const badgeUrl = websiteAPI.getBadgeUrl(id);
  const fullBadgeUrl = `${window.location.origin}${badgeUrl}`;
  const markdownEmbed = `[![Secured by SecureWeb](${fullBadgeUrl})](${website?.websiteURL || '#'})`;
  const htmlEmbed = `<a href="${website?.websiteURL || '#'}"><img src="${fullBadgeUrl}" alt="Secured by SecureWeb" /></a>`;

  const copyBadgeCode = (code, type) => {
    navigator.clipboard.writeText(code);
    setCopiedBadge(type);
    addToast(`Copied ${type} embed code!`, 'success');
    setTimeout(() => setCopiedBadge(''), 2000);
  };

  if (loading) {
    return <div className="text-center py-20 font-mono text-xs text-slate-400">Loading website audit details...</div>;
  }

  if (!website) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-base font-bold text-white">Website Record Not Found</p>
        <Link to="/websites" className="text-xs text-cyber-cyan hover:underline">Back to Monitored Sites</Link>
      </div>
    );
  }

  const headers = latestScan?.headerAudit || {};
  const dns = latestScan?.dnsAudit || {};
  const ports = latestScan?.portAudit || { scannedPortsCount: 10, openPorts: [] };

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <Link to="/websites" className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Monitored Websites</span>
      </Link>

      {/* Website Header Card */}
      <div className="glass-panel p-6 rounded-3xl border border-cyber-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{website.websiteName}</h1>
            {latestScan?.riskLevel && <VulnerabilityBadge severity={latestScan.riskLevel} />}
          </div>
          <p className="text-xs font-mono text-cyber-cyan">{website.websiteURL}</p>
          <p className="text-xs text-slate-400 max-w-xl">{website.description || 'Monitored web service endpoint'}</p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRunScanNow}
            disabled={scanning}
            className="px-4 py-2.5 rounded-xl bg-cyber-cyan text-slate-950 font-bold text-xs flex items-center gap-2 hover:bg-cyan-400 shadow-cyber-glow transition-all disabled:opacity-50"
          >
            <Cpu className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
            <span>{scanning ? 'Scanning...' : 'Re-Scan Site'}</span>
          </button>
          
          <a
            href={reportAPI.getPdfUrl(website._id)}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 text-white border border-slate-700 text-xs font-medium hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-cyber-cyan" />
            <span>Export PDF</span>
          </a>

          <a
            href={reportAPI.getCsvUrl(website._id)}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2.5 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 text-xs font-medium hover:text-white transition-colors"
          >
            CSV
          </a>
        </div>
      </div>

      {/* Main Audit Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Score Overview Gauge */}
        <div className="glass-panel p-6 rounded-3xl border border-cyber-border flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-bold text-white mb-2 self-start">Audit Security Score</h3>
          <ScoreGauge score={latestScan?.securityScore ?? 80} size={180} />
          <div className="mt-4 pt-4 border-t border-slate-800 w-full text-xs font-mono space-y-1 text-slate-400">
            <div>Response Time: <span className="text-white font-bold">{latestScan?.responseTimeMs || 120} ms</span></div>
            <div>Scan Date: <span className="text-white font-bold">{new Date(latestScan?.scanDate || Date.now()).toLocaleString()}</span></div>
          </div>
        </div>

        {/* Security Headers Matrix */}
        <div className="glass-panel p-6 rounded-3xl border border-cyber-border space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyber-cyan" />
            <span>HTTP Security Headers Audit</span>
          </h3>

          <div className="space-y-2 font-mono text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Strict-Transport-Security (HSTS)</span>
              {headers.hsts ? (
                <span className="text-emerald-400 flex items-center gap-1 font-bold"><CheckCircle2 className="w-4 h-4" /> PASS</span>
              ) : (
                <span className="text-red-400 flex items-center gap-1 font-bold"><XCircle className="w-4 h-4" /> MISSING</span>
              )}
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Content-Security-Policy (CSP)</span>
              {headers.csp ? (
                <span className="text-emerald-400 flex items-center gap-1 font-bold"><CheckCircle2 className="w-4 h-4" /> PASS</span>
              ) : (
                <span className="text-red-400 flex items-center gap-1 font-bold"><XCircle className="w-4 h-4" /> MISSING</span>
              )}
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">X-Frame-Options (Clickjacking)</span>
              {headers.xFrameOptions ? (
                <span className="text-emerald-400 flex items-center gap-1 font-bold"><CheckCircle2 className="w-4 h-4" /> PASS</span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1 font-bold"><XCircle className="w-4 h-4" /> MISSING</span>
              )}
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">X-Content-Type-Options</span>
              {headers.xContentTypeOptions ? (
                <span className="text-emerald-400 flex items-center gap-1 font-bold"><CheckCircle2 className="w-4 h-4" /> PASS</span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1 font-bold"><XCircle className="w-4 h-4" /> MISSING</span>
              )}
            </div>
          </div>
        </div>

        {/* DNS & Port Infrastructure Status */}
        <div className="glass-panel p-6 rounded-3xl border border-cyber-border space-y-4 font-mono text-xs">
          <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
            <Mail className="w-4 h-4 text-purple-400" />
            <span>DNS & Port Security Probe</span>
          </h3>

          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <span>SPF Record</span>
              <span className={dns.hasSpf ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                {dns.hasSpf ? 'CONFIGURED' : 'MISSING'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <span>DMARC Policy</span>
              <span className={dns.hasDmarc ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                {dns.hasDmarc ? 'CONFIGURED' : 'MISSING'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <span>Network Ports Probed</span>
              <span className="text-white font-bold">{ports.scannedPortsCount || 10} Common Services</span>
            </div>
          </div>
        </div>
      </div>

      {/* Embeddable Live Security Badge Generator */}
      <div className="glass-panel p-6 rounded-3xl border border-cyber-border space-y-4 font-mono text-xs">
        <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
          <Code2 className="w-4 h-4 text-cyber-cyan" />
          <span>Embeddable Live Security Badge</span>
        </h3>
        <p className="text-slate-400 text-xs font-sans">
          Embed this live dynamic SVG security badge in your website footer or GitHub repository README to showcase your site's security score.
        </p>

        <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Badge Live Preview</span>
            <img src={badgeUrl} alt="Security Badge" className="h-7" />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => copyBadgeCode(markdownEmbed, 'Markdown')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 flex items-center gap-1.5 transition-all text-xs font-bold"
            >
              {copiedBadge === 'Markdown' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Markdown</span>
            </button>
            <button
              onClick={() => copyBadgeCode(htmlEmbed, 'HTML')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 flex items-center gap-1.5 transition-all text-xs font-bold"
            >
              {copiedBadge === 'HTML' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy HTML</span>
            </button>
          </div>
        </div>
      </div>

      {/* Itemized Vulnerability Findings */}
      <div className="glass-panel p-6 rounded-3xl border border-cyber-border space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Vulnerability Findings & Recommendations</span>
        </h3>

        {latestScan?.vulnerabilities && latestScan.vulnerabilities.length > 0 ? (
          <div className="space-y-3">
            {latestScan.vulnerabilities.map((vuln, i) => (
              <div key={i} className="p-4 bg-slate-900/70 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{vuln.name}</span>
                  <VulnerabilityBadge severity={vuln.severity} />
                </div>
                <p className="text-xs text-slate-300">{vuln.description}</p>
                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono text-cyber-cyan">
                  💡 Recommendation: {vuln.recommendation}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-emerald-400 font-mono">
            No vulnerabilities detected! Site passes security checks cleanly.
          </div>
        )}
      </div>
    </div>
  );
};
