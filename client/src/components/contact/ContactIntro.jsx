import { motion } from "framer-motion";
import SectionHeader from "../ui/SectionHeader";
import ExternalImage from "../ui/ExternalImage";
import { contactPageContent } from "../../data/content";

const ContactIntro = () => {
  const { intro } = contactPageContent;

  return (
    <section className="section contact-intro">
      <div className="container contact-intro-inner">
        <motion.div
          className="contact-intro-copy"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <SectionHeader
            label={intro.label}
            title={intro.title}
            subtitle={intro.subtitle}
            center={false}
          />
          <ul className="contact-intro-list">
            {intro.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </motion.div>
        <motion.div
          className="contact-intro-visual"
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <ExternalImage src={intro.image} alt="Free Demo with the Nutri Solutions team" loading="lazy" />
        </motion.div>
      </div>
    </section>
  );
};

export default ContactIntro;
