import React, { useState, useRef } from 'react';
import './FileUpload.css';

const FileUpload = ({ onUpload, activeTab }) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => {
      if (activeTab === 'zip') {
        return file.type === 'application/zip' || file.type === 'application/x-zip-compressed';
      }
      return file.type === 'text/csv' || 
             file.type === 'image/png' || 
             file.type === 'image/jpeg';
    });
    setFiles(prevFiles => [...prevFiles, ...droppedFiles]);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(file => {
      if (activeTab === 'zip') {
        return file.type === 'application/zip' || file.type === 'application/x-zip-compressed';
      }
      return file.type === 'text/csv' || 
             file.type === 'image/png' || 
             file.type === 'image/jpeg';
    });
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
  };

  const handleAddMore = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = () => {
    if (files.length === 0) {
      alert('Пожалуйста, выберите файлы');
      return;
    }
    onUpload(files);
  };

  // Очищаем файлы при смене режима
  React.useEffect(() => {
    setFiles([]);
  }, [activeTab]);

  return (
    <div className="file-upload-container">
      <div 
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept={activeTab === 'zip' ? '.zip' : '.csv,.png,.jpg,.jpeg'}
          multiple={activeTab !== 'zip'}
          style={{ display: 'none' }}
        />
        <div className="drop-zone-content">
          <p>Перетащите файлы сюда или нажмите для выбора</p>
          <p className="file-types">
            {activeTab === 'zip' 
              ? 'Поддерживаемый формат: ZIP' 
              : 'Поддерживаемые форматы: CSV, PNG, JPG'}
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="selected-files">
          <h3>Выбранные файлы:</h3>
          <ul>
            {files.map((file, index) => (
              <li key={index}>
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </li>
            ))}
          </ul>
          <button 
            className="add-more-button"
            onClick={handleAddMore}
            type="button"
          >
            + Добавить еще файлы
          </button>
        </div>
      )}

      <button 
        className="submit-button"
        onClick={handleSubmit}
        disabled={files.length === 0}
        type="button"
      >
        Отправить
      </button>
    </div>
  );
};

export default FileUpload; 