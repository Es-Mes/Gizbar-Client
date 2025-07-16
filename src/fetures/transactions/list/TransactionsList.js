import './TransactionList.css';
import React, { useMemo, useState } from "react";
import TransactionItem from '../view/TransactionItem';
import { MdOutlineRefresh } from "react-icons/md";
import { TextField, Button, Box } from '@mui/material';
import { IoSearch } from "react-icons/io5";

const TransactionsList = ({ transactions }) => {

    const [showFilters, setShowFilters] = useState(false);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [customerNameFilter, setCustomerNameFilter] = useState('');
    const [serviceFilter, setServiceFilter] = useState('');
    const [transactionFromDateFilter, setTransactionFromDateFilter] = useState('');
    const [transactionToDateFilter, setTransactionToDateFilter] = useState('');

    const isValid = transactions && Array.isArray(transactions);
    const isEmpty = isValid && transactions.length === 0;
    const isIncome = isValid && (transactions[0]?.agent?.phone ? false : true);

    const isFilterActive = Boolean(
        customerNameFilter.trim() ||
        serviceFilter.trim() ||
        fromDate ||
        toDate ||
        transactionFromDateFilter ||
        transactionToDateFilter
    );

    const filteredTransactions = useMemo(() => {
        if (!isValid) return [];

        return transactions.filter((transaction) => {
            const customerName = isIncome
                ? transaction.customer?.full_name || ''
                : transaction.agent?.first_name || '';

            const billingDate = new Date(transaction.billingDay);
            const createdDate = new Date(transaction.createdAt);

            const billingFrom = fromDate ? new Date(fromDate) : null;
            const billingTo = toDate ? new Date(toDate) : null;

            const createdFrom = transactionFromDateFilter ? new Date(transactionFromDateFilter) : null;
            const createdTo = transactionToDateFilter ? new Date(transactionToDateFilter) : null;

            let isMatch = true;

            // שם לקוח
            if (customerNameFilter.trim() !== '') {
                isMatch = isMatch &&
                    customerName.toLowerCase().includes(customerNameFilter.toLowerCase());
            }

            // טווח לפי billingDay
            if (billingFrom) isMatch = isMatch && billingDate >= billingFrom;
            if (billingTo) isMatch = isMatch && billingDate <= billingTo;

            // סוג שירות
            if (serviceFilter.trim() !== '') {
                const service = transaction.serviceType || '';
                isMatch = isMatch &&
                    service.toLowerCase().includes(serviceFilter.toLowerCase());
            }

            // טווח לפי createdAt
            if (createdFrom) isMatch = isMatch && createdDate >= createdFrom;
            if (createdTo) isMatch = isMatch && createdDate <= createdTo;

            return isMatch;
        });
    }, [
        transactions,
        customerNameFilter,
        fromDate,
        toDate,
        isIncome,
        isValid,
        serviceFilter,
        transactionFromDateFilter,
        transactionToDateFilter,
    ]);

    if (!isValid) return null;
    if (isEmpty) return <p>אין עסקאות תואמות</p>;

    // ... המשך הרינדור כמו קודם

    return (
        <>
            <div style={{ display: "flex", flexDirection: "row", gap: "15px", marginRight: "20px", marginBottom: "0" }}>
                <Button
                    sx={{
                        color: "#755dedba",           // צבע הכתב
                        borderColor: "#755dedba",     // צבע המסגרת
                        fontSize: "1rem",
                        gap: "5px",
                        backgroundColor: "#7f6ddc34",         // צבע טקסט בריחוף
                        transition: "all 0.2s ease",

                        '&:active': {
                            backgroundColor: "#765cf831", // צבע רקע בזמן לחיצה
                            transform: "scale(0.98)",   // אפקט לחיצה קל
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                        }
                    }}
                    onClick={() => setShowFilters(!showFilters)} variant="outlined" style={{ marginBottom: "1rem" }}>
                    {showFilters ? " הסתר סינון מתקדם" : " סינון מתקדם"}
                    <IoSearch />
                </Button>
                {isFilterActive && <Button
                    sx={{
                        color: "#755dedba",           // צבע הכתב
                        borderColor: "#755dedba",     // צבע המסגרת
                        fontSize: "1rem",
                        gap: "5px",
                        backgroundColor: "#7f6ddc34",         // צבע טקסט בריחוף
                        transition: "all 0.2s ease",

                        '&:active': {
                            backgroundColor: "#765cf831", // צבע רקע בזמן לחיצה
                            transform: "scale(0.98)",   // אפקט לחיצה קל
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                        }
                    }}
                    onClick={() => {
                        setCustomerNameFilter('');
                        setServiceFilter('');
                        setFromDate('');
                        setToDate('');
                        setTransactionFromDateFilter('');
                        setTransactionToDateFilter('');
                    }}
                    variant="outlined" style={{ marginBottom: "1rem" }}
                >
                    <MdOutlineRefresh />
                    בטל סינון
                </Button>}
            </div>

            {showFilters && (
                <Box style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", gap: "16px", padding: "10px", borderRadius: "8px" }}>

                    <div className="date-range" >
                        <div className="date-box" style={{ gap: "18px" }}>
                            {/* שם לקוח */}
                            <input
                                type="text"
                                placeholder={"סנן לפי שם לקוח"}
                                value={customerNameFilter}
                                onChange={(e) => setCustomerNameFilter(e.target.value)}
                                style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                            />
                            {/* סוג שירות */}
                            <input
                                type="text"
                                placeholder={"סנן לפי סוג שירות"}
                                value={serviceFilter}
                                onChange={(e) => setServiceFilter(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* טווח לפי billingDay */}
                    <div className="date-range">
                        <p style={{ fontSize: "1em", marginBottom: "4px", color: "#555" }}>
                            תאריך תשלום (מתאריך לתאריך):
                        </p>
                        <div className="date-box">
                            <TextField
                                variant="outlined"
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                style={{ marginLeft: "20px" }}
                            />
                            <TextField
                                variant="outlined"
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                            />
                        </div>
                    </div>


                    {/* טווח לפי createdAt */}
                    <div className="date-range">
                        <p style={{ fontSize: "1em", marginBottom: "4px", color: "#555" }}>
                            תאריך ביצוע העסקה (מתאריך לתאריך):
                        </p>
                        <div className="date-box">
                            <TextField
                                variant="outlined"
                                type="date"
                                value={transactionFromDateFilter}
                                onChange={(e) => setTransactionFromDateFilter(e.target.value)}
                                style={{ marginLeft: "20px" }}
                            />
                            <TextField
                                variant="outlined"
                                type="date"
                                value={transactionToDateFilter}
                                onChange={(e) => setTransactionToDateFilter(e.target.value)}
                            />
                        </div>
                    </div>
                </Box>
            )}

            {/* <div className="filters">
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
                     <TextField variant="outlined"
                        type="text"
                        placeholder={"הכנס סוג שירות"}
                        value={serviceFilter}
                        onChange={(e) => setServiceFilter(e.target.value)}
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
                </div> */}


            {/* </div > */}

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
