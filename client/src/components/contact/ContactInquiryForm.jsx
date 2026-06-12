import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { contactPageContent } from "../../data/content";
import { submitContactInquiry } from "../../lib/api";

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  company: "",
  topic: "",
  message: ""
};

const ContactInquiryForm = () => {
  const { form } = contactPageContent;
  const [fields, setFields] = useState(emptyForm);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    try {
      await submitContactInquiry(fields);
      setStatus("success");
      setFields(emptyForm);
    } catch (err) {
      setStatus("error");
      setError(err.response?.data?.message || "Could not send your message. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="contact-inquiry-card contact-inquiry-success">
        <h3>Message received</h3>
        <p>
          Thank you for reaching out. Our team will review your inquiry and respond within one business
          day.
        </p>
        <button type="button" className="btn btn-outline" onClick={() => setStatus("idle")}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <motion.form
      className="contact-inquiry-card contact-inquiry-form contact-form"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onSubmit={handleSubmit}
      noValidate
    >
      <header className="contact-inquiry-header">
        <h2 className="contact-inquiry-title">{form.title}</h2>
        <p className="contact-inquiry-subtitle">{form.subtitle}</p>
      </header>

      <div className="contact-inquiry-fields">
        <label htmlFor="contact-fullName">
          <span className="contact-inquiry-label">
            Full name <span className="contact-inquiry-required" aria-hidden="true">*</span>
          </span>
          <input
            id="contact-fullName"
            name="fullName"
            value={fields.fullName}
            onChange={handleChange}
            required
            autoComplete="name"
            placeholder="Your full name"
          />
        </label>

        <label htmlFor="contact-email">
          <span className="contact-inquiry-label">
            Work email <span className="contact-inquiry-required" aria-hidden="true">*</span>
          </span>
          <input
            id="contact-email"
            name="email"
            type="email"
            value={fields.email}
            onChange={handleChange}
            required
            autoComplete="email"
            placeholder="you@company.com"
          />
        </label>

        <label htmlFor="contact-phone">
          <span className="contact-inquiry-label">Phone</span>
          <div className="contact-inquiry-phone">
            <span className="contact-inquiry-phone-prefix" aria-hidden="true">
              +91
            </span>
            <input
              id="contact-phone"
              name="phone"
              type="tel"
              value={fields.phone}
              onChange={handleChange}
              autoComplete="tel"
              placeholder="98765 43210"
            />
          </div>
        </label>

        <label htmlFor="contact-company">
          <span className="contact-inquiry-label">Company</span>
          <input
            id="contact-company"
            name="company"
            value={fields.company}
            onChange={handleChange}
            autoComplete="organization"
            placeholder="Your organization"
          />
        </label>

        <label htmlFor="contact-topic" className="contact-inquiry-span-2">
          <span className="contact-inquiry-label">
            Project type <span className="contact-inquiry-required" aria-hidden="true">*</span>
          </span>
          <select
            id="contact-topic"
            name="topic"
            value={fields.topic}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Select a category
            </option>
            {form.topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="contact-message" className="contact-inquiry-span-2">
          <span className="contact-inquiry-label">
            Project details <span className="contact-inquiry-required" aria-hidden="true">*</span>
          </span>
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            value={fields.message}
            onChange={handleChange}
            required
            placeholder="Goals, timeline, budget range, and any technical preferences..."
          />
        </label>
      </div>

      {error && <p className="contact-inquiry-error">{error}</p>}

      <button
        type="submit"
        className="btn btn-primary btn-block contact-inquiry-submit"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Sending…" : "Request Free Demo"} <Send size={18} />
      </button>
    </motion.form>
  );
};

export default ContactInquiryForm;
