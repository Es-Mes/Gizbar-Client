import './TransactionList.css';
import React, { useState } from "react";
import TransactionItem from '../view/TransactionItem';

const TransactionsList = ({ transactions }) => {
// console.log(`transactions: ${transactions}`);
    const [transactionsList, setTransactionsList] = useState(transactions);

    const handleUpdateTransaction = (updatedTransaction) => {
        setTransactionsList(
            transactionsList.map((t) =>
                t._id === updatedTransaction._id ? updatedTransaction : t
            )
        );
    };
    if (transactions.length === 0) {
        return <p>אין עסקאות תואמות</p>;
    }    
    return (
        <table className="transaction-table">
            <thead>
                <tr>
                    <th>שירות</th>
                    <th>מחיר</th>
                    <th>סטטוס</th>
                    <th>לקוח</th>
                    <th>תאריך העסקה</th>
                    <th>תאריך תשלום</th>
                    <th>התראות</th>
                    <th>פעולות מהירות</th>
                </tr>
            </thead>
            <tbody>
                {transactionsList.map((transaction) => (
                    <TransactionItem
                        key={transaction._id}
                        transaction={transaction}
                        onUpdate={handleUpdateTransaction}
                    />
                ))}
            </tbody>
        </table>
    );
};

export default TransactionsList;
