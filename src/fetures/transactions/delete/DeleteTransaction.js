import React, { useState } from 'react'
import '../../../component/LoadingScreen.css';
import useAuth from '../../../hooks/useAuth';
import { red, yellow } from '@mui/material/colors';
import { useDeleteTransactionMutation } from '../TransactionsApiSlice';



const DeleteTransaction = ({ transaction, onSuccess }) => {
    const { phone } = useAuth(); // קבלת מספר הטלפון של הסוכן
        console.log(transaction);

    const [deleteTransaction, { isSuccess: isDeleteSuccess }] = useDeleteTransactionMutation()
    const [clicked, setClicked] = useState(false);
    const [message, setMessage] = useState(null)
    const deleteClick = async (transaction) => {
        console.log(transaction);
        try {
            const result = await deleteTransaction({ phone, _id: transaction._id });
            console.log(result);
            setClicked(true)
            
            if(result && !result.error){
                setMessage("העסקה נמחקה בהצלחה");   
            }
            setTimeout(() => {
                onSuccess()
            }, 2000)
        }
        catch (err) {
            setMessage(`שגיאה במחיקת העסקה ${err.error}`)
        }
    }

    return (
        <div className="backgroung-screen">
            <div className="loading-box">
                <div className=" fade-icon icon-rotate">🪙</div>
                <p className="loading-subtitle">האם אתה בטוח שברצונך לבטל את העסקה?</p>
                <h1 className="loading-title">{` ${transaction.serviceName || "שירות ללא שם"} -  ₪${transaction.price}`}</h1>
                <p>{`לקוח: ${transaction.customer.full_name}`}</p>
                <p>{`תאור: ${transaction.description || ''}`}</p>
                <p>{`תאריך חיוב:  ${new Date(transaction.billingDay).toLocaleDateString("he-IL")}`}</p>
                {message && <p style={{ color: "#f9a825" }}>{message}</p>}
                <div className='navigation-buttons'>
                    <button className='modelBtn' onClick={onSuccess}>ביטול</button>
                    <button className='modelBtn' onClick={() => { deleteClick(transaction) }} disabled={clicked}>אישור</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteTransaction
