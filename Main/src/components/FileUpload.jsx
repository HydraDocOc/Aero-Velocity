// File Upload Component
// Handles file uploads with progress tracking

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { uploadDatasetWithProgress } from '../services/storageService';
import Toast from './Toast';
import './FileUpload.css';

const FileUpload = ({ onUploadComplete }) => {
  const { user, isConfigured } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState({
    datasetName: '',
    description: '',
    type: 'csv',
  });
  const [rowsPreview, setRowsPreview] = useState([]);
  const [toast, setToast] = useState(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      // Auto-fill dataset name
      if (!metadata.datasetName) {
        setMetadata((prev) => ({
          ...prev,
          datasetName: selectedFile.name.replace(/\.[^/.]+$/, ''),
        }));
      }
      // preview first rows
      try {
        const text = await selectedFile.text();
        if (selectedFile.name.endsWith('.csv')) {
          const lines = text.split(/\r?\n/).filter(Boolean);
          if (lines.length > 1) {
            const headers = lines[0].split(',');
            const data = lines.slice(1, 6).map((line) => {
              const parts = line.split(',');
              const row = {};
              headers.forEach((h, i) => (row[h.trim()] = (parts[i] || '').trim()));
              return row;
            });
            setRowsPreview(data);
          }
        } else if (selectedFile.name.endsWith('.json')) {
          const json = JSON.parse(text);
          const arr = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : [json];
          setRowsPreview(arr.slice(0, 5));
        }
      } catch (e) {
        setRowsPreview([]);
      }
    }
  };

  const handleMetadataChange = (field, value) => {
    setMetadata((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!user && isConfigured) {
      setError('Please sign in to upload files');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const userId = user?.uid || 'anonymous';
      const result = await uploadDatasetWithProgress(
        file,
        userId,
        (progressValue) => {
          setProgress(progressValue);
        }
      );

      if (onUploadComplete) {
        onUploadComplete(result);
      }

      // Reset form
      setFile(null);
      setMetadata({ datasetName: '', description: '', type: 'csv' });
      setProgress(0);
      setRowsPreview([]);
      setToast({ message: 'Dataset uploaded successfully', type: 'success' });
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload file');
      setToast({ message: 'Upload failed', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const acceptedFormats = ['.csv', '.json'];

  return (
    <div className="file-upload">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
      <div className="upload-container glass">
        <h3>Upload Dataset</h3>

        {!isConfigured && (
          <div className="upload-warning">
            ⚠️ Firebase not configured. Uploads will be simulated.
          </div>
        )}

        <div className="upload-form">
          <div className="form-group">
            <label>Dataset Name</label>
            <input
              type="text"
              value={metadata.datasetName}
              onChange={(e) => handleMetadataChange('datasetName', e.target.value)}
              placeholder="My Dataset"
            />
          </div>

          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              value={metadata.description}
              onChange={(e) => handleMetadataChange('description', e.target.value)}
              placeholder="Describe your dataset..."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>File Type</label>
            <select
              value={metadata.type}
              onChange={(e) => handleMetadataChange('type', e.target.value)}
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="excel">Excel</option>
            </select>
          </div>

          <div className="file-input-container">
            <label className="file-input-label">
              <input
                type="file"
                onChange={handleFileChange}
                accept={acceptedFormats.join(',')}
                disabled={uploading}
              />
              <div className="file-input-display">
                {file ? (
                  <div className="file-selected">
                    <span className="file-icon">📄</span>
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                ) : (
                  <div className="file-placeholder">
                    <span className="upload-icon">⬆️</span>
                    Click to select file
                    <span className="file-formats">
                      {acceptedFormats.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </label>
          </div>

          {rowsPreview.length > 0 && (
            <div className="preview-table">
              <div className="preview-title">Preview (first 5 rows)</div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      {Object.keys(rowsPreview[0]).map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rowsPreview.map((row, i) => (
                      <tr key={i}>
                        {Object.keys(rowsPreview[0]).map((h) => (
                          <td key={h + i}>{String(row[h] ?? '')}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {progress > 0 && progress < 100 && (
            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="progress-text">{Math.round(progress)}%</span>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button
            className="upload-btn glowing-btn glowing-btn-red"
            onClick={handleUpload}
            disabled={uploading || !file}
          >
            {uploading ? 'Uploading...' : 'Upload Dataset'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;

