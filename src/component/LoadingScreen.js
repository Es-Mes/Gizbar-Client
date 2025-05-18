import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-box">
        <div className="icon-rotate">💰</div>
        <h1 className="loading-title">טוען את המערכת...</h1>
        <p className="loading-subtitle">עוד רגע זה בא! מוודאים שהכל תקין ומעודכן</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
