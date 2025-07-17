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
        setClicked(true);

        try {
            const result = await deleteCustomer({ phone, _id: customer._id }).unwrap();
            // אם הגענו לכאן, המחיקה הצליחה
            toast.success("הלקוח נמחק בהצלחה 👍 ", { icon: false });
            setTimeout(() => {
                onSuccess();
            }, 2000);

        } catch (err) {
            setClicked(false); // מאפשר ללחוץ שוב
            
            // לוגים לבדיקה
            console.error("Full error object:", err);
            console.log("Error status:", err?.status);
            console.log("Error data:", err?.data);
            console.log("Error message:", err?.data?.message);

            // טיפול בשגיאות ספציפיות
            if (err?.status === 403 && err?.data?.message === "A customer who has transactions cannot be deleted.") {
                // שגיאה ספציפית - מוצגת במקום
                setMessage("אין אפשרות למחוק לקוח שיש לו עסקאות!");
            } else if (err?.status === 500) {
                setMessage("שגיאה זמנית במערכת - אנא נסה שנית מאוחר יותר");
            } else if (err?.status === 404) {
                setMessage("הלקוח לא נמצא במערכת");
            } else if (err?.data?.message) {
                setMessage(`שגיאה: ${err.data.message}`);
            } else {
                setMessage("שגיאה זמנית במערכת - אנא נסה שנית מאוחר יותר");
            }
            // הטיפול בשגיאות 401 ו-403 כלליות נעשה ב-customBaseQuery
            
            // מניעת bubble up של השגיאה (כדי שלא תטריגר persistLogin)
            return;
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

                {message && (
                    <div style={{
                        color: "#f9a825",
                        backgroundColor: "#fff3e0",
                        padding: "10px",
                        borderRadius: "5px",
                        margin: "10px 0",
                        border: "1px solid #ffb74d",
                        textAlign: "center"
                    }}>
                        {message}
                    </div>
                )}
                <div className='navigation-buttons'>
                    <button className='modelBtn' onClick={onSuccess}>ביטול</button>
                    <button
                        className='modelBtn'
                        onClick={() => { deleteClick(customer) }}
                        disabled={clicked}
                        style={{ opacity: clicked ? 0.6 : 1 }}
                    >
                        {clicked ? "מוחק..." : "אישור"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteCustomer
