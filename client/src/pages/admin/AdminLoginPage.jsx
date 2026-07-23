import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Mail } from "lucide-react";
import { adminLogin } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import BrandLogo from "../../components/ui/BrandLogo";
import LoginCodeBackground from "../../components/admin/LoginCodeBackground";
import { loginSchema } from "../../lib/validation";
import { firstZodError } from "../../lib/zodHelpers";

const AdminLoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from || "/admin/dashboard";

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
      const { token, admin } = await adminLogin(email, password);
      login(token, admin);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-page">
      <LoginCodeBackground />

      <motion.div
        className="admin-login-center"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="admin-login-card">
          <Link to="/" className="admin-login-back">
            <ArrowLeft size={18} /> Back to website
          </Link>

          <div className="admin-login-card-brand">
            <BrandLogo variant="logo" />
            <div>
              <strong>Nutri Solutions</strong>
              <span>Admin portal</span>
            </div>
          </div>

          <div className="admin-login-card-head">
            <h1>Sign in</h1>
            <p>Manage projects, blogs, and tech stack content.</p>
          </div>

          <form className="admin-login-form" onSubmit={handleSubmit}>
            {error && (
              <motion.div
                className="admin-login-error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
              >
                {error}
              </motion.div>
            )}

            <div className="admin-login-field">
              <label htmlFor="admin-email">Email address</label>
              <div className="admin-login-input-wrap">
                <Mail size={18} aria-hidden="true" />
                <input
                  id="admin-email"
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
              <label htmlFor="admin-password">Password</label>
              <div className="admin-login-input-wrap">
                <Lock size={18} aria-hidden="true" />
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              className="btn btn-primary admin-login-submit"
              disabled={submitting}
              whileHover={{ scale: submitting ? 1 : 1.02 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
            >
              {submitting ? "Signing in…" : "Sign in to dashboard"}
            </motion.button>
          </form>

          <p className="admin-login-footer-note">Authorized team members only</p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
