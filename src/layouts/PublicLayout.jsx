// Filename: src/layouts/PublicLayout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProductQuickViewModal from '../components/product/ProductQuickViewModal'; // <--- NEW IMPORT
import { ProductModalProvider } from '../context/ProductModalContext'; // <--- NEW IMPORT

export default function PublicLayout() {
  return (
    // Wrap entire layout in the provider
    <ProductModalProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow">
          <Outlet /> {/* This renders the child page (Home, Shop, etc.) */}
        </main>
        <Footer />
        
        {/* Render the modal at the end of the layout */}
        <ProductQuickViewModal /> 
      </div>
    </ProductModalProvider>
  );
}