import { useEffect, useMemo } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Briefcase, CalendarClock, FileText, LayoutDashboard, ListChecks, LogOut, Video } from "lucide-react";
import BrandLogo from "../ui/BrandLogo";
import { useEmployeeAuth } from "../../context/EmployeeAuthContext";

const ALL_LINKS = [
  { to: "/portal/dashboard", label: "Dashboard", icon: LayoutDashboard, always: true },
  { to: "/portal/interviews", label: "Interviews", icon: Video, temporaryOnly: true },
  { to: "/portal/documents", label: "Documents", icon: FileText, always: true },
  { to: "/portal/offer", label: "Offer", icon: Briefcase, temporaryOnly: true },
  { to: "/portal/tasks", label: "Tasks", icon: ListChecks, permanentOnly: true },
  { to: "/portal/leave", label: "Leave", icon: CalendarClock, permanentOnly: true }
];

const PortalLayout = () => {
  const { employee, logout } = useEmployeeAuth();
  const navigate = useNavigate();
  const isPermanent = employee?.employmentType === "permanent";

  const links = useMemo(
    () =>
      ALL_LINKS.filter((link) => {
        if (link.always) return true;
        return isPermanent ? link.permanentOnly : link.temporaryOnly;
      }),
    [isPermanent]
  );

  const handleLogout = () => {
    logout();
    navigate("/portal/login");
  };

  useEffect(() => {
    document.documentElement.classList.add("admin-route");
    document.body.classList.add("admin-route");
    return () => {
      document.documentElement.classList.remove("admin-route");
      document.body.classList.remove("admin-route");
    };
  }, []);

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/" className="brand admin-brand">
          <BrandLogo variant="logo" />
          <span>Employee Portal</span>
        </Link>
        <nav className="admin-nav">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? "admin-nav-link active" : "admin-nav-link")}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <p className="admin-user">{employee?.fullName || employee?.email}</p>
          <button type="button" className="admin-logout" onClick={handleLogout}>
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default PortalLayout;
