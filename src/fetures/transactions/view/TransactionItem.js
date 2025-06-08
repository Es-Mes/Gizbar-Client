import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { GrEdit, GrCheckmark, GrClose, GrMoreVertical, GrFormUp } from "react-icons/gr";
import { LuBellRing } from "react-icons/lu";

import { BsCashCoin, BsCreditCard } from "react-icons/bs";
import { usePayInCashMutation, useSendReminderMutation, useUpdateTransactionMutation } from "../TransactionsApiSlice";
import PaymentModal from "../../../modals/PaymentModal";
import "./TransactionItem.css"
import Modal from "../../../modals/Modal";
import EditTransactionModal from "../edit/EditTransactionsModal";
import useAuth from "../../../hooks/useAuth";
import DeleteTransaction from "../delete/DeleteTransaction";

const alertsLevelMapping = {
    once: "פעם אחת",
    weekly: "שבועי",
    nudnik: "נודניק",
};

const TransactionItem = ({ transaction, onUpdate }) => {
    const { phone } = useAuth();
    const [editedTransaction, setEditedTransaction] = useState({ ...transaction });
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false); // מודל תשלום באשראי
    const [isCashModalOpen, setIsCashModalOpen] = useState(false); // מודל אישור תשלום במזומן
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
    const [showAlertsModal, setShowAlertsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [openUpwards, setOpenUpwards] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertMethod, setAlertMethod] = useState("email"); // ברירת מחדל טלפון
    const [payInCashClicked, setPayInCashClicked] = useState(false);
    const [payInCashMessage, setPayInCashMessage] = useState("")
    const [alertClicked, setAlertClicked] = useState(false);
    const [alertMessage, setAlertMessage] = useState("")


    const isIncome = transaction.agent.first_name ? false : true

    const actionsRef = useRef(null);

    // console.dir(editedTransaction,{depth:null});
    const handleChange = (e) => {
        setEditedTransaction({
            ...editedTransaction,
            [e.target.name]: e.target.value,
        });
    };


    function formatDate(isoString) {
        let date = new Date(isoString);
        return date.toLocaleDateString("he-IL"); // פורמט ישראלי: DD/MM/YYYY
    }

    const [payInCash] = usePayInCashMutation();
    const [sendReminder] = useSendReminderMutation();
    const [updateTransaction] = useUpdateTransactionMutation();

    const confirmPayInCash = () => {
        payInCash({ _id: editedTransaction._id })
            .then((response) => {
                console.log(response);
                setIsCashModalOpen(false);
                setPayInCashClicked(true)
                onUpdate(response.data);
            })
            .catch((err) => console.error("שגיאה בתשלום במזומן", err));
    };

    const sendAlert = async () => {
        if(alertMessage === ""){
            setAlertMessage("לא נבחרה אופציה")
            return;
        }
        try{
            console.log(alertMethod);
            const result = await sendReminder({ type: alertMethod, _id: editedTransaction._id })
            setAlertClicked(true)
            if(result && !result.error){
            console.log(`נשלחה התראה באמצעות: ${alertMethod} ללקוח: ${editedTransaction.customer.full_name}`);
                switch(alertMethod){
                    case "human":
                    setAlertMessage(`תשלח תזכורת באמצעות מזכירה ללקוח ${editedTransaction.customer.full_name}  `)
                    break;
                    case "phone only":
                    setAlertMessage(`תזכורת טלפונית נשלחה בהצלחה ללקוח ${editedTransaction.customer.full_name}  `)
                    break;
                    case "email only":
                    setAlertMessage(`נשלחה תזכורת במייל ללקוח ${editedTransaction.customer.full_name}  `)
                    break;
                    case "email and phone":
                    setAlertMessage(`נשלחה תזכורת במייל ובטלפון ללקוח ${editedTransaction.customer.full_name}  `)
                }
            }
            setTimeout(() => {
                setIsAlertModalOpen(false)
                setAlertMessage("")
                setAlertClicked(false)
            }, 2000)
        }
        catch(err){
            setAlertMessage(`שגיאה בשליחת ההתראה ${err.error}`)
        }
       
    };

    const handleSave = async () => {
        try {
            console.log(`transaction:${editedTransaction}`);
            const result = await updateTransaction({ phone, transaction: editedTransaction });
            console.log("תוצאה מהשרת", result);

            setShowAlertsModal(false);
        }
        catch (err) {
            console.log("שגיאה בעדכון עסקה", err);

        }

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
                            {isIncome && (<div onClick={() => { setIsCashModalOpen(true); setShowActions(!showActions) }} className="action-item">
                                <BsCashCoin size={20} /> תשלום במזומן
                            </div>)}
                            {isIncome && (<div onClick={() => { setPaymentModalOpen(true); setShowActions(!showActions) }} className="action-item">
                                <BsCreditCard size={20} /> תשלום באשראי
                            </div>)}
                            {isIncome && (<div className="action-item" onClick={() => setShowEditModal(true)}>
                                <GrEdit size={20} /> עריכת פרטי עסקה
                            </div>)}
                            {/* {isIncome && (<div className="action-item" onClick={() => setShowAlertsModal(true)}>
                                <GrEdit size={20} /> עריכת נודניק
                            </div>)} */}
                            {isIncome && (<div className="action-item" onClick={() => setIsAlertModalOpen(true)}>
                                <LuBellRing size={20} /> שליחת התראה
                            </div>)}
                            {isIncome && (<div className="action-item" onClick={() => setDeleteModalOpen(true)}>
                                <LuBellRing size={20} /> מחיקת עסקה
                            </div>)}
                            {!isIncome && (<div onClick={() => { setShowActions(!showActions) }} className="action-item">
                                <BsCreditCard size={20} /> תשלום חוב באשראי(בפיתוח)
                            </div>)}


                        </div>
                    )}
                </td>
            </tr>
            {/* מודל תשלום במזומן */}
            {isCashModalOpen && (

                <Modal isOpen={isCashModalOpen} onClose={() => { setIsCashModalOpen(false) }}>
                    <div className="backgroung-screen">
                        <div className="loading-box">
                            <div className="cash-bill">💵</div>
                            <h3 className="loading-title">אישור תשלום במזומן</h3>
                            <br />
                            <p className="question">האם אתה מאשר<br /> קבלת תשלום במזומן על העסקה?</p>
                            <br />
                            <h3 style={{color:"#f9a825" }}>פרטי העסקה:</h3>
                            <br />
                            <p className="details"><strong>סכום:</strong> ₪{editedTransaction.price}</p>
                            <p className="details"><strong>לקוח:</strong> {editedTransaction.customer.full_name}</p>
                            <div className="navigation-buttons">
                                <button className="modelBtn" onClick={() => setIsCashModalOpen(false)}>ביטול</button>
                                <button className="modelBtn" onClick={confirmPayInCash} disabled={payInCashClicked}>אישור</button>
                            </div>
                        </div>
                    </div>
                </Modal>

            )}

            {showEditModal && <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false) }}>
                <EditTransactionModal
                    onSuccess={() => setShowEditModal(false)}
                    transaction={transaction} />
            </Modal>}
            {/* מודל תשלום באשראי */}
            <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setPaymentModalOpen(false)} transaction={editedTransaction} />

            {/* מודל שליחת התראה  */}
            {isAlertModalOpen && (
                <Modal isOpen={isAlertModalOpen} onClose={() => { setIsAlertModalOpen(false) }}>
                    <div className="backgroung-screen">
                        <div className="loading-box">
                            <div className="bill">🔔</div>
                            <h3 style={{color:"#3a256d"}}>בחר אמצעי לשליחת התראה</h3>
                            <div className="stepBox">
                            {/* <label>סוג:</label> */}
                            {[{ value: 'email and phone', name: 'מייל וטלפון' },
                            { value: 'email only', name: 'מייל בלבד' },
                            { value: 'phone only', name: 'טלפון בלבד' },
                            { value: 'human', name: 'אנושי' },
                            ].map((type) => (
                                <div className="alertRow" key={type.value}>
                                    <input
                                        type="radio"
                                        name="typeAlerts"
                                        value={type.value}
                                        onChange={(e) => setAlertMethod(e.target.value)}
                                    />
                                    {type.name}
                                </div>
                            ))}
                            </div>
                                            {alertMessage && <p style={{ color: "#f9a825" }}>{alertMessage}</p>}
<div className='navigation-buttons'>
                                <button className="modelBtn" onClick={() => setIsAlertModalOpen(false)}>ביטול</button>
                                <button className="modelBtn" onClick={sendAlert} disabled={alertClicked}>שלח</button>
                            </div>
                        </div>
                    </div>
                </Modal>

            )}
            {/* delete transaction modal */}
            {isDeleteModalOpen && <Modal isOpen={isDeleteModalOpen} onClose={() => { setDeleteModalOpen(false) }}>
                <DeleteTransaction
                    onSuccess={() => setDeleteModalOpen(false)}
                    transaction={transaction} />
            </Modal>}
        </>
    );
};

export default TransactionItem;