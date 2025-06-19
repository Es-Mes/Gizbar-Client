import { useState } from "react";
import React from 'react';
import { useSelector } from "react-redux";

import "./PersonalSettings.css";
import useAuth from "../../hooks/useAuth";
import { useGetAgentQuery } from "../../fetures/agent/apiSlice";
import Modal from "../../modals/Modal";
import { Link, NavLink } from "react-router-dom";
import ChangePasswordModal from "../../modals/ChangePasswordModal";

const PersonalSettings = () => {
  const { phone } = useAuth()
  const { data: agent, isLoading, error } = useGetAgentQuery({ phone });
  console.log(agent);


  const [editableUser, setEditableUser] = useState(agent);
  const [isChangePassModalOpen, setChangeModalOpen] = useState(false)

  
  const handleChange = (e) => {
    setEditableUser({ ...editableUser, [e.target.name]: e.target.value });
  };

  if (isLoading) return <p>טוען...</p>;
  if (error) return <p>Error: {error?.data?.message}</p>;

  return (<>
    <div className="settings-container">
      <h2 className="settings-title">הגדרות אישיות</h2>
      <div className="settings-content">
        <SettingField label="שם פרטי" name="first_name" value={agent.first_name} onChange={handleChange} />
        <SettingField label="שם משפחה" name="last_name" value={agent.last_name} onChange={handleChange} />
        <SettingField label="אימייל" name="email" value={agent.email} onChange={handleChange} />
        <SettingField label="כתובת" name="address" value={agent.address} onChange={handleChange} />
        <SettingField label="עיר" name="city" value={agent.city} onChange={handleChange} />
      </div>
    
      <button className="modelBtn" onClick={() => { setChangeModalOpen(true) }}>שינוי סיסמא</button>
      <NavLink to={"../settings/paymentDetails"}>עריכת פרטי תשלום</NavLink>
    </div>
    <Modal isOpen={isChangePassModalOpen} onClose={() => (setChangeModalOpen(false))}>
      <ChangePasswordModal onSucsses={() => { setChangeModalOpen(false) }} />
    </Modal>
  </>
  );
};

const SettingField = ({ label, name, value, onChange }) => (
  <div className="setting-field">
    <label className="setting-label">{label}:</label>
    <span className="setting-value">{value}</span>
    <button className="edit-button">עריכה</button>
  </div>
);

export default PersonalSettings;
