import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import usePageSeo from "../hooks/usePageSeo";

const NotFoundPage = () => {
  usePageSeo({
    title: "Page not found | Nutri Solutions",
    description: "The page you're looking for doesn't exist or has moved. Explore Nutri Solutions services, projects and blog.",
    noindex: true
  });

  return (
    <section className="section legal-page">
      <div className="container legal-page-inner">
        <h1>Page not found</h1>
        <p>The page you're looking for doesn't exist or has moved.</p>
        <div className="legal-page-footer">
          <Link to="/services" className="legal-cross-link">
            Our services →
          </Link>
          <Link to="/" className="project-back-link">
            <ArrowLeft size={18} /> Back to home
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NotFoundPage;
