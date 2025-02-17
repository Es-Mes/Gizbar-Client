// import React, { useState } from 'react';
// import TransactionItem from '../view/TransactionItem';

// const TransactionsList = ({ transactions }) => {
//     // const [expandedTransactionId, setExpandedTransactionId] = useState(null);

//     // const toggleExpand = (id) => {
//     //     setExpandedTransactionId((prevId) => (prevId === id ? null : id));
//     // };

//     if (transactions == []) {
//         return <p> אין עסקאות העונות על התנאים</p>
//     }

//     return (
//         <div>
//             {transactions.map((transaction) => (
//                 <TransactionItem
//                     key={transaction._id}
//                     transaction={transaction}
//                 // isExpanded={transaction._id === expandedTransactionId}
//                 // onToggleExpand={() => toggleExpand(transaction._id)}
//                 />
//             ))}
//         </div>
//     );
// };

// export default TransactionsList;
import './TransactionList.css';
import React, { useState } from "react";
import TransactionItem from '../view/TransactionItem';

const TransactionsList = ({ transactions }) => {
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
                    <th>שירות</th>
                    <th>מחיר</th>
                    <th>סטטוס</th>
                    <th>לקוח</th>
                    <th>תאריך</th>
                    <th>תאריך תשלום</th>
                    <th>התראות</th>
                    <th>פעולות</th>
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
