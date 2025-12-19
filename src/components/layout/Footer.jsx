// Filename: src/components/layout/Footer.jsx
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <div className="relative mt-20">
      
      {/* Decorative Wave Top - Playful transition from content to footer */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180 -translate-y-[98%] z-0">
        <svg className="relative block w-[calc(100%+1.3px)] h-[60px] lg:h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#1e1b4b"></path>
        </svg>
      </div>

      <footer className="bg-[#1e1b4b] text-blue-100 pt-10 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Newsletter Section */}
          <div className="bg-indigo-900/50 rounded-3xl p-8 mb-16 flex flex-col lg:flex-row items-center justify-between gap-8 border border-indigo-500/30">
            <div className="max-w-xl">
              <h3 className="text-2xl font-bold text-white mb-2">Join the Fun! 🚀</h3>
              <p className="text-indigo-200">Subscribe to our newsletter for exclusive toy drops, parenting tips, and magical offers.</p>
            </div>
            <div className="w-full lg:w-auto flex-1 max-w-md">
              <form className="relative flex items-center">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full bg-white/10 border border-indigo-500/50 text-white placeholder-indigo-300 rounded-full py-3.5 pl-6 pr-32 outline-none focus:bg-white/20 focus:border-indigo-400 transition-all"
                />
                <button className="absolute right-1.5 top-1.5 bottom-1.5 bg-primary hover:bg-primary-hover text-white px-6 rounded-full font-bold text-sm transition-all shadow-lg shadow-indigo-900/20">
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-indigo-900/50 pb-12">
            
            {/* Brand */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-1 bg-white rounded-full">
                   <img 
                      src="/artemon_joy_logo.png" 
                      alt="Artemon Joy" 
                      className="w-10 h-10 rounded-full object-cover" 
                   />
                </div>
                <span className="font-extrabold text-2xl text-white tracking-tight">Artemon Joy</span>
              </div>
              <p className="text-indigo-200 text-sm leading-relaxed">
                Sparking imagination and joy in every child. We curate safe, educational, and magical toys for the next generation of dreamers.
              </p>
              <div className="flex gap-4">
                {[Facebook, Instagram, Twitter].map((Icon, i) => (
                  <a key={i} href="#" className="p-2.5 bg-indigo-900/50 rounded-full hover:bg-primary hover:text-white text-indigo-300 transition-all hover:-translate-y-1">
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6">Explore</h3>
              <ul className="space-y-3">
                {['Educational', 'Action Figures', 'Plushies', 'Puzzles', 'Trending'].map((item) => (
                  <li key={item}>
                    <Link to={`/shop?category=${item.toLowerCase()}`} className="text-indigo-200 hover:text-white hover:translate-x-1 inline-flex items-center gap-2 transition-all duration-300 text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/50"></span> {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6">Support</h3>
              <ul className="space-y-3">
                {[
                  { label: 'Track Order', path: '/track-order' },
                  { label: 'Shipping Info', path: '/shipping' },
                  { label: 'Returns & Exchange', path: '/returns' },
                  { label: 'FAQs', path: '/faq' },
                  { label: 'Privacy Policy', path: '/privacy' }
                ].map((item) => (
                  <li key={item.label}>
                    <Link to={item.path} className="text-indigo-200 hover:text-white hover:translate-x-1 inline-block transition-all duration-300 text-sm">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6">Contact Us</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 p-1.5 bg-indigo-900/50 rounded-lg text-primary">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-indigo-200 leading-relaxed">Mankur Rd, Hijlak, <br/>West Bengal 711303</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-1.5 bg-indigo-900/50 rounded-lg text-primary">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-indigo-200 font-mono">9091517563</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-1.5 bg-indigo-900/50 rounded-lg text-primary">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-indigo-200">artemonjoy@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-indigo-400 font-medium">&copy; {new Date().getFullYear()} Artemon Joy. All rights reserved.</p>
            <div className="flex items-center gap-3 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
               <div className="h-8 bg-white/5 rounded px-2 flex items-center"><span className="text-xs font-bold text-white tracking-widest">VISA</span></div>
               <div className="h-8 bg-white/5 rounded px-2 flex items-center"><span className="text-xs font-bold text-white tracking-widest">Mastercard</span></div>
               <div className="h-8 bg-white/5 rounded px-2 flex items-center"><span className="text-xs font-bold text-white tracking-widest">UPI</span></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}