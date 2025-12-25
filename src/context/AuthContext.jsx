// Filename: src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  signInWithPopup 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
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

          if (!userDoc.exists()) {
            console.warn("User profile not found. Force signing out...");
            await signOut(auth);
            setUser(null);
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

  // --- NEW: Update User Address logic ---
  const updateUserAddress = async (addressData) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      // Sync to Firestore
      await updateDoc(userRef, {
        address: addressData.address,
        city: addressData.city,
        zip: addressData.zip,
        country: addressData.country || 'India'
      });

      // Update local state to trigger UI updates in Checkout/Profile
      setUser(prev => ({
        ...prev,
        address: addressData.address,
        city: addressData.city,
        zip: addressData.zip,
        country: addressData.country || 'India'
      }));
    } catch (error) {
      console.error("Failed to update address in profile:", error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: 'customer',
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
    loginWithGoogle, 
    logout, 
    requestOTP, 
    verifyAndRegister,
    updateUserAddress, // NEW: Exported for Checkout/Profile
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