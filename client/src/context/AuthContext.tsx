import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  userId: string | null;
  orgId: string | null;
  role: string | null;
  login: (userId: string, orgId: string, role: string, jwtToken?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  token?: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwt_token'));
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('demo_user_id'));
  const [orgId, setOrgId] = useState<string | null>(localStorage.getItem('demo_org_id'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('demo_user_role'));

  const login = (newUserId: string, newOrgId: string, newRole: string, jwtToken?: string) => {
    localStorage.setItem('demo_user_id', newUserId);
    localStorage.setItem('demo_org_id', newOrgId);
    localStorage.setItem('demo_user_role', newRole);
    if (jwtToken) {
      localStorage.setItem('jwt_token', jwtToken);
      setToken(jwtToken);
    }
    setUserId(newUserId);
    setOrgId(newOrgId);
    setRole(newRole);
  };

  const logout = () => {
    localStorage.removeItem('demo_user_id');
    localStorage.removeItem('demo_org_id');
    localStorage.removeItem('demo_user_role');
    localStorage.removeItem('jwt_token');
    setToken(null);
    setUserId(null);
    setOrgId(null);
    setRole(null);
  };

  const isAuthenticated = !!userId && !!orgId;

  return (
    <AuthContext.Provider value={{ userId, orgId, role, token, login, logout, isAuthenticated }}>
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
