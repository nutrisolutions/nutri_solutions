import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ExternalImage from "../ui/ExternalImage";

const SLIDE_VW = 58;
const SLIDE_GAP = "1.25rem";
const SLIDE_SIDE = (100 - SLIDE_VW) / 2;

const ProjectScreenshotCarousel = ({ screenshots = [] }) => {
  const [index, setIndex] = useState(0);
  const slides = useMemo(() => screenshots.filter(Boolean), [screenshots]);

  if (!slides.length) return null;

  const maxIndex = slides.length - 1;
  const canNavigate = slides.length > 1;
  const slideStep = `(${SLIDE_VW}vw + ${SLIDE_GAP})`;

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(maxIndex, i + 1));

  return (
    <div className="project-carousel">
      <div className="project-carousel-viewport">
        <motion.div
          className="project-carousel-track"
          animate={{
            x: `calc(${SLIDE_SIDE}vw - ${index} * ${slideStep})`
          }}
          transition={{ type: "spring", stiffness: 300, damping: 34 }}
        >
          {slides.map((src, i) => (
            <div key={`${src}-${i}`} className="project-carousel-slide">
              <ExternalImage src={src} alt={`Screenshot ${i + 1}`} loading="lazy" />
            </div>
          ))}
        </motion.div>

        {canNavigate && (
          <>
            <button
              type="button"
              className="project-carousel-btn project-carousel-prev"
              onClick={prev}
              disabled={index === 0}
              aria-label="Previous screenshot"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              className="project-carousel-btn project-carousel-next"
              onClick={next}
              disabled={index === maxIndex}
              aria-label="Next screenshot"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {canNavigate && (
        <div className="project-carousel-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={i === index ? "active" : ""}
              onClick={() => setIndex(i)}
              aria-label={`Go to screenshot ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectScreenshotCarousel;
