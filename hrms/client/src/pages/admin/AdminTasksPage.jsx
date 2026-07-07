import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { adminEmployees, adminTasks } from "../../lib/api";
import Modal from "../../components/ui/Modal";
import { taskSchema } from "../../lib/validation";
import { firstZodError } from "../../lib/zodHelpers";
import { useEmployeeAuth } from "../../context/EmployeeAuthContext";
import DatePicker from "../../components/ui/DatePicker";

const emptyForm = { title: "", description: "", assignedTo: "", priority: "medium", dueDate: "" };

const COLUMNS = [
  { status: "todo", label: "To Do" },
  { status: "in_progress", label: "In Progress" },
  { status: "done", label: "Done" },
  { status: "cancelled", label: "Cancelled" }
];

const PRIORITY_PILL = {
  low: "status-pill--neutral",
  medium: "status-pill--info",
  high: "status-pill--warning"
};

const AdminTasksPage = () => {
  const { employee: viewerEmployee, isHr } = useEmployeeAuth();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [draggingId, setDraggingId] = useState(null);
  const [overColumn, setOverColumn] = useState(null);

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
    setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, status } : t)));
    try {
      await adminTasks.update(id, { status });
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update task");
      await load();
    }
  };

  const handleDrop = (status) => {
    setOverColumn(null);
    if (!draggingId) return;
    const task = tasks.find((t) => t._id === draggingId);
    setDraggingId(null);
    if (!task || task.status === status) return;
    handleStatusChange(task._id, status);
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

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New task">
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
                {employees.map((emp) => {
                  const isSelf = isHr && viewerEmployee && emp._id === viewerEmployee._id;
                  return (
                    <option key={emp._id} value={emp._id} disabled={isSelf}>
                      {emp.fullName}
                      {isSelf ? " (you — cannot self-assign)" : ""}
                    </option>
                  );
                })}
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
              <DatePicker value={form.dueDate} onChange={(dueDate) => setForm({ ...form, dueDate })} />
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
      </Modal>

      {loading ? (
        <p>Loading…</p>
      ) : tasks.length === 0 ? (
        <p className="admin-empty">No tasks yet.</p>
      ) : (
        <div className="employee-kanban admin-kanban-4col">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.status);
            return (
              <div
                key={col.status}
                className={`employee-kanban-column ${overColumn === col.status ? "is-over" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverColumn(col.status);
                }}
                onDragLeave={() => setOverColumn((c) => (c === col.status ? null : c))}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(col.status);
                }}
              >
                <div className="employee-kanban-column-head">
                  <strong>{col.label}</strong>
                  <span>{colTasks.length}</span>
                </div>
                <div className="employee-kanban-column-body">
                  {colTasks.length === 0 && <p className="employee-kanban-empty">No tasks</p>}
                  {colTasks.map((task) => (
                    <div
                      key={task._id}
                      className={`employee-kanban-card ${draggingId === task._id ? "is-dragging" : ""}`}
                      draggable
                      onDragStart={() => setDraggingId(task._id)}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setOverColumn(null);
                      }}
                    >
                      <div className="employee-kanban-card-head">
                        <strong>{task.title}</strong>
                        <span className={`status-pill ${PRIORITY_PILL[task.priority] || "status-pill--neutral"}`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="admin-kanban-assignee">Assigned to: {task.assignedTo?.fullName || "Unassigned"}</p>
                      {task.description && <p>{task.description}</p>}
                      {task.dueDate && <p className="employee-kanban-due">Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
                      <div className="employee-kanban-card-actions">
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => handleDelete(task._id)}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminTasksPage;
