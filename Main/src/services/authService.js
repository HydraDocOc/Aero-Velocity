// Authentication Service
// Handles user authentication with Firebase Auth

import { auth, isFirebaseConfigured } from '../config/firebase';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

// Only create provider if Firebase is configured
let googleProvider;
if (isFirebaseConfigured()) {
  googleProvider = new GoogleAuthProvider();
}

/**
 * Sign in with Google
 * @returns {Promise<User|null>} User object or null if error
 */
export const signInWithGoogle = async () => {
  if (!isFirebaseConfigured()) {
    console.warn('⚠️ Firebase not configured. Using mock sign-in.');
    return mockSignIn();
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Sign-in error:', error);
    throw error;
  }
};

/**
 * Sign out current user
 */
export const signOutUser = async () => {
  if (!isFirebaseConfigured()) {
    console.warn('⚠️ Firebase not configured. Using mock sign-out.');
    return mockSignOut();
  }

  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
};

/**
 * Listen to auth state changes
 * @param {Function} callback - Function called on auth state change
 * @returns {Function} Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  if (!isFirebaseConfigured()) {
    console.warn('⚠️ Firebase not configured. Using mock auth state.');
    return mockAuthStateChange(callback);
  }

  return onAuthStateChanged(auth, callback);
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
  if (!isFirebaseConfigured()) {
    console.warn('⚠️ Firebase not configured.');
    return mockUser();
  }
  return auth.currentUser;
};

// Mock implementations for development
const mockSignIn = async () => {
  return {
    uid: 'mock-user-123',
    displayName: 'Mock User',
    email: 'mock@aerovelocity.com',
    photoURL: 'https://via.placeholder.com/150',
  };
};

const mockSignOut = async () => {
  console.log('Mock sign-out completed');
};

const mockAuthStateChange = (callback) => {
  // Simulate logged out state initially
  callback(null);
  return () => {}; // Return unsubscribe function
};

const mockUser = () => {
  return null;
};

