import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, browserSessionPersistence, setPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB5ur6YV_tHZXVewRVPfA3KX-J4n663us8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "lpcall-722c9.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "lpcall-722c9",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "lpcall-722c9.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "487560120959",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:487560120959:web:e91fbd5bf13043fa844d4a"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
// Force session persistence (logs out on tab close)
setPersistence(auth, browserSessionPersistence).catch(console.error);

export const googleProvider = new GoogleAuthProvider();
