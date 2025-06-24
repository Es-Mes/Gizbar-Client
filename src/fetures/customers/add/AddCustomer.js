import React, { useState } from "react";
import { toast } from 'react-toastify';

import { useAddCustomerMutation } from "../customersApiSlice";
import useAuth from "../../../hooks/useAuth";
import './AddCustomer.css'
import { TextField } from "@mui/material";
const AddCustomer = ({ onSuccess }) => {
    const { phone } = useAuth(); // קבלת מזהה ה-agent
    const [addCustomer, { isLoading, isSuccess, isError, error }] = useAddCustomerMutation();
    const [message, setMessage] = useState(null)
    const [clicked, setClicked] = useState(false)


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
        setClicked(true)
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
                    toast.success("הלקוח נוסף בהצלחה 👍 ", { icon: false })
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
                <div className="add-client-icon" style={{ fontSize: "3rem" }}><img src="/icons8-add-user-male-50.png" /></div>
            </div>
            <form onSubmit={handleSubmit} className="add-customer-form">
                <TextField variant="outlined"
                    type="text"
                    id="full_name"
                    name="full_name"
                    label="שם מלא"
                    value={customerData.full_name}
                    onChange={handleChange}
                    required
                />

                <TextField variant="outlined"
                    type="tel"
                    id="phone"
                    name="phone"
                    value={customerData.phone}
                    onChange={handleChange}
                    required
                    label='מספר פלאפון'
                />

                <TextField variant="outlined"
                    type="email"
                    id="email"
                    name="email"
                    value={customerData.email}
                    onChange={handleChange}
                    label='כתובת מייל'
                />

                <TextField variant="outlined"
                    type="text"
                    id="city"
                    name="city"
                    value={customerData.city}
                    label='עיר'
                />

                <TextField variant="outlined"
                    type="text"
                    id="address"
                    name="address"
                    value={customerData.address}
                    onChange={handleChange}
                    label='כתובת'
                />
                <button type="submit" disabled={clicked}>
                    {isLoading ? "מוסיף..." : "הוסף לקוח"}
                </button>
            </form>

            {isError && <p className="error-message">{error?.data?.message || "שגיאה בהוספת הלקוח"}</p>}
            {message && <p style={{ color: "#f9a825" }}>{message}</p>}

        </div>
    );
};

export default AddCustomer;
