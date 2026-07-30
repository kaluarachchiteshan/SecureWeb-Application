import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { MainLayout } from './layouts/MainLayout';

import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Websites } from './pages/Websites';
import { WebsiteDetails } from './pages/WebsiteDetails';
import { SecurityScanner } from './pages/SecurityScanner';
import { Reports } from './pages/Reports';
import { Alerts } from './pages/Alerts';
import { KnowledgeCenter } from './pages/KnowledgeCenter';
import { AdminPanel } from './pages/AdminPanel';
import { Profile } from './pages/Profile';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#070b15] flex items-center justify-center font-mono text-xs text-cyber-cyan">Verifying session token...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#070b15] flex items-center justify-center font-mono text-xs text-cyber-cyan">Verifying role permissions...</div>;
  if (!user || !isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          {/* Public Landing & Auth Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            {/* Protected Core Operational Routes */}
            <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="websites" element={<ProtectedRoute><Websites /></ProtectedRoute>} />
            <Route path="websites/:id" element={<ProtectedRoute><WebsiteDetails /></ProtectedRoute>} />
            <Route path="scanner" element={<ProtectedRoute><SecurityScanner /></ProtectedRoute>} />
            <Route path="reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
            <Route path="knowledge" element={<ProtectedRoute><KnowledgeCenter /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Admin Restricted Route */}
            <Route path="admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}
