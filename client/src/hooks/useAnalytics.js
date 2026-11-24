import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { initPostHog } from "../lib/posthog";
import { trackPageTransition, trackPageView, trackSectionView } from "../lib/analytics";

// Build-time prerendering runs in headless Chrome (navigator.webdriver) — never track it.
const isPrerender = typeof navigator !== "undefined" && navigator.webdriver === true;

const isPublicRoute = (pathname) => !isPrerender && !pathname.startsWith("/admin");

/** PostHog + server mirror: page views, section views, page transitions. */
const useAnalytics = () => {
  const location = useLocation();
  const prevPath = useRef(null);
  const seenSections = useRef(new Set());

  useEffect(() => {
    if (!isPrerender) initPostHog();
  }, []);

  useEffect(() => {
    if (!isPublicRoute(location.pathname)) return;

    const path = location.pathname;

    if (prevPath.current && prevPath.current !== path) {
      trackPageTransition(prevPath.current, path);
    }

    trackPageView(path);

    if (typeof window.gtag === "function" && prevPath.current) {
      window.gtag("event", "page_view", {
        page_path: path,
        page_location: window.location.href,
        page_title: document.title
      });
    }

    prevPath.current = path;
    seenSections.current = new Set();
  }, [location.pathname]);

  useEffect(() => {
    if (!isPublicRoute(location.pathname)) return;

    const path = location.pathname;

    const observeSections = () => {
      const nodes = document.querySelectorAll("section[id], [data-analytics-section]");
      if (!nodes.length) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting || entry.intersectionRatio < 0.35) return;
            const sectionId =
              entry.target.getAttribute("data-analytics-section") || entry.target.id;
            if (!sectionId) return;
            const key = `${path}::${sectionId}`;
            if (seenSections.current.has(key)) return;
            seenSections.current.add(key);
            trackSectionView(sectionId, path);
          });
        },
        { threshold: [0.35, 0.5] }
      );

      nodes.forEach((node) => observer.observe(node));
      return observer;
    };

    let observer;
    const timer = window.setTimeout(() => {
      observer = observeSections();
    }, 400);

    return () => {
      window.clearTimeout(timer);
      observer?.disconnect();
    };
  }, [location.pathname]);
};

export default useAnalytics;
