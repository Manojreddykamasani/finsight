'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { getToken, saveToken, clearToken, getUser, saveUser, clearUser } from '@/lib/authClient';

const AuthContext = createContext({
  user: null,
  token: null,
  balance: 0,
  login: async () => {},
  logout: () => {},
  refreshBalance: async () => {},
});

// Define your backend URL here or import it from a config file
const API_BASE_URL = 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser();
    if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        refreshBalance(storedToken); // Pass token directly on initial load
    }
  }, []);

  const login = ({ token, user }) => {
    saveToken(token);
    saveUser(user);
    setToken(token);
    setUser(user);
    refreshBalance(token); // Pass token on login
  };

  const logout = () => {
    clearToken();
    clearUser();
    setToken(null);
    setUser(null);
    setBalance(0);
  };

  const refreshBalance = async (currentToken) => {
    // If token is not passed, try to get it from state/storage
    const tokenToUse = currentToken || token;
    if (!tokenToUse) return;

    try {
      const response = await fetch(`${API_BASE_URL}/portfolio`, {
        headers: {
          'Authorization': `Bearer ${tokenToUse}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch portfolio data');
      }

      const data = await response.json();
      if (data.status === 'success') {
        setBalance(data.data.balance);
      }
    } catch (error) {
      console.error("Failed to refresh balance:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, balance, login, logout, refreshBalance }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);