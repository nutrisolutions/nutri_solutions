import { motion } from "framer-motion";

const PageHero = ({ label, title, subtitle, image }) => {
  return (
    <section id="page-hero" className="page-hero">
      <div className="page-hero-bg" aria-hidden="true" />
      {image && (
        <div className="page-hero-image" aria-hidden="true">
          <img src={image} alt="" loading="eager" />
          <div className="page-hero-image-overlay" />
        </div>
      )}

      <div className="container page-hero-inner">
        <motion.span
          className="section-label"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {label}
        </motion.span>
        <motion.h1
          className="page-hero-title"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.55 }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            className="page-hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.5 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
};

export default PageHero;
