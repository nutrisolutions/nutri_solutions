import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PageHero from "../components/layout/PageHero";
import { legalPages } from "../data/content";

const LegalPage = ({ pageKey }) => {
  const page = legalPages[pageKey];
  if (!page) return null;

  const other =
    pageKey === "terms"
      ? { to: "/privacy-policy", label: "Privacy Policy" }
      : { to: "/terms", label: "Terms & Conditions" };

  return (
    <>
      <PageHero label={page.label} title={page.title} subtitle={page.intro} />
      <section className="section legal-page">
        <div className="container legal-page-inner">
          <p className="legal-updated">Last updated: {page.updated}</p>
          {page.sections.map((section) => (
            <article key={section.title} className="legal-section">
              <h2>{section.title}</h2>
              {section.paragraphs.map((text, i) => (
                <p key={`${section.title}-${i}`}>{text}</p>
              ))}
            </article>
          ))}
          <div className="legal-page-footer">
            <Link to={other.to} className="legal-cross-link">
              {other.label} →
            </Link>
            <Link to="/" className="project-back-link">
              <ArrowLeft size={18} /> Back to home
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default LegalPage;
