// Filename: src/components/layout/Footer.jsx
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, MapPin, Phone, ShieldCheck, Lock } from 'lucide-react';
import Newsletter from './Newsletter';

const SOCIAL_LINKS = [
  { name: 'Facebook', icon: Facebook, url: 'https://www.facebook.com/share/1FGik9yzJ7/' },
  { name: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/artemon.joy' }
];

const PAYMENT_METHODS = [
  { 
    name: 'Visa', 
    src: "https://upload.wikimedia.org/wikipedia/commons/d/d6/Visa_2021.svg",
    className: "h-4" 
  },
  { 
    name: 'Mastercard', 
    src: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg",
    className: "h-7" 
  },
  { 
    name: 'UPI', 
    src: "https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg",
    className: "h-5 brightness-0 invert" 
  }
];

export default function Footer() {
  const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Artemon+Joy+Mankur+Rd+Hijlak+West+Bengal+711303";
  const PHONE_NUMBER = "9091517563";
  const EMAIL_ADDRESS = "artemonjoy@gmail.com";

  return (
    <div className="relative mt-20">
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180 -translate-y-[98%] z-0">
        <svg className="relative block w-[calc(100%+1.3px)] h-[60px] lg:h-[100px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#1e1b4b"></path>
        </svg>
      </div>

      <footer className="bg-[#1e1b4b] text-blue-100 pt-10 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-16">
            <Newsletter />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-indigo-900/50 pb-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-1 bg-white rounded-full">
                   <img src="/artemon_joy_logo.png" alt="Artemon Joy" className="w-10 h-10 rounded-full object-cover" />
                </div>
                <span className="font-extrabold text-2xl text-white tracking-tight">Artemon Joy</span>
              </div>
              <p className="text-indigo-200 text-sm leading-relaxed">
                Sparking imagination and joy in every child. We curate safe, educational, and magical toys for the next generation of dreamers.
              </p>
              <div className="flex gap-4">
                {SOCIAL_LINKS.map((social) => (
                  <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-indigo-900/50 rounded-full hover:bg-indigo-600 hover:text-white text-indigo-300 transition-all hover:-translate-y-1">
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg mb-6">Explore</h3>
              <ul className="space-y-3">
                {['Educational', 'Action Figures', 'Plushies', 'Puzzles', 'Trending'].map((item) => (
                  <li key={item}>
                    <Link to={`/shop?category=${item.toLowerCase()}`} className="text-indigo-200 hover:text-white hover:translate-x-1 inline-flex items-center gap-2 transition-all duration-300 text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500/50"></span> {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg mb-6">Support</h3>
              <ul className="space-y-3">
                {[{ label: 'Track Order', path: '/track-order' }, { label: 'Shipping Info', path: '/shipping' }, { label: 'Returns & Exchange', path: '/returns' }, { label: 'FAQs', path: '/faq' }, { label: 'Privacy Policy', path: '/privacy' }].map((item) => (
                  <li key={item.label}><Link to={item.path} className="text-indigo-200 hover:text-white hover:translate-x-1 inline-block transition-all duration-300 text-sm">{item.label}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg mb-6">Contact Us</h3>
              <ul className="space-y-4">
                <li><a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 group"><div className="mt-1 p-1.5 bg-indigo-900/50 rounded-lg text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors"><MapPin className="w-4 h-4" /></div><span className="text-sm text-indigo-200 leading-relaxed group-hover:text-white transition-colors">Mankur Rd, Hijlak, <br/>West Bengal 711303</span></a></li>
                <li><a href={`tel:${PHONE_NUMBER}`} className="flex items-center gap-3 group"><div className="p-1.5 bg-indigo-900/50 rounded-lg text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Phone className="w-4 h-4" /></div><span className="text-sm text-indigo-200 font-mono group-hover:text-white transition-colors">{PHONE_NUMBER}</span></a></li>
                <li><a href={`mailto:${EMAIL_ADDRESS}`} className="flex items-center gap-3 group"><div className="p-1.5 bg-indigo-900/50 rounded-lg text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Mail className="w-4 h-4" /></div><span className="text-sm text-indigo-200 group-hover:text-white transition-colors">{EMAIL_ADDRESS}</span></a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 flex flex-col lg:flex-row justify-between items-center gap-8">
            <p className="text-xs text-indigo-400 font-medium order-2 lg:order-1">
              © {new Date().getFullYear()} Artemon Joy. All rights reserved.
            </p>
            
            {/* UPGRADED PAYMENT SECTION */}
            <div className="flex flex-col sm:flex-row items-center gap-6 order-1 lg:order-2">
              {/* Trust Badge */}
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                <Lock className="w-3.5 h-3.5 text-green-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">
                  100% Secure Checkout
                </span>
              </div>

              {/* Payment Methods */}
              <div className="flex items-center gap-3">
                {PAYMENT_METHODS.map((method) => (
                  <div 
                    key={method.name}
                    className="h-10 w-16 bg-white/5 backdrop-blur-md rounded-xl flex items-center justify-center p-2 border border-white/10 hover:border-indigo-400/50 hover:bg-white/10 transition-all duration-300 group cursor-default shadow-lg hover:shadow-indigo-500/10"
                  >
                    <img 
                      src={method.src} 
                      alt={method.name} 
                      className={`${method.className} object-contain transition-transform group-hover:scale-110`} 
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}