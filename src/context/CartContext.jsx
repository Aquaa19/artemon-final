// Filename: src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

// --- HELPER FUNCTIONS ---
const fetchServerWishlist = async (email) => {
    try {
        const res = await fetch(`/api/favorites/${email}`);
        if (!res.ok) throw new Error('Failed to fetch server wishlist');
        const json = await res.json();
        return json.data || [];
    } catch (e) {
        console.error("Error fetching server wishlist:", e);
        return [];
    }
};

const fetchServerCart = async (email) => {
    try {
        const res = await fetch(`/api/cart/${email}`);
        if (!res.ok) throw new Error('Failed to fetch server cart');
        const json = await res.json();
        return json.data || [];
    } catch (e) {
        console.error("Error fetching server cart:", e);
        return [];
    }
};

const mergeGuestCartToServer = async (email, items) => {
    try {
        await fetch('/api/cart/merge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_email: email, items }),
        });
    } catch (e) {
        console.error("Error merging cart:", e);
    }
};

const updateServerCartItem = async (email, productId, quantity) => {
    try {
        await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_email: email, product_id: productId, quantity }),
        });
    } catch (e) {
        console.error("Error updating server cart:", e);
    }
};

const removeServerCartItem = async (email, productId) => {
    try {
        await fetch('/api/cart', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_email: email, product_id: productId }),
        });
    } catch (e) {
        console.error("Error removing cart item:", e);
    }
};

const clearServerCart = async (email) => {
    try {
        await fetch('/api/cart/clear', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ user_email: email }),
        });
    } catch (e) { console.error(e); }
};

// --- GUEST STORAGE HELPERS ---
const getGuestStorage = (key) => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
    } catch (e) { return []; }
};

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  
  // States
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);

  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);

  // --- INITIALIZATION EFFECT ---
  useEffect(() => {
    if (authLoading) return;

    const initData = async () => {
        setCartLoading(true);
        setWishlistLoading(true);

        if (user) {
            // --- LOGGED IN LOGIC ---

            // 1. Cart: Merge Guest Cart -> Server Cart
            const guestCart = getGuestStorage('cart');
            if (guestCart.length > 0) {
                await mergeGuestCartToServer(user.email, guestCart);
                localStorage.removeItem('cart'); // Clear guest data after merge
            }
            // Fetch updated server cart
            const serverCart = await fetchServerCart(user.email);
            setCartItems(serverCart);

            // 2. Wishlist: Fetch Server Wishlist (Simplified Logic)
            const serverWishlist = await fetchServerWishlist(user.email);
            setWishlist(serverWishlist);

        } else {
            // --- GUEST LOGIC ---
            setCartItems(getGuestStorage('cart'));
            setWishlist(getGuestStorage('wishlist_guest'));
        }

        setCartLoading(false);
        setWishlistLoading(false);
    };

    initData();
  }, [user, authLoading]);


  // --- CART OPERATIONS ---
  const addToCart = async (product, quantity = 1) => {
    // 1. Optimistic Update
    let newItems;
    setCartItems(prev => {
        const existing = prev.find(item => item.id === product.id);
        if (existing) {
            newItems = prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
        } else {
            newItems = [...prev, { ...product, quantity }];
        }
        return newItems;
    });

    // 2. Persistence
    if (user) {
        // Calculate the *total* new quantity for this specific item
        const existing = cartItems.find(item => item.id === product.id);
        const totalQty = existing ? existing.quantity + quantity : quantity;
        await updateServerCartItem(user.email, product.id, totalQty);
    } else {
        // We need to save the *computed* newItems from step 1
        // Since setState is async, we reproduce logic or use a ref. 
        // Simplest: reproduce logic for storage save.
        const currentCart = getGuestStorage('cart');
        const existingIdx = currentCart.findIndex(i => i.id === product.id);
        if (existingIdx > -1) {
            currentCart[existingIdx].quantity += quantity;
        } else {
            currentCart.push({ ...product, quantity });
        }
        localStorage.setItem('cart', JSON.stringify(currentCart));
    }
  };

  const removeFromCart = async (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    
    if (user) {
        await removeServerCartItem(user.email, id);
    } else {
        const current = getGuestStorage('cart').filter(i => i.id !== id);
        localStorage.setItem('cart', JSON.stringify(current));
    }
  };

  const updateQuantity = async (id, quantity) => {
    if (quantity < 1) return;
    
    setCartItems(prev => prev.map(item => (item.id === id ? { ...item, quantity } : item)));

    if (user) {
        await updateServerCartItem(user.email, id, quantity);
    } else {
        const current = getGuestStorage('cart');
        const item = current.find(i => i.id === id);
        if (item) {
            item.quantity = quantity;
            localStorage.setItem('cart', JSON.stringify(current));
        }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    if (user) {
        await clearServerCart(user.email);
    } else {
        localStorage.removeItem('cart');
    }
  };

  const getCartCount = () => cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // --- WISHLIST OPERATIONS (Preserved) ---
  const toggleWishlist = async (product) => {
    const isIn = wishlist.some(i => i.id === product.id);
    const newList = isIn ? wishlist.filter(i => i.id !== product.id) : [...wishlist, product];
    setWishlist(newList);

    if (user) {
        const method = isIn ? 'DELETE' : 'POST';
        try {
            await fetch('/api/favorites', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_email: user.email, product_id: product.id })
            });
        } catch(e) { console.error(e); }
    } else {
        localStorage.setItem('wishlist_guest', JSON.stringify(newList));
    }
  };

  const isInWishlist = (id) => wishlist.some(item => item.id === id);

  return (
    <CartContext.Provider value={{ 
      cartItems, addToCart, removeFromCart, updateQuantity, getCartCount, getCartTotal, clearCart, cartLoading,
      wishlist, toggleWishlist, isInWishlist, wishlistLoading
    }}>
      {children}
    </CartContext.Provider>
  );
}