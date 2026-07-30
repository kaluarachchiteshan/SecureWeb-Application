import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'cyan', subtext }) => {
  const colorMap = {
    cyan: 'from-cyber-cyan/20 to-blue-600/10 text-cyber-cyan border-cyber-cyan/30',
    green: 'from-emerald-500/20 to-teal-600/10 text-emerald-400 border-emerald-500/30',
    amber: 'from-amber-500/20 to-orange-600/10 text-amber-400 border-amber-500/30',
    red: 'from-red-500/20 to-rose-600/10 text-red-400 border-red-500/30',
    purple: 'from-purple-500/20 to-indigo-600/10 text-purple-400 border-purple-500/30',
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border glass-panel-hover flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-xl bg-gradient-to-br border ${colorMap[color] || colorMap.cyan}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      <div className="mt-4">
        <div className="text-2xl font-extrabold text-white tracking-tight">{value}</div>
        {subtext && <p className="text-[11px] text-slate-400 mt-1 font-mono">{subtext}</p>}
      </div>
    </div>
  );
};
