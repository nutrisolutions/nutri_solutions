import { useCallback, useEffect, useState } from "react";
import { ListChecks, Plus, Users } from "lucide-react";
import { employeeCreateTeamTask, employeeMyLeadTeams } from "../../lib/api";
import { initials } from "../../lib/employeeStatus";
import Modal from "../../components/ui/Modal";
import DatePicker from "../../components/ui/DatePicker";

const emptyForm = { assignedTo: "", title: "", description: "", priority: "medium", dueDate: "" };

const PortalMyTeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTeam, setActiveTeam] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTeams(await employeeMyLeadTeams());
    } catch {
      setMessage("Failed to load your teams");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openAssignTask = (team) => {
    setActiveTeam(team);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setSubmitting(true);
    try {
      await employeeCreateTeamTask(activeTeam._id, form);
      setMessage("Task assigned");
      setActiveTeam(null);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to assign task");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>My Teams</h1>
          <p>Teams you lead, and the members in each.</p>
        </div>
      </header>

      {message && <p className="admin-message">{message}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : teams.length === 0 ? (
        <p className="admin-empty">You aren't leading any teams yet.</p>
      ) : (
        <div className="employee-doc-grid">
          {teams.map((team) => (
            <div key={team._id} className="employee-doc-card">
              <div className="employee-doc-card-head">
                <strong>
                  <Users size={16} /> {team.name}
                </strong>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => openAssignTask(team)}>
                  <Plus size={14} /> Assign task
                </button>
              </div>
              <p>{team.members.length} member(s)</p>
              {team.members.map((m) => (
                <div key={m._id} className="admin-chat-member-row" style={{ padding: "0.35rem 0" }}>
                  <span className="admin-chat-member-avatar">{initials(m.fullName)}</span>
                  <span className="admin-chat-member-info">
                    <strong>{m.fullName}</strong>
                    <span>{m.email}</span>
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <Modal open={Boolean(activeTeam)} onClose={() => setActiveTeam(null)} title="Assign task" maxWidth="480px">
        {activeTeam && (
          <form className="admin-form-card" onSubmit={handleSubmit} style={{ margin: 0 }}>
            <h2>Assign task in {activeTeam.name}</h2>
            <div className="admin-form-grid">
              <label className="admin-form-full">
                Assign to *
                <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} required>
                  <option value="">Select member</option>
                  {activeTeam.members.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.fullName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="admin-form-full">
                Title *
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
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
              <button type="submit" className="btn btn-primary" disabled={submitting || !form.assignedTo || !form.title.trim()}>
                <ListChecks size={16} /> {submitting ? "Assigning…" : "Assign task"}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setActiveTeam(null)}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default PortalMyTeamsPage;
