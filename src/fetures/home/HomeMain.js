import { Link, NavLink } from "react-router-dom"
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "./HomeMain.css"
import React, { useState, useEffect } from 'react'
import { useAddUserMutation } from "../users/UsersApiSlice";
import { useGetUserQuery } from "../users/UsersApiSlice";
import useAuth from "../../hooks/useAuth";
import useTransactionsData from "../../hooks/useTransactionsData";
import { useSelector } from "react-redux";
import TransactionsList from "../transactions/list/TransactionsList";
const HomeMain = () => {
   const { _id, phone } = useAuth()
   const agent = useSelector((state) => state.agent.data.data || {});
   const transactions = useSelector((state) => state.transactions.data.transactions.data || []);
   const isLoading = useSelector((state) => state.agent?.isLoading);
   const error = useSelector((state) => state.agent?.error);
   const isLoadingTransactions = useSelector((state) => state.transactions?.isLoading);
   const errorLoadingTransactions = useSelector((state) => state.transactions?.error);
   console.log(`agent${agent}`);
   const transactionsAsProvider = [...transactions].filter(transaction =>
      transaction.agent === _id
   );
   const transactionsAsCustomer = [...transactions].filter(transaction =>
      transaction.agent !== _id
   );

   //הכנסות בחודש הנוכחי 

   const [monthIncome, setMonthIncome] = useState(0);
   const [monthExpectedIncome, setMonthExpectedIncome] = useState(0);
   const [servicesCount, setServicesCount] = useState(0);
   const [customersCount, setCustomersCount] = useState(0);
   const [totalIncome, setTotalIncome] = useState(0);
   const [totalExpectedIncome, setTotalExpectedIncome] = useState(0);
   const [delayedTransactionsCount, setDelayedTransactionsCount] = useState(0);
   const [delayedTransactionsIncome, setDelayedTransactionsIncome] = useState(0);
   const [currentMonth, setCurrentMonth] = useState('');
   const [selectedOption, setSelectedOption] = useState("agent")

   useEffect(() => {
      const today = new Date();
      const firstDayInThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthName = today.toLocaleString('default', { month: 'long' });
      setCurrentMonth(monthName);

      console.log(`firstDayInThisMonth: ${firstDayInThisMonth}`);
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
      console.log(`thisMonthTransactionsAsProvider${thisMonthTransactionsAsProvider}`);

      // חישוב סך ההכנסות עד כה החודש

      //////חישוב הכנסות עתידיות לחודש זה
      const thisMonthExpectedTransactionsAsProvider = transactionsAsProvider
         .filter(transaction => {
            const billingDate = new Date(transaction.billingDay);
            return transaction.status === "pendingCharge" &&
               billingDate.getMonth() === firstDayInThisMonth.getMonth() &&
               billingDate >= today;
         });
      console.log(`thisMonthExpectedTransactionsAsProvider${thisMonthExpectedTransactionsAsProvider}`);


      const filterDelayedTransactions = (transactionsAsProvider) => {
         const today = new Date();
         const requireDateAgo = new Date();

         requireDateAgo.setMonth(today.getMonth() - 1);
         return [...transactionsAsProvider]
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
      setTotalIncome(thisMonthTransactionsAsProvider.reduce((acc, transaction) => {
         return acc + transaction.price;
      }, 0));
      setMonthIncome(totalIncome);

      //  חישוב סך ההכנסות עתידיות החודש
      setTotalExpectedIncome(thisMonthExpectedTransactionsAsProvider.reduce((acc, transaction) => {
         return acc + transaction.price;
      }, 0));
      setMonthExpectedIncome(totalExpectedIncome);
      console.log(`monthExpectedIncome: ${totalExpectedIncome}`);

      //עדכון מספר הלקוחות והשירותים לחודש זה
      setServicesCount(thisMonthTransactions.length);
      setCustomersCount(new Set(thisMonthTransactions.map((t) => t.customerId)).size);
      setDelayedTransactionsIncome(delayedTransactions.filter(t => t.status === "notPaid").reduce((acc, transaction) => acc + transaction.price, 0));

   }, [transactionsAsProvider]);  // useEffect יפעל רק אם transactionsAsProvider משתנה


   //עסקאות
   const filterRecentTransactions = (transactionsAsProvider) => {
      const today = new Date();
      return [...transactionsAsProvider]
         .filter(transaction =>
            transaction.status !== "canceld"  // רק עסקאות שלא בוטלו
            // new Date(transaction.billingDay) <= today // תאריך גבייה מאוחר מהיום
         )
         // .sort((a, b) => new Date(a.collectionDate) - new Date(b.collectionDate)) // למיין לפי תאריך הגבייה (מוקדם לראשון)
         .slice(0, 5) // חמש הראשונות
         .map(transaction => ({
            ...transaction, // שומר את שאר המידע של העסקה
            agent: undefined, // מחיקת שדה agent
         }));
   };
   const recentTransactions = filterRecentTransactions(transactionsAsProvider);

   const filterPendingTransactions = (transactionsAsProvider) => {
      // קבלת תאריך נוכחי
      const today = new Date();

      return [...transactionsAsProvider]
         .filter(transaction =>
            transaction.status === "pendingCharge" && // רק עסקאות שלא נגבו
            new Date(transaction.billingDay) > today // תאריך גבייה מאוחר מהיום
         )
         .sort((a, b) => new Date(a.collectionDate) - new Date(b.collectionDate)) // למיין לפי תאריך הגבייה (מוקדם לראשון)
         .slice(0, 5); // חמש הראשונות
   };


   const pendingTransactions = filterPendingTransactions(transactionsAsProvider);

   //איסוף מידע עבור הגרפים
   //לעדכן סופית!!!!!
   const yearlyMonthIncome = [1200, 1800, 2400, 3000, 3500, 4000, 4200, 4800, 5000, 5200, 5800, monthIncome]
   const yearlyMonthCustomers = [1, 2, 3, 4, 6, 8, 3, 8, 9, 3, 5, customersCount]
   const yearlyMonthServicies = [1, 2, 3, 4, 6, 8, 3, 8, 9, 3, 5, servicesCount]
   const yearlyMonthDelayed = [1, 2, 3, 4, 6, 8, 3, 8, 9, 3, 5,delayedTransactionsCount]

   const data = {
      labels: ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"],
      datasets: [
         {
            label: "הכנסות חודשיות",
            data: yearlyMonthIncome,
            borderColor: "#007bff",
            backgroundColor: "rgba(0, 123, 255, 0.5)",
         },
      ],
   };

   const customersData = {
      labels: ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"],
      datasets: [
         {
            label: "לקוחות לחודש",
            data: yearlyMonthCustomers,
            borderColor: "#007bff",
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
            borderColor: "#007bff",
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
            borderColor: "#007bff",
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
      },
      scales: {
         x: { display: false }, // ביטול ציר X
         y: { display: false }, // ביטול ציר Y
      },
   };

   //גרף ההכנסות לחודש זה
   const incomeData = {
      labels: ["עד היום", "צפוי החודש", "עסקאות שלא שולמו"],
      datasets: [
         {
            label: "סך הכול הכנסות החודש",
            data: [totalIncome, totalIncome + totalExpectedIncome, totalIncome + totalExpectedIncome + delayedTransactionsIncome],
            borderColor: ["#007bff", "#28a745", "#dc3545"],
            backgroundColor: "transparent",
            segment: {
               borderColor: (ctx) => {
                  const index = ctx.p1DataIndex; // מזהה את החלק בקו
                  return index === 0 ? "#007bff" : index === 1 ? "#28a745" : "#dc3545";
               },
            },
            borderWidth: 3,
            tension: 0.4, // עקומה עדינה יותר
            pointRadius: 5,
            pointBackgroundColor: ["#007bff", "#28a745", "#dc3545"],
         },
      ],
   };

   const optionsBigGraph = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
         legend: { display: false },
         tooltip: { enabled: true, mode: "nearest", intersect: false },
      },
      scales: {
         x: { display: false },
         y: { display: false },
      },
   };



   if (isLoading) return <p>Loading...</p>;
   if (error) return <p>Error: {error}</p>;
   if (isLoadingTransactions) return <p>Loading transactions...</p>;
   if (errorLoadingTransactions) return <p>Error: {error}</p>;
   return (
      <>
         <h2>לוח בקרה חודש {currentMonth}</h2>
         <div className="dashboard">
            <div className="dashboard-card-large">
               <h4>סיכום הכנסות חודש {currentMonth}</h4>
               <div className="chart-container">
                  <Line data={incomeData} options={options} />
               </div>
               <div className="income-summary">
                  <p style={{ color: "#007bff" }}>הכנסות עד היום: {totalIncome} ₪</p>
                  <p style={{ color: "#28a745" }}>הכנסות צפויות: {totalExpectedIncome} ₪</p>
                  <p style={{ color: "#dc3545" }}>תשלומים שלא נגבו: {delayedTransactionsIncome} ₪</p>
               </div>
            </div>
            <div className="dashboardBox">
               <div className="dashboard-card">
                  <h4>הכנסות</h4>
                  <h2>{monthIncome} ₪</h2>
                  <div className="chart-container">
                     <Line data={data} options={options} />
                  </div>
               </div>
               <div className="dashboard-card">
                  <h4>שירותים</h4>
                  <h2>{servicesCount}</h2>
                  <div className="chart-container">
                     <Line data={serviciesData} options={options} />
                  </div>
               </div>
               <div className="dashboard-card">
                  <h4>לקוחות</h4>
                  <h2>{customersCount}</h2>
                  <div className="chart-container">
                     <Line data={customersData} options={options} />
                  </div>
               </div>
               <div className="dashboard-card">
                  <h4>עסקאות שלא נגבו</h4>
                  <h2>{customersCount}</h2>
                  <div className="chart-container">
                     <Line data={dellayedData} options={options} />
                  </div>
               </div>
            </div>
         </div>

         <div className="QuickActions">
            <button>
               <Link to="transactions/income/add">עסקה חדשה +</Link>
            </button>
            <button>
               <Link to="transactions/income">לכל העסקאות ></Link>
            </button>
         </div>

         <div className="transactions-display">
            <div>
               <div className="transaction-header head">
                  <button
                     className={`toggle-button ${selectedOption === 'customer' ? 'active' : ''}`}
                     onClick={() => setSelectedOption('customer')}
                  >
                     לקוח
                  </button>
                  <h1>עסקאות חודש {currentMonth}</h1>
                  <button
                     className={`toggle-button ${selectedOption === 'agent' ? 'active' : ''}`}
                     onClick={() => setSelectedOption('agent')}
                  >
                     סוכן
                  </button>
               </div>

               <h2>עסקאות אחרונות</h2>
               <TransactionsList transactions={recentTransactions} />
            </div>
            <div>
               <h2>עסקאות קרובות</h2>
               <TransactionsList transactions={pendingTransactions} />
            </div>
         </div>


      </>


   );
};

export default HomeMain;