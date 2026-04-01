import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALRQwCghwF4WFVOlG-iqbTg6hTn9GZdqc",
  authDomain: "bus-connect-1bfe7.firebaseapp.com",
  projectId: "bus-connect-1bfe7",
  storageBucket: "bus-connect-1bfe7.firebasestorage.app",
  messagingSenderId: "460177790787",
  appId: "1:460177790787:web:d0210ffde8766c5e73c1f6",
  measurementId: "G-KBQ5PHJPB7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export default app;