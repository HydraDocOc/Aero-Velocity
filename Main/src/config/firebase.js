// Firebase Configuration
// This file initializes Firebase services
// Update .env with your Firebase project credentials

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Check if Firebase keys are configured
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if Firebase is properly configured
export const isFirebaseConfigured = () => {
  try {
    return (
      firebaseConfig.apiKey &&
      typeof firebaseConfig.apiKey === 'string' &&
      firebaseConfig.apiKey.trim() !== '' &&
      firebaseConfig.apiKey !== 'your_api_key_here' &&
      firebaseConfig.authDomain &&
      typeof firebaseConfig.authDomain === 'string' &&
      firebaseConfig.authDomain.trim() !== '' &&
      firebaseConfig.authDomain !== 'your_project_id.firebaseapp.com' &&
      firebaseConfig.projectId &&
      typeof firebaseConfig.projectId === 'string' &&
      firebaseConfig.projectId.trim() !== ''
    );
  } catch (error) {
    console.warn('Error checking Firebase config:', error);
    return false;
  }
};

// Initialize Firebase only if configured
let app = null;
let auth = null;
let db = null;
let storage = null;

try {
  if (isFirebaseConfigured()) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log('✅ Firebase initialized successfully');
  } else {
    console.warn('⚠️ Firebase not configured. App will run in mock mode.');
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  console.warn('Falling back to mock mode');
}

// Export services or mock implementations
export { app, auth, db, storage };

// Export a check function for components
export const getFirebaseStatus = () => {
  return {
    isConfigured: isFirebaseConfigured(),
    hasAuth: !!auth,
    hasDb: !!db,
    hasStorage: !!storage,
  };
};

