import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { adminDepartments } from "../../lib/api";
import Modal from "../../components/ui/Modal";
import { departmentSchema } from "../../lib/validation";
import { firstZodError } from "../../lib/zodHelpers";

const emptyForm = { name: "" };

const AdminDepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setDepartments(await adminDepartments.list());
    } catch {
      setMessage("Failed to load departments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const validationError = firstZodError(departmentSchema, form);
    if (validationError) {
      setMessage(validationError);
      return;
    }

    try {
      if (editingId) await adminDepartments.update(editingId, form);
      else await adminDepartments.create(form);
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setMessage(editingId ? "Department updated" : "Department added");
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

  const openEdit = (dept) => {
    setForm({ name: dept.name });
    setEditingId(dept._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this department?")) return;
    try {
      await adminDepartments.remove(id);
      setMessage("Department deleted");
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Departments</h1>
          <p>Manage the departments employees can be assigned to.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Add department
        </button>
      </header>

      {message && <p className="admin-message">{message}</p>}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editingId ? "Edit department" : "New department"}>
        <form className="admin-form-card" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit department" : "New department"}</h2>
          <div className="admin-form-grid">
            <label className="admin-form-full">
              Name *
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary">
              Save
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {loading ? (
        <p>Loading…</p>
      ) : departments.length === 0 ? (
        <p className="admin-empty">No departments yet.</p>
      ) : (
        <div className="admin-department-grid">
          {departments.map((d) => (
            <div key={d._id} className="admin-department-tile">
              <strong>{d.name}</strong>
              <div className="admin-table-actions">
                <button type="button" onClick={() => openEdit(d)} aria-label={`Edit ${d.name}`}>
                  <Pencil size={16} />
                </button>
                <button type="button" onClick={() => handleDelete(d._id)} aria-label={`Delete ${d.name}`}>
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

export default AdminDepartmentsPage;
