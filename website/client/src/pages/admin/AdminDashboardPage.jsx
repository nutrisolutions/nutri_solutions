import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Clock, Eye, FolderKanban, Layers, MessageSquare, Newspaper, TrendingUp, Users } from "lucide-react";
import { adminAnalytics, adminBlogs, adminCareers, adminContact, adminProjects, adminTechStack } from "../../lib/api";
import { TrafficTrendChart } from "../../components/admin/analytics/AnalyticsCharts";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : "—";

const timeAgo = (value) => {
  if (!value) return "";
  const diffMs = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(value);
};

const topN = (list, n = 5) =>
  [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, n);

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recents, setRecents] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [projects, blogs, techStack, positions, inquiries, summary] = await Promise.all([
          adminProjects.list(),
          adminBlogs.list(),
          adminTechStack.list(),
          adminCareers.listPositions(),
          adminContact.listInquiries(),
          adminAnalytics.summary(7).catch(() => null)
        ]);

        setStats({
          projects: projects.length,
          blogs: blogs.length,
          techStack: techStack.length,
          openPositions: positions.filter((p) => p.published).length,
          inquiries: inquiries.length
        });

        setRecents({
          inquiries: topN(inquiries)
        });

        setAnalytics(summary);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const cards = stats && [
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
          <p>Quick overview of the website content.</p>
        </div>
      </header>

      {error && <p className="admin-form-error">{error}</p>}

      {loading ? (
        <p className="admin-analytics-loading">Loading dashboard…</p>
      ) : (
        <>
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

          <section className="employee-section admin-dashboard-analytics">
            <div className="employee-section-head">
              <div>
                <h3>
                  <TrendingUp size={18} /> Traffic — last 7 days
                </h3>
                <p>Website visitors and page views. See the full breakdown on the Analytics page.</p>
              </div>
              <Link to="/admin/analytics" className="btn btn-outline btn-sm">
                View full analytics
              </Link>
            </div>

            {analytics ? (
              <>
                <div className="admin-dashboard-analytics-mini">
                  <div>
                    <Users size={16} />
                    <span className="admin-analytics-stat-value">{analytics.summary.uniqueVisitors}</span>
                    <span className="admin-analytics-stat-label">Unique visitors</span>
                  </div>
                  <div>
                    <Eye size={16} />
                    <span className="admin-analytics-stat-value">{analytics.summary.pageViews}</span>
                    <span className="admin-analytics-stat-label">Page views</span>
                  </div>
                </div>
                <TrafficTrendChart data={analytics.dailySeries} />
              </>
            ) : (
              <p className="admin-empty">No analytics data yet.</p>
            )}
          </section>

          <section className="employee-section">
            <div className="employee-section-head">
              <div>
                <h3>
                  <Clock size={18} /> Recent activity
                </h3>
                <p>Latest contact inquiries.</p>
              </div>
            </div>

            <div className="admin-dashboard-recents">
              <div className="admin-dashboard-recent-panel">
                <h4>Recent contact inquiries</h4>
                {recents.inquiries.length === 0 ? (
                  <p className="admin-empty">No inquiries yet.</p>
                ) : (
                  <ul className="admin-dashboard-recent-list">
                    {recents.inquiries.map((i) => (
                      <li key={i._id}>
                        <Link to="/admin/contact">
                          <span>{i.fullName}</span>
                          <span className="admin-badge">{i.topic || "General"}</span>
                        </Link>
                        <span className="admin-dashboard-recent-time">{timeAgo(i.createdAt)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;
