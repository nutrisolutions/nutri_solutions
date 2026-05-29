import PageHero from "../components/layout/PageHero";
import PortfolioSection from "../components/PortfolioSection";
import HomeCta from "../components/home/HomeCta";
import { pageHero } from "../data/content";

const ProjectsPage = () => {
  return (
    <>
      <PageHero {...pageHero.projects} />
      <PortfolioSection hideHeader showViewAll={false} />
      <HomeCta />
    </>
  );
};

export default ProjectsPage;
