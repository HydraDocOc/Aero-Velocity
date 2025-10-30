// Database Service
// Handles Firestore operations

import { db, isFirebaseConfigured } from '../config/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  deleteDoc,
  doc,
} from 'firebase/firestore';

/**
 * Get all datasets for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of dataset objects
 */
export const getUserDatasets = async (userId) => {
  if (!isFirebaseConfigured()) {
    console.warn('⚠️ Firebase not configured. Using mock data.');
    return mockGetUserDatasets(userId);
  }

  try {
    const q = query(
      collection(db, 'datasets'),
      where('userId', '==', userId),
      orderBy('uploadedAt', 'desc'),
      limit(50)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting datasets:', error);
    throw error;
  }
};

/**
 * Get a single dataset by ID
 * @param {string} datasetId - Dataset ID
 * @returns {Promise<Object|null>} Dataset object or null
 */
export const getDataset = async (datasetId) => {
  if (!isFirebaseConfigured()) {
    console.warn('⚠️ Firebase not configured. Using mock data.');
    return mockGetDataset(datasetId);
  }

  try {
    const q = query(
      collection(db, 'datasets'),
      where('__name__', '==', datasetId)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data(),
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting dataset:', error);
    throw error;
  }
};

/**
 * Save prediction results
 * @param {string} userId - User ID
 * @param {Object} predictionData - Prediction results
 * @returns {Promise<string>} Document ID
 */
export const savePrediction = async (userId, predictionData) => {
  if (!isFirebaseConfigured()) {
    console.warn('⚠️ Firebase not configured. Using mock save.');
    return mockSavePrediction(userId, predictionData);
  }

  try {
    const data = {
      userId,
      createdAt: new Date().toISOString(),
      ...predictionData,
    };
    const docRef = await addDoc(collection(db, 'predictions'), data);
    return docRef.id;
  } catch (error) {
    console.error('Error saving prediction:', error);
    throw error;
  }
};

/**
 * Get predictions for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of prediction objects
 */
export const getUserPredictions = async (userId) => {
  if (!isFirebaseConfigured()) {
    console.warn('⚠️ Firebase not configured. Using mock data.');
    return mockGetUserPredictions(userId);
  }

  try {
    const q = query(
      collection(db, 'predictions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting predictions:', error);
    throw error;
  }
};

/**
 * Delete a dataset
 * @param {string} datasetId - Dataset ID
 */
export const deleteDataset = async (datasetId) => {
  if (!isFirebaseConfigured()) {
    console.warn('⚠️ Firebase not configured. Using mock delete.');
    return mockDeleteDataset(datasetId);
  }

  try {
    await deleteDoc(doc(db, 'datasets', datasetId));
  } catch (error) {
    console.error('Error deleting dataset:', error);
    throw error;
  }
};

// Mock implementations
const mockGetUserDatasets = async (userId) => {
  return [
    {
      id: 'mock-1',
      fileName: 'dataset1.csv',
      uploadedAt: new Date().toISOString(),
      userId,
    },
    {
      id: 'mock-2',
      fileName: 'dataset2.csv',
      uploadedAt: new Date().toISOString(),
      userId,
    },
  ];
};

const mockGetDataset = async (datasetId) => {
  return {
    id: datasetId,
    fileName: 'dataset.csv',
    uploadedAt: new Date().toISOString(),
  };
};

const mockSavePrediction = async (userId, predictionData) => {
  return `mock-prediction-${Date.now()}`;
};

const mockGetUserPredictions = async (userId) => {
  return [];
};

const mockDeleteDataset = async (datasetId) => {
  console.log(`Mock delete: ${datasetId}`);
};

