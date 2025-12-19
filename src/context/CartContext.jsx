// Filename: src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../services/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);

  // --- Initialization ---
  useEffect(() => {
    if (authLoading) return;

    const loadData = async () => {
      if (user) {
        // Logged in: Cart and Wishlist come from the User document
        setCartItems(user.cart || []);
        setWishlist(user.wishlist || []);
      } else {
        // Guest: Use LocalStorage
        const storedCart = localStorage.getItem('cart');
        const storedWish = localStorage.getItem('wishlist_guest');
        setCartItems(storedCart ? JSON.parse(storedCart) : []);
        setWishlist(storedWish ? JSON.parse(storedWish) : []);
      }
      setCartLoading(false);
    };

    loadData();
  }, [user, authLoading]);

  // --- Cart Operations ---
  const addToCart = async (product, quantity = 1) => {
    const newItem = { ...product, quantity };
    
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const existingItem = cartItems.find(i => i.id === product.id);
      
      let updatedCart;
      if (existingItem) {
        updatedCart = cartItems.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      } else {
        updatedCart = [...cartItems, newItem];
      }
      
      setCartItems(updatedCart);
      await updateDoc(userRef, { cart: updatedCart });
    } else {
      setCartItems(prev => {
        const existing = prev.find(i => i.id === product.id);
        const updated = existing 
          ? prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i)
          : [...prev, newItem];
        localStorage.setItem('cart', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const removeFromCart = async (id) => {
    const updated = cartItems.filter(i => i.id !== id);
    setCartItems(updated);
    if (user) {
      await updateDoc(doc(db, 'users', user.uid), { cart: updated });
    } else {
      localStorage.setItem('cart', JSON.stringify(updated));
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    if (user) {
      await updateDoc(doc(db, 'users', user.uid), { cart: [] });
    } else {
      localStorage.removeItem('cart');
    }
  };

  // --- Wishlist Operations ---
  const toggleWishlist = async (product) => {
    const isIn = wishlist.some(i => i.id === product.id);
    const updated = isIn ? wishlist.filter(i => i.id !== product.id) : [...wishlist, product];
    
    setWishlist(updated);
    if (user) {
      await updateDoc(doc(db, 'users', user.uid), { wishlist: updated });
    } else {
      localStorage.setItem('wishlist_guest', JSON.stringify(updated));
    }
  };

  const isInWishlist = (id) => wishlist.some(item => item.id === id);
  const getCartCount = () => cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const getCartTotal = () => cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, addToCart, removeFromCart, getCartCount, getCartTotal, clearCart, cartLoading,
      wishlist, toggleWishlist, isInWishlist
    }}>
      {children}
    </CartContext.Provider>
  );
}