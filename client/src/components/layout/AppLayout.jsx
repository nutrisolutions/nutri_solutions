import { useLocation } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import SeoHead from "../SeoHead";
import PageTransition from "./PageTransition";
import AnalyticsTracker from "../analytics/AnalyticsTracker";
import useScrollToTop from "../../hooks/useScrollToTop";
import { SiteSettingsProvider } from "../../context/SiteSettingsContext";

const AppLayout = () => {
  const { pathname } = useLocation();
  useScrollToTop();

  const seoKey =
    pathname === "/"
      ? "home"
      : pathname.replace(/^\//, "").split("/")[0] || "home";

  return (
    <SiteSettingsProvider>
      <div className="app-shell">
        <AnalyticsTracker />
        <SeoHead page={seoKey} />
        <Navbar />
        <PageTransition />
        <Footer />
      </div>
    </SiteSettingsProvider>
  );
};

export default AppLayout;
