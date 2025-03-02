import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import ReactDOM from "react-dom";
import { useDispatch } from "react-redux";
import { GrEdit, GrCheckmark, GrClose, GrMoreVertical, GrFormUp } from "react-icons/gr";
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
    const dispatch = useDispatch();
    const actionsRef = useRef(null);
    const dropdownRoot = document.getElementById("dropdown-root"); // נוודא שיש מקום להכניס את התפריט אליו
    const [dropdownPosition, setDropdownPosition] = useState("below");

    //טיפול בתפריט הנפתח
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, isAbove: false });
    const buttonRef = useRef(null);
    const menuRef = useRef(null);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    useLayoutEffect(() => {
        if (menuOpen && buttonRef.current && menuRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            const menuHeight = menuRef.current.offsetHeight || 0;
            const spaceBelow = window.innerHeight - buttonRect.bottom;
            const spaceAbove = buttonRect.top;
            const isAbove = spaceBelow < menuHeight;

            console.log("buttonRect:", buttonRect);
            console.log("window.scrollY:", window.scrollY);
            console.log("window.scrollX:", window.scrollX);


            let top = buttonRect.bottom + window.scrollY; // ברירת מחדל - מתחת לכפתור
        if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
            top = buttonRect.top - menuHeight + window.scrollY; // אם אין מקום למטה, תעלה למעלה
        }

        setMenuPosition({
            top: top,
            left: buttonRect.left + window.scrollX,
        });
    

        }
    }, [menuOpen]);



    const toggleActions = (event) => {
        if (showActions) {
            setShowActions(false);
            return;
        }

        const rect = event.target.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        setShowActions(true);
        setTimeout(() => {
            if (actionsRef.current) {
                const menuHeight = actionsRef.current.offsetHeight;

                if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
                    setDropdownPosition("above");
                } else {
                    setDropdownPosition("below");
                }
            }
        }, 0);
    };


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

    const [payInCash] = usePayInCashMutation();

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


    return (
        <>
            <tr>
                <td>{editedTransaction.serviceName || "שירות ללא שם"}</td>
                <td>{`₪${editedTransaction.price}`}</td>
                <td>{editedTransaction.status === "paid" ? "שולם" : "לא שולם"}</td>
                <td>{editedTransaction.customer.full_name}</td>
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
                        <span ref={buttonRef}
                            onClick={(event) => { toggleActions(event); toggleMenu() }} style={{ cursor: "pointer" }}>
                            {showActions ? <GrFormUp size={20} /> : <GrMoreVertical size={20} />}
                        </span>
                    ) : (<span>-</span>)}
                    {showActions && dropdownRoot &&
                        ReactDOM.createPortal(
                            <div ref={menuRef}
                                className={`actions-dropdown ${dropdownPosition} floating-menu`}
                                style={{
                                    position: "absolute",
                                    top: `${menuPosition.top}px`,
                                    left: `${menuPosition.left}px`,
                                }}                     >
                                <div onClick={() => { setIsCashModalOpen(true); setShowActions(!showActions) }} className="action-item">
                                    <BsCashCoin size={20} /> תשלום במזומן
                                </div>
                                <div onClick={() => { setPaymentModalOpen(true); setShowActions(!showActions) }} className="action-item">
                                    <BsCreditCard size={20} /> תשלום באשראי
                                </div>

                                <div className="action-item" onClick={() => setShowAlertsModal(true)}>
                                    <GrEdit size={20} /> עריכת נודניק
                                </div>

                            </div>,
                            dropdownRoot
                        )}
                </td>
            </tr >
            {/* מודל תשלום במזומן */}
            {
                isCashModalOpen && (
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
                )
            }
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
        </>
    );
};

export default TransactionItem;
