import React, { useState } from 'react';
import ExpensesItem from '../view/ExpensesItem';

const ExpensesList = ({ transactions }) => {

    if (transactions == []) {
        return <> אין עסקאות העונות על התנאים</>
    }

    return (
        <div>
            {transactions.map((transaction) => (
                <ExpensesItem
                    key={transaction._id}
                    transaction={transaction}
                />
            ))}
        </div>
    );
};

export default ExpensesList;
