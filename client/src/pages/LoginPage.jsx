import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { unifiedLogin } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useEmployeeAuth } from "../context/EmployeeAuthContext";
import BrandLogo from "../components/ui/BrandLogo";
import { loginSchema } from "../lib/validation";
import { firstZodError } from "../lib/zodHelpers";

const LoginPage = () => {
  const { login: adminLoginIn } = useAuth();
  const { login: employeeLoginIn } = useEmployeeAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      const data = await unifiedLogin(email, password);
      if (data.account === "admin") {
        adminLoginIn(data.token, data.admin);
        navigate("/admin", { replace: true });
      } else {
        employeeLoginIn(data.token);
        navigate(data.mustSetPassword ? "/portal/set-password" : "/portal/dashboard", { replace: true });
      }
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
              <span>Sign in</span>
            </div>
          </div>

          <div className="admin-login-card-head">
            <h1>Sign in</h1>
            <p>Employees and admins can sign in here with their account email and password.</p>
          </div>

          <form className="admin-login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="admin-login-error" role="alert">
                {error}
              </div>
            )}

            <div className="admin-login-field">
              <label htmlFor="login-email">Email address</label>
              <div className="admin-login-input-wrap">
                <Mail size={18} aria-hidden="true" />
                <input
                  id="login-email"
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
              <label htmlFor="login-password">Password</label>
              <div className="admin-login-input-wrap">
                <Lock size={18} aria-hidden="true" />
                <input
                  id="login-password"
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

export default LoginPage;
