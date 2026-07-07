import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Building2,
  CalendarClock,
  CalendarDays,
  ChevronDown,
  Clock3,
  FileSpreadsheet,
  FileText,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Megaphone,
  MessageCircle,
  User,
  UserMinus,
  Users,
  Video
} from "lucide-react";
import BrandLogo from "../ui/BrandLogo";
import { useEmployeeAuth } from "../../context/EmployeeAuthContext";
import { useChat } from "../../context/ChatContext";

const TOP_LINKS = [
  { to: "/portal/dashboard", label: "Dashboard", icon: LayoutDashboard, always: true },
  { to: "/portal/documents", label: "Documents", icon: FileText, always: true },
  { to: "/portal/chat", label: "Chat", icon: MessageCircle, permanentOnly: true },
  { to: "/portal/interviews", label: "Interviews", icon: Video, temporaryOnly: true },
  { to: "/portal/offer", label: "Offer", icon: Briefcase, temporaryOnly: true }
];

// Only shown as a collapsible group for permanent employees — temporary
// employees get a flat nav (no accordions, no Chat) until they convert.
const PERSONAL_GROUP = {
  id: "personal",
  label: "My Workspace",
  links: [
    { to: "/portal/tasks", label: "Tasks", icon: ListChecks, permanentOnly: true },
    { to: "/portal/leave", label: "Leave", icon: CalendarClock, permanentOnly: true },
    { to: "/portal/attendance", label: "Attendance", icon: Clock3, permanentOnly: true },
    { to: "/portal/timesheet", label: "Timesheet", icon: FileSpreadsheet, permanentOnly: true },
    { to: "/portal/my-teams", label: "My Teams", icon: Users, permanentOnly: true, teamLeadOnly: true }
  ]
};

const HR_GROUPS = [
  {
    id: "people",
    label: "Recruitment & People",
    links: [
      { to: "/portal/hr/employees", label: "Employees", icon: Users },
      { to: "/portal/hr/resignations", label: "Resignations", icon: UserMinus },
      { to: "/portal/hr/teams", label: "Teams", icon: Users },
      { to: "/portal/hr/departments", label: "Departments", icon: Building2 }
    ]
  },
  {
    id: "workforce",
    label: "Workforce",
    links: [
      { to: "/portal/hr/tasks", label: "Tasks", icon: ListChecks },
      { to: "/portal/hr/leave", label: "Leave", icon: CalendarClock },
      { to: "/portal/hr/attendance", label: "Attendance", icon: Clock3 },
      { to: "/portal/hr/timesheet", label: "Timesheet", icon: FileSpreadsheet },
      { to: "/portal/hr/announcements", label: "Announcements", icon: Megaphone },
      { to: "/portal/hr/calendar", label: "Calendar", icon: CalendarDays }
    ]
  }
];

const PortalLayout = () => {
  const { employee, logout, isHr } = useEmployeeAuth();
  const { unreadTotal } = useChat();
  const navigate = useNavigate();
  const location = useLocation();
  const isPermanent = employee?.employmentType === "permanent";

  const filterLinks = (linkList) =>
    linkList.filter((link) => {
      if (link.teamLeadOnly && !employee?.isTeamLead) return false;
      if (link.always) return true;
      return isPermanent ? link.permanentOnly : link.temporaryOnly;
    });

  const links = useMemo(() => filterLinks(TOP_LINKS), [isPermanent]);

  const groups = useMemo(() => {
    const personal = isPermanent ? [{ ...PERSONAL_GROUP, links: filterLinks(PERSONAL_GROUP.links) }] : [];
    return [...personal, ...(isHr ? HR_GROUPS : [])];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPermanent, isHr, employee?.isTeamLead]);

  const [openGroups, setOpenGroups] = useState(() => {
    const active = [PERSONAL_GROUP, ...HR_GROUPS].find((group) =>
      group.links.some((link) => location.pathname.startsWith(link.to))
    );
    return { personal: true, ...(active ? { [active.id]: true } : {}) };
  });

  const toggleGroup = (id) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
          <div className="admin-brand-text">
            <strong>Nutri Solutions</strong>
            <span>Employee portal</span>
          </div>
        </Link>
        <nav className="admin-nav">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? "admin-nav-link active" : "admin-nav-link")}>
              <Icon size={18} />
              {label}
              {to === "/portal/chat" && unreadTotal > 0 && <span className="admin-chat-unread-badge">{unreadTotal}</span>}
            </NavLink>
          ))}

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
          <p className="admin-user">{employee?.fullName || employee?.email}</p>
          <Link to="/portal/profile" className="admin-logout">
            <User size={16} /> View profile
          </Link>
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
