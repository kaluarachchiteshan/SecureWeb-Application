import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const checkLoggedInUser = async () => {
      const token = localStorage.getItem('secureweb_token');
      const savedUser = localStorage.getItem('secureweb_user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          const res = await authAPI.getProfile();
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('secureweb_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          // Token expired or invalid
          console.warn('Session expired, clearing authentication state');
          localStorage.removeItem('secureweb_token');
          localStorage.removeItem('secureweb_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkLoggedInUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      if (res.data.success) {
        const userData = res.data.user;
        setUser(userData);
        localStorage.setItem('secureweb_token', userData.token);
        localStorage.setItem('secureweb_user', JSON.stringify(userData));
        addToast(`Welcome back, ${userData.name}!`, 'success');
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      addToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const register = async (name, email, password, role = 'user') => {
    try {
      const res = await authAPI.register({ name, email, password, role });
      if (res.data.success) {
        const userData = res.data.user;
        setUser(userData);
        localStorage.setItem('secureweb_token', userData.token);
        localStorage.setItem('secureweb_user', JSON.stringify(userData));
        addToast('Account created successfully!', 'success');
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      addToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('secureweb_token');
    localStorage.removeItem('secureweb_user');
    setUser(null);
    addToast('Logged out safely.', 'info');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
