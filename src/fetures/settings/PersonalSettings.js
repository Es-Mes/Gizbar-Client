import { useState } from "react";
import React from 'react';
import { useSelector } from "react-redux";
import { TextField, Button } from "@mui/material";

import "./PersonalSettings.css";
import useAuth from "../../hooks/useAuth";
import { useGetAgentQuery } from "../../fetures/agent/apiSlice";
import { useUpdateAgentMutation } from "../../fetures/agent/AgentApiSlice";
import Modal from "../../modals/Modal";
import { Link, NavLink } from "react-router-dom";
import ChangePasswordModal from "../../modals/ChangePasswordModal";
import EditBillingDetailsModal from "../../modals/EditBillingDetailsModal";
import EditPaymentDetailsModal from "../../modals/EditPaymentDetailsModal";
import { toast } from "react-toastify";

const PersonalSettings = () => {
  const { phone } = useAuth()
  const { data: agent, isLoading, error } = useGetAgentQuery({ phone });
  console.log(agent);

  const [editableUser, setEditableUser] = useState({});
  const [isChangePassModalOpen, setChangeModalOpen] = useState(false);
  const [isEditPersonalModalOpen, setEditPersonalModalOpen] = useState(false);
  const [isEditBillingModalOpen, setEditBillingModalOpen] = useState(false);
  const [isEditPaymentModalOpen, setEditPaymentModalOpen] = useState(false);
  const [showBillingDetails, setShowBillingDetails] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [updateAgent, { isLoading: isUpdating }] = useUpdateAgentMutation();

  const handleChange = (e) => {
    setEditableUser({ ...editableUser, [e.target.name]: e.target.value });
  };

  const handleEditPersonalInfo = () => {
    setEditableUser({
      _id: agent._id,
      first_name: agent.first_name || '',
      last_name: agent.last_name || '',
      email: agent.email || '',
      address: agent.address || '',
      city: agent.city || '',
      phone: agent.phone,
      password: ''
    });
    setEditPersonalModalOpen(true);
  };

  const handleUpdatePersonalInfo = async () => {
    if (!editableUser.password) {
      toast.error("סיסמא נדרשת לאישור השינויים");
      return;
    }

    try {
      const result = await updateAgent(editableUser).unwrap();
      toast.success("פרטים אישיים עודכנו בהצלחה!");
      setEditPersonalModalOpen(false);
      setEditableUser({});
    } catch (error) {
      toast.error("שגיאה בעדכון הפרטים: " + (error?.data?.message || "נסה שוב"));
    }
  };

  if (isLoading) return <p>טוען...</p>;
  if (error) return <p>Error: {error?.data?.message}</p>;

  return (<>
    <div className="settings-container">
      <div className="settings-header">
        <h2 className="settings-title">אזור אישי - ניהול חשבון</h2>
        <button
          className="change-password-btn"
          onClick={() => setChangeModalOpen(true)}
        >
          שינוי סיסמא
        </button>
      </div>

      {/* פרטים אישיים */}
      <div className="settings-section">
        <div className="section-header">
          <h3 className="section-title">פרטים אישיים</h3>
          <button className="edit-section-btn" onClick={handleEditPersonalInfo}>
            ערוך פרטים אישיים
          </button>
        </div>
        <div className="settings-content">
          <SettingField label="מספר טלפון" value={agent.phone} readOnly={true} />
          <SettingField label="שם פרטי" value={agent.first_name} />
          <SettingField label="שם משפחה" value={agent.last_name} />
          <SettingField label="אימייל" value={agent.email} />
          <SettingField label="כתובת" value={agent.address} />
          <SettingField label="עיר" value={agent.city} />
        </div>
      </div>

      {/* פרטי גביה */}
      <div className="settings-section">
        <div className="section-header">
          <h3 className="section-title">פרטי גביה</h3>
          <button
            className="view-details-btn"
            onClick={() => setShowBillingDetails(!showBillingDetails)}
          >
            {showBillingDetails ? 'הסתר פרטים' : 'הצג פרטים'}
          </button>
        </div>
        {showBillingDetails && (
          <div className="settings-content">
            {agent.paymentType === 'nedarim' && (
              <>
                <SettingField label="קוד מוסד" value={agent.mosadCode} />
                <SettingField label="API Valid" value={agent.apiValid} />
              </>
            )}
            {agent.paymentType === 'gizbar' && agent.bankDetails && (
              <>
                <SettingField label="שם בעל החשבון" value={agent.bankDetails.accountName} />
                <SettingField label="מספר חשבון" value={agent.bankDetails.accountNumber} />
                <SettingField label="מספר בנק" value={agent.bankDetails.bankNumber} />
                <SettingField label="מספר סניף" value={agent.bankDetails.branchNumber} />
              </>
            )}
            {agent.paymentType === 'none' && (
              <p className="no-payment-info">לא נבחרה שיטת גביה</p>
            )}
            <button
              className="edit-section-btn"
              onClick={() => setEditBillingModalOpen(true)}
            >
              ערוך פרטי גביה
            </button>
          </div>
        )}
      </div>

      {/* פרטי תשלום */}
      <div className="settings-section">
        <div className="section-header">
          <h3 className="section-title">פרטי תשלום</h3>
          <button
            className="view-details-btn"
            onClick={() => setShowPaymentDetails(!showPaymentDetails)}
          >
            {showPaymentDetails ? 'הסתר פרטים' : 'הצג פרטים'}
          </button>
        </div>
        {showPaymentDetails && (
          <div className="settings-content">
            {agent.cardDetails && agent.cardDetails.last4 ? (
              <>
                <div className="card-info">
                  <span className="card-label">כרטיס אשראי:</span>
                  <span className="card-value">****-****-****-{agent.cardDetails.last4}</span>
                </div>
                {agent.cardDetails.tokef && (
                  <div className="card-info">
                    <span className="card-label">תוקף:</span>
                    <span className="card-value">{agent.cardDetails.tokef}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="no-card-info">לא נשמר כרטיס אשראי</p>
            )}
            <button
              className="edit-section-btn"
              onClick={() => setEditPaymentModalOpen(true)}
            >
              ערוך פרטי תשלום
            </button>
          </div>
        )}
      </div>
    </div>

    {/* מודל עריכת פרטים אישיים */}
    <Modal isOpen={isEditPersonalModalOpen} onClose={() => setEditPersonalModalOpen(false)}>
      <div className="edit-personal-modal">
        <h3>עריכת פרטים אישיים</h3>
        <div className="edit-form">
          <TextField
            fullWidth
            label="שם פרטי"
            name="first_name"
            value={editableUser.first_name || ''}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="שם משפחה"
            name="last_name"
            value={editableUser.last_name || ''}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="אימייל"
            name="email"
            type="email"
            value={editableUser.email || ''}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="כתובת"
            name="address"
            value={editableUser.address || ''}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="עיר"
            name="city"
            value={editableUser.city || ''}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="סיסמא לאישור השינויים"
            name="password"
            type="password"
            value={editableUser.password || ''}
            onChange={handleChange}
            margin="normal"
            required
          />
          <div className="modal-actions">
            <Button
              variant="contained"
              onClick={handleUpdatePersonalInfo}
              disabled={isUpdating}
            >
              {isUpdating ? 'מעדכן...' : 'שמור שינויים'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setEditPersonalModalOpen(false)}
            >
              ביטול
            </Button>
          </div>
        </div>
      </div>
    </Modal>

    {/* מודל שינוי סיסמא */}
    <Modal isOpen={isChangePassModalOpen} onClose={() => setChangeModalOpen(false)}>
      <ChangePasswordModal onSucsses={() => { setChangeModalOpen(false) }} />
    </Modal>

    {/* מודל עריכת פרטי גביה */}
    <Modal isOpen={isEditBillingModalOpen} onClose={() => setEditBillingModalOpen(false)}>
      <EditBillingDetailsModal
        agent={agent}
        onClose={() => setEditBillingModalOpen(false)}
        onSuccess={() => {
          // רענון הנתונים אחרי עדכון מוצלח
          window.location.reload(); // או שתשתמש ב-refetch אם יש לך
        }}
      />
    </Modal>

    {/* מודל עריכת פרטי תשלום */}
    {/* <Modal isOpen={isEditPaymentModalOpen} onClose={() => setEditPaymentModalOpen(false)}>
      <EditPaymentDetailsModal
        agent={agent}
        onClose={() => setEditPaymentModalOpen(false)}
        onSuccess={() => {
          // רענון הנתונים אחרי עדכון מוצלח
          window.location.reload(); // או שתשתמש ב-refetch אם יש לך
        }}
      />
    </Modal> */}
    {isEditPaymentModalOpen && (
  <div className="iframe-modal-overlay">
    <div className="iframe-modal-content">
      <button className="close-btn" onClick={() => setEditPaymentModalOpen(false)}>סגור</button>
      <iframe
        src={`https://ultra.kesherhk.info/external/paymentPage/321649?customerRef=${agent._id}`}
        title="תשלום"
        width="100%"
        height="600px"
        style={{ border: "none" }}
        allowFullScreen
      />
    </div>
  </div>
)}
  </>
  );
};

const SettingField = ({ label, value, readOnly = false }) => (
  <div className="setting-field">
    <label className="setting-label">{label}:</label>
    <span className="setting-value">{value || 'לא הוזן'}</span>
    {readOnly && <span className="read-only-indicator">(לא ניתן לעריכה)</span>}
  </div>
);

export default PersonalSettings;
