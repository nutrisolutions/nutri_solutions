import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SectionHeader from "../ui/SectionHeader";
import { homeExplore } from "../../data/content";

const HomeExplore = () => {
  return (
    <section id="explore" className="section home-explore-section">
      <div className="container">
        <SectionHeader
          label="Explore"
          title="Everything on our website at a glance"
          subtitle="Quick links to every section — about, services, projects, blog, and contact."
        />

        <div className="home-explore-grid">
          {homeExplore.map((item, index) => (
            <motion.article
              key={item.to}
              className="home-explore-card"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              whileHover={{ y: -6 }}
            >
              <Link to={item.to} className="home-explore-card-link">
                <div className="home-explore-card-visual">
                  <img src={item.image} alt="" loading="lazy" />
                  <div className="home-explore-card-overlay" />
                </div>
                <div className="home-explore-card-body">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <span className="home-explore-cta">
                    {item.cta} <ArrowRight size={18} />
                  </span>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeExplore;
