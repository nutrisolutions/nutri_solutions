import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Brain,
  Check,
  CloudCog,
  Globe,
  Landmark,
  Lock,
  Palette,
  ShieldCheck,
  Smartphone
} from "lucide-react";
import { Link } from "react-router-dom";
import { defaultServices } from "../data/content";
import { getServiceSlug, resolveServices } from "../lib/services";

const iconMap = { Globe, Smartphone, Landmark, CloudCog, Palette, ShieldCheck, Lock, Brain };

const BENTO_LAYOUT = [
  "featured",
  "side-top",
  "side-mid",
  "base-left",
  "base-mid",
  "base-right",
  "strip",
  "strip-b"
];

const getFallbackImage = (slug) =>
  defaultServices.find((item) => item.slug === slug)?.image || defaultServices[0].image;

const ServiceBentoCard = ({ service, index, layout }) => {
  const Icon = iconMap[service.icon] || Globe;
  const slug = getServiceSlug(service);
  const imageSrc = service.image || getFallbackImage(slug);

  return (
    <motion.article
      className={`services-bento-card services-bento-card--${layout}`}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      whileHover={{ y: -6 }}
    >
      <Link to={`/services/${slug}`} className="services-bento-card-link">
        <div className="services-bento-card-media">
          <img
            src={imageSrc}
            alt=""
            aria-hidden="true"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = getFallbackImage(slug);
            }}
          />
          <div
            className="services-bento-card-tint"
            style={{
              background: `linear-gradient(145deg, ${service.accent}88 0%, rgba(5, 5, 8, 0.72) 100%)`
            }}
          />
        </div>

        <div className="services-bento-card-body">
          <div className="services-bento-card-top">
            <span
              className="services-bento-card-icon"
              style={{ color: service.accent, background: `${service.accent}22`, borderColor: `${service.accent}44` }}
            >
              <Icon size={layout === "featured" ? 22 : 18} />
            </span>
            <span className="services-bento-card-num" style={{ color: service.accent }}>
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <h3>{service.title}</h3>
          <p>{service.description}</p>

          {(layout === "featured" || layout === "strip" || layout === "strip-b") && (
            <ul className="services-bento-highlights">
              {(service.highlights || []).slice(0, 3).map((item) => (
                <li key={item}>
                  <Check size={14} style={{ color: service.accent }} />
                  {item}
                </li>
              ))}
            </ul>
          )}

          <span className="services-bento-cta">
            View service <ArrowUpRight size={16} />
          </span>
        </div>
      </Link>
    </motion.article>
  );
};

const ServicesGridSection = ({ services = [] }) => {
  const list = resolveServices(services, defaultServices).map((service, index) => {
    const slug = getServiceSlug(service);
    const fallback = defaultServices.find((item) => item.slug === slug) || defaultServices[index] || {};

    return {
      ...service,
      highlights: service.highlights || fallback.highlights || [],
      image: service.image || fallback.image,
      accent: service.accent || fallback.accent || "#7045c3",
      layout: BENTO_LAYOUT[index] || "base-right"
    };
  });

  return (
    <section id="services" className="section services-bento-section">
      <div className="container">
        <div className="services-bento-intro">
          <span className="section-label">What we do</span>
          <h2 className="section-title">Eight ways we help you build and scale</h2>
          <p className="section-subtitle">
            Pick a capability below to explore scope, deliverables, and how we work — from web and mobile to
            cloud, design, cybersecurity, AI, and ongoing support.
          </p>
        </div>

        <div className="services-bento-grid">
          {list.map((service, index) => (
            <ServiceBentoCard key={service.slug || service.title} service={service} index={index} layout={service.layout} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesGridSection;
