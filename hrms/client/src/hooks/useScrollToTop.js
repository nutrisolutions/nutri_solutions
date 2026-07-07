import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Reset scroll on route change; honor hash anchors after page transition (Lenis). */
const useScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const scrollToHash = () => {
      if (!hash) return;
      const id = hash.replace("#", "");
      const target = document.getElementById(id);
      if (!target) return;

      if (window.lenis) {
        window.lenis.scrollTo(target, { offset: -88, duration: 1.1 });
      } else {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    if (hash) {
      const timer = window.setTimeout(scrollToHash, 420);
      return () => window.clearTimeout(timer);
    }

    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname, hash]);
};

export default useScrollToTop;
