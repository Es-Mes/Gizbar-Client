import './TransactionList.css';
import React, { useMemo, useState } from "react";
import TransactionItem from '../view/TransactionItem';
import { MdOutlineRefresh } from "react-icons/md";
import { TextField } from '@mui/material';

const TransactionsList = ({ transactions }) => {
    const [customerNameFilter, setCustomerNameFilter] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const isValid = transactions && Array.isArray(transactions);
    const isEmpty = isValid && transactions.length === 0;
    const isIncome = isValid && (transactions[0]?.agent?.phone ? false : true);

    const filteredTransactions = useMemo(() => {
        if (!isValid) return [];

        return transactions.filter((transaction) => {
            const customerName = isIncome
                ? transaction.customer?.full_name || ''
                : transaction.agent?.first_name || '';
            const billingDate = new Date(transaction.billingDay);

            const from = fromDate ? new Date(fromDate) : null;
            const to = toDate ? new Date(toDate) : null;

            let isMatch = true;

            if (customerNameFilter.trim() !== '') {
                isMatch = isMatch &&
                    customerName.toLowerCase().includes(customerNameFilter.toLowerCase());
            }

            if (from) isMatch = isMatch && billingDate >= from;
            if (to) isMatch = isMatch && billingDate <= to;

            return isMatch;
        });
    }, [transactions, customerNameFilter, fromDate, toDate, isIncome, isValid]);

    if (!isValid) return null;
    if (isEmpty) return <p>אין עסקאות תואמות</p>;

    // ... המשך הרינדור כמו קודם

    return (
        <>
            <div className="filters">
                <div className='customer-filter'>
                    <p style={{ fontSize: "1em", marginBottom: "4px", color: "#555" }}>
                        {isIncome ? "סנן לפי שם לקוח:" : "סנן לפי נותן השירות:"}
                    </p>
                    <TextField variant="outlined"
                        type="text"
                        placeholder={isIncome ? "הכנס שם לקוח" : "הכנס שם נותן שירות"}
                        value={customerNameFilter}
                        onChange={(e) => setCustomerNameFilter(e.target.value)}
                    />
                </div>

                <div className="date-range">
                    <p style={{ fontSize: "1em", marginBottom: "4px", color: "#555" }}>
                        עסקאות מתאריך ועד תאריך:
                    </p>
                    <div className='date-box'>
                        <TextField variant="outlined"
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            style={{ marginLeft: "20px" }}
                        />
                        <TextField variant="outlined"
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    className='refreshFilterButton icon-tooltip'
                    type="button"
                    onClick={() => {
                        setCustomerNameFilter('');
                        setFromDate('');
                        setToDate('');
                    }}
                    style={{ fontSize: '25px' }}
                >
                    <MdOutlineRefresh />
                    <p className='tooltip-text'>בטל סינון</p>
                </button>
            </div>

            <table className="transaction-table">
                <thead>
                    <tr>
                        {isIncome ? <th>לקוח</th> : <th>נותן השירות</th>}
                        <th>סכום</th>
                        <th>תאריך העסקה</th>
                        <th>שירות</th>
                        <th>תאריך תשלום</th>
                        <th>סטטוס</th>
                        <th>התראות</th>
                        <th>פעולות מהירות</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTransactions.map((transaction) => (
                        <TransactionItem
                            key={transaction._id}
                            transaction={transaction}
                        // אם בעתיד תצטרכי פעולה – אפשר להוסיף פה callback
                        />
                    ))}
                </tbody>
            </table>
        </>
    );
};

export default TransactionsList;
