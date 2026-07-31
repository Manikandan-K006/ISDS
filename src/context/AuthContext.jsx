import { createContext, useState, useCallback, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import API from '../api/client';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('sidts_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('sidts_token'));
  const [loading, setLoading] = useState(false);

  const login = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('sidts_user', JSON.stringify(userData));
    localStorage.setItem('sidts_token', authToken);
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('sidts_refresh_token');
      if (refreshToken) {
        await API.post('/auth/logout', { refreshToken }).catch(() => {});
      }
    } catch {}
    setUser(null);
    setToken(null);
    localStorage.removeItem('sidts_user');
    localStorage.removeItem('sidts_token');
    localStorage.removeItem('sidts_refresh_token');
    if (auth) {
      signOut(auth).catch(() => {});
    }
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('sidts_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const refreshAuth = useCallback(async () => {
    const refreshToken = localStorage.getItem('sidts_refresh_token');
    if (!refreshToken) return false;
    try {
      const { data } = await API.post('/auth/refresh-token', { refreshToken });
      login(data.user, data.token);
      localStorage.setItem('sidts_refresh_token', data.refreshToken);
      return true;
    } catch {
      logout();
      return false;
    }
  }, [login, logout]);

  // Verify token on mount
  useEffect(() => {
    if (token) {
      API.get('/auth/me')
        .then(({ data }) => {
          setUser(data.user);
          localStorage.setItem('sidts_user', JSON.stringify(data.user));
        })
        .catch(() => {
          refreshAuth();
        });
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      updateUser,
      refreshAuth,
      loading,
      isAuthenticated: !!token,
    }}>
      {children}
    </AuthContext.Provider>
  );
};