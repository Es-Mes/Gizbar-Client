import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { GrEdit, GrCheckmark, GrClose, GrMoreVertical, GrFormUp } from "react-icons/gr";
import { LuBellRing } from "react-icons/lu";

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
    const [showAlertsModal, setShowAlertsModal] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [openUpwards, setOpenUpwards] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
const [alertMethod, setAlertMethod] = useState("phone"); // ברירת מחדל טלפון

    const isIncome = transaction.agent.first_name ? false : true

    const dispatch = useDispatch();
    const actionsRef = useRef(null);




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
        setShowAlertsModal(false);
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
            onUpdate(response.data); 
            })
            .catch((err) => console.error("שגיאה בתשלום במזומן", err));
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (actionsRef.current && !actionsRef.current.contains(event.target)) {
                setShowActions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };
    const toggleActions = (event) => {
        if (!showActions) {
            const rect = event.currentTarget.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            // אם אין מספיק מקום למטה (פחות מ-150px), נפתח למעלה
            setOpenUpwards(spaceBelow < 150 && spaceAbove > 150);
        }
        setShowActions(!showActions);

    }

    const sendAlert = () => {
        console.log(`נשלחה התראה באמצעות: ${alertMethod} ללקוח: ${editedTransaction.customer.full_name}`);
        setIsAlertModalOpen(false);
    };


    return (
        <>
            <tr>
                <td>{editedTransaction.serviceName || "שירות ללא שם"}</td>
                <td>{`₪${editedTransaction.price}`}</td>
                <td>{editedTransaction.status === "paid" ? "שולם" : "לא שולם"}</td>
                {isIncome && <td>{editedTransaction.customer.full_name || ''}</td>}
                {!isIncome && <td>{editedTransaction.agent.first_name || ''}</td>}
                <td>{new Date(editedTransaction.createdAt).toLocaleDateString("he-IL")}</td>
                <td>
                    {editedTransaction.paymentDate ?
                        new Date(editedTransaction.paymentDate).toLocaleDateString("he-IL") :
                        new Date(editedTransaction.billingDay).toLocaleDateString("he-IL")}
                </td>
                <td>
                    {alertsLevelMapping[editedTransaction.alertsLevel] || "לא מוגדר"}
                </td>
                <td style={{ position: "relative" }} ref={actionsRef}>
                    {editedTransaction.status !== "paid" ? (
                        <span
                            onClick={(event) => { toggleActions(event); toggleMenu() }} style={{ cursor: "pointer" }}>
                            {showActions ? <GrFormUp size={20} /> : <GrMoreVertical size={20} />}
                        </span>
                    ) : (<span>-</span>)}
                    {showActions && (
                        <div className={`actions-dropdown floating-menu ${openUpwards ? "open-up" : ""}`}>
                            {isIncome &&(<div onClick={() => { setIsCashModalOpen(true); setShowActions(!showActions) }} className="action-item">
                                <BsCashCoin size={20} /> תשלום במזומן
                            </div>)}
                            {isIncome &&(<div onClick={() => { setPaymentModalOpen(true); setShowActions(!showActions) }} className="action-item">
                                <BsCreditCard size={20} /> תשלום באשראי
                            </div>)}

                            {isIncome &&(<div className="action-item" onClick={() => setShowAlertsModal(true)}>
                                <GrEdit size={20} /> עריכת נודניק
                            </div>)}
                            {isIncome &&(<div className="action-item" onClick={() => setIsAlertModalOpen(true)}>
                                <LuBellRing size={20} /> שליחת התראה
                            </div>)}
                            {!isIncome &&(<div onClick={() => {  setShowActions(!showActions) }} className="action-item">
                                <BsCreditCard size={20} /> תשלום חוב באשראי(בפיתוח)
                            </div>)}


                        </div>
                    )}
                </td>
            </tr>
            {/* מודל תשלום במזומן */}
            {isCashModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>אישור תשלום במזומן</h3>
                        <br />
                        <p className="question">האם אתה מאשר קבלת תשלום במזומן על העסקה?</p>
                        <br />
                        <h3>פרטי העסקה:</h3>
                        <br />
                        <p className="details"><strong>סכום:</strong> ₪{editedTransaction.price}</p>
                        <p className="details"><strong>לקוח:</strong> {editedTransaction.customer.full_name}</p>
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setIsCashModalOpen(false)}>ביטול</button>
                            <button className="confirm-btn" onClick={confirmPayInCash}>אישור</button>
                        </div>
                    </div>
                </div>
            )}
            {showAlertsModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>עריכת רמת התראות</h3>
                        <select name="alertsLevel" value={editedTransaction.alertsLevel} onChange={handleChange}>
                            <option value="once">פעם אחת</option>
                            <option value="weekly">שבועי</option>
                            <option value="nudnik">נודניק</option>
                        </select>
                        <div className="modal-actions">
                            <button onClick={() => setShowAlertsModal(false)}>ביטול</button>
                            <button onClick={handleSave}>שמור</button>
                        </div>
                    </div>
                </div>
            )}
            {/* מודל תשלום באשראי */}
            <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setPaymentModalOpen(false)} transaction={editedTransaction} />
           
            {/* מודל שליחת התראה  */}
            {isAlertModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>בחר אמצעי לשליחת התראה</h3>
                        <select value={alertMethod} onChange={(e) => setAlertMethod(e.target.value)}>
                            <option value="phone">טלפון</option>
                            <option value="email">מייל</option>
                            <option value="both">טלפון + מייל</option>
                            <option value="human">שליחה לפקידה</option>
                        </select>
                        <div className="modal-actions">
                            <button onClick={() => setIsAlertModalOpen(false)}>ביטול</button>
                            <button onClick={sendAlert}>שלח</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TransactionItem;