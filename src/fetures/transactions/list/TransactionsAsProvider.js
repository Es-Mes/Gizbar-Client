import React, { useState } from 'react'
import { useSelector } from "react-redux";
import useAuth from '../../../hooks/useAuth';
import TransactionsList from './TransactionsList';
const TransactionsAsProvider = () => {
    const { _id, phone } = useAuth()
    const transactions = useSelector((state) => state.transactions.data.transactions.data || []);
    const isLoading = useSelector((state) => state.transactions?.isLoading);
    const error = useSelector((state) => state.transactions?.error);
    const transactionsAsProvider = [...transactions].filter(transaction =>
        transaction.agent == _id
    );

    const [isRecentTransactionsSlice,setIsRecentTransactionsSlice] = useState(true)
    const [isPendingTransactionsSlice,setIsPendingTransactionsSlice] = useState(true)

    const filterRecentTransactions = (transactionsAsProvider) => {
        const today = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 3); // לחשב את התאריך של 3 חודשים אחורה
    
        return [...transactionsAsProvider]
            .filter(transaction => 
                transaction.status !== "canceled" && // רק עסקאות שלא בוטלו
                new Date(transaction.updatedAt) >= threeMonthsAgo // רק עסקאות מעודכנות ב-3 חודשים האחרונים
            )
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) // מיון לפי תאריך העדכון (מהחדש לישן)
            // .slice(0, 10) // להחזיר עד 10 עסקאות
            .map(transaction => ({
                ...transaction, // שומר את שאר המידע של העסקה
                agent: undefined, // מחיקת שדה agent
            }));
    };
    
    const recentTransactions = filterRecentTransactions(transactionsAsProvider);
    const recentTransactionsSlice = recentTransactions.slice(0,10);

    const filterPendingTransactions = (transactionsAsProvider) => {
        // קבלת תאריך נוכחי
        const today = new Date();

        return [...transactionsAsProvider]
            .filter(transaction =>
                transaction.status === "pendingCharge" && // רק עסקאות שלא נגבו
                new Date(transaction.billingDay) > today // תאריך גבייה מאוחר מהיום
            )
            .sort((a, b) => new Date(a.collectionDate) - new Date(b.collectionDate)) // למיין לפי תאריך הגבייה (מוקדם לראשון)
    };

    const pendingTransactions = filterPendingTransactions(transactionsAsProvider);
    const pendingTransactionsSlice = pendingTransactions.slice(0,10);

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    return (
        <div>
            <div className="transactions-display">
            <div>
               <h2>עסקאות אחרונות</h2>
               {isRecentTransactionsSlice ? <TransactionsList transactions={recentTransactionsSlice} />
               : <TransactionsList transactions={recentTransactions} />}
            </div>
            <div>
               <h2>עסקאות קרובות</h2>
               {isPendingTransactionsSlice ? <TransactionsList transactions={pendingTransactionsSlice} />
               :<TransactionsList transactions={pendingTransactions} />}
            </div>
         </div>
        </div>
    )
}

export default TransactionsAsProvider
