import { useState } from "react";
import { Send } from "lucide-react";
import { submitCareerApplication } from "../../lib/api";

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  linkedIn: "",
  portfolioUrl: "",
  resumeUrl: "",
  yearsExperience: "",
  coverLetter: ""
};

const CareerApplyForm = ({ slug, positionTitle }) => {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    try {
      await submitCareerApplication(slug, form);
      setStatus("success");
      setForm(emptyForm);
    } catch (err) {
      setStatus("error");
      setError(err.response?.data?.message || "Could not submit application. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="career-apply-card career-apply-success">
        <h3>Application received</h3>
        <p>
          Thank you for applying for <strong>{positionTitle}</strong>. Our team will review your
          application and get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form className="career-apply-card career-apply-form contact-form" onSubmit={handleSubmit} noValidate>
      <header className="career-apply-header">
        <h3 id="career-apply-heading" className="career-apply-title">
          Apply for this role
        </h3>
        <p className="career-apply-subtitle">Fields marked with * are required.</p>
      </header>

      <div className="career-apply-fields">
        <label htmlFor="career-fullName">
          <span className="career-apply-label">
            Full name <span className="career-apply-required" aria-hidden="true">*</span>
          </span>
          <input
            id="career-fullName"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
            autoComplete="name"
            placeholder="Your full name"
          />
        </label>

        <label htmlFor="career-email">
          <span className="career-apply-label">
            Email <span className="career-apply-required" aria-hidden="true">*</span>
          </span>
          <input
            id="career-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
            placeholder="you@email.com"
          />
        </label>

        <label htmlFor="career-phone">
          <span className="career-apply-label">
            Phone <span className="career-apply-required" aria-hidden="true">*</span>
          </span>
          <div className="career-apply-phone">
            <span className="career-apply-phone-prefix" aria-hidden="true">
              +91
            </span>
            <input
              id="career-phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              required
              autoComplete="tel"
              placeholder="98765 43210"
            />
          </div>
        </label>

        <label htmlFor="career-experience">
          <span className="career-apply-label">Years of experience</span>
          <input
            id="career-experience"
            name="yearsExperience"
            value={form.yearsExperience}
            onChange={handleChange}
            placeholder="e.g. 3 years"
          />
        </label>

        <label htmlFor="career-linkedin">
          <span className="career-apply-label">LinkedIn</span>
          <input
            id="career-linkedin"
            name="linkedIn"
            type="url"
            value={form.linkedIn}
            onChange={handleChange}
            autoComplete="url"
            placeholder="https://linkedin.com/in/username"
          />
        </label>

        <label htmlFor="career-portfolio">
          <span className="career-apply-label">Portfolio / GitHub</span>
          <input
            id="career-portfolio"
            name="portfolioUrl"
            type="url"
            value={form.portfolioUrl}
            onChange={handleChange}
            autoComplete="url"
            placeholder="https://github.com/username"
          />
        </label>

        <label htmlFor="career-resume" className="career-apply-span-2">
          <span className="career-apply-label">Resume link (PDF / Google Drive)</span>
          <input
            id="career-resume"
            name="resumeUrl"
            type="url"
            value={form.resumeUrl}
            onChange={handleChange}
            placeholder="https://drive.google.com/…"
          />
          <span className="career-apply-hint">Share a viewable link — optional but recommended.</span>
        </label>

        <label htmlFor="career-cover" className="career-apply-span-2">
          <span className="career-apply-label">
            Cover letter <span className="career-apply-required" aria-hidden="true">*</span>
          </span>
          <textarea
            id="career-cover"
            name="coverLetter"
            rows={5}
            value={form.coverLetter}
            onChange={handleChange}
            required
            placeholder="Tell us why you're a great fit for this role…"
          />
        </label>
      </div>

      {error && (
        <p className="career-apply-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="btn btn-primary btn-block career-apply-submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Submitting…" : "Submit application"} <Send size={18} aria-hidden="true" />
      </button>
    </form>
  );
};

export default CareerApplyForm;
