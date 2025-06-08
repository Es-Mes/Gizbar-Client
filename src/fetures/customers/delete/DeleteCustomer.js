import React, { useState } from 'react'
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
            else{
                setClicked(true)
                setMessage("הלקוח נמחק בהצלחה");
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
        <div className="backgroung-screen">
            <div className="loading-box">
                <div className=" fade-icon icon-rotate">👤</div>
                <p className="loading-subtitle">האם אתה בטוח שברצונך למחוק לקוח זה?</p>
                <h1 className="loading-title">{customer.full_name}</h1>
                <p>{customer.phone}</p>
                <p>{customer.email}</p>
                <p>{customer.address}</p>
                <p>{customer.city}</p>
                {message && <p style={{color:"#f9a825"}}>{message}</p>}
                <div className='navigation-buttons'>
                    <button className='modelBtn' onClick={onSuccess}>ביטול</button>
                    <button className='modelBtn' onClick={() => { deleteClick(customer) }} disabled={clicked}>אישור</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteCustomer
