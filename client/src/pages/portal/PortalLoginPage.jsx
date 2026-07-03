import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { employeeLogin } from "../../lib/api";
import { useEmployeeAuth } from "../../context/EmployeeAuthContext";
import BrandLogo from "../../components/ui/BrandLogo";
import { loginSchema } from "../../lib/validation";
import { firstZodError } from "../../lib/zodHelpers";

const PortalLoginPage = () => {
  const { login, isAuthenticated } = useEmployeeAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from || "/portal/dashboard";

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = firstZodError(loginSchema, { email, password });
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const { token } = await employeeLogin(email, password);
      login(token);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-center">
        <div className="admin-login-card">
          <Link to="/" className="admin-login-back">
            Back to website
          </Link>

          <div className="admin-login-card-brand">
            <BrandLogo variant="logo" />
            <div>
              <strong>Nutri Solutions</strong>
              <span>Employee portal</span>
            </div>
          </div>

          <div className="admin-login-card-head">
            <h1>Sign in</h1>
            <p>Use the credentials HR shared with you.</p>
          </div>

          <form className="admin-login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="admin-login-error" role="alert">
                {error}
              </div>
            )}

            <div className="admin-login-field">
              <label htmlFor="employee-email">Email address</label>
              <div className="admin-login-input-wrap">
                <Mail size={18} aria-hidden="true" />
                <input
                  id="employee-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="admin-login-field">
              <label htmlFor="employee-password">Password</label>
              <div className="admin-login-input-wrap">
                <Lock size={18} aria-hidden="true" />
                <input
                  id="employee-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary admin-login-submit" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PortalLoginPage;
