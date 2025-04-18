import React, { useState, useCallback } from 'react';
import UploadTable from '../components/UploadTable/UploadTable';
import UploadTabs from '../components/UploadTabs/UploadTabs';
import ProcessingLog from '../components/ProcessingLog/ProcessingLog';
import useWebSocket from '../hooks/useWebSocket';
import './UploadPage.css';

const WS_URL = import.meta.env.VITE_WS_URL;

const UploadPage = () => {
  const [activeTab, setActiveTab] = useState('zip');
  const [isProcessing, setIsProcessing] = useState(false);
  const [log, setLog] = useState('');
  const [progress, setProgress] = useState(0);

  const handleWebSocketMessage = useCallback((data) => {
    if (data.type === 'log') {
      setLog(prevLog => prevLog + data.message + '\n');
    } else if (data.type === 'progress') {
      setProgress(data.value);
    } else if (data.type === 'complete') {
      setLog(prevLog => prevLog + 'Processing completed!\n');
    } else if (data.type === 'error') {
      setLog(prevLog => prevLog + `Error: ${data.message}\n`);
      setIsProcessing(false);
    }
  }, []);

  const { connect } = useWebSocket(WS_URL, handleWebSocketMessage);

  const handleUpload = (file) => {
    setIsProcessing(true);
    setLog('Starting process...\n');
    connect();
  };

  return (
    <div className="upload-page">
      {!isProcessing ? (
        <>
          <UploadTabs activeTab={activeTab} onTabChange={setActiveTab} />
          <UploadTable onUpload={handleUpload} />
        </>
      ) : (
        <ProcessingLog log={log} progress={progress} />
      )}
    </div>
  );
};

export default UploadPage; 