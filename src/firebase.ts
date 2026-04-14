import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Optionally import the local config file if it exists (for AI Studio preview)
// @ts-ignore - Vite glob import
const localConfigs = import.meta.glob('../firebase-applet-config.json', { eager: true });
const configModule = localConfigs['../firebase-applet-config.json'] as any;
const localConfig = configModule?.default || configModule || {};

// Initialize Firebase SDK using environment variables (Netlify) or local config (AI Studio)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || localConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || localConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || localConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || localConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || localConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || localConfig.appId
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, import.meta.env.VITE_FIREBASE_DATABASE_ID || localConfig.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);
