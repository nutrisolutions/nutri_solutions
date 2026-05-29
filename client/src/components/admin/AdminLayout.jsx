import { useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Briefcase,
  FolderKanban,
  Layers,
  LogOut,
  MessageSquare,
  Newspaper,
  LayoutDashboard
} from "lucide-react";
import BrandLogo from "../ui/BrandLogo";
import { useAuth } from "../../context/AuthContext";

const links = [
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/blogs", label: "Blogs", icon: Newspaper },
  { to: "/admin/tech-stack", label: "Tech Stack", icon: Layers },
  { to: "/admin/careers", label: "Careers", icon: Briefcase },
  { to: "/admin/contact", label: "Contact", icon: MessageSquare }
];

const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
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
          <span>Admin</span>
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
          <p className="admin-user">{admin?.email}</p>
          <button type="button" className="admin-logout" onClick={handleLogout}>
            <LogOut size={16} /> Log out
          </button>
          <Link to="/" className="admin-site-link">
            <LayoutDashboard size={16} /> View website
          </Link>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
