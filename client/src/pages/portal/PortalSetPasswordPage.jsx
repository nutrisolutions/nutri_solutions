import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { employeeSetPassword } from "../../lib/api";
import { useEmployeeAuth } from "../../context/EmployeeAuthContext";
import { setPasswordSchema } from "../../lib/validation";
import { firstZodError } from "../../lib/zodHelpers";

const PortalSetPasswordPage = () => {
  const { refresh } = useEmployeeAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = firstZodError(setPasswordSchema, { currentPassword, newPassword, confirmPassword });
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await employeeSetPassword(currentPassword, newPassword);
      await refresh();
      navigate("/portal/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to set password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-center">
        <div className="admin-login-card">
          <div className="admin-login-card-head">
            <h1>Set your password</h1>
            <p>
              You've been converted to a permanent employee — set your own password to continue. Use your current
              password below.
            </p>
          </div>

          <form className="admin-login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="admin-login-error" role="alert">
                {error}
              </div>
            )}

            <div className="admin-login-field">
              <label htmlFor="current-password">Current password</label>
              <div className="admin-login-input-wrap">
                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="admin-login-field">
              <label htmlFor="new-password">New password</label>
              <div className="admin-login-input-wrap">
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="admin-login-field">
              <label htmlFor="confirm-password">Confirm new password</label>
              <div className="admin-login-input-wrap">
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary admin-login-submit" disabled={submitting}>
              {submitting ? "Saving…" : "Set password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PortalSetPasswordPage;
