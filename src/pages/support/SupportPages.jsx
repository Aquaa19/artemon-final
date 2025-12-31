// Filename: src/pages/support/SupportPages.jsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Truck, HelpCircle, Shield, RefreshCw, 
  FileText, Package, Clock, CheckCircle2,
  AlertCircle, ChevronDown, ChevronUp, Mail, ExternalLink,
  Info, ShieldAlert, CreditCard, Gift
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { ROUTE_MAP } from '../../App'; 
import { motion, AnimatePresence } from 'framer-motion';

const SupportLayout = ({ title, icon: Icon, date = "Dec 2025", children }) => (
  <div className="min-h-screen bg-gray-50 pt-24 md:pt-32 pb-16 px-4">
    <div className="max-w-4xl mx-auto">
      <Link to={ROUTE_MAP.HOME} className="inline-flex items-center text-gray-400 hover:text-indigo-600 mb-8 font-black uppercase text-[10px] tracking-widest transition-all group">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Playground
      </Link>
      
      <div className="bg-white rounded-[2.5rem] p-8 md:p-14 shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <Icon size={200} />
        </div>

        <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-gray-50 pb-8">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl shadow-inner">
                       <Icon className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">{title}</h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Effective Date: {date}</p>
                    </div>
                </div>
            </div>

            <div className="prose prose-indigo max-w-none text-gray-600 leading-relaxed space-y-8">
              {children}
            </div>

            <div className="mt-16 pt-8 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                <div>
                    <p className="text-sm font-bold text-gray-900">Still have questions?</p>
                    <p className="text-xs text-gray-400">Our support team is ready to help your child's journey.</p>
                </div>
                <div className="flex gap-3">
                    <a href="mailto:artemonjoy@gmail.com" className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95 transition-all">
                        <Mail size={14} /> Contact Us
                    </a>
                </div>
            </div>
        </div>
      </div>
    </div>
  </div>
);

