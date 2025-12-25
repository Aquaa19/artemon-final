// Filename: src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  signInWithPopup 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions, googleProvider } from '../services/firebase'; 

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // 1. Fetch User Profile from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
            console.warn("User profile not found. Force signing out...");
            await signOut(auth);
            setUser(null);
            return;
          }

          // 2. Fetch Custom Claims (Admin status) from ID Token
          const idTokenResult = await firebaseUser.getIdTokenResult();
          const userData = userDoc.data();
          
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            // Prioritize custom claims for security, fallback to Firestore data
            role: idTokenResult.claims.role || userData.role || 'customer',
            ...userData
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth Listener Error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // --- NEW: Google Sign-In Logic ---
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // Check if user document exists in Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      // If this is a new user, create their Firestore profile
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: 'customer', // Default role for all new signups
          createdAt: new Date(),
          cart: [],
          wishlist: []
        });
      }
      return firebaseUser;
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      throw error;
    }
  };

  const login = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => signOut(auth);

  const deleteUserPermanently = async (targetUid) => {
    const adminDeleteFunc = httpsCallable(functions, 'adminDeleteUser');
    return await adminDeleteFunc({ targetUid });
  };

  const requestOTP = async (email) => {
    const sendOTPFunction = httpsCallable(functions, 'sendOTP');
    return await sendOTPFunction({ email });
  };

  const verifyAndRegister = async (email, password, otp, name) => {
    const verifyFunction = httpsCallable(functions, 'verifyAndRegister');
    const result = await verifyFunction({ email, password, otp, name });
    if (result.data.success) {
      return await login(email, password);
    }
    throw new Error("Registration failed.");
  };

  const value = { 
    user, 
    loading, 
    login, 
    loginWithGoogle, // Exported for use in Login/Register pages
    logout, 
    requestOTP, 
    verifyAndRegister,
    deleteUserPermanently,
    isAdmin: user?.role === 'admin' 
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);