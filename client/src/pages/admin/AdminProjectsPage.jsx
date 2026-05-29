import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ImageOff,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2
} from "lucide-react";
import { adminProjects } from "../../lib/api";
import { APPLICATION_TYPES } from "../../constants/projectTypes";
import TagInput from "../../components/admin/TagInput";
import ImageUrlField from "../../components/admin/ImageUrlField";
import ScreenshotField from "../../components/admin/ScreenshotField";
import HomeMockupImageField from "../../components/admin/HomeMockupImageField";
import ExternalImage from "../../components/ui/ExternalImage";
import CopyLinkButton from "../../components/admin/CopyLinkButton";

const emptyForm = {
  title: "",
  image: "",
  applicationType: "Web Application",
  shortDescription: "",
  description: "",
  banner: "",
  techStack: [],
  screenshots: [],
  homeMockupImage: "",
  published: true,
  featured: false,
  order: 0
};

const projectToForm = (p) => ({
  title: p.title,
  image: p.image,
  applicationType: p.applicationType,
  shortDescription: p.shortDescription || "",
  description: p.description || "",
  banner: p.banner || "",
  techStack: p.techStack || [],
  screenshots: p.screenshots || [],
  homeMockupImage: p.homeMockupImage || "",
  published: p.published,
  featured: p.featured,
  order: p.order || 0
});

