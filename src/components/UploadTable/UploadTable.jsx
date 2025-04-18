import React, { useState, useRef } from 'react';
import './UploadTable.css';

const UploadTable = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    
    if (droppedFile.type === 'application/zip' || droppedFile.name.endsWith('.zip')) {
      setFile(droppedFile);
      simulateUploadProgress();
    } else {
      alert('Пожалуйста, загрузите ZIP архив');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      simulateUploadProgress();
    }
  };

  const simulateUploadProgress = () => {
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleSubmit = () => {
    onUpload && onUpload(file);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = () => {
    setFile(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  const handleEdit = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="upload-container">
      <div 
        className={`drop-zone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={!file ? openFileDialog : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
          onChange={handleFileSelect}
          className="file-input"
        />
        
        {file ? (
          <div className="upload-status">
            <div className="file-card">
              <div className="file-info">
                <span className="file-name">{file.name}</span>
                <span className="file-size">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
              </div>
              <div className="file-actions">
                <button className="action-button edit" onClick={handleEdit}>
                  ✏️
                </button>
                <button className="action-button delete" onClick={handleDelete}>
                  🗑️
                </button>
              </div>
            </div>
            {isUploading && (
              <div className="progress-bar-container">
                <div 
                  className="progress-bar" 
                  style={{ width: `${uploadProgress}%` }}
                />
                <span className="progress-text">{uploadProgress}%</span>
              </div>
            )}
          </div>
        ) : (
          <div className="drop-text">
            {isDragging ? (
              <span>Отпустите файл здесь</span>
            ) : (
              <>
                <span className="upload-icon">📁</span>
                <span>Перетащите ZIP архив или кликните для выбора</span>
              </>
            )}
          </div>
        )}
      </div>

      <button 
        className="submit-button"
        disabled={!file || isUploading}
        onClick={handleSubmit}
      >
        {isUploading ? 'Загрузка...' : 'Отправить'}
      </button>
    </div>
  );
};

export default UploadTable; 