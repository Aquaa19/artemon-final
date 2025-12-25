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
  const retryCount = useRef(0);

  const updateSpotlightPosition = useCallback(() => {
    if (currentStep >= 0 && currentStep < TOUR_STEPS.length) {
      const step = TOUR_STEPS[currentStep];
      
      if (step.target) {
        // Use requestAnimationFrame or a small timeout to ensure DOM is ready
        const findAndMeasure = () => {
          const elements = document.querySelectorAll(step.target);
          const el = Array.from(elements).find(e => {
            const rect = e.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          });

          if (el) {
            // Scroll to the element first
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Wait for scroll to settle before measuring (essential for Trending section)
            setTimeout(() => {
              const rect = el.getBoundingClientRect();
              const mobile = window.innerWidth < 768;
              setIsMobile(mobile);
              
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              
              // Refined sizing: Mobile trending needs a large enough circle to see the cards
              const padding = step.id === 'trending' ? (mobile ? 120 : 160) : (mobile ? 25 : 40);
              const baseSize = Math.max(rect.width, rect.height);

              setSpotlight({
                x: centerX,
                y: centerY,
                size: (baseSize / 2) + padding
              });
              retryCount.current = 0; // Reset on success
            }, 300); 
          } else if (retryCount.current < 5) {
            // If element not found (e.g. still loading), retry 5 times
            retryCount.current++;
            setTimeout(findAndMeasure, 200);
          }
        };

        findAndMeasure();
      } else {
        setSpotlight({ x: 0, y: 0, size: 0 });
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
    if (!step.target) return {}; 

    if (isMobile) {
      return {
        bottom: '20px',
        left: '10px',
        right: '10px',
        width: 'calc(100% - 20px)',
        transform: 'none'
      };
    }

    return {
      top: spotlight.y > window.innerHeight / 2 
        ? spotlight.y - spotlight.size - 220 
        : spotlight.y + spotlight.size + 30,
      left: Math.min(Math.max(20, spotlight.x - 160), window.innerWidth - 340),
      width: '320px'
    };
  };

  return (
    <div className="fixed inset-0 z-[9990] overflow-hidden pointer-events-none">
      {/* HIGH FIDELITY OVERLAY */}
      <div 
        className="tour-overlay pointer-events-auto transition-all duration-500"
        style={{
          WebkitMaskImage: spotlight.size > 0 
            ? `radial-gradient(circle ${spotlight.size}px at ${spotlight.x}px ${spotlight.y}px, transparent 99%, black 100%)`
            : 'none',
          maskImage: spotlight.size > 0 
            ? `radial-gradient(circle ${spotlight.size}px at ${spotlight.x}px ${spotlight.y}px, transparent 99%, black 100%)`
            : 'none',
          backgroundColor: step.id === 'trending' ? 'rgba(0, 0, 0, 0.92)' : 'rgba(0, 0, 0, 0.85)'
        }}
        onClick={completeTour}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: isMobile ? 40 : 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: isMobile ? 40 : -20 }}
          className={`tour-tooltip pointer-events-auto shadow-2xl relative ${
            !step.target ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm' : 'absolute'
          }`}
          style={getTooltipStyles()}
        >
          {step.target && !isMobile && (
            <div 
              className={`absolute w-4 h-4 bg-white rotate-45 border-gray-100 border-l border-t 
                ${spotlight.y > window.innerHeight / 2 ? '-bottom-2' : '-top-2'} 
                left-1/2 -translate-x-1/2`}
            />
          )}

          <button onClick={completeTour} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 p-1">
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center p-2">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
              <Icon className="w-7 h-7" />
            </div>
            
            <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight">{step.title}</h3>
            <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">{step.desc}</p>

            <div className="flex items-center justify-between w-full">
              <div className="flex gap-1.5">
                {TOUR_STEPS.map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6 bg-indigo-600' : 'w-1.5 bg-gray-200'}`} />
                ))}
              </div>

              <button 
                onClick={handleNext}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 transition-all active:scale-95"
              >
                {currentStep === TOUR_STEPS.length - 1 ? 'Start Exploring' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}