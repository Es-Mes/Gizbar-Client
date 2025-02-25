import React from "react";
// import "./PaymentModal.css"; // נוסיף עיצוב מתאים
import PaymentForm from "../component/payment/PaymentForm";
const PaymentModal = ({ isOpen, onClose, transaction }) => {
    if (!isOpen) return null; // אם המודל סגור, לא מציגים כלום

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-btn" onClick={onClose}>✖</button>
                <h2>תשלום באשראי</h2>
                {transaction ? (
                    <PaymentForm initialCustomerData={{
                        FirstName: transaction.customer.full_name,
                        Phone: transaction.customer.phone,
                        Mail: transaction.customer.email,
                        Amount: transaction.price,
                        Currency: "1"
                    }} />
                ) : (
                    <p>שגיאה: פרטי העסקה חסרים.</p>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;
