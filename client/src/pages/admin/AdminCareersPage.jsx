import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Briefcase,
  ExternalLink,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  User
} from "lucide-react";
import { adminCareers } from "../../lib/api";
import CopyLinkButton from "../../components/admin/CopyLinkButton";

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];

const emptyForm = {
  title: "",
  department: "Engineering",
  location: "Hyderabad, India",
  employmentType: "Full-time",
  shortDescription: "",
  description: "",
  requirements: "",
  published: false
};

const positionToForm = (p) => ({
  title: p.title,
  department: p.department || "Engineering",
  location: p.location || "",
  employmentType: p.employmentType || "Full-time",
  shortDescription: p.shortDescription || "",
  description: p.description || "",
  requirements: (p.requirements || []).join("\n"),
  published: p.published
});

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : "—";

const AdminPositionForm = ({ form, setForm, editingId, onSubmit, onCancel }) => (
  <form className="admin-form-card" onSubmit={onSubmit}>
    <h2>{editingId ? "Edit position" : "New position"}</h2>
    <div className="admin-form-grid">
      <label>
        Job title *
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      </label>
      <label>
        Department
        <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
      </label>
      <label>
        Location
        <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
      </label>
      <label>
        Employment type
        <select value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })}>
          {EMPLOYMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <label className="admin-form-full">
        Short summary
        <textarea
          rows={2}
          value={form.shortDescription}
          onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
        />
      </label>
      <label className="admin-form-full">
        Role description
        <textarea
          rows={6}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </label>
      <label className="admin-form-full">
        Requirements (one per line)
        <textarea
          rows={5}
          value={form.requirements}
          onChange={(e) => setForm({ ...form, requirements: e.target.value })}
          placeholder="3+ years with React…"
        />
      </label>
    </div>
    <div className="admin-form-checks">
      <label>
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => setForm({ ...form, published: e.target.checked })}
        />
        Published (visible on website)
      </label>
    </div>
    <div className="admin-form-actions">
      <button type="submit" className="btn btn-primary">
        Save
      </button>
      <button type="button" className="btn btn-outline" onClick={onCancel}>
        Cancel
      </button>
    </div>
  </form>
);

