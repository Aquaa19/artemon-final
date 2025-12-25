// Filename: src/components/layout/LoadingScreen2.jsx
import { useEffect, useState } from 'react';

export default function LoadingScreen2() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    // CHANGED: 'bg-slate-50' -> 'bg-white/60 backdrop-blur-xl' for the glassy effect
    <div className="fixed inset-0 z-[9999] bg-white/40 backdrop-blur-xl flex flex-col items-center justify-center overflow-hidden transition-all duration-500">
      
      {/* 1. Ambient Background Glows (Made slightly more transparent for glass effect) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-pink-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative flex flex-col items-center animate-pop-in z-10">
        
        {/* 2. Logo Container */}
        <div className="relative mb-10 group">
            <div className="absolute inset-0 bg-indigo-400/50 rounded-full animate-ping opacity-20 duration-1000"></div>
            
            <div className="relative w-56 h-56 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl shadow-indigo-200/60 border-[8px] border-white/50 ring-1 ring-gray-200/50 overflow-hidden transform transition-transform duration-700 hover:scale-105">
                <div className="absolute inset-0 bg-white/50"></div> 
                <img 
                  src="/artemon_joy_logo.png" 
                  alt="Artemon Joy" 
                  className="relative w-40 h-40 object-contain z-10 drop-shadow-sm rounded-full" 
                  onError={(e) => { e.target.style.display = 'none'; }} 
                />
            </div>
        </div>
        
        {/* 3. Typography */}
        <div className="text-center space-y-3">
            <h1 className="text-5xl font-black tracking-tight text-slate-800 drop-shadow-sm">
              Artemon <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">Joy</span>
            </h1>
            
            <div className="h-6">
              <p className="text-slate-500 font-bold text-sm tracking-[0.2em] uppercase">
                Loading{dots}
              </p>
            </div>
        </div>
        
        {/* 4. Loading Bar */}
        <div className="w-72 h-2 bg-gray-200/50 rounded-full mt-12 overflow-hidden relative shadow-inner">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-loading-bar w-full h-full origin-left rounded-full"></div>
        </div>
      </div>
    </div>
  );
}