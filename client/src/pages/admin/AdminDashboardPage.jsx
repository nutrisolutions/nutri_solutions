import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Building2,
  CalendarClock,
  FolderKanban,
  ListChecks,
  MessageSquare,
  Newspaper,
  Layers,
  Users
} from "lucide-react";
import {
  adminBlogs,
  adminCareers,
  adminContact,
  adminDepartments,
  adminEmployees,
  adminLeave,
  adminProjects,
  adminTasks,
  adminTechStack
} from "../../lib/api";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [projects, blogs, techStack, positions, inquiries, departments, employees, tasks, leaveRequests] =
          await Promise.all([
            adminProjects.list(),
            adminBlogs.list(),
            adminTechStack.list(),
            adminCareers.listPositions(),
            adminContact.listInquiries(),
            adminDepartments.list(),
            adminEmployees.list(),
            adminTasks.list(),
            adminLeave.listRequests()
          ]);

        setStats({
          projects: projects.length,
          blogs: blogs.length,
          techStack: techStack.length,
          openPositions: positions.filter((p) => p.published).length,
          inquiries: inquiries.length,
          departments: departments.length,
          employeesTotal: employees.length,
          employeesTemporary: employees.filter((e) => e.employmentType === "temporary").length,
          employeesPermanent: employees.filter((e) => e.employmentType === "permanent").length,
          openTasks: tasks.filter((t) => t.status === "todo" || t.status === "in_progress").length,
          pendingLeave: leaveRequests.filter((r) => r.status === "pending").length
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const cards = stats && [
    {
      to: "/admin/employees",
      icon: Users,
      value: stats.employeesTotal,
      label: "Employees",
      meta: `${stats.employeesTemporary} temporary · ${stats.employeesPermanent} permanent`
    },
    { to: "/admin/tasks", icon: ListChecks, value: stats.openTasks, label: "Open tasks" },
    { to: "/admin/leave", icon: CalendarClock, value: stats.pendingLeave, label: "Pending leave requests" },
    { to: "/admin/departments", icon: Building2, value: stats.departments, label: "Departments" },
    { to: "/admin/careers", icon: Briefcase, value: stats.openPositions, label: "Open positions" },
    { to: "/admin/contact", icon: MessageSquare, value: stats.inquiries, label: "Contact inquiries" },
    { to: "/admin/projects", icon: FolderKanban, value: stats.projects, label: "Projects" },
    { to: "/admin/blogs", icon: Newspaper, value: stats.blogs, label: "Blog posts" },
    { to: "/admin/tech-stack", icon: Layers, value: stats.techStack, label: "Tech stack items" }
  ];

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Quick overview of the site and HR workspace.</p>
        </div>
      </header>

      {error && <p className="admin-form-error">{error}</p>}
      {loading ? (
        <p className="admin-analytics-loading">Loading dashboard…</p>
      ) : (
        <div className="admin-analytics-stats admin-dashboard-stats">
          {cards.map(({ to, icon: Icon, value, label, meta }) => (
            <Link key={to} to={to} className="admin-analytics-stat-card admin-dashboard-stat-card">
              <Icon size={22} />
              <div>
                <span className="admin-analytics-stat-value">{value}</span>
                <span className="admin-analytics-stat-label">{label}</span>
                {meta && <span className="admin-analytics-stat-meta">{meta}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
