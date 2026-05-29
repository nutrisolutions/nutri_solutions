import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Code2, Shield, Target, Users } from "lucide-react";
import SectionHeader from "./ui/SectionHeader";
import AnimatedStatValue from "./ui/AnimatedStatValue";
import { aboutContent } from "../data/content";

const valueIcons = { Target, Code2, Users, Shield };

const AboutSection = ({ hideHeader = false }) => {
  const { images, stats, values, highlights, paragraphs } = aboutContent;

  return (
    <section id="about" className={`section about-section ${hideHeader ? "section-compact-top" : ""}`}>
      <div className="about-bg-glow" aria-hidden="true" />

      <div className="container">
        {!hideHeader && (
          <SectionHeader
            label={aboutContent.badge}
            title={aboutContent.heading}
            subtitle="We combine strategy, design, and engineering to help companies launch and scale digital products with confidence."
          />
        )}

        <div className="about-bento">
          {/* Visual collage */}
          <motion.div
            className="about-visual"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="about-visual-main">
              <img src={images.main} alt="Software team collaborating in modern office" loading="lazy" />
              <div className="about-visual-gradient" />
            </div>

            <motion.div
              className="about-visual-float about-visual-float-team about-float-a"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <img src={images.team} alt="Development team meeting" loading="lazy" />
            </motion.div>

            <motion.div
              className="about-visual-float about-visual-float-code about-float-b"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <img src={images.workspace} alt="Software development workspace" loading="lazy" />
            </motion.div>

            <motion.div
              className="about-experience-badge"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35, type: "spring" }}
            >
              <AnimatedStatValue value="8+" className="about-experience-value" />
              <span className="about-experience-label">Years building software products</span>
            </motion.div>
          </motion.div>

          {/* Story + highlights */}
          <motion.div
            className="about-story"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            {paragraphs.map((text, i) => (
              <p key={i} className="about-text">
                {text}
              </p>
            ))}

            <div className="about-highlights-card">
              <h3>What sets us apart</h3>
              <ul>
                {highlights.map((item) => (
                  <li key={item}>
                    <Check size={18} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/contact" className="about-cta-link">
                Work with our team <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>

          {/* Stats strip */}
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="about-stat-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <AnimatedStatValue value={stat.value} className="about-stat-value" />
              <span className="about-stat-label">{stat.label}</span>
            </motion.div>
          ))}

          {/* Value cards */}
          {values.map((item, i) => {
            const Icon = valueIcons[item.icon] || Target;
            return (
              <motion.article
                key={item.title}
                className="about-value-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
              >
                <div className="about-value-icon">
                  <Icon size={22} />
                </div>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
