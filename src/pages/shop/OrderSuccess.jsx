// Filename: src/pages/shop/OrderSuccess.jsx
import { Link } from 'react-router-dom';
import { CheckCircle, Home, ShoppingBag } from 'lucide-react';

export default function OrderSuccess() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl text-center animate-pop-in">
        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 mb-8">
          Thank you for your purchase. We have received your order and are getting it ready!
        </p>

        <div className="space-y-3">
          <Link to="/shop" className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all">
            Continue Shopping
          </Link>
          <Link to="/" className="block w-full bg-white border-2 border-gray-100 hover:border-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}