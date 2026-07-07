import { useCallback, useEffect, useMemo, useState } from "react";
import { Megaphone, Plus, Trash2 } from "lucide-react";
import { adminAnnouncements, adminEmployees, adminTeams } from "../../lib/api";
import { initials } from "../../lib/employeeStatus";
import Modal from "../../components/ui/Modal";

const emptyForm = { title: "", message: "", audience: "all", team: "", employeeIds: [] };

const AUDIENCE_LABEL = {
  all: "All employees",
  team: "Team",
  employees: "Specific employees"
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });

const AdminAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, t, e] = await Promise.all([adminAnnouncements.list(), adminTeams.list(), adminEmployees.list()]);
      setAnnouncements(a);
      setTeams(t);
      setEmployees(e);
    } catch {
      setMessage("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredEmployees = useMemo(
    () => employees.filter((e) => e.fullName.toLowerCase().includes(employeeSearch.trim().toLowerCase())),
    [employees, employeeSearch]
  );

  const openNew = () => {
    setForm(emptyForm);
    setEmployeeSearch("");
    setShowForm(true);
  };

  const toggleEmployee = (id) => {
    setForm((prev) => ({
      ...prev,
      employeeIds: prev.employeeIds.includes(id) ? prev.employeeIds.filter((m) => m !== id) : [...prev.employeeIds, id]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setSaving(true);
    try {
      await adminAnnouncements.create({
        title: form.title.trim(),
        message: form.message.trim(),
        audience: form.audience,
        team: form.audience === "team" ? form.team : undefined,
        employees: form.audience === "employees" ? form.employeeIds : undefined
      });
      setMessage("Announcement posted");
      setShowForm(false);
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to post announcement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await adminAnnouncements.remove(id);
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to delete announcement");
    }
  };

  const canSubmit =
    form.title.trim() &&
    form.message.trim() &&
    (form.audience === "all" || (form.audience === "team" && form.team) || (form.audience === "employees" && form.employeeIds.length > 0));

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Announcements</h1>
          <p>Post updates to all employees, a specific team, or a hand-picked list of employees.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openNew}>
          <Plus size={18} /> New announcement
        </button>
      </header>

      {message && <p className="admin-message">{message}</p>}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New announcement" maxWidth="560px">
        <form className="admin-form-card" onSubmit={handleSubmit} style={{ margin: 0 }}>
          <h2>New announcement</h2>
          <div className="admin-form-grid">
            <label className="admin-form-full">
              Title *
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </label>
            <label className="admin-form-full">
              Message *
              <textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
            </label>
            <label className="admin-form-full">
              Audience
              <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value, team: "", employeeIds: [] })}>
                <option value="all">All employees</option>
                <option value="team">A specific team</option>
                <option value="employees">Specific employees</option>
              </select>
            </label>
          </div>

          {form.audience === "team" && (
            <label className="admin-form-full">
              Team *
              <select value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} required>
                <option value="">Select team</option>
                {teams.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          {form.audience === "employees" && (
            <>
              <div className="admin-chat-group-members-label">
                <span>Employees *</span>
                {form.employeeIds.length > 0 && <span className="admin-badge admin-badge--ok">{form.employeeIds.length} selected</span>}
              </div>
              <div className="admin-search admin-chat-group-search">
                <input
                  type="search"
                  placeholder="Search employees…"
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                />
              </div>
              <div className="admin-chat-directory-list admin-chat-group-picker">
                {filteredEmployees.map((e) => {
                  const checked = form.employeeIds.includes(e._id);
                  return (
                    <label key={e._id} className={`admin-chat-member-row ${checked ? "is-checked" : ""}`}>
                      <input type="checkbox" checked={checked} onChange={() => toggleEmployee(e._id)} />
                      <span className="admin-chat-member-avatar">{initials(e.fullName)}</span>
                      <span className="admin-chat-member-info">
                        <strong>{e.fullName}</strong>
                        <span>{e.email}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </>
          )}

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving || !canSubmit}>
              <Megaphone size={16} /> {saving ? "Posting…" : "Post announcement"}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <section className="employee-section">
        <div className="employee-section-head">
          <div>
            <h3>
              <Megaphone size={18} /> All announcements
            </h3>
          </div>
        </div>
        {loading ? (
          <p>Loading…</p>
        ) : announcements.length === 0 ? (
          <p className="admin-empty">No announcements posted yet.</p>
        ) : (
          <div className="employee-doc-grid">
            {announcements.map((a) => (
              <div key={a._id} className="employee-doc-card">
                <div className="employee-doc-card-head">
                  <strong>{a.title}</strong>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => handleDelete(a._id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <p>{a.message}</p>
                <span className="admin-badge">
                  {a.audience === "team" ? `Team: ${a.team?.name || "—"}` : AUDIENCE_LABEL[a.audience]}
                </span>
                <p className="employee-doc-reason">
                  {a.createdBy?.name} · {formatDate(a.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminAnnouncementsPage;
