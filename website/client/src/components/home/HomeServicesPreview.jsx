import { motion } from "framer-motion";
import { ArrowUpRight, Brain, CloudCog, Globe, Landmark, Lock, Palette, ShieldCheck, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import SectionHeader from "../ui/SectionHeader";
import SectionPageLink from "./SectionPageLink";
import { defaultServices } from "../../data/content";
import { getServiceSlug } from "../../lib/services";

const iconMap = { Globe, Smartphone, Landmark, CloudCog, Palette, ShieldCheck, Lock, Brain };

const HomeServicesPreview = ({ services = [] }) => {
  const list = services.length ? services : defaultServices;

  return (
    <section id="services-preview" className="section section-muted home-services-preview">
      <div className="container">
        <SectionHeader
          label="Services"
          title="End-to-end software development for web, mobile & enterprise"
          subtitle="From MVPs to enterprise platforms — design, build, deploy, and support under one accountable partner."
        />

        <div className="home-services-grid">
          {list.map((service, index) => {
            const Icon = iconMap[service.icon] || Globe;
            const slug = getServiceSlug(service);

            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/services/${slug}`} className="home-service-card-link">
                  <article className="home-service-card">
                    <div
                      className="home-service-icon"
                      style={{ color: service.accent, background: `${service.accent}14` }}
                    >
                      <Icon size={22} />
                    </div>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <ul>
                      {(service.highlights || []).slice(0, 3).map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                    <span className="home-service-card-cta">
                      Learn more <ArrowUpRight size={16} />
                    </span>
                  </article>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="home-section-footer">
          <SectionPageLink to="/services">Explore all services</SectionPageLink>
        </div>
      </div>
    </section>
  );
};

export default HomeServicesPreview;
