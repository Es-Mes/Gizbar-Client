import React, { useState } from 'react';
import TransactionItem from '../view/TransactionItem';

const TransactionsList = ({ transactions }) => {
    // const [expandedTransactionId, setExpandedTransactionId] = useState(null);

    // const toggleExpand = (id) => {
    //     setExpandedTransactionId((prevId) => (prevId === id ? null : id));
    // };

    if (transactions == []) {
        return <p> אין עסקאות העונות על התנאים</p>
    }

    return (
        <div>
            {transactions.map((transaction) => (
                <TransactionItem
                    key={transaction._id}
                    transaction={transaction}
                // isExpanded={transaction._id === expandedTransactionId}
                // onToggleExpand={() => toggleExpand(transaction._id)}
                />
            ))}
        </div>
    );
};

export default TransactionsList;
