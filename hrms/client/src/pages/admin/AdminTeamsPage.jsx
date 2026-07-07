import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { adminEmployees, adminTeams } from "../../lib/api";
import { initials } from "../../lib/employeeStatus";
import Modal from "../../components/ui/Modal";

const emptyForm = { name: "", leadId: "", memberIds: [] };

const AdminTeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [memberSearch, setMemberSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, e] = await Promise.all([adminTeams.list(), adminEmployees.list()]);
      setTeams(t);
      setEmployees(e);
    } catch {
      setMessage("Failed to load teams");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const leadOptions = useMemo(() => employees.filter((e) => e.isTeamLead), [employees]);
  const memberOptions = useMemo(
    () =>
      employees.filter(
        (e) =>
          e.onboardingLevel === 3 &&
          e.employmentType === "permanent" &&
          e._id !== form.leadId &&
          e.fullName.toLowerCase().includes(memberSearch.trim().toLowerCase())
      ),
    [employees, form.leadId, memberSearch]
  );

  const openNewTeam = () => {
    setForm(emptyForm);
    setMemberSearch("");
    setShowForm(true);
  };

  const toggleMember = (id) => {
    setForm((prev) => ({
      ...prev,
      memberIds: prev.memberIds.includes(id) ? prev.memberIds.filter((m) => m !== id) : [...prev.memberIds, id]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setSaving(true);
    try {
      await adminTeams.create({ name: form.name.trim(), leadId: form.leadId, memberIds: form.memberIds });
      setMessage("Team created");
      setShowForm(false);
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to create team");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this team?")) return;
    try {
      await adminTeams.remove(id);
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to delete team");
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Teams</h1>
          <p>Group a Team Lead with Level 3 employees. Mark employees as Team Lead from their profile first.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openNewTeam}>
          <Plus size={18} /> New team
        </button>
      </header>

      {message && <p className="admin-message">{message}</p>}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New team" maxWidth="520px">
        <form className="admin-form-card" onSubmit={handleSubmit} style={{ margin: 0 }}>
          <h2>New team</h2>
          <div className="admin-form-grid">
            <label className="admin-form-full">
              Team name *
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label className="admin-form-full">
              Team lead *
              <select value={form.leadId} onChange={(e) => setForm({ ...form, leadId: e.target.value })} required>
                <option value="">Select team lead</option>
                {leadOptions.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.fullName}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {leadOptions.length === 0 && (
            <p className="admin-empty">No employees are marked as Team Lead yet. Do that from an employee's profile first.</p>
          )}

          <div className="admin-chat-group-members-label">
            <span>Members (Level 3, permanent) *</span>
            {form.memberIds.length > 0 && <span className="admin-badge admin-badge--ok">{form.memberIds.length} selected</span>}
          </div>
          <div className="admin-search admin-chat-group-search">
            <input
              type="search"
              placeholder="Search employees…"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
            />
          </div>
          <div className="admin-chat-directory-list admin-chat-group-picker">
            {memberOptions.length === 0 ? (
              <p className="admin-empty">No eligible Level 3 employees found.</p>
            ) : (
              memberOptions.map((e) => {
                const checked = form.memberIds.includes(e._id);
                return (
                  <label key={e._id} className={`admin-chat-member-row ${checked ? "is-checked" : ""}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggleMember(e._id)} />
                    <span className="admin-chat-member-avatar">{initials(e.fullName)}</span>
                    <span className="admin-chat-member-info">
                      <strong>{e.fullName}</strong>
                      <span>{e.email}</span>
                    </span>
                  </label>
                );
              })
            )}
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving || !form.name.trim() || !form.leadId}>
              <Users size={16} /> {saving ? "Creating…" : "Create team"}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <section className="employee-section">
        <div className="employee-section-head">
          <div>
            <h3>
              <Users size={18} /> All teams
            </h3>
          </div>
        </div>
        {loading ? (
          <p>Loading…</p>
        ) : teams.length === 0 ? (
          <p className="admin-empty">No teams created yet.</p>
        ) : (
          <div className="employee-doc-grid">
            {teams.map((team) => (
              <div key={team._id} className="employee-doc-card">
                <div className="employee-doc-card-head">
                  <strong>{team.name}</strong>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => handleDelete(team._id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <p>
                  <span className="admin-badge admin-badge--ok">Lead</span> {team.lead?.fullName || "Unknown"}
                </p>
                <p>{team.members.length} member(s)</p>
                {team.members.length > 0 && <p>{team.members.map((m) => m.fullName).join(", ")}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminTeamsPage;
