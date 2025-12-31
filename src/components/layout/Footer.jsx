// Filename: src/components/layout/Footer.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, MapPin, Phone, Lock } from 'lucide-react';
import { db } from '../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ROUTE_MAP } from '../../App';
import Newsletter from './Newsletter';

const SOCIAL_LINKS = [
  { name: 'Facebook', icon: Facebook, url: 'https://www.facebook.com/share/1FGik9yzJ7/' },
  { name: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/artemon.joy' }
];

const PAYMENT_METHODS = [
  { name: 'Visa', src: "https://upload.wikimedia.org/wikipedia/commons/d/d6/Visa_2021.svg", className: "h-4" },
  { name: 'Mastercard', src: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg", className: "h-7" },
  { name: 'UPI', src: "https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg", className: "h-5 brightness-0 invert" }
];

export default function Footer() {
  const [categories, setCategories] = useState([]);
  const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Artemon+Joy+Mankur+Rd+Hijlak+West+Bengal+711303";
  const PHONE_NUMBER = "9091517563";
  const EMAIL_ADDRESS = "artemonjoy@gmail.com";

  useEffect(() => {
    fetchDynamicCategories();
  }, []);

  // NEW: Fetch categories from Firestore to replace hardcoded list
  const fetchDynamicCategories = async () => {
    try {
      const docRef = doc(db, "settings", "categories");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const catList = docSnap.data().list || [];
        // Take the first 4 for the footer to keep the layout balanced
        setCategories(catList.slice(0, 4).map(cat => ({
          id: cat.toLowerCase(),
          label: cat.charAt(0).toUpperCase() + cat.slice(1)
        })));
      }
    } catch (err) {
      console.error("Footer categories fetch error:", err);
    }
  };

  return (
    <div className="relative mt-20">
      {/* Wave Shape Divider */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180 -translate-y-[98%] z-0">
        <svg className="relative block w-[calc(100%+1.3px)] h-[40px] md:h-[100px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#1e1b4b"></path>
        </svg>
      </div>

      <footer className="bg-[#1e1b4b] text-blue-100 pt-10 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          <div className="mb-12 md:mb-16">
            <Newsletter />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 border-b border-indigo-900/50 pb-12">
            
            {/* Branding & Social */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-1 bg-white rounded-full">
                   <img src="/artemon_joy_logo.webp" alt="Artemon Joy" className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover" />
                </div>
                <span className="font-black font-brand text-xl md:text-2xl text-white tracking-tight">Artemon Joy</span>
              </div>
              <p className="text-indigo-300 text-sm leading-relaxed font-medium">
                Sparking imagination and joy in every child. We curate safe, educational, and magical toys for the next generation of dreamers.
              </p>
              <div className="flex gap-4">
                {SOCIAL_LINKS.map((social) => (
                  <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-indigo-900/50 rounded-xl hover:bg-indigo-600 hover:text-white text-indigo-300 transition-all active:scale-90">
                    <social.icon size={20} />
                  </a>
                ))}
              </div>
            </div>

            {/* DYNAMIC CATEGORIES */}
            <div>
              <h3 className="text-white font-black uppercase text-xs tracking-widest mb-6">Explore Collections</h3>
              <ul className="space-y-3">
                {categories.length > 0 ? (
                   categories.map((cat) => (
                    <li key={cat.id}>
                      <Link to={`${ROUTE_MAP.SHOP}?category=${cat.id}`} className="text-indigo-200 hover:text-white flex items-center gap-2 transition-all group text-sm font-bold">
                        <span className="h-1 w-1 rounded-full bg-indigo-500 group-hover:w-3 transition-all"></span> {cat.label}
                      </Link>
                    </li>
                  ))
                ) : (
                  // Fallback during loading
                  ['Trending', 'New Arrivals', 'Shop All'].map((item) => (
                    <li key={item}>
                      <Link to={ROUTE_MAP.SHOP} className="text-indigo-200 hover:text-white flex items-center gap-2 transition-all group text-sm font-bold">
                        <span className="h-1 w-1 rounded-full bg-indigo-500 group-hover:w-3 transition-all"></span> {item}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* SUPPORT LINKS */}
            <div>
              <h3 className="text-white font-black uppercase text-xs tracking-widest mb-6">Support Hub</h3>
              <ul className="space-y-3">
                {[
                  { label: 'Track Order', path: '/track-order' }, 
                  { label: 'Shipping Info', path: '/shipping' }, 
                  { label: 'Returns & Exchange', path: '/returns' }, 
                  { label: 'FAQs', path: '/faq' }, 
                  { label: 'Privacy Policy', path: '/privacy' }
                ].map((item) => (
                  <li key={item.label}>
                    <Link to={item.path} className="text-indigo-200 hover:text-white transition-colors text-sm font-bold active:translate-x-1 inline-block">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* CONTACT INFO */}
            <div>
              <h3 className="text-white font-black uppercase text-xs tracking-widest mb-6">Get In Touch</h3>
              <ul className="space-y-4">
                <li>
                  <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 group">
                    <div className="mt-0.5 p-2 bg-indigo-900/50 rounded-xl text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <MapPin size={16} />
                    </div>
                    <span className="text-xs md:text-sm text-indigo-200 font-bold leading-relaxed group-hover:text-white transition-colors">
                      Mankur Rd, Hijlak, <br/>West Bengal 711303
                    </span>
                  </a>
                </li>
                <li>
                  <a href={`tel:${PHONE_NUMBER}`} className="flex items-center gap-3 group">
                    <div className="p-2 bg-indigo-900/50 rounded-xl text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Phone size={16} />
                    </div>
                    <span className="text-xs md:text-sm text-indigo-200 font-mono font-bold group-hover:text-white transition-colors">
                      {PHONE_NUMBER}
                    </span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar: Copyright & Payments */}
          <div className="pt-8 flex flex-col lg:flex-row justify-between items-center gap-8">
            <p className="text-[10px] md:text-xs text-indigo-400 font-black uppercase tracking-widest order-2 lg:order-1">
              © {new Date().getFullYear()} Artemon Joy. Curating Joy Globally.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 order-1 lg:order-2 w-full sm:w-auto">
              {/* Trust Badge */}
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full w-full sm:w-auto justify-center">
                <Lock size={12} className="text-green-400" />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">
                  Secure Encryption Active
                </span>
              </div>

              {/* Payment Methods */}
              <div className="flex items-center justify-center gap-3">
                {PAYMENT_METHODS.map((method) => (
                  <div 
                    key={method.name}
                    className="h-10 w-14 md:w-16 bg-white/5 backdrop-blur-md rounded-xl flex items-center justify-center p-2 border border-white/10 active:scale-95 transition-all shadow-lg"
                  >
                    <img src={method.src} alt={method.name} className={`${method.className} object-contain`} />
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