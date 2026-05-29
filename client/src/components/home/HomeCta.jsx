import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { homeCta } from "../../data/content";

const HomeCta = () => {
  return (
    <section id="cta" className="section home-cta-section">
      <div className="container">
        <motion.div
          className="home-cta-card"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55 }}
        >
          <div className="home-cta-copy">
            <h2>{homeCta.title}</h2>
            <p>{homeCta.subtitle}</p>
          </div>
          <div className="home-cta-actions">
            <Link to={homeCta.primary.to} className="btn btn-primary">
              {homeCta.primary.label} <ArrowRight size={18} />
            </Link>
            <Link to={homeCta.secondary.to} className="btn btn-outline">
              {homeCta.secondary.label}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HomeCta;
