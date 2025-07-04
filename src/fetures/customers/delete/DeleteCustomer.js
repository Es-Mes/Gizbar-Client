import React, { useState } from 'react'
import { toast } from 'react-toastify';

import '../../../component/LoadingScreen.css';
import useAuth from '../../../hooks/useAuth';
import { useDeleteCustomerMutation } from '../customersApiSlice';
import { red, yellow } from '@mui/material/colors';



const DeleteCustomer = ({ customer, onSuccess }) => {
    const { phone } = useAuth(); // קבלת מספר הטלפון של הסוכן

    const [deleteCustomer, { isSuccess: isDeleteSuccess }] = useDeleteCustomerMutation()
    const [clicked, setClicked] = useState(false);
    const [message, setMessage] = useState(null)
    const deleteClick = async (customer) => {
        console.log(customer);
        try {
            const result = await deleteCustomer({ phone, _id: customer._id });
            if ('error' in result && result.error.status === 403) {
                setMessage("אין אפשרות למחוק לקוח שיש לו עסקאות!");
            }
            else {
                setClicked(true)
                toast.success("הלקוח נמחק בהצלחה 👍 ", { icon: false })
                setTimeout(() => {
                    onSuccess()
                }, 2000)
            }
        }
        catch (err) {
            setMessage(`שגיאה במחיקת הלקוח ${err.error}`)
        }
    }

    return (
        <div className="background-screen">
            <div className="loading-box">
                <div className=" fade-icon icon-rotate"><img src='/icons8-person-50.png' /></div>
                <p className="loading-subtitle">האם אתה בטוח שברצונך למחוק לקוח זה?</p>
                <h1 className="loading-title">{customer.full_name}</h1>
                <div>
                    
                    <div className="row">
                        <h4>טלפון:</h4><p>{customer.phone}</p>
                    </div>
                    <div className="row">
                        <h4>אימייל:</h4><p>{customer.email}</p>
                    </div>
                    <div className="row">
                        <h4>עיר:</h4><p>{customer.city}</p>
                    </div>
                    <div className="row">
                        <h4>כתובת:</h4><p>{customer.address}</p>
                    </div>
                </div>

                {message && <p style={{ color: "#f9a825" }}>{message}</p>}
                <div className='navigation-buttons'>
                    <button className='modelBtn' onClick={onSuccess}>ביטול</button>
                    <button className='modelBtn' onClick={() => { deleteClick(customer) }} disabled={clicked}>אישור</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteCustomer
