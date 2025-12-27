// Filename: src/components/layout/WelcomeTour.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Search, Heart, Zap, X, Gift, ArrowRight } from 'lucide-react';

const TOUR_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Artemon Joy!',
    desc: 'Discover a world where playtime is reimagined with wonder and imagination.',
    icon: Sparkles,
    target: null,
  },
  {
    id: 'search',
    title: 'Find the Magic',
    desc: 'Use our smart search to find specific plushies, educational sets, or trending toys.',
    icon: Search,
    target: '.tour-target-search',
  },
  {
    id: 'trending',
    title: 'Trending Wonders',
    desc: 'Check out what other families are loving right now in our live-scrolling gallery.',
    icon: Zap,
    target: '.tour-target-trending', 
  },
  {
    id: 'favorites',
    title: 'Build a Wishlist',
    desc: 'Tap the heart on any toy to save it to your favorites for later.',
    icon: Heart,
    target: '.tour-target-favorites',
  },
  {
    id: 'gift',
    title: 'A Gift for You',
    desc: 'Use code "JOY2025" for 15% off your first order! Ready to explore?',
    icon: Gift,
    target: null,
  }
];

export default function WelcomeTour() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isVisible, setIsVisible] = useState(false);
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0, size: 0 });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const retryCount = useRef(0);
  
  // Initial center position defined as pixel values to prevent the 0,0 jump
  const prevTooltipStyles = useRef({
    position: 'absolute',
    top: `${window.innerHeight / 2 - 120}px`,
    left: `${window.innerWidth / 2 - 160}px`,
    width: '320px'
  });

  const updateSpotlightPosition = useCallback(() => {
    if (currentStep >= 0 && currentStep < TOUR_STEPS.length) {
      const step = TOUR_STEPS[currentStep];
      
      if (step.target) {
        setIsMeasuring(true);
        const findAndMeasure = () => {
          const elements = document.querySelectorAll(step.target);
          const el = Array.from(elements).find(e => {
            const rect = e.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          });

          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });

            setTimeout(() => {
              const rect = el.getBoundingClientRect();
              const mobile = window.innerWidth < 768;
              setIsMobile(mobile);
              
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              
              let baseSize = Math.max(rect.width, rect.height);
              if (!mobile && step.id === 'trending') {
                baseSize = Math.min(baseSize, 550); 
              }

              const padding = step.id === 'trending' ? (mobile ? 120 : 80) : (mobile ? 25 : 40);

              setSpotlight({
                x: centerX,
                y: centerY,
                size: (baseSize / 2) + padding
              });
              setIsMeasuring(false);
              retryCount.current = 0;
            }, 450); // Balanced delay for smooth scroll completion
          } else if (retryCount.current < 5) {
            retryCount.current++;
            setTimeout(findAndMeasure, 200);
          }
        };

        findAndMeasure();
      } else {
        setSpotlight({ x: 0, y: 0, size: 0 });
        setIsMeasuring(false);
      }
    }
  }, [currentStep]);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('artemon_tour_completed');
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setCurrentStep(0);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    updateSpotlightPosition();
    window.addEventListener('resize', updateSpotlightPosition);
    return () => window.removeEventListener('resize', updateSpotlightPosition);
  }, [updateSpotlightPosition]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTour();
    }
  };

  const completeTour = () => {
    localStorage.setItem('artemon_tour_completed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;

  const getTooltipStyles = () => {
    // Hold the box at its last known valid pixel position while scrolling/measuring
    if (isMeasuring || (step.target && spotlight.size === 0)) return prevTooltipStyles.current;

    let styles = {};

    if (!step.target) {
      styles = {
        position: 'absolute',
        top: `${window.innerHeight / 2 - 120}px`,
        left: `${window.innerWidth / 2 - 160}px`,
        width: '320px'
      };
    } else if (isMobile) {
      styles = {
        position: 'fixed',
        bottom: '20px',
        left: '10px',
        right: '10px',
        width: 'calc(100% - 20px)'
      };
    } else {
      const tooltipHeight = 240; 
      const spaceAbove = spotlight.y - spotlight.size;
      const spaceBelow = window.innerHeight - (spotlight.y + spotlight.size);
      
      let topPos = spaceAbove > spaceBelow 
        ? spotlight.y - spotlight.size - tooltipHeight - 30 
        : spotlight.y + spotlight.size + 30;

      const clampedTop = Math.max(20, Math.min(topPos, window.innerHeight - tooltipHeight - 40));

      styles = {
        position: 'absolute',
        top: `${clampedTop}px`,
        left: `${Math.min(Math.max(20, spotlight.x - 160), window.innerWidth - 340)}px`,
        width: '320px'
      };
    }

    prevTooltipStyles.current = styles;
    return styles;
  };

  return (
    <div className="fixed inset-0 z-[9990] overflow-hidden pointer-events-none">
      {/* Background Overlay with improved transition and subtle blur */}
      <motion.div 
        layout
        className="tour-overlay absolute inset-0 pointer-events-auto backdrop-blur-[2px]"
        style={{
          WebkitMaskImage: spotlight.size > 0 
            ? `radial-gradient(circle ${spotlight.size}px at ${spotlight.x}px ${spotlight.y}px, transparent 99%, black 100%)`
            : 'none',
          maskImage: spotlight.size > 0 
            ? `radial-gradient(circle ${spotlight.size}px at ${spotlight.x}px ${spotlight.y}px, transparent 99%, black 100%)`
            : 'none',
          backgroundColor: step.id === 'trending' ? 'rgba(0, 0, 0, 0.94)' : 'rgba(0, 0, 0, 0.85)'
        }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        onClick={completeTour}
      />

      <AnimatePresence>
        <motion.div
          key="tour-dialogue"
          layout
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{
            layout: { type: "spring", stiffness: 140, damping: 22 },
            opacity: { duration: 0.3 }
          }}
          className="tour-tooltip pointer-events-auto shadow-2xl bg-white rounded-[2.5rem] border border-gray-100 p-8"
          style={getTooltipStyles()}
        >
          {step.target && !isMobile && !isMeasuring && (
            <motion.div 
              layout
              className={`absolute w-5 h-5 bg-white rotate-45 border-gray-100 border-l border-t 
                ${spotlight.y > window.innerHeight / 2 ? '-bottom-2.5' : '-top-2.5'} 
                left-1/2 -translate-x-1/2`}
            />
          )}

          <button onClick={completeTour} className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 p-1.5 transition-colors z-10">
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center">
            <motion.div 
              layout 
              key={`icon-${currentStep}`} 
              className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-5 shadow-inner"
            >
              <Icon className="w-8 h-8" />
            </motion.div>
            
            <motion.h3 layout className="text-2xl font-black text-gray-900 mb-3 leading-tight tracking-tight">
              {step.title}
            </motion.h3>
            <motion.p layout className="text-gray-500 text-sm font-medium mb-10 leading-relaxed max-w-[240px]">
              {step.desc}
            </motion.p>

            <motion.div layout className="flex items-center justify-between w-full">
              <div className="flex gap-2">
                {TOUR_STEPS.map((_, i) => (
                  <motion.div 
                    layout 
                    key={`dot-${i}`} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-indigo-600' : 'w-1.5 bg-gray-200'}`} 
                  />
                ))}
              </div>

              <button 
                onClick={handleNext} 
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white pl-6 pr-5 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 transition-all active:scale-95"
              >
                {currentStep === TOUR_STEPS.length - 1 ? 'Start Playing' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}