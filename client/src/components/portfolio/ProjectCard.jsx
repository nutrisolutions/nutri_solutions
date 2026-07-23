import { motion } from "framer-motion";
import { ArrowUpRight, Globe, Landmark, Palette, Smartphone, CloudCog } from "lucide-react";
import { Link } from "react-router-dom";

const typeIcons = {
  "Web Application": Globe,
  "Mobile Application": Smartphone,
  "Custom Software": Landmark,
  "Cloud & DevOps": CloudCog,
  "UI/UX Design": Palette
};

const ProjectCard = ({ project, index = 0 }) => {
  const Icon = typeIcons[project.applicationType] || Globe;

  return (
    <motion.article
      className="project-card"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      whileHover={{ y: -8 }}
    >
      <Link to={`/projects/${project.slug}`} className="project-card-link">
        <div className="project-card-media">
          <img src={project.image} alt={project.title} loading="lazy" />
          <div className="project-card-media-overlay" />
          <span className="project-type-badge">
            <Icon size={14} />
            {project.applicationType}
          </span>
        </div>
        <div className="project-card-body">
          <h3>{project.title}</h3>
          <p>{project.shortDescription || project.description}</p>
          <span className="project-card-cta">
            View project <ArrowUpRight size={16} />
          </span>
        </div>
      </Link>
    </motion.article>
  );
};

export default ProjectCard;
