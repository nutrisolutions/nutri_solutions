import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, Mail, MessageSquare, Phone, Search, Trash2, User } from "lucide-react";
import { adminContact } from "../../lib/api";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : "";

const AdminContactPage = () => {
  const [inquiries, setInquiries] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setInquiries(await adminContact.listInquiries());
    } catch {
      setMessage("Failed to load contact inquiries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return inquiries;
    return inquiries.filter(
      (item) =>
        item.fullName?.toLowerCase().includes(q) ||
        item.email?.toLowerCase().includes(q) ||
        item.company?.toLowerCase().includes(q) ||
        item.topic?.toLowerCase().includes(q) ||
        item.message?.toLowerCase().includes(q)
    );
  }, [inquiries, search]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this inquiry?")) return;
    try {
      await adminContact.removeInquiry(id);
      setMessage("Inquiry deleted");
      if (expandedId === id) setExpandedId(null);
      await load();
    } catch {
      setMessage("Failed to delete inquiry");
    }
  };

  return (
    <div className="admin-page admin-contact-page">
      <header className="admin-page-header">
        <div>
          <h1>
            <MessageSquare size={24} /> Contact inquiries
          </h1>
          <p>Messages submitted from the website contact form.</p>
        </div>
      </header>

      {message && <p className="admin-message">{message}</p>}

      <div className="admin-projects-toolbar">
        <div className="admin-search">
          <Search size={18} />
          <input
            type="search"
            placeholder="Search by name, email, company, topic…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p>Loading inquiries…</p>
      ) : filtered.length === 0 ? (
        <p className="admin-empty">
          {inquiries.length === 0
            ? "No contact form submissions yet."
            : "No inquiries match your search."}
        </p>
      ) : (
        <div className="admin-applications-list">
          {filtered.map((item) => {
            const open = expandedId === item._id;
            return (
              <article key={item._id} className={`admin-application-card ${open ? "is-open" : ""}`}>
                <button
                  type="button"
                  className="admin-application-card-head"
                  onClick={() => setExpandedId(open ? null : item._id)}
                >
                  <div>
                    <strong>
                      <User size={16} /> {item.fullName}
                    </strong>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                  <span className="admin-application-card-email">
                    {item.topic} · {item.email}
                  </span>
                </button>
                {open && (
                  <div className="admin-application-card-body">
                    <ul className="admin-application-meta">
                      <li>
                        <Mail size={14} />
                        <a href={`mailto:${item.email}`}>{item.email}</a>
                      </li>
                      {item.phone && (
                        <li>
                          <Phone size={14} />
                          <a href={`tel:${item.phone}`}>{item.phone}</a>
                        </li>
                      )}
                      {item.company && (
                        <li>
                          <Building2 size={14} />
                          {item.company}
                        </li>
                      )}
                      <li>
                        <MessageSquare size={14} />
                        {item.topic}
                      </li>
                    </ul>
                    <div className="admin-application-cover">
                      <h4>Project details</h4>
                      <p>{item.message}</p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => handleDelete(item._id)}
                    >
                      <Trash2 size={14} /> Delete inquiry
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminContactPage;
