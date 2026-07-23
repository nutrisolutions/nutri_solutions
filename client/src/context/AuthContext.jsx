import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { adminMe, setAuthToken } from "../lib/api";

const TOKEN_KEY = "nutri_admin_token";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY));
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setAdmin(null);
    setAuthToken(null);
  }, []);

  const login = useCallback((newToken, adminUser) => {
    sessionStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setAuthToken(newToken);
    setAdmin(adminUser);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      setAuthToken(token);
      try {
        const user = await adminMe();
        setAdmin(user);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [token, logout]);

  const value = useMemo(
    () => ({ token, admin, loading, login, logout, isAuthenticated: Boolean(token && admin) }),
    [token, admin, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
