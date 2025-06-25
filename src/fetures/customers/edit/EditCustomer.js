import React, { useState } from 'react'
import useAuth from '../../../hooks/useAuth'
import { useUpdateCustomerMutation } from '../customersApiSlice';
import './editCustomer.css'
import { TextField } from '@mui/material';

const EditCustomer = ({ customer, onSuccess }) => {
    const { phone } = useAuth();
    const [updateCustomer, { isLoading, isSuccess, isError, error, data }] = useUpdateCustomerMutation();
    console.log(customer);

    const [customerData, setCustomerData] = useState({
        _id: customer._id,
        full_name: customer.full_name,
        email: customer.email,
        address: customer.address,
        city: customer.city
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
            const data = await updateCustomer({ phone, customer: customerData }).unwrap();
            console.log(data);
            if (data) {
                if (!data.error) {
                    if (onSuccess) {
                        onSuccess();
                    }
                }
            }

        } catch (err) {
            console.error("Error adding customer:", err);

        }
    }
    return (
        <div className='edit-customer-container'>
            <form onSubmit={handleSubmit} className='edit-customer-form'>

                <div className='modelTitle'>
                    <h1 className="loading-title">ערוך לקוח</h1>
                    <div style={{ fontSize: "3rem" }}><img src='/icons8-change-user-50.png' /></div>
                </div>

                <TextField variant="outlined"
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={customerData.full_name}
                    onChange={handleChange}
                    required
                    label="שם מלא"
                />

                <TextField variant="outlined"
                    type="email"
                    id="email"
                    name="email"
                    value={customerData.email}
                    label="כתובת מייל"
                />

                <TextField variant="outlined"
                    type="text"
                    id="city"
                    name="city"
                    value={customerData.city}
                    onChange={handleChange}
                    label="עיר"
                />
                
                <TextField variant="outlined"
                    type="text"
                    id="address"
                    name="address"
                    value={customerData.address}
                    onChange={handleChange}
                    label="כתובת"
                />
                <button className='editCustom' type="submit" disabled={isLoading}>
                    {isLoading ? "מעדכן..." : "עדכן"}
                </button>

            </form>
        </div>
    )
}

export default EditCustomer