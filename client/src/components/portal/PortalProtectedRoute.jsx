import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useEmployeeAuth } from "../../context/EmployeeAuthContext";

const PortalProtectedRoute = ({ children }) => {
  const { isAuthenticated, employee, loading, refresh } = useEmployeeAuth();
  const location = useLocation();

  // Re-fetch the employee's profile on every portal navigation so a mid-session
  // change (e.g. HR converting them to permanent, which forces a password reset)
  // is picked up without requiring a manual page reload.
  useEffect(() => {
    if (isAuthenticated) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  if (loading) {
    return <div className="admin-loading">Checking session…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/portal/login" replace state={{ from: location.pathname }} />;
  }

  if (employee?.mustSetPassword && location.pathname !== "/portal/set-password") {
    return <Navigate to="/portal/set-password" replace />;
  }

  return children;
};

export default PortalProtectedRoute;
