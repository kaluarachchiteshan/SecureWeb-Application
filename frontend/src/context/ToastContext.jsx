import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full px-4 pointer-events-none">
        {toasts.map((toast) => {
          let bg = 'bg-slate-900/90 border-slate-700 text-slate-100';
          let icon = <Info className="w-5 h-5 text-cyber-cyan" />;

          if (toast.type === 'success') {
            bg = 'bg-slate-900/95 border-emerald-500/40 text-emerald-300 shadow-cyber-green';
            icon = <CheckCircle className="w-5 h-5 text-emerald-400" />;
          } else if (toast.type === 'error') {
            bg = 'bg-slate-900/95 border-red-500/40 text-red-300 shadow-cyber-red';
            icon = <XCircle className="w-5 h-5 text-red-400" />;
          } else if (toast.type === 'warning') {
            bg = 'bg-slate-900/95 border-amber-500/40 text-amber-300';
            icon = <AlertTriangle className="w-5 h-5 text-amber-400" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl border glass-panel transition-all transform duration-300 ${bg}`}
            >
              <div className="flex items-center gap-3">
                {icon}
                <span className="text-sm font-medium">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
