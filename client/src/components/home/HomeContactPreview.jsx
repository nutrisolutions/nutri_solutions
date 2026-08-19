import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";
import SectionHeader from "../ui/SectionHeader";
import SectionPageLink from "./SectionPageLink";
import { useSiteSettings } from "../../context/SiteSettingsContext";

const HomeContactPreview = () => {
  const contact = useSiteSettings();

  return (
  <section id="contact-preview" className="section home-contact-preview">
    <div className="container">
      <div className="home-contact-card">
        <div className="home-contact-copy">
          <SectionHeader
            label="Contact"
            title="Let's discuss your next software project"
            subtitle="Share your web, mobile, or enterprise requirements. We respond within one business day with scope guidance and a transparent estimate."
            center={false}
          />
          <ul className="home-contact-details">
            <li>
              <Mail size={18} />
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </li>
            <li>
              <Phone size={18} />
              <a href={`tel:${contact.phoneTel}`}>{contact.phone}</a>
            </li>
            <li>
              <MapPin size={18} />
              <span>{contact.address}</span>
            </li>
          </ul>
          <SectionPageLink to="/contact">Go to contact page</SectionPageLink>
        </div>
        <motion.div
          className="home-contact-visual"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <img
            src={contact.previewImage}
            alt="Free Demo session at Nutri Solutions"
            loading="lazy"
          />
        </motion.div>
      </div>
    </div>
  </section>
  );
};

export default HomeContactPreview;
