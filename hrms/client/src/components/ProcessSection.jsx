import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Code2, PenTool, Rocket, Search } from "lucide-react";
import SectionHeader from "./ui/SectionHeader";
import { processContent } from "../data/content";

const stepIcons = { Search, PenTool, Code2, Rocket };

const ProcessSection = ({ hideHeader = false }) => {
  const { aside, steps } = processContent;

  return (
    <section id="process" className={`section process-section ${hideHeader ? "section-compact-top" : ""}`}>
      <div className="process-bg-glow" aria-hidden="true" />

      <div className="container">
        {!hideHeader && (
          <SectionHeader
            label="OUR PROCESS"
            title="How we deliver successful software projects"
            subtitle="A proven agile workflow that reduces risk, improves visibility, and accelerates time-to-market."
          />
        )}

        <div className="process-layout">
          <motion.aside
            className="process-aside"
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55 }}
          >
            <div className="process-aside-card">
              <span className="process-aside-badge">Agile delivery</span>
              <h3>{aside.title}</h3>
              <p>{aside.description}</p>
              <ul className="process-aside-list">
                {aside.highlights.map((item) => (
                  <li key={item}>
                    <Check size={18} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/contact" className="process-aside-cta">
                {aside.cta} <ArrowRight size={18} />
              </Link>
            </div>

            <div className="process-aside-visual" aria-hidden="true">
              <img src={aside.image} alt="" loading="lazy" />
              <div className="process-aside-visual-overlay" />
              <span className="process-aside-visual-caption">Sprint planning & delivery</span>
            </div>
          </motion.aside>

          <div className="process-timeline">
            <div className="process-timeline-rail" aria-hidden="true">
              <motion.div
                className="process-timeline-fill"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>

            {steps.map((item, index) => {
              const Icon = stepIcons[item.icon] || Code2;
              return (
                <motion.article
                  key={item.step}
                  className="process-step"
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <div className="process-step-marker">
                    <span className="process-step-num">{item.step}</span>
                    <div className="process-step-icon">
                      <Icon size={22} />
                    </div>
                  </div>

                  <div className="process-step-card">
                    <div className="process-step-card-head">
                      <h3>{item.title}</h3>
                      {item.tag && <span className="process-step-tag">{item.tag}</span>}
                    </div>
                    <p>{item.description}</p>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
