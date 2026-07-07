import { motion } from "framer-motion";

const SectionHeader = ({ label, title, subtitle, center = true }) => {
  return (
    <motion.div
      className={`section-header ${center ? "section-header-center" : ""}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55 }}
    >
      {label && <span className="section-label">{label}</span>}
      {title && <h2 className="section-title">{title}</h2>}
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </motion.div>
  );
};

export default SectionHeader;
