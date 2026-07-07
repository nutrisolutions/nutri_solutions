/** Compact in-device UIs for work marquee mockups */

const WorkScreenChrome = ({ children, variant = "light" }) => (
  <div className={`work-screen work-screen--${variant}`}>{children}</div>
);

export const EnterpriseHrScreen = () => (
  <WorkScreenChrome>
    <div className="work-ui work-ui--enterprise">
      <aside className="work-ui-sidebar" aria-hidden="true">
        <span className="is-active" />
        <span />
        <span />
        <span />
      </aside>
      <div className="work-ui-main">
        <header className="work-ui-topbar">
          <strong>Payroll overview</strong>
          <span className="work-ui-pill">Live</span>
        </header>
        <div className="work-ui-metrics">
          <div><em>248</em><small>Employees</small></div>
          <div><em>₹12.4L</em><small>This cycle</small></div>
          <div><em>99.2%</em><small>On-time</small></div>
        </div>
        <div className="work-ui-table">
          <div className="work-ui-table-head">
            <span>Name</span>
            <span>Dept</span>
            <span>Status</span>
          </div>
          {[
            ["A. Sharma", "Ops", "Paid"],
            ["R. Patel", "HR", "Paid"],
            ["K. Nair", "Sales", "Pending"]
          ].map(([name, dept, status]) => (
            <div key={name} className="work-ui-table-row">
              <span>{name}</span>
              <span>{dept}</span>
              <span className={status === "Paid" ? "ok" : "warn"}>{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </WorkScreenChrome>
);

export const EcommerceScreen = () => (
  <WorkScreenChrome>
    <div className="work-ui work-ui--ecommerce">
      <header className="work-ui-topbar">
        <strong>Store admin</strong>
        <span className="work-ui-search" />
      </header>
      <div className="work-ui-metrics work-ui-metrics--inline">
        <div><em>1.2k</em><small>Orders</small></div>
        <div><em>₹8.6L</em><small>Revenue</small></div>
      </div>
      <div className="work-ui-product-grid">
        {["Jacket", "Sneakers", "Watch", "Bag"].map((item) => (
          <div key={item} className="work-ui-product">
            <span className="work-ui-product-img" />
            <strong>{item}</strong>
            <small>In stock</small>
          </div>
        ))}
      </div>
      <div className="work-ui-chart-strip">
        {[40, 65, 50, 80, 55, 90, 70].map((h, i) => (
          <span key={i} style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  </WorkScreenChrome>
);

export const HealthcareScreen = () => (
  <WorkScreenChrome variant="health">
    <div className="work-ui work-ui--health">
      <header className="work-ui-health-header">
        <div>
          <small>Good morning</small>
          <strong>My care</strong>
        </div>
        <span className="work-ui-avatar-health" />
      </header>
      <div className="work-ui-appointment-card">
        <small>Next visit</small>
        <strong>Dr. Mehta · 10:30</strong>
        <span>Cardiology · Video call</span>
      </div>
      <ul className="work-ui-health-list">
        {["Lab results", "Prescriptions", "Messages"].map((item) => (
          <li key={item}>
            <span className="work-ui-health-icon" />
            <span>{item}</span>
            <i />
          </li>
        ))}
      </ul>
      <nav className="work-ui-phone-tabs" aria-hidden="true">
        <span className="is-active" />
        <span />
        <span />
        <span />
      </nav>
    </div>
  </WorkScreenChrome>
);

export const GenericWebScreen = () => (
  <WorkScreenChrome>
    <div className="work-ui work-ui--generic-web">
      <header className="work-ui-topbar">
        <strong>Project dashboard</strong>
      </header>
      <div className="work-ui-blocks">
        <span />
        <span />
        <span />
      </div>
      <div className="work-ui-chart-strip">
        {[35, 55, 45, 70, 60, 85, 65].map((h, i) => (
          <span key={i} style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  </WorkScreenChrome>
);

export const EventManagementScreen = () => (
  <WorkScreenChrome variant="event">
    <div className="work-ui work-ui--events">
      <header className="work-ui-events-hero">
        <small>Discover</small>
        <strong>Find events</strong>
      </header>
      <div className="work-ui-events-search" />
      <p className="work-ui-events-label">Trending</p>
      <div className="work-ui-events-cards">
        <div className="work-ui-events-card work-ui-events-card--warm">
          <span>Birthday</span>
        </div>
        <div className="work-ui-events-card work-ui-events-card--cool">
          <span>Meetup</span>
        </div>
      </div>
      <ul className="work-ui-events-list">
        {["Science fair", "Food festival", "Workshop"].map((item) => (
          <li key={item}>
            <span className="work-ui-events-dot" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <nav className="work-ui-phone-tabs work-ui-phone-tabs--dark" aria-hidden="true">
        <span className="is-active" />
        <span />
        <span />
        <span />
      </nav>
    </div>
  </WorkScreenChrome>
);

export const GenericMobileScreen = () => (
  <WorkScreenChrome variant="health">
    <div className="work-ui work-ui--generic-mobile">
      <header className="work-ui-health-header">
        <strong>Mobile app</strong>
      </header>
      <div className="work-ui-list-simple">
        <span />
        <span />
        <span />
      </div>
      <nav className="work-ui-phone-tabs" aria-hidden="true">
        <span className="is-active" />
        <span />
        <span />
      </nav>
    </div>
  </WorkScreenChrome>
);

const SCREENS = {
  enterprise: EnterpriseHrScreen,
  ecommerce: EcommerceScreen,
  healthcare: HealthcareScreen,
  events: EventManagementScreen,
  "generic-web": GenericWebScreen,
  "generic-mobile": GenericMobileScreen
};

export const WorkProjectScreen = ({ screen }) => {
  const Screen = SCREENS[screen] || GenericWebScreen;
  return <Screen />;
};
