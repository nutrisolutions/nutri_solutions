import { Navigate } from "react-router-dom";
import { useEmployeeAuth } from "../../context/EmployeeAuthContext";

/**
 * Blocks direct-URL access to pages that only make sense for one employment
 * stage (e.g. temporary employees shouldn't reach /portal/tasks, permanent
 * employees shouldn't reach /portal/interviews) — the nav already hides these
 * links, this covers users typing the URL directly.
 */
const PortalRoleGate = ({ allow, children }) => {
  const { employee } = useEmployeeAuth();
  const isPermanent = employee?.employmentType === "permanent";

  if ((allow === "permanent") !== isPermanent) {
    return <Navigate to="/portal/dashboard" replace />;
  }

  return children;
};

export default PortalRoleGate;
