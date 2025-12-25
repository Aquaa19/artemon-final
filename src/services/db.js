// Filename: src/services/db.js
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

const PRODUCTS_COLLECTION = 'products';
const REVIEWS_COLLECTION = 'reviews';
const USERS_COLLECTION = 'users';
const ORDERS_COLLECTION = 'orders';

/**
 * Helper to ensure we always use optimized .webp images for faster loading.
 */
const optimizeImageUrl = (url) => {
  if (!url) return url;
  // Replaces .jpg, .jpeg, or .png with .webp (case insensitive)
  return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
};

export const firestoreService = {
  // --- PRODUCT OPERATIONS ---
  getProducts: async (filters = {}) => {
    try {
      let q = collection(db, PRODUCTS_COLLECTION);
      const constraints = [];

      if (filters.category && filters.category !== 'all') {
        constraints.push(where('category', '==', filters.category));
      }

      if (filters.trending) {
        constraints.push(where('isTrending', '==', true));
      }

      if (filters.newArrivals) {
        constraints.push(orderBy('createdAt', 'desc'));
        constraints.push(limit(10));
      }

      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }

      const querySnapshot = await getDocs(q);
      
      // FIXED: Map and transform image paths to .webp
      let products = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          image: optimizeImageUrl(data.image)
        };
      });

      if (filters.search) {
        const term = filters.search.toLowerCase();
        products = products.filter(p =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
        );
      }

      return products;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  getProductById: async (id) => {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    return { 
      id: docSnap.id, 
      ...data,
      image: optimizeImageUrl(data.image) // FIXED: Transform single product image
    };
  },

  addProduct: async (productData) => {
    return await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...productData,
      createdAt: serverTimestamp()
    });
  },

  updateProduct: async (id, productData) => {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    return await updateDoc(docRef, productData);
  },

  deleteProduct: async (id) => {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    return await deleteDoc(docRef);
  },

  // --- USER & ADMIN OPERATIONS ---
  getAllUsers: async () => {
    try {
      const snapshot = await getDocs(collection(db, USERS_COLLECTION));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    const docRef = doc(db, USERS_COLLECTION, id);
    return await deleteDoc(docRef);
  },

  // --- ORDER OPERATIONS ---
  getAllOrders: async () => {
    try {
      const q = query(
        collection(db, ORDERS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  },

  createOrder: async (orderData) => {
    try {
      const ordersRef = collection(db, ORDERS_COLLECTION);
      const finalOrder = {
        ...orderData,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(ordersRef, finalOrder);
      return docRef.id;
    } catch (error) {
      console.error("Firestore Service Error (createOrder):", error);
      throw error;
    }
  },

  updateOrderStatus: async (id, status) => {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    return await updateDoc(docRef, { status });
  },

  // --- REVIEW OPERATIONS ---
  getProductReviews: async (productId) => {
    try {
      const q = query(
        collection(db, REVIEWS_COLLECTION),
        where('product_id', '==', productId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error fetching reviews:", error);
      throw error;
    }
  },

  // --- ADMIN REVIEW MODERATION ---
  getAllAdminReviews: async () => {
    try {
      const q = query(
        collection(db, REVIEWS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error fetching all reviews:", error);
      throw error;
    }
  },

  updateReviewStatus: async (id, status) => {
    const docRef = doc(db, REVIEWS_COLLECTION, id);
    return await updateDoc(docRef, { status });
  },

  deleteReview: async (id) => {
    const docRef = doc(db, REVIEWS_COLLECTION, id);
    return await deleteDoc(docRef);
  },

  // --- SEARCH HISTORY ---
  getSearchHistory: async (userId) => {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists()
      ? docSnap.data().searchHistory || []
      : [];
  },

  saveSearchTerm: async (userId, term) => {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const currentHistory = await firestoreService.getSearchHistory(userId);

    const newHistory = [
      term,
      ...currentHistory.filter(t => t !== term)
    ].slice(0, 10);

    return await updateDoc(userRef, { searchHistory: newHistory });
  },

  updateUserSearchHistory: async (userId, historyArray) => {
    const userRef = doc(db, USERS_COLLECTION, userId);
    return await updateDoc(userRef, { searchHistory: historyArray });
  }
};