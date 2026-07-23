import { motion } from "framer-motion";
import { Layers, LineChart, Shield } from "lucide-react";
import SectionHeader from "./ui/SectionHeader";
import AnimatedStatValue from "./ui/AnimatedStatValue";
import { whyUsItems, defaultStats } from "../data/content";

const icons = [Layers, LineChart, Shield];

const WhyUsSection = ({ stats = defaultStats }) => {
  return (
    <section id="why-us" className="section">
      <div className="container">
        <SectionHeader
          label="Why choose us"
          title="Turning every engagement into meaningful business value"
          subtitle="We combine engineering excellence with business-focused delivery — so your investment translates into real impact."
        />

        <div className="why-grid">
          {whyUsItems.map((item, index) => {
            const Icon = icons[index];
            return (
              <motion.div
                key={item.title}
                className="why-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="why-icon">
                  <Icon size={22} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="stats-row">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="stat-pill"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12 }}
            >
              <h3>
                <AnimatedStatValue value={stat.value} />
              </h3>
              <p>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
