import React, { useState } from 'react'
import '../../../component/LoadingScreen.css';
import useAuth from '../../../hooks/useAuth';
import { useDeleteCustomerMutation } from '../customersApiSlice';



const DeleteCustomer = ({ customer, onSuccess }) => {
    const { phone } = useAuth(); // קבלת מספר הטלפון של הסוכן

    const [deleteCustomer, { isSuccess: isDeleteSuccess }] = useDeleteCustomerMutation()
    const [success, setSuccess] = useState(null)
    const deleteClick = async (customer) => {
        console.log(customer);
        try {
            const result = await deleteCustomer({ phone, _id: customer._id });
            if ('error' in result && result.error.status === 403) {
                alert("אין אפשרות למחוק לקוח שיש לו עסקאות.");
            } 
                setSuccess("הלקוח נמחק בהצלחה");
                setTimeout(() => {
                    onSuccess()
                }, 2000)
        }
        catch (err) {
            setSuccess(`שגיאה במחיקת הלקוח ${err}`)
        }
    }

    return (
        <div className="backgroung-screen">
            <div className="loading-box">
                <div className=" fade-icon icon-rotate">👤</div>
                <h1 className="loading-title">שם הלקוח: </h1>
                <p className="loading-subtitle">האם אתה בטוח שברצונך למחוק לקוח זה?</p>
                {success && <p>{success}</p>}
                <div className='navigation-buttons'>
                    <button className='modelBtn' onClick={onSuccess}>ביטול</button>
                    <button className='modelBtn' onClick={() => {deleteClick(customer)}}>אישור</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteCustomer
