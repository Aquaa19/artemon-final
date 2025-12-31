// Filename: src/components/layout/ScrollToTop.jsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  /* --------------------------------
      RESET ON ROUTE CHANGE
  -------------------------------- */
  useEffect(() => {
    window.scrollTo(0, 0);
    setProgress(0);
    setIsVisible(false);
  }, [pathname]);

  /* --------------------------------
      SCROLL PROGRESS CALCULATION
  -------------------------------- */
  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;

      if (scrollable <= 0) {
        setProgress(0);
        setIsVisible(false);
        return;
      }

      const scrolled = window.scrollY;
      const percent = Math.min(
        Math.max((scrolled / scrollable) * 100, 0),
        100
      );

      setProgress(percent);
      setIsVisible(percent >= 1);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="fixed bottom-6 right-6 z-[60] md:bottom-10 md:right-10"
        >
          <div
            className="relative cursor-pointer group"
            onClick={scrollToTop}
          >
            <div className="relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center">

              {/* 1. PROGRESS RING */}
              <svg
                className="absolute inset-0 w-full h-full -rotate-90 z-20 pointer-events-none"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="6"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="#22ee77ff"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ type: "tween", ease: "linear", duration: 0.1 }}
                />
              </svg>

              {/* 2. GLASS BUTTON */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="
                  relative
                  w-[46px] h-[46px] md:w-[54px] md:h-[54px]
                  rounded-full
                  flex items-center justify-center
                  backdrop-blur-md
                  bg-white/10
                  border border-white/20
                  shadow-[0_8px_30px_rgba(0,0,0,0.35)]
                  overflow-hidden
                  z-10
                "
              >
                {/* Glass highlight */}
                <span
                  className="
                    absolute inset-0
                    bg-gradient-to-br
                    from-white/30
                    via-white/5
                    to-transparent
                    pointer-events-none
                  "
                />

                {/* Inner rim */}
                <span
                  className="
                    absolute inset-[2px]
                    rounded-full
                    border border-white/10
                    pointer-events-none
                  "
                />

                {/* REAL ARROW ICON */}
                <ArrowUp
                  size={22}
                  strokeWidth={2.8}
                  className="
                    text-cyan-300
                    transition-transform
                    group-hover:-translate-y-1
                    relative z-10
                  "
                />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
