import { useCallback, useEffect, useState } from "react";
import { ListChecks } from "lucide-react";
import { employeeMyTasks, employeeUpdateTaskStatus } from "../../lib/api";

const STATUS_OPTIONS = ["todo", "in_progress", "done"];

const PRIORITY_PILL = {
  low: "status-pill--neutral",
  medium: "status-pill--info",
  high: "status-pill--warning"
};

const PortalTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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
    try {
      await employeeUpdateTaskStatus(id, status);
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update task");
    }
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
            <p>{tasks.length ? `${tasks.length} task(s)` : "Nothing assigned yet"}</p>
          </div>
        </div>

        {loading ? (
          <p>Loading…</p>
        ) : tasks.length === 0 ? (
          <p className="admin-empty">No tasks assigned yet.</p>
        ) : (
          <div className="employee-doc-grid">
            {tasks.map((task) => (
              <div key={task._id} className="employee-doc-card">
                <div className="employee-doc-card-head">
                  <strong>{task.title}</strong>
                  <span className={`status-pill ${PRIORITY_PILL[task.priority] || "status-pill--neutral"}`}>
                    {task.priority}
                  </span>
                </div>
                {task.description && <p>{task.description}</p>}
                {task.dueDate && <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
                <label>
                  Status
                  <select value={task.status} onChange={(e) => handleStatusChange(task._id, e.target.value)}>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default PortalTasksPage;
