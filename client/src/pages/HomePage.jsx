import HeroSection from "../components/HeroSection";
import WorkMarquee from "../components/home/WorkMarquee";
import HomeExplore from "../components/home/HomeExplore";
import HomeAboutPreview from "../components/home/HomeAboutPreview";
import HomeServicesPreview from "../components/home/HomeServicesPreview";
import TechStackSection from "../components/TechStackSection";
import HomeProcessPreview from "../components/home/HomeProcessPreview";
import PortfolioSection from "../components/PortfolioSection";
import HomeBlogPreview from "../components/home/HomeBlogPreview";
import WhyUsSection from "../components/WhyUsSection";
import FAQSection from "../components/FAQSection";
import HomeContactPreview from "../components/home/HomeContactPreview";
import HomeCta from "../components/home/HomeCta";
import useHomeContent from "../hooks/useHomeContent";

const HomePage = () => {
  const { company, metrics, services } = useHomeContent();

  return (
    <>
      <HeroSection company={company} />
      <HomeAboutPreview />
      <WorkMarquee />
      <HomeExplore />
      <HomeServicesPreview services={services} />
      <TechStackSection />
      <HomeProcessPreview />
      <PortfolioSection limit={3} />
      <HomeBlogPreview />
      <WhyUsSection stats={metrics} />
      <FAQSection limit={5} showMoreLink />
      <HomeContactPreview />
      <HomeCta />
    </>
  );
};

export default HomePage;
