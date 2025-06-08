import React, { useState, useEffect } from "react";
import { useUpdateTransactionMutation } from "../TransactionsApiSlice";
import useAuth from "../../../hooks/useAuth";

const EditTransactionModal = ({ transaction, onSuccess }) => {
    const { phone } = useAuth()
    const [price, setPrice] = useState(0);
    const [billingDay, setBillingDay] = useState("");
    const [alertsLevel, setAlertsLevel] = useState("");
    const [updateTransaction] = useUpdateTransactionMutation();
    const [clicked, setClicked] = useState(false);
    const [message, setMessage] = useState(null)

    // עדכון ערכים התחלתיים מתוך העסקה
    useEffect(() => {
        if (transaction) {
            setPrice(transaction.price || 0);
            setBillingDay(transaction.billingDay?.slice(0, 10) || "");
            setAlertsLevel(transaction.alertsLevel || "once");
        }
    }, [transaction]);

    const handleSave = async () => {
        try {
            await updateTransaction({
                phone: phone,
                transaction: {
                    ...transaction,
                    price,
                    billingDay: new Date(billingDay),
                    alertsLevel,
                },
            }).unwrap();
            setClicked(true)
            setMessage("הנתונים עודכנו בהצלחה")
            setTimeout(() => {
                onSuccess()
            }, 2000)
        } catch (err) {
            console.log(err);
            setMessage(`שגיאה בעדכון העסקה ${err.error}`)
        }
    };

    return (
        <div className="backgroung-screen">
            <div className="loading-box">
                <div className="rotating-coin">🪙</div>
                <h2>עריכת עסקה</h2>
                <div className="modalForm">
                    <div>
                        <label>מחיר: </label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                        />
                    </div>
                    <div>
                        <label>תאריך חיוב: </label>
                        <input
                            type="date"
                            value={billingDay}
                            onChange={(e) => setBillingDay(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>רמת התראות: </label>
                        <select
                            value={alertsLevel}
                            onChange={(e) => setAlertsLevel(e.target.value)}
                        >
                            <option value="once">פעם אחת</option>
                            <option value="weekly">שבועי</option>
                            <option value="nudnik">נודניק</option>
                        </select>
                    </div>
                </div>
                {message && <p style={{ color: "#f9a825" }}>{message}</p>}
                <div className='navigation-buttons'>
                    <button className='modelBtn' onClick={onSuccess}>ביטול</button>
                    <button className='modelBtn' onClick={handleSave} disabled={clicked}>שמור</button>
                </div>
            </div>
        </div>
    );
};

export default EditTransactionModal;
