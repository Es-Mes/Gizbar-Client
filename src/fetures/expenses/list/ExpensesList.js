import '../../transactions/list/TransactionList.css';
import React, { useState } from "react";
import ExpensesItem from '../view/ExpensesItem';

const ExpensesList = ({ transactions }) => {
    const [transactionsList, setTransactionsList] = useState(transactions);

    const handleUpdateTransaction = (updatedTransaction) => {
        setTransactionsList(
            transactionsList.map((t) =>
                t._id === updatedTransaction._id ? updatedTransaction : t
            )
        );
    };

    return (
        <table className="transaction-table">
            <thead>
                <tr>             
                    <th>סוג השירות</th>
                    <th>על ידי</th>
                    <th>בתאריך</th>
                    <th>תאריך תשלום</th>
                    <th>מחיר</th>
                    <th>סטטוס</th>   
                </tr>
            </thead>
            <tbody>
                {transactionsList.map((transaction) => (
                    <ExpensesItem
                        key={transaction._id}
                        transaction={transaction}
                    />
                ))}
            </tbody>
        </table>
    );
};

export default ExpensesList;
