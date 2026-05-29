import { useCallback, useEffect, useState } from "react";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { adminTechStack } from "../../lib/api";

const emptyForm = { name: "", category: "Core", published: true };

const reorderList = (list, fromId, toId) => {
  const next = [...list];
  const fromIndex = next.findIndex((item) => item._id === fromId);
  const toIndex = next.findIndex((item) => item._id === toId);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return list;
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

const AdminTechStackPage = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [draggingId, setDraggingId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);

  const load = useCallback(async () => {
    setItems(await adminTechStack.list());
  }, []);

  useEffect(() => {
    load().catch(() => setMessage("Failed to load tech stack"));
  }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      if (editingId) await adminTechStack.update(editingId, form);
      else await adminTechStack.create(form);
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setMessage(editingId ? "Technology updated" : "Technology added");
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Save failed");
    }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setForm({
      name: item.name,
      category: item.category || "Core",
      published: item.published
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this technology?")) return;
    await adminTechStack.remove(id);
    setMessage("Technology deleted");
    await load();
  };

  const persistOrder = async (ordered) => {
    setSavingOrder(true);
    try {
      const ids = ordered.map((item) => item._id);
      setItems(await adminTechStack.reorder(ids));
    } catch {
      setMessage("Failed to save order");
      await load();
    } finally {
      setSavingOrder(false);
    }
  };

  const handleDrop = (targetId) => {
    if (!draggingId || draggingId === targetId) return;
    const next = reorderList(items, draggingId, targetId);
    setItems(next);
    setDraggingId(null);
    setOverId(null);
    persistOrder(next);
  };

  return (
    <div className="admin-page admin-tech-page">
      <header className="admin-page-header">
        <div>
          <h1>Tech stack</h1>
          <p>Technologies shown in the marquee on the services page. Drag rows to reorder — newest items appear on top.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Add technology
        </button>
      </header>

      {message && <p className="admin-message">{message}</p>}
      {savingOrder && <p className="admin-tech-saving">Saving order…</p>}

      {showForm && (
        <form className="admin-form-card" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit technology" : "New technology"}</h2>
          <div className="admin-form-grid">
            <label>
              Name *
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>
              Category
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
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
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <div className="admin-projects-empty">
          <p>No technologies yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="admin-tech-list">
          <div className="admin-tech-list-head">
            <span />
            <span>Name</span>
            <span>Category</span>
            <span>Status</span>
            <span />
          </div>
          {items.map((item) => (
            <div
              key={item._id}
              className={`admin-tech-row ${draggingId === item._id ? "admin-tech-row--dragging" : ""} ${overId === item._id ? "admin-tech-row--over" : ""}`}
              draggable
              onDragStart={() => setDraggingId(item._id)}
              onDragEnd={() => {
                setDraggingId(null);
                setOverId(null);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setOverId(item._id);
              }}
              onDragLeave={() => setOverId(null)}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(item._id);
              }}
            >
              <button type="button" className="admin-tech-drag" aria-label="Drag to reorder" tabIndex={-1}>
                <GripVertical size={18} />
              </button>
              <span className="admin-tech-name">{item.name}</span>
              <span className="admin-tech-category">{item.category}</span>
              <span className={`admin-status-pill ${item.published ? "admin-status-pill--live" : "admin-status-pill--draft"}`}>
                {item.published ? "Published" : "Draft"}
              </span>
              <div className="admin-table-actions">
                <button type="button" onClick={() => openEdit(item)} aria-label={`Edit ${item.name}`}>
                  <Pencil size={16} />
                </button>
                <button type="button" onClick={() => handleDelete(item._id)} aria-label={`Delete ${item.name}`}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTechStackPage;
