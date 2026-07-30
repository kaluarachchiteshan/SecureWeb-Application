import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Code, CheckCircle2, AlertTriangle, ShieldCheck, Terminal, ExternalLink } from 'lucide-react';
import { knowledgeAPI } from '../services/api';

export const KnowledgeCenter = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [activeTabMap, setActiveTabMap] = useState({}); // { [topicId]: 'vulnerable' | 'secure' }

  const categories = [
    'OWASP Top 10',
    'Injection',
    'Authentication',
    'Defensive Coding',
    'General Security',
  ];

  const fetchKnowledge = async () => {
    setLoading(true);
    try {
      const res = await knowledgeAPI.getItems({ category: selectedCategory, search });
      if (res.data.success) {
        setItems(res.data.items || []);
      }
    } catch (err) {
      console.error('Failed loading knowledge items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledge();
  }, [selectedCategory, search]);

  const toggleTab = (topicId, tab) => {
    setActiveTabMap((prev) => ({ ...prev, [topicId]: tab }));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-cyber-border">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          Security Knowledge Center <BookOpen className="w-5 h-5 text-cyber-cyan" />
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Educational suite for web application security best practices, OWASP Top 10, and side-by-side vulnerable vs secure code examples
        </p>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-cyber-border flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all ${
              selectedCategory === ''
                ? 'bg-cyber-cyan text-slate-950 font-bold shadow-cyber-glow'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Topics
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-cyber-cyan text-slate-950 font-bold shadow-cyber-glow'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-800 w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search OWASP or vulnerabilities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-white focus:outline-none placeholder-slate-500 font-mono"
          />
        </div>
      </div>

      {/* Knowledge Articles Grid */}
      {loading ? (
        <div className="text-center py-12 font-mono text-xs text-slate-400">Loading educational topics...</div>
      ) : (
        <div className="space-y-6">
          {items.map((item) => {
            const activeTab = activeTabMap[item.topicId] || 'secure';

            return (
              <div key={item.topicId} className="glass-panel p-6 rounded-3xl border border-cyber-border space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyber-border pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-cyber-cyan uppercase tracking-wider font-bold">
                      {item.category}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">{item.title}</h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold self-start sm:self-center ${
                    item.severity === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {item.severity} Risk
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>

                {/* Interactive Code Comparison Widget */}
                {(item.vulnerableSnippet || item.secureSnippet) && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                      <button
                        onClick={() => toggleTab(item.topicId, 'secure')}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors ${
                          activeTab === 'secure'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Secure Fix Implementation</span>
                      </button>
                      <button
                        onClick={() => toggleTab(item.topicId, 'vulnerable')}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors ${
                          activeTab === 'vulnerable'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Vulnerable Snippet</span>
                      </button>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto">
                      <pre>
                        <code>
                          {activeTab === 'secure' ? item.secureSnippet : item.vulnerableSnippet}
                        </code>
                      </pre>
                    </div>
                  </div>
                )}

                {/* Prevention Steps Checklist */}
                {item.preventionSteps && item.preventionSteps.length > 0 && (
                  <div className="pt-3 space-y-2">
                    <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                      🛡️ Defense Checklist & Mitigation:
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {item.preventionSteps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
