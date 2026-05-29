import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SectionHeader from "./ui/SectionHeader";
import ProjectCard from "./portfolio/ProjectCard";
import useProjects from "../hooks/useProjects";

const PortfolioSection = ({ hideHeader = false, featured = false, limit, showViewAll = true }) => {
  const { projects, loading } = useProjects({ featured, limit });

  return (
    <section id="projects" className={`section section-muted portfolio-section ${hideHeader ? "section-compact-top" : ""}`}>
      <div className="container">
        {!hideHeader && (
          <SectionHeader
            label="Our work"
            title="Proven software results for growing businesses"
            subtitle="Case studies across web, mobile, and enterprise — click any project for the full story."
          />
        )}

        {loading ? (
          <div className="project-grid project-grid-loading">
            {[1, 2, 3].map((n) => (
              <div key={n} className="project-card-skeleton" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <p className="blog-empty">No projects yet. Check back soon.</p>
        ) : (
          <div className="project-grid">
            {projects.map((project, index) => (
              <ProjectCard key={project._id || project.slug} project={project} index={index} />
            ))}
          </div>
        )}

        {showViewAll && (
          <div className="portfolio-section-footer">
            <Link to="/projects" className="btn btn-outline">
              View all projects <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default PortfolioSection;
