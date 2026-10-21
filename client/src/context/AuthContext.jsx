import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../api/client';
import i18n from '../i18n';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [isWakingServer, setIsWakingServer] = useState(false);

  // Cold-start health check on startup
  useEffect(() => {
    let isMounted = true;
    let attempts = 0;
    const maxAttempts = 15;

    async function checkServerHealth() {
      try {
        await apiService.checkHealth();
        if (isMounted) {
          setIsWakingServer(false);
          // If we have a saved token, verify current user
          if (token) {
            try {
              const res = await apiService.getMe();
              setUser(res.data.user);
              localStorage.setItem('user', JSON.stringify(res.data.user));
              if (res.data.user.language) {
                i18n.changeLanguage(res.data.user.language);
              }
            } catch {
              // Token invalid or expired
              logout();
            }
          }
          setLoading(false);
        }
      } catch (err) {
        attempts++;
        if (attempts <= 2) {
          // If it takes more than 1 failed attempt, show waking server UI
          if (isMounted) setIsWakingServer(true);
        }
        if (attempts < maxAttempts && isMounted) {
          setTimeout(checkServerHealth, 2500);
        } else if (isMounted) {
          setIsWakingServer(false);
          setLoading(false);
        }
      }
    }

    checkServerHealth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (username, password) => {
    const res = await apiService.login({ username, password });
    const { token: newToken, user: userData } = res.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.language) {
      i18n.changeLanguage(userData.language);
      localStorage.setItem('deep_furniture_lang', userData.language);
    }
    return userData;
  };

  const demoLogin = async () => {
    const res = await apiService.demoLogin();
    const { token: newToken, user: userData } = res.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.language) {
      i18n.changeLanguage(userData.language);
      localStorage.setItem('deep_furniture_lang', userData.language);
    }
    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const setLanguage = async newLang => {
    i18n.changeLanguage(newLang);
    localStorage.setItem('deep_furniture_lang', newLang);
    if (user) {
      setUser(prev => ({ ...prev, language: newLang }));
      try {
        await apiService.updateLanguage(newLang);
      } catch (err) {
        console.error('Failed to sync language to server:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isDemo: user?.role === 'demo',
        loading,
        isWakingServer,
        login,
        demoLogin,
        logout,
        setLanguage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
