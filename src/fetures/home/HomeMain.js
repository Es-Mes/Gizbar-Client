import { Link } from "react-router-dom"
import "chart.js/auto";
import Chart from "chart.js/auto";
import ChartDataLabels from 'chartjs-plugin-datalabels';

import "./HomeMain.css"
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import TransactionsList from "../transactions/list/TransactionsList";
import { useMemo } from "react";
import AddTransaction from "../transactions/add/AddTransaction";
import Modal from "../../modals/Modal";
import { useGetAgentQuery } from "../agent/apiSlice";
import { useGetAllTransactionsAsCustomerQuery, useGetAllTransactionsQuery } from "../transactions/TransactionsApiSlice";

const HomeMain = () => {
   const { phone } = useAuth()
   const { data: agent, isLoading, error } = useGetAgentQuery({ phone });
   console.log(error);

   console.log(agent);

   // const { data: transactions = [], isLoading: isLoadingTransactions, error: errorLoadingTransactions, refetch: refetchTransactions } = useGetAllTransactionsQuery({ phone }, {
   //    pollingInterval: 30000, // בדיקה כל 30 שניות לעסקאות חדשות
   // });
   const { data: transactions = [], isLoading: isLoadingTransactions, error: errorLoadingTransactions, refetch: refetchTransactions } = useGetAllTransactionsQuery({ phone });
   console.log(errorLoadingTransactions);

   const { data: transactionsAsCustomer = [] } = useGetAllTransactionsAsCustomerQuery({ phone });
   console.log(transactionsAsCustomer);

   console.log(transactions, errorLoadingTransactions);

   const navigate = useNavigate();
   const chartRef = useRef(null);
   const expenseChartRef = useRef(null);
   const chartInstance = useRef(null);
   const outcomeChartInstance = useRef(null);

   Chart.register(ChartDataLabels);

   //משתנים לייבוא הצבעים לגרפים
   const [cssColors, setCssColors] = useState({
      bgClear: '',
      bgSoftLight: '',
      text: ''
   });

   // useEffect לטעינת הצבעים מ-CSS
   useEffect(() => {
      const cssVars = getComputedStyle(document.documentElement);
      setCssColors({
         bgClear: cssVars.getPropertyValue('--bgSoftLight2').trim(),
         bgSoftLight: cssVars.getPropertyValue('--bgSoftLight').trim(),
         text: cssVars.getPropertyValue('--bgSoftLight3').trim()
      });
   }, []);

   //הכנסות בחודש הנוכחי 
   const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
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


   }, [transactions, transactionsAsCustomer, transactionsAsProvider]);  // useEffect יפעל רק אם transactionsAsProvider משתנה



   //איסוף מידע עבור הגרפים


   //גרף ההכנסות לחודש זה
   useEffect(() => {
      // בדיקה שכל הנתונים מוכנים והרכיב mounted וגם הצבעים נטענו
      if (!chartRef.current ||
         totalIncome === undefined ||
         totalExpectedIncome === undefined ||
         delayedTransactionsIncome === undefined ||
         !cssColors.bgClear) {
         return;
      }

      // אם כל הנתונים הם 0, לא ניצור גרף
      const hasData = totalIncome > 0 || totalExpectedIncome > 0 || delayedTransactionsIncome > 0;
      if (!hasData) {
         // אם יש גרף קיים, נהרוס אותו
         if (chartInstance.current) {
            chartInstance.current.destroy();
            chartInstance.current = null;
         }
         return;
      }

      // הרס גרף קיים אם יש
      if (chartInstance.current) {
         chartInstance.current.destroy();
         chartInstance.current = null;
      }

      // יצירת גרף חדש
      try {
         const ctx = chartRef.current.getContext("2d");
         chartInstance.current = new Chart(ctx, {
            type: "pie",
            data: {
               labels: ["הכנסות קיימות", "הכנסות שעומדות להכנס", "הכנסות בפיגור"],
               datasets: [
                  {
                     data: [totalIncome, totalExpectedIncome, delayedTransactionsIncome],
                     backgroundColor: [cssColors.bgClear, cssColors.text, cssColors.bgSoftLight]
                  },
               ],
            },
            options: {
               responsive: true,
               maintainAspectRatio: true,
               plugins: {
                  legend: {
                     display: false,
                     position: "left",
                  },
                  tooltip: {
                     enabled: true
                  },
                  datalabels: {
                     display: false
                  }
               }
            },
         });
         console.log("Income chart created successfully");
      } catch (error) {
         console.error("Error creating income chart:", error);
      }

      // cleanup function
      return () => {
         if (chartInstance.current) {
            chartInstance.current.destroy();
            chartInstance.current = null;
         }
      };
   }, [totalIncome, totalExpectedIncome, delayedTransactionsIncome, cssColors]);

   //גרף ההוצאות לחודש זה
   useEffect(() => {
      // בדיקה שכל הנתונים מוכנים והרכיב mounted וגם הצבעים נטענו
      if (!expenseChartRef.current ||
         totalOutcome === undefined ||
         totalExpectedOutcome === undefined ||
         delayedTransactionsOutcome === undefined ||
         !cssColors.bgClear) {
         return;
      }

      // אם כל הנתונים הם 0, לא ניצור גרף
      const hasData = totalOutcome > 0 || totalExpectedOutcome > 0 || delayedTransactionsOutcome > 0;
      if (!hasData) {
         // אם יש גרף קיים, נהרוס אותו
         if (outcomeChartInstance.current) {
            outcomeChartInstance.current.destroy();
            outcomeChartInstance.current = null;
         }
         return;
      }

      // הרס גרף קיים אם יש
      if (outcomeChartInstance.current) {
         outcomeChartInstance.current.destroy();
         outcomeChartInstance.current = null;
      }

      // יצירת גרף חדש
      try {
         const ctx = expenseChartRef.current.getContext("2d");
         outcomeChartInstance.current = new Chart(ctx, {
            type: "pie",
            data: {
               labels: ["חיובים שיצאו", "חיובים שעומדים לצאת", "חיובים בפיגור"],
               datasets: [
                  {
                     data: [totalOutcome, totalExpectedOutcome, delayedTransactionsOutcome],
                     backgroundColor: [cssColors.bgClear, cssColors.text, cssColors.bgSoftLight]
                  },
               ],
            },
            options: {
               responsive: true,
               maintainAspectRatio: true,
               plugins: {
                  legend: {
                     display: false,
                     position: "left",
                  },
                  tooltip: {
                     enabled: true,
                  },
                  datalabels: {
                     display: false
                  }
               }
            },
         });
         console.log("Expense chart created successfully");
      } catch (error) {
         console.error("Error creating expense chart:", error);
      }

      // cleanup function
      return () => {
         if (outcomeChartInstance.current) {
            outcomeChartInstance.current.destroy();
            outcomeChartInstance.current = null;
         }
      };
   }, [totalOutcome, totalExpectedOutcome, delayedTransactionsOutcome, cssColors]);

   // ניקוי גרפים בעת unmount
   useEffect(() => {
      return () => {
         if (chartInstance.current) {
            chartInstance.current.destroy();
            chartInstance.current = null;
         }
         if (outcomeChartInstance.current) {
            outcomeChartInstance.current.destroy();
            outcomeChartInstance.current = null;
         }
      };
   }, []);





   //עסקאות
   const filterRecentTransactions = (transactions) => {
      if (!transactions) return [];
      const today = new Date();

      return [...transactions].filter(transaction => {
         // אל תציג עסקאות שבוטלו
         if (transaction.status === "canceld") return false;

         // הכנסות (ספק) - הצג עסקאות עתידיות, שטרם נגבו, או בפיגור
         if (selectedOption === "agent") {
            return (
               (transaction.status === "pendingCharge" && new Date(transaction.billingDay) > today) ||
               (transaction.status === "notPaid" && new Date(transaction.billingDay) < today) ||
               (transaction.status === "paid" && new Date(transaction.paymentDate).getMonth() === today.getMonth())
            );
         }
         // הוצאות (כלקוח) - הצג עסקאות עתידיות, שטרם נגבו, או בפיגור
         if (selectedOption === "customer") {
            return (
               (transaction.status === "pendingCharge" && new Date(transaction.billingDay) > today) ||
               (transaction.status === "notPaid" && new Date(transaction.billingDay) < today) ||
               (transaction.status === "paid" && new Date(transaction.paymentDate).getMonth() === today.getMonth())
            );
         }

         return false;
      });
   };
   const recentTransactions = filterRecentTransactions(transactionsToDisplay);


   // Commented out unused functions and variables
   // const filterPendingTransactions = (transactionsToDisplay) => {
   //    if (transactionsToDisplay === null) {
   //       return [];
   //    }
   //    const today = new Date();
   //    return [...transactionsToDisplay]
   //       .filter(transaction =>
   //          transaction.status === "pendingCharge" &&
   //          new Date(transaction.billingDay) > today
   //       )
   //       .sort((a, b) => new Date(a.collectionDate) - new Date(b.collectionDate))
   //       .slice(0, 5);
   // };
   // const pendingTransactions = filterPendingTransactions(transactionsToDisplay);
   // const today = new Date().toLocaleDateString('he-IL', {
   //    day: 'numeric',
   //    month: 'long',
   //    year: 'numeric',
   // });

   ///פונקציות לניווט לעסקאות
   const handleClickAllIncome = () => {
      navigate("transactions/income"); // כאן את שמה את הנתיב הרצוי
   };
   const handleClickDelayedIncome = () => {
      navigate("transactions/income/providerList?filter=delayed"); // כאן את שמה את הנתיב הרצוי
   };

   ///פונקציות לניווט להוצאות
   const handleClickAllOutcome = () => {
      navigate("transactions/expense"); // כאן את שמה את הנתיב הרצוי
   };
   const handleClickDelayedExpenses = () => {
      navigate("transactions/expense/customerList?filter=delayed"); // כאן את שמה את הנתיב הרצוי
   };


   if (isLoading) return <p>טוען...</p>;
   if (error) return <p>Error: {error?.data?.message}</p>;
   if (isLoadingTransactions) return <p>טוען עסקאות...</p>;
   if (errorLoadingTransactions) return <p>שגיאה: {errorLoadingTransactions?.data?.message}</p>;
   return (
      <>
         {/* <h2>{today} - מה קורה החודש?</h2> */}
         <div className="dashboard">

            {/* שורה 1 - כרטיסים גדולים */}
            <div className="dashboard-row">
               {monthIncome > 0 &&
                  <div className="dashboard-card-large" onClick={handleClickAllIncome} style={{ cursor: "pointer" }}>
                     <div>
                        <h4>סך הכול הכנסות לחודש {currentMonth}</h4>
                        <h2>{monthIncome} ₪</h2>
                        <h4>מתוכן שולמו</h4>
                        <h2>{totalIncome} ₪</h2>
                     </div>
                     <div className="chart-container">
                        <canvas onClick={(e) => e.stopPropagation()} ref={chartRef}></canvas>
                     </div>
                  </div>}

               {monthIncome <= 0 &&
                  <div className="dashboard-card-large" onClick={handleClickAllIncome}>
                     <h4>עוד לא היו הכנסות לבינתיים :)</h4>
                  </div>}

               {monthOutcome > 0 && <div className="dashboard-card-large" onClick={handleClickAllOutcome} style={{ cursor: "pointer" }}>
                  <div>
                     <h4>סך הכול הוצאות לחודש {currentMonth}</h4>
                     <h2>{monthOutcome} ₪</h2>
                     <h4>מתוכן שילמת</h4>
                     <h2>{totalOutcome} ₪</h2>
                  </div>
                  <div className="chart-container">
                     <canvas onClick={(e) => e.stopPropagation()} ref={expenseChartRef}></canvas>
                  </div>
               </div>}

               {monthOutcome <= 0 &&
                  <div className="dashboard-card-large" onClick={handleClickAllOutcome}>
                     <h4>עדיין אין עסקאות יוצאות</h4>
                  </div>}
            </div>

            <div className="dashboard-row ">
               <div className="income-outcome-summary">

                  <div className="dashboard-card color2" onClick={handleClickDelayedIncome} style={{ cursor: "pointer" }}>
                     <div style={{ color: "var(--text)", fontWeight: "bold", fontSize: "18px" }}>עסקאות בפיגור:<br /><div style={{ padding: "5px" }}>{delayedTransactionsIncome} ₪</div></div>
                  </div>
               </div>
               <div className="income-outcome-summary">

                  <div className="dashboard-card color2" onClick={handleClickDelayedExpenses} style={{ cursor: "pointer" }}>
                     <div style={{ color: "var(--text)", fontWeight: "bold", fontSize: "18px" }}>חיובים בפיגור:<br /> <div style={{ padding: "5px" }}>{delayedTransactionsOutcome} ₪</div></div>
                  </div>
               </div>
            </div>
            {/* שורה 2 - סיכומי הכנסות והוצאות */}
            {/* <div className="dashboard-row">
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
            </div> */}

            {/* שורה 3 - כרטיסים נוספים */}
            {/* <div className="dashboard-row">
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
            </div> */}
         </div>

         <h1 className="actionsHedder">פעולות מהירות</h1>
         <div className="QuickActions">
            <button type="button" onClick={() => { setIsTransactionModalOpen(true); console.log({ isTransactionModalOpen }) }}>
               הוסף עסקה חדשה לגביה
            </button>
            <Link to="../dash/UnderConstruction" className="nav-button inDevelopment" onClick={(e) => e.preventDefault()}>
               חובות תשלום
            </Link>

            <Link to="../dash/UnderConstruction" className="nav-button inDevelopment"
               onClick={(e) => e.preventDefault()}>
               שליחת תזכורות והודעות
            </Link>

            <Link to="../dash/CreditPay" className="nav-button "
            >
               סליקת אשראי לגביה מיידית
            </Link>

            {/* <Link to="../dash/UnderConstruction" className="nav-button">
               הוראת קבע
            </Link> */}

         </div>

         <div className="transactions-display">

            <div className="transaction-header head QuickActions">
               <button
                  className={` toggle-button ${selectedOption === 'agent' ? 'active' : ''}`}
                  onClick={() => setSelectedOption('agent')}
               >
                  הכנסות
               </button>
               <h2>עסקאות פעילות</h2>
               <button
                  className={` toggle-button ${selectedOption === 'customer' ? 'active' : ''}`}
                  onClick={() => setSelectedOption('customer')}
               >
                  הוצאות
               </button>
            </div>

            <div>
               <TransactionsList transactions={recentTransactions} />
            </div>
            {/* 
            <div>
               <h2 style={{color:'var(--text)',marginTop:'40px'}}>תשלומים שעדיין מחכים</h2>
               <TransactionsList transactions={pendingTransactions} />
            </div> */}
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
      </>
   );
};

export default HomeMain;