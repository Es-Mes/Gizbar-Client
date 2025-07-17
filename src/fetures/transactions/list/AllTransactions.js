import React, { useState } from "react";
import { useSelector } from "react-redux";
import useAuth from "../../../hooks/useAuth";
import TransactionsList from "./TransactionsList";
import { useMemo } from "react";
import { useGetAllTransactionsQuery } from "../TransactionsApiSlice";

const AllTransactions = () => {
    const { _id, phone } = useAuth();
    const { data: transactions = [], isLoading: isLoading, error: error } = useGetAllTransactionsQuery({ phone });


    const [requireField, setRequireFiled] = useState(3); // ברירת מחדל: שלושה חודשים אחורה

    // כל העסקאות
    const transactionsAsProvider = useMemo(() => [...transactions].reverse(), [transactions]);

    // // מסנן עסקאות על בסיס התקופה שנבחרה
    // const filterDelayedTransactions = (transactionsAsProvider, requireDate) => {
    //     const today = new Date();
    //     const requireDateAgo = new Date();
    //      // לחשב את התאריך הרצוי אחורה
    //      if (requireDate === 0) {
    //         // במקרה של 0, החזר את כל העסקאות
    //         return [...transactionsAsProvider].filter(
    //             (transaction) =>
    //                 transaction.status === "notPaid");
    //     } else if (requireDate === 12) {
    //         // שנה אחורה
    //         requireDateAgo.setFullYear(today.getFullYear() - 1);
    //     } else {
    //         // חודש או שלושה חודשים אחורה
    //         requireDateAgo.setMonth(today.getMonth() - requireDate);
    //     }

    //     return [...transactionsAsProvider]
    //         .filter(
    //             (transaction) =>
    //                 transaction.status === "notPaid" && // רק עסקאות שלא שולמו
    //                 new Date(transaction.billingDay) >= requireDateAgo // עסקאות מהתקופה שנבחרה
    //         )
    //         .sort((a, b) => new Date(b.billingDay) - new Date(a.billingDay)) // מיון לפי תאריך
    //         .map((transaction) => ({
    //             ...transaction,
    //             agent: undefined, // מחיקת שדה agent
    //         }));
    // };

    // const delayedTransactionsArr = filterDelayedTransactions(transactionsAsProvider, requireDate) || [];

    return (
        <div>
            <div className="transactions-display">
                <h2>כל העסקאות</h2>
                <div className="selectEdgDate">
                    <label htmlFor="requireField">בחר שדה לסינון :</label>
                    <select
                        id="field"
                        value={requireField}
                        onChange={(e) => setRequireFiled(e.target.value)}
                        style={{ marginLeft: "10px", padding: "5px" }}
                    >
                        <option value={"customer"}>שם לקוח</option>
                        <option value={"date"}> תאריך גביה</option>
                        <option value={"service"}>סוג שירות</option>
                        <option value={"all"}>הכול</option>
                    </select>
                </div>
                <TransactionsList transactions={transactionsAsProvider} />
            </div>
        </div>
    );
};

export default AllTransactions;
