import PageHero from "../components/layout/PageHero";
import ServicesGridSection from "../components/ServicesGridSection";
import TechStackSection from "../components/TechStackSection";
import HomeCta from "../components/home/HomeCta";
import { pageHero } from "../data/content";
import useHomeContent from "../hooks/useHomeContent";

const ServicesPage = () => {
  const { services } = useHomeContent();

  return (
    <>
      <PageHero {...pageHero.services} />
      <ServicesGridSection services={services} />
      <TechStackSection />
      <HomeCta />
    </>
  );
};

export default ServicesPage;
