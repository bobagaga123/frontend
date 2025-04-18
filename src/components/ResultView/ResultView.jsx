import React from 'react';
import './ResultView.css';

const ResultView = ({ result }) => {
  return (
    <div className="result-view">
      <div className="result-content">
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </div>
      <button className="download-button">
        Скачать
      </button>
    </div>
  );
};

export default ResultView; 