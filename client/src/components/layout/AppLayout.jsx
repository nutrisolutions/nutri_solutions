import Navbar from "../Navbar";
import Footer from "../Footer";
import SeoHead from "../SeoHead";
import PageTransition from "./PageTransition";
import AnalyticsTracker from "../analytics/AnalyticsTracker";
import useScrollToTop from "../../hooks/useScrollToTop";
import useScrollReveal from "../../hooks/useScrollReveal";
import { SiteSettingsProvider } from "../../context/SiteSettingsContext";

const AppLayout = () => {
  useScrollToTop();
  useScrollReveal();

  return (
    <SiteSettingsProvider>
      <div className="app-shell">
        <AnalyticsTracker />
        <SeoHead />
        <Navbar />
        <PageTransition />
        <Footer />
      </div>
    </SiteSettingsProvider>
  );
};

export default AppLayout;
