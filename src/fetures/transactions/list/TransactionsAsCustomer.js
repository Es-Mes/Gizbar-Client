import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useSearchParams, useNavigate } from "react-router-dom";
import { Chart, registerables } from 'chart.js'; // ייבוא Chart.js
import useAuth from '../../../hooks/useAuth';
import TransactionsList from './TransactionsList';
import { GrFormNextLink } from "react-icons/gr";
import './TransactionsAsProvider.css'
import { useGetAllTransactionsAsCustomerQuery } from '../TransactionsApiSlice';

const TransactionsAsCustomer = () => {
    const {phone} = useAuth();    
    const { data: transactionsAsCustomer = [], isLoading: isLoading, error: error } = useGetAllTransactionsAsCustomerQuery({ phone })
    console.log(transactionsAsCustomer);
    const [transactionsToDisplay, setTransactionsToDisplay] = useState(transactionsAsCustomer)
    const [isReady, setIsReady] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const filterBy = searchParams.get("filter");

    const [header, setHeader] = useState("כל העסקאות")


    useEffect(() => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

        let filtered = transactionsAsCustomer;

        if (filterBy === "recentMonth") {
            setHeader(`הוצאות מהחודש הנוכחי - ${today.getMonth() + 1}`);
            filtered = [...transactionsAsCustomer].filter(transaction => {
                const billingDate = new Date(transaction.billingDay);
                return billingDate >= startOfMonth && billingDate < startOfNextMonth;
            });
        } else if (filterBy === "delayed") {
            setHeader("הוצאות בפיגור");
            filtered = transactionsAsCustomer.filter(t => t.status === "notPaid");
        } else {
            setHeader("כל ההוצאות");
        }

        setTransactionsToDisplay(filtered);
        setIsReady(true); // רק אחרי העדכון!
    }, [filterBy, transactionsAsCustomer]);

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>שגיאה: {error.data?.message || "אירעה שגיאה"}</p>;
    if (!isReady) return <p>טוען עסקאות...</p>
    return (
        <div className='transactions_first_page'>
            <div className='transactions-display'></div>
            <div className="header-with-button">
                <button className="backButton" onClick={() => navigate(-1)}>
                    <GrFormNextLink />
                </button>
                <h2>{header}</h2>
            </div>
            <TransactionsList transactions={transactionsToDisplay} />
        </div>
    )
}

export default TransactionsAsCustomer
