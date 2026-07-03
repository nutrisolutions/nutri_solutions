import { useCallback, useEffect, useState } from "react";
import { ListChecks, Plus } from "lucide-react";
import { adminEmployees, adminTasks } from "../../lib/api";
import { taskSchema } from "../../lib/validation";
import { firstZodError } from "../../lib/zodHelpers";

const emptyForm = { title: "", description: "", assignedTo: "", priority: "medium", dueDate: "" };
const STATUS_OPTIONS = ["todo", "in_progress", "done", "cancelled"];

const AdminTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, e] = await Promise.all([adminTasks.list(), adminEmployees.list()]);
      setTasks(t);
      setEmployees(e);
    } catch {
      setMessage("Failed to load tasks");
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

    const validationError = firstZodError(taskSchema, form);
    if (validationError) {
      setMessage(validationError);
      return;
    }

    try {
      await adminTasks.create(form);
      setShowForm(false);
      setForm(emptyForm);
      setMessage("Task created");
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to create task");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await adminTasks.update(id, { status });
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update task");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    await adminTasks.remove(id);
    await load();
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Tasks</h1>
          <p>Assign and track work items for employees.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Assign task
        </button>
      </header>

      {message && <p className="admin-message">{message}</p>}

      {showForm && (
        <form className="admin-form-card" onSubmit={handleSubmit}>
          <h2>New task</h2>
          <div className="admin-form-grid">
            <label>
              Title *
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </label>
            <label>
              Assign to *
              <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} required>
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.fullName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Priority
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label>
              Due date
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </label>
            <label className="admin-form-full">
              Description
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
      )}

      {loading ? (
        <p>Loading…</p>
      ) : tasks.length === 0 ? (
        <p className="admin-empty">No tasks yet.</p>
      ) : (
        <div className="admin-applications-list">
          {tasks.map((task) => (
            <article key={task._id} className="admin-application-card is-open">
              <div className="admin-application-card-body">
                <strong>
                  <ListChecks size={16} /> {task.title}
                </strong>
                <p>
                  Assigned to: {task.assignedTo?.fullName} · Priority: {task.priority}
                </p>
                {task.description && <p>{task.description}</p>}
                <label>
                  Status:{" "}
                  <select value={task.status} onChange={(e) => handleStatusChange(task._id, e.target.value)}>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="admin-form-actions">
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => handleDelete(task._id)}>
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTasksPage;
