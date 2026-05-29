import { motion } from "framer-motion";
import { Mail, MapPin } from "lucide-react";
import SectionHeader from "../ui/SectionHeader";
import SectionPageLink from "./SectionPageLink";
import { contactInfo } from "../../data/content";

const HomeContactPreview = () => (
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
              <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
            </li>
            <li>
              <MapPin size={18} />
              <span>{contactInfo.address}</span>
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
            src={contactInfo.previewImage}
            alt="Team consultation at Nutri Solutions"
            loading="lazy"
          />
        </motion.div>
      </div>
    </div>
  </section>
);

export default HomeContactPreview;
