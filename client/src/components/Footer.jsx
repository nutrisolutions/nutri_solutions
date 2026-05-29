import { Link } from "react-router-dom";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import BrandLogo from "./ui/BrandLogo";
import { contactInfo, navLinks, serviceNavLinks } from "../data/content";

const Footer = () => {
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
            <a href={`mailto:${contactInfo.email}`} className="protoz-footer-contact-item">
              <Mail size={15} aria-hidden="true" />
              <span>{contactInfo.email}</span>
            </a>
            <p className="protoz-footer-contact-item protoz-footer-address">
              <MapPin size={15} aria-hidden="true" />
              <span>{contactInfo.address}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="container footer-bottom protoz-footer-bottom">
        <p>© {new Date().getFullYear()} Nutri Solutions Private Limited. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
