import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useSearchParams, useNavigate } from "react-router-dom";
import { Chart, registerables } from 'chart.js'; // ייבוא Chart.js
import useAuth from '../../../hooks/useAuth';
import TransactionsList from './TransactionsList';
import { GrFormNextLink } from "react-icons/gr";
import './TransactionsAsProvider.css'
import { useGetAllTransactionsAsCustomerQuery } from '../TransactionsApiSlice';

const TransactionsAsCustomer = () => {
    const { phone } = useAuth();
    const { data: transactionsAsCustomer = [], isLoading: isLoading, error: error } = useGetAllTransactionsAsCustomerQuery({ phone })
    console.log(transactionsAsCustomer);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const filterBy = searchParams.get("filter");

    const [header, setHeader] = useState("כל העסקאות")

    /*/////סינון לפי סוג עסקה FilterBy*/////

    const filteredTransactions = useMemo(() => {
        if (!transactionsAsCustomer || transactionsAsCustomer.length === 0) return [];

        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

        if (filterBy === "recentMonth") {
            setHeader(`עסקאות מהחודש הנוכחי - ${today.getMonth() + 1}`);
            return transactionsAsCustomer.filter(transaction => {
                const billingDate = new Date(transaction.billingDay);
                return billingDate >= startOfMonth && billingDate < startOfNextMonth && transaction.status != "canceled";
            });
        }

        if (filterBy === "delayed") {
            setHeader("עסקאות בפיגור");
            return transactionsAsCustomer.filter(t => t.status === "notPaid" && t.status !== "canceled");
        }

        setHeader("כל העסקאות");
        return transactionsAsCustomer.filter(t => t.status !== "canceled");
    }, [transactionsAsCustomer, filterBy]);


    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>שגיאה: {error.data?.message || "אירעה שגיאה"}</p>;
    return (
        <div className='transactions_first_page'>
            <div className='transactions-display'>
            <div className="header-with-button">
                <button className="backButton" onClick={() => navigate(-1)}>
                    <GrFormNextLink className='GrFormNextLink' /><p className='backText'>חזור</p>
                </button>
                <h2>{header}</h2>
            </div>
            <TransactionsList transactions={filteredTransactions} />
        </div>
        </div>
    )
}

export default TransactionsAsCustomer
