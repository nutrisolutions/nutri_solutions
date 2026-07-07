import { Navigate } from "react-router-dom";
import { useEmployeeAuth } from "../../context/EmployeeAuthContext";

const PortalHrGate = ({ children }) => {
  const { isHr } = useEmployeeAuth();

  if (!isHr) {
    return <Navigate to="/portal/dashboard" replace />;
  }

  return children;
};

export default PortalHrGate;
