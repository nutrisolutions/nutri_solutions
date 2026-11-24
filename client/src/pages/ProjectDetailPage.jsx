import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Globe } from "lucide-react";
import { fetchProject, isNotFoundError } from "../lib/api";
import ProjectScreenshotCarousel from "../components/project/ProjectScreenshotCarousel";
import usePageSeo from "../hooks/usePageSeo";
import { breadcrumbSchema, canonicalUrl, fitTitle, ORG_ID, toDescription } from "../lib/seo";
import { responsiveImage } from "../lib/responsiveImage";

const projectSeo = (project, slug) => {
  const path = `/projects/${slug}`;
  const description = toDescription(project.shortDescription || project.description);
  return {
    title: fitTitle(
      `${project.title} — ${project.applicationType || "Software"} Case Study | Nutri Solutions`,
      `${project.title} Case Study | Nutri Solutions`,
      project.title
    ),
    description,
    image: project.banner || project.image || undefined,
    imageAlt: `${project.title} by Nutri Solutions`,
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: project.title,
        headline: `${project.title} — ${project.applicationType || "Software"} case study`,
        description,
        url: canonicalUrl(path),
        image: project.banner || project.image || undefined,
        genre: project.applicationType || undefined,
        keywords: Array.isArray(project.techStack) ? project.techStack.join(", ") : undefined,
        creator: { "@id": ORG_ID },
        dateModified: project.updatedAt || undefined
      },
      breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Projects", path: "/projects" },
        { name: project.title, path }
      ])
    ]
  };
};

const ProjectDetailPage = () => {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      setMissing(false);
      try {
        const data = await fetchProject(slug);
        setProject(data);
      } catch (err) {
        setError("Project not found");
        setMissing(isNotFoundError(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  // On a transient API failure, leave the (prerendered) head alone instead of marking it noindex.
  usePageSeo(
    loading
      ? null
      : project && !error
        ? projectSeo(project, slug)
        : missing
          ? {
              title: "Project not found | Nutri Solutions",
              description: "This project could not be found. Browse all Nutri Solutions software projects.",
              noindex: true
            }
          : null
  );

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
        <img {...responsiveImage(banner, "full")} alt="" aria-hidden="true" />
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
            {project.liveDemoAvailable && project.liveDemoLink && (
              <a
                href={project.liveDemoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary project-detail-live-demo"
              >
                <Globe size={18} /> View Live Demo
              </a>
            )}
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
