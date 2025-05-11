import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Chart, registerables } from 'chart.js'; // ייבוא Chart.js
import useAuth from '../../../hooks/useAuth';
import TransactionsList from './TransactionsList';
import './TransactionsAsProvider.css'

Chart.register(...registerables); // הרשמת כל האפשרויות של Chart.js

const TransactionsAsProvider = () => {
    const { _id, phone } = useAuth()
    const transactions = useSelector((state) => state.transactions.transactions || []);
    const isLoading = useSelector((state) => state.transactions?.isLoading);
    const error = useSelector((state) => state.transactions?.error);
    const transactionsAsProvider = useMemo(() => {
        return [...transactions].filter(t => t.agent === _id);
      }, [transactions, _id]);
      
    const [isRecentTransactionsSlice, setIsRecentTransactionsSlice] = useState(true)
    const [isLastTransactionsSlice, setIsLastTransactionsSlice] = useState(true)
    const [isPendingTransactionsSlice, setIsPendingTransactionsSlice] = useState(true)
    const [transactionsToDisplay, setTransactionsToDisplay] = useState(transactionsAsProvider)
    const [isReady, setIsReady] = useState(false);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear()); // ניהול השנה הנוכחית ב-state
    const chartRef = useRef(null); // רפרנס לגרף
    const navigate = useNavigate();


    const [searchParams] = useSearchParams();
    const filterBy = searchParams.get("filter");

    const [header, setHeader] = useState("כל העסקאות")

    /*/////איסוף נתונים עבור הגרף*/////
    //הכנסה לפי חודש
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

    //ממוצע שנתי
    const calculateAverageIncome = (monthlyIncome) => {
        const totalIncome = monthlyIncome.reduce((sum, income) => sum + income, 0);
        const monthsWithIncome = monthlyIncome.filter(income => income > 0).length;
        return monthsWithIncome > 0 ? (totalIncome / monthsWithIncome).toFixed(2) : 0;
    };

    const monthlyIncome = getMonthlyIncome(transactionsAsProvider, currentYear);
    // console.log(monthlyIncome);
    const averageIncome = calculateAverageIncome(monthlyIncome);


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
                    datalabels: {
                        display: false // מסיר לגמרי את המספרים מהגרף
                    }
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

    //עסקאות אחרונות שבוצעו
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
    const recentTransactionsSlice = recentTransactions.slice(0, 5);

    //הכנסות אחרונות
    const filterLastTransactions = (transactionsAsProvider) => {
        const today = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 3); // לחשב את התאריך של 3 חודשים אחורה

        return [...transactionsAsProvider]
            .filter(transaction =>
                transaction.status === "paid" && // רק עסקאות שלא בוטלו
                new Date(transaction.billingDay) >= threeMonthsAgo  // רק עסקאות מעודכנות ב-3 חודשים האחרונים

            )
            .sort((a, b) => new Date(b.billingDay) - new Date(a.billingDay)) // מיון לפי תאריך העדכון (מהחדש לישן)
            // .slice(0, 10) // להחזיר עד 10 עסקאות
            .map(transaction => ({
                ...transaction, // שומר את שאר המידע של העסקה
                agent: undefined, // מחיקת שדה agent
            }));
    };

    const lastTransactions = filterLastTransactions(transactionsAsProvider) || [];
    const lastTransactionsSlice = lastTransactions.slice(0, 5) || [];
    // console.log(`lastTransactions${lastTransactions}`);


    //תשלומים קרובים
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
    const pendingTransactionsSlice = pendingTransactions.slice(0, 5);

    

    /*/////סינון לפי סוג עסקה FilterBy*/////
   
    useEffect(() => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    
        let filtered = transactionsAsProvider;
    
        if (filterBy === "recentMonth") {
            setHeader(`עסקאות מהחודש הנוכחי - ${today.getMonth() + 1}`);
            filtered = [...transactionsAsProvider].filter(transaction => {
                const billingDate = new Date(transaction.billingDay);
                return billingDate >= startOfMonth && billingDate < startOfNextMonth;
            }).map(t => ({ ...t, agent: undefined }));
        } else if (filterBy === "delayed") {
            setHeader("עסקאות בפיגור");
            filtered = transactionsAsProvider.filter(t => t.status === "notPaid").map(t => ({ ...t, agent: undefined }));
        } else {
            setHeader("כל העסקאות");
        }
    
        setTransactionsToDisplay(filtered);
        setIsReady(true); // רק אחרי העדכון!
    }, [filterBy,transactionsAsProvider]);
    
    
    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!isReady) return <p>טוען עסקאות...</p>
    return (
        <div className='transactions_first_page'>
            {/* גרף ההכנסות */}
            {/* <div className="income-chart-container">
                <div className="chart-header">
                    <button onClick={() => setCurrentYear(currentYear - 1)}>&lt; שנה קודמת</button>
                    <h2>הכנסות לפי חודשים ({currentYear})</h2>
                    <button onClick={() => setCurrentYear(currentYear + 1)}>שנה הבאה &gt;</button>
                </div>
                <canvas id="incomeChart" />
                <p className="average-income">
                    ההכנסה הממוצעת לחודש בשנת {currentYear}: <strong>{averageIncome} ₪</strong>
                </p>
            </div> */}
            <div className="transactions-display">
                {/* <div>
                    <h2>
                        עסקאות אחרונות שבוצעו
                        <span
                            className="toggle-view"
                            onClick={() => setIsRecentTransactionsSlice(!isRecentTransactionsSlice)}
                        >
                            {isRecentTransactionsSlice ? "יותר" : "פחות"}
                        </span>
                    </h2>
                    {
                        isRecentTransactionsSlice ? (
                            <TransactionsList transactions={recentTransactionsSlice} />
                        ) : (
                            <TransactionsList transactions={recentTransactions} />
                        )}
                </div> */}
                
                    <h2>
                        {header}
                    </h2>
                    {
                    <TransactionsList transactions={transactionsToDisplay} />
                        
                    }
                
                {/* <div>
                    <h2>
                        תשלומים קרובים
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
                </div> */}
            </div>
        </div>
    )
}

export default TransactionsAsProvider
