import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type UserRole = 'customer' | 'vendor' | 'admin' | null;

interface AuthContextType {
  userId: string | null;
  orgId: string | null;
  role: UserRole;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userId: string, orgId: string, role: string, jwtToken?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('jwt_token');
    const storedUserId = localStorage.getItem('demo_user_id');
    const storedOrgId = localStorage.getItem('demo_org_id');
    const storedRole = localStorage.getItem('demo_user_role') as UserRole;

    if (storedToken && storedUserId && storedOrgId) {
      setToken(storedToken);
      setUserId(storedUserId);
      setOrgId(storedOrgId);
      setRole(storedRole);
    }
    setIsLoading(false);
  }, []);

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
    setRole(newRole as UserRole);
  };

  const logout = () => {
    localStorage.removeItem('demo_user_id');
    localStorage.removeItem('demo_org_id');
    localStorage.removeItem('demo_user_role');
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('demo_cart');
    localStorage.removeItem('demo_last_order');
    setToken(null);
    setUserId(null);
    setOrgId(null);
    setRole(null);
  };

  const isAuthenticated = !!userId && !!token;

  return (
    <AuthContext.Provider value={{ userId, orgId, role, token, isAuthenticated, isLoading, login, logout }}>
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
