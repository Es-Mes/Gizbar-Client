import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { GrEdit, GrCheckmark, GrClose } from "react-icons/gr";
import { BsCashCoin } from "react-icons/bs";
import { usePayInCashMutation } from "../TransactionsApiSlice";
import { setTransactionPaid } from "../../../app/transactionsSlice";
import "./TransactionItem.css"

const alertsLevelMapping = {
    once: "פעם אחת",
    weekly: "שבועי",
    nudnik: "נודניק",
};

const TransactionItem = ({ transaction, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTransaction, setEditedTransaction] = useState({ ...transaction });
    const dispatch = useDispatch();
    // console.dir(editedTransaction,{depth:null});
    const handleChange = (e) => {
        setEditedTransaction({
            ...editedTransaction,
            [e.target.name]: e.target.value,
        });
    };

    const handleSave = () => {
        onUpdate(editedTransaction);
        setIsEditing(false);
    };
    function formatDate(isoString) {
        let date = new Date(isoString);
        return date.toLocaleDateString("he-IL"); // פורמט ישראלי: DD/MM/YYYY
    }
    
    const [payInCash, { isLoading, isSuccess, isError, error, data }] = usePayInCashMutation();

    const payInCashFunction = ()=> {
        const paidTransaction = payInCash({ _id: editedTransaction._id });
        if(data){
            console.log(data);
        }
        
        // dispatch(setTransactionPaid(paidTransaction))
    }
    return (
        <tr>
            <td>
                {
                    editedTransaction.serviceName || "שירות ללא שם"
                }
            </td>
            <td>
                {
                    `₪${editedTransaction.price}`
                }
            </td>
            <td>
                {editedTransaction.status === "paid" ? "שולם" : "לא שולם"}
            </td>
            <td>{editedTransaction.customer.full_name}</td>
            <td>{formatDate(editedTransaction.createdAt)}</td>
            {editedTransaction.paymentDate? <td>{formatDate(editedTransaction.paymentDate)}</td>
            :<td>{formatDate(editedTransaction.billingDay)}</td>}

            <td>
                {isEditing ? (
                    <select
                        name="alertsLevel"
                        value={editedTransaction.alertsLevel}
                        onChange={handleChange}
                    >
                        <option value="once">פעם אחת</option>
                        <option value="weekly">שבועי</option>
                        <option value="nudnik">נודניק</option>
                    </select>
                ) : (
                    alertsLevelMapping[editedTransaction.alertsLevel] || "לא מוגדר"
                )}
            </td>
            <td style={{ cursor: "pointer" }}>
                {isEditing ? (
                    <>
                        <GrCheckmark size={20} color="green" onClick={handleSave} />
                        <GrClose size={20} color="red" onClick={() => setIsEditing(false)} />
                    </>
                ) : (
                    <GrEdit size={20} color="teal" onClick={() => setIsEditing(true)} />
                )}
            </td>
            <td style={{ cursor: "pointer" }}>
            <BsCashCoin size ={20} color = "green" onClick={payInCashFunction}
/>
            </td>
        </tr>
    );
};

export default TransactionItem;
