import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Briefcase,
  Building2,
  CalendarClock,
  ChevronDown,
  FolderKanban,
  Globe,
  Layers,
  LayoutDashboard,
  ListChecks,
  LogOut,
  MessageSquare,
  Newspaper,
  Users
} from "lucide-react";
import BrandLogo from "../ui/BrandLogo";
import { useAuth } from "../../context/AuthContext";

const dashboardLink = { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard };

const groups = [
  {
    id: "content",
    label: "Content",
    links: [
      { to: "/admin/projects", label: "Projects", icon: FolderKanban },
      { to: "/admin/blogs", label: "Blogs", icon: Newspaper },
      { to: "/admin/tech-stack", label: "Tech Stack", icon: Layers }
    ]
  },
  {
    id: "people",
    label: "Recruitment & People",
    links: [
      { to: "/admin/careers", label: "Careers", icon: Briefcase },
      { to: "/admin/employees", label: "Employees", icon: Users },
      { to: "/admin/departments", label: "Departments", icon: Building2 }
    ]
  },
  {
    id: "workforce",
    label: "Workforce",
    links: [
      { to: "/admin/tasks", label: "Tasks", icon: ListChecks },
      { to: "/admin/leave", label: "Leave", icon: CalendarClock }
    ]
  },
  {
    id: "insights",
    label: "Insights",
    links: [
      { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { to: "/admin/contact", label: "Contact", icon: MessageSquare }
    ]
  }
];

const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [openGroups, setOpenGroups] = useState(() => {
    const active = groups.find((group) => group.links.some((link) => location.pathname.startsWith(link.to)));
    return active ? { [active.id]: true } : {};
  });

  const toggleGroup = (id) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
          <NavLink
            to={dashboardLink.to}
            className={({ isActive }) => (isActive ? "admin-nav-link active" : "admin-nav-link")}
          >
            <dashboardLink.icon size={18} />
            {dashboardLink.label}
          </NavLink>

          {groups.map((group) => {
            const isOpen = Boolean(openGroups[group.id]);
            return (
              <div key={group.id} className="admin-nav-group">
                <button
                  type="button"
                  className="admin-nav-group-toggle"
                  aria-expanded={isOpen}
                  onClick={() => toggleGroup(group.id)}
                >
                  <span className="admin-nav-group-toggle-label">{group.label}</span>
                  <ChevronDown size={16} className={`admin-nav-group-chevron ${isOpen ? "is-open" : ""}`} />
                </button>
                {isOpen && (
                  <div className="admin-nav-group-items">
                    {group.links.map(({ to, label, icon: Icon }) => (
                      <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) => (isActive ? "admin-nav-link active" : "admin-nav-link")}
                      >
                        <Icon size={16} />
                        {label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="admin-sidebar-footer">
          <p className="admin-user">{admin?.email}</p>
          <button type="button" className="admin-logout" onClick={handleLogout}>
            <LogOut size={16} /> Log out
          </button>
          <Link to="/" className="admin-site-link">
            <Globe size={16} /> View website
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
