import React from 'react';
import TransactionItem from '../view/TransactionItem';

const TransactionsList = ({ transactions}) => {
    return (
        <div>
            {transactions.map(transaction => (
                <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
        </div>
    );
};

export default TransactionsList;
