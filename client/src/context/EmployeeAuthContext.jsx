import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { employeeMe, setEmployeeAuthToken } from "../lib/api";

const TOKEN_KEY = "nutri_employee_token";

const EmployeeAuthContext = createContext(null);

export const EmployeeAuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setEmployee(null);
    setEmployeeAuthToken(null);
  }, []);

  const login = useCallback((newToken) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setEmployeeAuthToken(newToken);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const me = await employeeMe();
      setEmployee(me);
    } catch {
      logout();
    }
  }, [logout]);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      setEmployeeAuthToken(token);
      try {
        const me = await employeeMe();
        setEmployee(me);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [token, logout]);

  const value = useMemo(
    () => ({ token, employee, loading, login, logout, refresh, isAuthenticated: Boolean(token && employee) }),
    [token, employee, loading, login, logout, refresh]
  );

  return <EmployeeAuthContext.Provider value={value}>{children}</EmployeeAuthContext.Provider>;
};

export const useEmployeeAuth = () => {
  const ctx = useContext(EmployeeAuthContext);
  if (!ctx) throw new Error("useEmployeeAuth must be used within EmployeeAuthProvider");
  return ctx;
};
