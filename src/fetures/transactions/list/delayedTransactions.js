import React, { useState } from "react";
import { useSelector } from "react-redux";
import useAuth from "../../../hooks/useAuth";
import TransactionsList from "./TransactionsList";
import TransactionItem from "../view/TransactionItem";
import "./delayedTransactions.css"

const DelayedTransactions = () => {
    const { _id } = useAuth();
    const transactions = useSelector((state) => state.transactions.transactions || []);
    const isLoading = useSelector((state) => state.transactions?.isLoading);
    const error = useSelector((state) => state.transactions?.error);

    const [requireDate, setRequireDate] = useState(3); // ברירת מחדל: שלושה חודשים אחורה

    // כל העסקאות
    const transactionsAsProvider = [...transactions].filter((transaction) => transaction.agent === _id);

    // מסנן עסקאות על בסיס התקופה שנבחרה
    const filterDelayedTransactions = (transactionsAsProvider, requireDate) => {
        const today = new Date();
        const requireDateAgo = new Date();
        // לחשב את התאריך הרצוי אחורה
        if (requireDate === 0) {
            // במקרה של 0, החזר את כל העסקאות
            return [...transactionsAsProvider].filter(
                (transaction) =>
                    transaction.status === "notPaid");
        } else if (requireDate === 12) {
            // שנה אחורה
            requireDateAgo.setFullYear(today.getFullYear() - 1);
        } else {
            // חודש או שלושה חודשים אחורה
            requireDateAgo.setMonth(today.getMonth() - requireDate);
        }

        return [...transactionsAsProvider]
            .filter(
                (transaction) =>
                    transaction.status === "notPaid" && // רק עסקאות שלא שולמו
                    new Date(transaction.billingDay) >= requireDateAgo // עסקאות מהתקופה שנבחרה
            )
            .sort((a, b) => new Date(b.billingDay) - new Date(a.billingDay)) // מיון לפי תאריך
            .map((transaction) => ({
                ...transaction,
                agent: undefined, // מחיקת שדה agent
            }));
    };

    const delayedTransactionsArr = filterDelayedTransactions(transactionsAsProvider, requireDate) || [];

    // return (
    //     <div>
    //         <div className="transactions-display">
    //             <h2>תשלומים בפיגור</h2>
    //             <div className="selectEdgDate">
    //                 <label htmlFor="requireDate">בחר תקופה להצגת העסקאות:</label>
    //                 <select
    //                     id="requireDate"
    //                     value={requireDate}
    //                     onChange={(e) => setRequireDate(Number(e.target.value))}
    //                     style={{ marginLeft: "10px", padding: "5px" }}
    //                 >
    //                     <option value={1}>חודש אחורה</option>
    //                     <option value={3}>שלושה חודשים אחורה</option>
    //                     <option value={12}>שנה אחורה</option>
    //                     <option value={0}>הכול</option>
    //                 </select>
    //             </div>
    //             <TransactionsList transactions={delayedTransactionsArr} />
    //         </div>
    //     </div>
    // );
    return (
        <div className="transactions-delayed-display">
            <h2>תשלומים בפיגור</h2>

            <div className="selectEdgDate">
                <label htmlFor="requireDate">בחר תקופה להצגת העסקאות:</label>
                <select
                    id="requireDate"
                    value={requireDate}
                    onChange={(e) => setRequireDate(Number(e.target.value))}
                    className="select-dropdown"
                >
                    <option value={1}>חודש אחורה</option>
                    <option value={3}>שלושה חודשים אחורה</option>
                    <option value={12}>שנה אחורה</option>
                    <option value={0}>הכול</option>
                </select>
            </div>

            <table className="transaction-table">
                <thead>
                    <tr>
                        <th>שירות</th>
                        <th>מחיר</th>
                        <th>סטטוס</th>
                        <th>לקוח</th>
                        <th>התראות</th>
                        <th>פעולות</th>
                    </tr>
                </thead>
                <tbody>
                    {delayedTransactionsArr.map((transaction) => (
                        <TransactionItem
                            key={transaction._id}
                            transaction={transaction}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );

};

export default DelayedTransactions;
