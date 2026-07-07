import { useEffect, useState } from "react";

const HEADER_OFFSET = 96;

/**
 * Optional bottom-anchor for nav when leaving the services section.
 * Main stickiness uses CSS `position: sticky` on the nav element.
 */
const usePinnedSidebar = (sectionRef, layoutRef, pinRef) => {
  const [pin, setPin] = useState({ mode: "sticky" });

  useEffect(() => {
    const update = () => {
      const section = sectionRef.current;
      const layout = layoutRef.current;
      const el = pinRef.current;
      if (!section || !layout || !el) return;

      const sectionRect = section.getBoundingClientRect();
      const layoutRect = layout.getBoundingClientRect();
      const pinHeight = el.offsetHeight;
      const top = HEADER_OFFSET;

      const sectionInView =
        sectionRect.bottom > top + 20 && sectionRect.top < window.innerHeight - 20;

      if (!sectionInView) {
        setPin({ mode: "hidden" });
        return;
      }

      // Release nav at bottom of section when scrolling into next section
      if (layoutRect.bottom <= pinHeight + top + 32) {
        setPin({ mode: "bottom" });
        return;
      }

      setPin({ mode: "sticky" });
    };

    update();
    window.addEventListener("resize", update);

    if (window.lenis?.on) {
      window.lenis.on("scroll", update);
    }
    window.addEventListener("scroll", update, { passive: true });

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
      if (window.lenis?.off) {
        window.lenis.off("scroll", update);
      }
    };
  }, [sectionRef, layoutRef, pinRef]);

  return pin;
};

export default usePinnedSidebar;
