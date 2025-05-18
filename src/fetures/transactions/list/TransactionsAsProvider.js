import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Chart, registerables } from 'chart.js'; // ייבוא Chart.js
import useAuth from '../../../hooks/useAuth';
import TransactionsList from './TransactionsList';
import { GrFormNextLink } from "react-icons/gr";
import './TransactionsAsProvider.css'
import { useGetAllTransactionsQuery } from '../TransactionsApiSlice';

Chart.register(...registerables); // הרשמת כל האפשרויות של Chart.js

const TransactionsAsProvider = () => {
    const { _id, phone } = useAuth()
    const { data: transactionsAsProvider = [], isLoading: isLoading, error: error } = useGetAllTransactionsQuery({ phone });
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




    /*/////סינון לפי סוג עסקה FilterBy*/////

    useEffect(() => {
        if (!transactionsAsProvider || transactionsAsProvider.length === 0) return;
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

        let filtered = transactionsAsProvider;

        if (filterBy === "recentMonth") {
            setHeader(`עסקאות מהחודש הנוכחי - ${today.getMonth() + 1}`);
            filtered = [...transactionsAsProvider].filter(transaction => {
                const billingDate = new Date(transaction.billingDay);
                return billingDate >= startOfMonth && billingDate < startOfNextMonth;
            });
        } else if (filterBy === "delayed") {
            setHeader("עסקאות בפיגור");
            filtered = transactionsAsProvider.filter(t => t.status === "notPaid");
        } else {
            setHeader("כל העסקאות");
        }

        setTransactionsToDisplay(filtered);
        setIsReady(true); // רק אחרי העדכון!
    }, [filterBy, transactionsAsProvider]);


    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!isReady) return <p>טוען עסקאות...</p>
    return (
        <div className='transactions_first_page'>
            <div className="transactions-display">
                <div className="header-with-button">
                    <button className="backButton" onClick={() => navigate(-1)}>
                        <GrFormNextLink />
                    </button>
                    <h2>{header}</h2>
                </div>               
                    <TransactionsList transactions={transactionsToDisplay} />               
            </div>
        </div>
    )
}

export default TransactionsAsProvider
