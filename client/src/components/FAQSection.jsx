import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import SectionHeader from "./ui/SectionHeader";
import { faqs } from "../data/content";

const FAQSection = ({ limit, showMoreLink = false }) => {
  const [openIndex, setOpenIndex] = useState(0);
  const items = limit ? faqs.slice(0, limit) : faqs;

  // FAQPage JSON-LD only where the full FAQ lives (contact page), so it isn't duplicated on home.
  useEffect(() => {
    if (limit) return undefined;
    const script = document.createElement("script");
    script.id = "nutri-json-ld-faq";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer }
      }))
    });
    document.getElementById(script.id)?.remove();
    document.head.appendChild(script);
    return () => script.remove();
  }, [limit]);

  return (
    <section id="faqs" className="section section-muted">
      <div className="container faq-layout">
        <SectionHeader
          label="FAQs"
          title="Have questions? We have answers"
          subtitle="Common questions about our services, timelines, technologies, and how we work with clients."
          center={false}
        />

        <div className="faq-list">
          {items.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={faq.question}
                className={`faq-item ${isOpen ? "faq-item-open" : ""}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04 }}
              >
                <button
                  type="button"
                  className="faq-trigger"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                >
                  <h3>{faq.question}</h3>
                  {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="faq-answer-wrap"
                    >
                      <p className="faq-answer">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {showMoreLink && (
          <div className="home-section-footer">
            <Link to="/contact#faqs" className="home-section-link">
              See all FAQs on contact page →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default FAQSection;
