import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  signInWithPopup,
  getIdTokenResult
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions, googleProvider } from '../services/firebase'; 

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // Explicit state to prevent flickering

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      try {
        if (firebaseUser) {
          // 1. Fetch Token Claims (Primary Security for AI Console)
          const tokenResult = await getIdTokenResult(firebaseUser, true);
          const hasAdminClaim = !!tokenResult.claims.admin;

          // 2. Fetch Firestore Profile
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const roleFromDB = userData.role === 'admin';
            
            // Sync Admin Status: Check both Claims and DB for redundancy
            setIsAdmin(hasAdminClaim || roleFromDB);

            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL || userData.photoURL || null,
              ...userData,
              role: hasAdminClaim ? 'admin' : (userData.role || 'customer')
            });
          } else {
            // New user scenario (usually handled by verifyAndRegister or Google login)
            setIsAdmin(false);
            setUser(null); 
          }
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Critical Auth Sync Error:", error);
        setUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const updateUserAddress = async (profileData) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, profileData);
      setUser(prev => ({ ...prev, ...profileData }));
    } catch (error) {
      console.error("Profile update failed:", error);
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
        setUser(initialData);
        setIsAdmin(false);
      }
      return firebaseUser;
    } catch (error) {
      console.error("Google login failed:", error);
      throw error;
    }
  };

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  const requestOTP = async (email) => {
    const sendOTPFunction = httpsCallable(functions, 'sendOTP');
    return await sendOTPFunction({ email });
  };

  const verifyAndRegister = async (email, password, otp, name) => {
    const verifyFunction = httpsCallable(functions, 'verifyAndRegister');
    const result = await verifyFunction({ email, password, otp, name });
    if (result.data.success) return await login(email, password);
    throw new Error("Registration failed.");
  };

  // Memoize value to prevent unnecessary re-renders of the whole app tree
  const authValue = useMemo(() => ({ 
    user, 
    loading, 
    isAdmin, // Now a stable state, not a calculated field
    login, 
    loginWithGoogle, 
    logout, 
    requestOTP, 
    verifyAndRegister,
    updateUserAddress
  }), [user, loading, isAdmin]);

  return (
    <AuthContext.Provider value={authValue}>
      {/* Ensure children don't render until auth state is fully resolved */}
      {!loading ? children : (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);