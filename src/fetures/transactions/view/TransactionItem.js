import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { GrEdit, GrCheckmark, GrClose, GrMoreVertical,GrFormUp } from "react-icons/gr";
import { BsCashCoin, BsCreditCard } from "react-icons/bs";
import { usePayInCashMutation } from "../TransactionsApiSlice";
import { setTransactionPaid } from "../../../app/transactionsSlice";
import PaymentModal from "../../../modals/PaymentModal";
import "./TransactionItem.css"

const alertsLevelMapping = {
    once: "פעם אחת",
    weekly: "שבועי",
    nudnik: "נודניק",
};

const TransactionItem = ({ transaction, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTransaction, setEditedTransaction] = useState({ ...transaction });
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false); // ניהול המודל
    const [showActions, setShowActions] = useState(false);
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

    const payInCashFunction = () => {
        const paidTransaction = payInCash({ _id: editedTransaction._id });
        if (data) {
            console.log(data);
        }

        // dispatch(setTransactionPaid(paidTransaction))
    }

    return (
        <>
            <tr>
                <td>{editedTransaction.serviceName || "שירות ללא שם"}</td>
                <td>{`₪${editedTransaction.price}`}</td>
                <td>{editedTransaction.status === "paid" ? "שולם" : "לא שולם"}</td>
                <td>{editedTransaction.customer.full_name}</td>
                <td>{formatDate(editedTransaction.createdAt)}</td>
                {editedTransaction.paymentDate ? <td>{formatDate(editedTransaction.paymentDate)}</td> : <td>{formatDate(editedTransaction.billingDay)}</td>}
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
                <td style={{ position: "relative" }}>
                    <span onClick={() => setShowActions(!showActions)} style={{ cursor: "pointer" }}>
                        {showActions? <GrFormUp size={20} /> :<GrMoreVertical size={20} />}
                        
                    </span>
                    {showActions && (
                        <div className="actions-dropdown floating-menu">
                            <div onClick={() => {payInCashFunction();setShowActions(!showActions)}} className="action-item">
                                <BsCashCoin size={20} /> תשלום במזומן
                            </div>
                            <div onClick={() => {setPaymentModalOpen(true);setShowActions(!showActions)}} className="action-item">
                                <BsCreditCard size={20} /> תשלום באשראי
                            </div>
                            <div className="action-item">
                                {isEditing ? (
                                    <div onClick={() =>{handleSave();setShowActions(!showActions)}} >
                                        <GrCheckmark size={20} />  שמירת שינויים
                                        {/* <GrClose size={20} color="red" onClick={() => setIsEditing(false)} /> */}
                                    </div>
                                ) : (<div  onClick={() => setIsEditing(true)}><GrEdit size={20} /> עריכת נודניק</div>

                                )}
                            </div>
                        </div>
                    )}
                </td>
            </tr>
            {/* המודל - מופיע אם `isPaymentModalOpen` = true */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
                transaction={editedTransaction}
            />
        </>
    );
};

export default TransactionItem;
