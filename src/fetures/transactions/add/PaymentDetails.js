import React, { useState } from "react";
import { useAddCustomerMutation } from "../customersApiSlice";
import useAuth from "../../../hooks/useAuth";
import './AddCustomer.css'
import { useAddPaymentDetailsMutation } from "../../agent/AgentApiSlice";
import { useGetAgentQuery } from "../../../app/apiSlice";
const PaymentDetails = ({ onSuccess }) => {
    const { phone } = useAuth(); // קבלת מזהה ה-agent
    const { data: agent } = useGetAgentQuery({ phone })
    const [addPaymentDetails,{isLoading,isSuccess,isError}] = useAddPaymentDetailsMutation()
    const [paymentData, setPaymentData] = useState({
        full_name: "",
        phone: "",
        email: "",
        address: "",
        city: "",
    });

    const [showSuccessMessage, setShowSuccessMessage] = useState(false); // ניהול הצגת ההודעה

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPaymentData((prev) => ({ ...prev, [name]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!phone) {
            alert("מזהה הסוכן לא נמצא. נסה להתחבר מחדש.");
            return;
        }

        try {
            const data = await addCustomer({ phone, customer: paymentData }).unwrap();
            console.log(data);
            if (data) {
                if (!data.error) {
                    setShowSuccessMessage(true); // הצג הודעת הצלחה         
                }

                setTimeout(() => {
                    setShowSuccessMessage(false); // הסתר את ההודעה
                    if (onSuccess) {
                        onSuccess(data); // קריאה ל־onSuccess אם הוגדר
                    }
                }, 2000); // עיכוב של 2 שניות (2000ms)
            }

        } catch (err) {
            console.error("Error adding customer:", err);
        }
    };

    return (
        <div className="add-customer-container">
            <div className='modelTitle'>
                    <h1 className="loading-title">הוסף לקוח</h1>
                    <div className="add-client-icon" style={{ fontSize: "3rem" }}>👤</div>
                </div>
            <form onSubmit={handleSubmit} className="add-customer-form">
                <label htmlFor="full_name">שם מלא: <span className="required-asterisk">*</span>
                </label>
                <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={paymentData.full_name}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="phone">מספר פלאפון: <span className="required-asterisk">*</span>
                </label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={paymentData.phone}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="email">כתובת מייל:</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={paymentData.email}
                    onChange={handleChange}
                />

                <label htmlFor="address">כתובת:</label>
                <input
                    type="text"
                    id="address"
                    name="address"
                    value={paymentData.address}
                    onChange={handleChange}
                />

                <label htmlFor="city">עיר:</label>
                <input
                    type="text"
                    id="city"
                    name="city"
                    value={paymentData.city}
                    onChange={handleChange}
                />

                <button type="submit" disabled={isLoading}>
                    {isLoading ? "מוסיף..." : "הוסף לקוח"}
                </button>
            </form>

            {isSuccess && <p className="success-message">הלקוח נוסף בהצלחה!</p>}
            {isError && <p className="error-message">{error?.data?.message || "שגיאה בהוספת הלקוח"}</p>}
        </div>
    );
};

export default PaymentDetails;

