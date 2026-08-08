import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  userId: string | null;
  orgId: string | null;
  login: (userId: string, orgId: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('demo_user_id'));
  const [orgId, setOrgId] = useState<string | null>(localStorage.getItem('demo_org_id'));

  const login = (newUserId: string, newOrgId: string) => {
    localStorage.setItem('demo_user_id', newUserId);
    localStorage.setItem('demo_org_id', newOrgId);
    setUserId(newUserId);
    setOrgId(newOrgId);
  };

  const logout = () => {
    localStorage.removeItem('demo_user_id');
    localStorage.removeItem('demo_org_id');
    setUserId(null);
    setOrgId(null);
  };

  const isAuthenticated = !!userId && !!orgId;

  return (
    <AuthContext.Provider value={{ userId, orgId, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
