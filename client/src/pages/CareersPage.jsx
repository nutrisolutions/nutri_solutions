import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Code2,
  Coffee,
  GraduationCap,
  Heart,
  Home,
  Laptop,
  PartyPopper,
  Target,
  TrendingUp,
  Users,
  Wallet
} from "lucide-react";
import PageHero from "../components/layout/PageHero";
import SectionHeader from "../components/ui/SectionHeader";
import ExternalImage from "../components/ui/ExternalImage";
import CareersOpenPositions from "../components/careers/CareersOpenPositions";
import { careersContent, pageHero } from "../data/content";

const perkIcons = {
  Wallet,
  Heart,
  GraduationCap,
  Home,
  Laptop,
  Calendar,
  PartyPopper,
  Users,
  TrendingUp,
  Coffee
};

const cultureIcons = { Target, Code2, Users, Heart };

const CareersPage = () => {
  const { intro, life, culture, perks, moments, hiring } = careersContent;

  return (
    <>
      <PageHero
        {...pageHero.careers}
        subtitle="Join a team that ships real software for growing businesses — explore life at Nutri Solutions, our benefits, and open roles below."
      />

      <section className="section careers-intro">
        <div className="container careers-intro-inner">
          <motion.div
            className="careers-intro-copy"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <SectionHeader
              label={intro.label}
              title={intro.title}
              subtitle={intro.subtitle}
              center={false}
            />
            <ul className="careers-intro-list">
              {intro.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <a href="#open-positions" className="btn btn-primary">
              View open positions
            </a>
          </motion.div>
          <motion.div
            className="careers-intro-visual"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <ExternalImage src={intro.image} alt="Team collaborating at Nutri Solutions" loading="lazy" />
          </motion.div>
        </div>
      </section>

      <section className="section careers-life section-muted">
        <div className="container">
          <SectionHeader label={life.label} title={life.title} subtitle={life.subtitle} />
          <div className="careers-life-layout">
            <motion.div
              className="careers-life-copy"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {life.paragraphs.map((text) => (
                <p key={text.slice(0, 48)}>{text}</p>
              ))}
            </motion.div>
            <motion.div
              className="careers-life-media"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <figure className="careers-life-figure careers-life-figure--hero">
                <ExternalImage src={life.images.hero} alt="Team working together" loading="lazy" />
              </figure>
              <div className="careers-life-duo">
                <figure className="careers-life-figure">
                  <ExternalImage src={life.images.workshop} alt="Sprint planning session" loading="lazy" />
                </figure>
                <figure className="careers-life-figure">
                  <ExternalImage src={life.images.focus} alt="Developer focused on product work" loading="lazy" />
                </figure>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section careers-culture">
        <div className="container">
          <SectionHeader label={culture.label} title={culture.title} />
          <div className="careers-values-grid">
            {culture.values.map((item, index) => {
              const Icon = cultureIcons[item.icon] || Target;
              return (
                <motion.article
                  key={item.title}
                  className="careers-value-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.07 }}
                >
                  <div className="careers-value-icon">
                    <Icon size={22} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section careers-perks">
        <div className="container">
          <SectionHeader label={perks.label} title={perks.title} subtitle={perks.subtitle} />
          <div className="careers-perks-grid">
            {perks.items.map((item, index) => {
              const Icon = perkIcons[item.icon] || Coffee;
              return (
                <motion.article
                  key={item.title}
                  className="careers-perk-card"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.04 }}
                >
                  <div className="careers-perk-icon">
                    <Icon size={20} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section careers-moments section-muted">
        <div className="container">
          <SectionHeader label={moments.label} title={moments.title} />
          <div className="careers-moments-grid">
            {moments.gallery.map((item, index) => (
              <motion.figure
                key={item.caption}
                className="careers-moment-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <ExternalImage src={item.src} alt={item.caption} loading="lazy" />
                <figcaption>{item.caption}</figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      <section className="section careers-hiring">
        <div className="container">
          <SectionHeader label={hiring.label} title={hiring.title} subtitle={hiring.subtitle} />
          <div className="careers-hiring-steps">
            {hiring.steps.map((step, index) => (
              <motion.article
                key={step.step}
                className="careers-hiring-step"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <span className="careers-hiring-step-num">{step.step}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <CareersOpenPositions />

      <section className="section careers-cta-band">
        <div className="container careers-cta-inner">
          <div>
            <h2>Don't see the right role?</h2>
            <p>
              Send us your resume and tell us what you'd like to work on. We'll reach out when a matching
              opportunity opens up.
            </p>
          </div>
          <Link to="/contact" className="btn btn-primary">
            Get in touch
          </Link>
        </div>
      </section>
    </>
  );
};

export default CareersPage;
