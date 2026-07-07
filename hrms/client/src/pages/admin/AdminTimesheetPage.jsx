import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, Download, FileText, Search, Users } from "lucide-react";
import { adminTimesheet } from "../../lib/api";
import { initials } from "../../lib/employeeStatus";
import Modal from "../../components/ui/Modal";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const now = new Date();

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short" });

const AdminTimesheetPage = () => {
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState("monthly");
  const [exportMonth, setExportMonth] = useState(now.getMonth() + 1);
  const [exportYear, setExportYear] = useState(now.getFullYear());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminTimesheet.list({ month, year });
      setEmployees(res.employees);
    } catch {
      setMessage("Failed to load timesheet");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    load();
  }, [load]);

  const openExportModal = () => {
    setExportType("monthly");
    setExportMonth(month);
    setExportYear(year);
    setShowExportModal(true);
  };

  const handleExport = async () => {
    setMessage("");
    setExporting(true);
    try {
      const params =
        exportType === "annual" ? { type: "annual", year: exportYear } : { type: "monthly", month: exportMonth, year: exportYear };
      const blob = await adminTimesheet.export(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        exportType === "annual"
          ? `timesheet-annual-${exportYear}.xlsx`
          : `timesheet-${exportYear}-${String(exportMonth).padStart(2, "0")}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setShowExportModal(false);
    } catch {
      setMessage("Failed to export timesheet");
    } finally {
      setExporting(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    const visible = query
      ? employees.filter((e) => e.employee?.fullName?.toLowerCase().includes(query))
      : employees;
    return visible.map((e) => ({ ...e, entries: [...e.entries].reverse() }));
  }, [employees, search]);

  const totalEmployees = employees.length;
  const totalEntries = employees.reduce((sum, e) => sum + e.daysLogged, 0);

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Timesheet</h1>
          <p>Daily work updates submitted by employees. Export a full Excel report, date-wise per employee.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openExportModal}>
          <Download size={18} /> Export to Excel
        </button>
      </header>

      {message && <p className="admin-message">{message}</p>}

      <Modal open={showExportModal} onClose={() => setShowExportModal(false)} title="Export timesheet" maxWidth="420px">
        <form
          className="admin-form-card"
          style={{ margin: 0 }}
          onSubmit={(e) => {
            e.preventDefault();
            handleExport();
          }}
        >
          <h2>Export timesheet</h2>
          <div className="admin-form-grid">
            <label className="admin-form-full">
              Report type
              <select value={exportType} onChange={(e) => setExportType(e.target.value)}>
                <option value="monthly">Monthly report</option>
                <option value="annual">Annual report</option>
              </select>
            </label>
            {exportType === "monthly" && (
              <label>
                Month
                <select value={exportMonth} onChange={(e) => setExportMonth(Number(e.target.value))}>
                  {MONTHS.map((label, idx) => (
                    <option key={label} value={idx + 1}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className={exportType === "monthly" ? "" : "admin-form-full"}>
              Year
              <select value={exportYear} onChange={(e) => setExportYear(Number(e.target.value))}>
                {[exportYear - 1, exportYear, exportYear + 1].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="admin-message" style={{ marginTop: "0.5rem" }}>
            {exportType === "monthly"
              ? "Each date becomes its own sheet, with an overview sheet first."
              : "Each month becomes its own sheet, filterable by employee name."}
          </p>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={exporting}>
              <Download size={16} /> {exporting ? "Exporting…" : "Export"}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setShowExportModal(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <div className="admin-analytics-stats">
        <div className="admin-analytics-stat-card">
          <Users size={22} />
          <div>
            <span className="admin-analytics-stat-value">{totalEmployees}</span>
            <span className="admin-analytics-stat-label">Employees with updates</span>
          </div>
        </div>
        <div className="admin-analytics-stat-card">
          <FileText size={22} />
          <div>
            <span className="admin-analytics-stat-value">{totalEntries}</span>
            <span className="admin-analytics-stat-label">Total work updates logged</span>
          </div>
        </div>
      </div>

      <section className="employee-section">
        <div className="employee-section-head admin-timesheet-toolbar">
          <div>
            <h3>
              <CalendarClock size={18} /> {MONTHS[month - 1]} {year}
            </h3>
            <p>{totalEntries ? `${totalEntries} update(s) across ${totalEmployees} employee(s)` : "No updates yet"}</p>
          </div>
          <div className="admin-timesheet-filters">
            <select
              className="admin-timesheet-select"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              aria-label="Month"
            >
              {MONTHS.map((label, idx) => (
                <option key={label} value={idx + 1}>
                  {label}
                </option>
              ))}
            </select>
            <select
              className="admin-timesheet-select"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              aria-label="Year"
            >
              {[year - 1, year, year + 1].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <div className="admin-search">
              <Search size={16} />
              <input
                type="search"
                placeholder="Search employee…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <p>Loading…</p>
        ) : employees.length === 0 ? (
          <p className="admin-empty">No work updates submitted for this month.</p>
        ) : filteredEmployees.length === 0 ? (
          <p className="admin-empty">No employees match "{search}".</p>
        ) : (
          <div className="employee-timesheet-employees">
            {filteredEmployees.map((e) => (
              <div key={e.employee?._id} className="employee-doc-card employee-timesheet-employee-card">
                <div className="employee-doc-card-head">
                  <strong>
                    <span className="employee-avatar employee-avatar--sm">{initials(e.employee?.fullName)}</span>
                    {e.employee?.fullName}
                  </strong>
                  <span className="admin-badge">{e.daysLogged} day(s)</span>
                </div>
                <div className="employee-timesheet-entries">
                  {e.entries.map((entry) => (
                    <div key={entry._id} className="employee-timesheet-entry">
                      <span className="employee-timesheet-entry-date">{formatDate(entry.date)}</span>
                      <p>{entry.workUpdate}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminTimesheetPage;
