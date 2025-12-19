// Filename: src/context/ProductModalContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';

const ProductModalContext = createContext();

export function useProductModal() {
  return useContext(ProductModalContext);
}

export function ProductModalProvider({ children }) {
  const [modalProduct, setModalProduct] = useState(null);

  const openModal = useCallback((product) => {
    setModalProduct(product);
    document.body.style.overflow = 'hidden'; 
  }, []);

  const closeModal = useCallback(() => {
    setModalProduct(null);
    document.body.style.overflow = 'auto';
  }, []);

  return (
    <ProductModalContext.Provider value={{ modalProduct, openModal, closeModal }}>
      {children}
    </ProductModalContext.Provider>
  );
}