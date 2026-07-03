import { useCallback, useEffect, useState } from "react";
import { Briefcase, CheckCircle2 } from "lucide-react";
import { employeeAcceptOffer, employeeOffer } from "../../lib/api";
import { formatDate } from "../../lib/employeeStatus";

const PortalOfferPage = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [accepting, setAccepting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setEmployee(await employeeOffer());
    } catch {
      setMessage("Failed to load offer");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAccept = async () => {
    setAccepting(true);
    setMessage("");
    try {
      await employeeAcceptOffer();
      setMessage("Offer accepted");
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to accept offer");
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Offer</h1>
          <p>Review your offer and joining letter.</p>
        </div>
      </header>

      {message && <p className="admin-message">{message}</p>}

      <section className="employee-section">
        <div className="employee-section-head">
          <div>
            <h3>
              <Briefcase size={18} /> Offer letter
            </h3>
            <p>
              {employee?.offerAcceptedAt
                ? `Accepted on ${formatDate(employee.offerAcceptedAt)}`
                : employee?.offerLetterUrl
                  ? "Review and accept your offer below"
                  : "Sent once documents are verified"}
            </p>
          </div>
        </div>

        {loading ? (
          <p>Loading…</p>
        ) : !employee?.offerLetterUrl ? (
          <p className="admin-empty">No offer has been sent yet.</p>
        ) : (
          <>
            <div className="admin-form-actions">
              <a className="btn btn-outline btn-sm" href={employee.offerLetterUrl} target="_blank" rel="noreferrer">
                View offer letter
              </a>
              <a className="btn btn-outline btn-sm" href={employee.joiningLetterUrl} target="_blank" rel="noreferrer">
                View joining letter
              </a>
            </div>

            {employee.status === "offer_sent" && (
              <div className="admin-form-actions">
                <button type="button" className="btn btn-primary btn-sm" onClick={handleAccept} disabled={accepting}>
                  <CheckCircle2 size={14} /> {accepting ? "Accepting…" : "Accept offer"}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default PortalOfferPage;
