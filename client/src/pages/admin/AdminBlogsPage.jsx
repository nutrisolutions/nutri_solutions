import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  FileText,
  ImageOff,
  Pencil,
  Plus,
  Search,
  Trash2,
  User
} from "lucide-react";
import { adminBlogs } from "../../lib/api";
import ImageUrlField from "../../components/admin/ImageUrlField";
import CopyLinkButton from "../../components/admin/CopyLinkButton";
import Modal from "../../components/ui/Modal";

const emptyForm = {
  title: "",
  excerpt: "",
  content: "",
  coverImage: "",
  author: "Nutri Solutions",
  published: false
};

const blogToForm = (b) => ({
  title: b.title,
  excerpt: b.excerpt || "",
  content: b.content || "",
  coverImage: b.coverImage || "",
  author: b.author || "Nutri Solutions",
  published: b.published
});

const formatDate = (value) => {
  if (!value) return null;
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

const AdminBlogForm = ({ form, setForm, editingId, onSubmit, onCancel }) => (
  <form className="admin-form-card" onSubmit={onSubmit}>
    <h2>{editingId ? "Edit post" : "New post"}</h2>
    <div className="admin-form-grid">
      <label>
        Title *
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      </label>
      <label>
        Author
        <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
      </label>
      <ImageUrlField
        label="Cover image"
        value={form.coverImage}
        onChange={(coverImage) => setForm({ ...form, coverImage })}
        hint="Shown on blog cards and the article page header."
      />
      <label className="admin-form-full">
        Excerpt
        <textarea rows={3} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
      </label>
      <label className="admin-form-full">
        Content
        <textarea rows={10} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
      </label>
    </div>
    <div className="admin-form-checks">
      <label>
        <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
        Published
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

const AdminBlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [view, setView] = useState("list");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setBlogs(await adminBlogs.list());
    } catch {
      setMessage("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return blogs;
    return blogs.filter(
      (b) =>
        b.title?.toLowerCase().includes(q) ||
        b.slug?.toLowerCase().includes(q) ||
        b.excerpt?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q)
    );
  }, [blogs, search]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openDetail = (blog) => {
    setSelected(blog);
    setView("detail");
  };

  const openEdit = (blog) => {
    setForm(blogToForm(blog));
    setEditingId(blog._id);
    setSelected(blog);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const backToList = () => {
    setView("list");
    setSelected(null);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      if (editingId) {
        await adminBlogs.update(editingId, form);
        setMessage("Blog updated");
      } else {
        await adminBlogs.create(form);
        setMessage("Blog created");
      }
      await load();
      closeForm();
    } catch (err) {
      setMessage(err.response?.data?.message || "Save failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this blog post? This cannot be undone.")) return;
    try {
      await adminBlogs.remove(id);
      setMessage("Blog deleted");
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
              <ArrowLeft size={18} /> Back to blogs
            </button>
          )}
          <h1>{view === "detail" ? selected?.title : "Blogs"}</h1>
          <p>
            {view === "list"
              ? "Publish articles for the /blog section."
              : "Review the article, edit, or remove it from the site."}
          </p>
        </div>
        {view === "list" && (
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            <Plus size={18} /> New post
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
                placeholder="Search by title, slug, or author…"
                aria-label="Search blogs"
              />
            </div>
            <span className="admin-projects-count">
              {filtered.length} of {blogs.length} post{blogs.length !== 1 ? "s" : ""}
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
              <FileText size={40} strokeWidth={1.25} />
              <h2>{search ? "No matching posts" : "No blog posts yet"}</h2>
              <p>
                {search
                  ? "Try a different search term or clear the filter."
                  : "Create your first article to show it on the blog page."}
              </p>
              {!search && (
                <button type="button" className="btn btn-primary" onClick={openCreate}>
                  <Plus size={18} /> New post
                </button>
              )}
            </div>
          ) : (
            <div className="admin-projects-grid">
              {filtered.map((blog) => (
                <button
                  key={blog._id}
                  type="button"
                  className="admin-project-card"
                  onClick={() => openDetail(blog)}
                >
                  <div className="admin-project-card-media">
                    {blog.coverImage ? (
                      <img src={blog.coverImage} alt="" loading="lazy" />
                    ) : (
                      <div className="admin-project-card-placeholder">
                        <ImageOff size={28} />
                      </div>
                    )}
                    <div className="admin-project-card-badges">
                      <span
                        className={`admin-status-pill ${blog.published ? "admin-status-pill--live" : "admin-status-pill--draft"}`}
                      >
                        {blog.published ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>
                  <div className="admin-project-card-body">
                    <span className="admin-project-card-type">{blog.author || "Nutri Solutions"}</span>
                    <h3>{blog.title}</h3>
                    <p>{blog.excerpt || "No excerpt"}</p>
                    <span className="admin-project-card-slug">/{blog.slug}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {view === "detail" && selected && (
        <div className="admin-project-detail">
          {selected.coverImage && (
            <div className="admin-project-detail-hero">
              <img src={selected.coverImage} alt={selected.title} />
            </div>
          )}

          <div className="admin-project-detail-header">
            <div>
              <div className="admin-project-detail-badges">
                <span
                  className={`admin-status-pill ${selected.published ? "admin-status-pill--live" : "admin-status-pill--draft"}`}
                >
                  {selected.published ? "Published" : "Draft"}
                </span>
              </div>
              <h2>{selected.title}</h2>
              <p className="admin-project-detail-slug">/{selected.slug}</p>
              <div className="admin-blog-meta">
                <span>
                  <User size={14} /> {selected.author || "Nutri Solutions"}
                </span>
                {selected.publishedAt && (
                  <span>
                    <Calendar size={14} /> {formatDate(selected.publishedAt)}
                  </span>
                )}
              </div>
            </div>
            <div className="admin-project-detail-actions">
              {selected.published && <CopyLinkButton path={`/blog/${selected.slug}`} />}
              <button type="button" className="btn btn-primary btn-sm" onClick={() => openEdit(selected)}>
                <Pencil size={16} /> Edit
              </button>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(selected._id)}>
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>

          {selected.excerpt && <p className="admin-project-detail-lead">{selected.excerpt}</p>}

          {selected.content && (
            <section className="admin-project-detail-section">
              <h3>Content</h3>
              <p>{selected.content}</p>
            </section>
          )}
        </div>
      )}

      <Modal open={showForm} onClose={closeForm} title={editingId ? "Edit post" : "New post"} maxWidth="820px">
        <AdminBlogForm form={form} setForm={setForm} editingId={editingId} onSubmit={handleSubmit} onCancel={closeForm} />
      </Modal>
    </div>
  );
};

export default AdminBlogsPage;
