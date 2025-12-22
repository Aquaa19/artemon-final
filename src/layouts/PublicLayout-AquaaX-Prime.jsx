// Filename: src/layouts/PublicLayout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProductQuickViewModal from '../components/product/ProductQuickViewModal';
import { ProductModalProvider } from '../context/ProductModalContext';

export default function PublicLayout() {
  return (
    <ProductModalProvider>
      {/* REMOVED bg-gray-50 to allow the navbar blur to see through to the body */}
      <div className="min-h-screen flex flex-col bg-transparent"> 
        <Navbar />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
        <ProductQuickViewModal /> 
      </div>
    </ProductModalProvider>
  );
}