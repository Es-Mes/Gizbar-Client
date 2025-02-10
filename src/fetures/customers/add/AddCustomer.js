import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAddCustomerMutation } from "../customersApiSlice";
import { useDispatch, useSelector } from "react-redux";
import { addNewCustomer } from "../../../app/customersSlice";
import { useGetAllCustomersQuery } from "../../customers/customersApiSlice";
import useAuth from "../../../hooks/useAuth";
import './AddCustomer.css'
const AddCustomer = ({ onSuccess }) => {
    const { phone } = useAuth(); // קבלת מזהה ה-agent
    const [addCustomer, { isLoading, isSuccess, isError, error }] = useAddCustomerMutation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // const customers = useSelector((state) => state.agent?.data?.customers || []);

    const [customerData, setCustomerData] = useState({
        full_name: "",
        phone: "",
        email: "",
        address: "",
        city: "",
    });

    const [showSuccessMessage, setShowSuccessMessage] = useState(false); // ניהול הצגת ההודעה

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCustomerData((prev) => ({ ...prev, [name]: value }));
    };
    const { refetch: refetchCustomers } = useGetAllCustomersQuery({ phone });
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
                    setShowSuccessMessage(true); // הצג הודעת הצלחה         
                    // עדכון הסטור עם הלקוח החדש
                    dispatch(addNewCustomer(data.data));
                }
            }


            if (onSuccess) {
                onSuccess(); // קריאה ל־onSuccess אם הוגדר
            } else {
                setTimeout(() => {
                    setShowSuccessMessage(false); // הסתר את ההודעה
                    navigate("/dash"); // נווט לעמוד השירותים
                }, 2000); // עיכוב של 2 שניות (2000ms)
            }
        } catch (err) {
            console.error("Error adding customer:", err);
        }
    };

    return (
        <div className="add-customer-container">
            <h1>הוסף לקוח חדש</h1>
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

            {isSuccess && <p className="success-message">הלקוח נוסף בהצלחה!</p>}
            {isError && <p className="error-message">{error?.data?.message || "שגיאה בהוספת הלקוח"}</p>}
        </div>
    );
};

export default AddCustomer;
