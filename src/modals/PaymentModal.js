import React from "react";
import { toast } from "react-toastify";
// import "./PaymentModal.css"; // נוסיף עיצוב מתאים
import PaymentForm from "../component/payment/PaymentForm";
import useAuth from "../hooks/useAuth";
import { flex } from "@mui/system";
import { Link } from "react-router-dom";
const PaymentModal = ({ isOpen, onClose, transaction }) => {
    const {phone} = useAuth()
    if (!isOpen) return null; // אם המודל סגור, לא מציגים כלום

    const handleCopy = () => {
        const baseUrl = process.env.REACT_APP_CLIENT_URL || "";
        const link = `${baseUrl}/payment/${phone}/${transaction?._id}`;
        navigator.clipboard.writeText(link)
            .then(() => toast.success("הקישור הועתק 👍 ",{icon:false}))
            .catch(() => toast.error("העתקה נכשלה."));
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div style={{display: "flex",justifyContent: "end"}}><button className="close-btn" onClick={onClose}>✖</button>
                <Link onClick={handleCopy}>🔗 העתק קישור לעמוד תשלום</Link></div>
                <div className="credit-swipe"><img src="/icons8-credit-card-50.png"/></div>
                <h2>תשלום באשראי</h2>
                {transaction ? (
                    <PaymentForm initialCustomerData={{
                        transactionID:transaction._id,
                        FirstName: transaction.customer.full_name,
                        Phone: transaction.customer.phone,
                        Mail: transaction.customer.email,
                        Amount: transaction.price,
                        Currency: "1",
                        _id: transaction._id
                    }}
                     />
                ) : (
                    <p>שגיאה: פרטי העסקה חסרים.</p>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;
