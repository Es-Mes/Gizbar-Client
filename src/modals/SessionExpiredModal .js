import React from 'react';
import '../component/LoadingScreen.css'; // משתמש באותו עיצוב כמו loading
import { useNavigate } from 'react-router-dom';

const SessionExpiredModal = ({handleLoginRedirect}) => {
      const navigate = useNavigate();
    
  return (
    <div className="loading-screen full-screen">
      <div className="loading-box">
        <div className="bill">⏰</div>
        <h1 className="loading-title">תוקף החיבור פג</h1>
        <p className="loading-subtitle">המערכת מנותקת – יש להתחבר מחדש כדי להמשיך</p>
        <button className="modelBtn downBtn" onClick={handleLoginRedirect}>
          התחברות מחדש
        </button>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
