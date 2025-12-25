// Filename: src/components/layout/WelcomeTour.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Search, Heart, Zap, X, Gift, ArrowRight } from 'lucide-react';

const TOUR_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Artemon Joy!',
    desc: 'Discover a world where playtime is reimagined with wonder and imagination.',
    icon: Sparkles,
    target: null, // Center modal
  },
  {
    id: 'search',
    title: 'Find the Magic',
    desc: 'Use our smart search to find specific plushies, educational sets, or trending toys.',
    icon: Search,
    target: '.tour-target-search', // We will add these classes to Navbar in next step
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
    target: null, // Center modal
  }
];

export default function WelcomeTour() {
  const [currentStep, setCurrentStep] = useState(-1); // -1 = Not started
  const [isVisible, setIsVisible] = useState(false);
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0, size: 0 });

  useEffect(() => {
    // Check if user has seen the tour before
    const hasSeenTour = localStorage.getItem('artemon_tour_completed');
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setCurrentStep(0);
      }, 2000); // Start 2 seconds after landing
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (currentStep >= 0 && currentStep < TOUR_STEPS.length) {
      const step = TOUR_STEPS[currentStep];
      if (step.target) {
        const el = document.querySelector(step.target);
        if (el) {
          const rect = el.getBoundingClientRect();
          setSpotlight({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            size: Math.max(rect.width, rect.height) / 1.5 + 40
          });
          // Smooth scroll to target if it's off-screen
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        setSpotlight({ x: 0, y: 0, size: 0 }); // Reset to center/no spotlight
      }
    }
  }, [currentStep]);

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

  return (
    <div className="fixed inset-0 z-[9990] overflow-hidden">
      {/* Dynamic Spotlight Overlay */}
      <div 
        className="tour-overlay"
        style={{
          '--tour-hole-x': `${spotlight.x}px`,
          '--tour-hole-y': `${spotlight.y}px`,
          '--tour-hole-size': `${spotlight.size}px`
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className={`tour-tooltip ${!step.target ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}`}
          style={step.target ? {
            top: spotlight.y > window.innerHeight / 2 ? spotlight.y - spotlight.size - 180 : spotlight.y + spotlight.size + 20,
            left: Math.min(Math.max(20, spotlight.x - 160), window.innerWidth - 340)
          } : {}}
        >
          <button 
            onClick={completeTour}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-primary-light text-primary rounded-2xl flex items-center justify-center mb-4">
              <Icon className="w-8 h-8" />
            </div>
            
            <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight">
              {step.title}
            </h3>
            
            <p className="text-gray-500 text-sm font-medium mb-6 leading-relaxed">
              {step.desc}
            </p>

            <div className="flex items-center justify-between w-full mt-auto">
              {/* Step Indicators */}
              <div className="flex gap-1.5">
                {TOUR_STEPS.map((_, i) => (
                  <div 
                    key={i} 
                    className={`tour-dot ${i === currentStep ? 'w-6 bg-primary' : 'w-2 bg-gray-200'}`} 
                  />
                ))}
              </div>

              <button 
                onClick={handleNext}
                className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                {currentStep === TOUR_STEPS.length - 1 ? 'Start Shopping' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}