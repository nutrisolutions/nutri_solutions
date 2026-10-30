import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SELECTOR = ".page-main section, .page-main [data-reveal], footer.footer";

/** Fade/slide sections in as they enter the viewport; picks up async-rendered content. */
const useScrollReveal = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    const register = () => {
      document.querySelectorAll(SELECTOR).forEach((el) => {
        if (el.classList.contains("reveal")) return;
        // Skip anything already on screen so first paint never flashes.
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) return;
        el.classList.add("reveal");
        io.observe(el);
      });
    };

    const timer = window.setTimeout(register, 450);
    const mo = new MutationObserver(register);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.clearTimeout(timer);
      mo.disconnect();
      io.disconnect();
    };
  }, [pathname]);
};

export default useScrollReveal;
