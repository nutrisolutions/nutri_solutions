import { useCallback, useEffect, useState } from "react";
import { ListChecks } from "lucide-react";
import { employeeMyTasks, employeeUpdateTaskStatus } from "../../lib/api";

const STATUS_OPTIONS = ["todo", "in_progress", "done"];

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

      {loading ? (
        <p>Loading…</p>
      ) : tasks.length === 0 ? (
        <p className="admin-empty">No tasks assigned yet.</p>
      ) : (
        <div className="admin-applications-list">
          {tasks.map((task) => (
            <article key={task._id} className="admin-application-card is-open">
              <div className="admin-application-card-body">
                <strong>
                  <ListChecks size={16} /> {task.title}
                </strong>
                {task.description && <p>{task.description}</p>}
                <p>
                  Priority: {task.priority}
                  {task.dueDate && ` · Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                </p>
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
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default PortalTasksPage;
