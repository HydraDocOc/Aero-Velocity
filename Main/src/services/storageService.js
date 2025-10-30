// Storage Service
// Handles file uploads to Firebase Storage

import { storage, isFirebaseConfigured } from '../config/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Upload a file to Firebase Storage
 * @param {File} file - File to upload
 * @param {string} userId - User ID
 * @param {Object} metadata - Additional metadata (dataset name, type, etc.)
 * @returns {Promise<Object>} Upload result with URL and metadata
 */
export const uploadDataset = async (file, userId, metadata = {}) => {
  if (!isFirebaseConfigured()) {
    console.warn('⚠️ Firebase not configured. Using mock upload.');
    return mockUpload(file, userId, metadata);
  }

  try {
    // Create storage reference
    const storageRef = ref(
      storage,
      `datasets/${userId}/${Date.now()}_${file.name}`
    );

    // Upload file
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Wait for upload to complete
    await uploadTask;

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);

    // Create metadata object
    const fileMetadata = {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      userId,
      downloadURL,
      ...metadata,
    };

    // Save metadata to Firestore
    const docRef = await addDoc(collection(db, 'datasets'), fileMetadata);

    return {
      id: docRef.id,
      ...fileMetadata,
      status: 'success',
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

/**
 * Get upload progress (for progress bars)
 * @param {File} file - File to upload
 * @param {string} userId - User ID
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<void>}
 */
export const uploadDatasetWithProgress = (file, userId, onProgress) => {
  if (!isFirebaseConfigured()) {
    console.warn('⚠️ Firebase not configured. Using mock upload.');
    return mockUploadWithProgress(file, userId, onProgress);
  }

  return new Promise((resolve, reject) => {
    const storageRef = ref(
      storage,
      `datasets/${userId}/${Date.now()}_${file.name}`
    );

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => {
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const fileMetadata = {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            uploadedAt: new Date().toISOString(),
            userId,
            downloadURL,
          };

          await addDoc(collection(db, 'datasets'), fileMetadata);

          resolve({
            downloadURL,
            metadata: fileMetadata,
            status: 'success',
          });
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};

// Mock implementation for development
const mockUpload = async (file, userId, metadata) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: `mock-${Date.now()}`,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        userId,
        downloadURL: 'https://mock-url.com/file',
        ...metadata,
        status: 'success',
      });
    }, 1000);
  });
};

const mockUploadWithProgress = (file, userId, onProgress) => {
  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      onProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        resolve(mockUpload(file, userId, {}));
      }
    }, 100);
  });
};

