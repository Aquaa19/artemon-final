// Filename: src/pages/support/SupportPages.jsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Truck, HelpCircle, Shield, RefreshCw, 
  FileText, Package, Clock, CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
// IMPORTED: Access the obfuscated route map from Code 1
import { ROUTE_MAP } from '../../App'; 

const SupportLayout = ({ title, icon: Icon, children }) => (
  <div className="min-h-screen bg-gray-50 pt-28 pb-16 px-4">
    <div className="max-w-3xl mx-auto">
      {/* FIXED: Using ROUTE_MAP.HOME from Code 1 */}
      <Link to={ROUTE_MAP.HOME} className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-8 font-medium transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
      </Link>
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
               <Icon className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">{title}</h1>
        </div>
        <div className="prose prose-indigo max-w-none text-gray-600 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  </div>
);

// UPDATED: Dynamic TrackOrder Component with route map integration
export const TrackOrder = () => {
  const { orderId } = useParams(); // Extracts the ID from the URL
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(!!orderId);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const docRef = doc(db, "orders", orderId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() });
      }
    } catch (err) {
      console.error("Error tracking order:", err);
    } finally {
      setLoading(false);
    }
  };

  if (orderId) {
    return (
      <SupportLayout title="Order Tracking" icon={Truck}>
        {loading ? (
          <div className="flex flex-col items-center py-10 gap-4">
            <RefreshCw className="animate-spin text-indigo-600 w-8 h-8" />
            <p className="font-bold text-gray-400">Locating your package...</p>
          </div>
        ) : order ? (
          <div className="space-y-8 animate-fade-in">
            {/* Order Identity */}
            <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Order ID</span>
                  <h2 className="text-xl font-black text-indigo-900 font-mono">#{order.id.slice(-12).toUpperCase()}</h2>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest
                  ${order.status === 'Delivered' ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white animate-pulse'}`}>
                  {order.status}
                </div>
              </div>
              <div className="flex gap-6 text-xs font-bold text-indigo-600/70">
                <div className="flex items-center gap-1.5"><Clock size={14}/> Placed: {new Date(order.createdAt?.toDate?.() || order.createdAt).toLocaleDateString()}</div>
                <div className="flex items-center gap-1.5"><Package size={14}/> {order.items?.length} Items</div>
              </div>
            </div>

            {/* Visual Tracking Progress */}
            <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
               <div className="relative flex items-start gap-4">
                  <div className={`absolute -left-8 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${order.status === 'Pending' ? 'bg-indigo-600' : 'bg-green-500'}`}>
                    <CheckCircle2 size={12} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-sm">Order Confirmed</h4>
                    <p className="text-xs text-gray-400">Your order is being prepared for dispatch.</p>
                  </div>
               </div>
               <div className="relative flex items-start gap-4 opacity-50">
                  <div className="absolute -left-8 w-6 h-6 rounded-full border-4 border-white shadow-sm bg-gray-200 flex items-center justify-center">
                    <Truck size={12} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-sm">In Transit</h4>
                    <p className="text-xs text-gray-400">Waiting for courier pickup.</p>
                  </div>
               </div>
            </div>

            <div className="pt-6 border-t border-gray-100 text-center">
               <p className="text-xs text-gray-400 font-medium italic">Standard delivery usually takes 3-5 business days.</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
            <p className="font-bold text-gray-900">Order Not Found</p>
            <p className="text-sm text-gray-500 mb-6">We couldn't find an order with that ID.</p>
            {/* FIXED: Using ROUTE_MAP.PROFILE from Code 1 */}
            <Link to={ROUTE_MAP.PROFILE} className="text-indigo-600 font-black underline transition-all hover:text-indigo-700">Return to Profile</Link>
          </div>
        )}
      </SupportLayout>
    );
  }

  // Default view when no orderId is provided
  return (
    <SupportLayout title="Track Your Order" icon={Truck}>
      <div className="space-y-4">
        {/* FIXED: Using ROUTE_MAP.PROFILE here to prevent Home redirection */}
        <p>Please go to your <Link to={ROUTE_MAP.PROFILE} className="text-indigo-600 font-bold underline transition-all hover:text-indigo-700">Profile Page</Link> to see the real-time status of your orders.</p>
        <p>Once your order is shipped, a tracking link will appear next to your order details.</p>
        <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl">
          <h4 className="text-amber-800 font-black text-sm mb-2 flex items-center gap-2">
            <Package size={16} /> Tracking Logic
          </h4>
          <p className="text-xs text-amber-700 leading-relaxed">
            Tracking numbers are generated automatically once your joyful package leaves our warehouse. You will receive an email notification with your direct tracking link.
          </p>
        </div>
      </div>
    </SupportLayout>
  );
};

