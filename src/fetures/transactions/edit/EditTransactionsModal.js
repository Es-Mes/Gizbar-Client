import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';

import { useUpdateTransactionMutation } from "../TransactionsApiSlice";
import useAuth from "../../../hooks/useAuth";
import { TextField } from "@mui/material";

const EditTransactionModal = ({ transaction, onSuccess }) => {
    const { phone } = useAuth();
    const [price, setPrice] = useState(0);
    const [billingDay, setBillingDay] = useState("");
    const [updateTransaction] = useUpdateTransactionMutation();
    const [clicked, setClicked] = useState(false);
    const [message, setMessage] = useState(null);

    const [transactionDetails, setTransactionDetails] = useState(transaction || {});

    // עדכון ערכים התחלתיים מתוך העסקה
    useEffect(() => {
        if (transaction) {
            setPrice(transaction.price || 0);
            setBillingDay(transaction.billingDay?.slice(0, 10) || "");
            setTransactionDetails({
                alerts: transaction.alerts || false,
                typeAlerts: transaction.typeAlerts || "",
                alertsLevel: transaction.alertsLevel || "once",
            });
            setMessage(null);
            setClicked(false);
        }
    }, [transaction]);

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        const fieldValue = type === "checkbox" ? checked : value;

        setTransactionDetails((prev) => {
            let updatedDetails = {
                ...prev,
                [name]: fieldValue,
            };

            if (name === "alerts") {
                updatedDetails = {
                    ...updatedDetails,
                    alerts: fieldValue,
                    typeAlerts: fieldValue ? "email and phone" : "",
                    alertsLevel: fieldValue ? "once" : "",
                };
            }
            return updatedDetails;
        });
    };

    const handleSave = async () => {
        const { customer, ...transactionWithoutCustomer } = transaction;
        try {
            await updateTransaction({
                phone: phone,
                transaction: {
                    ...transactionWithoutCustomer,
                    price,
                    billingDay: new Date(billingDay),
                    alertsLevel: transactionDetails.alertsLevel,
                    typeAlerts: transactionDetails.typeAlerts,
                    alerts: transactionDetails.alerts
                },
            }).unwrap();

            setClicked(true);
            toast.success("הנתונים עודכנו בהצלחה 👍 ", { icon: false })
            setTimeout(() => {
                onSuccess();
            }, 2000);
        } catch (err) {
            console.log(err);
            setMessage(`שגיאה בעדכון העסקה ${err.error}`);
        }
    };

    return (
        <div className="background-screen">
            <div className="loading-box" style={{ margin: "30px" }}>
                <div className="rotating-coin"><img src="/icons8-coin-50.png" /></div>
                <h2>עריכת עסקה</h2>
                <div className="modalForm">
                    <div>
                        <TextField variant="outlined"
                            type="number"
                            value={price} מחיר
                            label='מחיר'
                            onChange={(e) => setPrice(Number(e.target.value))}
                        />
                    </div>
                    <div>
                        <TextField variant="outlined"
                            type="date"
                            value={billingDay}
                            label='תאריך חיוב'
                            onChange={(e) => setBillingDay(e.target.value)}
                        />
                    </div>

                    <div className="field-group full-width" >
                        <label style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems:'center',
                        gap:'15px'
                    }}htmlFor="alerts">הפעל התראות
                            <input
                                className="noFocus"
                                type="checkbox"
                                id="alerts"
                                name="alerts"
                                checked={transactionDetails.alerts}
                                onChange={handleInputChange}
                            />
                        </label>
                    </div>

                    {transactionDetails.alerts && (
                        <div className="stepBox">
                            {[
                                { value: 'email and phone', name: 'מייל וטלפון' },
                                { value: 'email only', name: 'מייל בלבד' },
                                { value: 'phone only', name: 'טלפון בלבד' },
                                { value: 'human', name: 'אנושי' },
                            ].map((type) => (
                                <div className="alertRow" key={type.value}>
                                    <input
                                        type="radio"
                                        name="typeAlerts"
                                        value={type.value}
                                        checked={transactionDetails.typeAlerts === type.value}
                                        onChange={handleInputChange}
                                    />
                                    {type.name}
                                </div>
                            ))}
                            {[
                                { value: 'once', name: 'פעם אחת' },
                                { value: 'weekly', name: 'שבועי' },
                                { value: 'nudnik', name: 'נודניק' }
                            ].map((level) => (
                                <div className="alertRow" key={level.value}>
                                    <input
                                        type="radio"
                                        name="alertsLevel"
                                        value={level.value}
                                        checked={transactionDetails.alertsLevel === level.value}
                                        onChange={handleInputChange}
                                    />
                                    {level.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {message && <p style={{ color: "#f9a825" }}>{message}</p>}

                <div className='navigation-buttons'>
                    <button className='modelBtn' onClick={onSuccess}>ביטול</button>
                    <button className='modelBtn' onClick={handleSave} disabled={clicked}>שמור</button>
                </div>
            </div>
        </div >
    );
};

export default EditTransactionModal;
