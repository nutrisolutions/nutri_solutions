import { useCallback, useEffect, useState } from "react";
import { ListChecks } from "lucide-react";
import { employeeMyTasks, employeeUpdateTaskStatus } from "../../lib/api";

const COLUMNS = [
  { status: "todo", label: "To Do" },
  { status: "in_progress", label: "In Progress" },
  { status: "done", label: "Done" }
];

const PRIORITY_PILL = {
  low: "status-pill--neutral",
  medium: "status-pill--info",
  high: "status-pill--warning"
};

const PortalTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [draggingId, setDraggingId] = useState(null);
  const [overColumn, setOverColumn] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTasks(await employeeMyTasks());
    } catch {
      setMessage("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = async (id, status) => {
    setMessage("");
    setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, status } : t)));
    try {
      await employeeUpdateTaskStatus(id, status);
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

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Tasks</h1>
          <p>Tasks assigned to you.</p>
        </div>
      </header>

      {message && <p className="admin-message">{message}</p>}

      <section className="employee-section">
        <div className="employee-section-head">
          <div>
            <h3>
              <ListChecks size={18} /> Your tasks
            </h3>
            <p>{tasks.length ? `${tasks.length} task(s)` : "Nothing assigned yet"} · Drag a card to change its status</p>
          </div>
        </div>

        {loading ? (
          <p>Loading…</p>
        ) : tasks.length === 0 ? (
          <p className="admin-empty">No tasks assigned yet.</p>
        ) : (
          <div className="employee-kanban">
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
                        {task.description && <p>{task.description}</p>}
                        {task.dueDate && <p className="employee-kanban-due">Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default PortalTasksPage;