// NEW: Terms of Service Component
export const Terms = () => (
  <SupportLayout title="Terms of Service" icon={FileText}>
    <h3 id="acceptance" className="text-xl font-bold text-gray-900 mb-2">1. Acceptance of Terms</h3>
    <p className="mb-6">By accessing and using Artemon Joy, you accept and agree to be bound by the terms and provisions of this agreement.</p>
    
    <h3 id="usage" className="text-xl font-bold text-gray-900 mb-2">2. Use of Service</h3>
    <p className="mb-6">You agree to use our platform for lawful purposes only and in a way that does not infringe the rights of others or restrict their use of the platform.</p>
    
    <h3 id="account" className="text-xl font-bold text-gray-900 mb-2">3. User Accounts</h3>
    <p className="mb-6">Users are responsible for maintaining the confidentiality of their account credentials and for all activities that occur under their account.</p>
    
    <h3 id="orders" className="text-xl font-bold text-gray-900 mb-2">4. Orders & Payments</h3>
    <p className="mb-6">All orders placed through the site are subject to availability and acceptance. We reserve the right to refuse any order.</p>
    
    <h3 id="intellectual" className="text-xl font-bold text-gray-900 mb-2">5. Intellectual Property</h3>
    <p className="mb-6">All content on the Artemon Joy website, including images, text, and logos, are the property of Artemon Joy and protected by copyright laws.</p>
    
    <h3 id="liability" className="text-xl font-bold text-gray-900 mb-2">6. Limitation of Liability</h3>
    <p>Artemon Joy shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our services.</p>
  </SupportLayout>
);

export const ShippingInfo = () => (
  <SupportLayout title="Shipping Information" icon={Truck}>
    <h3 className="text-xl font-bold text-gray-900 mb-2">Delivery Times</h3>
    <p className="mb-6">Standard delivery takes 3-5 business days. Express delivery takes 1-2 business days.</p>
    
    <h3 className="text-xl font-bold text-gray-900 mb-2">Shipping Costs</h3>
    <p className="mb-6">We offer <strong>Free Shipping</strong> on all orders over ₹999. For orders under ₹999, a flat rate of ₹99 applies.</p>
    
    <h3 className="text-xl font-bold text-gray-900 mb-2">Delivery Areas</h3>
    <p className="mb-6">We currently ship to all major cities and towns across India. Delivery to remote areas may take additional time.</p>
    
    <h3 className="text-xl font-bold text-gray-900 mb-2">Order Processing</h3>
    <p>Orders are typically processed within 24 hours during business days. You will receive a confirmation email once your order has been shipped.</p>
  </SupportLayout>
);

export const Returns = () => (
  <SupportLayout title="Returns & Exchange" icon={RefreshCw}>
    <h3 className="text-xl font-bold text-gray-900 mb-2">30-Day Return Policy</h3>
    <p className="mb-4">We have a 30-day return policy, which means you have 30 days after receiving your item to request a return.</p>
    
    <h3 className="text-xl font-bold text-gray-900 mb-2">Eligibility Conditions</h3>
    <p className="mb-4">To be eligible for a return, your item must be:</p>
    <ul className="list-disc pl-6 mb-4 space-y-2">
      <li>In the same condition that you received it</li>
      <li>Unworn or unused</li>
      <li>With all original tags attached</li>
      <li>In its original packaging</li>
    </ul>
    
    <h3 className="text-xl font-bold text-gray-900 mb-2">How to Initiate a Return</h3>
    <p className="mb-4">To start a return, you can contact us at <a href="mailto:artemonjoy@gmail.com" className="text-indigo-600 font-bold hover:underline">artemonjoy@gmail.com</a> with your order number and reason for return.</p>
    
    <h3 className="text-xl font-bold text-gray-900 mb-2">Refund Processing</h3>
    <p>Refunds are typically processed within 5-7 business days after we receive and inspect the returned items.</p>
  </SupportLayout>
);

