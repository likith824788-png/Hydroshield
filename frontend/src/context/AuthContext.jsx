import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const SESSION_KEY = 'hydroshield_auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = (userData) => {
    setUser(userData);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
  };

  const isAdmin = user?.role === 'admin';
  const isUser  = user?.role === 'user';
  const isAuthenticated = !!user;

  // adminOnly: only admins can access; userOnly: only regular users can access
  const adminOnlyPages = ['municipal-agent', 'mission-report', 'rescue-planner', 'agent-status', 'recent-updates', 'community-people'];
  const userOnlyPages  = ['citizen-sos'];

  const canAccess = (page) => {
    if (!isAuthenticated) return false;
    if (adminOnlyPages.includes(page) && !isAdmin) return false;
    if (userOnlyPages.includes(page)  && isAdmin)  return false;
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isUser, isAuthenticated, canAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
