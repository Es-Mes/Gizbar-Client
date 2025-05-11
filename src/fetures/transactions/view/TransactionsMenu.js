import React from 'react'
import { useNavigate } from 'react-router-dom'
import "./TransactionsMenu.css"
import { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom/dist/umd/react-router-dom.development';

Chart.register(...registerables);

const TransactionsMenu = () => {
    const navigate = useNavigate()
    const { type } = useParams(); // "income" או "expense"
    const isIncome = type === 'income';

    const transactions = useSelector((state) => state.transactions.transactions || []);
    //גרף הכנסות
    // components/IncomeChart.jsx
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const chartRef = useRef(null);

    const getMonthlyIncome = (transactions, year) => {
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31);
        const monthlyIncome = Array(12).fill(0);

        transactions.forEach(({ price, billingDay }) => {
            const date = new Date(billingDay);
            if (date >= startOfYear && date <= endOfYear) {
                const monthIndex = date.getMonth();
                monthlyIncome[monthIndex] += price;
            }
        });

        return monthlyIncome;
    };

    const calculateAverageIncome = (monthlyIncome) => {
        const total = monthlyIncome.reduce((sum, income) => sum + income, 0);
        const monthsWithIncome = monthlyIncome.filter(val => val > 0).length;
        return monthsWithIncome > 0 ? (total / monthsWithIncome).toFixed(2) : 0;
    };

    const monthlyIncome = getMonthlyIncome(transactions, currentYear);
    const averageIncome = calculateAverageIncome(monthlyIncome);

    useEffect(() => {
        const canvas = document.getElementById('incomeChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        chartRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"],
                datasets: [{
                    label: `הכנסות (${currentYear})`,
                    data: monthlyIncome,
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true },
                },
                datalabels: { display: false }
            }
        });

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, [monthlyIncome, currentYear]);





    ///פונקציות לניווט לעסקאות
    const handleClickAllIncome = () => {
        navigate("providerList"); // כאן את שמה את הנתיב הרצוי
    };
    const handleClickThisMonthIncome = () => {
        navigate("providerList?filter=recentMonth"); // כאן את שמה את הנתיב הרצוי
    };
    const handleClickDelayedIncome = () => {
        navigate("providerList?filter=delayed"); // כאן את שמה את הנתיב הרצוי
    };

    ///פונקציות לניווט להוצאות
    const handleClickAllExpenses = () => {
        navigate("customerList"); // כאן את שמה את הנתיב הרצוי
    };
    const handleClickThisMonthExpenses = () => {
        navigate("customerList?filter=recentMonth"); // כאן את שמה את הנתיב הרצוי
    };
    const handleClickDelayedExpenses = () => {
        navigate("customerList?filter=delayed"); // כאן את שמה את הנתיב הרצוי
    };

    
        return (< div className='TransactionsMenu'>
            {isIncome && 
            (<div className="income-chart-container">
                <div className="chart-header">
                    <button onClick={() => setCurrentYear(currentYear - 1)}>&lt; שנה קודמת</button>
                    <h3>גרף ההכנסות לשנת {currentYear}</h3>
                    <button onClick={() => setCurrentYear(currentYear + 1)}>שנה הבאה &gt;</button>
                </div>
                <canvas id="incomeChart" />
                <p className="average-income">
                    ההכנסה הממוצעת לחודש בשנת {currentYear}: <strong>{averageIncome} ₪</strong>
                </p>
            </div>
        )}   
           
            {isIncome && (<div><h2>איזה הכנסות תרצה לראות?</h2>
            <div className="income-summary">
                <div className="dashboard-card menu-card" onClick={handleClickAllIncome} style={{ cursor: "pointer" }}>
                    <p style={{
                        color: "var(--text)", fontWeight: "bold"
                    }}>כל ההכנסות</p>
                </div>
                <div className="dashboard-card menu-card" onClick={handleClickThisMonthIncome} style={{ cursor: "pointer" }}>
                    <p style={{ color: "var(--text)", fontWeight: "bold" }}>הכנסות של חודש זה<br /></p>

                </div>
                <div className="dashboard-card menu-card" onClick={handleClickDelayedIncome} style={{ cursor: "pointer" }}>
                    <p style={{ color: "var(--text)", fontWeight: "bold" }}>הכנסות שעומדות בפיגור<br /></p>
                </div>
            </div>
        </div>)}
        {!isIncome && (<div><h2>איזה הוצאות תרצה לראות?</h2>
            <div className="income-summary">
                <div className="dashboard-card menu-card" onClick={handleClickAllExpenses} style={{ cursor: "pointer" }}>
                    <p style={{
                        color: "var(--text)", fontWeight: "bold"
                    }}>כל ההוצאות</p>
                </div>
                <div className="dashboard-card menu-card" onClick={handleClickThisMonthExpenses} style={{ cursor: "pointer" }}>
                    <p style={{ color: "var(--text)", fontWeight: "bold" }}>הוצאות של חודש זה<br /></p>

                </div>
                <div className="dashboard-card menu-card" onClick={handleClickDelayedExpenses} style={{ cursor: "pointer" }}>
                    <p style={{ color: "var(--text)", fontWeight: "bold" }}>הוצאות שעומדות בפיגור<br /></p>
                </div>
            </div>
        </div>)}</div>
        )
}

export default TransactionsMenu