export const TrackOrder = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(!!orderId);

  useEffect(() => {
    if (orderId) fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const docRef = doc(db, "orders", orderId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setOrder({ id: docSnap.id, ...docSnap.data() });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (orderId) {
    return (
      <SupportLayout title="Package Tracking" icon={Truck}>
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <RefreshCw className="animate-spin text-indigo-600 w-10 h-10" />
            <p className="font-black text-[10px] text-gray-400 uppercase tracking-widest">Intercepting Signal...</p>
          </div>
        ) : order ? (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-indigo-50/50 rounded-3xl p-8 border border-indigo-100/50 relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Live Status</span>
                  <h2 className="text-2xl font-black text-indigo-900 font-mono mt-1">#{order.id.slice(-12).toUpperCase()}</h2>
                </div>
                <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm
                  ${order.status === 'Delivered' ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white animate-pulse'}`}>
                  {order.status}
                </div>
              </div>
              <div className="flex flex-wrap gap-6 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                <div className="flex items-center gap-2"><Clock size={14}/> Booked: {new Date(order.createdAt?.toDate?.() || order.createdAt).toLocaleDateString()}</div>
                <div className="flex items-center gap-2"><Package size={14}/> Manifest: {order.items?.length} Items</div>
              </div>
            </div>

            <div className="relative pl-10 space-y-12 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-1 before:bg-gray-100">
               <div className="relative">
                  <div className={`absolute -left-10 w-10 h-10 rounded-full border-4 border-white shadow-md flex items-center justify-center transition-colors ${order.status === 'Pending' ? 'bg-indigo-600 animate-bounce' : 'bg-green-500'}`}>
                    <CheckCircle2 size={18} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-lg">Order Processed</h4>
                    <p className="text-sm text-gray-400 font-medium">Payment verified and items allocated in our fulfillment center.</p>
                  </div>
               </div>
               
               <div className={`relative ${order.status === 'Pending' ? 'opacity-30' : 'opacity-100'}`}>
                  <div className={`absolute -left-10 w-10 h-10 rounded-full border-4 border-white shadow-md flex items-center justify-center transition-colors ${order.status === 'Shipped' ? 'bg-indigo-600 animate-pulse' : order.status === 'Delivered' ? 'bg-green-500' : 'bg-gray-200'}`}>
                    <Truck size={18} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-lg">Handed to Logistics</h4>
                    <p className="text-sm text-gray-400 font-medium">Package is currently being sorted at the main hub for regional dispatch.</p>
                  </div>
               </div>

               <div className={`relative ${order.status !== 'Delivered' ? 'opacity-30' : 'opacity-100'}`}>
                  <div className={`absolute -left-10 w-10 h-10 rounded-full border-4 border-white shadow-md flex items-center justify-center transition-colors ${order.status === 'Delivered' ? 'bg-green-500' : 'bg-gray-200'}`}>
                    <Package size={18} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-lg">Safely Delivered</h4>
                    <p className="text-sm text-gray-400 font-medium">Package reached its destination. Time to open the box of joy!</p>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-red-50/50 rounded-3xl border border-red-100">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={56} />
            <h3 className="text-xl font-black text-gray-900">Trace Failed</h3>
            <p className="text-sm text-gray-500 mb-8 max-w-xs mx-auto">The Order ID provided does not match our current logistics records.</p>
            <Link to={ROUTE_MAP.PROFILE} className="inline-block bg-white text-gray-900 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm border border-red-100 transition-all hover:bg-red-50">View Purchase History</Link>
          </div>
        )}
      </SupportLayout>
    );
  }

  return (
    <SupportLayout title="Tracking Hub" icon={Truck}>
      <div className="space-y-6">
        <p className="text-lg font-medium text-gray-700">Tracking numbers are activated within 12 hours of shipment dispatch.</p>
        <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-100">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-80 flex items-center gap-2"><Info size={14}/> Secure Tracking</h4>
            <p className="text-sm leading-relaxed mb-6 font-medium">To view the real-time location of your toys, please visit your account dashboard where all live tracking links are synchronized.</p>
            <Link to={ROUTE_MAP.PROFILE} className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">Go to Dashboard <ExternalLink size={12}/></Link>
        </div>
      </div>
    </SupportLayout>
  );
};

export const Terms = () => (
  <SupportLayout title="Legal Framework" icon={FileText}>
    <section>
        <h3 className="text-xl font-black text-gray-900 flex items-center gap-3 mb-4">
            <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div> 1.0 Agreement of Use
        </h3>
        <p>By interacting with the Artemon Joy marketplace ("Service"), you signify a binding legal agreement to comply with these terms. Our Service is designed for adults to purchase items for children; minors must use the platform only with parental supervision.</p>
    </section>

    <section>
        <h3 className="text-xl font-black text-gray-900 flex items-center gap-3 mb-4">
            <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div> 2.0 Product Fidelity
        </h3>
        <p>We strive for absolute accuracy in product rendering. However, screen calibration varies. Artemon Joy does not warrant that product descriptions or images are 100% error-free. If a product is not as described, your sole remedy is to return it in unused condition.</p>
    </section>

    <section>
        <h3 className="text-xl font-black text-gray-900 flex items-center gap-3 mb-4">
            <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div> 3.0 Limitation of Liability
        </h3>
        <div className="bg-gray-50 p-6 rounded-2xl border-l-4 border-gray-200">
            <p className="text-xs font-bold leading-relaxed italic">ARTEMON JOY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES RESULTING FROM THE USE OR THE INABILITY TO USE THE SERVICE OR FOR COST OF PROCUREMENT OF SUBSTITUTE GOODS.</p>
        </div>
    </section>

    <section>
        <h3 className="text-xl font-black text-gray-900 flex items-center gap-3 mb-4">
            <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div> 4.0 User-Generated Content
        </h3>
        <p>By posting reviews or images, you grant Artemon Joy a non-exclusive, royalty-free, perpetual, and fully sub-licensable right to use, reproduce, and display such content globally.</p>
    </section>
  </SupportLayout>
);

export const ShippingInfo = () => (
  <SupportLayout title="Delivery Network" icon={Truck}>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
            <h4 className="font-black text-indigo-900 text-sm uppercase tracking-widest mb-2">Standard Delivery</h4>
            <p className="text-xs font-bold text-indigo-400 mb-4">3 - 5 Business Days</p>
            <p className="text-sm text-gray-600 font-medium">Optimal for non-urgent joy. Fully tracked from hub to doorstep.</p>
        </div>
        <div className="bg-secondary/10 p-6 rounded-3xl border border-secondary/20">
            <h4 className="font-black text-secondary text-sm uppercase tracking-widest mb-2">Express Route</h4>
            <p className="text-xs font-bold text-secondary/60 mb-4">1 - 2 Business Days</p>
            <p className="text-sm text-gray-600 font-medium">Available for select Tier-1 cities. Prioritized dispatch within 4 hours.</p>
        </div>
    </div>

    <section className="mt-10">
        <h3 className="text-xl font-black text-gray-900 mb-4">Coverage & Costs</h3>
        <ul className="space-y-4">
            <li className="flex items-start gap-3">
                <CheckCircle2 className="text-green-500 shrink-0 mt-1" size={18} />
                <span className="text-sm font-medium"><strong>Free Shipping:</strong> Automatically applied to all orders exceeding ₹999 total cart value.</span>
            </li>
            <li className="flex items-start gap-3">
                <CheckCircle2 className="text-green-500 shrink-0 mt-1" size={18} />
                <span className="text-sm font-medium"><strong>Flat Rate:</strong> A logistical fee of ₹99 is applied to orders below the threshold to maintain delivery quality.</span>
            </li>
            <li className="flex items-start gap-3">
                <CheckCircle2 className="text-green-500 shrink-0 mt-1" size={18} />
                <span className="text-sm font-medium"><strong>Remote Regions:</strong> Delivery to NE India and island territories may incur a 2-day buffer delay.</span>
            </li>
        </ul>
    </section>
  </SupportLayout>
);

export const Returns = () => (
  <SupportLayout title="The Joy Guarantee" icon={RefreshCw}>
    <section className="bg-secondary rounded-[2rem] p-8 text-white mb-10">
        <h3 className="text-xl font-black mb-2 flex items-center gap-2"><Shield size={24}/> 30-Day Protection</h3>
        <p className="text-sm font-medium opacity-90 leading-relaxed">If the spark of joy is missing, we take it back. No questions asked for unused items returned within 30 days of the delivery timestamp.</p>
    </section>

    <h3 className="text-xl font-black text-gray-900 mb-6">Return Eligibility Protocol</h3>
    <div className="space-y-4">
        {[
            { t: "Original Condition", d: "Items must remain unworn, unwashed, and without any visible signs of play-wear." },
            { t: "Authentic Packaging", d: "The branded box and all internal inserts (including manuals) must be intact." },
            { t: "Hygiene Standard", d: "Plush toys and teething rings must have the safety hygiene seal unbroken." }
        ].map((step, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center font-black text-indigo-600 text-xs shrink-0">{idx + 1}</div>
                <div>
                    <p className="text-sm font-black text-gray-900">{step.t}</p>
                    <p className="text-xs text-gray-500 font-medium">{step.d}</p>
                </div>
            </div>
        ))}
    </div>

    <section className="mt-10">
        <h3 className="text-xl font-black text-gray-900 mb-4">Refund Methodology</h3>
        <p className="text-sm font-medium">Once validated by our quality inspectors, refunds are initiated within 48 hours. Credits appear in your original payment method within 5-7 business days depending on your banking provider.</p>
    </section>
  </SupportLayout>
);

export const FAQ = () => {
    const [openIdx, setOpenIdx] = useState(0);
    const faqs = [
        { q: "🛡️ How safe are the materials used in toys?", a: "Every single item in our inventory is EN71 and BIS certified. We prioritize eco-friendly, BPA-free plastics and non-toxic, lead-free organic dyes. Safety is our non-negotiable standard.", cat: "Safety" },
        { q: "🌍 Do you support international shipping?", a: "Artemon Joy currently optimizes logistics for the Indian subcontinent. We are aggressively working on international logistics to bring our curated collection to the global market by late 2026.", cat: "Logistics" },
        { q: "💳 Can I pay using EMI or Pay Later options?", a: "Yes. During checkout, our secure payment gateway (powered by 256-bit SSL) offers major credit card EMIs and popular 'Buy Now Pay Later' services for a frictionless experience.", cat: "Finance" },
        { q: "🎁 Is it possible to include a personalized message?", a: "Absolutely! Select 'Premium Gifting' during checkout. We will include a handwritten-style note and wrap your package in our signature sustainable joyous paper.", cat: "Gifting" },
        { q: "🎨 Do you accept bulk orders for birthday parties?", a: "Yes, we love being part of celebrations. For orders exceeding 20 units of a single SKU, please contact our concierge team at artemonjoy@gmail.com for bulk pricing.", cat: "Corporate" }
    ];

    return (
        <SupportLayout title="Knowledge Hub" icon={HelpCircle}>
            <div className="space-y-4">
                {faqs.map((faq, i) => (
                    <div key={i} className={`border rounded-3xl transition-all duration-300 ${openIdx === i ? 'border-indigo-200 bg-indigo-50/30' : 'border-gray-100 bg-white hover:border-indigo-100'}`}>
                        <button onClick={() => setOpenIdx(openIdx === i ? -1 : i)} className="w-full text-left p-6 flex justify-between items-center gap-4">
                            <div className="space-y-1">
                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{faq.cat}</span>
                                <p className="font-black text-gray-900 md:text-lg tracking-tight">{faq.q}</p>
                            </div>
                            <div className="p-2 bg-gray-50 rounded-xl shrink-0">
                                {openIdx === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </div>
                        </button>
                        <AnimatePresence>
                            {openIdx === i && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <div className="px-6 pb-6 text-sm md:text-base text-gray-600 font-medium leading-relaxed border-t border-indigo-100/50 pt-4">
                                        {faq.a}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </SupportLayout>
    );
};

export const Privacy = () => (
  <SupportLayout title="Privacy Architecture" icon={Shield}>
    <section>
        <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <ShieldAlert size={20} className="text-indigo-600"/> Data Governance
        </h3>
        <p>At Artemon Joy, data privacy is an engineering priority. We utilize Google Firebase's military-grade encryption for all user profiles and transaction logs. Your personal data is never sold to third-party marketing brokers.</p>
    </section>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
        <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
            <div className="p-3 bg-white w-fit rounded-xl mb-4 shadow-sm"><FileText size={18} className="text-indigo-600"/></div>
            <h4 className="font-black text-xs uppercase tracking-widest mb-2">Collected</h4>
            <p className="text-[11px] font-medium text-gray-500">Name, Email, Delivery GPS, and Payment tokens.</p>
        </div>
        <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
            <div className="p-3 bg-white w-fit rounded-xl mb-4 shadow-sm"><Shield size={18} className="text-indigo-600"/></div>
            <h4 className="font-black text-xs uppercase tracking-widest mb-2">Protection</h4>
            <p className="text-[11px] font-medium text-gray-500">256-bit SSL Transit & AES-256 At-Rest Encryption.</p>
        </div>
        <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
            <div className="p-3 bg-white w-fit rounded-xl mb-4 shadow-sm"><RefreshCw size={18} className="text-indigo-600"/></div>
            <h4 className="font-black text-xs uppercase tracking-widest mb-2">Control</h4>
            <p className="text-[11px] font-medium text-gray-500">Right to erasure and data portability at any time.</p>
        </div>
    </div>

    <section>
        <h3 className="text-xl font-black text-gray-900 mb-4">Cookie Protocol</h3>
        <p className="text-sm font-medium">We use essential cookies to maintain your shopping cart state and session security. Analytical cookies are only activated with your explicit consent to help us optimize the joyful experience.</p>
    </section>
  </SupportLayout>
);