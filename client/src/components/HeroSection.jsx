import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import HeroAppMockup from "./hero/HeroAppMockup";

const HeroSection = ({ company }) => {
  return (
    <section id="home" className="protoz-hero">
      <div className="protoz-hero-bg" aria-hidden="true">
        <div className="protoz-hero-orb protoz-hero-orb-1" />
        <div className="protoz-hero-orb protoz-hero-orb-2" />
        <div className="protoz-hero-orb protoz-hero-orb-3" />
        <div className="protoz-hero-shimmer" />
        <div className="protoz-hero-grid" />
        <div className="protoz-hero-glow" />
        <div className="protoz-hero-particles">
          {[
            { left: "8%", top: "16%" },
            { left: "20%", top: "58%" },
            { left: "34%", top: "28%" },
            { left: "52%", top: "72%" },
            { left: "68%", top: "22%" },
            { left: "82%", top: "48%" },
            { left: "90%", top: "18%" },
            { left: "44%", top: "12%" }
          ].map((pos, i) => (
            <span
              key={i}
              className="protoz-hero-particle"
              style={{ left: pos.left, top: pos.top, animationDelay: `${i * -0.55}s` }}
            />
          ))}
        </div>
      </div>

      <div className="container protoz-hero-layout">
        <div className="protoz-hero-copy">
          <motion.p
            className="protoz-hero-eyebrow"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Software development · Web · Mobile · Enterprise
          </motion.p>

          <motion.div
            className="protoz-hero-heading"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.65 }}
          >
            <h1>From concept to code to customers</h1>
            <p className="protoz-hero-accent">built with clarity, speed, and long-term support</p>
          </motion.div>

          <motion.p
            className="protoz-hero-sub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.55 }}
          >
            {company.heroSubtitle}
          </motion.p>

          <motion.div
            className="protoz-hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.5 }}
          >
            <Link to="/contact" className="btn btn-dark btn-lg">
              Free consultation <ArrowRight size={18} />
            </Link>
            <Link to="/projects" className="btn btn-outline-dark btn-lg">
              Start your project
            </Link>
          </motion.div>
        </div>

        <div className="protoz-hero-visual">
          <HeroAppMockup />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
