import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from "react-redux";
import { Chart, registerables } from 'chart.js'; // ייבוא Chart.js
import useAuth from '../../../hooks/useAuth';
import TransactionsList from './TransactionsList';
import './TransactionsAsProvider.css'

Chart.register(...registerables); // הרשמת כל האפשרויות של Chart.js

const TransactionsAsProvider = () => {
    const { _id, phone } = useAuth()
    const transactions = useSelector((state) => state.transactions.data.transactions.data || []);
    const isLoading = useSelector((state) => state.transactions?.isLoading);
    const error = useSelector((state) => state.transactions?.error);
    const transactionsAsProvider = [...transactions].filter(transaction =>
        transaction.agent == _id
    );

    const [isRecentTransactionsSlice, setIsRecentTransactionsSlice] = useState(true)
    const [isPendingTransactionsSlice, setIsPendingTransactionsSlice] = useState(true)
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear()); // ניהול השנה הנוכחית ב-state
    const chartRef = useRef(null); // רפרנס לגרף

    const getMonthlyIncome = (transactionsAsProvider, year) => {
        const startOfYear = new Date(year, 0, 1); // התחלת השנה
        const endOfYear = new Date(year, 11, 31); // סוף השנה
        const monthlyIncome = Array(12).fill(0); // מאפסים הכנסות לפי חודשים

        transactionsAsProvider.forEach(({ price, billingDay }) => {
            const date = new Date(billingDay);
            if (date >= startOfYear && date <= endOfYear) {
                const monthIndex = date.getMonth(); // חודש העסקה
                monthlyIncome[monthIndex] += price; // הוספת המחיר להכנסה החודשית
            }
        });

        return monthlyIncome;
    };

    const monthlyIncome = getMonthlyIncome(transactionsAsProvider, currentYear);
    console.log(monthlyIncome);

    useEffect(() => {
        const canvas = document.getElementById('incomeChart');
        if (canvas) { // בדיקה אם האלמנט קיים
            const ctx = canvas.getContext('2d');
            // הורס את הגרף הקודם אם הוא קיים
            if (chartRef.current) {
                chartRef.current.destroy();
            }

            chartRef.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: [
                        "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
                        "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
                    ],
                    datasets: [
                        {
                            label: `הכנסות (${currentYear})`,
                            data: monthlyIncome,
                            backgroundColor: 'rgba(75, 192, 192, 0.5)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                        },
                    ],
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                        },
                    },
                },
            });
        }
        return () => {
            // ניקוי הגרף כאשר הקומפוננטה נהרסת
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null; // איפוס הרפרנס
            }
        };
    }, [monthlyIncome, currentYear]); // עדכון הגרף במקרה שהנתונים משתנים

    const filterRecentTransactions = (transactionsAsProvider) => {
        const today = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 3); // לחשב את התאריך של 3 חודשים אחורה

        return [...transactionsAsProvider]
            .filter(transaction =>
                transaction.status !== "canceled" && // רק עסקאות שלא בוטלו
                new Date(transaction.updatedAt) >= threeMonthsAgo // רק עסקאות מעודכנות ב-3 חודשים האחרונים
            )
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) // מיון לפי תאריך העדכון (מהחדש לישן)
            // .slice(0, 10) // להחזיר עד 10 עסקאות
            .map(transaction => ({
                ...transaction, // שומר את שאר המידע של העסקה
                agent: undefined, // מחיקת שדה agent
            }));
    };

    const recentTransactions = filterRecentTransactions(transactionsAsProvider);
    const recentTransactionsSlice = recentTransactions.slice(0, 10);

    const filterPendingTransactions = (transactionsAsProvider) => {
        // קבלת תאריך נוכחי
        const today = new Date();

        return [...transactionsAsProvider]
            .filter(transaction =>
                transaction.status === "pendingCharge" && // רק עסקאות שלא נגבו
                new Date(transaction.billingDay) > today // תאריך גבייה מאוחר מהיום
            )
            .sort((a, b) => new Date(a.collectionDate) - new Date(b.collectionDate)) // למיין לפי תאריך הגבייה (מוקדם לראשון)
    };

    const pendingTransactions = filterPendingTransactions(transactionsAsProvider);
    const pendingTransactionsSlice = pendingTransactions.slice(0, 10);

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    return (
        <div className='transactions_first_page'>
            <div className="transactions-display">
                <div>
                    <h2>
                        עסקאות אחרונות
                        <span
                            className="toggle-view"
                            onClick={() => setIsRecentTransactionsSlice(!isRecentTransactionsSlice)}
                        >
                            {isRecentTransactionsSlice ? "יותר" : "פחות"}
                        </span>
                    </h2>
                    {isRecentTransactionsSlice ? (
                        <TransactionsList transactions={recentTransactionsSlice} />
                    ) : (
                        <TransactionsList transactions={recentTransactions} />
                    )}
                </div>
                <div>
                    <h2>
                        עסקאות קרובות
                        <span
                            className="toggle-view"
                            onClick={() => setIsPendingTransactionsSlice(!isPendingTransactionsSlice)}
                        >
                            {isPendingTransactionsSlice ? "יותר" : "פחות"}
                        </span>
                    </h2>
                    {isPendingTransactionsSlice ? (
                        <TransactionsList transactions={pendingTransactionsSlice} />
                    ) : (
                        <TransactionsList transactions={pendingTransactions} />
                    )}
                </div>
            </div>

            {/* גרף ההכנסות */}
            <div className="income-chart-container">
                <div className="chart-header">
                    <button onClick={() => setCurrentYear(currentYear - 1)}>&lt; שנה קודמת</button>
                    <h2>הכנסות לפי חודשים ({currentYear})</h2>
                    <button onClick={() => setCurrentYear(currentYear + 1)}>שנה הבאה &gt;</button>
                </div>
                <canvas id="incomeChart" />
            </div>
        </div>
    )
}

export default TransactionsAsProvider
