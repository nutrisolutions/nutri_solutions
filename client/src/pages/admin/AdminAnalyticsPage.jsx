import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Database,
  Eye,
  GitBranch,
  Layers,
  TrendingUp,
  Users
} from "lucide-react";
import { adminAnalytics } from "../../lib/api";
import {
  SectionEngagementChart,
  TopPagesBarChart,
  TopPagesPieChart,
  TrafficTrendChart,
  TransitionsBarChart
} from "../../components/admin/analytics/AnalyticsCharts";
import { formatPathLabel } from "../../components/admin/analytics/pathLabels";

const AdminAnalyticsPage = () => {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await adminAnalytics.summary(days));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  const hasActivity = useMemo(() => {
    if (!data) return false;
    return (
      data.summary.pageViews > 0 ||
      data.summary.uniqueVisitors > 0 ||
      data.dailySeries?.some((d) => d.pageViews > 0 || d.visitors > 0)
    );
  }, [data]);

  const avgDailyVisitors = useMemo(() => {
    if (!data?.dailySeries?.length) return 0;
    const total = data.dailySeries.reduce((s, d) => s + d.visitors, 0);
    return Math.round(total / data.dailySeries.length);
  }, [data]);

  return (
    <div className="admin-page admin-analytics-page">
      <header className="admin-page-header">
        <div>
          <h1>Website analytics</h1>
          <p>
            Traffic and engagement stored in <strong>MongoDB</strong> with daily rollups. Optional
            PostHog sync runs in parallel on the public site.
          </p>
        </div>
        <div className="admin-analytics-filters">
          <label>
            Period
            <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </label>
          <button type="button" className="btn btn-outline btn-sm" onClick={load} disabled={loading}>
            Refresh
          </button>
        </div>
      </header>

      {data?.source && (
        <p className="admin-analytics-source">
          <Database size={14} />
          Data source:{" "}
          <code>{data.source === "mongodb_rollups" ? "MongoDB rollups" : "MongoDB events"}</code>
        </p>
      )}

      {error && <p className="admin-form-error">{error}</p>}
      {loading && <p className="admin-analytics-loading">Loading analytics…</p>}

      {!loading && data && (
        <>
          <div className="admin-analytics-stats">
            <div className="admin-analytics-stat-card admin-analytics-stat-card--highlight">
              <Users size={22} />
              <div>
                <span className="admin-analytics-stat-value">{data.summary.uniqueVisitors}</span>
                <span className="admin-analytics-stat-label">Unique visitors</span>
                <span className="admin-analytics-stat-meta">~{avgDailyVisitors}/day avg</span>
              </div>
            </div>
            <div className="admin-analytics-stat-card">
              <Eye size={22} />
              <div>
                <span className="admin-analytics-stat-value">{data.summary.pageViews}</span>
                <span className="admin-analytics-stat-label">Page views</span>
              </div>
            </div>
            <div className="admin-analytics-stat-card">
              <Layers size={22} />
              <div>
                <span className="admin-analytics-stat-value">{data.summary.sectionViews}</span>
                <span className="admin-analytics-stat-label">Section views</span>
              </div>
            </div>
            <div className="admin-analytics-stat-card">
              <GitBranch size={22} />
              <div>
                <span className="admin-analytics-stat-value">{data.summary.transitions}</span>
                <span className="admin-analytics-stat-label">Page transitions</span>
              </div>
            </div>
          </div>

          {!hasActivity ? (
            <div className="admin-analytics-empty">
              <Activity size={40} strokeWidth={1.25} />
              <h2>No analytics yet</h2>
              <p>
                Open the public site in another tab and browse a few pages. Events are saved to
                MongoDB and charts will appear here within a few seconds.
              </p>
            </div>
          ) : (
            <>
              <section className="admin-analytics-panel admin-analytics-panel--wide">
                <h2>
                  <TrendingUp size={20} /> Traffic over time
                </h2>
                <p className="admin-analytics-panel-desc">
                  Unique visitors and page views per day for the selected period.
                </p>
                <TrafficTrendChart data={data.dailySeries} />
              </section>

              <div className="admin-analytics-grid admin-analytics-grid--charts">
                <section className="admin-analytics-panel">
                  <h2>
                    <BarChart3 size={20} /> Top pages
                  </h2>
                  <TopPagesBarChart data={data.pageViews} />
                </section>
                <section className="admin-analytics-panel">
                  <h2>Page share</h2>
                  <TopPagesPieChart data={data.pageViews} />
                </section>
              </div>

              <div className="admin-analytics-grid admin-analytics-grid--charts">
                <section className="admin-analytics-panel">
                  <h2>
                    <Layers size={20} /> Section engagement
                  </h2>
                  <SectionEngagementChart data={data.topSections || []} />
                </section>
                <section className="admin-analytics-panel">
                  <h2>
                    <GitBranch size={20} /> Navigation flows
                  </h2>
                  <TransitionsBarChart data={data.transitions} />
                </section>
              </div>

              <div className="admin-analytics-grid">
                <section className="admin-analytics-panel">
                  <h2>Page breakdown</h2>
                  <div className="admin-table-wrap">
                    <table className="admin-table admin-table--compact">
                      <thead>
                        <tr>
                          <th>Page</th>
                          <th>Views</th>
                          <th>Share</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.pageViews.map((row) => (
                          <tr key={row.path}>
                            <td>
                              <span className="admin-analytics-path-label">
                                {formatPathLabel(row.path)}
                              </span>
                              <code className="admin-analytics-path-code">{row.path || "/"}</code>
                            </td>
                            <td>{row.count}</td>
                            <td>
                              <span className="admin-analytics-share">
                                <span
                                  className="admin-analytics-share-bar"
                                  style={{ width: `${row.share || 0}%` }}
                                />
                                {row.share}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="admin-analytics-panel">
                  <h2>Section details</h2>
                  <div className="admin-table-wrap">
                    <table className="admin-table admin-table--compact">
                      <thead>
                        <tr>
                          <th>Section</th>
                          <th>Page</th>
                          <th>Views</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.sectionViews.length === 0 ? (
                          <tr>
                            <td colSpan={3}>No section views yet.</td>
                          </tr>
                        ) : (
                          data.sectionViews.map((row) => (
                            <tr key={`${row.path}-${row.sectionId}`}>
                              <td>
                                <code>#{row.sectionId}</code>
                              </td>
                              <td>{formatPathLabel(row.path)}</td>
                              <td>{row.count}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AdminAnalyticsPage;
