import { motion } from "framer-motion";
import { Code2, Shield, Target, Users } from "lucide-react";
import SectionHeader from "../ui/SectionHeader";
import AnimatedStatValue from "../ui/AnimatedStatValue";
import SectionPageLink from "./SectionPageLink";
import { aboutContent } from "../../data/content";

const valueIcons = { Target, Code2, Users, Shield };

const HomeAboutPreview = () => {
  const { paragraphs, stats, values, images } = aboutContent;

  return (
    <section id="about-preview" className="section home-about-preview">
      <div className="container">
        <SectionHeader
          label="About us"
          title={aboutContent.heading}
          subtitle="A brief look at who we are — strategy, engineering, and delivery focused on your business outcomes."
        />

        <div className="home-about-grid">
          <motion.div
            className="home-about-copy"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {paragraphs.map((text) => (
              <p key={text.slice(0, 40)}>{text}</p>
            ))}
            <ul className="home-about-highlights">
              {aboutContent.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <SectionPageLink to="/about">Learn more about us</SectionPageLink>
          </motion.div>

          <motion.div
            className="home-about-visual"
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <img src={images.main} alt="Nutri Solutions team" loading="lazy" />
          </motion.div>
        </div>

        <div className="home-stats-row">
          {stats.map((stat) => (
            <div key={stat.label} className="home-stat-card">
              <AnimatedStatValue value={stat.value} className="home-stat-value" />
              <span>{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="home-values-grid">
          {values.map((item, index) => {
            const Icon = valueIcons[item.icon] || Target;
            return (
              <motion.div
                key={item.title}
                className="home-value-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
              >
                <Icon size={22} />
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HomeAboutPreview;
