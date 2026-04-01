import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously, signInWithEmailAndPassword } from "firebase/auth";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | null = null;

export function getFirebaseApp() {
  if (app) return app;
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) return null;
  app = getApps()[0] ?? initializeApp(firebaseConfig);
  return app;
}

export function getDb() {
  const a = getFirebaseApp();
  if (!a) return null;
  return getFirestore(a);
}

export function getAuthService() {
  const a = getFirebaseApp();
  if (!a) return null;
  return getAuth(a);
}

export { signInAnonymously, signInWithEmailAndPassword };

export async function getAnalyticsIfAvailable() {
  const a = getFirebaseApp();
  if (!a) return null;
  if (!(await isAnalyticsSupported())) return null;
  return getAnalytics(a);
}