const AdminCareersPage = () => {
  const [positions, setPositions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [applications, setApplications] = useState([]);
  const [expandedAppId, setExpandedAppId] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPositions(await adminCareers.listPositions());
    } catch {
      setMessage("Failed to load positions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return positions;
    return positions.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.department?.toLowerCase().includes(q) ||
        p.location?.toLowerCase().includes(q)
    );
  }, [positions, search]);

  const openDetail = async (position) => {
    setSelected(position);
    setView("detail");
    setExpandedAppId(null);
    setAppsLoading(true);
    try {
      const data = await adminCareers.listApplications(position._id);
      setSelected(data.position);
      setApplications(data.applications);
    } catch {
      setMessage("Failed to load applications");
      setApplications([]);
    } finally {
      setAppsLoading(false);
    }
  };

  const backToList = () => {
    setView("list");
    setSelected(null);
    setApplications([]);
    setEditingId(null);
    setForm(emptyForm);
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setView("form");
  };

  const openEdit = (position) => {
    setForm(positionToForm(position));
    setEditingId(position._id);
    setView("form");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      if (editingId) await adminCareers.updatePosition(editingId, form);
      else await adminCareers.createPosition(form);
      setMessage(editingId ? "Position updated" : "Position created");
      await load();
      if (selected && editingId === selected._id) {
        await openDetail({ _id: editingId });
        setView("detail");
      } else {
        backToList();
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Save failed");
    }
  };

  const handleDeletePosition = async (id) => {
    if (!window.confirm("Delete this position and all applications?")) return;
    await adminCareers.removePosition(id);
    setMessage("Position deleted");
    backToList();
    await load();
  };

  const handleDeleteApplication = async (id) => {
    if (!window.confirm("Delete this application?")) return;
    await adminCareers.removeApplication(id);
    setMessage("Application removed");
    if (selected) await openDetail(selected);
  };

  return (
    <div className="admin-page admin-careers-page">
      <header className="admin-page-header">
        <div>
          {view !== "list" && (
            <button type="button" className="admin-back-btn" onClick={backToList}>
              <ArrowLeft size={18} /> Back to positions
            </button>
          )}
          <h1>Careers</h1>
          <p>Manage open roles and review applications from the website apply form.</p>
        </div>
        {view === "list" && (
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            <Plus size={18} /> Add position
          </button>
        )}
        {view === "detail" && selected && (
          <div className="admin-page-header-actions">
            <CopyLinkButton url={`/careers/${selected.slug}`} label="Public link" />
            <button type="button" className="btn btn-outline" onClick={() => openEdit(selected)}>
              <Pencil size={16} /> Edit
            </button>
          </div>
        )}
      </header>

      {message && <p className="admin-message">{message}</p>}

      {view === "form" && (
        <AdminPositionForm
          form={form}
          setForm={setForm}
          editingId={editingId}
          onSubmit={handleSubmit}
          onCancel={() => (selected ? setView("detail") : backToList())}
        />
      )}

      {view === "list" && (
        <>
          <div className="admin-projects-toolbar">
            <div className="admin-search">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search positions…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          {loading ? (
            <p>Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="admin-empty">No positions yet. Add one to get started.</p>
          ) : (
            <div className="admin-careers-list">
              {filtered.map((p) => (
                <button
                  key={p._id}
                  type="button"
                  className="admin-careers-row"
                  onClick={() => openDetail(p)}
                >
                  <div className="admin-careers-row-main">
                    <Briefcase size={20} />
                    <div>
                      <strong>{p.title}</strong>
                      <span>
                        {p.department} · {p.location}
                      </span>
                    </div>
                  </div>
                  <div className="admin-careers-row-meta">
                    <span className={p.published ? "admin-badge admin-badge--ok" : "admin-badge"}>
                      {p.published ? "Published" : "Draft"}
                    </span>
                    <span className="admin-careers-applications-count">
                      {p.applicationCount ?? 0} application{(p.applicationCount ?? 0) === 1 ? "" : "s"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {view === "detail" && selected && (
        <div className="admin-careers-detail">
          <div className="admin-careers-position-summary">
            <h2>{selected.title}</h2>
            <p>
              <MapPin size={14} /> {selected.location} · {selected.employmentType} ·{" "}
              {selected.published ? "Live on site" : "Draft"}
            </p>
            {selected.shortDescription && <p>{selected.shortDescription}</p>}
            <button
              type="button"
              className="btn btn-outline btn-sm admin-careers-delete-position"
              onClick={() => handleDeletePosition(selected._id)}
            >
              <Trash2 size={16} /> Delete position
            </button>
          </div>

          <h3 className="admin-careers-apps-heading">
            Applications ({applications.length})
          </h3>

          {appsLoading ? (
            <p>Loading applications…</p>
          ) : applications.length === 0 ? (
            <p className="admin-empty">No applications yet for this role.</p>
          ) : (
            <div className="admin-applications-list">
              {applications.map((app) => {
                const open = expandedAppId === app._id;
                return (
                  <article key={app._id} className={`admin-application-card ${open ? "is-open" : ""}`}>
                    <button
                      type="button"
                      className="admin-application-card-head"
                      onClick={() => setExpandedAppId(open ? null : app._id)}
                    >
                      <div>
                        <strong>
                          <User size={16} /> {app.fullName}
                        </strong>
                        <span>{formatDate(app.createdAt)}</span>
                      </div>
                      <span className="admin-application-card-email">{app.email}</span>
                    </button>
                    {open && (
                      <div className="admin-application-card-body">
                        <ul className="admin-application-meta">
                          <li>
                            <Mail size={14} />
                            <a href={`mailto:${app.email}`}>{app.email}</a>
                          </li>
                          <li>
                            <Phone size={14} />
                            <a href={`tel:${app.phone}`}>{app.phone}</a>
                          </li>
                          {app.yearsExperience && <li>Experience: {app.yearsExperience}</li>}
                          {app.linkedIn && (
                            <li>
                              <ExternalLink size={14} />
                              <a href={app.linkedIn} target="_blank" rel="noreferrer">
                                LinkedIn
                              </a>
                            </li>
                          )}
                          {app.portfolioUrl && (
                            <li>
                              <ExternalLink size={14} />
                              <a href={app.portfolioUrl} target="_blank" rel="noreferrer">
                                Portfolio
                              </a>
                            </li>
                          )}
                          {app.resumeUrl && (
                            <li>
                              <ExternalLink size={14} />
                              <a href={app.resumeUrl} target="_blank" rel="noreferrer">
                                Resume
                              </a>
                            </li>
                          )}
                        </ul>
                        <div className="admin-application-cover">
                          <h4>Cover letter</h4>
                          <p>{app.coverLetter}</p>
                        </div>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => handleDeleteApplication(app._id)}
                        >
                          <Trash2 size={14} /> Delete application
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminCareersPage;
