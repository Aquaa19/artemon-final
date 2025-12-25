// Filename: src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  signInWithPopup 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions, googleProvider } from '../services/firebase'; 

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          // CRITICAL: Prevent force sign-out loop if document hasn't propagated yet
          if (!userDoc.exists()) {
            console.warn("Firestore profile pending...");
            return; 
          }

          const idTokenResult = await firebaseUser.getIdTokenResult();
          const userData = userDoc.data();
          
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
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

  // UPDATED: Now dynamically handles address AND birthday fields
  const updateUserAddress = async (profileData) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      
      // Update Firestore
      await updateDoc(userRef, profileData);

      // Sync local state immediately for UI responsiveness
      setUser(prev => ({
        ...prev,
        ...profileData
      }));
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      // FIXED: Ensure new Google users have a Firestore profile BEFORE redirecting
      if (!userDoc.exists()) {
        const initialData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: 'customer',
          createdAt: serverTimestamp(),
          cart: [],
          wishlist: []
        };
        await setDoc(userDocRef, initialData);
        
        // Update state manually to break the loading loop
        setUser(initialData);
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
    loginWithGoogle, 
    logout, 
    requestOTP, 
    verifyAndRegister,
    updateUserAddress,
    isAdmin: user?.role === 'admin' 
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);