// Auth Context
// Manages authentication state across the app

import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithGoogle,
  signOutUser,
  onAuthStateChange,
} from '../services/authService';
import { isFirebaseConfigured } from '../config/firebase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    console.log('🔐 AuthProvider initializing...');
    
    try {
      const configured = isFirebaseConfigured();
      console.log('🔧 Firebase configured:', configured);
      setIsConfigured(configured);

      // Listen to auth state changes
      const unsubscribe = onAuthStateChange((authUser) => {
        console.log('👤 Auth state changed:', authUser);
        setUser(authUser);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('❌ Error in AuthProvider:', error);
      setLoading(false);
    }
  }, []);

  const signIn = async () => {
    try {
      const user = await signInWithGoogle();
      setUser(user);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await signOutUser();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isConfigured,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

