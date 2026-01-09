import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { apiRequest } from "../services/api";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("zap_token");
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  function login(token: string) {
    localStorage.setItem("zap_token", token);
    setIsAuthenticated(true);
  }

  function logout() {
    localStorage.removeItem("zap_token");
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
