import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { GrEdit, GrCheckmark, GrClose, GrMoreVertical, GrFormUp } from "react-icons/gr";
import { LuBellRing } from "react-icons/lu";
import { IoTrashOutline } from "react-icons/io5";

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

const TransactionItem = ({ transaction }) => {
    const { phone } = useAuth();
    const [editedTransaction, setEditedTransaction] = useState({ ...transaction });
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false); // מודל תשלום באשראי
    const [isCashModalOpen, setIsCashModalOpen] = useState(false); // מודל אישור תשלום במזומן
    const [isSendLinkModalOpen, setSendLinkModalOpen] = useState(false)
    const [sendLinkClicked, setSendLinkClicked] = useState(false)
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
    const [showAlertsModal, setShowAlertsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [openUpwards, setOpenUpwards] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertMethod, setAlertMethod] = useState("");
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



    const confirmPayInCash = async () => {
        setPayInCashClicked(true);
        try {
            const result = await payInCash({ _id: editedTransaction._id });

            if (result?.data) {
                console.log("תשלום במזומן עבר בהצלחה:", result.data);
                toast.success("התשלום עודכן בהצלחה 👍 ", { icon: false })
                setIsCashModalOpen(false);
            } else if (result?.error) {
                const status = result.error.status;
                const msg = result.error.data?.message || result.error.message || "שגיאה לא צפויה";
                console.error("שגיאה בתשלום במזומן:", msg);
                setPayInCashMessage(`שגיאה (${status}): ${msg}`);
            }
        } catch (err) {
            const message = err?.data?.message || err?.message || "שגיאה כללית";
            console.error("שגיאת מערכת בתשלום במזומן:", message);
            setPayInCashMessage(`שגיאה בתשלום: ${message}`);
        } finally {
            setTimeout(() => {
                setPayInCashMessage("");
                setPayInCashClicked(false);
            }, 3000);
        }
    };

    const sendPayLink = () => {
        setSendLinkClicked(true)
        const baseUrl = process.env.REACT_APP_CLIENT_URL || "";
        const link = `${baseUrl}/payment/${phone}/${transaction._id}`;
        console.log(`link ${link}`);



    }
    const handleCopy = () => {
        const baseUrl = process.env.REACT_APP_CLIENT_URL || "";
        const link = `${baseUrl}/payment/${phone}/${transaction._id}`;
        navigator.clipboard.writeText(link)
            .then(() => toast.success("הקישור הועתק 👍 ", { icon: false }))
            .catch(() => toast.error("העתקה נכשלה."));
    };


    const sendAlert = async () => {
        if (alertMethod === "") {
            setAlertMessage("לא נבחרה אופציה");
            return;
        }

        try {
            const result = await sendReminder({ type: alertMethod, _id: editedTransaction._id });
            setAlertClicked(true);

            if (result?.data) {
                const name = editedTransaction?.customer?.full_name || "הלקוח";
                switch (alertMethod) {
                    case "human":
                        toast.success(`תשלח תזכורת באמצעות מזכירה ל${name}`, { icon: false })
                        break;
                    case "call":
                        toast.success(`תזכורת טלפונית נשלחה בהצלחה ל${name}`, { icon: false })
                        break;
                    case "email":
                        toast.success(`נשלחה תזכורת במייל ל${name}`, { icon: false })
                        break;
                    case "emailAndCall":
                        toast.success(`נשלחה תזכורת במייל ובטלפון ל${name}`, { icon: false })
                        break;
                    default:
                        toast.success(`נשלחה התראה ל${name}`, { icon: false })
                            ``
                }
                setTimeout(() => {
                    setIsAlertModalOpen(false);
                    setAlertMessage("");
                    setAlertClicked(false);
                }, 2000);
            } else if (result?.error) {
                const status = result.error.status;
                const msg = result.error.data?.message || result.error.message || "שגיאה כללית";
                setAlertMessage(`שגיאה (${status}): ${msg}`);
            }
        } catch (err) {
            const message = err?.data?.message || err?.message || "שגיאה לא צפויה";
            setAlertMessage(`שגיאה בשליחת ההתראה: ${message}`);
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
                {isIncome && <td>{editedTransaction.customer.full_name || ''}</td>}
                {!isIncome && <td>{editedTransaction.agent.first_name || ''}</td>}
                <td>{`₪${editedTransaction.price}`}</td>
                <td>{new Date(editedTransaction.createdAt).toLocaleDateString("he-IL")}</td>
                <td>{editedTransaction.serviceName || "שירות ללא שם"}</td>
                <td>
                    {editedTransaction.paymentDate ?
                        new Date(editedTransaction.paymentDate).toLocaleDateString("he-IL") :
                        new Date(editedTransaction.billingDay).toLocaleDateString("he-IL")}
                </td>
                <td>{editedTransaction.status === "paid" ? "שולם" : (editedTransaction.status == "canceled" ? "בוטל" : "לא שולם")}</td>
                <td>
                    {(editedTransaction.status == "notPaid" || editedTransaction.status == "pendingCharge") ?
                        (alertsLevelMapping[editedTransaction.alertsLevel] || "לא מוגדר") :
                        (<span>-</span>)}
                </td>
                <td style={{ position: "relative" }} ref={actionsRef}>
                    {(editedTransaction.status == "notPaid" || editedTransaction.status == "pendingCharge") ? (
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
                            {/* {isIncome && (<div onClick={() => { setSendLinkModalOpen(true); setShowActions(!showActions) }} className="action-item">
                                <BsCreditCard size={20} /> שליחת לינק לתשלום
                            </div>)} */}
                            {isIncome && (<div className="action-item" onClick={() => setIsAlertModalOpen(true)}>
                                <LuBellRing size={20} /> שליחת התראה
                            </div>)}
                            {isIncome && (<div className="action-item" onClick={() => setShowEditModal(true)}>
                                <GrEdit size={20} /> עריכת פרטי עסקה
                            </div>)}
                            {isIncome && (<div className="action-item" onClick={() => setDeleteModalOpen(true)}>
                                <IoTrashOutline size={20} /> מחיקת עסקה
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
                    <div className="background-screen">
                        <div className="loading-box">
                            <div className="cash-bill">💵</div>
                            <h3 className="loading-title">אישור תשלום במזומן</h3>
                            <br />
                            <p className="question">האם אתה מאשר<br /> קבלת תשלום במזומן על העסקה?</p>
                            <br />
                            <h3 style={{ color: "#f9a825" }}>פרטי העסקה:</h3>
                            <br />
                            <p className="details"><strong>סכום:</strong> ₪{editedTransaction.price}</p>
                            <p className="details"><strong>לקוח:</strong> {editedTransaction.customer.full_name}</p>
                            {payInCashMessage && <p style={{ color: "#f9a825" }}>{payInCashMessage}</p>}
                            <div className="navigation-buttons">
                                <button className="modelBtn" onClick={() => setIsCashModalOpen(false)}>ביטול</button>
                                <button className="modelBtn" onClick={confirmPayInCash} disabled={payInCashClicked}>אישור</button>
                            </div>
                        </div>
                    </div>
                </Modal>

            )}

            {isSendLinkModalOpen && (

                <Modal isOpen={isSendLinkModalOpen} onClose={() => { setSendLinkModalOpen(false) }}>
                    <div className="background-screen">
                        <div className="loading-box">
                            <div className="credit-swipe">💳</div>
                            <h3 className="loading-title">שליחת קישור לתשלום</h3>

                            <p className="question">בחר באפשרות המתאימה עבורך:</p>

                            <div className="navigation-buttons">
                                <button className="modelBtn bigBtn" onClick={sendPayLink} disabled={sendLinkClicked}>שלח מייל אוטומטי</button>
                                <button className="modelBtn bigBtn" onClick={handleCopy}>🔗העתק קישור</button>

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
                    <div className="background-screen">
                        <div className="loading-box">
                            <div className="bill">🔔</div>
                            <h3 style={{ color: "#3a256d" }}>בחר אמצעי לשליחת התראה</h3>
                            <div className="stepBox">
                                {/* <label>סוג:</label> */}
                                {[{ value: 'emailAndCall', name: 'מייל וטלפון' },
                                { value: 'email', name: 'מייל בלבד' },
                                { value: 'call', name: 'טלפון בלבד' },
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
                                <button className="modelBtn" onClick={() => {
                                    setIsAlertModalOpen(false)
                                    setAlertMessage("");
                                    setAlertClicked(false);
                                }}>ביטול</button>
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