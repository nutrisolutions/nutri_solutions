import { motion } from "framer-motion";

const FLOATING_TAGS = [
  { label: "Web Development", className: "hero-float-tag--top" },
  { label: "Mobile App Development", className: "hero-float-tag--right" },
  { label: "Custom Software", className: "hero-float-tag--bottom" }
];

const StatusBar = () => (
  <div className="hero-app-status" aria-hidden="true">
    <span>9:41</span>
    <span className="hero-app-status-icons">
      <i />
      <i />
      <i />
    </span>
  </div>
);

const AnalyticsAppScreen = () => (
  <div className="hero-app-ui hero-app-ui--analytics">
    <StatusBar />
    <header className="hero-app-header">
      <div>
        <p className="hero-app-eyebrow">Overview</p>
        <h3 className="hero-app-title">Dashboard</h3>
      </div>
      <span className="hero-app-avatar" />
    </header>
    <div className="hero-app-stats">
      <div className="hero-app-stat">
        <span className="hero-app-stat-value">2.4k</span>
        <span className="hero-app-stat-label">Users</span>
      </div>
      <div className="hero-app-stat hero-app-stat--accent">
        <span className="hero-app-stat-value">98%</span>
        <span className="hero-app-stat-label">Uptime</span>
      </div>
      <div className="hero-app-stat">
        <span className="hero-app-stat-value">$48k</span>
        <span className="hero-app-stat-label">Revenue</span>
      </div>
    </div>
    <div className="hero-app-chart">
      <div className="hero-app-chart-bars">
        {[42, 68, 55, 82, 64, 90, 72].map((h, i) => (
          <span key={i} style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
    <nav className="hero-app-tabs" aria-hidden="true">
      <span className="is-active" />
      <span />
      <span />
      <span />
    </nav>
  </div>
);

const CommerceAppScreen = () => (
  <div className="hero-app-ui hero-app-ui--commerce">
    <StatusBar />
    <div className="hero-app-search">
      <span className="hero-app-search-icon" />
      <span>Search products…</span>
    </div>
    <div className="hero-app-hero-card">
      <p>Today&apos;s picks</p>
      <strong>Fresh delivery</strong>
    </div>
    <ul className="hero-app-list">
      {["Organic meals", "Wellness kit", "Pro plan"].map((item) => (
        <li key={item}>
          <span className="hero-app-list-thumb" />
          <div>
            <strong>{item}</strong>
            <small>Tap to view details</small>
          </div>
          <span className="hero-app-list-chevron" />
        </li>
      ))}
    </ul>
    <nav className="hero-app-tabs hero-app-tabs--commerce" aria-hidden="true">
      <span className="is-active" />
      <span />
      <span />
      <span />
    </nav>
  </div>
);

const HeroDevice = ({ className, delay = 0, variant = "titanium", children }) => (
  <motion.div
    className={`hero-device ${className} hero-device--${variant}`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
  >
    <div className="hero-device-shadow" aria-hidden="true" />
    <div className="hero-device-body">
      <span className="hero-device-side-btn hero-device-side-btn--silent" aria-hidden="true" />
      <span className="hero-device-side-btn hero-device-side-btn--vol-up" aria-hidden="true" />
      <span className="hero-device-side-btn hero-device-side-btn--vol-down" aria-hidden="true" />
      <span className="hero-device-side-btn hero-device-side-btn--power" aria-hidden="true" />

      <div className="hero-device-bezel">
        <div className="hero-device-island" aria-hidden="true">
          <span className="hero-device-camera" />
        </div>
        <div className="hero-device-screen">
          {children}
          <div className="hero-device-glare" aria-hidden="true" />
          <div className="hero-device-home-indicator" aria-hidden="true" />
        </div>
      </div>
    </div>
  </motion.div>
);

const HeroAppMockup = () => (
  <div className="hero-mockup" aria-hidden="true">
    <div className="hero-mockup-blob" />

    <div className="hero-mockup-phones">
      <HeroDevice className="hero-device--back" variant="graphite" delay={0.15}>
        <CommerceAppScreen />
      </HeroDevice>
      <HeroDevice className="hero-device--front" variant="silver" delay={0.28}>
        <AnalyticsAppScreen />
      </HeroDevice>
    </div>

    {FLOATING_TAGS.map((tag, i) => (
      <motion.div
        key={tag.label}
        className={`hero-float-tag ${tag.className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 + i * 0.08, duration: 0.4 }}
      >
        {tag.label}
      </motion.div>
    ))}
  </div>
);

export default HeroAppMockup;
