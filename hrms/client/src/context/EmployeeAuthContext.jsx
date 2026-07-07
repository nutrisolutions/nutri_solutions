import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { employeeMe, setAuthToken, setEmployeeAuthToken } from "../lib/api";

const HR_DEPARTMENT_NAME = "Human Resources";

const TOKEN_KEY = "nutri_employee_token";

const EmployeeAuthContext = createContext(null);

export const EmployeeAuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY));
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setEmployee(null);
    setEmployeeAuthToken(null);
    setAuthToken(null);
  }, []);

  const login = useCallback((newToken) => {
    sessionStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setEmployeeAuthToken(newToken);
    // Mirrored onto the admin API instance too: HR-department employees can reach
    // certain /api/admin/* endpoints (see server requireAuth), reusing admin pages
    // inside the portal without a second login.
    setAuthToken(newToken);
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
      setAuthToken(token);
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

  const isHr = employee?.department?.name === HR_DEPARTMENT_NAME && employee?.employmentType === "permanent";

  const value = useMemo(
    () => ({ token, employee, loading, login, logout, refresh, isAuthenticated: Boolean(token && employee), isHr }),
    [token, employee, loading, login, logout, refresh, isHr]
  );

  return <EmployeeAuthContext.Provider value={value}>{children}</EmployeeAuthContext.Provider>;
};

export const useEmployeeAuth = () => {
  const ctx = useContext(EmployeeAuthContext);
  if (!ctx) throw new Error("useEmployeeAuth must be used within EmployeeAuthProvider");
  return ctx;
};