const AdminProjectForm = ({ form, setForm, editingId, onSubmit, onCancel }) => (
  <form className="admin-form-card" onSubmit={onSubmit}>
    <h2>{editingId ? "Edit project" : "New project"}</h2>
    <div className="admin-form-grid">
      <label>
        Title *
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      </label>
      <label>
        Application type *
        <select value={form.applicationType} onChange={(e) => setForm({ ...form, applicationType: e.target.value })}>
          {APPLICATION_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <label>
        Order
        <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
      </label>
      <ImageUrlField
        label="Thumbnail image"
        value={form.image}
        onChange={(image) => setForm({ ...form, image })}
        required
        hint="Used on project cards and listings."
      />
      <ImageUrlField
        label="Banner image"
        value={form.banner}
        onChange={(banner) => setForm({ ...form, banner })}
        hint="Shown at the top of the project detail page."
      />
      <label className="admin-form-full">
        Short description
        <input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
      </label>
      <label className="admin-form-full">
        Full description
        <textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </label>
      <label className="admin-form-full">
        Tech stack
        <TagInput
          value={form.techStack}
          onChange={(techStack) => setForm({ ...form, techStack })}
          placeholder="e.g. React, Node.js — press Enter to add"
        />
      </label>
      <HomeMockupImageField
        value={form.homeMockupImage}
        onChange={(homeMockupImage) => setForm({ ...form, homeMockupImage })}
        applicationType={form.applicationType}
      />
      <ScreenshotField value={form.screenshots} onChange={(screenshots) => setForm({ ...form, screenshots })} />
    </div>
    <div className="admin-form-checks">
      <label>
        <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
        Published
      </label>
      <label>
        <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
        Featured on home
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

const AdminProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminProjects.list();
      setProjects(data);
    } catch {
      setMessage("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.slug?.toLowerCase().includes(q) ||
        p.applicationType?.toLowerCase().includes(q) ||
        p.shortDescription?.toLowerCase().includes(q)
    );
  }, [projects, search]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setSelected(null);
    setView("form");
  };

  const openDetail = (project) => {
    setSelected(project);
    setView("detail");
  };

  const openEdit = (project) => {
    setForm(projectToForm(project));
    setEditingId(project._id);
    setSelected(project);
    setView("form");
  };

  const backToList = () => {
    setView("list");
    setSelected(null);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!form.image?.trim()) {
      setMessage("Thumbnail image is required — paste a URL or upload an image.");
      return;
    }
    try {
      if (editingId) {
        await adminProjects.update(editingId, form);
        setMessage("Project updated");
      } else {
        await adminProjects.create(form);
        setMessage("Project created");
      }
      await load();
      backToList();
    } catch (err) {
      setMessage(err.response?.data?.message || "Save failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project? This cannot be undone.")) return;
    try {
      await adminProjects.remove(id);
      setMessage("Project deleted");
      await load();
      backToList();
    } catch (err) {
      setMessage(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="admin-page admin-projects-page">
      <header className="admin-page-header">
        <div>
          {view !== "list" && (
            <button type="button" className="admin-back-btn" onClick={backToList}>
              <ArrowLeft size={18} /> Back to projects
            </button>
          )}
          <h1>{view === "detail" ? selected?.title : view === "form" ? (editingId ? "Edit project" : "New project") : "Projects"}</h1>
          <p>
            {view === "list"
              ? "Manage projects shown on the website."
              : view === "detail"
                ? "Review project details, edit, or remove from the site."
                : "Fill in the details below and save when ready."}
          </p>
        </div>
        {view === "list" && (
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            <Plus size={18} /> New project
          </button>
        )}
      </header>

      {message && <p className="admin-message">{message}</p>}

      {view === "list" && (
        <>
          <div className="admin-projects-toolbar">
            <div className="admin-search">
              <Search size={18} />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, slug, or type…"
                aria-label="Search projects"
              />
            </div>
            <span className="admin-projects-count">
              {filtered.length} of {projects.length} project{projects.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className="admin-projects-grid">
              {[1, 2, 3].map((n) => (
                <div key={n} className="admin-project-card admin-project-card--skeleton" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="admin-projects-empty">
              <ImageOff size={40} strokeWidth={1.25} />
              <h2>{search ? "No matching projects" : "No projects yet"}</h2>
              <p>
                {search
                  ? "Try a different search term or clear the filter."
                  : "Create your first project to show it on the website."}
              </p>
              {!search && (
                <button type="button" className="btn btn-primary" onClick={openCreate}>
                  <Plus size={18} /> New project
                </button>
              )}
            </div>
          ) : (
            <div className="admin-projects-grid">
              {filtered.map((project) => (
                <button
                  key={project._id}
                  type="button"
                  className="admin-project-card"
                  onClick={() => openDetail(project)}
                >
                  <div className="admin-project-card-media">
                    {project.image ? (
                      <img src={project.image} alt="" loading="lazy" />
                    ) : (
                      <div className="admin-project-card-placeholder">
                        <ImageOff size={28} />
                      </div>
                    )}
                    <div className="admin-project-card-badges">
                      <span className={`admin-status-pill ${project.published ? "admin-status-pill--live" : "admin-status-pill--draft"}`}>
                        {project.published ? "Published" : "Draft"}
                      </span>
                      {project.featured && (
                        <span className="admin-status-pill admin-status-pill--featured">
                          <Star size={12} /> Featured
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="admin-project-card-body">
                    <span className="admin-project-card-type">{project.applicationType}</span>
                    <h3>{project.title}</h3>
                    <p>{project.shortDescription || "No short description"}</p>
                    <span className="admin-project-card-slug">/{project.slug}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {view === "detail" && selected && (
        <div className="admin-project-detail">
          <div className="admin-project-detail-hero">
            <img src={selected.banner || selected.image} alt={selected.title} />
          </div>

          <div className="admin-project-detail-header">
            <div>
              <div className="admin-project-detail-badges">
                <span className={`admin-status-pill ${selected.published ? "admin-status-pill--live" : "admin-status-pill--draft"}`}>
                  {selected.published ? "Published" : "Draft"}
                </span>
                {selected.featured && (
                  <span className="admin-status-pill admin-status-pill--featured">
                    <Star size={12} /> Featured
                  </span>
                )}
                <span className="admin-status-pill">{selected.applicationType}</span>
              </div>
              <h2>{selected.title}</h2>
              <p className="admin-project-detail-slug">/{selected.slug}</p>
            </div>
            <div className="admin-project-detail-actions">
              {selected.published && <CopyLinkButton path={`/projects/${selected.slug}`} />}
              <button type="button" className="btn btn-primary btn-sm" onClick={() => openEdit(selected)}>
                <Pencil size={16} /> Edit
              </button>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(selected._id)}>
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>

          {selected.shortDescription && (
            <p className="admin-project-detail-lead">{selected.shortDescription}</p>
          )}

          {selected.description && (
            <section className="admin-project-detail-section">
              <h3>Description</h3>
              <p>{selected.description}</p>
            </section>
          )}

          {(selected.techStack || []).length > 0 && (
            <section className="admin-project-detail-section">
              <h3>Tech stack</h3>
              <div className="admin-project-tags">
                {selected.techStack.map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>
            </section>
          )}

          {(selected.screenshots || []).length > 0 && (
            <section className="admin-project-detail-section">
              <h3>Screenshots</h3>
              <div className="admin-project-screenshots">
                {selected.screenshots.map((url, i) => (
                  <ExternalImage key={i} src={url} alt={`Screenshot ${i + 1}`} loading="lazy" />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {view === "form" && (
        <AdminProjectForm
          form={form}
          setForm={setForm}
          editingId={editingId}
          onSubmit={handleSubmit}
          onCancel={selected ? () => setView("detail") : backToList}
        />
      )}
    </div>
  );
};

export default AdminProjectsPage;
