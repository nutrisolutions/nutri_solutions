import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";

const useSmoothScroll = () => {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/portal");

  useEffect(() => {
    if (isAdminRoute) return undefined;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      smoothTouch: true,
      touchMultiplier: 1.1
    });

    let frameId;
    const raf = (time) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };
    frameId = requestAnimationFrame(raf);

    const handleAnchorClick = (event) => {
      const anchor = event.target.closest('a[href^="#"]');
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      lenis.scrollTo(target, { offset: -84, duration: 1.2 });
    };

    document.addEventListener("click", handleAnchorClick);
    window.lenis = lenis;

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      cancelAnimationFrame(frameId);
      delete window.lenis;
      lenis.destroy();
    };
  }, [isAdminRoute]);
};

export default useSmoothScroll;
