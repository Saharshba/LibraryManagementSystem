import { createContext, useContext, useEffect, useState } from 'react';
import request from '../api/client';

const AuthContext = createContext(null);
const STORAGE_KEY = 'library-management-auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await request('/auth/me', { token });
        setUser(data.user);
      } catch (error) {
        localStorage.removeItem(STORAGE_KEY);
        setToken('');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const persistSession = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem(STORAGE_KEY, nextToken);
  };

  const login = async (credentials) => {
    const data = await request('/auth/login', { method: 'POST', body: credentials });
    persistSession(data.token, data.user);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken('');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, token, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
