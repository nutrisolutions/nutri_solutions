import { Link } from "react-router-dom";
import { ArrowUpRight, Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import BrandLogo from "./ui/BrandLogo";
import { navLinks, serviceNavLinks } from "../data/content";
import { useSiteSettings } from "../context/SiteSettingsContext";

const SOCIAL_ICONS = { instagram: Instagram, facebook: Facebook, linkedin: Linkedin };

const Footer = () => {
  const contact = useSiteSettings();
  const socialLinks = contact.socialLinks || [];

  return (
    <footer className="footer protoz-footer">
      <div className="container protoz-footer-top">
        <div className="protoz-footer-brand">
          <Link to="/" className="brand footer-brand">
            <BrandLogo variant="logo" />
            <span className="footer-brand-name">Nutri Solutions</span>
          </Link>
          <p>
            Nutri Solutions Private Limited — custom software, web, mobile, and cloud solutions with agile
            delivery and long-term support.
          </p>
          <Link to="/contact" className="btn btn-dark btn-sm">
            Let&apos;s talk <ArrowUpRight size={16} />
          </Link>
          <div className="protoz-footer-social">
            {socialLinks.map((social) => {
              const Icon = SOCIAL_ICONS[social.icon];
              if (!Icon) return null;
              return (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="protoz-footer-social-link"
                >
                  <Icon size={18} aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </div>

        <div className="protoz-footer-links">
          <div>
            <h4>Navigation</h4>
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
          </div>
          <div>
            <h4>Services</h4>
            {serviceNavLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
          </div>
          <div>
            <h4>Contact</h4>
            <a href={`mailto:${contact.email}`} className="protoz-footer-contact-item">
              <Mail size={15} aria-hidden="true" />
              <span>{contact.email}</span>
            </a>
            <a href={`tel:${contact.phoneTel}`} className="protoz-footer-contact-item">
              <Phone size={15} aria-hidden="true" />
              <span>{contact.phone}</span>
            </a>
            <p className="protoz-footer-contact-item protoz-footer-address">
              <MapPin size={15} aria-hidden="true" />
              <span>{contact.address}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="container footer-bottom protoz-footer-bottom">
        <p>© {new Date().getFullYear()} Nutri Solutions Private Limited. All rights reserved.</p>
        <nav className="protoz-footer-legal" aria-label="Legal">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms">Terms &amp; Conditions</Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
