// context/AuthContext.jsx
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { getToken, saveToken, clearToken, getUser, saveUser, clearUser } from '@/lib/authClient';

const AuthContext = createContext({
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setToken(getToken());
    setUser(getUser());
  }, []);

  const login = ({ token, user }) => {
    saveToken(token);
    saveUser(user);
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    clearToken();
    clearUser();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
