import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SectionHeader from "./ui/SectionHeader";
import { fetchTechStack } from "../lib/api";
import { techStack as fallbackTech } from "../data/content";

const TechStackSection = ({ hideHeader = false }) => {
  const [techNames, setTechNames] = useState(fallbackTech);

  useEffect(() => {
    fetchTechStack()
      .then((items) => {
        if (items?.length) setTechNames(items.map((i) => i.name));
      })
      .catch(() => {});
  }, []);

  const row = [...techNames, ...techNames];

  return (
    <section id="tech-stack" className={`section ${hideHeader ? "section-compact-top" : ""}`}>
      <div className="container">
        {!hideHeader && (
          <SectionHeader
            label="Tech stack"
            title="Modern tools for reliable software development"
            subtitle="We use industry-proven technologies to build secure, scalable web, mobile, and cloud solutions."
          />
        )}
      </div>

      <div className="marquee-wrap">
        <motion.div
          className="marquee-track"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
        >
          {row.map((tech, i) => (
            <span key={`${tech}-${i}`} className="tech-pill">
              {tech}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TechStackSection;
