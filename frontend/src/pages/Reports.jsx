import React, { useState, useEffect } from 'react';
import { FileText, Download, Globe, FileCheck, ShieldCheck, Filter } from 'lucide-react';
import { websiteAPI, reportAPI } from '../services/api';

export const Reports = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState('');

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await websiteAPI.getWebsites({ limit: 50 });
        if (res.data.success) {
          setWebsites(res.data.websites || []);
          if (res.data.websites.length > 0) {
            setSelectedSite(res.data.websites[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed loading sites for reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSites();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-cyber-border">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          Security Compliance Reports <FileText className="w-5 h-5 text-cyber-cyan" />
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Export formal PDF audit documents and technical CSV vulnerability exports for compliance reporting
        </p>
      </div>

      {/* Reports Generator Hub */}
      <div className="glass-panel p-6 rounded-3xl border border-cyber-border space-y-6">
        <div className="max-w-md space-y-1">
          <label className="text-xs font-mono text-slate-300">Select Website for Report Generation</label>
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 rounded-2xl border border-slate-800 text-xs text-white focus:outline-none font-mono"
          >
            {websites.map((w) => (
              <option key={w._id} value={w._id}>
                {w.websiteName} ({w.websiteURL})
              </option>
            ))}
          </select>
        </div>

        {/* Download Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
          {/* PDF Report Card */}
          <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 glass-panel-hover flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Executive PDF Audit Report</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Includes executive security overview, security header compliance grid, SSL certificate details, itemized vulnerabilities, and fix recommendations.
              </p>
            </div>
            {selectedSite ? (
              <a
                href={reportAPI.getPdfUrl(selectedSite)}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl bg-cyber-cyan text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:bg-cyan-400 shadow-cyber-glow transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Audit Report</span>
              </a>
            ) : (
              <button disabled className="w-full py-3 rounded-xl bg-slate-800 text-slate-500 text-xs font-bold">
                Select a Website Above
              </button>
            )}
          </div>

          {/* CSV Technical Data Export Card */}
          <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 glass-panel-hover flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Technical CSV Data Export</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Raw comma-separated dataset containing scan metrics, score values, HTTPS status, vulnerability names, severity levels, and remediation instructions.
              </p>
            </div>
            {selectedSite ? (
              <a
                href={reportAPI.getCsvUrl(selectedSite)}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-700 transition-all border border-slate-700"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export CSV Raw Dataset</span>
              </a>
            ) : (
              <button disabled className="w-full py-3 rounded-xl bg-slate-800 text-slate-500 text-xs font-bold">
                Select a Website Above
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
