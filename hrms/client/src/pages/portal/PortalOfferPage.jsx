import { useCallback, useEffect, useState } from "react";
import { Briefcase, CheckCircle2, XCircle } from "lucide-react";
import { employeeAcceptOffer, employeeOffer, employeeRejectOffer } from "../../lib/api";
import { formatDate } from "../../lib/employeeStatus";

const PortalOfferPage = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

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

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      setMessage("Please provide a reason for rejecting the offer");
      return;
    }
    setRejecting(true);
    setMessage("");
    try {
      await employeeRejectOffer(rejectReason.trim());
      setMessage("Offer rejected");
      setShowRejectForm(false);
      setRejectReason("");
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to reject offer");
    } finally {
      setRejecting(false);
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
                : employee?.offerRejectedAt
                  ? `Rejected on ${formatDate(employee.offerRejectedAt)}`
                  : employee?.offerLetterUrl
                    ? "Review, then accept or reject your offer below"
                    : "Sent once documents are verified"}
            </p>
          </div>
        </div>

        {employee?.offerRejectedAt && employee?.offerRejectionReason && (
          <p className="admin-empty">Your stated reason: "{employee.offerRejectionReason}"</p>
        )}

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

            {employee.status === "offer_sent" && !showRejectForm && (
              <div className="admin-form-actions">
                <button type="button" className="btn btn-primary btn-sm" onClick={handleAccept} disabled={accepting || rejecting}>
                  <CheckCircle2 size={14} /> {accepting ? "Accepting…" : "Accept offer"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setShowRejectForm(true)}
                  disabled={accepting || rejecting}
                >
                  <XCircle size={14} /> Reject offer
                </button>
              </div>
            )}

            {employee.status === "offer_sent" && showRejectForm && (
              <form className="admin-form-card" onSubmit={handleReject} style={{ marginBottom: 0 }}>
                <label>
                  Reason for rejecting *
                  <textarea
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Let HR know why you're declining this offer"
                    required
                  />
                </label>
                <div className="admin-form-actions">
                  <button type="submit" className="btn btn-primary btn-sm" disabled={rejecting}>
                    <XCircle size={14} /> {rejecting ? "Rejecting…" : "Confirm rejection"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectReason("");
                    }}
                    disabled={rejecting}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default PortalOfferPage;
