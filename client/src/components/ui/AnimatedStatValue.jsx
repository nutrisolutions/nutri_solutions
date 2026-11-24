import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";
import { formatStatValue, parseStatValue } from "../../utils/parseStatValue";

/**
 * Counts from 0 to the numeric part of `value` when scrolled into view.
 * Supports suffixes ("240+") and decimals ("4.9").
 */
const AnimatedStatValue = ({
  value,
  className,
  duration = 1.8,
  once = true,
  margin = "-40px 0px",
  startOnMount = false
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: startOnMount ? "0px" : margin });
  const { target, suffix, decimals } = parseStatValue(value);
  // Start at the real value so prerendered HTML, crawlers and reduced-motion users never see "0+".
  const [display, setDisplay] = useState(() => formatStatValue(target, decimals, suffix));
  const hasAnimated = useRef(false);

  useEffect(() => {
    const shouldRun = startOnMount || inView;
    if (!shouldRun || hasAnimated.current) return;

    hasAnimated.current = true;
    const skipMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || navigator.webdriver === true;
    if (skipMotion) {
      setDisplay(formatStatValue(target, decimals, suffix));
      return;
    }
    const controls = animate(0, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        setDisplay(formatStatValue(latest, decimals, suffix));
      }
    });

    return () => controls.stop();
  }, [inView, startOnMount, target, decimals, suffix, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
};

export default AnimatedStatValue;