export const FAQ = () => (
  <SupportLayout title="Frequently Asked Questions" icon={HelpCircle}>
    <div className="space-y-8">
      <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
        <h4 id="shipping-intl" className="font-bold text-gray-900 mb-2 text-lg">🌍 Do you ship internationally?</h4>
        <p className="text-gray-700">Currently, we only ship within India. We are working on expanding our reach soon to bring joy to children worldwide!</p>
      </div>
      
      <div className="bg-green-50/50 p-6 rounded-2xl border border-green-100">
        <h4 id="safety" className="font-bold text-gray-900 mb-2 text-lg">🛡️ Are the toys safe for toddlers?</h4>
        <p className="text-gray-700">Yes! All our products are safety certified and undergo rigorous testing. Please check the age recommendation on each product page to ensure suitability.</p>
      </div>
      
      <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
        <h4 id="payment" className="font-bold text-gray-900 mb-2 text-lg">💳 What payment methods do you accept?</h4>
        <p className="text-gray-700">We accept all major credit/debit cards, UPI, net banking, and digital wallets. All payments are secured with 256-bit SSL encryption.</p>
      </div>
      
      <div className="bg-purple-50/50 p-6 rounded-2xl border border-purple-100">
        <h4 id="customization" className="font-bold text-gray-900 mb-2 text-lg">🎨 Can I customize my order?</h4>
        <p className="text-gray-700">Currently, we don't offer customization options, but we're working on this exciting feature for future releases! Subscribe to our newsletter for updates.</p>
      </div>
      
      <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
        <h4 id="contact" className="font-bold text-gray-900 mb-2 text-lg">📞 How can I contact customer support?</h4>
        <p className="text-gray-700">You can reach us via email at <a href="mailto:artemonjoy@gmail.com" className="text-indigo-600 font-bold hover:underline">artemonjoy@gmail.com</a> or through our live chat during business hours (10 AM - 6 PM IST).</p>
      </div>
      
      <div className="bg-pink-50/50 p-6 rounded-2xl border border-pink-100">
        <h4 id="gift" className="font-bold text-gray-900 mb-2 text-lg">🎁 Do you offer gift wrapping?</h4>
        <p className="text-gray-700">Yes! We offer premium gift wrapping for ₹99. You can select this option during checkout to make your gift extra special.</p>
      </div>
    </div>
  </SupportLayout>
);

export const Privacy = () => (
  <SupportLayout title="Privacy Policy" icon={Shield}>
    <h3 className="text-xl font-bold text-gray-900 mb-2">Data Collection</h3>
    <p className="mb-4">Artemon Joy values your privacy. We only collect information necessary to process your order, improve your shopping experience, and communicate with you about our products and services.</p>
    
    <h3 className="text-xl font-bold text-gray-900 mb-2">Information We Collect</h3>
    <p className="mb-4">We collect personal information such as your name, email address, shipping address, and payment details when you make a purchase or create an account with us.</p>
    
    <h3 className="text-xl font-bold text-gray-900 mb-2">Data Protection</h3>
    <p className="mb-4">We implement appropriate technical and organizational security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.</p>
    
    <h3 className="text-xl font-bold text-gray-900 mb-2">Third-Party Sharing</h3>
    <p className="mb-6">We do not sell, trade, or rent your personal data to third parties. We only share information with trusted service providers (like shipping carriers) who assist in operating our website and conducting our business.</p>
    
    <h3 className="text-xl font-bold text-gray-900 mb-2">Your Rights</h3>
    <p className="mb-4">You have the right to:</p>
    <ul className="list-disc pl-6 mb-6 space-y-2">
      <li>Access the personal information we hold about you</li>
      <li>Request correction of inaccurate or incomplete information</li>
      <li>Request deletion of your personal information</li>
      <li>Object to or restrict certain types of processing</li>
      <li>Withdraw consent at any time where we rely on consent to process your information</li>
    </ul>
    
    <h3 className="text-xl font-bold text-gray-900 mb-2">Cookies</h3>
    <p>Our website uses cookies to enhance your browsing experience. You can control cookie settings through your browser preferences.</p>
  </SupportLayout>
);