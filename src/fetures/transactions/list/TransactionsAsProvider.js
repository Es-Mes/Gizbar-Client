import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Chart, registerables } from 'chart.js'; // ייבוא Chart.js
import useAuth from '../../../hooks/useAuth';
import TransactionsList from './TransactionsList';
import { GrFormNextLink } from "react-icons/gr";
import './TransactionsAsProvider.css'
import { useGetAllTransactionsQuery } from '../TransactionsApiSlice';
import AddTransaction from '../add/AddTransaction';
import Modal from '../../../modals/Modal';

Chart.register(...registerables); // הרשמת כל האפשרויות של Chart.js

const TransactionsAsProvider = () => {
    const { phone } = useAuth()
    const { data: transactionsAsProvider = [], isLoading: isLoading, error: error, refetch: refetchTransactions } = useGetAllTransactionsQuery({ phone });
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear()); // ניהול השנה הנוכחית ב-state
    const chartRef = useRef(null); // רפרנס לגרף
    const navigate = useNavigate();


    const [searchParams] = useSearchParams();
    const filterBy = searchParams.get("filter");
    const customerId = searchParams.get("customer");
    const customerName = searchParams.get("q");

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

    const filteredTransactions = useMemo(() => {
        if (!transactionsAsProvider || transactionsAsProvider.length === 0) return [];

        let filtered = transactionsAsProvider.filter(t => t.status !== "canceled");

        // סינון לפי לקוח ספציפי (לפי ID)
        if (customerId) {
            filtered = filtered.filter(t => t.customer?._id === customerId);
        }

        // סינון לפי שם לקוח (חיפוש טקסט)
        if (customerName && !customerId) {
            filtered = filtered.filter(t =>
                t.customer?.full_name?.toLowerCase().includes(customerName.toLowerCase())
            );
        }

        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

        // חישוב נתונים עבור כותרת מפורטת
        const totalTransactions = filtered.length;
        const delayedTransactions = filtered.filter(t => t.status === "notPaid");
        const delayedCount = delayedTransactions.length;
        const delayedAmount = delayedTransactions.reduce((sum, t) => sum + (t.price || 0), 0);
        const totalCollected = filtered.reduce((sum, t) => sum + (t.status === "paid" ? (t.price || 0) : 0), 0);

        // קביעת כותרת וסינון נוסף לפי סוג
        if (filterBy === "recentMonth") {
            const monthName = today.getMonth() + 1;
            if (customerId || customerName) {
                const customerDisplayName = customerName || filtered[0]?.customer?.full_name || "לקוח";
                setHeader(`${customerDisplayName} - חודש ${monthName}\n${totalTransactions} עסקאות | ${delayedCount} בפיגור (₪${delayedAmount.toLocaleString()}) | נגבה: ₪${totalCollected.toLocaleString()}`);
            } else {
                setHeader(`עסקאות מהחודש הנוכחי - ${monthName}`);
            }
            filtered = filtered.filter(transaction => {
                const billingDate = new Date(transaction.billingDay);
                return billingDate >= startOfMonth && billingDate < startOfNextMonth;
            });
        } else if (filterBy === "delayed") {
            if (customerId || customerName) {
                const customerDisplayName = customerName || filtered[0]?.customer?.full_name || "לקוח";
                setHeader(`${customerDisplayName} - עסקאות בפיגור\n${delayedCount} עסקאות (₪${delayedAmount.toLocaleString()})`);
            } else {
                setHeader("עסקאות בפיגור");
            }
            filtered = filtered.filter(t => t.status === "notPaid");
        } else {
            // ללא פילטר זמן מיוחד
            if (customerId || customerName) {
                const customerDisplayName = customerName || filtered[0]?.customer?.full_name || "לקוח";
                setHeader(`עסקאות ${customerDisplayName}\n${totalTransactions} עסקאות | ${delayedCount} בפיגור (₪${delayedAmount.toLocaleString()}) | נגבה: ₪${totalCollected.toLocaleString()}`);
            } else {
                setHeader("כל העסקאות");
            }
        }

        return filtered;
    }, [transactionsAsProvider, filterBy, customerId, customerName]);



    if (isLoading) return <p>בטעינה...</p>;
    if (error) return <p>Error: {error?.data?.message}</p>;
    return (
        <div className='transactions_first_page'>
            <div className="transactions-display">
                <div className="header-with-button">
                    <button className="backButton" onClick={() => {
                        if (customerId || customerName) {
                            navigate('/dash/customers');
                        } else {
                            navigate(-1);
                        }
                    }}>
                        <GrFormNextLink className='GrFormNextLink' />
                        <p className='backText'>
                            {(customerId || customerName) ? 'חזור לרשימת לקוחות' : 'חזור'}
                        </p>
                    </button>
                    <h2 style={{
                        fontSize: (customerId || customerName) ? 'clamp(1rem, 2.5vw, 1.3rem)' : '1.5rem',
                        lineHeight: '1.4',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-line',
                        margin: '8px 0',
                        color: '#333'
                    }}>{header}</h2><button className='newTransactionBtn' onClick={() => { setIsTransactionModalOpen(true) }}>
                        עסקה חדשה <div className="rotating-coin small"><img src='/icons8-money-bag-bitcoin-50.png' /></div>

                    </button>
                </div>

                <TransactionsList transactions={filteredTransactions} />
            </div>
            <Modal isOpen={isTransactionModalOpen}
                onClose={() => setIsTransactionModalOpen(false)}
                disableOverlayClick={true}
            >
                <AddTransaction
                    onSuccess={() => {
                        // רענון הנתונים אחרי הוספת עסקה (במיוחד לעסקאות חודשיות שנוצרות בשרת)
                        setTimeout(() => {
                            setIsTransactionModalOpen(false);
                            // רענון מפורש של רשימת העסקאות כדי לקבל עסקאות שנוספו בשרת
                            refetchTransactions();
                        }, 3000); // מחכים 3 שניות כדי לאפשר לשרת לעבד את ה-callback
                    }}
                />
            </Modal>
        </div>
    )
}

export default TransactionsAsProvider
