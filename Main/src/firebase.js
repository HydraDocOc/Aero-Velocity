// Firebase initialization for Aero Velocity
// Reuses existing app if already initialized

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  RecaptchaVerifier,
} from 'firebase/auth';

// Expect env vars (Vite):
// VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID,
// VITE_FIREBASE_APP_ID, VITE_FIREBASE_MESSAGING_SENDER_ID

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

// Initialize only once
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Helper to ensure one global reCAPTCHA verifier for phone auth
export function getOrCreateRecaptcha(containerId = 'recaptcha-container', size = 'invisible') {
  if (!window._aeroRecaptcha) {
    window._aeroRecaptcha = new RecaptchaVerifier(auth, containerId, {
      size,
      callback: () => {},
      'expired-callback': () => {},
    });
  }
  return window._aeroRecaptcha;
}

export default app;


