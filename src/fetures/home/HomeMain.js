import { Link, NavLink } from "react-router-dom"
import { Line, Pie } from "react-chartjs-2";
import "chart.js/auto";
import Chart from "chart.js/auto";
import ChartDataLabels from 'chartjs-plugin-datalabels';

import "./HomeMain.css"
import React, { useState, useEffect, useRef } from 'react'
import { useAddUserMutation } from "../users/UsersApiSlice";
import { useGetUserQuery } from "../users/UsersApiSlice";
import useAuth from "../../hooks/useAuth";
import useTransactionsData from "../../hooks/useTransactionsData";
import { useSelector } from "react-redux";
import TransactionsList from "../transactions/list/TransactionsList";
import { useMemo } from "react";
import AddTransaction from "../transactions/add/AddTransaction";
import Modal from "../../modals/Modal";
import ExpensesList from "../expenses/list/ExpensesList";
const HomeMain = () => {
   const { _id, phone } = useAuth()
   const agent = useSelector((state) => state.agent.agent || {});
   const transactions = useSelector((state) => state.transactions.transactions || []);
   const transactionsAsCustomer = useSelector((state) => state.customerTransactions.transactions || []);
   const isLoading = useSelector((state) => state.agent?.isLoading);
   const error = useSelector((state) => state.agent?.error);
   const isLoadingTransactions = useSelector((state) => state.transactions?.isLoading);
   const errorLoadingTransactions = useSelector((state) => state.transactions?.error);
   const chartRef = useRef(null);
   const expenseChartRef = useRef(null);

   Chart.register(ChartDataLabels);

   //משתנים לייבוא הצבעים לגרפים
   const cssVars = getComputedStyle(document.documentElement);
   const bgClear = cssVars.getPropertyValue('--bgClear').trim();
   const bgSoftLight = cssVars.getPropertyValue('--bgSoftLight').trim();
   const text = cssVars.getPropertyValue('--text').trim();


   // console.log('agent ', agent);

   //הכנסות בחודש הנוכחי 
   const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);
   const [monthIncome, setMonthIncome] = useState(0);
   const [monthOutcome, setMonthOutcome] = useState(0);

   // const [monthExpectedIncome, setMonthExpectedIncome] = useState(0);
   const [servicesCount, setServicesCount] = useState(0);
   const [customersCount, setCustomersCount] = useState(0);
   const [totalIncome, setTotalIncome] = useState(0);
   const [totalExpectedIncome, setTotalExpectedIncome] = useState(0);
   const [delayedTransactionsCount, setDelayedTransactionsCount] = useState(0);
   const [delayedTransactionsIncome, setDelayedTransactionsIncome] = useState(0);
   const [currentMonth, setCurrentMonth] = useState('');
   const [selectedOption, setSelectedOption] = useState("agent")

   //הוצאות בחודש הנוכחי
   const [totalOutcome, setTotalOutcome] = useState(0);
   const [totalExpectedOutcome, setTotalExpectedOutcome] = useState(0);
   const [delayedTransactionsOutcome, setDelayedTransactionsOutcome] = useState(0);

   const transactionsAsProvider = useMemo(() => [...transactions].reverse(), [transactions]);

   const transactionsToDisplay = (selectedOption === "agent") ? [...transactions].slice().reverse() : [...transactionsAsCustomer].slice().reverse()


   useEffect(() => {
      const today = new Date();
      const firstDayInThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthName = today.toLocaleString('default', { month: 'long' });
      setCurrentMonth(monthName);

      // console.log(`firstDayInThisMonth: ${firstDayInThisMonth}`);
      // עסקאות סך הכל לחודש זה כולל עתידיות ושלא נגבו
      const thisMonthTransactions = transactionsAsProvider.filter((transaction) => {
         const billingDate = new Date(transaction.billingDay);
         const paymentDate = new Date(transaction.paymentDate);
         return billingDate >= firstDayInThisMonth;
      });


      //////חישוב עסקאות עד כה (לא כולל היום) בחודש זה
      const thisMonthTransactionsAsProvider = transactionsAsProvider
         .filter(transaction => {
            const paymentDate = new Date(transaction.paymentDate);
            return transaction.status === "paid" &&
               paymentDate >= firstDayInThisMonth &&
               paymentDate < today;
         });
      // console.log(`thisMonthTransactionsAsProvider${thisMonthTransactionsAsProvider}`);

      // חישוב סך ההכנסות עד כה החודש

      //////חישוב הכנסות עתידיות לחודש זה
      const thisMonthExpectedTransactionsAsProvider = transactionsAsProvider
         .filter(transaction => {
            const billingDate = new Date(transaction.billingDay);
            return transaction.status === "pendingCharge" &&
               billingDate.getMonth() === firstDayInThisMonth.getMonth() &&
               billingDate >= today;
         });
      // console.log(`thisMonthExpectedTransactionsAsProvider${thisMonthExpectedTransactionsAsProvider}`);


      const filterDelayedTransactions = (transactions) => {
         const today = new Date();
         const requireDateAgo = new Date();

         requireDateAgo.setMonth(today.getMonth() - 1);
         return [...transactions]
            .filter(
               (transaction) =>
                  transaction.status === "notPaid" && // רק עסקאות שלא שולמו
                  new Date(transaction.billingDay) >= requireDateAgo // עסקאות מהתקופה שנבחרה
            )
            .sort((a, b) => new Date(b.billingDay) - new Date(a.billingDay)) // מיון לפי תאריך
            .map((transaction) => ({
               ...transaction,
               agent: undefined, // מחיקת שדה agent
            }));
      };
      const delayedTransactions = filterDelayedTransactions(thisMonthTransactions)
      setDelayedTransactionsCount(delayedTransactions.length)
      
      const paid = thisMonthTransactionsAsProvider.reduce((acc, transaction) => acc + transaction.price, 0);
      const expected = thisMonthExpectedTransactionsAsProvider.reduce((acc, transaction) => acc + transaction.price, 0);
      const delayed = delayedTransactions.filter(t => t.status === "notPaid").reduce((acc, t) => acc + t.price, 0);

      setTotalIncome(paid);
      setTotalExpectedIncome(expected);
      setDelayedTransactionsIncome(delayed);
      setMonthIncome(paid + expected + delayed); // <-- זה הפתרון

      //עדכון מספר הלקוחות והשירותים לחודש זה
      setServicesCount(thisMonthTransactions.length);
      setCustomersCount(new Set(thisMonthTransactions.map((t) => t.customerId)).size);



      // === חישוב הוצאות חודש נוכחי ===

      // הוצאות ששולמו עד היום
      const thisMonthPaidExpenses = transactionsAsCustomer.filter((transaction) => {
         const paymentDate = new Date(transaction.paymentDate);
         return transaction.status === "paid" &&
            paymentDate >= firstDayInThisMonth &&
            paymentDate < today;
      });

      // הוצאות עתידיות
      const thisMonthExpectedExpenses = transactionsAsCustomer.filter((transaction) => {
         const billingDate = new Date(transaction.billingDay);
         return transaction.status === "pendingCharge" &&
            billingDate.getMonth() === firstDayInThisMonth.getMonth() &&
            billingDate >= today;
      });

      // הוצאות בפיגור
      const delayedExpenses = transactionsAsCustomer.filter((transaction) => {
         const billingDate = new Date(transaction.billingDay);
         return transaction.status === "notPaid" && billingDate < today;
      });

      const paidOutcome = thisMonthPaidExpenses.reduce((acc, t) => acc + t.price, 0);
      const expectedOutcome = thisMonthExpectedExpenses.reduce((acc, t) => acc + t.price, 0);
      const delayedOutcome = delayedExpenses.reduce((acc, t) => acc + t.price, 0);

      setTotalOutcome(paidOutcome);
      setTotalExpectedOutcome(expectedOutcome);
      setDelayedTransactionsOutcome(delayedOutcome);
      setMonthOutcome(paidOutcome + expectedOutcome + delayedOutcome); // <-- זה הפתרון


   }, [transactions, transactionsAsCustomer]);  // useEffect יפעל רק אם transactionsAsProvider משתנה



   //איסוף מידע עבור הגרפים


   //גרף ההכנסות לחודש זה

   useEffect(() => {
      if (chartRef.current) {
         if (chartInstance.current) {
            chartInstance.current.destroy(); // הורס את התרשים הישן לפני יצירת אחד חדש
         }
         const ctx = chartRef.current.getContext("2d");
         chartInstance.current = new Chart(ctx, {
            type: "pie",
            data: {
               // labels: ["הסכום שנכנס", "הסכום שעומד להכנס החודש", "הסכום בפיגור"],
               datasets: [
                  {
                     // label: "סך הכול הכנסות החודש",
                     data: [totalIncome, totalExpectedIncome, delayedTransactionsIncome],
                     backgroundColor: [bgClear, text, bgSoftLight]
                  },
               ],
            },
            options: {
               responsive: true,
               maintainAspectRatio: true, // לשמור על עיגול
               plugins: {
                  legend: {
                     display: true,
                     position: "left",
                  },
                  tooltip: {
                     enabled: true
                  },
                  datalabels: {
                     display: false // מסיר לגמרי את המספרים מהגרף
                  }

               }
            },
         });
      }
   }, [totalIncome, totalExpectedIncome, delayedTransactionsIncome]); // תלות בנתונים

   //גרף ההוצאות לחודש זה

   useEffect(() => {
      if (expenseChartRef.current) {
         if (OutcomeChartInstance.current) {
            OutcomeChartInstance.current.destroy(); // הורס את התרשים הישן לפני יצירת אחד חדש
         }
         const ctx = expenseChartRef.current.getContext("2d");
         OutcomeChartInstance.current = new Chart(ctx, {
            type: "pie",
            data: {
               // labels: ["הסכום שנכנס", "הסכום שעומד להכנס החודש", "הסכום בפיגור"],
               datasets: [
                  {
                     label: "סך הכול הוצאות החודש",
                     data: [totalOutcome, totalExpectedOutcome, delayedTransactionsOutcome],
                     backgroundColor: [bgClear, text, bgSoftLight]
                  },
               ],
            },
            options: {
               responsive: true,
               maintainAspectRatio: true, // לשמור על עיגול
               plugins: {
                  legend: {
                     display: true,
                     position: "left",
                  },
                  tooltip: {
                     enabled: true
                  },
                  datalabels: {
                     display: false // מסיר לגמרי את המספרים מהגרף
                  }

               }
            },
         });
      }
   }, [totalOutcome, totalExpectedOutcome, delayedTransactionsOutcome]); // תלות בנתונים


   //לעדכן סופית!!!!!
   const yearlyMonthIncome = useMemo(() => {
      const months = new Array(12).fill(0);
      const currentMonthIndex = new Date().getMonth();
      months[currentMonthIndex] = monthIncome; // עדכון ההכנסה של החודש הנוכחי
      return months;
   }, [monthIncome]);

   const yearlyMonthOutcome = useMemo(() => {
      const months = new Array(12).fill(0);
      const currentMonthIndex = new Date().getMonth();
      months[currentMonthIndex] = monthOutcome;
      return months;
   }, [monthOutcome]);

   const yearlyMonthCustomers = useMemo(() => {
      const months = new Array(12).fill(0);
      const currentMonthIndex = new Date().getMonth();
      months[currentMonthIndex] = customersCount;
      return months;
   }, [customersCount]);

   const yearlyMonthServicies = useMemo(() => {
      const months = new Array(12).fill(0);
      const currentMonthIndex = new Date().getMonth();
      months[currentMonthIndex] = servicesCount;
      return months;
   }, [servicesCount]);

   const yearlyMonthDelayed = useMemo(() => {
      const months = new Array(12).fill(0);
      const currentMonthIndex = new Date().getMonth();
      months[currentMonthIndex] = delayedTransactionsCount;
      return months;
   }, [delayedTransactionsCount]);




   const data = {
      labels: ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"],
      datasets: [
         {
            label: "הכנסות חודשיות",
            data: yearlyMonthIncome,
            borderColor: text,
            backgroundColor: "rgba(0, 123, 255, 0.5)",
         },
      ],
   };

   const outcomeData = {
      labels: ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"],
      datasets: [
         {
            label: "הוצאות חודשיות",
            data: yearlyMonthOutcome,
            borderColor: text,
            backgroundColor: "rgba(220, 53, 69, 0.5)",
         },
      ],
   };


   const customersData = {
      labels: ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"],
      datasets: [
         {
            label: "לקוחות לחודש",
            data: yearlyMonthCustomers,
            borderColor: text,
            backgroundColor: "rgba(0, 123, 255, 0.5)",
         },
      ],
   };
   const serviciesData = {
      labels: ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"],
      datasets: [
         {
            label: "שירותים לחודש",
            data: yearlyMonthServicies,
            borderColor: text,
            backgroundColor: "rgba(0, 123, 255, 0.5)",
         },
      ],
   };
   const dellayedData = {
      labels: ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"],
      datasets: [
         {
            label: "עסקאות בפיגור לחודש",
            data: yearlyMonthDelayed,
            borderColor: text,
            backgroundColor: "rgba(0, 123, 255, 0.5)",
         },
      ],
   };


   const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
         legend: { display: false }, // הסתרת מקרא
         tooltip: {
            enabled: true, // מאפשר הצגת מידע בנקודות ב-hover
            mode: "nearest",
            intersect: false,
         },
         datalabels: {
            display: false // מסיר לגמרי את המספרים מהגרף
         }
      },
      scales: {
         x: { display: false }, // ביטול ציר X
         y: { display: false }, // ביטול ציר Y
      },
   };


   const chartInstance = useRef(null); // נוסיף משתנה לשמור את התרשים
   const OutcomeChartInstance = useRef(null); // נוסיף משתנה לשמור את תרשים ההוצאות


   //עסקאות
   const filterRecentTransactions = (transactions) => {
      // console.log(`transactions${transactions}`)
      if (transactions == null) {
         return [];
      }
      const today = new Date();
      return [...transactions]
         .filter(transaction =>
            transaction.status !== "canceld"  // רק עסקאות שלא בוטלו
            // new Date(transaction.billingDay) <= today // תאריך גבייה מאוחר מהיום
         )
         // .sort((a, b) => new Date(a.collectionDate) - new Date(b.collectionDate)) // למיין לפי תאריך הגבייה (מוקדם לראשון)
         .slice(0, 5) // חמש הראשונות
   };
   const recentTransactions = filterRecentTransactions(transactionsToDisplay);


   const filterPendingTransactions = (transactionsToDisplay) => {
      if (transactionsToDisplay == null) {
         return [];
      }
      // קבלת תאריך נוכחי
      const today = new Date();

      return [...transactionsToDisplay]
         .filter(transaction =>
            transaction.status === "pendingCharge" && // רק עסקאות שלא נגבו
            new Date(transaction.billingDay) > today // תאריך גבייה מאוחר מהיום
         )
         .sort((a, b) => new Date(a.collectionDate) - new Date(b.collectionDate)) // למיין לפי תאריך הגבייה (מוקדם לראשון)
         .slice(0, 5); // חמש הראשונות
   };


   const pendingTransactions = filterPendingTransactions(transactionsToDisplay);
   // console.log(`pendingTransactions${pendingTransactions}`)


   const today = new Date().toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
   });



   if (isLoading) return <p>Loading...</p>;
   if (error) return <p>Error: {error}</p>;
   if (isLoadingTransactions) return <p>Loading transactions...</p>;
   if (errorLoadingTransactions) return <p>Error: {error}</p>;
   return (
      <>
         <h2>{today} - מה קורה החודש?</h2>
         <div className="dashboard">

            {/* שורה 1 - כרטיסים גדולים */}
            <div className="dashboard-row">
               <div className="dashboard-card-large">
                  <h4>הכנסות חודש {currentMonth}</h4>
                  <div className="income-summary">
                     <p style={{ color: "var(--text)" }}>הסכום שעומד להכנס החודש: {totalExpectedIncome} ₪</p>
                     <p style={{ color: "var(--bgClear)" }}>סכום שנכנס: {totalIncome} ₪</p>
                     <p style={{ color: "var(--bgSoftLight)" }}>הכנסות בפיגור: {delayedTransactionsIncome} ₪</p>
                  </div>
                  <div className="chart-container">
                     <canvas ref={chartRef}></canvas>
                  </div>
               </div>

               <div className="dashboard-card-large">
                  <h4>הוצאות חודש {currentMonth}</h4>
                  <div className="card-content">
                     <div className="income-summary">
                        <p style={{ color: "var(--text)" }}>הסכום שעומד לצאת החודש: {totalExpectedOutcome} ₪</p>
                        <p style={{ color: "var(--bgClear)" }}>סכום שכבר יצא: {totalOutcome} ₪</p>
                        <p style={{ color: "var(--bgSoftLight)" }}>הוצאות בפיגור: {delayedTransactionsOutcome} ₪</p>
                     </div>
                     <div className="chart-container">
                        <canvas ref={expenseChartRef}></canvas>
                     </div>
                  </div>
               </div>
            </div>

            {/* שורה 2 - סיכומי הכנסות והוצאות */}
            <div className="dashboard-row">
               <div className="dashboard-card">
                  <Link to="transactions/income">
                     <h4>סך הכול הכנסות</h4>
                     <h2>{monthIncome} ₪</h2>
                     <div className="chart-container">
                        <Line data={data} options={options} />
                     </div>
                  </Link>
               </div>

               <div className="dashboard-card">
                  <Link to="transactions/income">
                     <h4>סך הכול הוצאות</h4>
                     <h2>{monthOutcome} ₪</h2>
                     <div className="chart-container">
                        <Line data={outcomeData} options={options} />
                     </div>
                  </Link>
               </div>
            </div>

            {/* שורה 3 - כרטיסים נוספים */}
            <div className="dashboard-row">
               <div className="dashboard-card three-cards">
                  <Link to={"services"}>
                     <h4>מה הצענו</h4>
                     <h2>{servicesCount}</h2>
                     <div className="chart-container">
                        <Line data={serviciesData} options={options} />
                     </div>
                  </Link>
               </div>

               <div className="dashboard-card three-cards">
                  <Link to={"customers"}>
                     <h4>מי איתנו</h4>
                     <h2>{customersCount}</h2>
                     <div className="chart-container">
                        <Line data={customersData} options={options} />
                     </div>
                  </Link>
               </div>

               <div className="dashboard-card three-cards">
                  <h4>תשלומים שעדיין מחכים</h4>
                  <h2>{customersCount}</h2>
                  <div className="chart-container">
                     <Line data={dellayedData} options={options} />
                  </div>
               </div>
            </div>
         </div>


         <div className="QuickActions">
            <button type="button" onClick={() => { setTransactionModalOpen(true); console.log({ isTransactionModalOpen }) }}>
               פותחים עסקה חדשה
               {/* <Link to="transactions/income/add">עסקה חדשה +</Link> */}
            </button>
            <button>
               <Link to="transactions/income/all">רוצה לראות הכל?</Link>
            </button>
         </div>

         <div className="transactions-display">

            <div className="transaction-header head">
               <button
                  className={`toggle-button ${selectedOption === 'customer' ? 'active' : ''}`}
                  onClick={() => setSelectedOption('customer')}
               >
                  הוצאות
               </button>
               <h1>עסקאות חודש {currentMonth}</h1>
               <button
                  className={`toggle-button ${selectedOption === 'agent' ? 'active' : ''}`}
                  onClick={() => setSelectedOption('agent')}
               >
                  הכנסות
               </button>
            </div>
            <div>
               <h2>מה עשינו לאחרונה</h2>
               {
                  selectedOption === 'agent' ?
                     <TransactionsList transactions={recentTransactions} />
                     :
                     <ExpensesList transactions={recentTransactions} />
               }
            </div>
            <div>
               <h2>מה עומד לקרות</h2>
               {
                  selectedOption === 'agent' ?
                     <TransactionsList transactions={pendingTransactions} />
                     :
                     <ExpensesList transactions={pendingTransactions} />
               }
            </div>
         </div>

         <Modal isOpen={isTransactionModalOpen} onClose={() => setTransactionModalOpen(false)}>
            <AddTransaction
               onSuccess={() => {
                  setTransactionModalOpen(false);
                  // Handle successful service addition if necessary
               }}
            />
         </Modal>
      </>
   );
};

export default HomeMain;