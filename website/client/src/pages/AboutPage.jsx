import PageHero from "../components/layout/PageHero";
import AboutSection from "../components/AboutSection";
import ProcessSection from "../components/ProcessSection";
import WhyUsSection from "../components/WhyUsSection";
import HomeCta from "../components/home/HomeCta";
import { pageHero } from "../data/content";
import useHomeContent from "../hooks/useHomeContent";

const AboutPage = () => {
  const { metrics } = useHomeContent();

  return (
    <>
      <PageHero {...pageHero.about} />
      <AboutSection hideHeader />
      <ProcessSection />
      <WhyUsSection stats={metrics} />
      <HomeCta />
    </>
  );
};

export default AboutPage;
