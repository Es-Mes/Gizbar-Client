import './TransactionList.css';
import React, { useState } from "react";
import TransactionItem from '../view/TransactionItem';
import { MdOutlineRefresh } from "react-icons/md";


const TransactionsList = ({ transactions }) => {
    // console.log(`transactions: ${transactions}`);
    const [transactionsList, setTransactionsList] = useState(transactions);
    const [customerNameFilter, setCustomerNameFilter] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    //בדיקה האם  זו רשימת הכנסות או הוצאות
    const isIncome = transactions[0].agent.first_name? false : true;

    const handleUpdateTransaction = (updatedTransaction) => {
        setTransactionsList(
            transactionsList.map((t) =>
                t._id === updatedTransaction._id ? updatedTransaction : t
            )
        );
    };

    const filteredTransactions = transactionsList.filter((transaction) => {
        const customerName = isIncome? transaction.customer?.full_name || '' :transaction.agent.first_name;
        const billingDate = new Date(transaction.billingDay);

        const from = fromDate ? new Date(fromDate) : null;
        const to = toDate ? new Date(toDate) : null;

        const isCustomerFilterActive = customerNameFilter.trim() !== '';
        const isDateFilterActive = from;

        // אם אין סינון בכלל – החזר הכל
        if (!isCustomerFilterActive && !isDateFilterActive) {
            return true;
        }

        // התחלה עם true – נצמצם לפי הצורך
        let isMatch = true;

        if (isCustomerFilterActive) {
            isMatch = isMatch && customerName.toLowerCase().includes(customerNameFilter.toLowerCase());
        }

        if (from) {
            isMatch = isMatch && billingDate >= from;
        }

        if (to) {
            isMatch = isMatch && billingDate <= to;
        }

        return isMatch;
    });


    if (transactions.length === 0) {
        return <p>אין עסקאות תואמות</p>;
    }
    return (<>
        <div className="filters">
            <div className='customer-filter'>
                {isIncome && <p style={{ fontSize: "1em", marginBottom: "4px", color: "#555" }}>
                    שם לקוח:
                </p>}
                {isIncome && <input
                    type="text"
                    placeholder="הכנס שם לקוח"
                    value={customerNameFilter}
                    onChange={(e) => setCustomerNameFilter(e.target.value)}
                />}
                {!isIncome && <p style={{ fontSize: "1em", marginBottom: "4px", color: "#555" }}>
                נותן השירות:
                </p>}
                {!isIncome && <input
                    type="text"
                    placeholder="הכנס שם נותן שירות"
                    value={customerNameFilter}
                    onChange={(e) => setCustomerNameFilter(e.target.value)}
                />}
            </div>
            <div className="date-range">
                
                <p style={{ fontSize: "1em", marginBottom: "4px", color: "#555" }}>
                    עסקאות מתאריך ועד תאריך:
                </p>
                <div className='date-box'>
                <input style={{marginLeft:"20px"}}
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                />
                <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                /></div>
            </div>
            <button className='refreshFilterButton icon-tooltip' activClassName="active"
                type="button"
                onClick={() => {
                    setCustomerNameFilter('');
                    setFromDate('');
                    setToDate('');
                }}
                style={{ fontSize: '25px' }}
            >
            <MdOutlineRefresh/><p className='tooltip-text'>בטל סינון</p>
            </button>
        </div>

        <table className="transaction-table">
            <thead>
                <tr>
                    <th>שירות</th>
                    <th>מחיר</th>
                    <th>סטטוס</th>
                    {isIncome && <th>לקוח</th>}
                    {!isIncome && <th>נותן השירות</th>}
                    <th>תאריך העסקה</th>
                    <th>תאריך תשלום</th>
                    <th>התראות</th>
                    <th>פעולות מהירות</th>
                </tr>
            </thead>
            <tbody>
                {filteredTransactions.map((transaction) => (
                    <TransactionItem
                        key={transaction._id}
                        transaction={transaction}
                        onUpdate={handleUpdateTransaction}
                    />
                ))}
            </tbody>
        </table>
    </>
    );
};

export default TransactionsList;
