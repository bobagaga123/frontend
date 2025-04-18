import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import './UploadTable.css';

const UploadTable = ({ onUpload, activeTab }) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [bValue, setBValue] = useState('');
  const [mValue, setMValue] = useState('');
  const fileInputRef = useRef(null);

  const isZipMode = activeTab === 'zip';

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    
    if (isZipMode) {
      const zipFile = droppedFiles[0];
      if (zipFile.type === 'application/zip' || zipFile.name.endsWith('.zip')) {
        setFiles([zipFile]);
        simulateUploadProgress();
      } else {
        alert('Пожалуйста, загрузите ZIP архив');
      }
    } else {
      const validFiles = droppedFiles.filter(file => 
        file.type === 'text/csv' || 
        file.type === 'image/png' || 
        file.type === 'image/jpeg'
      );
      
      if (validFiles.length > 0) {
        setFiles(prev => [...prev, ...validFiles]);
      } else {
        alert('Пожалуйста, загрузите файлы форматов CSV, PNG или JPG');
      }
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
    const selectedFiles = Array.from(e.target.files);
    
    if (isZipMode) {
      const zipFile = selectedFiles[0];
      if (zipFile && (zipFile.type === 'application/zip' || zipFile.name.endsWith('.zip'))) {
        setFiles([zipFile]);
        simulateUploadProgress();
      }
    } else {
      const validFiles = selectedFiles.filter(file => 
        file.type === 'text/csv' || 
        file.type === 'image/png' || 
        file.type === 'image/jpeg'
      );
      
      if (validFiles.length > 0) {
        setFiles(prev => [...prev, ...validFiles]);
      }
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

  const createZipFromFiles = async (files) => {
    const zip = new JSZip();
    
    // Добавляем все файлы в zip
    for (const file of files) {
      const fileContent = await file.arrayBuffer();
      zip.file(file.name, fileContent);
    }
    
    // Генерируем zip файл
    const zipContent = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    }, (metadata) => {
      // Обновляем прогресс
      setUploadProgress(Math.round(metadata.percent));
    });
    
    // Создаем File объект из blob
    return new File([zipContent], 'files.zip', { type: 'application/zip' });
  };

  const handleSubmit = async () => {
    if (!bValue || !mValue || files.length === 0) {
      alert('Пожалуйста, заполните все поля и выберите файлы');
      return;
    }

    try {
      const formData = new FormData();
      
      if (isZipMode) {
        formData.append('file', files[0]);
      } else {
        setIsUploading(true);
        // Создаем zip из выбранных файлов
        const zipFile = await createZipFromFiles(files);
        formData.append('file', zipFile);
      }

      const response = await fetch(`http://127.0.0.1:8000/upload?b=${bValue}&m=${mValue}`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Успешно загружено:', data);
      alert('Файлы успешно загружены!');
      
      if (isZipMode) {
        onUpload && onUpload(files, { b: parseInt(bValue), m: parseInt(mValue) });
      } else {
        // Передаем созданный zip-файл
        onUpload && onUpload([{ name: 'files.zip' }], { b: parseInt(bValue), m: parseInt(mValue) });
      }
      
      setIsUploading(false);
      setUploadProgress(0);
      
    } catch (error) {
      console.error('Ошибка при загрузке:', error);
      alert('Произошла ошибка при загрузке файлов');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (isZipMode) {
      setUploadProgress(0);
      setIsUploading(false);
    }
  };

  const handleAddMore = () => {
    fileInputRef.current?.click();
  };

  const handleNumberInput = (e, type) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      if (type === 'b') {
        setBValue(value);
      } else if (type === 'm') {
        setMValue(value);
      }
    }
  };

  // Очищаем файлы при смене режима
  React.useEffect(() => {
    setFiles([]);
    setUploadProgress(0);
    setIsUploading(false);
  }, [activeTab]);

  return (
    <div className="upload-container">
      <div className="number-inputs">
        <div className="input-group">
          <label htmlFor="bValue">b:</label>
          <input
            type="number"
            id="bValue"
            value={bValue}
            onChange={(e) => handleNumberInput(e, 'b')}
            placeholder="Введите b"
          />
        </div>
        <div className="input-group">
          <label htmlFor="mValue">m:</label>
          <input
            type="number"
            id="mValue"
            value={mValue}
            onChange={(e) => handleNumberInput(e, 'm')}
            placeholder="Введите m"
          />
        </div>
      </div>

      <div 
        className={`drop-zone ${isDragging ? 'dragging' : ''} ${files.length > 0 ? 'has-file' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={files.length === 0 ? openFileDialog : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={isZipMode ? '.zip' : '.csv,.png,.jpg,.jpeg'}
          onChange={handleFileSelect}
          multiple={!isZipMode}
          className="file-input"
        />
        
        {files.length > 0 ? (
          <div className="upload-status">
            {files.map((file, index) => (
              <div key={index} className="file-card">
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                </div>
                <div className="file-actions">
                  <button className="action-button delete" onClick={() => handleDelete(index)}>
                    🗑️
                  </button>
                </div>
              </div>
            ))}
            {isZipMode && isUploading && (
              <div className="progress-bar-container">
                <div 
                  className="progress-bar" 
                  style={{ width: `${uploadProgress}%` }}
                />
                <span className="progress-text">{uploadProgress}%</span>
              </div>
            )}
            {!isZipMode && (
              <button 
                className="add-more-button"
                onClick={handleAddMore}
                type="button"
              >
                + Добавить еще файлы
              </button>
            )}
          </div>
        ) : (
          <div className="drop-text">
            {isDragging ? (
              <span>Отпустите файл{!isZipMode ? 'ы' : ''} здесь</span>
            ) : (
              <>
                <span className="upload-icon">📁</span>
                <span>
                  {isZipMode 
                    ? 'Перетащите ZIP архив или кликните для выбора'
                    : 'Перетащите файлы (CSV, PNG, JPG) или кликните для выбора'}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      <button 
        className="submit-button"
        disabled={files.length === 0 || isUploading || !bValue || !mValue}
        onClick={handleSubmit}
      >
        {isUploading ? 'Создание архива...' : 'Отправить'}
      </button>
    </div>
  );
};

export default UploadTable; 