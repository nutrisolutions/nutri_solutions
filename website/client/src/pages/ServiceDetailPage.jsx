import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
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
import { defaultServices, pageSeo } from "../data/content";
import useHomeContent from "../hooks/useHomeContent";
import { findServiceBySlug, getServiceSlug, resolveServices } from "../lib/services";

const iconMap = { Globe, Smartphone, Landmark, CloudCog, Palette, ShieldCheck, Lock, Brain };

const ServiceDetailPage = () => {
  const { slug } = useParams();
  const { services: apiServices } = useHomeContent();

  const services = useMemo(
    () => resolveServices(apiServices, defaultServices),
    [apiServices]
  );

  const service = findServiceBySlug(slug, apiServices, defaultServices);

  const related = useMemo(
    () => services.filter((item) => item.slug !== slug).slice(0, 3),
    [services, slug]
  );

  useEffect(() => {
    if (service) {
      document.title = `${service.title} | Nutri Solutions`;
    }
    return () => {
      document.title = pageSeo.home.title;
    };
  }, [service]);

  if (!service) {
    return (
      <div className="service-detail-page">
        <div className="container service-detail-error">
          <h1>Service not found</h1>
          <Link to="/services" className="btn btn-primary">
            Back to services
          </Link>
        </div>
      </div>
    );
  }

  const Icon = iconMap[service.icon] || Globe;
  const fallback = defaultServices.find((item) => item.slug === slug);
  const banner = service.banner || service.image || fallback?.banner || fallback?.image;
  const overview = service.overview?.length ? service.overview : [service.description];
  const benefits = service.benefits || service.highlights || [];
  const deliverables = service.deliverables || [];

  return (
    <div className="service-detail-page">
      <section className="service-detail-banner">
        <img src={banner} alt="" aria-hidden="true" />
        <div className="service-detail-banner-overlay" />
        <div className="container service-detail-banner-top">
          <Link to="/services" className="project-back-link">
            <ArrowLeft size={18} /> All services
          </Link>
        </div>
        <div className="container service-detail-banner-content">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div
              className="service-detail-icon"
              style={{ color: service.accent, background: `${service.accent}22`, borderColor: `${service.accent}44` }}
            >
              <Icon size={28} />
            </div>
            <h1>{service.title}</h1>
            <p className="service-detail-tagline">{service.description}</p>
          </motion.div>
        </div>
      </section>

      <div className="container service-detail-body">
        <motion.section
          className="service-detail-section"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <h2>About this service</h2>
          <div className="service-detail-overview">
            {overview.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        </motion.section>

        {benefits.length > 0 && (
          <motion.section
            className="service-detail-section"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            <h2>What you get</h2>
            <ul className="service-detail-benefits">
              {benefits.map((item) => (
                <li key={item}>
                  <span className="service-detail-benefit-icon" style={{ color: service.accent }}>
                    <Check size={18} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.section>
        )}

        {deliverables.length > 0 && (
          <motion.section
            className="service-detail-section"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.08 }}
          >
            <h2>Typical deliverables</h2>
            <div className="service-detail-deliverables">
              {deliverables.map((item) => (
                <span key={item} className="service-detail-deliverable">
                  {item}
                </span>
              ))}
            </div>
          </motion.section>
        )}

        {related.length > 0 && (
          <motion.section
            className="service-detail-section"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <h2>Related services</h2>
            <div className="service-detail-related">
              {related.map((item) => (
                <Link key={item.slug} to={`/services/${item.slug}`} className="service-detail-related-card">
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                  <em>
                    Learn more <ArrowRight size={14} />
                  </em>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        <motion.section
          className="service-detail-cta"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.12 }}
        >
          <h2>Ready to discuss {service.title.toLowerCase()}?</h2>
          <p>Share your goals and we&apos;ll respond with scope options, timelines, and a transparent estimate.</p>
          <Link to="/contact" className="btn btn-primary">
            Get a Free Demo
          </Link>
        </motion.section>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
