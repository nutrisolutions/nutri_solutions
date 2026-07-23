import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Globe } from "lucide-react";
import { fetchProject } from "../lib/api";
import ProjectScreenshotCarousel from "../components/project/ProjectScreenshotCarousel";
import { pageSeo } from "../data/content";

const ProjectDetailPage = () => {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchProject(slug);
        setProject(data);
        document.title = `${data.title} | Nutri Solutions`;
      } catch {
        setError("Project not found");
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => {
      document.title = pageSeo.home.title;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="project-detail-page">
        <div className="container project-detail-loading">Loading project…</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="project-detail-page">
        <div className="container project-detail-error">
          <h1>Project not found</h1>
          <Link to="/projects" className="btn btn-primary">
            Back to projects
          </Link>
        </div>
      </div>
    );
  }

  const banner = project.banner || project.image;

  return (
    <div className="project-detail-page">
      <section id="project-banner" className="project-detail-banner">
        <img src={banner} alt="" aria-hidden="true" />
        <div className="project-detail-banner-overlay" />
        <div className="container project-detail-banner-top">
          <Link to="/projects" className="project-back-link">
            <ArrowLeft size={18} /> All projects
          </Link>
        </div>
        <div className="container project-detail-banner-content">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="project-detail-type">{project.applicationType}</span>
            <h1>{project.title}</h1>
          </motion.div>
        </div>
      </section>

      <div className="container project-detail-body">
        <motion.section
          id="project-intro"
          className="project-detail-intro"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <p className="project-detail-lead">{project.shortDescription}</p>
          <div className="project-detail-description">
            {project.description.split("\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </motion.section>

        {project.techStack?.length > 0 && (
          <motion.section
            id="project-tech"
            className="project-detail-tech"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2>
              <Globe size={22} /> Tech stack
            </h2>
            <div className="project-tech-pills">
              {project.techStack.map((tech) => (
                <span key={tech} className="tech-pill">
                  {tech}
                </span>
              ))}
            </div>
          </motion.section>
        )}

      </div>

      <motion.section
        id="project-gallery"
        className="project-detail-gallery"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="container">
          <h2>Screenshots</h2>
        </div>
        <ProjectScreenshotCarousel screenshots={project.screenshots} />
      </motion.section>

      <div className="container project-detail-body project-detail-body--after-gallery">
        <div className="project-detail-cta">
          <Link to="/contact" className="btn btn-primary">
            Start a similar project
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
