import React from 'react';
import './Success.css';

const Success = () => {
  const handleDownloadReport = () => {
    // Logic to download the report
    alert('Download Report clicked');
  };

  const handleForward = () => {
    // Logic to forward the report or take some action
    alert('Forward clicked');
  };

  return (
    <div className="success-container">
      <h1>Inspection Successful !</h1>
      <div className="button-container">
        <button onClick={handleDownloadReport}>Download Report</button>
        <button onClick={handleForward}>Forward Report</button>
      </div>
    </div>
  );
};

export default Success;
