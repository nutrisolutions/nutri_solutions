import { motion } from "framer-motion";
import SectionHeader from "../ui/SectionHeader";
import { contactPageContent } from "../../data/content";

const ContactNextSteps = () => {
  const { expectations } = contactPageContent;

  return (
    <section className="section section-muted contact-expect">
      <div className="container">
        <SectionHeader
          label={expectations.label}
          title={expectations.title}
          center
        />
        <div className="contact-expect-grid">
          {expectations.steps.map((step, index) => (
            <motion.article
              key={step.step}
              className="contact-expect-step"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <span className="contact-expect-step-num">{step.step}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactNextSteps;
