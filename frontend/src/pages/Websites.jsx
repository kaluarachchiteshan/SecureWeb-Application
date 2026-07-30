import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Globe,
  Plus,
  Search,
  Cpu,
  Trash2,
  Edit3,
  ExternalLink,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Calendar,
} from 'lucide-react';
import { websiteAPI, scanAPI } from '../services/api';
import { Modal } from '../components/Modal';
import { VulnerabilityBadge } from '../components/VulnerabilityBadge';
import { useToast } from '../context/ToastContext';

export const Websites = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);

  // Form Fields
  const [nameInput, setNameInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [scanningId, setScanningId] = useState(null);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchWebsites = async () => {
    setLoading(true);
    try {
      const res = await websiteAPI.getWebsites({ search, page, limit: 6 });
      if (res.data.success) {
        setWebsites(res.data.websites);
        setTotalPages(res.data.pages || 1);
      }
    } catch (err) {
      console.error('Failed to load websites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, [search, page]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!nameInput || !urlInput) return;
    try {
      const res = await websiteAPI.addWebsite({
        websiteName: nameInput,
        websiteURL: urlInput,
        description: descInput,
      });
      if (res.data.success) {
        addToast('Website added to monitoring dashboard!', 'success');
        setIsAddOpen(false);
        setNameInput('');
        setUrlInput('');
        setDescInput('');
        fetchWebsites();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add website', 'error');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSite) return;
    try {
      const res = await websiteAPI.updateWebsite(selectedSite._id, {
        websiteName: nameInput,
        websiteURL: urlInput,
        description: descInput,
      });
      if (res.data.success) {
        addToast('Website details updated successfully!', 'success');
        setIsEditOpen(false);
        fetchWebsites();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update website', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSite) return;
    try {
      const res = await websiteAPI.deleteWebsite(selectedSite._id);
      if (res.data.success) {
        addToast('Website and scan history deleted', 'info');
        setIsDeleteOpen(false);
        fetchWebsites();
      }
    } catch (err) {
      addToast('Failed to delete website', 'error');
    }
  };

  const handleTriggerScan = async (site) => {
    setScanningId(site._id);
    addToast(`Initiating security scan for ${site.websiteName}...`, 'info');
    try {
      const res = await scanAPI.triggerScan({ websiteId: site._id, websiteURL: site.websiteURL });
      if (res.data.success) {
        addToast(`Scan complete for ${site.websiteName}! Score: ${res.data.scan.securityScore}/100`, 'success');
        fetchWebsites();
      }
    } catch (err) {
      addToast('Scan failed to complete', 'error');
    } finally {
      setScanningId(null);
    }
  };

  const openEditModal = (site) => {
    setSelectedSite(site);
    setNameInput(site.websiteName);
    setUrlInput(site.websiteURL);
    setDescInput(site.description || '');
    setIsEditOpen(true);
  };

  const openDeleteModal = (site) => {
    setSelectedSite(site);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-cyber-border">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Monitored Websites <Globe className="w-5 h-5 text-cyber-cyan" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage target domain list, launch audits, and view risk statuses</p>
        </div>
        <button
          onClick={() => {
            setNameInput('');
            setUrlInput('');
            setDescInput('');
            setIsAddOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-cyber-cyan text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:bg-cyan-400 shadow-cyber-glow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Monitored Website</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 px-4 py-3 glass-panel rounded-2xl border border-cyber-border">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by website name or URL..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full bg-transparent text-xs text-white focus:outline-none placeholder-slate-500 font-mono"
        />
      </div>

      {/* Website Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-xs font-mono text-slate-400">Loading monitored target sites...</div>
      ) : websites.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl border border-cyber-border space-y-3">
          <Globe className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Monitored Websites Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click "Add Monitored Website" to begin automated security scanning and risk tracking.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websites.map((site) => {
            const score = site.lastSecurityScore;
            return (
              <div
                key={site._id}
                className="glass-panel p-6 rounded-3xl border border-cyber-border glass-panel-hover flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-white">{site.websiteName}</h3>
                      <a
                        href={site.websiteURL}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-cyber-cyan font-mono hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <span className="truncate max-w-[200px]">{site.websiteURL}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    {site.lastRiskLevel && <VulnerabilityBadge severity={site.lastRiskLevel} />}
                  </div>
                  {site.description && (
                    <p className="text-xs text-slate-400 mt-3 line-clamp-2">{site.description}</p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Security Score:</span>
                    <span className={`font-bold ${score && score >= 80 ? 'text-emerald-400' : 'text-amber-300'}`}>
                      {score !== null && score !== undefined ? `${score}/100` : 'Not Scanned'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <Link
                      to={`/websites/${site._id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium hover:bg-slate-700 transition-colors"
                    >
                      Audit Details
                    </Link>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTriggerScan(site)}
                        disabled={scanningId === site._id}
                        className="p-2 rounded-lg bg-cyber-cyan/10 text-cyber-cyan hover:bg-cyber-cyan/20 border border-cyber-cyan/30 transition-colors"
                        title="Run Security Audit"
                      >
                        <Cpu className={`w-4 h-4 ${scanningId === site._id ? 'animate-spin' : ''}`} />
                      </button>

                      <button
                        onClick={() => openEditModal(site)}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Edit Details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => openDeleteModal(site)}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-950/30 transition-colors"
                        title="Delete Site"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 disabled:opacity-30 text-slate-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-400">Page {page} of {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 disabled:opacity-30 text-slate-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add Website Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Website to Monitor">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300">Website Display Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Production E-Commerce Store"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-800 text-xs text-white focus:outline-none focus:border-cyber-cyan"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300">Website Target URL</label>
            <input
              type="text"
              required
              placeholder="e.g. https://example.com"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-800 text-xs text-white focus:outline-none focus:border-cyber-cyan font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300">Description / Environment Notes</label>
            <textarea
              rows="3"
              placeholder="Brief description of backend stack or purpose..."
              value={descInput}
              onChange={(e) => setDescInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-800 text-xs text-white focus:outline-none focus:border-cyber-cyan"
            ></textarea>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyber-cyan text-slate-950 font-bold text-xs hover:bg-cyan-400"
            >
              Save Website
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Website Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Website Details">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300">Website Name</label>
            <input
              type="text"
              required
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-800 text-xs text-white focus:outline-none focus:border-cyber-cyan"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300">Website Target URL</label>
            <input
              type="text"
              required
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-800 text-xs text-white focus:outline-none focus:border-cyber-cyan font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300">Description</label>
            <textarea
              rows="3"
              value={descInput}
              onChange={(e) => setDescInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-800 text-xs text-white focus:outline-none focus:border-cyber-cyan"
            ></textarea>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyber-cyan text-slate-950 font-bold text-xs hover:bg-cyan-400"
            >
              Update Details
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirm Website Deletion">
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Are you sure you want to delete <strong className="text-white">{selectedSite?.websiteName}</strong>? All associated scan history and alerts will be permanently removed.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-500"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
