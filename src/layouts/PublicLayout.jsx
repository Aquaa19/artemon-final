// Filename: src/layouts/PublicLayout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import WelcomeTour from '../components/layout/WelcomeTour'; // NEW IMPORT
import ProductQuickViewModal from '../components/product/ProductQuickViewModal';
import { ProductModalProvider } from '../context/ProductModalContext';

export default function PublicLayout() {
  return (
    <ProductModalProvider>
      <div className="min-h-screen flex flex-col bg-transparent">
        {/* The Welcome Tour component is now active globally for new users */}
        <WelcomeTour /> 

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