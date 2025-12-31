// Filename: src/pages/shop/Home.jsx
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, ShieldCheck, Truck, Star, Gift, 
  Sparkles, ChevronLeft, ChevronRight, Layers 
} from 'lucide-react';
import ProductCard from '../../components/product/ProductCard';
import { firestoreService } from '../../services/db';
import { ROUTE_MAP } from '../../App';

export default function Home() {
  const [allTrending, setAllTrending] = useState([]);
  const [displayTrending, setDisplayTrending] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [isPaused, setIsPaused] = useState(false);

  const autoScrollTimer = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  useEffect(() => {
    const handleResize = () => {
      let perPage = 4;
      if (window.innerWidth < 640) perPage = 1;
      else if (window.innerWidth < 1024) perPage = 2;
      setItemsPerPage(perPage);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendingData, arrivalsData] = await Promise.all([
          firestoreService.getProducts({ trending: true }),
          firestoreService.getProducts({ newArrivals: true })
        ]);
        
        const trendingList = trendingData || [];
        setAllTrending(trendingList);
        setDisplayTrending([...trendingList, { id: 'view-more-card', type: 'view-more' }]);
        setNewArrivals((arrivalsData || []).slice(0, 4));
      } catch (error) {
        console.error("Failed to load cloud products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      const isAtEnd = prev + itemsPerPage >= displayTrending.length;
      return isAtEnd ? 0 : prev + 1;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      const isAtStart = prev === 0;
      return isAtStart ? displayTrending.length - itemsPerPage : prev - 1;
    });
  };

  useEffect(() => {
    if (!loading && displayTrending.length > 0 && !isPaused) {
      autoScrollTimer.current = setInterval(nextSlide, 5000);
    }
    return () => {
      if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    };
  }, [loading, displayTrending, isPaused, itemsPerPage]);

  const handleManualInteraction = (action) => {
    if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    action();
  };

  const onTouchStart = (e) => { 
    setTouchEnd(null); 
    setTouchStart(e.targetTouches[0].clientX); 
    setIsPaused(true); 
  };
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    setIsPaused(false);
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) handleManualInteraction(nextSlide);
    else if (distance < -minSwipeDistance) handleManualInteraction(prevSlide);
  };

  return (
    <div className="bg-surface-muted overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative bg-primary overflow-hidden pt-24 pb-44 lg:pt-32 lg:pb-56 rounded-b-[2.5rem] lg:rounded-b-[5rem] shadow-2xl z-10">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
          <div className="absolute top-[-10%] right-[-5%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-accent/30 rounded-full blur-[80px] md:blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-secondary/20 rounded-full blur-[80px] md:blur-[100px]"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 flex flex-col-reverse lg:flex-row items-center gap-10 lg:gap-12">
          <div className="flex-1 text-center lg:text-left">
            <Link to={ROUTE_MAP.NEW_ARRIVALS} className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-white text-xs md:text-sm font-bold mb-6 border border-white/20 backdrop-blur-md shadow-lg hover:bg-white/20 transition-all">
              <Gift className="w-4 h-4 mr-2" /> <span>New Arrivals for 2025</span>
            </Link>
            
            {/* MAIN HEADING - SundayShine Font Applied */}
            <h1 className="font-hero hero-spacing text-4xl sm:text-5xl md:text-7xl text-white tracking-normal leading-[1.1] mb-6 drop-shadow-md">
              Playtime Reimagined <br /> 
              {/* Corrected visibility fix for gradient text */}
              <span className="bg-gradient-to-r from-[#fef08a] to-[#facc15] bg-clip-text text-transparent inline-block">
                With Wonder.
              </span>
            </h1>

            {/* DESCRIPTION - Bambulo Font Applied */}
            <p className="font-description mt-4 text-lg md:text-xl text-white/95 max-w-xl mx-auto lg:mx-0 leading-[1.4] tracking-wide">
              Discover imagination with our safe, educational, and fun toys for children of all ages.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to={ROUTE_MAP.SHOP} className="shine-effect px-8 py-4 rounded-full bg-white text-primary font-bold text-lg shadow-lg hover:scale-105 transition-all">Shop Collection</Link>
              <Link to={ROUTE_MAP.TRENDING} className="px-8 py-4 rounded-full bg-black/20 text-white font-bold text-lg border border-white/30 backdrop-blur-sm transition-all flex items-center justify-center gap-2 hover:bg-black/30">
                View Trending <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
          <div className="flex-1 relative w-full max-w-sm lg:max-w-none">
            <img src="/artemon_joy_banner.webp" alt="Artemon Joy Banner" className="w-full h-auto object-cover rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border-4 border-white/30 animate-tilt" />
          </div>
        </div>
      </div>

      {/* Trust Strip */}
      <div className="max-w-5xl mx-auto px-4 relative -mt-20 md:-mt-24 z-20">
        <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] shadow-xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center border border-white/50">
          {[ 
            { icon: ShieldCheck, color: "text-green-600", bg: "bg-green-50", title: "Safety Certified", desc: "100% Non-toxic" }, 
            { icon: Truck, color: "text-blue-600", bg: "bg-blue-50", title: "Fast Delivery", desc: "Free over ₹500" }, 
            { icon: Star, color: "text-amber-500", bg: "bg-amber-50", title: "Parents' Choice", desc: "Trusted by 10k+" } 
          ].map((item, idx) => (
            <div key={idx} className="flex flex-row md:flex-col items-center md:text-center gap-4 md:gap-0 group cursor-default">
              <div className={`w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-xl md:rounded-2xl ${item.bg} ${item.color} flex items-center justify-center md:mb-4 transition-transform duration-300 group-hover:scale-110 shadow-sm`}><item.icon className="w-6 h-6 md:w-8 md:h-8" /></div>
              <div>
                <h3 className="text-base md:text-lg font-bold text-gray-900 md:mb-1">{item.title}</h3>
                <p className="text-gray-400 md:text-gray-500 text-xs md:text-sm font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Wonders Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 tour-target-trending">
        <div 
          className="bg-secondary rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-16 relative overflow-hidden shadow-2xl"
          onMouseEnter={() => setIsPaused(true)} 
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div className="text-white">
                  <span className="font-bold uppercase tracking-widest text-[10px] md:text-xs opacity-90">Don't Miss Out</span>
                  <h2 className="text-2xl md:text-5xl font-extrabold mt-1">Trending Now</h2>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                    <button onClick={() => handleManualInteraction(prevSlide)} className="p-3 rounded-full bg-white/20 hover:bg-white text-white hover:text-secondary transition-all active:scale-90"><ChevronLeft className="w-6 h-6" /></button>
                    <button onClick={() => handleManualInteraction(nextSlide)} className="p-3 rounded-full bg-white/20 hover:bg-white text-white hover:text-secondary transition-all active:scale-90"><ChevronRight className="w-6 h-6" /></button>
                </div>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[1,2,3,4].map(i => <div key={i} className="h-80 md:h-96 bg-white/10 animate-pulse rounded-3xl"></div>)}
              </div>
            ) : (
              <div className="relative overflow-hidden">
                <div 
                  className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] touch-pan-y" 
                  style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
                  onTouchStart={onTouchStart} 
                  onTouchMove={onTouchMove} 
                  onTouchEnd={onTouchEnd}
                >
                  {displayTrending.map((item, idx) => (
                    <div 
                      key={item.id || idx} 
                      className="flex-shrink-0 px-2 md:px-4" 
                      style={{ width: `${100 / itemsPerPage}%` }}
                    >
                      {item.type === 'view-more' ? (
                        <Link to={ROUTE_MAP.TRENDING} className="block h-full min-h-[350px] md:min-h-[400px] bg-white/10 hover:bg-white/20 border-2 border-white/30 border-dashed rounded-3xl flex flex-col items-center justify-center text-white group transition-all">
                          <div className="p-4 bg-white/20 rounded-full mb-4 group-hover:scale-110 transition-transform"><Layers className="w-8 h-8" /></div>
                          <h3 className="text-xl md:text-2xl font-bold mb-2">View All</h3>
                          <div className="flex items-center gap-2 font-bold bg-white text-secondary px-6 py-2 rounded-full shadow-lg text-sm">Browse <ArrowRight className="w-4 h-4" /></div>
                        </Link>
                      ) : (
                        <div className="h-full">
                          <ProductCard product={item} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex sm:hidden justify-center gap-1.5 mt-6">
                  {displayTrending.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all ${Math.floor(currentIndex) === i ? 'w-4 bg-white' : 'w-1.5 bg-white/30'}`}></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Arrivals Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-20 md:pb-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <span className="text-primary font-bold uppercase tracking-widest text-[10px] md:text-xs flex items-center gap-1"><Sparkles className="w-4 h-4" /> Fresh In</span>
              <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 mt-1">New Arrivals</h2>
            </div>
            <Link to={ROUTE_MAP.NEW_ARRIVALS} className="group flex items-center gap-2 text-gray-400 text-sm font-bold hover:text-primary transition-colors">
              View all toys <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
        {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {[1,2,3,4].map(i => <div key={i} className="h-80 md:h-96 bg-gray-200 animate-pulse rounded-3xl"></div>)}
            </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {newArrivals.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </div>
    </div>
  );
}