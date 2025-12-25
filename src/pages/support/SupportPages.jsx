// Filename: src/pages/support/SupportPages.jsx
import { Link } from 'react-router-dom';
import { ArrowLeft, Truck, HelpCircle, Shield, RefreshCw, FileText } from 'lucide-react';

const SupportLayout = ({ title, icon: Icon, children }) => (
  <div className="min-h-screen bg-gray-50 pt-28 pb-16 px-4">
    <div className="max-w-3xl mx-auto">
      <Link to="/" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-8 font-medium transition-colors">
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
  </SupportLayout>
);

export const TrackOrder = () => (
  <SupportLayout title="Track Your Order" icon={Truck}>
    <p>Please go to your <Link to="/profile" className="text-indigo-600 font-bold underline">Profile Page</Link> to see the real-time status of your orders.</p>
    <p>Once your order is shipped, a tracking link will appear next to your order details.</p>
  </SupportLayout>
);

export const ShippingInfo = () => (
  <SupportLayout title="Shipping Information" icon={Truck}>
    <h3 className="text-xl font-bold text-gray-900 mb-2">Delivery Times</h3>
    <p className="mb-6">Standard delivery takes 3-5 business days. Express delivery takes 1-2 business days.</p>
    <h3 className="text-xl font-bold text-gray-900 mb-2">Shipping Costs</h3>
    <p>We offer <strong>Free Shipping</strong> on all orders over ₹999. For orders under ₹999, a flat rate of ₹99 applies.</p>
  </SupportLayout>
);

export const Returns = () => (
  <SupportLayout title="Returns & Exchange" icon={RefreshCw}>
    <p className="mb-4">We have a 30-day return policy, which means you have 30 days after receiving your item to request a return.</p>
    <p className="mb-4">To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging.</p>
    <p>To start a return, you can contact us at <a href="mailto:artemonjoy@gmail.com" className="text-indigo-600 font-bold">artemonjoy@gmail.com</a>.</p>
  </SupportLayout>
);

export const FAQ = () => (
  <SupportLayout title="Frequently Asked Questions" icon={HelpCircle}>
    <div className="space-y-6">
      <div>
        <h4 id="shipping-intl" className="font-bold text-gray-900 mb-2">Do you ship internationally?</h4>
        <p>Currently, we only ship within India. We are working on expanding our reach soon!</p>
      </div>
      <div>
        <h4 id="safety" className="font-bold text-gray-900 mb-2">Are the toys safe for toddlers?</h4>
        <p>Yes! All our products are safety certified. Please check the age recommendation on each product page.</p>
      </div>
    </div>
  </SupportLayout>
);

export const Privacy = () => (
  <SupportLayout title="Privacy Policy" icon={Shield}>
    <p className="mb-4">Artemon Joy values your privacy. We only collect information necessary to process your order and improve your shopping experience.</p>
    <p>We do not sell your personal data to third parties. All payments are processed through secure, encrypted gateways.</p>
  </SupportLayout>
);