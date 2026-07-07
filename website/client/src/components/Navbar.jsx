import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import BrandLogo from "./ui/BrandLogo";
import { navLinks, serviceNavLinks } from "../data/content";
import { useAuth } from "../context/AuthContext";

const HRMS_URL = import.meta.env.VITE_HRMS_URL || "http://localhost:5174";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated: isAdminAuthenticated } = useAuth();
  const authCta = isAdminAuthenticated
    ? { to: "/admin", label: "Go to Admin" }
    : { to: "/admin/login", label: "Admin Login" };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMobileServicesOpen(false);
  }, [location.pathname]);

  const isServicesRoute = location.pathname.startsWith("/services");

  return (
    <motion.header
      className={`navbar protoz-navbar ${scrolled ? "navbar-scrolled" : ""}`}
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container navbar-inner">
        <Link to="/" className="brand" aria-label="Nutri Solutions home">
          <BrandLogo />
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          {navLinks.map((link) =>
            link.to === "/services" ? (
              <div key={link.to} className="nav-item-dropdown">
                <NavLink
                  to="/services"
                  className={({ isActive }) =>
                    isActive || isServicesRoute ? "nav-link-active nav-link-with-caret" : "nav-link-with-caret"
                  }
                >
                  {link.label}
                  <ChevronDown size={14} className="nav-link-caret" aria-hidden="true" />
                </NavLink>
                <div className="nav-dropdown-menu" role="menu" aria-label="Services">
                  {serviceNavLinks.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) => (isActive ? "nav-dropdown-item nav-dropdown-item-active" : "nav-dropdown-item")}
                      role="menuitem"
                    >
                      {item.label}
                    </NavLink>
                  ))}
                  <NavLink to="/services" className="nav-dropdown-footer" role="menuitem">
                    View all services
                  </NavLink>
                </div>
              </div>
            ) : (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) => (isActive ? "nav-link-active" : undefined)}
              >
                {link.label}
              </NavLink>
            )
          )}
        </nav>

        <div className="navbar-actions">
          <a href={HRMS_URL} className="btn btn-outline btn-sm navbar-cta-desktop">
            Employee/HR Login
          </a>
          <Link to={authCta.to} className="btn btn-outline btn-sm navbar-cta-desktop">
            {authCta.label}
          </Link>
          <Link to="/contact" className="btn btn-dark btn-sm navbar-cta-desktop">
            Talk to us
          </Link>
          <button
            type="button"
            className="nav-mobile-toggle"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            className="nav-mobile-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28 }}
            aria-label="Mobile navigation"
          >
            <div className="container nav-mobile-links">
              {navLinks.map((link) =>
                link.to === "/services" ? (
                  <div key={link.to} className="nav-mobile-services">
                    <button
                      type="button"
                      className={`nav-mobile-services-toggle ${isServicesRoute ? "nav-link-active" : ""}`}
                      aria-expanded={mobileServicesOpen}
                      onClick={() => setMobileServicesOpen((open) => !open)}
                    >
                      {link.label}
                      <ChevronDown
                        size={16}
                        className={`nav-link-caret ${mobileServicesOpen ? "nav-link-caret-open" : ""}`}
                      />
                    </button>
                    <AnimatePresence>
                      {mobileServicesOpen && (
                        <motion.div
                          className="nav-mobile-services-list"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.22 }}
                        >
                          <NavLink to="/services">All services</NavLink>
                          {serviceNavLinks.map((item) => (
                            <NavLink key={item.to} to={item.to}>
                              {item.label}
                            </NavLink>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === "/"}
                    className={({ isActive }) => (isActive ? "nav-link-active" : undefined)}
                  >
                    {link.label}
                  </NavLink>
                )
              )}
              <a href={HRMS_URL} className="btn btn-outline btn-sm">
                Employee/HR Login
              </a>
              <Link to={authCta.to} className="btn btn-outline btn-sm">
                {authCta.label}
              </Link>
              <Link to="/contact" className="btn btn-dark btn-sm">
                Talk to us
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
