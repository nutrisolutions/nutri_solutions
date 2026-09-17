import { Link } from "react-router-dom";
import PageHero from "../components/layout/PageHero";
import FAQSection from "../components/FAQSection";
import ContactIntro from "../components/contact/ContactIntro";
import ContactChannels from "../components/contact/ContactChannels";
import ContactInquiryForm from "../components/contact/ContactInquiryForm";
import ContactMap from "../components/contact/ContactMap";
import ContactNextSteps from "../components/contact/ContactNextSteps";
import { contactPageContent, pageHero } from "../data/content";

const ContactPage = () => {
  const { careersBand } = contactPageContent;

  return (
    <>
      <PageHero {...pageHero.contact} />

      <ContactIntro />

      <section id="contact" className="section contact-main">
        <div className="container contact-main-inner">
          <ContactChannels />
          <ContactInquiryForm />
        </div>
      </section>

      <ContactMap />

      <ContactNextSteps />

      <FAQSection />

      <section className="section contact-careers-band">
        <div className="container contact-careers-inner">
          <div>
            <h2>{careersBand.title}</h2>
            <p>{careersBand.subtitle}</p>
          </div>
          <Link to={careersBand.ctaTo} className="btn btn-primary">
            {careersBand.ctaLabel}
          </Link>
        </div>
      </section>
    </>
  );
};

export default ContactPage;
