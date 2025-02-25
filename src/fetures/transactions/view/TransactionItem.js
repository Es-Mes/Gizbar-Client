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
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false); // מודל תשלום באשראי
    const [isCashModalOpen, setIsCashModalOpen] = useState(false); // מודל אישור תשלום במזומן

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

    const confirmPayInCash = () => {
        payInCash({ _id: editedTransaction._id })
            .then((response) => {
                console.log(response);
                dispatch(setTransactionPaid(response.data)); // עדכון סטטוס התשלום
                setIsCashModalOpen(false);
                       // dispatch(setTransactionPaid(paidTransaction))
            })
            .catch((err) => console.error("שגיאה בתשלום במזומן", err));
    };

 
    

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
                    {showActions  && (
                        <div className="actions-dropdown floating-menu">
                            <div onClick={() => {setIsCashModalOpen(true);setShowActions(!showActions)}} className="action-item">
                                <BsCashCoin size={20} /> תשלום במזומן
                            </div>
                            <div onClick={() => {setPaymentModalOpen(true);setShowActions(!showActions)}} className="action-item">
                                <BsCreditCard size={20} /> תשלום באשראי
                            </div>
                            
                                {(isEditing && editedTransaction.alertsLevel)  ? (
                                    <div  className="action-item">
                                        <GrCheckmark color="green" size={20} onClick={() =>{handleSave();setShowActions(!showActions)}} />  שמירה
                                        <GrClose color="red" size={20}  onClick={() => {setIsEditing(false);setShowActions(!showActions)}} /> ביטול
                                    </div>
                                ) : (editedTransaction.alertsLevel && <div  className="action-item" onClick={() => setIsEditing(true)}><GrEdit size={20} /> עריכת נודניק</div>

                                )}
                            
                        </div>
                    )}
                </td>
            </tr>
              {/* מודל תשלום במזומן */}
              {isCashModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>אישור תשלום במזומן</h3>
                        <br/>
                        <p className="question">האם אתה מאשר קבלת תשלום במזומן על העסקה?</p>
                        <br/>
                        <h3>פרטי העסקה:</h3>
                        <br/>
                        <p className="details"><strong>סכום:</strong> ₪{editedTransaction.price}</p>
                        <p className="details"><strong>לקוח:</strong> {editedTransaction.customer.full_name}</p>
                        <div className="modal-actions">
                        <button className="cancel-btn" onClick={() => setIsCashModalOpen(false)}>ביטול</button>
                        <button className="confirm-btn" onClick={confirmPayInCash}>אישור</button>
                        </div>
                    </div>
                </div>
            )}
            {/* מודל תשלום באשראי */}
            <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setPaymentModalOpen(false)} transaction={editedTransaction} />
        </>
    );
};

export default TransactionItem;
