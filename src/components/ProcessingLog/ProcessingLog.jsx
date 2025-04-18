import React, { useEffect, useRef } from 'react';
import './ProcessingLog.css';

const ProcessingLog = ({ log, progress }) => {
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  return (
    <div className="processing-container">
      <div className="log-container" ref={logRef}>
        <pre className="log-content">
          {log}
        </pre>
      </div>
      <div className="processing-progress-container">
        <div 
          className="processing-progress-bar" 
          style={{ width: `${progress}%` }}
        />
        <span className="processing-progress-text">{progress}%</span>
      </div>
    </div>
  );
};

export default ProcessingLog; 