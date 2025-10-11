// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDEEE9utmsp-dB_ZXe-TtoeUt5-yALiOlM",
  authDomain: "cangrejeras-de-santurce.firebaseapp.com",
  projectId: "cangrejeras-de-santurce",
  storageBucket: "cangrejeras-de-santurce.firebasestorage.app",
  messagingSenderId: "487991855897",
  appId: "1:487991855897:web:805dc5406f53df304e1388",
  measurementId: "G-FGRB7WXCB5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (optional)
let analytics;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Firebase Analytics could not be initialized:', error);
  }
}

export { analytics };
export default app;
