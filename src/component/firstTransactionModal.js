import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-box">
        <div className="icon-rotate">💰</div>
        <h1 className="loading-title">פעם ראשונה שאתה מבצע עסקה במערכת?</h1>
        <p className="loading-subtitle">רק שתי שאלות ומסיימים!</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
