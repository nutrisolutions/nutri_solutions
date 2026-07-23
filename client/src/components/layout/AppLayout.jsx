import { useLocation } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import SeoHead from "../SeoHead";
import PageTransition from "./PageTransition";
import AnalyticsTracker from "../analytics/AnalyticsTracker";
import useScrollToTop from "../../hooks/useScrollToTop";

const AppLayout = () => {
  const { pathname } = useLocation();
  useScrollToTop();

  const seoKey =
    pathname === "/"
      ? "home"
      : pathname.replace(/^\//, "").split("/")[0] || "home";

  return (
    <div className="app-shell">
      <AnalyticsTracker />
      <SeoHead page={seoKey} />
      <Navbar />
      <PageTransition />
      <Footer />
    </div>
  );
};

export default AppLayout;
