// Filename: src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your real Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC_HewhclbM8_dbSgt_1wfVIWvE7HyVM9Y",
  authDomain: "artemon-joy.firebaseapp.com",
  projectId: "artemon-joy",
  storageBucket: "artemon-joy.firebasestorage.app",
  messagingSenderId: "825613172914",
  appId: "1:825613172914:web:5eca0bccbaa86cbd1149ab",
  measurementId: "G-MNCL0Z0Z17"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (Optional, but included since it was in your config)
const analytics = getAnalytics(app);

// Initialize and export services for use throughout Artemon Joy
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;