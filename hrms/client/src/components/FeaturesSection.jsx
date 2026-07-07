import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  AnimatePresence
} from "framer-motion";
import {
  Globe,
  Smartphone,
  Landmark,
  CloudCog,
  BarChart3,
  ShieldCheck,
  Palette,
  ArrowRight,
  Check
} from "lucide-react";
import { Link } from "react-router-dom";
import SectionHeader from "./ui/SectionHeader";
import { defaultServices } from "../data/content";
import usePinnedSidebar from "../hooks/usePinnedSidebar";
import { getServiceSlug } from "../lib/services";

const iconMap = { Globe, Smartphone, Landmark, CloudCog, BarChart3, ShieldCheck, Palette };

const scrollToService = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.lenis) {
    window.lenis.scrollTo(el, { offset: -110, duration: 1.1 });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const ServiceScrollCard = ({ service, index, isActive, onActive, total }) => {
  const cardRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start 0.8", "end 0.4"]
  });
  const smoothY = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });
  const imageY = useTransform(smoothY, [0, 1], ["8%", "-8%"]);

  const Icon = iconMap[service.icon] || Globe;

  return (
    <motion.article
      ref={cardRef}
      id={`service-card-${index}`}
      className={`service-scroll-card ${isActive ? "service-scroll-card-active" : ""}`}
      style={{ "--card-index": index, "--card-total": total }}
      onViewportEnter={() => onActive(index)}
      viewport={{ margin: "-40% 0px -40% 0px", amount: 0.4 }}
    >
      <div className="service-card-content">
        <div className="service-card-top">
          <div
            className="service-card-icon"
            style={{ color: service.accent, background: `${service.accent}18`, borderColor: `${service.accent}35` }}
          >
            <Icon size={24} />
          </div>
          <span className="service-card-index" style={{ color: service.accent }}>
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <h3>{service.title}</h3>
        <p>{service.description}</p>

        <ul className="service-card-highlights">
          {(service.highlights || []).map((item) => (
            <li key={item}>
              <Check size={16} style={{ color: service.accent }} />
              {item}
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="service-card-cta"
          style={{ color: service.accent }}
          onClick={() => scrollToService("contact")}
        >
          Discuss this service <ArrowRight size={16} />
        </button>

        <Link
          to={`/services/${getServiceSlug(service)}`}
          className="service-card-link"
          style={{ color: service.accent }}
        >
          Learn more <ArrowRight size={16} />
        </Link>
      </div>

      <div className="service-card-visual">
        <motion.div className="service-card-image-wrap" style={{ y: imageY }}>
          <img src={service.image} alt={service.title} loading="lazy" />
          <div
            className="service-card-image-overlay"
            style={{ background: `linear-gradient(135deg, ${service.accent}55, transparent)` }}
          />
        </motion.div>
      </div>
    </motion.article>
  );
};

const FeaturesSection = ({ services = [], hideHeader = false }) => {
  const sectionRef = useRef(null);
  const layoutRef = useRef(null);
  const scrollPanelRef = useRef(null);
  const navRef = useRef(null);
  const list = services.length ? services : defaultServices;
  const [activeIndex, setActiveIndex] = useState(0);

  const pin = usePinnedSidebar(sectionRef, layoutRef, navRef);

  const { scrollYProgress } = useScroll({
    target: scrollPanelRef,
    offset: ["start 0.15", "end 0.95"]
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 26,
    restDelta: 0.001
  });
  const progressWidth = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  const mapped = list.map((s) => ({
    ...s,
    highlights: s.highlights || [],
    image: s.image || defaultServices[0].image,
    accent: s.accent || "#7045c3"
  }));

  return (
    <section
      id="services"
      className={`section services-section ${hideHeader ? "section-compact-top" : ""}`}
      ref={sectionRef}
    >
      <div className="container">
        <div className="services-sticky-layout" ref={layoutRef}>
          <div className="services-sticky-col">
            <aside
              ref={navRef}
              className={`services-sticky-nav services-sticky-nav--${pin.mode}`}
            >
              <div className="services-nav-inner">
                <p className="services-nav-label">Explore services</p>
                <div className="services-progress-track">
                  <motion.div className="services-progress-fill" style={{ width: progressWidth }} />
                </div>
                <nav className="services-nav-list" aria-label="Service navigation">
                  {mapped.map((item, index) => (
                    <button
                      key={item.title}
                      type="button"
                      className={`services-nav-item ${activeIndex === index ? "active" : ""}`}
                      onClick={() => scrollToService(`service-card-${index}`)}
                    >
                      <span className="services-nav-num">{String(index + 1).padStart(2, "0")}</span>
                      <span className="services-nav-text">{item.title}</span>
                    </button>
                  ))}
                </nav>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    className="services-nav-preview"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <span style={{ color: mapped[activeIndex].accent }}>Now viewing</span>
                    <strong>{mapped[activeIndex].title}</strong>
                  </motion.div>
                </AnimatePresence>
              </div>
            </aside>
          </div>

          {/* Right: heading + cards (heading never sits under nav) */}
          <div className="services-content-col">
            {!hideHeader && (
              <div className="services-section-header">
                <SectionHeader
                  label="Our services"
                  title="From ideas to high-impact software that inspires and converts"
                  subtitle="Web, mobile, enterprise systems, and cloud — built with modern stacks and measurable outcomes."
                  center={false}
                />
              </div>
            )}

            <div className="services-scroll-panel" ref={scrollPanelRef}>
              {mapped.map((item, index) => (
                <ServiceScrollCard
                  key={item.title}
                  service={item}
                  index={index}
                  total={mapped.length}
                  isActive={activeIndex === index}
                  onActive={setActiveIndex}
                />
              ))}
              <div className="services-scroll-spacer" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="services-mobile-strip">
          {mapped.map((item, index) => {
            const Icon = iconMap[item.icon] || Globe;
            return (
              <motion.article
                key={item.title}
                className="service-mobile-card"
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
              >
                <div className="service-mobile-card-head">
                  <div className="service-card-icon" style={{ color: item.accent, background: `${item.accent}18` }}>
                    <Icon size={20} />
                  </div>
                  <h3>{item.title}</h3>
                </div>
                <p>{item.description}</p>
                <img src={item.image} alt={item.title} loading="lazy" />
                <Link
                  to={`/services/${getServiceSlug(item)}`}
                  className="service-card-link"
                  style={{ color: item.accent }}
                >
                  Learn more <ArrowRight size={16} />
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
