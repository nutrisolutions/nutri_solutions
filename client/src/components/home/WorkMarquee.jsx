import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import ProjectDeviceMockup from "../mockups/ProjectDeviceMockup";
import useProjects from "../../hooks/useProjects";

const WorkMarquee = () => {
  const { projects, loading } = useProjects({ limit: 6 });

  if (loading || !projects.length) return null;

  const row = [...projects, ...projects];

  return (
    <section className="protoz-work-marquee" aria-label="Featured work">
      <p className="protoz-marquee-label">Trusted delivery across industries</p>
      <div className="protoz-marquee-track-wrap">
        <motion.div
          className="protoz-marquee-track"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        >
          {row.map((project, i) => (
            <Link key={`${project._id}-${i}`} to={`/projects/${project.slug}`} className="protoz-work-card">
              <div className="protoz-work-card-visual">
                <div className="protoz-work-card-mockup-slot">
                  <ProjectDeviceMockup project={project} />
                </div>
              </div>
              <div className="protoz-work-card-body">
                <span className="protoz-work-card-type">{project.applicationType}</span>
                <h3>{project.title}</h3>
                <p>{project.shortDescription}</p>
                <span className="protoz-work-card-link">See case study →</span>
              </div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default WorkMarquee;
