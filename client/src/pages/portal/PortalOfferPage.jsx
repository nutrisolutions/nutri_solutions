import { useCallback, useEffect, useState } from "react";
import { employeeAcceptOffer, employeeOffer } from "../../lib/api";

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

      {loading ? (
        <p>Loading…</p>
      ) : !employee?.offerLetterUrl ? (
        <p className="admin-empty">No offer has been sent yet.</p>
      ) : (
        <div className="admin-form-card">
          <div className="admin-form-actions">
            <a className="btn btn-outline" href={employee.offerLetterUrl} target="_blank" rel="noreferrer">
              View offer letter
            </a>
            <a className="btn btn-outline" href={employee.joiningLetterUrl} target="_blank" rel="noreferrer">
              View joining letter
            </a>
          </div>

          {employee.status === "offer_sent" && (
            <div className="admin-form-actions">
              <button type="button" className="btn btn-primary" onClick={handleAccept} disabled={accepting}>
                {accepting ? "Accepting…" : "Accept offer"}
              </button>
            </div>
          )}

          {employee.offerAcceptedAt && (
            <p>Accepted on {new Date(employee.offerAcceptedAt).toLocaleString()}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PortalOfferPage;
