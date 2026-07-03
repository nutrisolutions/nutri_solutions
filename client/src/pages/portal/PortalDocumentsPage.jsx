import { useCallback, useEffect, useState } from "react";
import { Briefcase, FileText, TrendingUp, Upload } from "lucide-react";
import { employeeMyCompanyDocuments, employeeMyDocuments, employeeUploadDocument } from "../../lib/api";
import { useEmployeeAuth } from "../../context/EmployeeAuthContext";

const DOC_STATUS_META = {
  pending: { label: "Pending", pill: "neutral" },
  uploaded: { label: "Uploaded", pill: "info" },
  verified: { label: "Verified", pill: "success" },
  rejected: { label: "Rejected", pill: "danger" }
};

const formatPeriod = (doc) =>
  doc.periodMonth && doc.periodYear
    ? new Date(doc.periodYear, doc.periodMonth - 1).toLocaleDateString(undefined, { year: "numeric", month: "long" })
    : "";

const PortalDocumentsPage = () => {
  const { employee } = useEmployeeAuth();
  const isPermanent = employee?.employmentType === "permanent";

  const [documents, setDocuments] = useState([]);
  const [companyDocuments, setCompanyDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [uploadingId, setUploadingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (isPermanent) {
        setCompanyDocuments(await employeeMyCompanyDocuments());
      }
      setDocuments(await employeeMyDocuments());
    } catch {
      setMessage("Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [isPermanent]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = async (docId, file) => {
    if (!file) return;
    setUploadingId(docId);
    setMessage("");
    try {
      await employeeUploadDocument(docId, file);
      setMessage("Document uploaded");
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Upload failed");
    } finally {
      setUploadingId(null);
    }
  };

  const appraisals = companyDocuments.filter((d) => d.type === "appraisal_letter");
  const payslips = companyDocuments.filter((d) => d.type === "payslip");

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Documents</h1>
          <p>
            {isPermanent
              ? "Your offer letter, appraisal letters, and monthly payslips."
              : "Upload the documents requested by HR. Rejected documents can be re-uploaded."}
          </p>
        </div>
      </header>

      {message && <p className="admin-message">{message}</p>}

      {isPermanent && (
        <>
          <section className="employee-section">
            <div className="employee-section-head">
              <div>
                <h3>
                  <Briefcase size={18} /> Offer &amp; joining letters
                </h3>
              </div>
            </div>
            {employee?.offerLetterUrl ? (
              <div className="admin-form-actions">
                <a className="btn btn-outline btn-sm" href={employee.offerLetterUrl} target="_blank" rel="noreferrer">
                  View offer letter
                </a>
                {employee?.joiningLetterUrl && (
                  <a className="btn btn-outline btn-sm" href={employee.joiningLetterUrl} target="_blank" rel="noreferrer">
                    View joining letter
                  </a>
                )}
              </div>
            ) : (
              <p className="admin-empty">No offer letter on file.</p>
            )}
          </section>

          <section className="employee-section">
            <div className="employee-section-head">
              <div>
                <h3>
                  <TrendingUp size={18} /> Appraisal letters
                </h3>
                <p>{appraisals.length ? `${appraisals.length} letter(s)` : "None yet"}</p>
              </div>
            </div>
            {appraisals.length > 0 && (
              <div className="employee-doc-grid">
                {appraisals.map((doc) => (
                  <div key={doc._id} className="employee-doc-card">
                    <div className="employee-doc-card-head">
                      <strong>
                        <FileText size={15} /> {doc.label}
                      </strong>
                    </div>
                    <a className="employee-doc-link" href={doc.fileUrl} target="_blank" rel="noreferrer">
                      View letter
                    </a>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="employee-section">
            <div className="employee-section-head">
              <div>
                <h3>
                  <FileText size={18} /> Payslips
                </h3>
                <p>{payslips.length ? `${payslips.length} payslip(s)` : "None yet"}</p>
              </div>
            </div>
            {payslips.length > 0 && (
              <div className="employee-doc-grid">
                {payslips.map((doc) => (
                  <div key={doc._id} className="employee-doc-card">
                    <div className="employee-doc-card-head">
                      <strong>
                        <FileText size={15} /> {doc.label}
                      </strong>
                    </div>
                    {formatPeriod(doc) && <p>{formatPeriod(doc)}</p>}
                    <a className="employee-doc-link" href={doc.fileUrl} target="_blank" rel="noreferrer">
                      View payslip
                    </a>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <section className="employee-section">
        <div className="employee-section-head">
          <div>
            <h3>
              <FileText size={18} /> {isPermanent ? "Verification documents (on file)" : "Requested documents"}
            </h3>
            <p>{documents.length ? `${documents.length} document(s)` : "No documents requested yet"}</p>
          </div>
        </div>

        {loading ? (
          <p>Loading…</p>
        ) : documents.length === 0 ? (
          <p className="admin-empty">No documents requested yet.</p>
        ) : (
          <div className="employee-doc-grid">
            {documents.map((doc) => {
              const canUpload = !isPermanent && (doc.status === "pending" || doc.status === "rejected");
              return (
                <div key={doc._id} className="employee-doc-card">
                  <div className="employee-doc-card-head">
                    <strong>
                      <FileText size={15} /> {doc.label}
                    </strong>
                    <span className={`status-pill status-pill--${DOC_STATUS_META[doc.status]?.pill || "neutral"}`}>
                      {DOC_STATUS_META[doc.status]?.label || doc.status}
                    </span>
                  </div>
                  {doc.status === "rejected" && doc.rejectionReason && (
                    <p className="employee-doc-reason">Reason: {doc.rejectionReason}</p>
                  )}
                  {doc.fileUrl && (
                    <a className="employee-doc-link" href={doc.fileUrl} target="_blank" rel="noreferrer">
                      View uploaded file
                    </a>
                  )}
                  {canUpload && (
                    <label className="btn btn-outline btn-sm" style={{ alignSelf: "flex-start" }}>
                      <Upload size={14} /> {doc.status === "rejected" ? "Re-upload" : "Upload"}
                      <input
                        type="file"
                        style={{ display: "none" }}
                        disabled={uploadingId === doc._id}
                        onChange={(e) => handleUpload(doc._id, e.target.files?.[0])}
                      />
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default PortalDocumentsPage;
