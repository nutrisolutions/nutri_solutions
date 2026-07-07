import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Building2,
  CalendarClock,
  CalendarDays,
  ChevronDown,
  Clock3,
  FileSpreadsheet,
  Globe,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Megaphone,
  MessageCircle,
  UserMinus,
  Users
} from "lucide-react";
import BrandLogo from "../ui/BrandLogo";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";

const WEBSITE_URL = import.meta.env.VITE_WEBSITE_URL || "http://localhost:5173";

const dashboardLink = { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard };
const chatLink = { to: "/admin/chat", label: "Chat", icon: MessageCircle };

const groups = [
  {
    id: "people",
    label: "Recruitment & People",
    links: [
      { to: "/admin/employees", label: "Employees", icon: Users },
      { to: "/admin/resignations", label: "Resignations", icon: UserMinus },
      { to: "/admin/teams", label: "Teams", icon: Users },
      { to: "/admin/departments", label: "Departments", icon: Building2 }
    ]
  },
  {
    id: "workforce",
    label: "Workforce",
    links: [
      { to: "/admin/tasks", label: "Tasks", icon: ListChecks },
      { to: "/admin/leave", label: "Leave", icon: CalendarClock },
      { to: "/admin/attendance", label: "Attendance", icon: Clock3 },
      { to: "/admin/timesheet", label: "Timesheet", icon: FileSpreadsheet },
      { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
      { to: "/admin/calendar", label: "Calendar", icon: CalendarDays }
    ]
  }
];

const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const { unreadTotal } = useChat();
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
        <Link to="/admin/dashboard" className="brand admin-brand">
          <BrandLogo variant="logo" />
          <div className="admin-brand-text">
            <strong>Nutri Solutions</strong>
            <span>Admin panel</span>
          </div>
        </Link>
        <nav className="admin-nav">
          <NavLink
            to={dashboardLink.to}
            className={({ isActive }) => (isActive ? "admin-nav-link active" : "admin-nav-link")}
          >
            <dashboardLink.icon size={18} />
            {dashboardLink.label}
          </NavLink>

          <NavLink to={chatLink.to} className={({ isActive }) => (isActive ? "admin-nav-link active" : "admin-nav-link")}>
            <chatLink.icon size={18} />
            {chatLink.label}
            {unreadTotal > 0 && <span className="admin-chat-unread-badge">{unreadTotal}</span>}
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
          <a href={WEBSITE_URL} className="admin-site-link">
            <Globe size={16} /> View website
          </a>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
