import React, { useState } from "react";
import { toast } from 'react-toastify';

import { useAddCustomerMutation } from "../customersApiSlice";
import useAuth from "../../../hooks/useAuth";
import './AddCustomer.css'
const AddCustomer = ({ onSuccess }) => {
    const { phone } = useAuth(); // קבלת מזהה ה-agent
    const [addCustomer, { isLoading, isSuccess, isError, error }] = useAddCustomerMutation();
        const [message, setMessage] = useState(null)


    const [customerData, setCustomerData] = useState({
        full_name: "",
        phone: "",
        email: "",
        address: "",
        city: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCustomerData((prev) => ({ ...prev, [name]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!phone) {
            alert("מזהה הסוכן לא נמצא. נסה להתחבר מחדש.");
            return;
        }

        try {
            const data = await addCustomer({ phone, customer: customerData }).unwrap();
            console.log(data);
            if (data) {
                if (!data.error) {
                    toast.success("הלקוח נוסף בהצלחה 👍 ",{icon:false})
                }

                setTimeout(() => {
                    if (onSuccess) {
                        onSuccess(data); // קריאה ל־onSuccess אם הוגדר
                    }
                }, 2000); // עיכוב של 2 שניות (2000ms)
            }

        } catch (err) {
            setMessage(`שגיאה בהוספת הלקוח ${err.error}`);
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
                    value={customerData.full_name}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="phone">מספר פלאפון: <span className="required-asterisk">*</span>
                </label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={customerData.phone}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="email">כתובת מייל:</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={customerData.email}
                    onChange={handleChange}
                />

                <label htmlFor="address">כתובת:</label>
                <input
                    type="text"
                    id="address"
                    name="address"
                    value={customerData.address}
                    onChange={handleChange}
                />

                <label htmlFor="city">עיר:</label>
                <input
                    type="text"
                    id="city"
                    name="city"
                    value={customerData.city}
                    onChange={handleChange}
                />

                <button type="submit" disabled={isLoading}>
                    {isLoading ? "מוסיף..." : "הוסף לקוח"}
                </button>
            </form>

            {isError && <p className="error-message">{error?.data?.message || "שגיאה בהוספת הלקוח"}</p>}
            {message && <p style={{ color: "#f9a825" }}>{message}</p>}

        </div>
    );
};

export default AddCustomer;
